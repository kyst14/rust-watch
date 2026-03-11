import type { MyContext } from "../server/bot/bot.js";
export type TranslationValue = ((ctx: MyContext, ...args: any[]) => string);

export interface Translations {
  start: TranslationValue,
  help: TranslationValue,
  requestCreate: TranslationValue,
  alreadyRequested: TranslationValue,
  choosedLang: TranslationValue,
  approved: TranslationValue,
  blocked: TranslationValue,
  // block: TranslationValue,
  // welcomeUser: TranslationValue,
  // choosedLang: TranslationValue,
  // unknownCommand: TranslationValue,
  // unknownMessage: TranslationValue,
  // unknownCallback: TranslationValue,

  [key: string]: TranslationValue;
}
