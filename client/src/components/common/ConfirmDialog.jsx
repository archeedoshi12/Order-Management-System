import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="modal-body" style={{ textAlign: "center", padding: "32px 24px" }}>
        <AlertTriangle size={48} color="var(--danger)" style={{ margin: "0 auto 16px" }} />
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 13, color: "var(--gray-500)" }}>{message}</p>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? "Processing..." : confirmText}
        </button>
      </div>
    </Modal>
  );
}
