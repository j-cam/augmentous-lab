import React from 'react';

export default function NavBar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <a href="/">Augmentous Lab</a>
      </div>

      <div className="nav-actions">
        <a href="/about">About</a>
        <button onClick={() => console.log('toggle menu')}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
        <a href="/dashboard" className="nav-icon-link">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </a>
      </div>
    </nav>
  );
}
