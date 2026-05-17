//import { useContext, useState, useEffect } from "react";
//import { NavLink, useLocation } from "react-router-dom";
//import AuthContext from "../../context/AuthContext";
//import { useTheme } from "../../context/ThemeContext";
//import {
//    FaChevronDown,
//    FaBars,
//    FaTimes,
//    FaChevronLeft,
//    FaChevronRight,
//    FaHome,
//    FaCog,
//    FaCode,
//    FaEdit,
//    FaChartBar,
//    FaTools,
//    FaBoxes,
//    FaEllipsisH,
//    FaMoon,
//    FaSun,
//    FaSignOutAlt,
//    FaUser
//} from "react-icons/fa";
//import "./Sidebar.css";

//export default function Sidebar({ isMobileOpen, onClose }) {
//    const { state } = useContext(AuthContext);
//    const { theme, toggleTheme } = useTheme();
//    const location = useLocation();

//    const [collapsed, setCollapsed] = useState(() => {
//        const saved = localStorage.getItem('sidebarCollapsed');
//        return saved === 'true';
//    });
//    const [openSections, setOpenSections] = useState({});
//    const [openMenus, setOpenMenus] = useState({});

//    const menus = state?.menus || [];

//    // Category Icons Mapping
//    const categoryIcons = {
//        'Main': <FaHome />,
//        'System Section': <FaCog />,
//        'Coding Section': <FaCode />,
//        'Entry Section': <FaEdit />,
//        'Reporting Section': <FaChartBar />,
//        'Workshop': <FaTools />,
//        'Inventory': <FaBoxes />,
//        'Other': <FaEllipsisH />
//    };

//    // Default icons for menus
//    const getMenuIcon = (menu) => {
//        if (menu.icon) return menu.icon;
//        if (menu.children?.length) return <FaChevronDown />;
//        return <FaEdit />;
//    };

//    // Group menus by category
//    const groupedMenus = menus.reduce((acc, menu) => {
//        if (!menu.parentID) {
//            const category = menu.menuCategory || 'Other';
//            if (!acc[category]) acc[category] = [];
//            acc[category].push(menu);
//        }
//        return acc;
//    }, {});

//    const categoryOrder = [
//        'Main', 'System Section', 'Coding Section',
//        'Entry Section', 'Reporting Section', 'Workshop',
//        'Inventory', 'Other'
//    ];

//    const sortedCategories = Object.keys(groupedMenus).sort((a, b) => {
//        const ia = categoryOrder.indexOf(a);
//        const ib = categoryOrder.indexOf(b);
//        if (ia === -1) return 1;
//        if (ib === -1) return -1;
//        return ia - ib;
//    });

//    // Save collapsed state
//    useEffect(() => {
//        localStorage.setItem('sidebarCollapsed', collapsed);
//    }, [collapsed]);

//    // Auto close on mobile when route changes
//    useEffect(() => {
//        if (window.innerWidth < 768 && onClose) {
//            onClose();
//        }
//    }, [location.pathname, onClose]);

//    // Auto open active menu on load
//    useEffect(() => {
//        const activePath = location.pathname.replace("/", "");

//        const findAndOpenParents = (items, parentId = null) => {
//            for (const item of items) {
//                if (item.menuPath === activePath) {
//                    if (parentId) {
//                        setOpenMenus(prev => ({ ...prev, [parentId]: true }));
//                    }
//                    return true;
//                }
//                if (item.children?.length) {
//                    const found = findAndOpenParents(item.children, item.menuID);
//                    if (found) {
//                        setOpenMenus(prev => ({ ...prev, [item.menuID]: true }));
//                        return true;
//                    }
//                }
//            }
//            return false;
//        };

//        sortedCategories.forEach(cat => {
//            if (findAndOpenParents(groupedMenus[cat])) {
//                setOpenSections(prev => ({ ...prev, [cat]: true }));
//            }
//        });
//    }, [location.pathname, menus]);

//    const toggleSection = (cat) => {
//        setOpenSections(prev => ({ ...prev, [cat]: !prev[cat] }));
//    };

//    const toggleMenu = (id, e) => {
//        e?.stopPropagation();
//        setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
//    };

//    const toggleSidebar = () => {
//        setCollapsed(!collapsed);
//    };

//    const renderMenus = (items) => {
//        if (!items) return null;

//        return items.map(menu => {
//            const hasChildren = menu.children?.length > 0;
//            const isOpen = openMenus[menu.menuID];

//            if (hasChildren) {
//                return (
//                    <li key={menu.menuID} className={`menu-item ${isOpen ? 'open' : ''}`}>
//                        <div
//                            className="menu-link"
//                            onClick={(e) => toggleMenu(menu.menuID, e)}
//                        >
//                            <span className="menu-icon">
//                                {getMenuIcon(menu)}
//                            </span>
//                            {!collapsed && (
//                                <>
//                                    <span className="menu-text">{menu.menuName}</span>
//                                    <FaChevronDown className={`menu-arrow ${isOpen ? 'rotate' : ''}`} />
//                                </>
//                            )}
//                            {collapsed && (
//                                <span className="menu-tooltip">{menu.menuName}</span>
//                            )}
//                        </div>
//                        {!collapsed && (
//                            <ul className="submenu">
//                                {renderMenus(menu.children)}
//                            </ul>
//                        )}
//                    </li>
//                );
//            }

//            return (
//                <li key={menu.menuID} className="menu-item">
//                    <NavLink
//                        to={`/${menu.menuPath}`}
//                        className={({ isActive }) =>
//                            isActive ? "menu-link active" : "menu-link"
//                        }
//                        onClick={() => window.innerWidth < 768 && onClose?.()}
//                    >
//                        <span className="menu-icon">
//                            {getMenuIcon(menu)}
//                        </span>
//                        {!collapsed && (
//                            <span className="menu-text">{menu.menuName}</span>
//                        )}
//                        {collapsed && (
//                            <span className="menu-tooltip">{menu.menuName}</span>
//                        )}
//                    </NavLink>
//                </li>
//            );
//        });
//    };

//    return (
//        <>
//            {/* Mobile Overlay */}
//            {isMobileOpen && (
//                <div className="sidebar-overlay" onClick={onClose} />
//            )}

//            {/* Sidebar */}
//            <aside className={`sidebar ${isMobileOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
//                {/* Header */}
//                <div className="sidebar-header">
//                    <div className="sidebar-logo">
//                        {!collapsed ? (
//                            <h2>WMS</h2>
//                        ) : (
//                            <h2>W</h2>
//                        )}
//                    </div>
//                    <button
//                        className="sidebar-collapse-btn"
//                        onClick={toggleSidebar}
//                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
//                    >
//                        {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
//                    </button>
//                </div>

//                {/* Navigation */}
//                <nav className="sidebar-nav">
//                    {sortedCategories.map(cat => (
//                        <div key={cat} className="menu-section">
//                            {cat !== "Main" && (
//                                <div
//                                    className={`section-header ${openSections[cat] ? 'open' : ''}`}
//                                    onClick={() => toggleSection(cat)}
//                                >
//                                    <span className="section-icon">
//                                        {categoryIcons[cat] || <FaEllipsisH />}
//                                    </span>
//                                    {!collapsed && (
//                                        <>
//                                            <span className="section-title">{cat}</span>
//                                            <FaChevronDown className={`section-arrow ${openSections[cat] ? 'rotate' : ''}`} />
//                                        </>
//                                    )}
//                                    {collapsed && (
//                                        <span className="section-tooltip">{cat}</span>
//                                    )}
//                                </div>
//                            )}

//                            {(cat === "Main" || openSections[cat]) && (
//                                <ul className="menu-list">
//                                    {renderMenus(groupedMenus[cat])}
//                                </ul>
//                            )}
//                        </div>
//                    ))}
//                </nav>

                
//            </aside>
//        </>
//    );
//}