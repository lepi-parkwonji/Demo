export function formatBusinessNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length > 5) return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  if (digits.length > 3) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return digits;
}

export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.startsWith('02')) {
    if (digits.length > 6) return `${digits.slice(0, 2)}-${digits.slice(2, digits.length - 4)}-${digits.slice(-4)}`;
    if (digits.length > 2) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  } else {
    if (digits.length > 7) return `${digits.slice(0, 3)}-${digits.slice(3, digits.length - 4)}-${digits.slice(-4)}`;
    if (digits.length > 3) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return digits;
}
