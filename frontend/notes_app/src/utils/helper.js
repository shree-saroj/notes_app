export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^s@]+\.[^s@]+$/;
  return regex.test(email);
};

export const getInitials = (name) => {
  if (!name) {
    return "";
  } else {
    return name
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }
};
