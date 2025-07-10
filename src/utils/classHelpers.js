// src/utils/classHelpers.js

export const calculateTotalClasses = (classPacks = []) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!classPacks || classPacks.length === 0) {
        return 0;
    }

    const validPacks = classPacks.filter(pack => new Date(pack.expiryDate) >= today);

    if (validPacks.some(pack => pack.classesRemaining === Infinity)) {
        return Infinity;
    }

    return validPacks.reduce((total, pack) => total + pack.classesRemaining, 0);
};

export const getNextExpiryDate = (classPacks = []) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!classPacks || classPacks.length === 0) {
        return null;
    }

    const futurePacks = classPacks
        .filter(pack => new Date(pack.expiryDate) >= today && pack.classesRemaining > 0)
        .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    return futurePacks.length > 0 ? futurePacks[0].expiryDate : null;
};

export const calculateNewExpiryDate = (paymentDate) => {
    const newExpiryDate = new Date(paymentDate);
    newExpiryDate.setDate(newExpiryDate.getDate() + 40);
    return newExpiryDate;
};