import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
import { useTheme } from '../../../context/ThemeContext';
import './Layout.css';

const Layout = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        if (window.innerWidth < 768) return false;
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved === 'true';
    });

    const { theme } = useTheme();
    const location = useLocation();

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
    }, [sidebarCollapsed]);

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    // Listen for collapse toggle from sidebar
    useEffect(() => {
        const handleToggleCollapse = () => {
            setSidebarCollapsed(prev => !prev);
        };
        window.addEventListener('toggleSidebarCollapse', handleToggleCollapse);
        return () => window.removeEventListener('toggleSidebarCollapse', handleToggleCollapse);
    }, []);

    return (
        <div
            className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
            data-theme={theme}
        >
            <Header onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

            <div className="layout-container">
                <Sidebar
                    isMobileOpen={mobileMenuOpen}
                    collapsed={sidebarCollapsed}
                    onClose={() => setMobileMenuOpen(false)}
                />

                {mobileMenuOpen && (
                    <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />
                )}

                <main className="main-content">
                    <div className="content-wrapper">
                        <Outlet />
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    );
};

export default Layout;