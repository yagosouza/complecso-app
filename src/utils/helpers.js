// src/utils/helpers.js
export const maskPhone = (value) => {
    if (!value) return "";
    value = value.replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    return value;
}

export const getBillingCycle = (paymentDueDate) => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let startYear = currentYear;
    let startMonth = currentMonth;
    
    if (currentDay < paymentDueDate) {
        startMonth = currentMonth - 1;
        if (startMonth < 0) {
            startMonth = 11;
            startYear -= 1;
        }
    }

    const startDate = new Date(startYear, startMonth, paymentDueDate);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate() - 1);
    endDate.setHours(23, 59, 59, 999);

    return { start: startDate, end: endDate };
};