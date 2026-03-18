import React from 'react';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';

export default function App() {
  return (
    <div className="app">
      <NavBar />
      <Home />
      <Footer />
    </div>
  );
}
