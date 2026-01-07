export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}


export function formatCPF(value) {
  if (!value) return "";

  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);
}

export function isValidCPF(cpf) {
  if (!cpf) return false;

  cpf = cpf.replace(/\D/g, "");

  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  let rest;

  // 1º dígito verificador
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i);
  }

  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(cpf[9])) return false;

  // 2º dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i);
  }

  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(cpf[10])) return false;

  return true;
}