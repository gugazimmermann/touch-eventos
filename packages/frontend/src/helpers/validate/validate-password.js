const validatePassword = (p1, p2) => {
  if (!p1 || p1.length < 6) return false;
  if (p2) {
    if (p1 !== p2) return false;
  }
  return true;
};

export default validatePassword;
