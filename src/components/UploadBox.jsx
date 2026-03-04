import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const UploadBox = ({ onFileUpload }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileUpload(e.dataTransfer.files);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileUpload(e.target.files);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`glass-panel upload-box ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex flex-col items-center justify-center text-center gap-6">
                <div className="upload-icon">
                    <UploadCloud size={48} strokeWidth={1.5} />
                </div>

                <div className="flex flex-col gap-2">
                    <h3 className="text-2xl font-semibold text-primary">
                        Drag & drop an image here
                    </h3>
                    <p className="text-secondary">
                        or click below to browse your files
                    </p>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/png, image/jpeg, image/webp"
                    multiple
                    onChange={handleFileChange}
                />

                <button
                    onClick={() => fileInputRef.current.click()}
                    className="btn btn-primary"
                    style={{ padding: '1rem 2rem', fontSize: '1.125rem', width: '100%', maxWidth: '20rem' }}
                >
                    <ImageIcon size={20} />
                    Upload Image
                </button>

                <div className="text-xs text-secondary mt-4 flex items-center justify-center gap-2" style={{ flexWrap: 'wrap' }}>
                    <span>Supports: JPG, PNG, WEBP</span>
                    <span className="md-hidden">•</span>
                    <span>Max Size: 20MB</span>
                    <span className="md-hidden">•</span>
                    <span>Batch Upload Support</span>
                </div>
            </div>
        </motion.div>
    );
};

export default UploadBox;
