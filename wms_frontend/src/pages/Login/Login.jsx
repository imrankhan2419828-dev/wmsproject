import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";
import { FaUser, FaLock, FaSignInAlt, FaExclamationTriangle, FaWarehouse } from "react-icons/fa";
import "./login.css";

export default function Login() {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { dispatch } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await axiosClient.post("/Auth/login", {
                userName,
                password
            });

            dispatch({
                type: "LOGIN",
                payload: {
                    token: res.data.token,
                    user: res.data
                }
            });

            navigate("/", { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Invalid username or password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Background Shapes */}
            <div className="login-bg-shape shape-1"></div>
            <div className="login-bg-shape shape-2"></div>
            <div className="login-bg-shape shape-3"></div>

            <div className="login-wrapper">
                <div className="login-card">
                    {/* Logo & Header */}
                    <div className="login-header">
                        <div className="login-logo">
                            <FaWarehouse />
                        </div>
                        <h1 className="login-title">WMS Plus</h1>
                        {/*<p className="login-subtitle">Warehouse Management System</p>*/}
                        <p className="login-welcome">Welcome back! Please login to your account.</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="login-error">
                            <FaExclamationTriangle />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="login-input-group">
                            <span className="login-input-icon">
                                <FaUser />
                            </span>
                            <input
                                type="text"
                                placeholder="Username"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                required
                                className="login-input"
                                autoComplete="username"
                            />
                        </div>

                        <div className="login-input-group">
                            <span className="login-input-icon">
                                <FaLock />
                            </span>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="login-input"
                                autoComplete="current-password"
                            />
                        </div>

                        <div className="login-options">
                            <label className="login-remember">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="login-forgot">Forgot Password?</a>
                        </div>

                        <button
                            type="submit"
                            className={`login-submit-btn ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="btn-spinner"></span>
                            ) : (
                                <>
                                    <FaSignInAlt />
                                    <span>Login</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="login-footer">
                        <p>© {new Date().getFullYear()} WMS. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}