import React, { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="contact-form">
      <h2>Get In Touch</h2>
      <input type="text" name="fullName" onChange={handleChange} />

      <input
        type="email"
        name="email"
        placeholder="Enter your email"
        onChange={handleChange}
      />

      <textarea
        name="message"
        rows="4"
        placeholder="Your message"
        onChange={handleChange}
      />

      <select name="department" onChange={handleChange}>
        <option value="">Choose a department</option>
        <option value="sales">Sales</option>
        <option value="support">Support</option>
        <option value="billing">Billing</option>
      </select>

      <button type="submit">Send Message</button>
    </div>
  );
}
