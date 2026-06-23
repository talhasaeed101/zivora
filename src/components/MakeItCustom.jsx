import './MakeItCustom.css';

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
            <img
              src="/images/necklace image 1.png"
              alt="Minimal necklace close-up"
              className="custom-grid-image"
            />
            <div className="custom-overlay">
              <div className="custom-overlay-label-row">
                <span className="custom-overlay-line" />
                <span className="custom-overlay-label">NECKLACES</span>
                <span className="custom-overlay-line" />
              </div>
              <h3 className="custom-overlay-title">Minimal Necklace</h3>
              <button type="button" className="custom-shop-btn">Shop Collection</button>
            </div>
          </div>

          <div className="custom-right-column">
            <div className="custom-right-top-block">
              <img
                src="/images/Minimal Rings.png"
                alt="Minimal rings on hand"
                className="custom-grid-image"
              />
              <div className="custom-overlay">
                <div className="custom-overlay-label-row">
                  <span className="custom-overlay-line" />
                  <span className="custom-overlay-label">RINGS</span>
                  <span className="custom-overlay-line" />
                </div>
                <h3 className="custom-overlay-title">Minimal Rings</h3>
              </div>
            </div>

            <div className="custom-right-bottom-block">
              <img
                src="/images/Rectangle 3298.png"
                alt="Minimal earrings close-up"
                className="custom-grid-image"
              />
              <div className="custom-overlay">
                <div className="custom-overlay-label-row">
                  <span className="custom-overlay-line" />
                  <span className="custom-overlay-label">EARRINGS</span>
                  <span className="custom-overlay-line" />
                </div>
                <h3 className="custom-overlay-title">Minimal Earrings</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
