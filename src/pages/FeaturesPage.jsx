import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Features } from '../components/sections/Features';
import { CTA } from '../components/sections/CTA';
import { AmbientBackground } from '../components/ui/AmbientBackground';

export function FeaturesPage() {
  return (
    <>
      <AmbientBackground />
      <Navbar />
      
      <main className="pt-20">
        <Features />
        
        {/* Additional feature details could go here */}
        <CTA />
      </main>

      <Footer />
    </>
  );
}
