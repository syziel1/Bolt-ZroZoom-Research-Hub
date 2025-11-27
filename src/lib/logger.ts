/**
 * Logger utility to ensure logs are only displayed in development mode.
 * This prevents sensitive information or debugging noise from appearing in production consoles.
 */
export const logger = {
    log: (...args: unknown[]) => {
        if (import.meta.env.DEV) {
            console.log(...args);
        }
    },
    warn: (...args: unknown[]) => {
        if (import.meta.env.DEV) {
            console.warn(...args);
        }
    },
    error: (...args: unknown[]) => {
        // Errors are usually important enough to show in production too, 
        // but we can restrict them if needed. For now, let's keep them visible
        // or restrict them based on preference. 
        // User asked for "console logs", usually implying debug info.
        // Let's keep errors visible as they are critical for debugging production issues,
        // unless explicitly asked to hide them.
        console.error(...args);
    },
    info: (...args: unknown[]) => {
        if (import.meta.env.DEV) {
            console.info(...args);
        }
    }
};
