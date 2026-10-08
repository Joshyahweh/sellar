export const MIN_PASSWORD_LENGTH = 8;

export function isPasswordLongEnough(password: string) {
  return password.length >= MIN_PASSWORD_LENGTH;
}

export const passwordLengthMessage = `Use a password with at least ${MIN_PASSWORD_LENGTH} characters.`;
