import React, { useEffect, useState } from "react";
import { ShoppingBag, Plus, Search, Trash2, Check, X, Eye, XCircle, FileText, } from "lucide-react";
import { OrderService } from "../services/order.service";
import { CustomerService } from "../services/customer.service";
import { ProductService } from "../services/product.service";
export default function OrderSection({ onRefresh, refreshSignal, onNotify, }) {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  // --- Order detail modal ---
  const [viewingOrder, setViewingOrder] = useState(null);
  // --- Create order wizard state ---
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [orderRows, setOrderRows] = useState([{ productId: "", quantity: 1 }]);
  const [creationError, setCreationError] = useState("");
  const notify = (type, title, message) => {
    onNotify?.({ type, title, message });
  };
  const reportError = (message, title = "Order action failed") => {
    setCreationError(message);
    notify("error", title, message);
  };
  const reportSuccess = (message, title = "Order updated") => {
    notify("success", title, message);
  };
  const reloadData = async () => {
    const [freshOrders, freshCustomers, freshProducts] = await Promise.all([
      OrderService.getAll(),
      CustomerService.getAll(),
      ProductService.getAll(),
    ]);
    setOrders(freshOrders);
    setCustomers(freshCustomers);
    setProducts(freshProducts);
  };
  useEffect(() => {
    reloadData().catch((err) => reportError(err.message || "Unable to load order data", "Unable to load order data"));
  }, [refreshSignal]);
  // Adds a blank product line row
  const addOrderRow = () => {
    setOrderRows([...orderRows, { productId: "", quantity: 1 }]);
  };
  const removeOrderRow = (index) => {
    if (orderRows.length === 1)
      return; // Keep at least one row
    setOrderRows(orderRows.filter((_, idx) => idx !== index));
  };
  const handleRowChange = (index, field, value) => {
    const updated = [...orderRows];
    if (field === "productId") {
      updated[index].productId = value;
    }
    else if (field === "quantity") {
      updated[index].quantity = value === "" ? 0 : Number(value);
    }
    setOrderRows(updated);
  };
  // Dynamic calculations before submission
  const calculatedGrandTotal = orderRows.reduce((sum, row) => {
    const prod = products.find((p) => p.id === row.productId);
    if (!prod)
      return sum;
    return sum + prod.price * row.quantity;
  }, 0);
  const handleCreateOrderSubmit = async (e) => {
    e.preventDefault();
    setCreationError("");
    if (!selectedCustomerId) {
      return reportError("Please select a customer for this order", "Validation error");
    }
    // Filter empty rows
    const validRows = orderRows.filter((row) => row.productId !== "");
    if (validRows.length === 0) {
      return reportError("Please select at least one valid product", "Validation error");
    }
    // Check duplicate products in rows
    const selectedIds = validRows.map((r) => r.productId);
    const hasDuplicates = selectedIds.some((val, i) => selectedIds.indexOf(val) !== i);
    if (hasDuplicates) {
      return reportError("Duplicate products found in row items. Please consolidate lines.", "Validation error");
    }
    // Validate quantities positive
    const hasInvalidQty = validRows.some((row) => row.quantity <= 0);
    if (hasInvalidQty) {
      return reportError("All product lines must have an ordered quantity greater than zero", "Validation error");
    }
    try {
      // Storage takes handles real subtraction and stock checks.
      const submittedOrder = await OrderService.create({
        customerId: selectedCustomerId,
        items: validRows,
      });
      // Clear states & navigate back to list
      reportSuccess(`Order filed with invoice ID "${submittedOrder.id}" successfully.`, "Order created");
      setSelectedCustomerId("");
      setOrderRows([{ productId: "", quantity: 1 }]);
      setActiveTab("list");
      await reloadData();
      onRefresh();
    }
    catch (err) {
      reportError(err.message || "Verification exception occurred placing order", "Order creation failed");
    }
  };
  // Cancel order (Restores inventory!)
  const handleCancelOrder = async (id) => {
    if (window.confirm("Cancel order? Re-allocated stocks will automatically cycle back into product totals.")) {
      try {
        await OrderService.delete(id);
        setViewingOrder(null);
        await reloadData();
        onRefresh();
        reportSuccess("Order cancelled and stock was returned to inventory.", "Order cancelled");
      }
      catch (err) {
        reportError(err?.message || "Error cancelling", "Cancel failed");
      }
    }
  };
  // Hard Delete order
  const handleDeleteOrder = async (id, e) => {
    e.stopPropagation(); // Avoid opening detailed dialog
    if (window.confirm("Delete order record entirely? Stocks will automatically cycle back into product inventory. Continue?")) {
      try {
        await OrderService.delete(id);
        await reloadData();
        onRefresh();
        reportSuccess("Order record deleted and inventory was restored.", "Order deleted");
      }
      catch (err) {
        reportError(err?.message || "Error deleting", "Delete failed");
      }
    }
  };
  // Filters flow
  const filteredOrders = orders.filter((o) => {
    return (o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase()));
  });
  return (<div className="space-y-6 animate-fade-in" id="order-management-section">
    {/* Tab Selectors Row */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-950">
          Purchase Order Operations
        </h2>
        <p className="text-xs text-slate-500">
          Formulate client purchase invoices, check physical quantities
          dynamically, or reverse transactions.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => {
          setActiveTab("list");
          setCreationError("");
        }} className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${activeTab === "list"
          ? "bg-slate-900 border-slate-900 text-white shadow-xs"
          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
          Invoice Registries
        </button>
        <button onClick={() => {
          setActiveTab("create");
        }} className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${activeTab === "create"
          ? "bg-blue-600 border-blue-600 text-white shadow-xs"
          : "bg-white border-slate-200 text-blue-600 hover:bg-slate-50"}`}>
          <Plus className="w-3.5 h-3.5" />
          Compose Order
        </button>
      </div>
    </div>

    {/* RENDER TAB 1: ORDERS LISTING */}
    {activeTab === "list" && (<div className="space-y-4">
      {/* Action searches */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input type="text" placeholder="Search invoices by invoice reference UUID, customer name, email address..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 shadow-2xs" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold tracking-wider upper text-[10px]">
                <th className="px-5 py-3">Order Code Reference</th>
                <th className="px-5 py-3">Customer Account</th>
                <th className="px-5 py-3 text-center">Receipt Date</th>
                <th className="px-5 py-3 text-center">Items Count</th>
                <th className="px-5 py-3 text-right">Invoiced Sum</th>
                <th className="px-5 py-3 text-center">Transaction State</th>
                <th className="px-5 py-3 text-center">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.length === 0 ? (<tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <ShoppingBag className="w-8 h-8 stroke-1 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-500">
                    No transactions recorded
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Submit purchase orders or extend keywords.
                  </p>
                </td>
              </tr>) : (filteredOrders.map((o) => {
                const totalQty = o.items.reduce((sum, item) => sum + item.quantity, 0);
                const isCompleted = o.status === "Completed";
                return (<tr key={o.id} onClick={() => setViewingOrder(o)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                  <td className="px-5 py-4">
                    <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded-sm text-[11px] font-bold border border-slate-200">
                      {o.id}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {o.customerName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {o.customerEmail}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center font-mono font-medium text-slate-500">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-center font-semibold text-slate-900 font-mono">
                    {totalQty} lines
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-slate-900 font-mono text-[13px]">
                    $
                    {o.totalAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td onClick={(e) => e.stopPropagation()} className="px-5 py-4 text-center">
                    <span onClick={(e) => e.stopPropagation()} className={`inline-flex items-center gap-1.5 px-2.1 py-0.5 text-[9px] font-bold rounded-full border cursor-default select-none ${isCompleted
                      ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                      : "bg-rose-50 text-rose-800 border-rose-100 line-through"}`}>
                      <span className={`w-1 h-1 rounded-full ${isCompleted ? "bg-emerald-500" : "bg-rose-500"}`} />
                      {isCompleted ? "Completed" : "Cancelled"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={(e) => {
                        e.stopPropagation();
                        setViewingOrder(o);
                      }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors" title="View detailed invoice">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => handleDeleteOrder(o.id, e)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors" title="Delete order records">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>);
              }))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 text-[10px] text-slate-400 font-mono flex items-center justify-between">
          <span>
            Operational Registry counts: {filteredOrders.length} records
          </span>
          <span>Integrity: Double-Entry Deduction Rule</span>
        </div>
      </div>
    </div>)}

    {/* RENDER TAB 2: COMPOSE NEW ORDER */}
    {activeTab === "create" && (<form onSubmit={handleCreateOrderSubmit} className="bg-white border border-slate-200 rounded-xl shadow-3xs p-6 space-y-6 animate-slide-up text-xs">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-100 text-blue-600">
        <ShoppingBag className="w-5 h-5 shrink-0" />
        <span className="font-bold text-slate-950 text-sm">
          Purchase Order Composer
        </span>
      </div>

      {creationError && (<div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-lg font-medium flex items-center gap-1.5 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
        {creationError}
      </div>)}

      {/* STEP 1: SELECT CUSTOMER */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
          1. Assign Registered Client profile
        </label>
        <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} required className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-medium text-slate-800">
          <option value="">-- Choose target customer --</option>
          {customers.map((c) => (<option key={c.id} value={c.id}>
            {c.name} ({c.email})
          </option>))}
        </select>
        {customers.length === 0 && (<p className="text-rose-500 text-[11px] font-medium pt-1">
          ⚠️ Registry empty. Please create some clients in Client Registry
          first before composing.
        </p>)}
      </div>

      {/* STEP 2: MULTI LINE PRODUCT BUILDER */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
            2. Formulate Products Acquisitions
          </label>
          <button type="button" onClick={addOrderRow} className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-md transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Add Item Row
          </button>
        </div>

        {/* List current rows */}
        <div className="space-y-3">
          {orderRows.map((row, index) => {
            const currentSelectedProduct = products.find((p) => p.id === row.productId);
            // Live inventory checker
            const isOverStock = currentSelectedProduct
              ? row.quantity > currentSelectedProduct.quantity
              : false;
            return (<div key={index} className="flex flex-col sm:flex-row gap-3 items-end p-3 bg-slate-50 border border-slate-200 rounded-lg relative group">
              {/* Dropdown Product selector */}
              <div className="flex-1 space-y-1 w-full min-w-0">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">
                  Acquisition Material
                </label>
                <select value={row.productId} onChange={(e) => handleRowChange(index, "productId", e.target.value)} required className="w-full text-sm bg-white border border-slate-200 p-2 rounded-md focus:outline-none focus:border-blue-500 font-medium text-slate-700 truncate">
                  <option value="">-- Select Product --</option>
                  {products.map((p) => (<option key={p.id} value={p.id}>
                    {p.name} (SKU: {p.sku} • Price: ${p.price} • Stock:{" "}
                    {p.quantity})
                  </option>))}
                </select>
              </div>

              {/* Stock status indicator badge */}
              {currentSelectedProduct && (<div className="text-[10px] font-medium min-w-[70px] self-center pt-3 text-center">
                <span className="text-slate-400">Available Stock:</span>
                <p className={`font-mono font-bold ${currentSelectedProduct.quantity === 0 ? "text-rose-600" : "text-slate-700"}`}>
                  {currentSelectedProduct.quantity} units
                </p>
              </div>)}

              {/* Input quantity ordered */}
              <div className="space-y-1 w-full sm:w-[100px] shrink-0">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">
                  Quantity
                </label>
                <input type="number" min="1" required value={row.quantity === 0 ? "" : row.quantity} onChange={(e) => handleRowChange(index, "quantity", e.target.value)} className={`w-full p-2 bg-white border rounded-md font-mono text-center text-sm focus:outline-none ${isOverStock
                  ? "border-rose-400 text-rose-600 focus:border-rose-500 bg-rose-50"
                  : "border-slate-200 focus:border-blue-500"}`} />
              </div>

              {/* Live Line Item Price calculates automatically */}
              <div className="w-full sm:w-[130px] pr-2 shrink-0 self-center text-right pt-3">
                <span className="text-[10px] text-slate-400 block uppercase">
                  Expected Line Sum
                </span>
                <strong className="text-sm text-slate-800 font-mono">
                  {currentSelectedProduct
                    ? `$${(currentSelectedProduct.price * row.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                    : "$0.00"}
                </strong>
              </div>

              {/* Delete row action */}
              <button type="button" onClick={() => removeOrderRow(index)} disabled={orderRows.length === 1} className="p-2 self-center rounded text-slate-400 hover:text-rose-500 hover:bg-slate-200 transition-colors disabled:opacity-40" title="De-select line item">
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Instant live exceed warning */}
              {isOverStock && currentSelectedProduct && (<span className="absolute bottom-1 right-2 bg-rose-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-sm animate-pulse">
                Requested {row.quantity} is higher than available stock
                ({currentSelectedProduct.quantity})!
              </span>)}
            </div>);
          })}
        </div>
      </div>

      {/* STEP 3: ORDER TOTALS & SUBMISSION ACTIONS */}
      <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
        <div>
          <span className="text-slate-400 font-mono">
            Total Pre-flight calculation:
          </span>
          <h4 className="text-2xl font-black text-slate-900 font-mono tracking-tight mt-0.5">
            $
            {calculatedGrandTotal.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </h4>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button type="button" onClick={() => {
            setActiveTab("list");
            setCreationError("");
          }} className="flex-1 sm:flex-initial py-2.5 px-5 text-slate-500 font-bold border border-slate-200 rounded-lg hover:bg-slate-50">
            Quit Composer
          </button>
          <button type="submit" disabled={calculatedGrandTotal <= 0} className="flex-grow sm:flex-initial inline-flex items-center gap-1.5 justify-center py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm disabled:opacity-50 transition-colors" id="btn-submit-order">
            <Check className="w-4.5 h-4.5" />
            Commit Order
          </button>
        </div>
      </div>
    </form>)}

    {/* DETAILED MODAL: PDF STYLE INVOICE RECEIPT */}
    {viewingOrder && (<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-scale-up text-xs font-medium text-slate-700">
        {/* Header Header */}
        <div className="bg-slate-950 text-white px-6 py-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase font-black">
              Digital Invoiced Receipt
            </span>
            <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-blue-400" />
              Order Code: {viewingOrder.id}
            </h3>
          </div>
          <button onClick={() => setViewingOrder(null)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Print Body Info */}
        <div className="p-6 space-y-6">
          {/* Customer Contact Panel & Date */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-[11px]">
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                CLIENT INVOICEE
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {viewingOrder.customerName}
              </p>
              <p className="text-slate-500 font-mono">
                {viewingOrder.customerEmail}
              </p>
            </div>

            <div className="space-y-1.5 text-right">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                METADATA DATE
              </span>
              <p className="font-bold text-slate-800 font-mono text-sm">
                {new Date(viewingOrder.createdAt).toLocaleString()}
              </p>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 mt-0.5 text-[10px] font-bold rounded-full ${viewingOrder.status === "Completed"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-100 line-through"}`}>
                {viewingOrder.status === "Completed"
                  ? "State Completed"
                  : "State Cancelled (Rollback)"}
              </span>
            </div>
          </div>

          {/* Items Table List */}
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
              Acquired Stock Breakdown
            </span>
            <div className="border border-slate-150 rounded-lg overflow-hidden bg-slate-50/50">
              <table className="w-full text-left font-medium">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 text-[9px] uppercase tracking-wider">
                    <th className="px-4 py-2">Catalog Material Name</th>
                    <th className="px-4 py-2 text-center">Unit Price</th>
                    <th className="px-4 py-2 text-center">Qty Ordered</th>
                    <th className="px-4 py-2 text-right">Line Sum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-[11px] text-slate-700 font-medium">
                  {(viewingOrder.items || []).map((it, i) => {
                    const price = Number(it.price ?? 0);
                    const quantity = Number(it.quantity ?? 0);
                    const total = Number(it.total ?? price * quantity);

                    return (
                      <tr key={i}>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-900">
                            {it.name || "Unknown Product"}
                          </span>

                          <span className="font-mono text-[9px] text-slate-400 block mt-0.5">
                            {it.sku || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center font-mono">
                          ${price.toFixed(2)}
                        </td>

                        <td className="px-4 py-3 text-center font-mono font-bold text-slate-900">
                          {quantity} units
                        </td>

                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                          ${total.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoiced Total summary */}
          <div className="flex justify-between items-center py-4 bg-slate-55 border-y border-slate-150 font-mono">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              GRAND TOTAL ACCRUED
            </span>
            <strong className="text-xl font-black text-slate-950 font-mono tracking-tight">
              $
              {viewingOrder.totalAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </div>

          {/* Actions rollback tools */}
          <div className="flex items-center gap-2 pt-2 text-[11px]">
            <button type="button" onClick={() => setViewingOrder(null)} className="flex-1 py-2 text-slate-600 font-semibold border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-150">
              Close Receipt
            </button>
            {viewingOrder.status === "Completed" && (<button type="button" onClick={() => handleCancelOrder(viewingOrder.id)} className="flex-1 py-2 bg-rose-50 text-rose-700 font-bold border border-rose-200 rounded-lg hover:bg-rose-100 flex items-center justify-center gap-1 transition-colors">
              <XCircle className="w-4 h-4 text-rose-600" />
              Cancel Order (Reverse Stock)
            </button>)}
          </div>
        </div>
      </div>
    </div>)}
  </div>);
}
