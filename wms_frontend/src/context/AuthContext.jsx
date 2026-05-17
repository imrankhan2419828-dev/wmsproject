/*yah code kaam kar raha hai */
//import { createContext, useReducer, useEffect } from "react";

//const initialState = {
//    user: null,
//    token: null,
//    menus: [],
//};

//const AuthContext = createContext(initialState);

//const reducer = (state, action) => {
//    switch (action.type) {
//        case "LOGIN":
//            localStorage.setItem("token", action.payload.token);
//            localStorage.setItem("user", JSON.stringify(action.payload.user));
//            return {
//                ...state,
//                user: action.payload.user,
//                token: action.payload.token,
//                menus: action.payload.user.menus,
//            };
//        case "LOGOUT":
//            localStorage.removeItem("token");
//            localStorage.removeItem("user");
//            return initialState;
//        default:
//            return state;
//    }
//};

//export const AuthProvider = ({ children }) => {
//    const [state, dispatch] = useReducer(reducer, initialState);

//    useEffect(() => {
//        const token = localStorage.getItem("token");
//        const user = localStorage.getItem("user");
//        if (token && user) {
//            dispatch({
//                type: "LOGIN",
//                payload: { token, user: JSON.parse(user) },
//            });
//        }
//    }, []);

//    return (
//        <AuthContext.Provider value={{ state, dispatch }}>
//            {children}
//        </AuthContext.Provider>
//    );
//};

//export default AuthContext;

//ok code

//import { createContext, useReducer, useEffect } from "react";

//const initialState = {
//    user: null,
//    token: null,
//    menus: [],
//    selectedBranch: null, // 👈 Add this
//};

//const AuthContext = createContext(initialState);

//const reducer = (state, action) => {
//    switch (action.type) {
//        case "LOGIN":
//            localStorage.setItem("token", action.payload.token);
//            localStorage.setItem("user", JSON.stringify(action.payload.user));
//            localStorage.setItem("selectedBranch", action.payload.user.branchID); // 👈 Add this
//            return {
//                ...state,
//                user: action.payload.user,
//                token: action.payload.token,
//                menus: action.payload.user.menus,
//                selectedBranch: action.payload.user.branchID, // 👈 Add this
//            };
//        case "SWITCH_BRANCH":
//            console.log("🔁 SWITCH_BRANCH action received:", action.payload);

//            // ✅ Don't switch if same branch
//            if (state.selectedBranch === action.payload.branchID) {
//                console.log("Same branch, ignoring switch");
//                return state;
//            }

//            localStorage.setItem("selectedBranch", action.payload.branchID);
//            return {
//                ...state,
//                selectedBranch: action.payload.branchID
//            };
//        case "LOGOUT":
//            localStorage.removeItem("token");
//            localStorage.removeItem("user");
//            localStorage.removeItem("selectedBranch"); // 👈 Add this
//            return initialState;
//        default:
//            return state;
//    }
//};

//export const AuthProvider = ({ children }) => {
//    const [state, dispatch] = useReducer(reducer, initialState);

//    useEffect(() => {
//        const token = localStorage.getItem("token");
//        const user = localStorage.getItem("user");
//        const selectedBranch = localStorage.getItem("selectedBranch");
//        if (token && user) {
//            dispatch({
//                type: "LOGIN",
//                payload: { token, user: JSON.parse(user) },
//            });
//            // Agar selectedBranch save hai to use karo
//            if (selectedBranch) {
//                dispatch({
//                    type: "SWITCH_BRANCH",
//                    payload: { branchID: parseInt(selectedBranch) }
//                });
//            }
//        }
//    }, []);

//    return (
//        <AuthContext.Provider value={{ state, dispatch }}>
//            {children}
//        </AuthContext.Provider>
//    );
//};

//export default AuthContext;

//ok code

import { createContext, useReducer, useEffect } from "react";

const initialState = {
    user: null,
    token: null,
    menus: [],
    selectedBranch: null,
};

const AuthContext = createContext(initialState);

const reducer = (state, action) => {
    switch (action.type) {
        case "LOGIN":
            localStorage.setItem("token", action.payload.token);
            localStorage.setItem("user", JSON.stringify(action.payload.user));

            // 👇 FIX: selectedBranch ko smartly set karo
            const savedBranch = localStorage.getItem("selectedBranch");
            const branchID = savedBranch
                ? parseInt(savedBranch)
                : action.payload.user.branchID;

            localStorage.setItem("selectedBranch", branchID);

            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                menus: action.payload.user.menus,
                selectedBranch: branchID,
            };

        case "SWITCH_BRANCH":
            console.log("🔁 SWITCH_BRANCH action received:", action.payload);

            if (state.selectedBranch === action.payload.branchID) {
                return state;
            }

            localStorage.setItem("selectedBranch", action.payload.branchID);

            return {
                ...state,
                selectedBranch: action.payload.branchID,
            };

        case "LOGOUT":
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("selectedBranch");
            return initialState;

        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (token && user) {
            dispatch({
                type: "LOGIN",
                payload: { token, user: JSON.parse(user) },
            });
        }
    }, []);

    return (
        <AuthContext.Provider value={{ state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;