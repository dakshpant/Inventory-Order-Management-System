import React, { useEffect, useState } from "react";
import { Plus, Search, Edit3, Trash2, Package, AlertTriangle, Check, Filter, X, } from "lucide-react";
import { ProductService } from "../services/product.service";
import { OrderService } from "../services/order.service";
export default function ProductSection({ onRefresh, refreshSignal, }) {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    // Form handling (Add/Update Modal states)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    // Individual fields
    const [name, setName] = useState("");
    const [sku, setSku] = useState("");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    // Status reporting
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const reloadData = async () => {
        const fresh = await ProductService.getAll();
        setProducts(fresh);
    };
    useEffect(() => {
        reloadData().catch((err) => setError(err.message || "Unable to load products"));
    }, [refreshSignal]);
    const openAddModal = () => {
        setError("");
        setEditingId(null);
        setName("");
        setSku("");
        setPrice("");
        setQuantity("");
        setIsModalOpen(true);
    };
    const openEditModal = (p) => {
        setError("");
        setEditingId(p.id);
        setName(p.name);
        setSku(p.sku);
        setPrice(p.price);
        setQuantity(p.quantity);
        setIsModalOpen(true);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!name.trim())
            return setError("Product name is required");
        if (!sku.trim())
            return setError("SKU/Code is required");
        if (price === "" || price < 0)
            return setError("Price cannot be negative");
        if (quantity === "" || quantity < 0)
            return setError("Quantity cannot be negative");
        try {
            if (editingId) {
                // Edit mode
                await ProductService.update(editingId, {
                    name,
                    sku,
                    price: Number(price),
                    quantity: Number(quantity),
                });
                setSuccess(`Successfully updated "${name}" in catalog.`);
            }
            else {
                // Add mode
                await ProductService.create({
                    name,
                    sku,
                    price: Number(price),
                    quantity: Number(quantity),
                });
                setSuccess(`Successfully registered new product "${name}".`);
            }
            setIsModalOpen(false);
            await reloadData();
            onRefresh();
            setTimeout(() => setSuccess(""), 4000);
        }
        catch (err) {
            setError(err.message || "Validation error");
        }
    };
    const handleDelete = async (p) => {
        const orders = await OrderService.getAll();
        // Warn if product is referenced in orders (standard integrity warning)
        const isInOrders = orders.some((o) => o.items.some((it) => it.productId === p.id));
        let confirmMsg = `Are you absolutely sure you want to delete "${p.name}"?`;
        if (isInOrders) {
            confirmMsg = `WARNING: "${p.name}" is part of existing order history. Deleting it will keep the statistics, but will prevent future duplicate ordering. Proceed?`;
        }
        if (window.confirm(confirmMsg)) {
            try {
                await ProductService.delete(p.id);
                setSuccess(`Product "${p.name}" has been removed.`);
                await reloadData();
                onRefresh();
                setTimeout(() => setSuccess(""), 4000);
            }
            catch (err) {
                setError(err?.message || "Error deleting product");
            }
        }
    };
    // Filter and Search logic
    const filteredProducts = products.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase());
        if (!matchesSearch)
            return false;
        if (filter === "low")
            return p.quantity > 0 && p.quantity < 10;
        if (filter === "out")
            return p.quantity === 0;
        if (filter === "safe")
            return p.quantity >= 10;
        return true; // 'all'
    });
    return (<div className="space-y-6 animate-fade-in" id="product-management-section">
      {/* Tab Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950">
            Active Catalog Management
          </h2>
          <p className="text-xs text-slate-500">
            Insert, update, or remove physical inventory products, tracking
            unique SKUs and asset stocks.
          </p>
        </div>
        <button onClick={openAddModal} className="inline-flex items-center gap-1.5 justify-center px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors" id="btn-add-product">
          <Plus className="w-4 h-4"/>
          Add Product
        </button>
      </div>

      {/* Success Banner */}
      {success && (<div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-xs shadow-xs animate-slide-up">
          <Check className="w-4 h-4 text-emerald-600 shrink-0"/>
          <span className="font-medium">{success}</span>
        </div>)}

      {/* Actions and Searches Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Bar */}
        <div className="relative sm:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-4 h-4"/>
          </span>
          <input type="text" placeholder="Search products by SKU code or name..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 shadow-2xs"/>
        </div>

        {/* Filters Select */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
          <Filter className="w-4 h-4 text-slate-400 shrink-0"/>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-600 font-medium">
            <option value="all">Display All Inventory Lines</option>
            <option value="safe">Stocked: Safe Levels (10+)</option>
            <option value="low">Stocked: Near Warning Line (&lt;10)</option>
            <option value="out">Stocked: Depleted Line (0)</option>
          </select>
        </div>
      </div>

      {/* Primary Products Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold tracking-wider upper text-[10px]">
                <th className="px-5 py-3">Product Name</th>
                <th className="px-5 py-3">Catalog SKU</th>
                <th className="px-5 py-3 text-right">Price per Unit</th>
                <th className="px-5 py-3 text-center">In Stock Status</th>
                <th className="px-5 py-3 text-center">Stock Tag</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredProducts.length === 0 ? (<tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 stroke-1 text-slate-300 mx-auto mb-2"/>
                    <p className="font-semibold text-slate-500">
                      No products matching the selected filter
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Try resetting the keyword search or filter choice
                    </p>
                  </td>
                </tr>) : (filteredProducts.map((p) => {
            const isLow = p.quantity > 0 && p.quantity < 10;
            const isOut = p.quantity === 0;
            return (<tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {p.id}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded-sm text-[11px] uppercase border border-slate-200 font-bold">
                          {p.sku}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-900">
                        $
                        {p.price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}
                      </td>
                      <td className="px-5 py-4 text-center font-mono font-bold text-slate-900">
                        {p.quantity.toLocaleString()} pcs
                      </td>
                      <td className="px-5 py-4 text-center">
                        {isOut ? (<span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                            Depleted Stock
                          </span>) : isLow ? (<span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-500"/>
                            Low Warning
                          </span>) : (<span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Well-Stocked
                          </span>)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => openEditModal(p)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors" title="Edit details">
                            <Edit3 className="w-4 h-4"/>
                          </button>
                          <button onClick={() => handleDelete(p)} className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors" title="Remove product">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </div>
                      </td>
                    </tr>);
        }))}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 text-[10px] text-slate-400 font-mono flex items-center justify-between">
          <span>Active Registry Rows: {filteredProducts.length} entries</span>
          {/* <span>Catalog Storage Engine: FastAPI + PostgreSQL</span> */}
        </div>
      </div>

      {/* Modal Dialog add/edit */}
      {isModalOpen && (<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600">
                <Package className="w-5 h-5"/>
                <h3 className="font-bold text-slate-950">
                  {editingId
                ? "Modify Product Specifications"
                : "Insert Product to Inventory"}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700">
                <X className="w-4.5 h-4.5"/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {error && (<div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-lg font-medium flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
                  {error}
                </div>)}

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 uppercase tracking-tight">
                  Product Title
                </label>
                <input type="text" placeholder="e.g. Premium Titanium Gear Rods" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"/>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 uppercase tracking-tight">
                  Unique Inventory SKU Code
                </label>
                <input type="text" placeholder="e.g. TIT-GEAR-101" required value={sku} onChange={(e) => setSku(e.target.value)} disabled={!!editingId} // Usually best not to edit SKU directly once established
         className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono disabled:bg-slate-50 disabled:text-slate-400"/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 uppercase tracking-tight">
                    Price per Unit ($)
                  </label>
                  <input type="number" step="0.01" min="0" placeholder="25.50" required value={price} onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono"/>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 uppercase tracking-tight">
                    Quantity in Stock
                  </label>
                  <input type="number" min="0" placeholder="150" required value={quantity} onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono"/>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-500 font-semibold border border-slate-200 rounded-lg hover:bg-slate-50">
                  Close Input
                </button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm">
                  {editingId ? "Modify Record" : "Create Record"}
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
}
