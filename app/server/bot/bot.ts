import { Bot, session, type Context } from "grammy";
import { RedisAdapter } from "@grammyjs/storage-redis";
import pino from "pino";
import Redis from "ioredis";
import "dotenv/config";

import { logger } from "../src/logger.js";
import { t, type Lang, availableLangs } from "../../locales/translations.js"
import db, { type User } from "../src/database/database.js";

if (!process.env.BOT_TOKEN) {
    throw new Error("BOT_TOKEN is not defined. Please set it in the .env file. (Get it from https://t.me/BotFather)");
} else if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is not defined. Please set it in the .env file.");
} else if (!process.env.OWNER_ID) {
    throw new Error("OWNER_ID is not defined. Please set it in the .env file. (You can get it from https://t.me/userinfobot)");
}

interface SessionData {
    lang: Lang | null;
    user: User | null;
    requestCreateUser: boolean | null;
}

export type MyContext = Context & {
    session: SessionData;
};

export type BotType = Bot<MyContext>;

export const bot = new Bot<MyContext>(process.env.BOT_TOKEN);

const redis = new Redis.default(process.env.REDIS_URL);

bot.use(session({
    storage: new RedisAdapter({ instance: redis }),
    initial: (): SessionData => ({
        lang: null,
        user: null,
        requestCreateUser: null
    })
}));

bot.use(async (ctx, next) => {
    // log request
    const { from: user, session: { user: sessionUser } } = ctx;

    if (user) {
        logger.info({
            message: "Request",
            user: {
                tg_id: user.id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                languageCode: user.language_code,
                sessionUser
            },
        });
    }
    
    await next();
})

bot.use(async (ctx, next) => {
    // set language
    const lang = ctx.from?.language_code?.slice(0, 2) as Lang | undefined;
    if (lang && availableLangs.includes(lang) && !ctx.session.lang) {
        ctx.session.lang = lang;
    }

    if (ctx.from?.id && !ctx.from.is_bot) {
        const user = await db.getUser(ctx.from.id, ctx.from.username?.replace("@", "") as string);

        if (ctx.session.requestCreateUser && !user && process.env.REQUEST_CREATE === "true" 
            || ctx.session.requestCreateUser && user === "request create") {
            ctx.react("🤬");
            ctx.reply(t(ctx.session.lang, "alreadyRequested"));
            return;
        } else if (ctx.session.requestCreateUser && user) {
            ctx.session.requestCreateUser = false;
        }

        if (user === "request create") {
            if (!process.env.REQUEST_CREATE || !process.env.OWNER_ID) {
                return;
            }
            const message = await bot.api.sendMessage(Number(process.env.OWNER_ID), `
User ${ctx.from.id} (@${ctx.from.username}) wants to create an account. \n
ID: ${ctx.from.id}. \n
Username: @${ctx.from.username}. \n
First name: ${ctx.from.first_name}. \n
            `, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "Approve", callback_data: `approve ${ctx.from.id} ${ctx.from.username}` },
                            { text: "Cancel", callback_data: `cancel ${ctx.from.id} ${ctx.from.username}` },
                        ],
                    ],
                },
            });

            ctx.reply(t(ctx.session.lang, "requestCreate", ctx));

            ctx.session.requestCreateUser = true

            return;
        }

        ctx.session.user = user as User;
    }

    await next();
});

// approve request
bot.callbackQuery(/approve (.+)/, async (ctx, next) => {
    if (!process.env.OWNER_ID) {
        return await next();
    }

    const userId = parseInt(ctx.match[1] as string);
    const username = ctx.match[2] as string;

    ctx.editMessageText(`User ${userId}(@${username}) approved ✅`);
    ctx.answerCallbackQuery({ text: "Approved ✅", show_alert: true });

    db.createUser(userId, username).then(() => {
        bot.api.sendMessage(userId, t(ctx.session.lang, "approved", ctx));
    });
});

// cancel request
bot.callbackQuery(/cancel (.+)/, async (ctx, next) => {
    if (!process.env.OWNER_ID) {
        return await next();
    }
    const userId = parseInt(ctx.match[1] as string);
    ctx.editMessageText(`User ${userId} canceled ❌`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Approve", callback_data: `approve ${ctx.match[1]} ${ctx.match[2]}`}],
            ]
        }
    });
    ctx.answerCallbackQuery({ text: "Canceled", show_alert: true });

    bot.api.sendMessage(userId, t(ctx.session.lang, "canceled", ctx));
});

// language
bot.command("lang", (ctx) => {
    ctx.reply("Choose language:", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🇷🇺", callback_data: "lang_ru" }],
                [{ text: "🇬🇧", callback_data: "lang_en" }],
            ],
        },
    });
});

bot.callbackQuery(/lang_(ru|en)/, (ctx) => {
    ctx.session.lang = ctx.match[1] as Lang;
    ctx.deleteMessage();
    ctx.reply(t(ctx.session.lang, "choosedLang", ctx, ctx.session.lang));
});

// if blocked
bot.use(async (ctx, next) => {
    if (ctx.session.user?.blocked === true) {
        return ctx.reply(t(ctx.session.lang, "blocked", ctx));
    }

    return next();
});

bot.command("start", (ctx) => {
    ctx.reply(t(ctx.session.lang, "start", ctx));
});

bot.command("list", async (ctx, next) => {
    if (!process.env.OWNER_ID) {
        return await next();
    }
    db.getUsers(5).then((users) => {
        ctx.reply(`
Users: ${users.rows.length}

${users.rows.map((user) => `
ID: ${user.id}
    Username: @${user.username}
    Telegram ID: ${user.tg_id}
    Created at: ${user.created_at.toISOString()}
    Blocked: ${user.blocked}
    `).join("")}
    `);
    });
});

bot.command("user", async (ctx, next) => {
    if (!process.env.OWNER_ID) {
        return await next();
    }
    const userId = parseInt(ctx.message?.text.split(" ")[1] as string);

    db.getUserById(userId, "").then((user) => {
        if (!user) {
            return ctx.reply("User not found");
        }
        ctx.reply(`
ID: ${user.id}
    Username: @${user.username}
    Telegram ID: ${user.tg_id}
    Created at: ${user.created_at.toISOString()}
    Blocked: ${user.blocked}
    `);
    })    
})

export const startBot = async (): Promise<BotType> => {
    await bot.init();
    if (process.env.WEBHOOK_URL) {
        const webHookUrl = new URL(process.env.WEBHOOK_URL.replace(/\/$/, '') + "/webhook");
        const webhookInfo = await bot.api.getWebhookInfo();
        if (webHookUrl && webhookInfo.url !== webHookUrl.href) {
            await bot.api.setWebhook(webHookUrl.href);
        }
    } else {
        await bot.api.deleteWebhook();

        bot.start();

        process.once("SIGINT", () => bot.stop());
        process.once("SIGTERM", () => bot.stop());
    }

    printBotInfo();

    return bot
};

async function printBotInfo (): Promise<void> {
    if (process.env.WEBHOOK_URL) {
        const newWebhookInfo = await bot.api.getWebhookInfo();
        console.log("Webhook url:" + newWebhookInfo.url);
    }

    redis.on("error", (error) => {
        console.error("Redis error:", error);
    });

    console.log("Bot started ✅");
    console.log("ℹ️ Link to bot: https://t.me/" + bot.botInfo.username);

    if (process.env.REQUEST_CREATE !== "true" && process.env.REQUEST_CREATE !== "pass") {
        console.warn("\u001B[33mWARNING: REQUEST_CREATE is not true. All users can create an account without owner approval. Recommend to set it to true in the .env file (or set it to pass in the .env file to disable this warning)\u001B[0m");
    }

    return;
}

export default bot