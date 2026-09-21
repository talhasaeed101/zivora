import { BANK_TRANSFER_DETAILS } from '../constants/bankTransfer.js';

export function buildBankTransferWhatsAppMessage({
  orderNumber,
  customerName,
  totalLabel,
} = {}) {
  const lines = [
    'Hello Zivorah,',
    '',
    'I have placed an order and will pay by bank transfer.',
    '',
    `Order number: ${orderNumber || '—'}`,
    `Name: ${customerName || '—'}`,
    `Amount: ${totalLabel || '—'}`,
    '',
    'Bank details:',
    `Bank: ${BANK_TRANSFER_DETAILS.bankName}`,
    `Account title: ${BANK_TRANSFER_DETAILS.accountTitle}`,
    `Account number: ${BANK_TRANSFER_DETAILS.accountNumber}`,
    `IBAN: ${BANK_TRANSFER_DETAILS.iban}`,
    '',
    'Please find my payment screenshot attached.',
    'Kindly verify my payment and confirm the order.',
  ];

  return lines.join('\n');
}

export function buildBankTransferWhatsAppUrl(params = {}) {
  const text = buildBankTransferWhatsAppMessage(params);
  return `https://wa.me/${BANK_TRANSFER_DETAILS.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function openBankTransferWhatsApp(params = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  const url = buildBankTransferWhatsAppUrl(params);
  window.open(url, '_blank', 'noopener,noreferrer');
}
