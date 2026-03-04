import React from 'react';
import { Zap, Target, Heart } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Zap size={32} style={{ color: '#eab308' }} />,
      title: "Lightning Fast",
      description: "Get transparent backgrounds in under 5 seconds. Our optimized architecture ensures you never wait for your images."
    },
    {
      icon: <Target size={32} style={{ color: '#ec4899' }} />,
      title: "Pixel-Perfect Accuracy",
      description: "Advanced AI models detect even the finest details like hair, fur, and complex edges with unparalleled precision."
    },
    {
      icon: <Heart size={32} style={{ color: '#6366f1' }} />,
      title: "100% Free Forever",
      description: "No hidden fees, no watermarks, no subscriptions. Enjoy unlimited high-quality background removals completely free."
    }
  ];

  return (
    <section id="features" className="py-24" style={{ position: 'relative' }}>
      <div className="container">
        <div className="text-center mb-16" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 className="text-sm font-bold text-indigo" style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Features</h2>
          <h3 className="text-3xl font-bold text-primary" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Built for Professionals</h3>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="glass-panel feature-card flex-col items-center">
              <div className="feature-icon-wrapper">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-primary mb-8" style={{ marginBottom: '0.75rem' }}>{feature.title}</h4>
              <p className="text-secondary" style={{ lineHeight: 1.625 }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
