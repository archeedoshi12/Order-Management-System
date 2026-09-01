import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Pencil, Trash2, Package } from "lucide-react";
import toast from "react-hot-toast";
import { productService } from "../services/api";
import { formatCurrency, formatDate, getStatusBadgeClass, debounce } from "../utils/helpers";
import ProductForm from "./ProductForm";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Pagination from "../components/common/Pagination";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProducts = useCallback(async (params) => {
    setLoading(true);
    try {
      const res = await productService.getAll(params);
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    productService.getCategories().then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    fetchProducts({ search, status: statusFilter, category: categoryFilter, page, limit: 10 });
  }, [search, statusFilter, categoryFilter, page, fetchProducts]);

  const debouncedSearch = useCallback(debounce((val) => { setSearch(val); setPage(1); }, 400), []);

  const handleSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (editProduct) {
        await productService.update(editProduct._id, data);
        toast.success("Product updated successfully");
      } else {
        await productService.create(data);
        toast.success("Product added successfully");
      }
      setShowForm(false);
      setEditProduct(null);
      fetchProducts({ search, status: statusFilter, category: categoryFilter, page, limit: 10 });
      productService.getCategories().then((res) => setCategories(res.data.data));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await productService.delete(deleteTarget._id);
      toast.success("Product deleted");
      setDeleteTarget(null);
      fetchProducts({ search, status: statusFilter, category: categoryFilter, page, limit: 10 });
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
          <h3>Product List</h3>
          <div className="filters-row">
            <div className="search-bar">
              <Search size={15} color="var(--gray-400)" />
              <input placeholder="Search products..." onChange={(e) => debouncedSearch(e.target.value)} />
            </div>
            <select className="filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select className="filter-select" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="btn btn-primary" onClick={() => { setEditProduct(null); setShowForm(true); }}>
              <Plus size={15} /> Add Product
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <h3>No products found</h3>
              <p>Add your first product to get started</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--gray-900)" }}>{p.name}</div>
                      {p.description && <div className="text-sm text-muted" style={{ marginTop: 2 }}>{p.description.slice(0, 40)}{p.description.length > 40 ? "..." : ""}</div>}
                    </td>
                    <td><span className="font-mono">{p.sku}</span></td>
                    <td>{p.category}</td>
                    <td className="font-semibold">{formatCurrency(p.price)}</td>
                    <td>
                      <span className={p.stock <= 5 ? "stock-low" : "stock-ok"}>{p.stock}</span>
                      {p.stock <= 5 && p.stock > 0 && <span className="text-sm text-muted"> (low)</span>}
                      {p.stock === 0 && <span className="text-sm text-danger"> (out)</span>}
                    </td>
                    <td><span className={getStatusBadgeClass(p.status)}>{p.status}</span></td>
                    <td className="text-muted">{formatDate(p.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditProduct(p); setShowForm(true); }} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(p)} title="Delete" style={{ color: "var(--danger)" }}>
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

      <ProductForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditProduct(null); }}
        onSubmit={handleSubmit}
        product={editProduct}
        loading={formLoading}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleteLoading}
      />
    </div>
  );
}
