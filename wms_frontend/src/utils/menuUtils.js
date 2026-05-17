// src/utils/menuUtils.js

// Menu categories mapping
export const MENU_CATEGORIES = {
    CODING: 'Coding Section',
    SYSTEM: 'System Section',
    ENTRY: 'Entry Section',
    REPORTING: 'Reporting Section'
};

// Map FontAwesome icons to Bootstrap Icons
const iconMapping = {
    'FaShoppingCart': 'bi-cart',
    'FaUndo': 'bi-arrow-return-left',
    'FaBalanceScale': 'bi-scale',
    'FaArrowCircleLeft': 'bi-arrow-left-circle',
    'default': 'bi-circle'
};

// Get Bootstrap icon from MenuIcon field
const getBootstrapIcon = (menuIcon) => {
    if (!menuIcon) return 'bi-circle';
    return iconMapping[menuIcon] || 'bi-circle';
};

// Transform flat menu data into hierarchical structure
export const transformMenus = (flatMenus) => {
    if (!flatMenus || !Array.isArray(flatMenus)) return [];

    console.log('Raw Menus from DB:', flatMenus);

    // First, create a map of all menus
    const menuMap = new Map();
    const allMenus = [];

    flatMenus.forEach(menu => {
        // Don't skip any menu - include all
        const menuItem = {
            id: menu.FormID,
            name: menu.MenuTitle || menu.FormName,
            path: menu.FormName,
            parentId: menu.ParentPage,
            icon: getBootstrapIcon(menu.MenuIcon),
            order: menu.MenuOrder || menu.FormOrder || 999,
            isWebPage: menu.IsWebPage,
            original: menu
        };
        menuMap.set(menu.FormID, menuItem);
        allMenus.push(menuItem);
    });

    // Build hierarchical structure
    const rootMenus = [];
    const childrenMap = new Map();

    menuMap.forEach((menu, id) => {
        if (menu.parentId && menu.parentId > 0 && menu.parentId !== null) {
            // It's a child menu
            if (!childrenMap.has(menu.parentId)) {
                childrenMap.set(menu.parentId, []);
            }
            childrenMap.get(menu.parentId).push(menu);
        } else {
            // It's a root menu
            rootMenus.push(menu);
        }
    });

    // Attach children to parents
    rootMenus.forEach(menu => {
        if (childrenMap.has(menu.id)) {
            menu.children = childrenMap.get(menu.id).sort((a, b) => a.order - b.order);
        }
    });

    // Also check for children of non-root menus (for reports parent)
    menuMap.forEach((menu, id) => {
        if (!rootMenus.includes(menu) && childrenMap.has(id)) {
            menu.children = childrenMap.get(id).sort((a, b) => a.order - b.order);
        }
    });

    // Sort root menus by order
    rootMenus.sort((a, b) => a.order - b.order);

    console.log('All Menus:', allMenus);
    console.log('Root Menus:', rootMenus);
    console.log('Children Map:', childrenMap);

    return rootMenus;
};

// Categorize menus based on your requirements
export const categorizeMenus = (menus) => {
    const categories = {
        [MENU_CATEGORIES.CODING]: [],
        [MENU_CATEGORIES.SYSTEM]: [],
        [MENU_CATEGORIES.ENTRY]: [],
        [MENU_CATEGORIES.REPORTING]: []
    };

    // Flatten menus to include all (including children)
    const flattenMenus = (menuList) => {
        let flat = [];
        menuList.forEach(menu => {
            flat.push(menu);
            if (menu.children && menu.children.length > 0) {
                flat = flat.concat(flattenMenus(menu.children));
            }
        });
        return flat;
    };

    const allMenus = flattenMenus(menus);
    console.log('All Menus for Categorization:', allMenus);

    allMenus.forEach(menu => {
        const name = (menu.name + ' ' + (menu.original?.FormTitle || '')).toLowerCase();
        const path = menu.path?.toLowerCase() || '';

        // Coding Section
        if (path.includes('coa') || path.includes('company') ||
            path.includes('category') || path.includes('item') ||
            name.includes('coa') || name.includes('company') ||
            name.includes('category') || name.includes('item')) {
            categories[MENU_CATEGORIES.CODING].push(menu);
        }
        // System Section
        else if (path.includes('user') || path.includes('role') || path.includes('branch') ||
            name.includes('user') || name.includes('role') || name.includes('branch') ||
            name.includes('permission')) {
            categories[MENU_CATEGORIES.SYSTEM].push(menu);
        }
        // Entry Section
        else if (path.includes('purchase') || path.includes('sales') ||
            path.includes('payment') || path.includes('receiving') ||
            path.includes('cheque') || path.includes('postdated') ||
            name.includes('purchase') || name.includes('sales') ||
            name.includes('payment') || name.includes('receiving') ||
            name.includes('cheque')) {
            categories[MENU_CATEGORIES.ENTRY].push(menu);
        }
        // Reporting Section
        else if (path.includes('report') || path.includes('supplier') ||
            path.includes('balancing') || name.includes('report') ||
            name.includes('supplier') || name.includes('balancing')) {
            categories[MENU_CATEGORIES.REPORTING].push(menu);
        }
        // Dashboard
        else if (path.includes('dashboard') || name.includes('dashboard')) {
            categories[MENU_CATEGORIES.SYSTEM].push(menu);
        }
        // Default
        else {
            categories[MENU_CATEGORIES.SYSTEM].push(menu);
        }
    });

    // Sort items within each category by order
    Object.keys(categories).forEach(key => {
        categories[key].sort((a, b) => (a.order || 999) - (b.order || 999));
    });

    console.log('Final Categories:', categories);
    return categories;
};