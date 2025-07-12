// src/utils/helpers.js

export const maskPhone = (value) => {
    // Se o valor for nulo, indefinido ou vazio, retorna uma string vazia imediatamente.
    // Isso resolve o erro 'Cannot read... of undefined'.
    if (!value) return "";

    // Garante que estamos trabalhando com uma string
    let v = value.toString();

    // Lógica da máscara
    v = v.replace(/\D/g, ''); // Remove tudo o que não é dígito
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2"); // Coloca parênteses em volta dos dois primeiros dígitos
    v = v.replace(/(\d)(\d{4})$/, "$1-$2"); // Coloca um hífen entre o quarto e o quinto dígitos de trás para frente
    
    return v;
}