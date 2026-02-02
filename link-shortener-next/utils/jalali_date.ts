import dayjs from "dayjs";
import jalaliday from "jalaliday";

dayjs.extend(jalaliday);

export const formatJalaliDate = (
  date: string | Date,
  withTime = false
) => {
  const d = dayjs(date).calendar("jalali").locale("fa");

  return withTime
    ? d.format("YYYY/MM/DD - HH:mm")
    : d.format("YYYY/MM/DD");
};
