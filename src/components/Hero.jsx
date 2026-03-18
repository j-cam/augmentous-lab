import React from 'react';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h2>Welcome to Augmentous Lab</h2>
        <p>This is a deliberately broken demo site for testing code audit tools.</p>
        <img src="/images/hero-banner.jpg" />
      </div>

      <div className="hero-sidebar">
        <h3>Featured Product</h3>
        <img src="/images/featured-product.jpg" alt="" />
        <p>Our best-selling widget is now 20% off.</p>
      </div>
    </section>
  );
}
