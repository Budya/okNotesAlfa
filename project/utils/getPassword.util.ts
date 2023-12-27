export function getPassword(): string | never {
  if(process.env.PASSWORD) {
    return process.env.PASSWORD;
  } else {
    throw new Error('Password is not provided');
  }
}