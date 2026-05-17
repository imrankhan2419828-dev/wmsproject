//import React, { useState } from 'react';
//import { FaSync, FaTimes, FaExpand, FaCompress } from 'react-icons/fa';
//import { useDashboard } from '../../../context/DashboardContext';
//import WidgetContent from './WidgetContent';
//import './DashboardWidget.css';

//const DashboardWidget = ({ widgetId, isEditing, onRemove }) => {
//    const { widgetData, refreshWidget, WIDGET_REGISTRY } = useDashboard();
//    const [isExpanded, setIsExpanded] = useState(false);

//    const widget = WIDGET_REGISTRY[widgetId];
//    const data = widgetData[widgetId];

//    if (!widget) return null;

//    const handleRefresh = (e) => {
//        e.stopPropagation();
//        refreshWidget(widgetId);
//    };

//    const handleRemove = (e) => {
//        e.stopPropagation();
//        if (onRemove) {
//            onRemove(widgetId);
//        }
//    };

//    const handleExpand = (e) => {
//        e.stopPropagation();
//        setIsExpanded(!isExpanded);
//    };

//    return (
//        <>
//            <div className={`dashboard-widget ${isExpanded ? 'expanded' : ''}`}>
//                <div className="widget-header">
//                    <div className="widget-title">
//                        <span className="widget-icon">{widget.icon}</span>
//                        <span className="widget-name">{widget.name}</span>
//                    </div>

//                    <div className="widget-actions">
//                        <button
//                            className="widget-btn"
//                            onClick={handleRefresh}
//                            title="Refresh"
//                        >
//                            <FaSync />
//                        </button>

//                        <button
//                            className="widget-btn"
//                            onClick={handleExpand}
//                            title={isExpanded ? 'Collapse' : 'Expand'}
//                        >
//                            {isExpanded ? <FaCompress /> : <FaExpand />}
//                        </button>

//                        {isEditing && (
//                            <button
//                                className="widget-btn remove"
//                                onClick={handleRemove}
//                                title="Remove"
//                            >
//                                <FaTimes />
//                            </button>
//                        )}
//                    </div>
//                </div>

//                <div className="widget-content">
//                    <WidgetContent
//                        widgetId={widgetId}
//                        data={data}
//                        isLoading={!data}
//                    />
//                </div>
//            </div>

//            {/* Expanded Modal */}
//            {isExpanded && (
//                <div className="widget-modal-overlay" onClick={handleExpand}>
//                    <div className="widget-modal" onClick={(e) => e.stopPropagation()}>
//                        <div className="widget-modal-header">
//                            <div className="widget-title">
//                                <span className="widget-icon">{widget.icon}</span>
//                                <span className="widget-name">{widget.name}</span>
//                            </div>
//                            <button className="widget-btn" onClick={handleExpand}>
//                                <FaTimes />
//                            </button>
//                        </div>
//                        <div className="widget-modal-content">
//                            <WidgetContent
//                                widgetId={widgetId}
//                                data={data}
//                                isLoading={!data}
//                                expanded
//                            />
//                        </div>
//                    </div>
//                </div>
//            )}
//        </>
//    );
//};

//export default DashboardWidget;

import React, { useState } from 'react';
import { FaSync, FaTimes, FaExpand, FaCompress } from 'react-icons/fa';
import { useDashboard } from '../../../context/DashboardContext';
import WidgetContent from './WidgetContent';
import './DashboardWidget.css';

const DashboardWidget = ({ widgetId, isEditing }) => {
    const { widgetData, refreshWidget, removeWidget, WIDGET_REGISTRY } = useDashboard();
    const [isExpanded, setIsExpanded] = useState(false);

    const widget = WIDGET_REGISTRY[widgetId];
    const data = widgetData[widgetId];

    if (!widget) return null;

    return (
        <>
            <div className={`ds-widget ${isExpanded ? 'expanded' : ''}`}>
                <div className="ds-widget-header">
                    <div className="ds-widget-title">
                        <span className="ds-widget-icon">{widget.icon}</span>
                        <span className="ds-widget-name">{widget.name}</span>
                    </div>
                    <div className="ds-widget-actions">
                        <button className="ds-widget-btn" onClick={() => refreshWidget(widgetId)} title="Refresh">
                            <FaSync />
                        </button>
                        <button className="ds-widget-btn" onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? 'Collapse' : 'Expand'}>
                            {isExpanded ? <FaCompress /> : <FaExpand />}
                        </button>
                        {isEditing && (
                            <button className="ds-widget-btn remove" onClick={() => removeWidget(widgetId)} title="Remove">
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </div>
                <div className="ds-widget-content">
                    <WidgetContent widgetId={widgetId} data={data} isLoading={!data} />
                </div>
            </div>

            {isExpanded && (
                <div className="ds-widget-modal-overlay" onClick={() => setIsExpanded(false)}>
                    <div className="ds-widget-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ds-widget-modal-header">
                            <div className="ds-widget-title">
                                <span className="ds-widget-icon">{widget.icon}</span>
                                <span className="ds-widget-name">{widget.name}</span>
                            </div>
                            <button className="ds-widget-btn" onClick={() => setIsExpanded(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="ds-widget-modal-content">
                            <WidgetContent widgetId={widgetId} data={data} isLoading={!data} expanded />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DashboardWidget;