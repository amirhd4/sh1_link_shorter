import moment from 'jalali-moment';

export const toPersianDate = (gregorianDate) => {
    if (!gregorianDate) return 'نامشخص';
    // This correctly parses the date in the user's local timezone
    return moment(gregorianDate).locale('fa').format('YYYY/MM/DD');
};