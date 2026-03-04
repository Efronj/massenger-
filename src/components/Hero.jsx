import React from 'react';
import UploadBox from './UploadBox';
import { motion } from 'framer-motion';

const Hero = ({ onFileUpload }) => {
  return (
    <section className="hero-section">
      {/* Background decorations */}
      <div className="decorative-blur decorative-blur-1"></div>
      <div className="decorative-blur decorative-blur-2"></div>

      <div className="container hero-content">
        <div className="text-center mb-16" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ fontSize: 'clamp(3rem, 8vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1 }}
            className="text-primary"
          >
            Remove Image Background <br className="hidden md:block" />
            <span className="text-gradient">Instantly</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-secondary mx-auto"
            style={{ maxWidth: '42rem', lineHeight: 1.6 }}
          >
            Upload your image and get a clean, high-quality transparent background in seconds. Powered by advanced AI for pixel-perfect edge detection.
          </motion.p>
        </div>

        <UploadBox onFileUpload={onFileUpload} />

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16 text-center text-sm text-secondary"
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}
        >
          <p>Trusted by millions of creators & developers worldwide</p>
          <div className="flex items-center justify-center gap-8" style={{ filter: 'grayscale(100%)', opacity: 0.5, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.25rem', letterSpacing: '-0.05em' }}>ACME Corp</span>
            <span style={{ fontWeight: 'bold', fontSize: '1.25rem', fontStyle: 'italic', letterSpacing: '0.05em' }}>Globex</span>
            <span style={{ fontWeight: 'bold', fontSize: '1.25rem', fontFamily: 'serif' }}>Soylent</span>
            <span style={{ fontWeight: 'bold', fontSize: '1.25rem', textTransform: 'uppercase' }}>Initech</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
