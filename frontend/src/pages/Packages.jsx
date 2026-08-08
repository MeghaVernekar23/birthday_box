import React, { useEffect, useState } from "react";
import DataTable from "../components/Datatable";
import { fetchPackage, updatePackage, deletePackage } from "../services/bookingServices";
import "../css/Packages.css";

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [editingPkg, setEditingPkg] = useState(null);
  const [form, setForm] = useState({ package_name: "", description: "", price: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPackageData();
  }, []);

  const fetchPackageData = async () => {
    try {
      const data = await fetchPackage();
      setPackages(data);
    } catch (error) {
      console.error("Failed to fetch packages:", error);
      alert("Failed to load package details.");
    }
  };

  const openEdit = (pkg) => {
    setEditingPkg(pkg);
    setForm({
      package_name: pkg.package_name,
      description: pkg.description || "",
      price: pkg.price,
    });
  };

  const closeEdit = () => {
    setEditingPkg(null);
    setForm({ package_name: "", description: "", price: "" });
  };

  const handleSave = async () => {
    if (!form.package_name.trim()) return alert("Package name required.");
    if (form.price === "" || isNaN(Number(form.price))) return alert("Valid price required.");
    setSaving(true);
    try {
      await updatePackage(editingPkg.package_id, {
        package_name: form.package_name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
      });
      closeEdit();
      fetchPackageData();
    } catch (err) {
      alert("Failed to update package.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pkg) => {
    if (!window.confirm(`Delete package "${pkg.package_name}"? This cannot be undone.`)) return;
    try {
      await deletePackage(pkg.package_id);
      fetchPackageData();
    } catch (err) {
      alert("Failed to delete package.");
    }
  };

  const columns = [
    { key: "package_id", label: "ID" },
    { key: "package_name", label: "Package Name" },
    { key: "description", label: "Description" },
    { key: "price", label: "Price (₹)" },
  ];

  return (
    <div className="packages-page">
      <DataTable
        title="Packages"
        columns={columns}
        data={packages}
        actions={[({ row }) => (
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="pkg-btn-edit-row" onClick={() => openEdit(row)}>
              Edit
            </button>
            <button className="pkg-btn-delete-row" onClick={() => handleDelete(row)}>
              Delete
            </button>
          </div>
        )]}
        searchableFields={["package_name", "description"]}
      />

      {editingPkg && (
        <div className="pkg-modal-overlay" onClick={closeEdit}>
          <div className="pkg-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Package</h3>
            <label>
              Package Name
              <input
                value={form.package_name}
                onChange={(e) => setForm({ ...form, package_name: e.target.value })}
              />
            </label>
            <label>
              Description
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <label>
              Price (₹)
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </label>
            <div className="pkg-modal-actions">
              <button className="pkg-btn-cancel" onClick={closeEdit}>Cancel</button>
              <button className="pkg-btn-save" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Packages;
