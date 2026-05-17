import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import branchApi from '../../../api/branchApi';
import {
    FaBars, FaMoon, FaSun, FaSignOutAlt, FaChevronDown,
    FaBuilding, FaUserCircle, FaUser, FaKey, FaCog
} from 'react-icons/fa';
import './Header.css';

export default function Header({ onMenuToggle }) {
    const { state, dispatch } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [branches, setBranches] = useState([]);
    const [showBranchSwitcher, setShowBranchSwitcher] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const branchRef = useRef(null);
    const userMenuRef = useRef(null);

    const isSuperAdmin = state.user?.roleName?.toLowerCase() === 'superadmin';

    useEffect(() => {
        if (isSuperAdmin) {
            loadAllBranches();
        }
    }, [isSuperAdmin]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (branchRef.current && !branchRef.current.contains(e.target)) {
                setShowBranchSwitcher(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadAllBranches = async () => {
        try {
            const res = await branchApi.getDropdown();
            let branchesData = res.data?.data || res.data || [];
            setBranches(Array.isArray(branchesData) ? branchesData : []);
        } catch (error) {
            console.error('Error loading branches:', error);
        }
    };

    const handleBranchChange = (branchId) => {
        if (state.selectedBranch !== branchId) {
            dispatch({ type: 'SWITCH_BRANCH', payload: { branchID: branchId } });
            window.dispatchEvent(new CustomEvent('branchChanged', { detail: { branchId } }));
        }
        setShowBranchSwitcher(false);
    };

    const logout = () => {
        dispatch({ type: 'LOGOUT' });
        localStorage.removeItem('selectedBranch');
        navigate('/login', { replace: true });
    };

    const goToProfile = () => { setShowUserMenu(false); navigate('/profile'); };
    const goToChangePassword = () => { setShowUserMenu(false); navigate('/change-password'); };
    const goToSettings = () => { setShowUserMenu(false); navigate('/settings'); };

    const getCurrentBranchName = () => {
        const current = branches.find(b => b.branchID === state.selectedBranch);
        return current?.branchName || 'Select Branch';
    };

    const getInitials = () => {
        const name = state.user?.fullName || state.user?.username || 'User';
        return name.charAt(0).toUpperCase();
    };

    const getDisplayName = () => {
        return state.user?.fullName?.split(' ')[0] || state.user?.username || 'User';
    };

    return (
        <header className="header">
            <div className="header-left">
                <button className="mobile-menu-btn" onClick={onMenuToggle} aria-label="Toggle menu">
                    <FaBars />
                </button>
            </div>

            <div className="header-right">
                {isSuperAdmin && (
                    <div className="branch-switcher" ref={branchRef}>
                        <button className="branch-btn" onClick={() => setShowBranchSwitcher(!showBranchSwitcher)}>
                            <FaBuilding className="branch-icon" />
                            <span className="branch-name">{getCurrentBranchName()}</span>
                            <FaChevronDown className={`branch-arrow ${showBranchSwitcher ? 'rotate' : ''}`} />
                        </button>

                        {showBranchSwitcher && (
                            <div className="branch-dropdown">
                                <div className="branch-dropdown-header">Switch Branch</div>
                                <div className="branch-list">
                                    {branches.length === 0 ? (
                                        <div className="branch-item empty">No branches found</div>
                                    ) : (
                                        branches.map(branch => (
                                            <div
                                                key={branch.branchID}
                                                className={`branch-item ${branch.branchID === state.selectedBranch ? 'active' : ''}`}
                                                onClick={() => handleBranchChange(branch.branchID)}
                                            >
                                                <FaBuilding className="branch-item-icon" />
                                                <span>{branch.branchName}</span>
                                                {branch.branchID === state.selectedBranch && <span className="active-indicator">✓</span>}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <button className="header-icon-btn" onClick={toggleTheme}>
                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                </button>

                <div className="user-menu" ref={userMenuRef}>
                    <button className="user-menu-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                        <div className="user-avatar-small">{getInitials()}</div>
                        <span className="user-name">{getDisplayName()}</span>
                        <FaChevronDown className={`user-arrow ${showUserMenu ? 'rotate' : ''}`} />
                    </button>

                    {showUserMenu && (
                        <div className="user-dropdown">
                            <div className="user-info">
                                <div className="user-avatar-large">{getInitials()}</div>
                                <div className="user-details">
                                    <div className="user-fullname">{state.user?.fullName || 'User'}</div>
                                    <div className="user-email">{state.user?.email || ''}</div>
                                    <div className="user-role">{state.user?.roleName || 'Role'}</div>
                                </div>
                            </div>
                            <div className="dropdown-divider"></div>
                            <div className="dropdown-section">
                                <button className="dropdown-item" onClick={goToProfile}><FaUser /><span>My Profile</span></button>
                                <button className="dropdown-item" onClick={goToChangePassword}><FaKey /><span>Change Password</span></button>
                                <button className="dropdown-item" onClick={goToSettings}><FaCog /><span>Settings</span></button>
                            </div>
                            <div className="dropdown-divider"></div>
                            <div className="dropdown-section">
                                <button className="dropdown-item logout" onClick={logout}><FaSignOutAlt /><span>Logout</span></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}