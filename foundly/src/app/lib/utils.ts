export const generateSixDigitCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateRandomSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};
