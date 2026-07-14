import React from 'react';
import { ORDER_STATUS, NORMAL_FLOW_STEPS, ORDER_STATUS_LABELS } from '../constants/orderConstants.js';
import './OrderProgressTracker.css';

export default function OrderProgressTracker({ order }) {
  if (!order) return null;

  const currentStatus = order.orderStatus;
  const isCancelled = currentStatus === ORDER_STATUS.CANCELLED;

  let currentStepIndex = NORMAL_FLOW_STEPS.indexOf(currentStatus);
  if (currentStepIndex === -1 && isCancelled) {
    // Find the last completed normal step from history before cancellation
    const lastNormalHistory = order.statusHistory
      ?.slice()
      .reverse()
      .find(h => NORMAL_FLOW_STEPS.includes(h.status));
      
    currentStepIndex = lastNormalHistory 
      ? NORMAL_FLOW_STEPS.indexOf(lastNormalHistory.status) 
      : 0;
  }

  return (
    <div className="order-progress-wrapper">
      <div className="order-progress-track">
        {NORMAL_FLOW_STEPS.map((step, index) => {
          const isCompleted = isCancelled ? index <= currentStepIndex : index <= currentStepIndex;
          const isCurrent = isCancelled ? false : index === currentStepIndex;
          
          return (
            <div key={step} className={`progress-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
              <div className="progress-step-indicator">
                <div className="progress-step-dot">
                  {isCompleted && !isCurrent && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                {index < NORMAL_FLOW_STEPS.length - 1 && <div className="progress-step-line" />}
              </div>
              <div className="progress-step-label">{ORDER_STATUS_LABELS[step]}</div>
            </div>
          );
        })}
        
        {isCancelled && (
          <div className="progress-step cancelled current">
            <div className="progress-step-indicator">
               <div className="progress-step-line cancelled-line" />
               <div className="progress-step-dot">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                 </svg>
               </div>
            </div>
            <div className="progress-step-label text-red">Cancelled</div>
          </div>
        )}
      </div>
    </div>
  );
}
