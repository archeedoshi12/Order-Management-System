import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";
import { customerService } from "../services/api";
import { formatDate, debounce } from "../utils/helpers";
import CustomerForm from "./CustomerForm";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Pagination from "../components/common/Pagination";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCustomers = useCallback(async (params) => {
    setLoading(true);
    try {
      const res = await customerService.getAll(params);
      setCustomers(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers({ search, page, limit: 10 });
  }, [search, page, fetchCustomers]);

  const debouncedSearch = useCallback(debounce((val) => { setSearch(val); setPage(1); }, 400), []);

  const handleSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (editCustomer) {
        await customerService.update(editCustomer._id, data);
        toast.success("Customer updated");
      } else {
        await customerService.create(data);
        toast.success("Customer added");
      }
      setShowForm(false);
      setEditCustomer(null);
      fetchCustomers({ search, page, limit: 10 });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await customerService.delete(deleteTarget._id);
      toast.success("Customer deleted");
      setDeleteTarget(null);
      fetchCustomers({ search, page, limit: 10 });
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
          <h3>Customer List</h3>
          <div className="filters-row">
            <div className="search-bar">
              <Search size={15} color="var(--gray-400)" />
              <input placeholder="Search customers..." onChange={(e) => debouncedSearch(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={() => { setEditCustomer(null); setShowForm(true); }}>
              <Plus size={15} /> Add Customer
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : customers.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <h3>No customers found</h3>
              <p>Add your first customer to get started</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone || "—"}</td>
                    <td>{c.address || "—"}</td>
                    <td className="text-muted">{formatDate(c.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditCustomer(c); setShowForm(true); }} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(c)} title="Delete" style={{ color: "var(--danger)" }}>
                          <Trash2 size={14} />
                        </button>
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

      <CustomerForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditCustomer(null); }}
        onSubmit={handleSubmit}
        customer={editCustomer}
        loading={formLoading}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        loading={deleteLoading}
      />
    </div>
  );
}
