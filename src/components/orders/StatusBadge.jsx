import {
  formatOrderStatusLabel,
  formatPaymentStatusLabel,
  formatShipmentStatusLabel,
  getOrderStatusTone,
  getPaymentStatusTone,
  getShipmentStatusTone,
} from '../../utils/orderDisplay.js';

export default function StatusBadge({
  type = 'order',
  status,
  paymentMethod,
  className = '',
}) {
  if (!status && type !== 'payment') {
    return null;
  }

  let label = '';
  let tone = 'neutral';

  if (type === 'order') {
    label = formatOrderStatusLabel(status);
    tone = getOrderStatusTone(status);
  } else if (type === 'payment') {
    label = formatPaymentStatusLabel(status, paymentMethod);
    tone = getPaymentStatusTone(status, paymentMethod);
  } else if (type === 'shipment') {
    label = formatShipmentStatusLabel(status);
    tone = getShipmentStatusTone(status);
  } else {
    label = String(status || '');
  }

  if (!label) {
    return null;
  }

  return (
    <span className={`od-status-badge od-status-badge--${tone} ${className}`.trim()}>
      {label}
    </span>
  );
}
