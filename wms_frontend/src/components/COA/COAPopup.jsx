import React, { useState, useEffect } from 'react';
import { createCoa, updateCoa, getParentOptions } from '../../api/coaApi';
import './COA.css';

const CATEGORIES = {
    Customer: { label: 'Customer', icon: '👤', parentHint: 'Accounts Receivable' },
    Supplier: { label: 'Supplier', icon: '🏭', parentHint: 'Accounts Payable' },
    Bank: { label: 'Bank', icon: '🏦', parentHint: 'Bank Accounts / Cash & Bank' },
    'Cash & Bank': { label: 'Cash & Bank', icon: '🏦', parentHint: 'Cash & Bank' },
    Expense: { label: 'Expense', icon: '💰', parentHint: 'Expense Accounts' },
    Revenue: { label: 'Revenue', icon: '📈', parentHint: 'Revenue Accounts' },
    Other: { label: 'Other', icon: '📦', parentHint: 'Other Accounts' }
};

const COAPopup = ({ mode, parent, edit, onClose, onSaved }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [parentOptions, setParentOptions] = useState([]);
    const [selectedParent, setSelectedParent] = useState(null);

    const [acctName, setAcctName] = useState('');
    const [normalSide, setNormalSide] = useState('');
    const [isControlAccount, setIsControlAccount] = useState(true);
    const [category, setCategory] = useState('');
    const [openingBalance, setOpeningBalance] = useState('');
    const [description, setDescription] = useState('');
    const [active, setActive] = useState(true);

    const [isRoot, setIsRoot] = useState(true);
    const [parentLevel, setParentLevel] = useState(0);
    const [isEditMode, setIsEditMode] = useState(false);

    // ====================================================================
    // INITIALIZATION: Edit Mode
    // ====================================================================
    useEffect(() => {
        if (mode === 'edit' && edit) {
            setIsEditMode(true);
            setAcctName(edit.acctName || '');
            setNormalSide(edit.normalSide || '');
            setIsControlAccount(edit.isControlAccount || false);
            setActive(edit.active !== false);
            setCategory(edit.accountCategory || '');
            setOpeningBalance(edit.openAmnt ? edit.openAmnt.toString() : '');
            setDescription(edit.acctDesc || '');
            setIsRoot(!edit.prntCode);
        }
    }, [mode, edit]);

    // ====================================================================
    // INITIALIZATION: Create Mode
    // ====================================================================
    useEffect(() => {
        if (mode === 'create') {
            setIsEditMode(false);
            const isRootAccount = !parent;
            setIsRoot(isRootAccount);

            if (!isRootAccount && parent) {
                setParentLevel(parent.level || 0);
                setNormalSide(parent.normalSide || '');

                // ============================================================
                // FIX: Auto-set category from parent's AccountCategory
                // ============================================================
                if (parent.accountCategory) {
                    setCategory(parent.accountCategory);
                }

                // Determine if this should be a control account
                // Level 0,1,2 parents ke children control accounts hote hain
                // Level 3 control account ke children leaf accounts hote hain
                if ((parent.level || 0) <= 2) {
                    setIsControlAccount(true);
                } else if ((parent.level || 0) >= 3 && parent.isControlAccount) {
                    setIsControlAccount(false);
                }
            }
        }
    }, [mode, parent]);

    // ====================================================================
    // LOAD PARENT OPTIONS
    // ====================================================================
    useEffect(() => {
        if (isEditMode) return;
        if (isRoot || mode === 'edit') return;

        const loadParents = async () => {
            try {
                let levelParam = null;
                let categoryParam = null;

                if (parentLevel === 0) levelParam = 0;
                else if (parentLevel === 1) levelParam = 1;
                else if (parentLevel === 2) levelParam = 2;
                else if (parentLevel === 3) {
                    levelParam = 3;
                    if (!isControlAccount && category) {
                        categoryParam = category;
                    }
                }

                const response = await getParentOptions(levelParam, null, categoryParam);
                setParentOptions(response.data?.data || []);
            } catch (err) {
                console.error('Error loading parents:', err);
            }
        };

        loadParents();
    }, [isRoot, parentLevel, category, mode, isEditMode, isControlAccount]);

    // ====================================================================
    // SAVE HANDLER
    // ====================================================================
    const handleSave = async () => {
        if (!acctName.trim()) {
            setError('Account Name is required');
            return;
        }

        // ================================================================
        // EDIT MODE
        // ================================================================
        if (isEditMode) {
            setLoading(true);
            setError('');

            try {
                const updateData = {
                    acctID: edit.acctID,
                    AcctName: acctName,
                    Active: active,
                    AcctType: edit.acctType,
                    IsControlAccount: isControlAccount,
                    AccountCategory: category || null
                };
                await updateCoa(updateData);
                onSaved();
            } catch (err) {
                console.error('Update error:', err);
                setError(err.response?.data?.message || 'Failed to update account');
            } finally {
                setLoading(false);
            }
            return;
        }

        // ================================================================
        // CREATE MODE - VALIDATION
        // ================================================================
        if (isRoot && !normalSide) {
            setError('Please select Normal Side (Dr or Cr) for root account');
            return;
        }

        if (!isRoot && !selectedParent && !parent) {
            setError('Please select a parent account');
            return;
        }

        if (!isRoot && !isControlAccount && !category) {
            setError('Please select a category for leaf account');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let createData = {};

            // ============================================================
            // ROOT ACCOUNT
            // ============================================================
            if (isRoot) {
                createData = {
                    AcctName: acctName,
                    PrntCode: null,
                    NormalSide: normalSide,
                    Active: active,
                    IsControlAccount: isControlAccount,
                    AccountCategory: null,
                    OpenAmnt: 0,
                    AcctDesc: null
                };
            }
            // ============================================================
            // CHILD ACCOUNT
            // ============================================================
            else {
                const parentAccount = selectedParent || parent;
                if (!parentAccount) {
                    throw new Error('Parent account not selected');
                }

                // ============================================================
                // FIX: Inherit AccountCategory from parent if not explicitly set
                // ============================================================
                let finalCategory = category || null;

                // If creating a leaf account and no category selected, inherit from parent
                if (!isControlAccount && !finalCategory && parentAccount.accountCategory) {
                    finalCategory = parentAccount.accountCategory;
                }

                // If creating a control account under a control account, inherit category
                if (isControlAccount && !finalCategory && parentAccount.accountCategory) {
                    finalCategory = parentAccount.accountCategory;
                }

                createData = {
                    AcctName: acctName,
                    PrntCode: parentAccount.acctCode,
                    NormalSide: parentAccount.normalSide,
                    Active: active,
                    IsControlAccount: isControlAccount,
                    AccountCategory: finalCategory,
                    OpenAmnt: !isControlAccount ? (parseFloat(openingBalance) || 0) : 0,
                    AcctDesc: !isControlAccount ? description : null
                };
            }

            await createCoa(createData);
            onSaved();
        } catch (err) {
            console.error('Save error:', err);
            setError(err.response?.data?.message || 'Failed to save account');
        } finally {
            setLoading(false);
        }
    };

    // ====================================================================
    // FORM RENDERERS
    // ====================================================================

    const renderRootForm = () => (
        <div className="coa-form-step">
            <div className="coa-step-header">
                <span className="coa-step-badge root">🏠</span>
                <h3>Create Root Account</h3>
                <p>Create a new top-level account (e.g., Assets, Liabilities)</p>
            </div>

            <div className="coa-form-group">
                <label>Account Name <span className="required">*</span></label>
                <input
                    type="text"
                    placeholder="e.g., Assets, Liabilities, Equity"
                    value={acctName}
                    onChange={(e) => setAcctName(e.target.value)}
                    className="coa-input"
                />
            </div>

            <div className="coa-form-group">
                <label>Normal Side <span className="required">*</span></label>
                <div className="coa-side-options">
                    <label className={`coa-side-option ${normalSide === 'Dr' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name="normalSide"
                            value="Dr"
                            checked={normalSide === 'Dr'}
                            onChange={(e) => setNormalSide(e.target.value)}
                        />
                        <span className="coa-side-icon">📉</span>
                        <span className="coa-side-label">Debit (Dr)</span>
                        <small>For Asset & Expense accounts</small>
                    </label>
                    <label className={`coa-side-option ${normalSide === 'Cr' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name="normalSide"
                            value="Cr"
                            checked={normalSide === 'Cr'}
                            onChange={(e) => setNormalSide(e.target.value)}
                        />
                        <span className="coa-side-icon">📈</span>
                        <span className="coa-side-label">Credit (Cr)</span>
                        <small>For Liability, Equity & Revenue</small>
                    </label>
                </div>
            </div>

            <div className="coa-form-group coa-checkbox-group">
                <label className="coa-checkbox-label">
                    <input
                        type="checkbox"
                        checked={isControlAccount}
                        onChange={(e) => setIsControlAccount(e.target.checked)}
                    />
                    <span>Control Account (Parent account that can have children)</span>
                </label>
            </div>

            <div className="coa-form-group coa-checkbox-group">
                <label className="coa-checkbox-label">
                    <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                    />
                    <span>Active Account</span>
                </label>
            </div>

            <div className="coa-info-note">
                <span>ℹ️</span>
                <small>Root accounts appear at the top level of your Chart of Accounts.</small>
            </div>
        </div>
    );

    const renderControlForm = () => (
        <div className="coa-form-step">
            <div className="coa-step-header">
                <span className="coa-step-badge control">📁</span>
                <h3>Create Control Account</h3>
                <p>Create a parent account that can have child accounts</p>
            </div>

            <div className="coa-form-group">
                <label>Parent Account <span className="required">*</span></label>
                <select
                    value={selectedParent?.acctID || parent?.acctID || ''}
                    onChange={(e) => {
                        const parentObj = parentOptions.find(p => p.acctID === parseInt(e.target.value));
                        setSelectedParent(parentObj);
                        // Inherit category from selected parent
                        if (parentObj?.accountCategory) {
                            setCategory(parentObj.accountCategory);
                        }
                    }}
                    className="coa-select"
                >
                    <option value="">-- Select Parent Account --</option>
                    {parentOptions.map(opt => (
                        <option key={opt.acctID} value={opt.acctID}>
                            {opt.acctCode} - {opt.acctName} {opt.accountCategory ? `[${opt.accountCategory}]` : ''}
                        </option>
                    ))}
                </select>
            </div>

            <div className="coa-form-group">
                <label>Account Name <span className="required">*</span></label>
                <input
                    type="text"
                    placeholder="Enter account name"
                    value={acctName}
                    onChange={(e) => setAcctName(e.target.value)}
                    className="coa-input"
                />
            </div>

            <div className="coa-form-group">
                <label>Normal Side</label>
                <input
                    type="text"
                    value={normalSide === 'Dr' ? 'Debit (Dr)' : 'Credit (Cr)'}
                    disabled
                    className="coa-input coa-input-readonly"
                />
                <small>Inherited from parent account</small>
            </div>

            <div className="coa-form-group coa-checkbox-group">
                <label className="coa-checkbox-label">
                    <input
                        type="checkbox"
                        checked={isControlAccount}
                        onChange={(e) => setIsControlAccount(e.target.checked)}
                    />
                    <span>Control Account (Can have child accounts)</span>
                </label>
            </div>

            <div className="coa-form-group coa-checkbox-group">
                <label className="coa-checkbox-label">
                    <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                    />
                    <span>Active Account</span>
                </label>
            </div>

            {/* Show inherited category */}
            {category && (
                <div className="coa-info-note">
                    <span>📂</span>
                    <small>Category: <strong>{category}</strong> (inherited from parent)</small>
                </div>
            )}

            <div className="coa-info-note">
                <span>ℹ️</span>
                <small>Control accounts can have child accounts. Transactions cannot be posted directly to control accounts.</small>
            </div>
        </div>
    );

    const renderLeafForm = () => (
        <div className="coa-form-step">
            <div className="coa-step-header">
                <span className="coa-step-badge leaf">📄</span>
                <h3>Create Detail Account</h3>
                <p>Create a leaf account for Customers, Suppliers, Banks, etc.</p>
            </div>

            <div className="coa-form-group">
                <label>Parent Control Account <span className="required">*</span></label>
                <select
                    value={selectedParent?.acctID || parent?.acctID || ''}
                    onChange={(e) => {
                        const parentObj = parentOptions.find(p => p.acctID === parseInt(e.target.value));
                        setSelectedParent(parentObj);
                        // Inherit category from selected parent
                        if (parentObj?.accountCategory) {
                            setCategory(parentObj.accountCategory);
                        }
                    }}
                    className="coa-select"
                >
                    <option value="">-- Select Parent Account --</option>
                    {parentOptions.map(opt => (
                        <option key={opt.acctID} value={opt.acctID}>
                            {opt.acctCode} - {opt.acctName} {opt.accountCategory ? `[${opt.accountCategory}]` : ''}
                        </option>
                    ))}
                </select>
                {category && (
                    <small className="coa-hint">Hint: Look for {CATEGORIES[category]?.parentHint} accounts</small>
                )}
            </div>

            <div className="coa-form-group">
                <label>Category (Type) <span className="required">*</span></label>
                <div className="coa-category-options">
                    {Object.entries(CATEGORIES).map(([key, val]) => (
                        <label key={key} className={`coa-category-option ${category === key ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="category"
                                value={key}
                                checked={category === key}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                            <span className="coa-category-icon">{val.icon}</span>
                            <span className="coa-category-label">{val.label}</span>
                        </label>
                    ))}
                </div>
                {category && (
                    <small className="coa-hint">
                        {category === (parent?.accountCategory || selectedParent?.accountCategory)
                            ? '✅ Inherited from parent account'
                            : 'Selected category'}
                    </small>
                )}
            </div>

            <div className="coa-form-group">
                <label>Account Name <span className="required">*</span></label>
                <input
                    type="text"
                    placeholder="e.g., Customer Name, Supplier Name, Bank Name"
                    value={acctName}
                    onChange={(e) => setAcctName(e.target.value)}
                    className="coa-input"
                />
            </div>

            <div className="coa-form-group">
                <label>Normal Side</label>
                <input
                    type="text"
                    value={normalSide === 'Dr' ? 'Debit (Dr)' : 'Credit (Cr)'}
                    disabled
                    className="coa-input coa-input-readonly"
                />
                <small>Inherited from parent control account</small>
            </div>

            <div className="coa-form-group">
                <label>Opening Balance</label>
                <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    className="coa-input"
                />
            </div>

            <div className="coa-form-group">
                <label>Description</label>
                <textarea
                    placeholder="Additional details (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    className="coa-textarea"
                />
            </div>

            <div className="coa-form-group coa-checkbox-group">
                <label className="coa-checkbox-label">
                    <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                    />
                    <span>Active Account</span>
                </label>
            </div>

            <div className="coa-info-note">
                <span>ℹ️</span>
                <small>This is a leaf account. Transactions can be posted directly to this account.</small>
            </div>
        </div>
    );

    const renderEditMode = () => (
        <div className="coa-form-step">
            <div className="coa-step-header">
                <span className="coa-step-badge edit">✏️</span>
                <h3>Edit Account</h3>
                <p>Editing: {edit?.acctCode} - {edit?.acctName}</p>
            </div>

            <div className="coa-form-group">
                <label>Account Name <span className="required">*</span></label>
                <input
                    type="text"
                    value={acctName}
                    onChange={(e) => setAcctName(e.target.value)}
                    className="coa-input"
                />
            </div>

            {!isRoot && (
                <div className="coa-form-group coa-checkbox-group">
                    <label className="coa-checkbox-label">
                        <input
                            type="checkbox"
                            checked={isControlAccount}
                            onChange={(e) => setIsControlAccount(e.target.checked)}
                            disabled={edit?.hasChildren}
                        />
                        <span>Control Account</span>
                    </label>
                    {edit?.hasChildren && <small className="coa-hint">Cannot change because this account has children</small>}
                </div>
            )}

            {!isControlAccount && !isRoot && (
                <div className="coa-form-group">
                    <label>Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="coa-select">
                        <option value="">-- Select Category --</option>
                        {Object.entries(CATEGORIES).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                        ))}
                    </select>
                </div>
            )}

            {!isControlAccount && !isRoot && (
                <>
                    <div className="coa-form-group">
                        <label>Opening Balance</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={openingBalance}
                            onChange={(e) => setOpeningBalance(e.target.value)}
                            disabled
                            className="coa-input coa-input-readonly"
                        />
                        <small>Opening balance cannot be edited. Create a journal entry to adjust balance.</small>
                    </div>

                    <div className="coa-form-group">
                        <label>Description</label>
                        <textarea
                            placeholder="Additional details"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            className="coa-textarea"
                        />
                    </div>
                </>
            )}

            <div className="coa-form-group coa-checkbox-group">
                <label className="coa-checkbox-label">
                    <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                    />
                    <span>Active Account</span>
                </label>
            </div>

            <div className="coa-info-note">
                <span>⚠️</span>
                <small>To change opening balance, please create a journal entry instead.</small>
            </div>
        </div>
    );

    // ====================================================================
    // MAIN RENDER
    // ====================================================================
    return (
        <div className="coa-modal-overlay">
            <div className="coa-modal-container coa-modal-lg">
                {/* Header */}
                <div className="coa-modal-header-premium">
                    <div className="coa-modal-title-section">
                        <span className="coa-modal-title-icon">
                            {mode === 'edit' ? '✏️' : '➕'}
                        </span>
                        <div>
                            <h2>{mode === 'edit' ? 'Edit Account' : 'Add New Account'}</h2>
                            <p className="coa-modal-subtitle">
                                {mode === 'edit'
                                    ? `Modify account details`
                                    : `Create a new account in your chart`}
                            </p>
                        </div>
                    </div>
                    <button className="coa-modal-close-premium" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="coa-modal-body-premium">
                    {error && (
                        <div className="coa-error-message">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {mode === 'edit' ? renderEditMode() : (
                        <>
                            {isRoot && renderRootForm()}
                            {!isRoot && isControlAccount && renderControlForm()}
                            {!isRoot && !isControlAccount && renderLeafForm()}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="coa-modal-footer-premium">
                    <button
                        className="coa-btn coa-btn-cancel"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className="coa-btn coa-btn-save"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="btn-spinner"></span>
                                Saving...
                            </>
                        ) : (
                            mode === 'edit' ? 'Update Account' : 'Create Account'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default COAPopup;