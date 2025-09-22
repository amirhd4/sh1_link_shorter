import i18n from "../i18n";

export function getOtpErrorMessage(error: any, step: "phone" | "verify"): string {
  const status = error?.response?.status;

  // خطای بدون اینترنت
  if (error?.message === "Network Error") {
    return i18n.t("errors.network");
  }

  if (step === "phone") {
    switch (status) {
      case 400: return i18n.t("errors.otp.invalidPhone");
      case 401: return i18n.t("errors.unauthorized");
      case 404: return i18n.t("errors.otp.notFoundPhone");
      case 422: return i18n.t("errors.otp.invalidPhone");
      case 429: return i18n.t("errors.otp.sendLimit");
      default:
        if (status >= 500) return i18n.t("errors.otp.serverError");
        return i18n.t("errors.default");
    }
  }

  if (step === "verify") {
    switch (status) {
      case 400: return i18n.t("errors.verify.invalidCode");
      case 401: return i18n.t("errors.unauthorized");
      case 422: return i18n.t("errors.verify.expiredCode");
      case 429: return i18n.t("errors.verify.tooManyAttempts");
      default:
        if (status >= 500) return i18n.t("errors.verify.serverError");
        return i18n.t("errors.default");
    }
  }

  return i18n.t("errors.default");
}
