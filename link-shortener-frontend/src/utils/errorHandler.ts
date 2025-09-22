import i18n from "../i18n";

export function getErrorMessage(error: any): string {
  const status = error?.response?.status;

  switch (status) {
    case 400:
      return i18n.t("errors.invalidData"); // کد اشتباه یا منقضی شده
    case 401:
      return i18n.t("errors.unauthorized"); // نیاز به ورود / دسترسی غیرمجاز
    case 404:
      return i18n.t("errors.notFound");
    case 422:
      return i18n.t("errors.invalidDataFormat");
    case 429:
      return i18n.t("errors.tooManyAttempts"); // تلاش بیش‌ازحد
    default:
      if (status >= 500) {
        return i18n.t("errors.serverError"); // خطای سرور
      }
      return i18n.t("errors.default"); // هر خطای دیگه
  }
}
