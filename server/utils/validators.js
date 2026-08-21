const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const validatePassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

module.exports = {
  validateEmail,
  validatePassword
};
