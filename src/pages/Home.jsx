import React from 'react';
import Hero from '../components/Hero';
import CardGrid from '../components/CardGrid';
import ContactForm from '../components/ContactForm';

export default function Home() {
  return (
    <main>
      <Hero />
      <CardGrid />
      <ContactForm />
    </main>
  );
}
