import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import "../styles/invoice.css";

const PAGE_SIZE = 10;

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewInvoice, setViewInvoice] = useState(null);

  const token = localStorage.getItem("token");

  /* ---------------- FETCH ---------------- */

  const fetchInvoices = async () => {
    setLoading(true);
    const res = await fetch("https://cuvette-january-mern-final-evaluation.onrender.com/api/invoices", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setInvoices(data.reverse());
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  /* ---------------- MENU AUTO-CLOSE (NEW) ---------------- */
  useEffect(() => {
    const handleClickOutside = () => {
      if (menuOpen !== null) {
        setMenuOpen(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  /* ---------------- ACTIONS ---------------- */

  const markAsPaid = async (id) => {
    await fetch(`https://cuvette-january-mern-final-evaluation.onrender.com/api/invoices/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "PAID" }),
    });
    setMenuOpen(null);
    fetchInvoices();
  };

  const deleteInvoice = async () => {
    await fetch(`https://cuvette-january-mern-final-evaluation.onrender.com/api/invoices/${deleteTarget}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeleteTarget(null);
    fetchInvoices();
  };

  /* ---------------- AGGREGATES ---------------- */

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((i) => i.status === "PAID");
  const unpaidInvoices = invoices.filter((i) => i.status === "UNPAID");

  const paidAmount = paidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const unpaidAmount = unpaidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

  const recentTransactions = Math.min(totalInvoices, 7);

  /* ---------------- PAGINATION ---------------- */

  const start = (page - 1) * PAGE_SIZE;
  const paginated = invoices.slice(start, start + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(invoices.length / PAGE_SIZE));

  /* ================= RENDER ================= */

  return (
    <Layout>
      <div className="invoices-page">
        {/* ================= OVERALL INVOICE CARD ================= */}
        <div className="inventory-card">
          <h3>Overall Invoice</h3>

          <div className="inventory-grid">
            <div>
              <h4>Recent Transactions</h4>
              <div className="inventory-value">{recentTransactions}</div>
              <small>Last 7 days</small>
            </div>

            <div>
              <h4>Total Invoices</h4>
              <div className="inventory-dual-row">
                <div>
                  <div className="inventory-value">{totalInvoices}</div>
                  <small>Total Till Date</small>
                </div>
                <div>
                  <div className="inventory-value">{paidInvoices.length}</div>
                  <small>Processed</small>
                </div>
              </div>
            </div>

            <div>
              <h4>Paid Amount</h4>
              <div className="inventory-dual-row">
                <div>
                  <div className="inventory-value">₹{paidAmount}</div>
                  <small>Last 7 days</small>
                </div>
                <div>
                  <div className="inventory-value">{paidInvoices.length}</div>
                  <small>Customers</small>
                </div>
              </div>
            </div>

            <div>
              <h4>Unpaid Amount</h4>
              <div className="inventory-dual-row">
                <div>
                  <div className="inventory-value">₹{unpaidAmount}</div>
                  <small>Total Pending</small>
                </div>
                <div>
                  <div className="inventory-value">{unpaidInvoices.length}</div>
                  <small>Customers</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= INVOICES TABLE ================= */}
        <div className="products-table-card">
          <div className="products-table-header">
            <h3>Invoices List</h3>
          </div>

          <table>
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Reference Number</th>
                <th>Amount (₹)</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Loading...</td>
                </tr>
              ) : (
                paginated.map((inv) => (
                  <tr key={inv._id}>
                    <td>{inv.referenceNumber}</td>
                    <td>{inv._id}</td>
                    <td>₹ {inv.totalAmount}</td>
                    <td>{inv.status}</td>
                    <td className="due-date-cell">
                      <span>{new Date(inv.dueDate).toLocaleDateString()}</span>

                      <button
                        className="invoice-menu-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === inv._id ? null : inv._id);
                        }}
                      >
                        ⋮
                      </button>

                      {menuOpen === inv._id && (
                        <div
                          className="invoice-menu"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {inv.status === "UNPAID" ? (
                            <button
                              className="menu-item paid"
                              onClick={() => markAsPaid(inv._id)}
                            >
                              Mark as Paid
                            </button>
                          ) : (
                            <>
                              <button
                                className="menu-item view"
                                onClick={() => setViewInvoice(inv)}
                              >
                                View Invoice
                              </button>
                              <button
                                className="menu-item delete"
                                onClick={() => setDeleteTarget(inv._id)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>

        {/* DELETE + VIEW MODALS — UNCHANGED */}
        {deleteTarget && (
          <div className="delete-overlay">
            <div className="delete-confirmation">
              <p>This invoice will be deleted.</p>
              <div className="delete-actions">
                <button className="btn-cancel" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </button>
                <button className="btn-confirm" onClick={deleteInvoice}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {viewInvoice && (
  <div className="invoice-modal-overlay">
    <div className="invoice-modal">
      {/* CLOSE */}
      <button
        className="invoice-close"
        onClick={() => setViewInvoice(null)}
      >
        ✕
      </button>

      {/* HEADER */}
      <div className="invoice-header">
        <h1>INVOICE</h1>
      </div>

      {/* BILLING */}
      <div className="invoice-billing">
        <div>
          <h4>Billed to</h4>
          <p>Customer Name</p>
          <p>Company address</p>
          <p>City, Country - 00000</p>
        </div>

        <div className="invoice-business">
          <p>Business address</p>
          <p>City, State - 00000</p>
          <p>TAX ID: XXXXXXXX</p>
        </div>
      </div>

      {/* BODY */}
      <div className="invoice-body">
        {/* META */}
        <div className="invoice-meta">
          <div>
            <span>Invoice #</span>
            <strong>{viewInvoice.referenceNumber}</strong>
          </div>

          <div>
            <span>Invoice date</span>
            <strong>
              {new Date(viewInvoice.createdAt).toLocaleDateString()}
            </strong>
          </div>

          <div>
            <span>Reference</span>
            <strong>{viewInvoice._id}</strong>
          </div>

          <div>
            <span>Due date</span>
            <strong>
              {new Date(viewInvoice.dueDate).toLocaleDateString()}
            </strong>
          </div>
        </div>

        {/* TABLE */}
        <div className="invoice-table">
          <table>
            <thead>
              <tr>
                <th align="left">Products</th>
                <th>Qty</th>
                <th align="right">Price</th>
              </tr>
            </thead>
            <tbody>
              {viewInvoice.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.product?.name || "Product name"}</td>
                  <td>{item.quantity}</td>
                  <td align="right">₹{item.priceAtPurchase}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* TOTALS */}
          <div className="invoice-totals">
            <div>
              <span>Subtotal</span>
              <span>₹{viewInvoice.totalAmount}</span>
            </div>

            <div>
              <span>Tax (10%)</span>
              <span>₹{Math.round(viewInvoice.totalAmount * 0.1)}</span>
            </div>

            <div className="total-due">
              <span>Total due</span>
              <span>
                ₹
                {viewInvoice.totalAmount +
                  Math.round(viewInvoice.totalAmount * 0.1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="invoice-footer">
        <span>www.example.com</span>
        <span>+91 00000 00000</span>
        <span>hello@email.com</span>
      </div>
    </div>
  </div>
)}

      </div>
    </Layout>
  );
}

export default Invoices;

