import { ORDER_STATUS, ORDER_STATUS_LABELS, NORMAL_FLOW_STEPS } from '../constants/orderConstants.js';
import {
  POSTEX_TRACKING_URL,
  formatShipmentStatusLabel,
  hasCustomerShippingInfo,
  SHIPPING_SHIPMENT_STATUS,
} from '../constants/shippingConstants.js';

export function formatOrderDate(value, { withTime = false } = {}) {
  if (!value) {
    return '';
  }

  const options = withTime
    ? {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    : {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      };

  return new Date(value).toLocaleString('en-GB', options);
}

export function formatPaymentMethod(method) {
  if (method === 'cod') {
    return 'Cash on Delivery';
  }
  if (method === 'online') {
    return 'Online Payment';
  }
  if (method === 'bank_transfer') {
    return 'Direct Bank Transfer';
  }
  if (!method) {
    return '';
  }
  return String(method)
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatPaymentStatusLabel(status, paymentMethod) {
  if (!status && paymentMethod === 'cod') {
    return 'Cash on Delivery';
  }

  if (status === 'Pending Payment Verification') {
    return 'Bank transfer pending';
  }
  if (status === 'pending' && paymentMethod === 'bank_transfer') {
    return 'Bank transfer pending';
  }
  if (status === 'Rejected' || status === 'rejected') {
    return 'Rejected';
  }
  if (status === 'paid') {
    return 'Paid';
  }
  if (status === 'pending') {
    return paymentMethod === 'cod' ? 'COD' : 'Pending';
  }
  if (status === 'failed') {
    return 'Failed';
  }
  if (status === 'refunded') {
    return 'Refunded';
  }
  if (!status) {
    return 'Pending';
  }

  return String(status)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatOrderStatusLabel(status) {
  if (!status) {
    return 'Unknown';
  }
  return ORDER_STATUS_LABELS[status] || String(status).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getOrderStatusTone(status) {
  switch (status) {
    case ORDER_STATUS.DELIVERED:
      return 'success';
    case ORDER_STATUS.SHIPPED:
    case ORDER_STATUS.PROCESSING:
    case ORDER_STATUS.CONFIRMED:
      return 'accent';
    case ORDER_STATUS.CANCELLED:
      return 'danger';
    case ORDER_STATUS.PENDING:
    default:
      return 'neutral';
  }
}

export function getPaymentStatusTone(status, paymentMethod) {
  const normalized = String(status || '').toLowerCase();

  if (normalized === 'paid') {
    return 'success';
  }
  if (normalized === 'failed' || normalized === 'rejected') {
    return 'danger';
  }
  if (normalized === 'refunded') {
    return 'neutral';
  }
  if (
    status === 'Pending Payment Verification' ||
    (normalized === 'pending' && paymentMethod === 'bank_transfer')
  ) {
    return 'warning';
  }
  if (normalized === 'pending' && paymentMethod === 'cod') {
    return 'neutral';
  }
  return 'warning';
}

export function getShipmentStatusTone(status) {
  switch (status) {
    case SHIPPING_SHIPMENT_STATUS.DELIVERED:
      return 'success';
    case SHIPPING_SHIPMENT_STATUS.CANCELLED:
    case SHIPPING_SHIPMENT_STATUS.DELIVERY_FAILED:
    case SHIPPING_SHIPMENT_STATUS.RETURNED:
    case SHIPPING_SHIPMENT_STATUS.RETURN_IN_TRANSIT:
      return 'danger';
    case SHIPPING_SHIPMENT_STATUS.OUT_FOR_DELIVERY:
    case SHIPPING_SHIPMENT_STATUS.IN_TRANSIT:
    case SHIPPING_SHIPMENT_STATUS.PICKED_UP:
    case SHIPPING_SHIPMENT_STATUS.BOOKED:
      return 'accent';
    default:
      return 'neutral';
  }
}

export function getTrackingId(order) {
  return order?.shipping?.trackingId || order?.trackingNumber || '';
}

export function sanitizeHttpUrl(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }

  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    return '';
  }

  return '';
}

export function getTrackingUrl(order) {
  const explicit = sanitizeHttpUrl(order?.shipping?.trackingUrl || order?.trackingUrl);
  if (explicit) {
    return explicit;
  }

  if (order?.shipping?.courier === 'POSTEX' && getTrackingId(order)) {
    return POSTEX_TRACKING_URL;
  }

  return '';
}

export function getCourierName(order) {
  return order?.shipping?.courierName || order?.courierName || '';
}

export { hasCustomerShippingInfo, formatShipmentStatusLabel };

export function buildCustomerShipmentHistory(order) {
  const raw = Array.isArray(order?.shippingHistory) ? order.shippingHistory : [];
  const seen = new Set();
  const items = [];

  for (const entry of raw) {
    if (!entry?.status) {
      continue;
    }

    const key = `${entry.status}|${entry.changedAt || ''}|${entry.note || ''}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    items.push({
      status: entry.status,
      label: formatShipmentStatusLabel(entry.status),
      note: entry.note || '',
      changedAt: entry.changedAt || null,
    });
  }

  items.sort((a, b) => {
    const aTime = a.changedAt ? new Date(a.changedAt).getTime() : 0;
    const bTime = b.changedAt ? new Date(b.changedAt).getTime() : 0;
    return aTime - bTime;
  });

  return items;
}

export function getStatusHistoryDate(order, status) {
  const history = Array.isArray(order?.statusHistory) ? order.statusHistory : [];
  const match = history.find((entry) => entry.status === status);
  return match?.changedAt || null;
}

export function getTimelineStepDate(order, step) {
  if (step === ORDER_STATUS.PENDING) {
    return getStatusHistoryDate(order, step) || order?.createdAt || null;
  }
  if (step === ORDER_STATUS.SHIPPED) {
    return getStatusHistoryDate(order, step) || order?.shippedAt || order?.shipping?.bookedAt || null;
  }
  if (step === ORDER_STATUS.DELIVERED) {
    return (
      getStatusHistoryDate(order, step) ||
      order?.deliveredAt ||
      order?.shipping?.deliveredAt ||
      null
    );
  }
  return getStatusHistoryDate(order, step);
}

export function getCancelledAt(order) {
  return getStatusHistoryDate(order, ORDER_STATUS.CANCELLED) || order?.updatedAt || null;
}

export function formatMetalLabel(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function friendlyOrderError(message, fallback = 'Something went wrong. Please try again.') {
  const text = (message || '').trim();
  if (!text) {
    return fallback;
  }

  const lower = text.toLowerCase();
  if (lower.includes('not found') || lower.includes('404')) {
    return 'We could not find this order.';
  }
  if (lower.includes('unauthorized') || lower.includes('forbidden') || lower.includes('401') || lower.includes('403')) {
    return 'You do not have access to this order.';
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Unable to connect. Please check your connection and try again.';
  }

  return text.length > 140 ? fallback : text;
}

export { NORMAL_FLOW_STEPS, ORDER_STATUS };
