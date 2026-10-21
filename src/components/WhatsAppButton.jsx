import { STORE_CONTACT } from '../constants/storeContact.js';
import './WhatsAppButton.css';

const WA_URL = `https://wa.me/${STORE_CONTACT.whatsappNumber}?text=${encodeURIComponent(
  'Hi! I have a question about Zivora.',
)}`;

export default function WhatsAppButton() {
  return (
    <a
      id="whatsapp-float-btn"
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="wa-float-btn"
      aria-label="Contact us on WhatsApp"
      title="Contact us on WhatsApp"
    >
      {/* WhatsApp SVG icon */}
      <svg
        className="wa-float-icon"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="16" fill="#25D366" />
        <path
          d="M23.472 8.516A10.37 10.37 0 0 0 16.01 5.5C10.757 5.5 6.49 9.765 6.49 15.02a9.507 9.507 0 0 0 1.274 4.762L6.4 24.5l4.84-1.27a9.524 9.524 0 0 0 4.763 1.213h.004c5.252 0 9.52-4.265 9.52-9.52a9.484 9.484 0 0 0-2.055-6.407Zm-7.462 14.646h-.003a7.906 7.906 0 0 1-4.032-1.103l-.289-.172-3.001.787.8-2.924-.188-.3a7.887 7.887 0 0 1-1.209-4.23c0-4.362 3.552-7.914 7.925-7.914a7.879 7.879 0 0 1 5.604 2.323 7.875 7.875 0 0 1 2.317 5.601c-.002 4.364-3.554 7.932-7.924 7.932Zm4.344-5.933c-.238-.12-1.408-.694-1.627-.774-.218-.08-.376-.12-.535.12-.158.238-.613.774-.752.932-.138.158-.277.178-.515.06-.238-.12-1.006-.371-1.915-1.182-.708-.63-1.186-1.41-1.324-1.648-.139-.238-.015-.367.104-.486.106-.106.238-.277.357-.416.12-.138.158-.237.238-.396.08-.158.04-.297-.02-.416-.059-.12-.534-1.29-.732-1.765-.193-.465-.39-.402-.535-.41l-.455-.007a.874.874 0 0 0-.633.297c-.218.238-.832.813-.832 1.983s.852 2.3.97 2.459c.12.158 1.676 2.558 4.062 3.588.568.245 1.011.391 1.357.5.57.181 1.089.156 1.499.094.457-.068 1.408-.576 1.607-1.131.198-.555.198-1.031.139-1.131-.059-.099-.218-.158-.456-.277Z"
          fill="#fff"
        />
      </svg>
      <span className="wa-float-label">Contact Us</span>
    </a>
  );
}
