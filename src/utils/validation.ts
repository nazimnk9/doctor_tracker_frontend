export const validateEmail = (email: string): string | null => {
  if (!email || email.trim() === '') return 'This field is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address.';
  return null;
};

export const validateOptionalEmail = (email?: string): string | null => {
  if (!email || email.trim() === '') return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address.';
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone || phone.trim() === '') return 'This field is required.';
  const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/;
  const digitCount = phone.replace(/\D/g, '').length;
  if (!phoneRegex.test(phone) || digitCount < 7) {
    return 'Please enter a valid phone number.';
  }
  return null;
};

export const validateRequired = (value: string): string | null => {
  if (!value || value.trim() === '') {
    return 'This field is required.';
  }
  return null;
};

export const validateAge = (age: string | number): string | null => {
  if (age === undefined || age === null || String(age).trim() === '') {
    return 'This field is required.';
  }
  const num = Number(age);
  if (isNaN(num) || num <= 0 || num > 120) {
    return 'Please enter a valid age.';
  }
  return null;
};

export const validateSelect = (value: string): string | null => {
  if (!value || value.trim() === '') {
    return 'Please select an option.';
  }
  return null;
};
