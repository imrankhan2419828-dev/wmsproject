//import React, { useContext, useState, useEffect } from 'react';
//import {
//    FaShoppingCart, FaChartBar, FaDollarSign, FaUsers, FaBox,
//    FaArrowUp, FaArrowDown, FaChevronRight, FaStar, FaClock,
//    FaCheckCircle, FaTimesCircle, FaWallet, FaClipboardList
//} from 'react-icons/fa';
//import {
//    AreaChart, Area, XAxis, YAxis, CartesianGrid,
//    Tooltip, ResponsiveContainer, RadialBarChart, RadialBar
//} from 'recharts';

//import AuthContext from '../../context/AuthContext';
//import { formatAmount, formatNumber } from '../../utils/numberUtils';
//import './Dashboard.css';

//// Premium Stat Card
//const PremiumStatCard = ({ title, value, icon, change, changeType, color }) => {
//    return (
//        <div className={`premium-stat-card ${color}`}>
//            <div className="stat-glow"></div>
//            <div className="stat-content">
//                <div className="stat-header">
//                    <div className="stat-icon-wrapper">{icon}</div>
//                    <div className={`stat-trend ${changeType}`}>
//                        {changeType === 'up' ? <FaArrowUp /> : <FaArrowDown />}
//                        <span>{change}</span>
//                    </div>
//                </div>
//                <div className="stat-body">
//                    <h3 className="stat-value">{value}</h3>
//                    <p className="stat-title">{title}</p>
//                </div>
//            </div>
//            <div className="stat-progress-bar">
//                <div className="progress-fill" style={{ width: '78%' }}></div>
//            </div>
//        </div>
//    );
//};

//// Quick Action Card
//const QuickActionCard = ({ icon, label, description, color }) => {
//    return (
//        <div className={`quick-action-premium ${color}`}>
//            <div className="action-icon-wrapper">
//                <div className="action-icon-bg"></div>
//                <span className="action-icon">{icon}</span>
//            </div>
//            <div className="action-content">
//                <h4 className="action-label">{label}</h4>
//                <p className="action-desc">{description}</p>
//            </div>
//            <div className="action-arrow"><FaChevronRight /></div>
//        </div>
//    );
//};

//// Recent Order Item
//const OrderItem = ({ order }) => {
//    return (
//        <div className="order-item-premium">
//            <div className={`order-status-indicator ${order.status}`}></div>
//            <div className="order-info">
//                <div className="order-main">
//                    <span className="order-id">{order.id}</span>
//                    <span className="order-amount">{formatAmount(order.amount)}</span>
//                </div>
//                <div className="order-meta">
//                    <span className="order-customer">{order.customer}</span>
//                    <span className="order-time"><FaClock /> {order.time}</span>
//                </div>
//            </div>
//        </div>
//    );
//};

//// Top Product Item
//const TopProductItem = ({ product, index }) => {
//    return (
//        <div className="top-product-item">
//            <span className="product-rank">#{index + 1}</span>
//            <div className="product-info">
//                <span className="product-name">{product.name}</span>
//                <div className="product-bar-container">
//                    <div className="product-bar" style={{ width: `${product.percentage}%` }}></div>
//                </div>
//            </div>
//            <div className="product-stats">
//                <span className="product-sales">{formatNumber(product.sales)}</span>
//                <span className="product-revenue">{formatAmount(product.revenue)}</span>
//            </div>
//        </div>
//    );
//};

//// Main Dashboard
//const Dashboard = () => {
//    const { state: authState } = useContext(AuthContext);
//    const user = authState.user;

//    // Mock Data
//    const statsData = [
//        { title: 'Total Revenue', value: formatAmount(2845000), icon: <FaWallet />, change: '12.5%', changeType: 'up', color: 'primary' },
//        { title: 'Total Orders', value: formatNumber(1847), icon: <FaShoppingCart />, change: '8.2%', changeType: 'up', color: 'success' },
//        { title: 'Active Customers', value: formatNumber(12580), icon: <FaUsers />, change: '5.1%', changeType: 'up', color: 'info' },
//        { title: 'Pending Orders', value: '23', icon: <FaClipboardList />, change: '3.2%', changeType: 'down', color: 'warning' }
//    ];

//    const recentOrders = [
//        { id: '#ORD-001', customer: 'Ahmed Khan', amount: 125000, time: '5 min ago', status: 'completed' },
//        { id: '#ORD-002', customer: 'Sara Ali', amount: 85000, time: '15 min ago', status: 'processing' },
//        { id: '#ORD-003', customer: 'Bilal Ahmed', amount: 210000, time: '1 hour ago', status: 'pending' },
//        { id: '#ORD-004', customer: 'Fatima Zafar', amount: 45000, time: '2 hours ago', status: 'completed' },
//        { id: '#ORD-005', customer: 'Omar Farooq', amount: 175000, time: '3 hours ago', status: 'completed' }
//    ];

//    const topProducts = [
//        { name: 'Premium Steel Rods', sales: 1250, revenue: 1875000, percentage: 95 },
//        { name: 'Cement Bags (50kg)', sales: 3200, revenue: 2560000, percentage: 88 },
//        { name: 'Electrical Cables', sales: 850, revenue: 425000, percentage: 75 },
//        { name: 'Plumbing Pipes', sales: 2100, revenue: 630000, percentage: 65 },
//        { name: 'Paint Buckets', sales: 560, revenue: 280000, percentage: 50 }
//    ];

//    const revenueData = [
//        { name: 'Mon', revenue: 450000 }, { name: 'Tue', revenue: 520000 }, { name: 'Wed', revenue: 480000 },
//        { name: 'Thu', revenue: 610000 }, { name: 'Fri', revenue: 750000 }, { name: 'Sat', revenue: 890000 },
//        { name: 'Sun', revenue: 720000 }
//    ];

//    const quickActions = [
//        { icon: <FaShoppingCart />, label: 'New Purchase', description: 'Create purchase order', color: 'primary' },
//        { icon: <FaChartBar />, label: 'New Sale', description: 'Create sales invoice', color: 'success' },
//        { icon: <FaDollarSign />, label: 'Record Payment', description: 'Add payment entry', color: 'warning' },
//        { icon: <FaBox />, label: 'Stock Transfer', description: 'Move inventory', color: 'info' }
//    ];

//    return (
//        <div className="premium-dashboard">
//            {/* Stats Grid */}
//            <div className="stats-grid-premium">
//                {statsData.map((stat, index) => <PremiumStatCard key={index} {...stat} />)}
//            </div>

//            {/* Quick Actions */}
//            <div className="quick-actions-premium">
//                <div className="section-header-premium">
//                    <h2 className="section-title-premium">Quick Actions</h2>
//                    <span className="section-line"></span>
//                </div>
//                <div className="quick-actions-grid-premium">
//                    {quickActions.map((action, index) => <QuickActionCard key={index} {...action} />)}
//                </div>
//            </div>

//            {/* Main Grid */}
//            <div className="main-grid-premium">
//                <div className="chart-card-premium">
//                    <div className="card-header-premium"><h3>Revenue Overview</h3></div>
//                    <div className="chart-container-premium">
//                        <ResponsiveContainer width="100%" height={300}>
//                            <AreaChart data={revenueData}>
//                                <defs>
//                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
//                                        <stop offset="0%" stopColor="#1E3A5F" stopOpacity={0.3} />
//                                        <stop offset="100%" stopColor="#1E3A5F" stopOpacity={0} />
//                                    </linearGradient>
//                                </defs>
//                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
//                                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} axisLine={false} tickLine={false} />
//                                <YAxis stroke="var(--text-secondary)" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000)}K`} />
//                                <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px' }} />
//                                <Area type="monotone" dataKey="revenue" stroke="#1E3A5F" strokeWidth={3} fill="url(#revenueGradient)" />
//                            </AreaChart>
//                        </ResponsiveContainer>
//                    </div>
//                </div>

//                <div className="orders-card-premium">
//                    <div className="card-header-premium"><h3>Recent Orders</h3></div>
//                    <div className="orders-list-premium">
//                        {recentOrders.map((order, index) => <OrderItem key={index} order={order} />)}
//                    </div>
//                </div>

//                <div className="products-card-premium">
//                    <div className="card-header-premium"><h3>Top Products</h3><FaStar className="star-icon" /></div>
//                    <div className="products-list-premium">
//                        {topProducts.map((product, index) => <TopProductItem key={index} product={product} index={index} />)}
//                    </div>
//                </div>

//                <div className="target-card-premium">
//                    <div className="card-header-premium"><h3>Monthly Target</h3><span className="target-percentage">78%</span></div>
//                    <div className="target-content">
//                        <div className="target-radial">
//                            <ResponsiveContainer width="100%" height={200}>
//                                <RadialBarChart innerRadius="80%" outerRadius="100%" data={[{ value: 78 }]} startAngle={90} endAngle={-270}>
//                                    <RadialBar background={{ fill: 'var(--bg-tertiary)' }} dataKey="value" fill="#1E3A5F" cornerRadius={10} />
//                                </RadialBarChart>
//                            </ResponsiveContainer>
//                            <div className="target-center-text"><span className="target-achieved">₨ 7.8M</span><span className="target-total">of ₨ 10M</span></div>
//                        </div>
//                        <div className="target-stats">
//                            <div className="target-stat-item"><FaCheckCircle className="text-success" /><div><span className="stat-label">Achieved</span><span className="stat-number">{formatAmount(7800000)}</span></div></div>
//                            <div className="target-stat-item"><FaTimesCircle className="text-danger" /><div><span className="stat-label">Remaining</span><span className="stat-number">{formatAmount(2200000)}</span></div></div>
//                        </div>
//                    </div>
//                </div>
//            </div>
//        </div>
//    );
//};

//export default Dashboard;