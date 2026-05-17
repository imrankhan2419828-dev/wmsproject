import React, { useState } from 'react';
import COATree from '../../components/COA/CoaTree';
import COAPopup from '../../components/COA/COAPopup';
import '../../components/COA/COA.css';

const COAPage = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [popupMode, setPopupMode] = useState('create');
    const [selectedParent, setSelectedParent] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAddRoot = () => {
        setSelectedParent(null);
        setSelectedAccount(null);
        setPopupMode('create');
        setShowPopup(true);
    };

    const handleAddChild = (parent) => {
        setSelectedParent(parent);
        setSelectedAccount(null);
        setPopupMode('create');
        setShowPopup(true);
    };

    const handleEdit = (account) => {
        setSelectedAccount(account);
        setSelectedParent(null);
        setPopupMode('edit');
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setSelectedParent(null);
        setSelectedAccount(null);
    };

    const handleSaved = () => {
        setRefreshKey(prev => prev + 1);
        handleClosePopup();
    };

    return (
        <div className="coa-page">
            <div className="coa-header">
                <div className="coa-title-section">
                    <h1>📊 Chart of Accounts</h1>
                    <p className="coa-subtitle">Manage your account hierarchy</p>
                </div>
                <button className="btn-primary" onClick={handleAddRoot}>
                    <span className="btn-icon">➕</span>
                    Add Root Account
                </button>
            </div>

            <div className="coa-content">
                <COATree
                    key={refreshKey}
                    onAddChild={handleAddChild}
                    onEdit={handleEdit}
                />
            </div>

            {showPopup && (
                <COAPopup
                    mode={popupMode}
                    parent={selectedParent}
                    edit={selectedAccount}
                    onClose={handleClosePopup}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
};

export default COAPage;