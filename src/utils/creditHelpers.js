// src/utils/creditHelpers.js

/**
 * Calcula o total de créditos disponíveis somando os créditos restantes de todos os lotes não expirados.
 * @param {Array} creditBatches - O array de lotes de crédito do aluno.
 * @returns {number} O total de créditos válidos.
 */
export const calculateTotalCredits = (creditBatches = []) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!creditBatches || creditBatches.length === 0) {
        return 0;
    }

    return creditBatches
        .filter(batch => new Date(batch.expiryDate) >= today)
        .reduce((total, batch) => total + batch.creditsRemaining, 0);
};

/**
 * Encontra a data de vencimento mais próxima entre os lotes de crédito válidos que ainda possuem saldo.
 * @param {Array} creditBatches - O array de lotes de crédito do aluno.
 * @returns {string|null} - A data do próximo vencimento ou null se não houver.
 */
export const getNextExpiryDate = (creditBatches = []) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!creditBatches || creditBatches.length === 0) {
        return null;
    }

    const futureBatches = creditBatches
        .filter(batch => new Date(batch.expiryDate) >= today && batch.creditsRemaining > 0)
        .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    return futureBatches.length > 0 ? futureBatches[0].expiryDate : null;
};

/**
 * Calcula a data de vencimento para uma nova compra de créditos com base no histórico do aluno.
 * @param {Array} existingBatches - Os lotes de crédito que o aluno já possui.
 * @param {Date} paymentDate - A data em que o novo pagamento foi feito.
 * @returns {Date} A nova data de vencimento calculada.
 */
export const calculateNewExpiryDate = (existingBatches = [], paymentDate) => {
    // Encontra a data de vencimento mais recente entre todos os lotes existentes
    const lastExpiryDate = existingBatches.length > 0
        ? new Date(Math.max(...existingBatches.map(e => new Date(e.expiryDate))))
        : null;

    const newExpiryDate = new Date(paymentDate);

    // Se existe um vencimento anterior e o pagamento foi feito antes ou no dia do vencimento
    if (lastExpiryDate && paymentDate <= lastExpiryDate) {
        // A nova data de vencimento é 1 mês após o vencimento ANTERIOR
        const finalDate = new Date(lastExpiryDate);
        finalDate.setMonth(finalDate.getMonth() + 1);
        return finalDate;
    } else {
        // Se não há vencimento anterior ou ele já passou, o vencimento é 1 mês após a data do PAGAMENTO ATUAL
        newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
        return newExpiryDate;
    }
};