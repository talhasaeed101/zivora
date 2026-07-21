export const SHIPPING_SHIPMENT_STATUS = {
  PENDING: 'PENDING',
  BOOKED: 'BOOKED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  DELIVERY_FAILED: 'DELIVERY_FAILED',
  RETURN_IN_TRANSIT: 'RETURN_IN_TRANSIT',
  RETURNED: 'RETURNED',
  CANCELLED: 'CANCELLED',
};

export const POSTEX_TRACKING_URL = 'https://postex.pk/tracking';

export const SHIPPING_SHIPMENT_STATUS_LABELS = {
  [SHIPPING_SHIPMENT_STATUS.PENDING]: 'Pending',
  [SHIPPING_SHIPMENT_STATUS.BOOKED]: 'Shipment Booked',
  [SHIPPING_SHIPMENT_STATUS.PICKED_UP]: 'Picked Up',
  [SHIPPING_SHIPMENT_STATUS.IN_TRANSIT]: 'In Transit',
  [SHIPPING_SHIPMENT_STATUS.OUT_FOR_DELIVERY]: 'Out for Delivery',
  [SHIPPING_SHIPMENT_STATUS.DELIVERED]: 'Delivered',
  [SHIPPING_SHIPMENT_STATUS.DELIVERY_FAILED]: 'Delivery Attempt Failed',
  [SHIPPING_SHIPMENT_STATUS.RETURN_IN_TRANSIT]: 'Returning to Sender',
  [SHIPPING_SHIPMENT_STATUS.RETURNED]: 'Returned',
  [SHIPPING_SHIPMENT_STATUS.CANCELLED]: 'Cancelled',
};

export const CUSTOMER_SHIPMENT_TIMELINE_STEPS = [
  SHIPPING_SHIPMENT_STATUS.BOOKED,
  SHIPPING_SHIPMENT_STATUS.PICKED_UP,
  SHIPPING_SHIPMENT_STATUS.IN_TRANSIT,
  SHIPPING_SHIPMENT_STATUS.OUT_FOR_DELIVERY,
  SHIPPING_SHIPMENT_STATUS.DELIVERED,
];

export const formatShipmentStatusLabel = (status) =>
  SHIPPING_SHIPMENT_STATUS_LABELS[status] || String(status || '').replace(/_/g, ' ');

export const hasCustomerShippingInfo = (order) => {
  const shipping = order?.shipping;

  if (!shipping) {
    return Boolean(order?.trackingNumber || order?.trackingUrl || order?.shippedAt);
  }

  return Boolean(
    shipping.trackingId ||
      shipping.bookedAt ||
      shipping.bookingStatus === 'BOOKED' ||
      (shipping.shipmentStatus && shipping.shipmentStatus !== SHIPPING_SHIPMENT_STATUS.PENDING) ||
      order?.trackingNumber
  );
};
