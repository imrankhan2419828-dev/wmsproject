//// components/MenuToggle/MenuToggle.jsx
//import "./MenuToggle.css";

//export default function MenuToggle({ onClick, isOpen }) {
//    return (
//        <button
//            className={`menu-toggle ${isOpen ? 'open' : ''}`}
//            onClick={onClick}
//            aria-label="Toggle menu"
//        >
//            <i className={`bi ${isOpen ? 'bi-x' : 'bi-list'}`}></i>
//        </button>
//    );
//}

// MenuToggle.jsx
import "./MenuToggle.css";

export default function MenuToggle({ onClick, isOpen }) {
    // Prevent event bubbling
    const handleClick = (e) => {
        e.stopPropagation();
        onClick();
    };

    return (
        <button
            className={`menu-toggle ${isOpen ? 'open' : ''}`}
            onClick={handleClick}
            aria-label="Toggle menu"
        >
            <i className={`bi ${isOpen ? 'bi-x' : 'bi-list'}`}></i>
        </button>
    );
}