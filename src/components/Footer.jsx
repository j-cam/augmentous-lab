import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <a href="/">
          <img src="/images/logo.png" width="120" />
        </a>
        <p>&copy; 2026 Augmentous Lab. All rights reserved.</p>
      </div>

      <div className="footer-links">
        <h4>Follow Us</h4>
        <a href="https://twitter.com/example" target="_blank">
          Twitter
        </a>
        <a href="https://github.com/example" target="_blank">
          GitHub
        </a>
      </div>

      <div className="footer-contact">
        <h4>Contact</h4>
        <p>info@augmentous.ai</p>
      </div>
    </footer>
  );
}
