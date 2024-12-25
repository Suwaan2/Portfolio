import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Work } from './components/Work';
import { About } from './components/About';
import { Contact } from './components/Contact';

function App() {
  return (
    <div className="bg-navy-900 min-h-screen">
      <Navbar />
      <Hero />
      <Work />
      <About />
      <Contact />
    </div>
  );
}

export default App;