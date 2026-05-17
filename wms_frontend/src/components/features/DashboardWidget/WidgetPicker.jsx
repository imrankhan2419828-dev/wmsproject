// src/components/features/DashboardWidget/WidgetPicker.jsx
import React, { useState } from 'react';
import { Modal } from '../../common/Modal/Modal';
import { Button } from '../../common';
import { FaSearch, FaPlus } from 'react-icons/fa';

export default function WidgetPicker({ onClose, onAddWidget, existingWidgets = [], allWidgets = {} }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedModule, setSelectedModule] = useState('all');

    console.log('WidgetPicker - allWidgets:', allWidgets);
    console.log('WidgetPicker - existingWidgets:', existingWidgets);

    const modules = [
        { id: 'all', name: 'All Widgets' },
        { id: 'financial', name: 'Financial' },
        { id: 'workshop', name: 'Workshop' }
    ];

    // Make sure allWidgets is an object
    const widgetsList = allWidgets && typeof allWidgets === 'object' ? Object.values(allWidgets) : [];

    console.log('WidgetsList:', widgetsList);

    const availableWidgets = widgetsList.filter(widget => {
        if (!widget || !widget.id) return false;
        if (existingWidgets.includes(widget.id)) return false;
        if (selectedModule !== 'all' && widget.module !== selectedModule) return false;
        if (searchTerm && !widget.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    console.log('AvailableWidgets:', availableWidgets);

    const modalFooter = (
        <div className="picker-footer">
            <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
    );

    return (
        <Modal isOpen={true} onClose={onClose} title="Add Widget" size="md" footer={modalFooter}>
            <div className="widget-picker-container">
                <div className="picker-search">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search widgets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="picker-search-input"
                    />
                </div>

                <div className="picker-modules">
                    {modules.map(module => (
                        <button
                            key={module.id}
                            className={`picker-module-btn ${selectedModule === module.id ? 'active' : ''}`}
                            onClick={() => setSelectedModule(module.id)}
                        >
                            {module.name}
                        </button>
                    ))}
                </div>

                <div className="picker-widgets-list">
                    {availableWidgets.length > 0 ? (
                        availableWidgets.map(widget => (
                            <div key={widget.id} className="picker-widget-item">
                                <div className="picker-widget-icon">{widget.icon}</div>
                                <div className="picker-widget-info">
                                    <div className="picker-widget-name">{widget.name}</div>
                                    <div className="picker-widget-module">{widget.module === 'financial' ? '💰 Financial' : '🔧 Workshop'}</div>
                                </div>
                                <button
                                    className="picker-add-btn"
                                    onClick={() => onAddWidget(widget.id)}
                                >
                                    <FaPlus /> Add
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="picker-empty">
                            <p>No widgets available to add</p>
                            <p style={{ fontSize: '12px', marginTop: '8px' }}>Debug: {Object.keys(allWidgets).length} widgets found</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}