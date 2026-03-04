import React, { useState } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import ResultView from '../components/ResultView';

const Home = () => {
    const [images, setImages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileUpload = async (files) => {
        const fileArray = Array.from(files).map(file => ({
            file,
            url: URL.createObjectURL(file),
            originalName: file.name
        }));

        setImages(fileArray);
        setIsProcessing(true);

        try {
            // Import dynamically to avoid SSR issues if this ever becomes a Next.js app, 
            // and to keep initial bundle size smaller.
            const { removeBackground } = await import('@imgly/background-removal');

            const config = {
                model: "isnet_fp16", // Higher quality model
                output: {
                    format: "image/png",
                    quality: 1
                }
            };

            const processedImages = await Promise.all(fileArray.map(async (imgObj) => {
                const blob = await removeBackground(imgObj.url, config);
                const resultUrl = URL.createObjectURL(blob);
                return {
                    ...imgObj,
                    resultUrl // Add the processed URL
                };
            }));

            setImages(processedImages);
        } catch (error) {
            console.error("Error removing background:", error);
            alert("Failed to remove background. Please try again.");
            setImages([]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        images.forEach(img => URL.revokeObjectURL(img.url));
        setImages([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="w-full">
            {images.length === 0 ? (
                <>
                    <Hero onFileUpload={handleFileUpload} />
                    <Features />
                    <HowItWorks />
                    <Pricing />
                </>
            ) : (
                <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', paddingTop: '3rem' }}>
                    {isProcessing ? (
                        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
                            <div style={{ position: 'relative', width: '8rem', height: '8rem', marginBottom: '2rem' }}>
                                <div style={{ position: 'absolute', inset: 0, border: '4px solid var(--card-border)', borderRadius: '50%' }}></div>
                                <div className="animate-spin" style={{ position: 'absolute', inset: 0, border: '4px solid #6366f1', borderRadius: '50%', borderTopColor: 'transparent' }}></div>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="text-2xl font-bold text-gradient">
                                        AI
                                    </span>
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold animate-pulse text-primary mb-8" style={{ marginBottom: '0.75rem' }}>Removing Background...</h2>
                            <p className="text-lg text-secondary">Using AI magic to perfectly detect edges.</p>
                        </div>
                    ) : (
                        <ResultView images={images} onReset={handleReset} />
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;
