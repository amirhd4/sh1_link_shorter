/**
 * تعداد روزهای باقی‌مانده تا یک تاریخ مشخص را محاسبه می‌کند.
 * @param dateString تاریخ انقضا به صورت رشته
 * @returns تعداد روزهای باقی‌مانده یا null اگر تاریخ نامعتبر باشد
 */
export const getDaysRemaining = (dateString: string | null | undefined): number | null => {
  if (!dateString) return null;

  const endDate = new Date(dateString);
  const today = new Date();

  // برای جلوگیری از نمایش ساعت، تاریخ‌ها را به ابتدای روز تنظیم می‌کنیم
  endDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const differenceInTime = endDate.getTime() - today.getTime();

  if (differenceInTime < 0) return 0; // اگر تاریخ گذشته باشد

  const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
  return differenceInDays;
};