export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export const formatDateTime = (date) =>
  new Date(date).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

export const getStatusBadgeClass = (status) => {
  const map = {
    active: "badge-success",
    inactive: "badge-gray",
    pending: "badge-warning",
    confirmed: "badge-success",
    cancelled: "badge-danger",
  };
  return `badge ${map[status] || "badge-gray"}`;
};

export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
