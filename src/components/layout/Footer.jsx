import React from 'react';
import { Hexagon } from 'lucide-react';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#" className="brand">
              <Hexagon className="brand-icon" size={24} />
              <span>Nexus</span>
            </a>
            <p>The operating system for AI agents.</p>
          </div>
          <div className="footer-links">
            <h4>Product</h4>
            <a href="#">Features</a>
            <a href="#">Integrations</a>
            <a href="#">Pricing</a>
            <a href="#">Changelog</a>
          </div>
          <div className="footer-links">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Blog</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-links">
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Security</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Nexus AI Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
