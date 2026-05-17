//import { useState, useEffect } from "react";
//import { Outlet, useLocation } from "react-router-dom";
//import Sidebar from "../components/Sidebar/Sidebar";
//import Header from "../components/Header/Header";
//import "./MainLayout.css";

//export default function MainLayout() {
//    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//    const location = useLocation();

//    // Close mobile menu on route change
//    useEffect(() => {
//        setIsMobileMenuOpen(false);
//    }, [location.pathname]);

//    // Prevent body scroll when mobile menu is open
//    useEffect(() => {
//        if (isMobileMenuOpen) {
//            document.body.style.overflow = 'hidden';
//        } else {
//            document.body.style.overflow = '';
//        }
//        return () => {
//            document.body.style.overflow = '';
//        };
//    }, [isMobileMenuOpen]);

//    const toggleMobileMenu = () => {
//        setIsMobileMenuOpen(!isMobileMenuOpen);
//    };

//    const closeMobileMenu = () => {
//        setIsMobileMenuOpen(false);
//    };

//    return (
//        <div className="main-layout">
//            <Sidebar
//                isMobileOpen={isMobileMenuOpen}
//                onClose={closeMobileMenu}
//            />

//            <div className="main-content">
//                <Header onMenuToggle={toggleMobileMenu} />

//                <main className="page-content">
//                    <Outlet />
//                </main>
//            </div>
//        </div>
//    );
//}