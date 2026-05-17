//import { useContext } from "react";
//import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

//import AuthContext, { AuthProvider } from "./context/AuthContext";
//import { DashboardProvider } from "./context/DashboardContext";
//import { ThemeProvider } from "./context/ThemeContext";
//import { ToastProvider } from "./components/common/Toast/Toast";
//import { DialogProvider } from "./components/common";
//import { Layout } from "./components/layout";

//import Login from "./pages/Login/Login";
//import Dashboard from "./pages/Dashboard/Dashboard";
//import { buildRoutesFromMenus } from "./utils/buildRoutes";

//import "./styles/variables.css";
//import "./styles/global.css";
//import "./assets/css/shared.css";

//function PrivateRoute({ children }) {
//    const { state } = useContext(AuthContext);
//    return state.token ? children : <Navigate to="/login" replace />;
//}

//function AppRoutes() {
//    const { state } = useContext(AuthContext);

//    // ? Build dynamic routes
//    const dynamicRoutes = buildRoutesFromMenus(state.menus || []);

//    // ? Debug: Log menu paths
//    console.log("?? Available menus:", state.menus);
//    console.log("??? All routes:", dynamicRoutes.map(r => r.path));

//    return (
//        <Routes>
//            <Route path="/login" element={<Login />} />

//            <Route
//                path="/"
//                element={
//                    <PrivateRoute>
//                        <Layout />
//                    </PrivateRoute>
//                }
//            >
//                <Route index element={<Dashboard />} />
//                <Route path="dashboard" element={<Dashboard />} />

//                {/* ? Render all dynamic routes */}
//                {dynamicRoutes.map((r, i) => (
//                    <Route
//                        key={`route-${i}-${r.path}`}
//                        path={r.path}
//                        element={<r.element />}
//                    />
//                ))}
//            </Route>

//            {/* ? Catch-all route for 404 */}
//            <Route path="*" element={<Navigate to="/" replace />} />
//        </Routes>
//    );
//}

//export default function App() {
//    return (
//        <ThemeProvider>
//            <AuthProvider>
//                <DashboardProvider>
//                    <ToastProvider>
//                        <DialogProvider>
//                            <BrowserRouter>
//                                <AppRoutes />
//                            </BrowserRouter>
//                        </DialogProvider>
//                    </ToastProvider>
//                </DashboardProvider>
//            </AuthProvider>
//        </ThemeProvider>
//    );
//}


// App.js
import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthContext, { AuthProvider } from "./context/AuthContext";
import DashboardProvider from "./pages/Dashboard/DashboardProvider";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./components/common/Toast/Toast";
import { DialogProvider } from "./components/common";
import { Layout } from "./components/layout";

import Login from "./pages/Login/Login";
import DashboardPage from "./pages/Dashboard/DashboardPage"; // ? Changed to DashboardPage
import { buildRoutesFromMenus } from "./utils/buildRoutes";

import "./styles/variables.css";
import "./styles/global.css";
import "./assets/css/shared.css";

function PrivateRoute({ children }) {
    const { state } = useContext(AuthContext);
    return state.token ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
    const { state } = useContext(AuthContext);

    // Build dynamic routes
    const dynamicRoutes = buildRoutesFromMenus(state.menus || []);

    console.log("?? Available menus:", state.menus);
    console.log("??? All routes:", dynamicRoutes.map(r => r.path));

    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <Layout />
                    </PrivateRoute>
                }
            >
                <Route index element={<DashboardPage />} />  {/* ? Changed to DashboardPage */}
                <Route path="dashboard" element={<DashboardPage />} />  {/* ? Changed to DashboardPage */}

                {/* Render all dynamic routes */}
                {dynamicRoutes.map((r, i) => (
                    <Route
                        key={`route-${i}-${r.path}`}
                        path={r.path}
                        element={<r.element />}
                    />
                ))}
            </Route>

            {/* Catch-all route for 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <DashboardProvider>
                    <ToastProvider>
                        <DialogProvider>
                            <BrowserRouter>
                                <AppRoutes />
                            </BrowserRouter>
                        </DialogProvider>
                    </ToastProvider>
                </DashboardProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}