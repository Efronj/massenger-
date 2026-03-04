import React from 'react';

export function Button({
    className = '',
    variant = 'primary',
    size = 'md',
    children,
    ...props
}) {
    const getStyles = () => {
        let styles = {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '9999px',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit'
        };

        // Variants
        if (variant === 'primary') {
            styles = { ...styles, backgroundColor: 'var(--primary)', color: 'white' };
            styles.boxShadow = '0 0 20px rgba(168, 85, 247, 0.4)';
        } else if (variant === 'secondary') {
            styles = {
                ...styles,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            };
        } else if (variant === 'outline') {
            styles = {
                ...styles,
                backgroundColor: 'transparent',
                border: '1px solid var(--primary)',
                color: 'var(--primary)'
            };
        } else if (variant === 'ghost') {
            styles = {
                ...styles,
                backgroundColor: 'transparent',
                color: 'rgba(255, 255, 255, 0.7)'
            };
        } else if (variant === 'blue') {
            styles = {
                ...styles,
                backgroundColor: 'var(--primary-blue)',
                color: 'white',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
            };
        }

        // Sizes
        if (size === 'sm') {
            styles = { ...styles, padding: '0.375rem 1rem', fontSize: '0.875rem' };
        } else if (size === 'md') {
            styles = { ...styles, padding: '0.625rem 1.5rem', fontSize: '1rem' };
        } else if (size === 'lg') {
            styles = { ...styles, padding: '0.875rem 2rem', fontSize: '1.125rem' };
        }

        return styles;
    };

    return (
        <button
            style={getStyles()}
            className={`btn ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
