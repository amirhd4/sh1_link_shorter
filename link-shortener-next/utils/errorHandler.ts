import i18n from "../i18n";

export function getErrorMessage(error: any): string {
  // اگر درخواست اصلاً پاسخی نداشته باشه (قطع شبکه یا CORS)
  if (!error?.response) return i18n.t("errors.network");

  const status = error.response.status;
  const detail = error.response.data?.detail || "";

  // پیام‌های خاص اپلیکیشن
  if (status === 403) {
    if (detail.includes("phone number not verified")) {
      return i18n.t("errors.login.phoneNotVerified");
    }
    if (detail.includes("deactivated")) {
      return i18n.t("errors.login.deactivated");
    }
  }

  if (status === 401) {
    return i18n.t("errors.login.invalidCredentials"); // نام کاربری یا رمز اشتباه
  }

  switch (status) {
    case 400: return i18n.t("errors.invalidData");
    case 403: return i18n.t("errors.forbidden");
    case 404: return i18n.t("errors.notFound");
    case 422: return i18n.t("errors.invalidDataFormat");
    case 429: return i18n.t("errors.tooManyAttempts");
    default:
      return status >= 500
        ? i18n.t("errors.serverError")
        : i18n.t("errors.default");
  }
}
