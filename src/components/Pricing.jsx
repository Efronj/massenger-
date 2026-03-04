import React from 'react';
import { Check } from 'lucide-react';

const Pricing = () => {
    const features = [
        "Unlimited background removals",
        "High-resolution downloads",
        "Batch processing up to 50 images",
        "API access",
        "Email support",
        "No watermarks"
    ];

    return (
        <section id="pricing" className="py-24" style={{ background: 'rgba(30, 41, 59, 0.3)' }}>
            <div className="container" style={{ padding: '0 1.5rem', margin: '0 auto' }}>
                <div className="text-center mb-16" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h2 className="text-sm font-bold text-pink" style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Pricing</h2>
                    <h3 className="text-3xl font-bold text-primary" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Simple, Transparent Pricing</h3>
                </div>

                <div className="pricing-card-wrapper">
                    <div className="pricing-glow"></div>

                    <div className="glass-panel pricing-card" style={{ position: 'relative', zIndex: 10 }}>
                        <div className="text-center mb-8">
                            <h4 className="text-2xl font-bold text-primary" style={{ marginBottom: '0.5rem' }}>Pro Plan</h4>
                            <div className="flex items-center justify-center gap-2" style={{ alignItems: 'flex-end' }}>
                                <span className="text-5xl font-bold text-primary">$0</span>
                                <span className="text-secondary" style={{ marginBottom: '0.25rem' }}>/ forever</span>
                            </div>
                            <p className="text-secondary" style={{ marginTop: '1rem' }}>Everything you need, completely free during beta.</p>
                        </div>

                        <ul className="mb-8" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: 0 }}>
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-4 text-secondary">
                                    <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button className="btn btn-primary w-full" style={{ padding: '1rem', fontSize: '1.125rem' }}>
                            Get Started for Free
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Pricing;
