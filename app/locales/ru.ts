import type { Translations } from "./lang.js";

export const ru: Translations = {
  start: (ctx) => {
    return `
👋 Здравствуйте, ${ctx?.from ? ctx.from.first_name : "пользователь"}!
      
Это бот для мониторинга ваших серверов. \n
      `;
  },
  help: (ctx) => {
    return `Помощь`;
  },
  requestCreate: (ctx) => {
    return `
🙋‍ Здравствуйте, ${ctx.from?.first_name}!
Ваша заявка на создание аккаунта была отправлена.
Ожидайте, пожалуйста, ответ от владельца бота.
    `;
  },
  alreadyRequested: (ctx) => {
    return `
Вы уже отправляли заявку на создание аккаунта.
Ожидайте, пожалуйста, ответ от владельца бота.
    `;
  },
  choosedLang: (ctx, lang) => `Вы выбрали ${lang}.`,
  approved: (ctx) => {
    return `
Ваш аккаунт был успешно создан. Используйте команду /start чтобы продолжить.
    `;
  },
  blocked: (ctx) => {
    return `
Вы заблокированы. 
Если вы считаете, что это ошибка, пожалуйста, напишите владельцу бота.
    `;
  },
};

export default ru