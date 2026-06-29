import './MakeItCustom.css';
import { ROUTES } from '../utils/navigation';
import SafeImage from './SafeImage.jsx';
import { MARKETING_IMAGE } from '../utils/images.js';

export default function MakeItCustom() {
  return (
    <section className="custom-section">
      <div className="custom-inner">
        <header className="custom-header">
          <div className="custom-label-row">
            <span className="custom-label-line" />
            <span className="custom-label-text">MAKE IT CUSTOM</span>
            <span className="custom-label-line" />
          </div>
          <h2 className="custom-heading">Upgrade the Way You Relax</h2>
          <p className="custom-subtext">
            Experience premium comfort designed to help you relax, recharge, and feel your best every day.
          </p>
        </header>

        <div className="custom-image-grid">
          <div className="custom-left-image-block">
            <a href={ROUTES.collection} className="custom-image-link">
              <SafeImage
                src="/images/necklace image 1.png"
                alt="Minimal necklace close-up"
                className="custom-grid-image"
              />
            </a>
          </div>

          <div className="custom-right-column">
            <div className="custom-right-top-block">
              <a href={ROUTES.collection} className="custom-image-link">
                <SafeImage
                  src="/images/Minimal Rings.png"
                  alt="Minimal rings on hand"
                  className="custom-grid-image"
                />
              </a>
            </div>

            <div className="custom-right-bottom-block">
              <a href={ROUTES.collection} className="custom-image-link">
                <SafeImage
                  src="/images/Rectangle 3298.png"
                  alt="Minimal earrings close-up"
                  className="custom-grid-image"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
