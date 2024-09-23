export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email é obrigatório.';
    } else if (!emailRegex.test(email)) {
      return 'Email inválido.';
    }
    return '';
};
  