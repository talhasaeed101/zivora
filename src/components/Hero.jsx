import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <div className="hero-main-wrapper">
      
      {/* LEFT ZONE */}
      <div className="hero-left-zone-container">
        
        {/* Column 1: Image + PERFECT */}
        <div className="hero-left-column-1">
          <div className="hero-pill-image-wrapper">
            <img 
              src="/images/image 1 (3).png" 
              alt="Woman mid motion" 
              className="hero-pill-image" 
            />
          </div>
          <div className="hero-vertical-text-container">
            <p className="hero-vertical-text">
              PERFECT
            </p>
          </div>
        </div>

        {/* Column 2: COLLECTIONS */}
        <div className="hero-left-column-2">
          <div className="hero-vertical-text-container">
            <p className="hero-vertical-text">
              COLLECTIONS
            </p>
          </div>
        </div>

      </div>

      {/* CENTER ZONE */}
      <div className="hero-center-zone-container">
        {/* Tagline */}
        <p className="hero-tagline-text">
          From everyday elegance to unforgettable celebrations, discover jewelry crafted with exceptional artistry.
        </p>

        {/* Collection & Thumbnails */}
        <div className="hero-collection-row-container">
          <p className="hero-collection-title-text">
            COLLECTION
          </p>
          <div className="hero-collection-separator-line"></div>
          <div className="hero-collection-arrow-icon-wrapper">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="hero-collection-thumbnails-container" style={{ marginLeft: '10px' }}>
            <img 
              src="/images/image 2.png" 
              alt="Collection Thumbnails" 
              style={{ height: '60px', width:'160px', objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>

      {/* RIGHT ZONE */}
      <div className="hero-right-zone-container">
        {/* Arch Image */}
        <div className="hero-arch-image-wrapper">
          <img 
            src="/images/image 3.png" 
            alt="Autumn Field" 
            className="hero-arch-image" 
          />
        </div>

        {/* Circular Badge Button */}
        <div className="hero-circular-badge-container">
          <svg viewBox="0 0 100 100" width="120" height="120" className="hero-circular-rotating-svg">
            <defs>
              <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
            </defs>
            <text fontSize="8" fontWeight="600" letterSpacing="1px" fill="#000">
              <textPath href="#circlePath" startOffset="0%">
                SHOP THE COLLECTION • SHOP THE COLLECTION • 
              </textPath>
            </text>
          </svg>
          <div className="hero-circular-inner-button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '4px' }}>
              <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
