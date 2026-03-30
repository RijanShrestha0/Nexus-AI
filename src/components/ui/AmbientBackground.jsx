import React from 'react';

export const AmbientBackground = () => {
  return (
    <div className="ambient-background" style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden', background: 'transparent' }}>
      {/* Intense Right-Side Color Focus */}
      <div className="glow-node right-anchor" style={{ 
        position: 'absolute', top: '10%', right: '-15%', width: '80vw', height: '80vw', 
        background: 'radial-gradient(circle, var(--blob-2) 0%, transparent 70%)', 
        filter: 'blur(100px)', animation: 'drift-vibrant-right 30s infinite alternate', mixBlendMode: 'screen'
      }} />
      
      <div className="glow-node right-bottom-anchor" style={{ 
        position: 'absolute', bottom: '-10%', right: '5%', width: '60vw', height: '60vw', 
        background: 'radial-gradient(circle, var(--blob-4) 0%, transparent 75%)', 
        filter: 'blur(80px)', animation: 'drift-vibrant 25s infinite alternate-reverse', mixBlendMode: 'screen'
      }} />

      {/* Persistent Left-Side Balance */}
      <div className="glow-node left-anchor" style={{ 
        position: 'absolute', top: '-10%', left: '-10%', width: '70vw', height: '70vw', 
        background: 'radial-gradient(circle, var(--blob-1) 0%, transparent 80%)', 
        filter: 'blur(90px)', animation: 'drift-vibrant-rev 35s infinite alternate', mixBlendMode: 'screen'
      }} />

      <div className="glow-node center-anchor" style={{ 
        position: 'absolute', top: '30%', left: '30%', width: '50vw', height: '50vw', 
        background: 'radial-gradient(circle, var(--blob-3) 0%, transparent 85%)', 
        filter: 'blur(110px)', animation: 'drift-vibrant-slow 45s infinite alternate', mixBlendMode: 'screen'
      }} />

      {/* Global Theme-Aware Vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'var(--blob-vignette)', pointerEvents: 'none' }} />

      <style>{`
        @keyframes drift-vibrant-right {
          0% { transform: translate(5%, -5%) scale(1.1) rotate(0deg); opacity: 0.8; }
          50% { transform: translate(-10%, 15%) scale(1.3) rotate(45deg); opacity: 1; }
          100% { transform: translate(10%, -10%) scale(0.9) rotate(-30deg); opacity: 0.7; }
        }
        @keyframes drift-vibrant {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.7; }
          50% { transform: translate(10%, 15%) scale(1.1) rotate(60deg); opacity: 1; }
          100% { transform: translate(-5%, -10%) scale(0.9) rotate(-30deg); opacity: 0.6; }
        }
        @keyframes drift-vibrant-rev {
          0% { transform: translate(0, 0) scale(1.1) rotate(0deg); opacity: 0.6; }
          100% { transform: translate(-10%, 15%) scale(0.8) rotate(-90deg); opacity: 0.9; }
        }
        @keyframes drift-vibrant-slow {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-8%, 12%) scale(1.3); }
        }
        .glow-node {
          pointer-events: none;
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  );
};
