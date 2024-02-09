export const error = (
  code: number,
  message: string
): { statusCode: number; body: string } => {
  console.error(JSON.stringify({ error: message }, undefined, 2));
  return {
    statusCode: code,
    body: JSON.stringify({ error: message }),
  };
};
