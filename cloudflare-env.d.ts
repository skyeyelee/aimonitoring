declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    APP_ENCRYPTION_KEY?: string;
    SCHEDULER_STATUS?: string;
    AUTH_MODE?: string;
    LOCAL_AUTH_ENABLED?: string;
    AUTO_MONITORING?: string;
    DASHBOARD_ADMIN_EMAIL?: string;
    DASHBOARD_PASSWORD_HASH?: string;
  }
}
