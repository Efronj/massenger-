import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children, isDarkMode, toggleTheme }) => {
    return (
        <div className="flex flex-col" style={{ minHeight: '100vh' }}>
            <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
            <main style={{ flexGrow: 1, paddingTop: '5rem' }}>
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
