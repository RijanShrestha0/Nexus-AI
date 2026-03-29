import React from 'react';

// Layout
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

// Sections
import { Hero } from '../components/sections/Hero';
import { Features } from '../components/sections/Features';
import { CTA } from '../components/sections/CTA';

// UI
import { AmbientBackground } from '../components/ui/AmbientBackground';

export function Home() {
  return (
    <>
      <AmbientBackground />
      <Navbar />
      
      <main>
        <Hero />
        <Features />
        <CTA />
      </main>

      <Footer />
    </>
  );
}
