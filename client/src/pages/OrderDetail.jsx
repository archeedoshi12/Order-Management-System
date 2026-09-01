import Modal from "../components/common/Modal";
import { formatCurrency, formatDateTime, getStatusBadgeClass } from "../utils/helpers";

export default function OrderDetail({ isOpen, onClose, order, onStatusChange, statusLoading }) {
  if (!order) return null;

  const canConfirm = order.status === "pending";
  const canCancel = order.status === "pending" || order.status === "confirmed";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Order ${order.orderNumber}`} size="modal-lg">
      <div className="modal-body">
        <div className="detail-grid" style={{ marginBottom: 20 }}>
          <div className="detail-item">
            <label>Order Number</label>
            <p className="font-mono">{order.orderNumber}</p>
          </div>
          <div className="detail-item">
            <label>Status</label>
            <p><span className={getStatusBadgeClass(order.status)}>{order.status}</span></p>
          </div>
          <div className="detail-item">
            <label>Customer</label>
            <p>{order.customer?.name || "—"}</p>
          </div>
          <div className="detail-item">
            <label>Email</label>
            <p>{order.customer?.email || "—"}</p>
          </div>
          <div className="detail-item">
            <label>Phone</label>
            <p>{order.customer?.phone || "—"}</p>
          </div>
          <div className="detail-item">
            <label>Date</label>
            <p>{formatDateTime(order.createdAt)}</p>
          </div>
        </div>

        {order.notes && (
          <div style={{ background: "var(--gray-50)", padding: "10px 14px", borderRadius: "var(--radius-sm)", marginBottom: 16, fontSize: 13, color: "var(--gray-600)" }}>
            <strong>Notes:</strong> {order.notes}
          </div>
        )}

        <div className="divider" />

        <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "var(--gray-700)" }}>Order Items</h4>
        <table className="order-items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th style={{ textAlign: "right" }}>Unit Price</th>
              <th style={{ textAlign: "right" }}>Qty</th>
              <th style={{ textAlign: "right" }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{item.productName}</td>
                <td><span className="font-mono">{item.productSku}</span></td>
                <td style={{ textAlign: "right" }}>{formatCurrency(item.unitPrice)}</td>
                <td style={{ textAlign: "right" }}>{item.quantity}</td>
                <td style={{ textAlign: "right", fontWeight: 600 }}>{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} style={{ textAlign: "right", fontWeight: 700, padding: "12px", borderTop: "2px solid var(--gray-200)" }}>Total Amount</td>
              <td style={{ textAlign: "right", fontWeight: 700, fontSize: 16, color: "var(--primary)", padding: "12px", borderTop: "2px solid var(--gray-200)" }}>
                {formatCurrency(order.totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>Close</button>
        {canCancel && (
          <button className="btn btn-danger" onClick={() => onStatusChange("cancelled")} disabled={statusLoading}>
            {statusLoading ? "Processing..." : "Cancel Order"}
          </button>
        )}
        {canConfirm && (
          <button className="btn btn-success" onClick={() => onStatusChange("confirmed")} disabled={statusLoading}>
            {statusLoading ? "Processing..." : "Confirm Order"}
          </button>
        )}
      </div>
    </Modal>
  );
}
