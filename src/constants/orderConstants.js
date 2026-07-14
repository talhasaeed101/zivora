export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Order Placed',
  [ORDER_STATUS.CONFIRMED]: 'Confirmed',
  [ORDER_STATUS.PROCESSING]: 'Processing',
  [ORDER_STATUS.SHIPPED]: 'Shipped',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
};

export const NORMAL_FLOW_STEPS = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
];
