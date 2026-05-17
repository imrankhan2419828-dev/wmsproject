import React, { useContext, useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../../../context/AuthContext';
import {
    FaChevronDown, FaEllipsisH, FaHome, FaCog, FaCode, FaEdit, FaChartBar,
    FaTools, FaBoxes, FaShoppingCart, FaUndo, FaMoneyBill, FaTruck, FaUsers,
    FaBuilding, FaChartPie, FaFileInvoice, FaWarehouse, FaWrench, FaCar,
    FaCalendarAlt, FaClipboardList, FaClock, FaSearch, FaBell, FaShieldAlt,
    FaTags, FaFileAlt, FaBalanceScale, FaExchangeAlt, FaBook, FaIndustry,
    FaBox, FaCreditCard, FaChartLine, FaUserCog, FaKey, FaLayerGroup, FaList, FaCircle,
    FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import './Sidebar.css';

export default function Sidebar({ isMobileOpen, collapsed, onClose }) {
    const { state } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const [openSections, setOpenSections] = useState({});
    const [openMenus, setOpenMenus] = useState({});
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const menus = state?.menus || [];

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Tooltip positioning - Cursor ke paas
    useEffect(() => {
        const positionTooltips = () => {
            const items = document.querySelectorAll('.menu-link, .section-header, .footer-collapsed');
            items.forEach(item => {
                const tooltip = item.querySelector('.menu-tooltip, .section-tooltip, .footer-tooltip');
                if (!tooltip) return;

                item.addEventListener('mouseenter', (e) => {
                    const rect = item.getBoundingClientRect();
                    tooltip.style.left = (rect.right + 12) + 'px';
                    tooltip.style.top = (rect.top + rect.height / 2) + 'px';
                    tooltip.style.transform = 'translateY(-50%)';
                });
            });
        };
        setTimeout(positionTooltips, 100);
        const observer = new MutationObserver(positionTooltips);
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) observer.observe(sidebar, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [openMenus, openSections, collapsed]);

    const getIconFromEmoji = (menuName, menuPath, emoji) => {
        const name = (menuName || '').toLowerCase();
        const path = (menuPath || '').toLowerCase();
        if (path.includes('dashboard')) return <FaHome />;
        if (path.includes('users')) return <FaUsers />;
        if (path.includes('role')) return <FaKey />;
        if (path.includes('branch')) return <FaBuilding />;
        if (path.includes('coa')) return <FaBook />;
        if (path.includes('company')) return <FaIndustry />;
        if (path.includes('category')) return <FaTags />;
        if (path.includes('item')) return <FaBox />;
        if (path.includes('godown')) return <FaWarehouse />;
        if (path.includes('subcategory')) return <FaLayerGroup />;
        if (path.includes('purchase') && !path.includes('return')) return <FaShoppingCart />;
        if (path.includes('purchase-return')) return <FaUndo />;
        if (path.includes('sales') && !path.includes('return')) return <FaChartBar />;
        if (path.includes('sales-return')) return <FaExchangeAlt />;
        if (path.includes('payment')) return <FaMoneyBill />;
        if (path.includes('receiving')) return <FaTruck />;
        if (path.includes('postdated') || path.includes('cheque')) return <FaCalendarAlt />;
        if (path.includes('report')) return <FaChartPie />;
        if (path.includes('supplier') && path.includes('balancing')) return <FaBalanceScale />;
        if (path.includes('stock')) return <FaBoxes />;
        if (path.includes('form-detail')) return <FaList />;
        if (path.includes('workshop')) return <FaWrench />;
        if (path.includes('vehicle')) return <FaCar />;
        if (path.includes('service')) return <FaTools />;
        if (path.includes('technician')) return <FaUserCog />;
        if (path.includes('job-card')) return <FaClipboardList />;
        if (path.includes('booking')) return <FaCalendarAlt />;
        if (path.includes('time')) return <FaClock />;
        if (path.includes('inspection')) return <FaSearch />;
        if (path.includes('notification')) return <FaBell />;
        if (path.includes('template')) return <FaFileAlt />;
        if (path.includes('preference')) return <FaCog />;
        if (path.includes('warranty')) return <FaShieldAlt />;
        if (path.includes('department')) return <FaUsers />;
        if (path.includes('vouch')) return <FaFileInvoice />;

        const iconMap = {
            '📊': <FaChartBar />, '📈': <FaChartLine />, '📉': <FaChartPie />, '👥': <FaUsers />,
            '🔐': <FaShieldAlt />, '🏢': <FaBuilding />, '⚙️': <FaCog />, '📒': <FaBook />,
            '🏭': <FaIndustry />, '📑': <FaFileAlt />, '📦': <FaBox />, '🔖': <FaTags />,
            '🛒': <FaShoppingCart />, '↩️': <FaUndo />, '💰': <FaMoneyBill />, '🔄': <FaExchangeAlt />,
            '💳': <FaCreditCard />, '📥': <FaTruck />, '📅': <FaCalendarAlt />, '⚖️': <FaBalanceScale />,
            '🔧': <FaWrench />, '🚗': <FaCar />, '🛠️': <FaTools />, '👨‍🔧': <FaUserCog />,
            '📋': <FaClipboardList />, '⏱️': <FaClock />, '🔍': <FaSearch />, '🔔': <FaBell />,
            '📝': <FaEdit />, '🛡️': <FaShieldAlt />, '🤝': <FaUsers />, '📄': <FaFileAlt />
        };
        return iconMap[emoji] || <FaCircle />;
    };

    const categoryIcons = {
        'Main': <FaHome />, 'System Section': <FaCog />, 'Coding Section': <FaCode />,
        'Entry Section': <FaEdit />, 'Reporting Section': <FaChartPie />, 'Workshop': <FaWrench />,
        'Inventory': <FaBoxes />, 'Accounting': <FaMoneyBill />, 'Other': <FaEllipsisH />
    };

    const groupedMenus = menus.reduce((acc, menu) => {
        if (!menu.parentID) {
            const category = menu.menuCategory || 'Other';
            if (!acc[category]) acc[category] = [];
            acc[category].push(menu);
        }
        return acc;
    }, {});

    const categoryOrder = ['Main', 'System Section', 'Coding Section', 'Entry Section', 'Reporting Section', 'Workshop', 'Inventory', 'Accounting', 'Other'];
    const sortedCategories = Object.keys(groupedMenus).sort((a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b));

    useEffect(() => {
        const activePath = location.pathname.replace('/', '');
        const findAndOpenParents = (items, parentId = null) => {
            for (const item of items) {
                if (item.menuPath === activePath) {
                    if (parentId) setOpenMenus(prev => ({ ...prev, [parentId]: true }));
                    return true;
                }
                if (item.children?.length && findAndOpenParents(item.children, item.menuID)) {
                    setOpenMenus(prev => ({ ...prev, [item.menuID]: true }));
                    return true;
                }
            }
            return false;
        };
        sortedCategories.forEach(cat => { if (findAndOpenParents(groupedMenus[cat])) setOpenSections(prev => ({ ...prev, [cat]: true })); });
    }, [location.pathname]);

    useEffect(() => { if (isMobile && isMobileOpen && onClose) onClose(); }, [location.pathname]);

    const toggleSection = (cat) => { if (!collapsed) setOpenSections(prev => ({ ...prev, [cat]: !prev[cat] })); };
    const toggleMenu = (id, e) => { if (!collapsed) { e?.stopPropagation(); setOpenMenus(prev => ({ ...prev, [id]: !prev[id] })); } };

    const handleLogoClick = () => { navigate('/dashboard'); if (isMobile && onClose) onClose(); };
    const handleCollapseToggle = () => { window.dispatchEvent(new CustomEvent('toggleSidebarCollapse')); };

    const renderMenus = (items) => {
        if (!items) return null;
        return items.map(menu => {
            const hasChildren = menu.children?.length > 0;
            const isOpen = openMenus[menu.menuID];
            if (hasChildren) {
                return (
                    <li key={menu.menuID} className={`menu-item ${isOpen ? 'open' : ''}`}>
                        <div className="menu-link has-children" onClick={(e) => toggleMenu(menu.menuID, e)}>
                            <span className="menu-icon">{getIconFromEmoji(menu.menuName, menu.menuPath, menu.menuIcon)}</span>
                            {!collapsed && <><span className="menu-text">{menu.menuName}</span><FaChevronDown className={`menu-arrow ${isOpen ? 'rotate' : ''}`} /></>}
                            <span className="menu-tooltip">{menu.menuName}</span>
                        </div>
                        {!collapsed && isOpen && <ul className="submenu">{renderMenus(menu.children)}</ul>}
                    </li>
                );
            }
            return (
                <li key={menu.menuID} className="menu-item">
                    <NavLink to={`/${menu.menuPath}`} className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'} onClick={() => isMobile && onClose?.()}>
                        <span className="menu-icon">{getIconFromEmoji(menu.menuName, menu.menuPath, menu.menuIcon)}</span>
                        {!collapsed && <span className="menu-text">{menu.menuName}</span>}
                        <span className="menu-tooltip">{menu.menuName}</span>
                    </NavLink>
                </li>
            );
        });
    };

    return (
        <>
            {isMobile && isMobileOpen && <div className="sidebar-mobile-overlay" onClick={onClose} />}
            <aside className={`sidebar ${isMobileOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
                {/* Header - Top se connected, WMS click pe Dashboard, Collapse button */}
                <div className="sidebar-header">
                    <span className="sidebar-logo-text" onClick={handleLogoClick}>WMS</span>
                    <button className="sidebar-collapse-btn" onClick={handleCollapseToggle} aria-label="Toggle sidebar">
                        {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {sortedCategories.map(cat => (
                        <div key={cat} className="menu-section">
                            {cat !== 'Main' && (
                                <div className={`section-header ${openSections[cat] ? 'open' : ''}`} onClick={() => toggleSection(cat)}>
                                    <span className="section-icon">{categoryIcons[cat] || <FaEllipsisH />}</span>
                                    {!collapsed && <><span className="section-title">{cat}</span><FaChevronDown className={`section-arrow ${openSections[cat] ? 'rotate' : ''}`} /></>}
                                    <span className="section-tooltip">{cat}</span>
                                </div>
                            )}
                            {(cat === 'Main' || openSections[cat] || collapsed) && <ul className="menu-list">{renderMenus(groupedMenus[cat])}</ul>}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {!collapsed ? (
                        <div className="footer-expanded">
                            <div className="user-info-mini">
                                <div className="user-avatar-mini">{state.user?.fullName?.charAt(0) || 'U'}</div>
                                <div className="user-details-mini">
                                    <span className="user-name-mini">{state.user?.fullName || 'User'}</span>
                                    <span className="user-role-mini">{state.user?.roleName || 'Role'}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="footer-collapsed">
                            <div className="user-avatar-mini">{state.user?.fullName?.charAt(0) || 'U'}</div>
                            <span className="footer-tooltip">{state.user?.fullName || 'User'}</span>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}