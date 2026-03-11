import type { Translations } from "./lang.js";

export const en: Translations = {
  start: () => "Hello! I'm RustWatch bot. I can help you to track your Rust projects.",
  help: () => "Help",
  requestCreate: () => "You tried to create a new account. But owner must approve your request. Bot will send you a message when owner will approve your request.",
  alreadyRequested: () => "You already requested to create an account. Wait until owner will approve your request.",
  choosedLang: (ctx, lang) => `You choose ${lang}.`,
  approved: () => "Your account has been created.",
  blocked: () => "You are blocked.",
};

export default en