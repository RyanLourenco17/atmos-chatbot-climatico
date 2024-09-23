export const validateRequired = (value, fieldName) => {
    if (!value) {
      return `${fieldName} é obrigatório.`;
    }
    return '';
  };
  