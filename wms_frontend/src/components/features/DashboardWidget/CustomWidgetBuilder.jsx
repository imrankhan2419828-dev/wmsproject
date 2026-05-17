import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal/Modal';
import axiosClient from '../../../api/axiosClient';
import { Button } from '../../common';
import {
    FaChartLine, FaTable, FaList, FaChartBar, FaChartPie,
    FaArrowRight, FaCheck, FaDatabase, FaCog, FaEye,
    FaChartArea, FaDollarSign, FaUsers, FaBox, FaCar,
    FaWrench, FaBuilding, FaUser, FaShoppingCart, FaMoneyBillWave,
    FaCreditCard, FaExchangeAlt, FaClipboardList, FaCalendarAlt,
    FaFileInvoice, FaTruck, FaWarehouse, FaSpinner
} from 'react-icons/fa';
import './CustomWidgetBuilder.css';

const WIDGET_TYPES = [
    { value: 'list', label: 'List', icon: <FaList />, description: 'Show data in a list format', defaultSize: { w: 4, h: 2 } },
    { value: 'table', label: 'Data Table', icon: <FaTable />, description: 'Display tabular data', defaultSize: { w: 6, h: 2 } },
];

const DATA_SOURCES = [
    { value: 'coa', label: 'Chart of Accounts', icon: <FaFileInvoice />, category: 'financial', api: '/COA/tree', description: 'All accounts with hierarchy' },
    { value: 'purchase', label: 'Purchases', icon: <FaShoppingCart />, category: 'financial', api: '/Purchase', description: 'Purchase transactions' },
    { value: 'sale', label: 'Sales', icon: <FaMoneyBillWave />, category: 'financial', api: '/Sale', description: 'Sales invoices' },
    { value: 'payment', label: 'Payments', icon: <FaCreditCard />, category: 'financial', api: '/Payment', description: 'Payment records' },
    { value: 'receiving', label: 'Receivings', icon: <FaMoneyBillWave />, category: 'financial', api: '/Receiving', description: 'Receiving records' },
    { value: 'customer', label: 'Customers', icon: <FaUser />, category: 'master', api: '/Customer', description: 'Customer database' },
    { value: 'supplier', label: 'Suppliers', icon: <FaTruck />, category: 'master', api: '/Supplier', description: 'Supplier database' },
    { value: 'jobcard', label: 'Job Cards', icon: <FaClipboardList />, category: 'workshop', api: '/JobCard', description: 'Workshop job cards' },
    { value: 'technician', label: 'Technicians', icon: <FaWrench />, category: 'workshop', api: '/Technician', description: 'Technician details' },
    { value: 'vehicle', label: 'Vehicles', icon: <FaCar />, category: 'workshop', api: '/Vehicle', description: 'Customer vehicles' },
    { value: 'item', label: 'Items', icon: <FaBox />, category: 'master', api: '/Item', description: 'Product catalog' },
];

const COLOR_OPTIONS = [
    { value: '#3b82f6', label: 'Blue' }, { value: '#10b981', label: 'Green' },
    { value: '#f59e0b', label: 'Orange' }, { value: '#ef4444', label: 'Red' },
    { value: '#8b5cf6', label: 'Purple' }, { value: '#ec4899', label: 'Pink' },
];

export default function CustomWidgetBuilder({ onClose, onSave }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [widgetConfig, setWidgetConfig] = useState({
        id: `custom_${Date.now()}`,
        name: '',
        type: 'table',
        dataSource: '',
        fields: [],
        color: '#3b82f6',
    });

    const updateConfig = (field, value) => {
        setWidgetConfig(prev => ({ ...prev, [field]: value }));
    };

    // Fetch REAL data when dataSource changes
    useEffect(() => {
        if (widgetConfig.dataSource) {
            fetchRealData();
        }
    }, [widgetConfig.dataSource]);

    const fetchRealData = async () => {
        const source = DATA_SOURCES.find(s => s.value === widgetConfig.dataSource);
        if (!source) return;

        setLoading(true);
        try {
            const response = await axiosClient.get(source.api);
            let data = response.data?.data || response.data || [];

            // Special handling for COA (tree structure)
            if (widgetConfig.dataSource === 'coa' && Array.isArray(data)) {
                data = flattenTreeData(data);
            }

            setPreviewData(data.slice(0, 10));

            // Auto-select first 3 fields
            if (data.length > 0) {
                const availableFields = Object.keys(data[0]).slice(0, 5);
                updateConfig('fields', availableFields.slice(0, 3));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setPreviewData([]);
        } finally {
            setLoading(false);
        }
    };

    const flattenTreeData = (tree, level = 0) => {
        let result = [];
        if (!Array.isArray(tree)) return result;

        tree.forEach(node => {
            result.push({
                ...node,
                _level: level,
                _display: `${'—'.repeat(level)} ${node.acctCode || ''} ${node.acctName || ''}`
            });
            if (node.children && node.children.length) {
                result = [...result, ...flattenTreeData(node.children, level + 1)];
            }
        });
        return result;
    };

    const handleSave = () => {
        if (!widgetConfig.name || !widgetConfig.dataSource || widgetConfig.fields.length === 0) {
            alert('Please complete all required fields');
            return;
        }
        onSave(widgetConfig);
    };

    const renderPreview = () => {
        if (loading) {
            return <div className="preview-loading"><FaSpinner className="spinning" /> Loading data...</div>;
        }

        if (!previewData || previewData.length === 0) {
            return <div className="preview-empty">No data available for this source</div>;
        }

        if (widgetConfig.type === 'list') {
            return (
                <div className="preview-list">
                    {previewData.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="preview-list-item">
                            {widgetConfig.fields.map(field => (
                                <div key={field} className="preview-field">
                                    <strong>{field}:</strong> {item[field] || '—'}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="preview-table">
                <table className="preview-table-grid">
                    <thead>
                        <tr>
                            {widgetConfig.fields.map(field => (
                                <th key={field}>{field}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {previewData.slice(0, 5).map((item, idx) => (
                            <tr key={idx}>
                                {widgetConfig.fields.map(field => (
                                    <td key={field}>{item[field] || '—'}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const canProceed = () => {
        if (step === 1) return widgetConfig.name;
        if (step === 2) return widgetConfig.dataSource;
        if (step === 3) return widgetConfig.fields.length > 0;
        return true;
    };

    const modalFooter = (
        <div className="builder-footer">
            {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)}>← Back</Button>}
            <div style={{ flex: 1 }} />
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            {step < 4 ? (
                <Button variant="primary" onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                    Next <FaArrowRight />
                </Button>
            ) : (
                <Button variant="success" onClick={handleSave} disabled={!canProceed()}>
                    <FaCheck /> Create Widget
                </Button>
            )}
        </div>
    );

    return (
        <Modal isOpen={true} onClose={onClose} title="✨ Create Custom Widget" size="xl" footer={modalFooter}>
            <div className="custom-widget-builder">
                {/* Step 1 */}
                {step === 1 && (
                    <div className="builder-step">
                        <h3>Widget Name</h3>
                        <input type="text" className="form-input"
                            value={widgetConfig.name}
                            onChange={(e) => updateConfig('name', e.target.value)}
                            placeholder="e.g., Chart of Accounts, Customer List" autoFocus />

                        <h3 style={{ marginTop: 20 }}>Widget Type</h3>
                        <div className="widget-type-grid">
                            {WIDGET_TYPES.map(type => (
                                <div key={type.value}
                                    className={`type-card ${widgetConfig.type === type.value ? 'selected' : ''}`}
                                    onClick={() => updateConfig('type', type.value)}>
                                    <div className="type-icon">{type.icon}</div>
                                    <div>{type.label}</div>
                                </div>
                            ))}
                        </div>

                        <h3 style={{ marginTop: 20 }}>Theme Color</h3>
                        <div className="color-picker-grid">
                            {COLOR_OPTIONS.map(color => (
                                <div key={color.value}
                                    className={`color-option ${widgetConfig.color === color.value ? 'selected' : ''}`}
                                    style={{ backgroundColor: color.value }}
                                    onClick={() => updateConfig('color', color.value)} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                    <div className="builder-step">
                        <h3>Select Data Source</h3>
                        <div className="data-source-grid">
                            {DATA_SOURCES.map(source => (
                                <div key={source.value}
                                    className={`source-card ${widgetConfig.dataSource === source.value ? 'selected' : ''}`}
                                    onClick={() => updateConfig('dataSource', source.value)}>
                                    <div className="source-icon">{source.icon}</div>
                                    <div>
                                        <div className="source-name">{source.label}</div>
                                        <div className="source-desc">{source.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                    <div className="builder-step">
                        <h3>Select Fields to Display</h3>
                        {previewData && previewData.length > 0 && (
                            <div className="fields-grid">
                                {Object.keys(previewData[0]).filter(k => !k.startsWith('_')).map(field => (
                                    <label key={field} className="field-checkbox">
                                        <input type="checkbox"
                                            checked={widgetConfig.fields.includes(field)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    updateConfig('fields', [...widgetConfig.fields, field]);
                                                } else {
                                                    updateConfig('fields', widgetConfig.fields.filter(f => f !== field));
                                                }
                                            }} />
                                        <span>{field}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                        {loading && <div>Loading fields...</div>}
                        {!loading && (!previewData || previewData.length === 0) &&
                            <div>No data available. Please check API connection.</div>
                        }
                    </div>
                )}

                {/* Step 4 */}
                {step === 4 && (
                    <div className="builder-step">
                        <h3>Preview</h3>
                        <div className="preview-container">
                            <div className="preview-header">
                                <span>{widgetConfig.name || 'Widget Preview'}</span>
                            </div>
                            <div className="preview-content">
                                {renderPreview()}
                            </div>
                        </div>
                        <div className="preview-info">
                            <div>📊 Source: {DATA_SOURCES.find(s => s.value === widgetConfig.dataSource)?.label}</div>
                            <div>📋 Fields: {widgetConfig.fields.join(', ')}</div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}