import { useState, useEffect, useCallback } from "react";
import { Plus, Eye, Trash2, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { orderService } from "../services/api";
import { formatCurrency, formatDateTime, getStatusBadgeClass } from "../utils/helpers";
import OrderForm from "./OrderForm";
import OrderDetail from "./OrderDetail";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Pagination from "../components/common/Pagination";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchOrders = useCallback(async (params) => {
    setLoading(true);
    try {
      const res = await orderService.getAll(params);
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders({ status: statusFilter, page, limit: 10 });
  }, [statusFilter, page, fetchOrders]);

  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      await orderService.create(data);
      toast.success("Order created successfully");
      setShowForm(false);
      fetchOrders({ status: statusFilter, page, limit: 10 });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    setStatusLoading(true);
    try {
      const res = await orderService.updateStatus(selectedOrder._id, status);
      toast.success(`Order ${status}`);
      setSelectedOrder(res.data.data);
      fetchOrders({ status: statusFilter, page, limit: 10 });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleViewOrder = async (order) => {
    try {
      const res = await orderService.getById(order._id);
      setSelectedOrder(res.data.data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await orderService.delete(deleteTarget._id);
      toast.success("Order deleted");
      setDeleteTarget(null);
      fetchOrders({ status: statusFilter, page, limit: 10 });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3>Order List</h3>
          <div className="filters-row">
            <select className="filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={15} /> New Order
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <ShoppingCart size={48} />
              <h3>No orders found</h3>
              <p>Create your first order to get started</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td><span className="font-mono font-semibold">{order.orderNumber}</span></td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{order.customer?.name || "—"}</div>
                      <div className="text-sm text-muted">{order.customer?.email}</div>
                    </td>
                    <td>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</td>
                    <td className="font-semibold">{formatCurrency(order.totalAmount)}</td>
                    <td><span className={getStatusBadgeClass(order.status)}>{order.status}</span></td>
                    <td className="text-muted">{formatDateTime(order.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-ghost btn-sm" onClick={() => handleViewOrder(order)} title="View Details">
                          <Eye size={14} />
                        </button>
                        {order.status !== "confirmed" && (
                          <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(order)} title="Delete" style={{ color: "var(--danger)" }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      <OrderForm isOpen={showForm} onClose={() => setShowForm(false)} onSubmit={handleCreate} loading={formLoading} />

      <OrderDetail
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
        statusLoading={statusLoading}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Order"
        message={`Are you sure you want to delete order "${deleteTarget?.orderNumber}"?`}
        loading={deleteLoading}
      />
    </div>
  );
}
