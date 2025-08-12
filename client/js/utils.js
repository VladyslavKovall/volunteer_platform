export function parseJwt(token) {
  const base64Payload = token.split(".")[1];
  const payload = atob(base64Payload);
  return JSON.parse(payload);
}
