import React from 'react';
import { Twitter, Github, Instagram, Linkedin, Wand2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="logo-icon text-white">
              <Wand2 size={18} />
            </div>
            <span className="text-lg font-bold text-gradient">Background Remover</span>
          </div>
          <p className="text-sm text-secondary" style={{ lineHeight: 1.625 }}>
            Instantly remove backgrounds from your images using powerful AI tools, all directly in your browser.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-primary mb-8" style={{ marginBottom: '1rem' }}>Product</h4>
          <ul className="flex flex-col gap-2 text-sm text-secondary" style={{ padding: 0 }}>
            <li><a href="#" className="hover-link">Features</a></li>
            <li><a href="#" className="hover-link">Pricing</a></li>
            <li><a href="#" className="hover-link">API</a></li>
            <li><a href="#" className="hover-link">Integrations</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-primary mb-8" style={{ marginBottom: '1rem' }}>Resources</h4>
          <ul className="flex flex-col gap-2 text-sm text-secondary" style={{ padding: 0 }}>
            <li><a href="#" className="hover-link">Help Center</a></li>
            <li><a href="#" className="hover-link">Blog</a></li>
            <li><a href="#" className="hover-link">Tutorials</a></li>
            <li><a href="#" className="hover-link">Community</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-primary mb-8" style={{ marginBottom: '1rem' }}>Connect</h4>
          <div className="flex items-center gap-4">
            <a href="#" className="text-secondary hover-link"><Twitter size={20} /></a>
            <a href="#" className="text-secondary hover-link"><Github size={20} /></a>
            <a href="#" className="text-secondary hover-link"><Instagram size={20} /></a>
            <a href="#" className="text-secondary hover-link"><Linkedin size={20} /></a>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="footer-bottom text-sm text-secondary" style={{ flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
          <div className="flex items-center gap-4">
            <a href="#" className="hover-link">Privacy Policy</a>
            <a href="#" className="hover-link">Terms of Service</a>
          </div>
          <p style={{ textAlign: 'center' }}>
            © {new Date().getFullYear()} Background Remover. Made by <span className="font-bold text-gradient" style={{ fontSize: '1.2em' }}>Efron</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
