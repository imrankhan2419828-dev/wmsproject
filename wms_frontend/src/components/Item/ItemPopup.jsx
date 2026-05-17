import React, { useEffect, useState, useCallback } from "react";
import itemApi from "../../api/itemApi";
import companyApi from "../../api/companyApi";
import categoryApi from "../../api/categoryApi";
import subcategoryApi from "../../api/subcategoryApi";
import godownApi from "../../api/godownApi";
import { Modal } from "../../components/common/Modal/Modal";
import { Input, Button, ReactSelect, useDialog } from "../../components/common";
import { formatNumber } from "../../utils/numberUtils";
import {
    FaBoxes, FaHistory, FaUpload, FaTrash, FaSave, FaTimes,
    FaStore, FaShoppingCart, FaDollarSign, FaImage, FaWarehouse,
    FaChartLine, FaEdit, FaPlus, FaCheck, FaCheckCircle,
    FaTimesCircle, FaExclamationTriangle
} from "react-icons/fa";
import "./ItemPopup.css";

export default function ItemPopup({ item, onClose, onSaved }) {
    const [form, setForm] = useState({
        itemID: 0, itemName: "", modlNumb: "", compID: "", catgID: "", subcatID: "",
        isSparePart: false, barCode: "", ordrLevl: "", max_Levl: "",
        openQnty: "", openRate: "", purcRate: "", saleRate: ""
    });
    const [companies, setCompanies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [godowns, setGodowns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Price Management States
    const [allPrices, setAllPrices] = useState({
        openingPrices: [],
        purchasePrices: [],
        salePrices: [],
        activeOpeningPrice: null,
        activePurchasePrice: null,
        activeSalePrice: null
    });
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [selectedPriceType, setSelectedPriceType] = useState('PURCHASE');
    const [editingPrice, setEditingPrice] = useState(null);
    const [priceModalLoading, setPriceModalLoading] = useState(false);

    const [images, setImages] = useState([]);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [godownOpenings, setGodownOpenings] = useState([]);
    const [activeTab, setActiveTab] = useState("basic");

    const { showSuccess, showError, showConfirm } = useDialog();

    // ==================== ITEM NAME GENERATION ====================
    const generateItemName = useCallback(() => {
        const parts = [];
        const company = companies.find(c => c.compID === parseInt(form.compID));
        if (company?.compName) parts.push(company.compName.trim().toUpperCase());
        const category = categories.find(c => c.catgID === parseInt(form.catgID));
        if (category?.catgName) parts.push(category.catgName.trim().toUpperCase());
        const subcategory = subcategories.find(s => s.subcatID === parseInt(form.subcatID));
        if (subcategory?.subcatName) parts.push(subcategory.subcatName.trim().toUpperCase());
        if (form.modlNumb?.trim()) parts.push(form.modlNumb.trim().toUpperCase());
        const generatedName = parts.join(" - ");
        if (generatedName && generatedName !== form.itemName) setForm(prev => ({ ...prev, itemName: generatedName }));
    }, [form.compID, form.catgID, form.subcatID, form.modlNumb, form.itemName, companies, categories, subcategories]);

    useEffect(() => { const timer = setTimeout(generateItemName, 200); return () => clearTimeout(timer); }, [form.compID, form.catgID, form.subcatID, form.modlNumb, generateItemName]);

    // ==================== INITIAL LOADING ====================
    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                const [companiesRes, categoriesRes, godownsRes] = await Promise.all([
                    companyApi.getAll(),
                    categoryApi.getAll(),
                    godownApi.getAll()
                ]);
                setCompanies(companiesRes.data?.data || companiesRes.data || []);
                setCategories(categoriesRes.data?.data || categoriesRes.data || []);
                setGodowns(godownsRes.data?.data || godownsRes.data || []);
            } catch (err) { console.error("Error loading dropdowns:", err); }
        };
        loadDropdowns();
    }, []);

    useEffect(() => {
        if (form.catgID) {
            const loadSubcats = async () => {
                try {
                    const res = await subcategoryApi.getByCategory(form.catgID);
                    setSubcategories(res.data?.data || res.data || []);
                } catch (err) { setSubcategories([]); }
            };
            loadSubcats();
        } else setSubcategories([]);
    }, [form.catgID]);

    useEffect(() => {
        if (item?.itemID) {
            setForm({
                itemID: item.itemID, itemName: item.itemName || "", modlNumb: item.modlNumb || "",
                compID: item.compID?.toString() || "", catgID: item.catgID?.toString() || "",
                subcatID: item.subcatID?.toString() || "",
                isSparePart: item.isSparePart || false, barCode: item.barCode || "",
                ordrLevl: item.ordrLevl?.toString() || "", max_Levl: item.max_Levl?.toString() || "",
                openQnty: item.openQnty?.toString() || "", openRate: item.openRate?.toString() || "",
                purcRate: item.purcRate?.toString() || "", saleRate: item.saleRate?.toString() || ""
            });
            loadAllPrices(item.itemID);
            loadImages(item.itemID);
            loadGodownOpenings(item.itemID);
        }
    }, [item]);

    // ==================== PRICE MANAGEMENT FUNCTIONS ====================
    const loadAllPrices = async (itemId) => {
        try {
            const res = await itemApi.get(`${API_URL}/${itemId}/prices`);
            setAllPrices(res.data?.data || res.data || {
                openingPrices: [],
                purchasePrices: [],
                salePrices: [],
                activeOpeningPrice: null,
                activePurchasePrice: null,
                activeSalePrice: null
            });
        } catch (err) {
            console.error("Error loading prices:", err);
        }
    };

    const loadImages = async (itemId) => {
        try {
            const res = await itemApi.getItemImages(itemId);
            setImages(res.data?.data || res.data || []);
        } catch (err) { console.error("Error loading images:", err); }
    };

    const loadGodownOpenings = async (itemId) => {
        try {
            const res = await itemApi.getGodownOpenings(itemId);
            setGodownOpenings(res.data?.data || res.data || []);
        } catch (err) { console.error("Error loading godown openings:", err); }
    };

    // Handle Price Activation
    const handleActivatePrice = async (priceId, priceType) => {
        showConfirm(
            `Activate this ${priceType.toLowerCase()} price? All other ${priceType.toLowerCase()} prices will be deactivated.`,
            async () => {
                try {
                    await itemApi.put(`/ItemFile/prices/${priceId}/activate`);
                    showSuccess("Price activated successfully!");
                    loadAllPrices(form.itemID);
                } catch (err) {
                    showError(err.response?.data?.message || "Failed to activate price");
                }
            },
            'Activate Price'
        );
    };

    // Handle Price Delete
    const handleDeletePrice = async (priceId, priceType) => {
        if (priceType === 'OPENING') {
            showError("Cannot delete opening price. Please update it instead.");
            return;
        }

        showConfirm(
            "Are you sure you want to delete this price record?",
            async () => {
                try {
                    await itemApi.delete(`/ItemFile/prices/${priceId}`);
                    showSuccess("Price deleted successfully!");
                    loadAllPrices(form.itemID);
                } catch (err) {
                    showError(err.response?.data?.message || "Failed to delete price");
                }
            },
            'Delete Price'
        );
    };

    // Handle Add/Edit Price Modal Submit
    const handlePriceSubmit = async (priceData) => {
        setPriceModalLoading(true);
        try {
            if (editingPrice) {
                await itemApi.put('/ItemFile/prices', {
                    id: editingPrice.id,
                    price: parseFloat(priceData.price),
                    changeReason: priceData.changeReason
                });
                showSuccess("Price updated successfully!");
            } else {
                await itemApi.post('/ItemFile/prices', {
                    itemID: form.itemID,
                    price: parseFloat(priceData.price),
                    priceType: priceData.priceType,
                    effectiveDate: priceData.effectiveDate,
                    changeReason: priceData.changeReason,
                    activateImmediately: priceData.activateImmediately
                });
                showSuccess("Price added successfully!");
            }
            setShowPriceModal(false);
            setEditingPrice(null);
            loadAllPrices(form.itemID);
        } catch (err) {
            showError(err.response?.data?.message || "Failed to save price");
        } finally {
            setPriceModalLoading(false);
        }
    };

    // Open Add Price Modal
    const openAddPriceModal = (priceType) => {
        setSelectedPriceType(priceType);
        setEditingPrice(null);
        setShowPriceModal(true);
    };

    // Open Edit Price Modal
    const openEditPriceModal = (price) => {
        setEditingPrice(price);
        setSelectedPriceType(price.priceType);
        setShowPriceModal(true);
    };

    // ==================== IMAGES FUNCTIONS ====================
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setUploadingImage(true);
        try {
            const imageUrls = await Promise.all(files.map(file => new Promise(resolve => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            })));

            if (form.itemID) {
                await itemApi.addItemImages(form.itemID, imageUrls);
                loadImages(form.itemID);
                showSuccess("Images uploaded!");
            } else {
                setImages(prev => [...prev, ...imageUrls.map((url, idx) => ({
                    imageURL: url,
                    isPrimary: prev.length === 0 && idx === 0,
                    temp: true
                }))]);
                showSuccess("Images will be saved with item");
            }
        } catch (err) {
            showError("Failed to upload images");
        } finally {
            setUploadingImage(false);
        }
    };

    const deleteImage = async (imageId) => {
        showConfirm("Delete this image?", async () => {
            try {
                await itemApi.deleteItemImage(imageId);
                loadImages(form.itemID);
                showSuccess("Image deleted!");
            } catch (err) {
                showError("Failed to delete image");
            }
        });
    };

    // ==================== GODOWN FUNCTIONS ====================
    const updateGodownOpening = (godownId, value) => {
        const qty = parseFloat(value) || 0;
        const existing = godownOpenings.find(g => g.godownID === godownId);
        if (existing) {
            setGodownOpenings(prev => prev.map(g => g.godownID === godownId ? { ...g, openingQty: qty } : g));
        } else {
            const godown = godowns.find(g => g.godnID === godownId);
            setGodownOpenings(prev => [...prev, {
                godownID: godownId,
                godownName: godown?.godnName || `Godown ${godownId}`,
                openingQty: qty
            }]);
        }
    };

    const saveGodownOpenings = async () => {
        if (!form.itemID) {
            showError("Please save the item first");
            return;
        }
        try {
            await itemApi.saveGodownOpenings({
                itemID: form.itemID,
                openings: godownOpenings
                    .filter(g => g.openingQty > 0)
                    .map(g => ({ godownID: g.godownID, openingQty: g.openingQty }))
            });
            showSuccess("Godown openings saved!");
        } catch (err) {
            showError("Failed to save godown openings");
        }
    };

    // ==================== FIXED REACT SELECT HANDLERS ====================

    // Get selected option object for React Select
    const getSelectedCompany = () => {
        if (!form.compID) return null;
        const company = companies.find(c => c.compID?.toString() === form.compID);
        return company ? { value: company.compID.toString(), label: company.compName } : null;
    };

    const getSelectedCategory = () => {
        if (!form.catgID) return null;
        const category = categories.find(c => c.catgID?.toString() === form.catgID);
        return category ? { value: category.catgID.toString(), label: category.catgName } : null;
    };

    const getSelectedSubcategory = () => {
        if (!form.subcatID) return null;
        const subcategory = subcategories.find(s => s.subcatID?.toString() === form.subcatID);
        return subcategory ? { value: subcategory.subcatID.toString(), label: subcategory.subcatName } : null;
    };

    // Handle Company Select
    const handleCompanyChange = (selectedOption) => {
        const value = selectedOption ? selectedOption.value : "";
        setForm(prev => ({ ...prev, compID: value }));
    };

    // Handle Category Select - also resets subcategory
    const handleCategoryChange = (selectedOption) => {
        const value = selectedOption ? selectedOption.value : "";
        setForm(prev => ({ ...prev, catgID: value, subcatID: "" }));
    };

    // Handle Subcategory Select
    const handleSubcategoryChange = (selectedOption) => {
        const value = selectedOption ? selectedOption.value : "";
        setForm(prev => ({ ...prev, subcatID: value }));
    };

    // Handle regular input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setForm(prev => ({ ...prev, [name]: newValue }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.itemName?.trim()) newErrors.itemName = "Item name is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const payload = {
                itemName: form.itemName,
                modlNumb: form.modlNumb || "",
                compID: form.compID ? parseInt(form.compID) : null,
                catgID: form.catgID ? parseInt(form.catgID) : null,
                subcatID: form.subcatID ? parseInt(form.subcatID) : null,
                isSparePart: form.isSparePart,
                barCode: form.barCode || null,
                ordrLevl: form.ordrLevl ? parseInt(form.ordrLevl) : null,
                max_Levl: form.max_Levl ? parseInt(form.max_Levl) : null,
                openQnty: form.openQnty ? parseFloat(form.openQnty) : 0,
                openRate: form.openRate ? parseFloat(form.openRate) : 0,
                purcRate: form.purcRate ? parseFloat(form.purcRate) : 0,
                saleRate: form.saleRate ? parseFloat(form.saleRate) : 0
            };

            let itemId;
            if (form.itemID) {
                payload.itemID = form.itemID;
                await itemApi.update(payload);
                itemId = form.itemID;
            } else {
                const res = await itemApi.create(payload);
                itemId = res.data?.data?.itemId || res.data?.itemId;
            }

            // Save temp images if new item
            const tempImages = images.filter(img => img.temp);
            if (tempImages.length > 0 && itemId) {
                await itemApi.addItemImages(itemId, tempImages.map(img => img.imageURL));
            }

            // Save godown openings
            const validOpenings = godownOpenings.filter(g => g.openingQty > 0);
            if (validOpenings.length > 0 && itemId) {
                await itemApi.saveGodownOpenings({
                    itemID: itemId,
                    openings: validOpenings.map(g => ({ godownID: g.godownID, openingQty: g.openingQty }))
                });
            }

            onSaved();
            onClose();
            setTimeout(() => showSuccess(form.itemID ? 'Item updated!' : 'Item created!'), 100);
        } catch (err) {
            showError(err.response?.data?.message || "Failed to save item");
        } finally {
            setLoading(false);
        }
    };

    // ==================== OPTIONS ====================
    const companyOptions = companies.map(c => ({ value: c.compID?.toString(), label: c.compName }));
    const categoryOptions = categories.map(c => ({ value: c.catgID?.toString(), label: c.catgName }));
    const subcategoryOptions = subcategories.map(s => ({ value: s.subcatID?.toString(), label: s.subcatName }));

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={<><FaBoxes /> {form.itemID ? "Edit Item" : "Add New Item"}</>}
            size="xxl"
            footer={
                <div className="popup-footer">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave} loading={loading}>
                        {form.itemID ? "Update Item" : "Save Item"}
                    </Button>
                </div>
            }
        >
            <div className="item-popup-container">
                {/* Tabs */}
                <div className="item-tabs">
                    <button
                        className={`item-tab ${activeTab === 'basic' ? 'active' : ''}`}
                        onClick={() => setActiveTab('basic')}
                    >
                        <FaBoxes /> Basic
                    </button>
                    <button
                        className={`item-tab ${activeTab === 'pricing' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pricing')}
                    >
                        <FaChartLine /> Price Management
                    </button>
                    <button
                        className={`item-tab ${activeTab === 'images' ? 'active' : ''}`}
                        onClick={() => setActiveTab('images')}
                    >
                        <FaImage /> Images ({images.length})
                    </button>
                    <button
                        className={`item-tab ${activeTab === 'godown' ? 'active' : ''}`}
                        onClick={() => setActiveTab('godown')}
                    >
                        <FaWarehouse /> Godown
                    </button>
                </div>

                <div className="item-tab-content">
                    {/* BASIC TAB */}
                    {activeTab === 'basic' && (
                        <div className="basic-tab-content">
                            <div className="form-row-4">
                                <Input
                                    label="Model Number"
                                    name="modlNumb"
                                    value={form.modlNumb}
                                    onChange={handleInputChange}
                                    placeholder="Model #"
                                    disabled={loading}
                                />
                                <Input
                                    label="Barcode"
                                    name="barCode"
                                    value={form.barCode}
                                    onChange={handleInputChange}
                                    placeholder="Barcode"
                                    disabled={loading}
                                />

                                {/* FIXED: React Select with proper value binding */}
                                <ReactSelect
                                    label="Company"
                                    value={getSelectedCompany()}
                                    onChange={handleCompanyChange}
                                    options={companyOptions}
                                    placeholder="Select Company"
                                    isDisabled={loading}
                                />

                                <ReactSelect
                                    label="Category"
                                    value={getSelectedCategory()}
                                    onChange={handleCategoryChange}
                                    options={categoryOptions}
                                    placeholder="Select Category"
                                    isDisabled={loading}
                                />
                            </div>
                            <div className="form-row-4">
                                <ReactSelect
                                    label="Subcategory"
                                    value={getSelectedSubcategory()}
                                    onChange={handleSubcategoryChange}
                                    options={subcategoryOptions}
                                    placeholder={!form.catgID ? "Select Category First" : "Select Subcategory"}
                                    isDisabled={loading || !form.catgID}
                                />
                                <Input
                                    label="Order Level"
                                    name="ordrLevl"
                                    type="number"
                                    value={form.ordrLevl}
                                    onChange={handleInputChange}
                                    placeholder="Reorder"
                                    disabled={loading}
                                />
                                <Input
                                    label="Max Level"
                                    name="max_Levl"
                                    type="number"
                                    value={form.max_Levl}
                                    onChange={handleInputChange}
                                    placeholder="Max"
                                    disabled={loading}
                                />
                                <div className="checkbox-field-compact">
                                    <label className="checkbox-label-compact">
                                        <input
                                            type="checkbox"
                                            name="isSparePart"
                                            checked={form.isSparePart}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                        />
                                        <span className="checkbox-custom"></span>
                                        <span className="checkbox-text">Spare Part</span>
                                    </label>
                                </div>
                            </div>
                            <div className="form-row-full">
                                <Input
                                    label="Item Name"
                                    name="itemName"
                                    value={form.itemName}
                                    onChange={handleInputChange}
                                    error={errors.itemName}
                                    required
                                    disabled={loading}
                                    placeholder="Auto-generated"
                                />
                            </div>
                            <div className="form-row-single" style={{ marginTop: '1rem' }}>
                                <Input
                                    label="Opening Quantity"
                                    name="openQnty"
                                    type="number"
                                    value={form.openQnty}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    )}

                    {/* PRICE MANAGEMENT TAB */}
                    {activeTab === 'pricing' && (
                        <div className="price-management-container">
                            {!form.itemID ? (
                                <div className="price-warning">
                                    <FaExclamationTriangle />
                                    <p>Please save the item first to manage prices</p>
                                </div>
                            ) : (
                                <>
                                    <PriceSection
                                        title="Opening Price"
                                        icon={<FaStore />}
                                        priceType="OPENING"
                                        prices={allPrices.openingPrices}
                                        activePrice={allPrices.activeOpeningPrice}
                                        onActivate={handleActivatePrice}
                                        onDelete={handleDeletePrice}
                                        onEdit={openEditPriceModal}
                                        onAdd={() => openAddPriceModal('OPENING')}
                                        showAddButton={allPrices.openingPrices.length === 0}
                                        isOpening={true}
                                    />

                                    <PriceSection
                                        title="Purchase Prices"
                                        icon={<FaShoppingCart />}
                                        priceType="PURCHASE"
                                        prices={allPrices.purchasePrices}
                                        activePrice={allPrices.activePurchasePrice}
                                        onActivate={handleActivatePrice}
                                        onDelete={handleDeletePrice}
                                        onEdit={openEditPriceModal}
                                        onAdd={() => openAddPriceModal('PURCHASE')}
                                        showAddButton={true}
                                    />

                                    <PriceSection
                                        title="Sale Prices"
                                        icon={<FaDollarSign />}
                                        priceType="SALE"
                                        prices={allPrices.salePrices}
                                        activePrice={allPrices.activeSalePrice}
                                        onActivate={handleActivatePrice}
                                        onDelete={handleDeletePrice}
                                        onEdit={openEditPriceModal}
                                        onAdd={() => openAddPriceModal('SALE')}
                                        showAddButton={true}
                                    />
                                </>
                            )}
                        </div>
                    )}

                    {/* IMAGES TAB */}
                    {activeTab === 'images' && (
                        <div className="images-tab-content">
                            <label className="upload-btn">
                                <FaUpload /> Upload Images
                                <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                            </label>
                            {uploadingImage && <p className="uploading-text">Uploading...</p>}
                            <div className="image-grid">
                                {images.map((img, idx) => (
                                    <div key={img.imageID || idx} className="image-item">
                                        <img src={img.imageURL} alt={`Item ${idx + 1}`} />
                                        {!img.temp && (
                                            <button className="delete-image-btn" onClick={() => deleteImage(img.imageID)}>
                                                <FaTrash />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* GODOWN TAB */}
                    {activeTab === 'godown' && (
                        <div className="godown-tab-content">
                            {godowns.map(g => (
                                <div key={g.godnID} className="godown-row">
                                    <label>{g.godnName}</label>
                                    <input
                                        type="number"
                                        value={godownOpenings.find(go => go.godownID === g.godnID)?.openingQty || ''}
                                        onChange={(e) => updateGodownOpening(g.godnID, e.target.value)}
                                        className="godown-input"
                                        placeholder="0"
                                    />
                                </div>
                            ))}
                            {form.itemID && (
                                <Button variant="secondary" onClick={saveGodownOpenings}>
                                    <FaSave /> Save Openings
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ADD/EDIT PRICE MODAL */}
            {showPriceModal && (
                <PriceFormModal
                    isOpen={showPriceModal}
                    onClose={() => {
                        setShowPriceModal(false);
                        setEditingPrice(null);
                    }}
                    priceType={selectedPriceType}
                    onSubmit={handlePriceSubmit}
                    loading={priceModalLoading}
                    initialData={editingPrice}
                />
            )}
        </Modal>
    );
}

// ==================== PRICE SECTION COMPONENT ====================
const PriceSection = ({
    title, icon, priceType, prices, activePrice,
    onActivate, onDelete, onEdit, onAdd, showAddButton, isOpening
}) => {
    return (
        <div className="price-section-card">
            <div className="price-section-header">
                <h4>
                    {icon} {title}
                </h4>
                {showAddButton && (
                    <Button size="sm" variant="primary" onClick={onAdd}>
                        <FaPlus /> Add {isOpening ? 'Opening Price' : 'Price'}
                    </Button>
                )}
            </div>

            {activePrice && (
                <div className="active-price-banner">
                    <FaCheckCircle className="active-icon" />
                    <div className="active-price-info">
                        <span className="active-label">Active {title}:</span>
                        <strong> {formatNumber(activePrice.price)}</strong>
                        <small>Since {activePrice.formattedDate}</small>
                    </div>
                </div>
            )}

            <div className="price-table-container">
                <table className="price-history-table">
                    <thead>
                        <tr>
                            <th>Price</th>
                            <th>Effective Date</th>
                            <th>Status</th>
                            <th>Reason</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prices.length > 0 ? (
                            prices.map(price => (
                                <tr
                                    key={price.id}
                                    className={price.isActive ? 'price-active-row' : ''}
                                >
                                    <td className="price-value-cell">
                                        {formatNumber(price.price)}
                                    </td>
                                    <td>{price.formattedDate || new Date(price.effectiveDate).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge ${price.isActive ? 'status-active' : 'status-inactive'}`}>
                                            {price.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="reason-cell">
                                        {price.changeReason || '-'}
                                    </td>
                                    <td>
                                        <div className="price-actions">
                                            {!price.isActive && !isOpening && (
                                                <button
                                                    className="price-action-btn activate"
                                                    onClick={() => onActivate(price.id, priceType)}
                                                    title="Activate this price"
                                                >
                                                    <FaCheck />
                                                </button>
                                            )}
                                            <button
                                                className="price-action-btn edit"
                                                onClick={() => onEdit(price)}
                                                title="Edit price"
                                            >
                                                <FaEdit />
                                            </button>
                                            {!price.isActive && (
                                                <button
                                                    className="price-action-btn delete"
                                                    onClick={() => onDelete(price.id, priceType)}
                                                    title="Delete price"
                                                >
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-prices">
                                    <FaExclamationTriangle className="no-data-icon" />
                                    <p>No {title.toLowerCase()}</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ==================== PRICE FORM MODAL COMPONENT ====================
const PriceFormModal = ({ isOpen, onClose, priceType, onSubmit, loading, initialData }) => {
    const [form, setForm] = useState({
        price: initialData?.price || '',
        effectiveDate: initialData?.effectiveDate
            ? new Date(initialData.effectiveDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        changeReason: initialData?.changeReason || '',
        activateImmediately: !initialData,
        priceType: priceType
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.price || parseFloat(form.price) <= 0) {
            alert('Please enter a valid price greater than 0');
            return;
        }
        onSubmit(form);
    };

    const getPriceTypeLabel = () => {
        switch (priceType) {
            case 'OPENING': return 'Opening Price';
            case 'PURCHASE': return 'Purchase Price';
            case 'SALE': return 'Sale Price';
            default: return priceType;
        }
    };

    const getPriceTypeIcon = () => {
        switch (priceType) {
            case 'OPENING': return <FaStore />;
            case 'PURCHASE': return <FaShoppingCart />;
            case 'SALE': return <FaDollarSign />;
            default: return <FaChartLine />;
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={<>{getPriceTypeIcon()} {initialData ? 'Update' : 'Add'} {getPriceTypeLabel()}</>}
            size="md"
            footer={
                <div className="popup-footer">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} loading={loading}>
                        {initialData ? 'Update' : 'Add'} Price
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="price-form">
                <div className="price-form-group">
                    <label>Price *</label>
                    <input
                        type="number"
                        step="0.01"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="Enter price"
                        required
                        autoFocus
                        disabled={loading}
                    />
                </div>

                {!initialData && (
                    <div className="price-form-group">
                        <label>Effective Date</label>
                        <input
                            type="date"
                            name="effectiveDate"
                            value={form.effectiveDate}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                )}

                <div className="price-form-group">
                    <label>Change Reason</label>
                    <textarea
                        name="changeReason"
                        value={form.changeReason}
                        onChange={handleChange}
                        placeholder="e.g., Market adjustment, Supplier update"
                        rows="3"
                        disabled={loading}
                    />
                </div>

                {!initialData && priceType !== 'OPENING' && (
                    <div className="price-form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="activateImmediately"
                                checked={form.activateImmediately}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            <span>Activate immediately (deactivates current active price)</span>
                        </label>
                    </div>
                )}

                {priceType === 'OPENING' && !initialData && (
                    <div className="price-info-note">
                        <FaExclamationTriangle />
                        <span>Opening price will be saved once. You can update it later.</span>
                    </div>
                )}
            </form>
        </Modal>
    );
};

const API_URL = "/ItemFile";