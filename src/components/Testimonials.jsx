import React from 'react';

const Testimonials = () => {
    const reviews = [
        {
            name: "Sarah Jenkins",
            role: "E-commerce Store Owner",
            content: "This tool is a lifesaver. I process hundreds of product photos weekly, and the accuracy is phenomenal. Best of all, it's fast!",
            initials: "SJ",
            color: "bg-blue"
        },
        {
            name: "David Chen",
            role: "Graphic Designer",
            content: "I've tried Photoshop and other AI tools, but the edge detection on hair and fine details here is unmatched. My go-to tool.",
            initials: "DC",
            color: "bg-purple"
        },
        {
            name: "Emma Watson",
            role: "Social Media Manager",
            content: "Creating thumbnails and social posts is so much easier now. Taking out the background is literally a one-click process.",
            initials: "EW",
            color: "bg-pink"
        }
    ];

    return (
        <section id="testimonials" className="py-24" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Decorative Blur */}
            <div className="decorative-blur decorative-blur-1" style={{ top: '50%', left: '0', transform: 'translate(-50%, -50%)' }}></div>

            <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                <div className="text-center mb-16" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h2 className="text-sm font-bold text-indigo" style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Testimonials</h2>
                    <h3 className="text-3xl font-bold text-primary" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Loved by Creators</h3>
                </div>

                <div className="grid grid-cols-3 gap-8">
                    {reviews.map((review, index) => (
                        <div key={index} className="glass-panel testimonial-card">
                            <div className="quote-mark">"</div>
                            <p className="text-secondary" style={{ fontStyle: 'italic', marginBottom: '2rem', position: 'relative', zIndex: 10, paddingTop: '1rem', lineHeight: 1.625 }}>
                                "{review.content}"
                            </p>

                            <div className="flex items-center gap-4">
                                <div className={`avatar ${review.color}`}>
                                    {review.initials}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-primary">{review.name}</h4>
                                    <p className="text-xs text-secondary">{review.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
