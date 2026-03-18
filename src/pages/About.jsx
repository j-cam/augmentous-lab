import React from 'react';

export default function About() {
  return (
    <main>
      <section className="about-intro">
        <h1>About Augmentous Lab</h1>
        <p>
          We build tools that help developers find and fix expensive problems in
          legacy codebases. Our mission is to make every codebase healthier.
        </p>
      </section>

      <section className="about-team">
        <h1>Meet the Team</h1>
        <img src="/images/team-photo.jpg" />
        <p>
          Our team of engineers and designers is passionate about developer
          experience and code quality.
        </p>
      </section>

      <section className="about-values">
        <h2>Our Values</h2>
        <ul>
          <li>Ship real tools, not demos</li>
          <li>Human-in-the-loop always</li>
          <li>Transparency over magic</li>
        </ul>
      </section>
    </main>
  );
}
