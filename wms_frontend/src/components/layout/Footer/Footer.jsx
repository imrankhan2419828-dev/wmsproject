import React from 'react';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-left">
                    <span className="footer-text">
                        © {currentYear} WMS. All rights reserved.
                    </span>
                </div>

                <div className="footer-right">
                    <span className="footer-version">v1.0.0</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;