import {
  ORDER_STATUS,
  NORMAL_FLOW_STEPS,
  ORDER_STATUS_LABELS,
} from '../constants/orderConstants.js';
import { formatOrderDate, getCancelledAt, getTimelineStepDate } from '../utils/orderDisplay.js';
import './OrderProgressTracker.css';

export default function OrderProgressTracker({ order }) {
  if (!order) {
    return null;
  }

  const currentStatus = order.orderStatus;
  const isCancelled = currentStatus === ORDER_STATUS.CANCELLED;

  let currentStepIndex = NORMAL_FLOW_STEPS.indexOf(currentStatus);

  if (currentStepIndex === -1 && isCancelled) {
    const lastNormalHistory = order.statusHistory
      ?.slice()
      .reverse()
      .find((entry) => NORMAL_FLOW_STEPS.includes(entry.status));

    currentStepIndex = lastNormalHistory
      ? NORMAL_FLOW_STEPS.indexOf(lastNormalHistory.status)
      : 0;
  }

  if (currentStepIndex === -1) {
    currentStepIndex = 0;
  }

  const cancelledAt = isCancelled ? getCancelledAt(order) : null;

  return (
    <div className="order-progress-wrapper">
      {isCancelled ? (
        <p className="order-progress-cancelled-banner" role="status">
          This order was cancelled
          {cancelledAt ? ` on ${formatOrderDate(cancelledAt, { withTime: true })}` : ''}.
        </p>
      ) : null}

      <ol className="order-progress-track" aria-label="Order progress">
        {NORMAL_FLOW_STEPS.map((step, index) => {
          const isPastOrCurrent = isCancelled
            ? index <= currentStepIndex
            : index <= currentStepIndex;
          const isCurrent = !isCancelled && index === currentStepIndex;
          const doneVisual = isCancelled
            ? index <= currentStepIndex
            : index < currentStepIndex ||
              (index === currentStepIndex && step === ORDER_STATUS.DELIVERED);
          const stepDate = getTimelineStepDate(order, step);
          const showDate = Boolean(stepDate && isPastOrCurrent);

          return (
            <li
              key={step}
              className={`progress-step${doneVisual || isCurrent ? ' completed' : ''}${isCurrent ? ' current' : ''}${isCancelled && index > currentStepIndex ? ' muted' : ''}`}
            >
              <div className="progress-step-indicator" aria-hidden="true">
                <div className="progress-step-dot">
                  {(doneVisual && !isCurrent) || (isCurrent && step === ORDER_STATUS.DELIVERED) ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : null}
                </div>
                {index < NORMAL_FLOW_STEPS.length - 1 ? <div className="progress-step-line" /> : null}
              </div>
              <div className="progress-step-content">
                <span className="progress-step-label">
                  {ORDER_STATUS_LABELS[step]}
                  {isCurrent ? <span className="sr-only"> (current)</span> : null}
                  {doneVisual && !isCurrent ? <span className="sr-only"> (completed)</span> : null}
                </span>
                {showDate ? (
                  <time className="progress-step-date" dateTime={new Date(stepDate).toISOString()}>
                    {formatOrderDate(stepDate, { withTime: true })}
                  </time>
                ) : null}
              </div>
            </li>
          );
        })}

        {isCancelled ? (
          <li className="progress-step cancelled current">
            <div className="progress-step-indicator" aria-hidden="true">
              <div className="progress-step-line cancelled-line" />
              <div className="progress-step-dot">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
            </div>
            <div className="progress-step-content">
              <span className="progress-step-label text-red">Cancelled</span>
              {cancelledAt ? (
                <time className="progress-step-date" dateTime={new Date(cancelledAt).toISOString()}>
                  {formatOrderDate(cancelledAt, { withTime: true })}
                </time>
              ) : null}
            </div>
          </li>
        ) : null}
      </ol>
    </div>
  );
}
