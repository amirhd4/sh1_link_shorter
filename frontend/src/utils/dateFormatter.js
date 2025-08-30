import moment from 'moment-jalaali';

export const toPersianDate = (gregorianDate) => {
    if (!gregorianDate) {
        return 'نامشخص';
    }
    console.log(gregorianDate);

    return moment(gregorianDate).locale('fa').format('jYYYY/jMM/jDD');
};
