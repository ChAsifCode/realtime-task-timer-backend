import dotenv from "dotenv";

dotenv.config({ path: ".env" });

export default {
    PORT: process.env.PORT,
    DATABASE: {
        URL: process.env.MONGODB_URL,
    },
    JWT: {
        SECRET: process.env.JWT_SECRET,
        APP_VERSION_SECRET: process.env.JWT_SECRET_APP_VERSION,
        TOKEN_EXPIRY: "7d",
        VERIFY_EMAIL_TOKEN_EXPIRY: "15m",
    },
    EMAIL: {
        NAME: process.env.SMTP_APP,
        HOST: process.env.SMTP_HOST,
        PORT: process.env.SMTP_PORT,
        USER: process.env.SMTP_USER,
        PASS: process.env.SMTP_PASS,
        FROM: process.env.SMTP_FROM,
    },
};
