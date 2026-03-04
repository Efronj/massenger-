import React from 'react';
import { Upload, Cpu, Download } from 'lucide-react';

const HowItWorks = () => {
    const steps = [
        {
            number: "01",
            icon: <Upload size={24} />,
            title: "Upload Image",
            description: "Drag and drop or select an image from your device."
        },
        {
            number: "02",
            icon: <Cpu size={24} />,
            title: "AI Processing",
            description: "Our advanced AI instantly detects the subject and removes the background."
        },
        {
            number: "03",
            icon: <Download size={24} />,
            title: "Download Result",
            description: "Save your image as a transparent PNG or add a custom background."
        }
    ];

    return (
        <section id="how-it-works" className="py-24" style={{ background: 'rgba(30, 41, 59, 0.3)' }}>
            <div className="container">
                <div className="text-center mb-16" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h2 className="text-sm font-bold text-pink" style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>How it Works</h2>
                    <h3 className="text-3xl font-bold text-primary" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>As Easy as 1-2-3</h3>
                </div>

                <div className="grid grid-cols-3 gap-8" style={{ position: 'relative', maxWidth: '64rem', margin: '0 auto' }}>
                    {/* Connector Line for Desktop */}
                    <div className="md-hidden" style={{ position: 'absolute', top: '40%', left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent)', zIndex: 0 }}></div>

                    {steps.map((step, index) => (
                        <div key={index} className="flex-col items-center text-center" style={{ position: 'relative', zIndex: 10 }}>
                            <div className="step-circle">
                                {step.icon}
                            </div>
                            <h4 className="text-xl font-bold text-primary" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                <span className="text-sm text-indigo">{step.number}.</span>
                                {step.title}
                            </h4>
                            <p className="text-secondary mx-auto" style={{ width: '80%', lineHeight: 1.625 }}>{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
