import React from 'react';
import { Moon, Sun, Wand2, Menu } from 'lucide-react';

const Navbar = ({ isDarkMode, toggleTheme }) => {
    return (
        <nav className="navbar glass-panel" style={{ borderRadius: 0, borderLeft: 0, borderRight: 0, borderTop: 0 }}>
            <div className="container navbar-inner">
                {/* Logo */}
                <div className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                    <div className="logo-icon">
                        <Wand2 size={24} />
                    </div>
                    <span className="text-xl font-bold text-gradient">
                        Background Remover
                    </span>
                </div>

                {/* Desktop Links */}
                <div className="nav-links">
                    <a href="#features" className="text-sm font-semibold hover-link">Features</a>
                    <a href="#how-it-works" className="text-sm font-semibold hover-link">How it Works</a>
                    <a href="#testimonials" className="text-sm font-semibold hover-link">Testimonials</a>
                    <a href="#pricing" className="text-sm font-semibold hover-link">Pricing</a>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        style={{ padding: '0.5rem', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer' }}
                        aria-label="Toggle Theme"
                    >
                        {isDarkMode ? <Sun size={20} style={{ color: '#fbbf24' }} /> : <Moon size={20} style={{ color: '#334155' }} />}
                    </button>

                    <button className="btn btn-primary text-sm md-hidden">
                        Get Started
                    </button>

                    <button className="md-hidden" style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)' }}>
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
