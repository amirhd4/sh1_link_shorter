import i18n from "../i18n";

export function getOtpErrorMessage(error: any, step: "phone" | "verify"): string {
  const status = error?.response?.status ?? null;

  if (!error?.response) {
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
        return status && status >= 500
          ? i18n.t("errors.otp.serverError")
          : i18n.t("errors.default");
    }
  }

  if (step === "verify") {
    switch (status) {
      case 400: return i18n.t("errors.verify.invalidCode");
      case 401: return i18n.t("errors.unauthorized");
      case 422: return i18n.t("errors.verify.expiredCode");
      case 429: return i18n.t("errors.verify.tooManyAttempts");
      default:
        return status && status >= 500
          ? i18n.t("errors.verify.serverError")
          : i18n.t("errors.default");
    }
  }

  return i18n.t("errors.default");
}
