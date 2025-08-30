import moment from 'jalali-moment';

export const toPersianDate = (gregorianDate) => {
    if (!gregorianDate) return 'نامشخص';
    return moment(gregorianDate).locale('fa').format('YYYY/MM/DD');
};