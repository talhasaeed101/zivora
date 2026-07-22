/** Customer-visible bank transfer details already used on cart and order success. */
export const BANK_TRANSFER_DETAILS = {
  bankName: 'United Bank Limited (UBL)',
  accountTitle: 'ZIVORAH',
  accountNumber: '0000385727723',
  iban: 'PK09UNIL0109000385727723',
  whatsappNumber: '923392215181',
};

export const PAYMENT_METHODS = [
  {
    value: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay when your order is delivered.',
  },
  {
    value: 'bank_transfer',
    label: 'Bank Transfer',
    description: 'Transfer payment using the provided account details.',
  },
];

export function formatPaymentMethodLabel(method) {
  const match = PAYMENT_METHODS.find((entry) => entry.value === method);
  return match?.label || method || '—';
}
