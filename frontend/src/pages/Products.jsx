import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getStatistics } from "../services/statisticsApi";
import "../styles/products.css";


const PAGE_SIZE = 9;

function Products() {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [page, setPage] = useState(1);

  /* BUY PRODUCT */
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [buyQty, setBuyQty] = useState("");
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState("");

  /* ADD PRODUCT STATES */
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);

  /* PRODUCT IMAGE (SINGLE ADD ONLY) */
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  /* CSV UPLOAD STATES */
  const [showCsvUpload, setShowCsvUpload] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvError, setCsvError] = useState("");

  const [newProduct, setNewProduct] = useState({
    name: "",
    productId: "",
    category: "",
    price: "",
    quantity: "",
    unit: "",
    expiryDate: "",
    threshold: "",
    image: "",
  });


  const token = localStorage.getItem("token");

  /* ---------- HELPERS ---------- */
  const getStatusLabel = (p) => {
    if (p.quantity <= 0) return "Out of stock";
    if (p.quantity <= p.threshold) return "Low stock";
    return "In stock";
  };

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  ).sort();

  /* ---------- FETCH STATS ---------- */
  useEffect(() => {
    getStatistics()
      .then((data) => {
        setStats(data);
        setLoadingStats(false);
      })
      .catch(() => setLoadingStats(false));
  }, []);

  /* ---------- FETCH PRODUCTS ---------- */
  const fetchProducts = async () => {
    setLoadingProducts(true);
    const res = await fetch("https://cuvette-january-mern-final-evaluation.onrender.com/api/products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setProducts(data);
    setLoadingProducts(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ---------- BUY PRODUCT ---------- */
  const handleBuy = async () => {
    setBuyError("");
    const qty = Number(buyQty);
    if (!qty || qty <= 0) return setBuyError("Enter a valid quantity");
    if (selectedProduct.quantity <= 0)
      return setBuyError("Product is out of stock");
    if (qty > selectedProduct.quantity)
      return setBuyError("Quantity exceeds available stock");

    setBuying(true);
    await fetch("https://cuvette-january-mern-final-evaluation.onrender.com/api/products/buy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: [{ productId: selectedProduct._id, quantity: qty }],
      }),
    });
    setBuying(false);
    setSelectedProduct(null);
    setBuyQty("");
    setBuyError("");
    fetchProducts();
  };

  /* ---------- CSV UPLOAD ---------- */
  const handleCsvUpload = async () => {
    if (!csvFile) return;
    setCsvUploading(true);
    setCsvError("");
    try {
      const formData = new FormData();
      formData.append("file", csvFile);
      const res = await fetch("https://cuvette-january-mern-final-evaluation.onrender.com/api/products/bulk", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "CSV upload failed");
      }
      setShowCsvUpload(false);
      setCsvFile(null);
      fetchProducts();
    } catch (err) {
      setCsvError(err.message);
    } finally {
      setCsvUploading(false);
    }
  };

  /* ---------- PAGINATION ---------- */
  const start = (page - 1) * PAGE_SIZE;
  const paginated = products.slice(start, start + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));

  /* ================= ADD SINGLE PRODUCT SCREEN ================= */
  if (showAddForm) {
    return (
      <Layout>
        <div className="product-page-header">
          <p>Add Product &gt; Individual Product</p>
        </div>

        <div className="add-product-card">
          <h3 className="add-product-title">New Product</h3>

          <div className="add-product-grid">


            {/* LEFT – IMAGE UPLOAD */}
            <div className="image-upload-wrapper">
              <div className="image-upload-box">
                {imagePreview && <img src={imagePreview} alt="Preview" />}
              </div>

              {!imagePreview && (
                <div className="image-upload-instructions">
                  <div className="upload-title">Drag image here</div>
                  <div className="upload-or">or</div>

                  <label className="upload-link">
                    Browse image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setProductImage(file);
                        setImagePreview(URL.createObjectURL(file));
                      }}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* RIGHT – FORM */}
            <div className="add-product-form">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Product ID</label>
                <input
                  type="text"
                  value="Auto-generated by system"
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={isNewCategory ? "__new__" : newProduct.category}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "__new__") {
                      setIsNewCategory(true);
                      setNewProduct({ ...newProduct, category: "" });
                    } else {
                      setIsNewCategory(false);
                      setNewProduct({ ...newProduct, category: val });
                    }
                  }}
                >
                  <option value="">Select product category</option>
                  <option value="__new__">Add new category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {isNewCategory && (
                  <input
                    type="text"
                    placeholder="Enter new category"
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        category: e.target.value,
                      })
                    }
                  />
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    placeholder="Enter price"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    placeholder="Enter quantity"
                    value={newProduct.quantity}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, quantity: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Unit</label>
                  <input
                    type="text"
                    placeholder="kg, pcs, etc."
                    value={newProduct.unit}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, unit: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={newProduct.expiryDate}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        expiryDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Threshold Value</label>
                <input
                  type="number"
                  placeholder="Enter threshold value"
                  value={newProduct.threshold}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      threshold: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Product Image URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.png"
                  value={newProduct.image || ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      image: e.target.value,
                    })
                  }
                />
              </div>

            </div>
          </div>

          {/* ACTIONS */}
          <div className="add-product-actions">
            <button
              className="btn-secondary"
              onClick={() => {
                setShowAddForm(false);
                setIsNewCategory(false);
                setProductImage(null);
                setImagePreview(null);
              }}
            >
              Discard
            </button>

            <button
              className="btn-primary"
              onClick={async () => {
                await fetch(
                  "https://cuvette-january-mern-final-evaluation.onrender.com/api/products",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(newProduct),
                  }
                );

                setShowAddForm(false);
                fetchProducts();
              }}
            >
              Add Product
            </button>

          </div>
        </div>
      </Layout>
    );
  }


  /* ================= MAIN PAGE ================= */

  return (
    <Layout>
      <div className="products-page">

        {/* OVERALL INVENTORY */}
        <div className="inventory-card">
          <h3>Overall Inventory</h3>

          {loadingStats || !stats ? (
            <p>Loading inventory summary...</p>
          ) : (
            <div className="inventory-grid">

              {/* Categories */}
              <div>
                <h4>Categories</h4>
                <div className="inventory-value">{stats.categoriesCount}</div>
                <small>Last 7 days</small>
              </div>

              {/* Total Products */}
              <div>
                <h4>Total Products</h4>

                <div className="inventory-dual-row">
                  <div>
                    <div className="inventory-value">
                      {stats.productsInStock}
                    </div>
                    <small>Last 7 days</small>
                  </div>

                  <div>
                    <div className="inventory-value">
                      ₹{stats.inventoryValue}
                    </div>
                    <small>Amount</small>
                  </div>
                </div>
              </div>

              {/* Top Selling */}
              <div>
                <h4>Top Selling</h4>

                <div className="inventory-dual-row">
                  <div>
                    <div className="inventory-value">6</div>
                    <small>Last 7 days</small>
                  </div>

                  <div>
                    <div className="inventory-value">
                      ₹{stats.paidAmount}
                    </div>
                    <small>Revenue</small>
                  </div>
                </div>
              </div>

              {/* Low Stocks */}
              <div>
                <h4>Low Stocks</h4>

                <div className="inventory-dual-row">
                  <div>
                    <div className="inventory-value">
                      {stats.lowStockCount}
                    </div>
                    <small>Low stock</small>
                  </div>

                  <div>
                    <div className="inventory-value">
                      {stats.outOfStockCount}
                    </div>
                    <small>Not in stock</small>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* ===== PRODUCTS TABLE CARD ===== */}
        <div className="products-table-card">
          <div className="products-table-header">
            <h3>Products</h3>
            <button onClick={() => setShowAddOptions(true)}>
              Add Product
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>Products</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Threshold</th>
                <th>Expiry</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loadingProducts ? (
                <tr>
                  <td colSpan="6">Loading...</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan="6">No products</td>
                </tr>
              ) : (
                paginated.map((p) => (
                  <tr key={p._id}>
                    <td
                      className="product-name"
                      onClick={() => setSelectedProduct(p)}
                    >
                      {p.name}
                    </td>
                    <td>₹{p.price}</td>
                    <td>{p.quantity}</td>
                    <td>{p.threshold}</td>
                    <td>
                      {p.expiryDate
                        ? new Date(p.expiryDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td
                      className={`status ${getStatusLabel(p)
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {getStatusLabel(p)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {/* ADD PRODUCT OPTIONS */}
      {showAddOptions && (
        <div
          className="add-product-overlay"
          onClick={() => setShowAddOptions(false)}
        >
          <div
            className="add-product-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="add-product-option"
              onClick={() => {
                setShowAddOptions(false);
                setShowAddForm(true);
              }}
            >
              Individual product
            </button>

            <button
              className="add-product-option"
              onClick={() => {
                setShowAddOptions(false);
                setShowCsvUpload(true);
              }}
            >
              Multiple product
            </button>
          </div>
        </div>
      )}

      {/* CSV UPLOAD MODAL */}
      {showCsvUpload && (
        <div
          className="csv-overlay"
          onClick={() => setShowCsvUpload(false)}
        >
          <div
            className="csv-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="csv-header">
              <h3>CSV Upload</h3>
              <span
                className="csv-close"
                onClick={() => setShowCsvUpload(false)}
              >
                ×
              </span>
            </div>

            <p className="csv-subtitle">Add your documents here</p>

            {/* Upload Area */}
            {!csvFile ? (
              <div
                className="csv-dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  setCsvFile(e.dataTransfer.files[0]);
                }}
              >
                <div className="csv-icon">📁</div>
                <p>Drag your file(s) to start uploading</p>
                <span className="csv-or">OR</span>

                <label className="csv-browse">
                  Browse files
                  <input
                    type="file"
                    accept=".csv"
                    hidden
                    onChange={(e) => setCsvFile(e.target.files[0])}
                  />
                </label>
              </div>
            ) : (
              <div className="csv-file-info">
                <p>
                  <strong>{csvFile.name}</strong>{" "}
                  ({(csvFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
                {csvError && <p className="csv-error">{csvError}</p>}
              </div>
            )}

            {/* Actions */}
            <div className="csv-actions">
              <button
                className="csv-cancel"
                onClick={() => {
                  setCsvFile(null);
                  setShowCsvUpload(false);
                }}
              >
                Cancel
              </button>

              <button
                className="csv-next"
                onClick={handleCsvUpload}
                disabled={!csvFile || csvUploading}
              >
                {csvUploading ? "Uploading..." : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BUY MODAL */}
      {selectedProduct && (
        <div className="buy-overlay">
          <div className="buy-modal">
            <h3 className="buy-title">Simulate Buy Product</h3>

            <p className="buy-product-name">{selectedProduct.name}</p>
            <p className="buy-available">
              Available: <strong>{selectedProduct.quantity}</strong>
            </p>

            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="buy-input"
              placeholder="Enter quantity"
              value={buyQty}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setBuyQty(value);
              }}
            />

            {buyError && <p className="buy-error">{buyError}</p>}

            <button
              className="buy-confirm"
              onClick={handleBuy}
              disabled={buying}
            >
              {buying ? "Buying..." : "Buy"}
            </button>

            <button
              className="buy-cancel"
              onClick={() => {
                setSelectedProduct(null);
                setBuyQty("");
                setBuyError("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}


    </Layout>
  );
}

/* ---------- SHARED STYLES ---------- */
const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
};

const modalStyle = {
  background: "#fff",
  padding: 20,
  minWidth: 300,
};


export default Products;
