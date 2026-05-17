//import React, { useContext, useState, useEffect, useRef } from 'react';
//import { useNavigate } from 'react-router-dom';
//import AuthContext from '../../context/AuthContext';
//import { useTheme } from '../../context/ThemeContext';
//import branchApi from '../../api/branchApi';
//import {
//    FaBars,
//    FaMoon,
//    FaSun,
//    FaSignOutAlt,
//    FaChevronDown,
//    FaBuilding,
//    FaUserCircle,
//    FaBell,
//    FaSearch
//} from 'react-icons/fa';
//import { Button } from '../common';
//import './header.css';

//export default function Header() {
//    const { state, dispatch } = useContext(AuthContext);
//    const { theme, toggleTheme } = useTheme();
//    const navigate = useNavigate();

//    const [branches, setBranches] = useState([]);
//    const [showBranchSwitcher, setShowBranchSwitcher] = useState(false);
//    const [showUserMenu, setShowUserMenu] = useState(false);
//    const [showNotifications, setShowNotifications] = useState(false);
//    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//    const branchRef = useRef(null);
//    const userMenuRef = useRef(null);
//    const notificationRef = useRef(null);

//    const isSuperAdmin = state.user?.roleName?.toLowerCase() === 'superadmin';

//    useEffect(() => {
//        if (isSuperAdmin) {
//            loadAllBranches();
//        }
//    }, [isSuperAdmin]);

//    useEffect(() => {
//        const handleClickOutside = (e) => {
//            if (branchRef.current && !branchRef.current.contains(e.target)) {
//                setShowBranchSwitcher(false);
//            }
//            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
//                setShowUserMenu(false);
//            }
//            if (notificationRef.current && !notificationRef.current.contains(e.target)) {
//                setShowNotifications(false);
//            }
//        };

//        document.addEventListener('mousedown', handleClickOutside);
//        return () => document.removeEventListener('mousedown', handleClickOutside);
//    }, []);

//    const loadAllBranches = async () => {
//        try {
//            const res = await branchApi.getDropdown();
//            let branchesData = [];
//            if (res.data?.data && Array.isArray(res.data.data)) {
//                branchesData = res.data.data;
//            } else if (Array.isArray(res.data)) {
//                branchesData = res.data;
//            }
//            setBranches(branchesData);
//        } catch (error) {
//            console.error('Error loading branches:', error);
//        }
//    };

//    const handleBranchChange = (branchId) => {
//        if (state.selectedBranch === branchId) {
//            setShowBranchSwitcher(false);
//            return;
//        }

//        dispatch({
//            type: 'SWITCH_BRANCH',
//            payload: { branchID: branchId },
//        });

//        setShowBranchSwitcher(false);
//        window.location.reload();
//    };

//    const logout = () => {
//        dispatch({ type: 'LOGOUT' });
//        navigate('/login', { replace: true });
//    };

//    const getCurrentBranchName = () => {
//        const current = branches.find(b => b.branchID === state.selectedBranch);
//        return current?.branchName || 'Select Branch';
//    };

//    const getInitials = () => {
//        const name = state.user?.fullName || state.user?.username || 'User';
//        return name.charAt(0).toUpperCase();
//    };

//    const toggleMobileMenu = () => {
//        setMobileMenuOpen(!mobileMenuOpen);
//        // Trigger sidebar toggle
//        const event = new CustomEvent('toggleSidebar');
//        window.dispatchEvent(event);
//    };

//    return (
//        <header className="header">
//            {/* Left Section */}
//            <div className="header-left">
//                <button
//                    className="mobile-menu-btn"
//                    onClick={toggleMobileMenu}
//                    aria-label="Toggle menu"
//                >
//                    <FaBars />
//                </button>

//                <div className="header-logo">
//                    <span className="logo-text">WMS</span>
//                </div>
//            </div>

//            {/* Center Section - Search */}
//            <div className="header-center">
//                <div className="search-container">
//                    <FaSearch className="search-icon" />
//                    <input
//                        type="text"
//                        placeholder="Search..."
//                        className="search-input"
//                    />
//                </div>
//            </div>

//            {/* Right Section */}
//            <div className="header-right">
//                {/* Notifications */}
//                <div className="notification-container" ref={notificationRef}>
//                    <button
//                        className="header-icon-btn"
//                        onClick={() => setShowNotifications(!showNotifications)}
//                        aria-label="Notifications"
//                    >
//                        <FaBell />
//                        <span className="notification-badge">3</span>
//                    </button>

//                    {showNotifications && (
//                        <div className="notification-dropdown">
//                            <div className="notification-header">
//                                <h4>Notifications</h4>
//                                <button className="mark-read">Mark all read</button>
//                            </div>
//                            <div className="notification-list">
//                                <div className="notification-item unread">
//                                    <div className="notification-icon">📦</div>
//                                    <div className="notification-content">
//                                        <p>New purchase order created</p>
//                                        <span>5 minutes ago</span>
//                                    </div>
//                                </div>
//                                <div className="notification-item">
//                                    <div className="notification-icon">💰</div>
//                                    <div className="notification-content">
//                                        <p>Payment received - INV-001</p>
//                                        <span>1 hour ago</span>
//                                    </div>
//                                </div>
//                                <div className="notification-item">
//                                    <div className="notification-icon">📊</div>
//                                    <div className="notification-content">
//                                        <p>Monthly report is ready</p>
//                                        <span>Yesterday</span>
//                                    </div>
//                                </div>
//                            </div>
//                            <div className="notification-footer">
//                                <button>View all notifications</button>
//                            </div>
//                        </div>
//                    )}
//                </div>

//                {/* Branch Switcher (SuperAdmin Only) */}
//                {isSuperAdmin && (
//                    <div className="branch-switcher" ref={branchRef}>
//                        <button
//                            className="branch-btn"
//                            onClick={() => setShowBranchSwitcher(!showBranchSwitcher)}
//                        >
//                            <FaBuilding className="branch-icon" />
//                            <span className="branch-name">{getCurrentBranchName()}</span>
//                            <FaChevronDown className={`branch-arrow ${showBranchSwitcher ? 'rotate' : ''}`} />
//                        </button>

//                        {showBranchSwitcher && (
//                            <div className="branch-dropdown">
//                                <div className="branch-dropdown-header">
//                                    Switch Branch
//                                </div>
//                                <div className="branch-list">
//                                    {branches.map((branch) => (
//                                        <div
//                                            key={branch.branchID}
//                                            className={`branch-item ${branch.branchID === state.selectedBranch ? 'active' : ''}`}
//                                            onClick={() => handleBranchChange(branch.branchID)}
//                                        >
//                                            <FaBuilding className="branch-item-icon" />
//                                            <span>{branch.branchName}</span>
//                                            {branch.branchID === state.selectedBranch && (
//                                                <span className="active-indicator">✓</span>
//                                            )}
//                                        </div>
//                                    ))}
//                                </div>
//                            </div>
//                        )}
//                    </div>
//                )}

//                {/* Theme Toggle */}
//                <button
//                    className="header-icon-btn"
//                    onClick={toggleTheme}
//                    aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
//                >
//                    {theme === 'light' ? <FaMoon /> : <FaSun />}
//                </button>

//                {/* User Menu */}
//                <div className="user-menu" ref={userMenuRef}>
//                    <button
//                        className="user-menu-btn"
//                        onClick={() => setShowUserMenu(!showUserMenu)}
//                    >
//                        <div className="user-avatar-small">
//                            {getInitials()}
//                        </div>
//                        <span className="user-name">{state.user?.fullName?.split(' ')[0] || 'User'}</span>
//                        <FaChevronDown className={`user-arrow ${showUserMenu ? 'rotate' : ''}`} />
//                    </button>

//                    {showUserMenu && (
//                        <div className="user-dropdown">
//                            <div className="user-info">
//                                <div className="user-avatar-large">
//                                    {getInitials()}
//                                </div>
//                                <div className="user-details">
//                                    <div className="user-fullname">{state.user?.fullName || 'User'}</div>
//                                    <div className="user-email">{state.user?.email || 'user@example.com'}</div>
//                                    <div className="user-role">{state.user?.roleName || 'Role'}</div>
//                                </div>
//                            </div>

//                            <div className="dropdown-divider"></div>

//                            <div className="dropdown-section">
//                                <button className="dropdown-item" onClick={() => navigate('/profile')}>
//                                    <FaUserCircle />
//                                    <span>My Profile</span>
//                                </button>
//                            </div>

//                            <div className="dropdown-divider"></div>

//                            <div className="dropdown-section">
//                                <button className="dropdown-item logout" onClick={logout}>
//                                    <FaSignOutAlt />
//                                    <span>Logout</span>
//                                </button>
//                            </div>
//                        </div>
//                    )}
//                </div>
//            </div>
//        </header>
//    );
//}