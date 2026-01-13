const isDevelopment = import.meta.env.DEV;

export const CONFIG = {
  API_URL: import.meta.env.VITE_API_URL || (isDevelopment
    ? "http://localhost:3000/api"
    : "https://rex-api-two.vercel.app/api"),
  APP_NAME: "reXa • Reward Exchange",
  TOKEN_KEY: "rex_token",
};
