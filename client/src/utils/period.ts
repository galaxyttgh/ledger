export const getCurrentPeriod = (): string => {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const now = new Date();
  return `${months[now.getMonth()]}-${now.getFullYear()}`;
};