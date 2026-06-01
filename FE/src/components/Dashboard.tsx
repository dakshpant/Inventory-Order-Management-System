import React, { useEffect, useState } from "react";
import {
  Package,
  Users,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Coins,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { ProductService } from "../services/product.service";
import { OrderService } from "../services/order.service";
import { StatsService } from "../services/stats.service";
import { Product, Order, SystemStats } from "../types";

interface DashboardProps {
  onNavigate: (section: "products" | "customers" | "orders") => void;
  onRefresh: () => void;
  refreshSignal: number;
}

export default function Dashboard({
  onNavigate,
  onRefresh,
  refreshSignal,
}: DashboardProps) {
  const [stats, setStats] = useState<SystemStats>({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    lowStockCount: 0,
    revenue: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const lowStockProducts = products.filter((p) => p.quantity < 10);

  // Local restock quick action
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(50);
  const [successMsg, setSuccessMsg] = useState<string>("");

  const reloadData = async () => {
    const [freshStats, freshProducts, freshOrders] = await Promise.all([
      StatsService.get(),
      ProductService.getAll(),
      OrderService.getAll(),
    ]);
    setStats(freshStats);
    setProducts(freshProducts);
    setOrders(freshOrders);
  };

  useEffect(() => {
    reloadData().catch((err: any) =>
      alert(err.message || "Unable to load dashboard data"),
    );
  }, [refreshSignal]);

  const handleQuickRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct) return;
    try {
      const updated = await ProductService.update(restockProduct.id, {
        name: restockProduct.name,
        sku: restockProduct.sku,
        price: restockProduct.price,
        quantity: restockProduct.quantity + restockQty,
      });
      setSuccessMsg(
        `Restocked "${updated.name}" (+${restockQty} units) successfully.`,
      );
      setRestockProduct(null);
      setRestockQty(50);
      await reloadData();
      onRefresh();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      alert(err.message || "Error occurred");
    }
  };

  // Build points for a beautiful SVG Area Chart showing mockup sales over time
  // Using actual order values if present, or interpolation
  const completedOrders = orders.filter((o) => o.status === "Completed");
  const recentOrdersSorted = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Visual SVG chart calculation
  const maxPrice = Math.max(...completedOrders.map((o) => o.totalAmount), 500);
  const chartHeight = 120;
  const chartWidth = 500;

  // Render dummy coordinate points based on real order total values
  const points =
    completedOrders.length > 0
      ? completedOrders
          .map((o, idx) => {
            const x =
              (idx / Math.max(completedOrders.length - 1, 1)) *
                (chartWidth - 40) +
              20;
            const y =
              chartHeight -
              ((o.totalAmount / maxPrice) * (chartHeight - 40) + 20);
            return `${x},${y}`;
          })
          .join(" ")
      : `20,${chartHeight - 20} 120,50 220,90 320,30 480,${chartHeight - 40}`;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Panel */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Analytics Command Center
          </h1>
          <p className="text-sm text-slate-500">
            Real-time status updates of physical inventory stocks, order
            streams, and client accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            System Operational
          </span>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Data
          </button>
        </div>
      </div>
      {/* Toast Notification */}
      {successMsg && (
        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-sm shadow-xs animate-slide-up">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}
      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Products */}
        <div
          onClick={() => onNavigate("products")}
          className="p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-200 hover:shadow-xs transition-all cursor-pointer group"
          id="kpi-products"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Active Products
              </span>
              <h3 className="text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {stats.totalProducts}
              </h3>
            </div>
            <span className="p-2.5 bg-slate-50 text-slate-600 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
              <Package className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-blue-600 font-medium">
            <span>Manage Catalog</span>
            <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        {/* KPI: Customers */}
        <div
          onClick={() => onNavigate("customers")}
          className="p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-200 hover:shadow-xs transition-all cursor-pointer group"
          id="kpi-customers"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Client Registry
              </span>
              <h3 className="text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {stats.totalCustomers}
              </h3>
            </div>
            <span className="p-2.5 bg-slate-50 text-slate-600 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
              <Users className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-blue-600 font-medium">
            <span>View Customers</span>
            <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        {/* KPI: Orders */}
        <div
          onClick={() => onNavigate("orders")}
          className="p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-200 hover:shadow-xs transition-all cursor-pointer group"
          id="kpi-orders"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Orders Stream
              </span>
              <h3 className="text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {stats.totalOrders}
              </h3>
            </div>
            <span className="p-2.5 bg-slate-50 text-slate-600 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
              <ShoppingBag className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-blue-600 font-medium">
            <span>Process Orders</span>
            <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        {/* KPI: Revenue or Capital */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Gross Turnover
              </span>
              <h3 className="text-3xl font-bold text-slate-900">
                $
                {stats.revenue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
            </div>
            <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Coins className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-4.5 h-4.5" />
            <span>Completed Payments</span>
          </div>
        </div>
      </div>
      {/* Main Charts & Stock Alert Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Flow (Custom SVG Chart) */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Revenue Performance Graph
              </h3>
              <p className="text-xs text-slate-400">
                Chronological list of order transaction invoice amounts ($)
              </p>
            </div>
            <span className="text-[10px] font-mono font-medium text-slate-400 uppercase">
              Live Realized Yields
            </span>
          </div>

          <div className="relative pt-2">
            {completedOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                <Clock className="w-7 h-7 stroke-1 mb-2 animate-spin" />
                <p className="text-xs font-medium">
                  Capture transactions to compute curves
                </p>
              </div>
            ) : (
              <div className="w-full h-44 flex flex-col justify-end">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-full overflow-visible"
                >
                  <defs>
                    <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#3b82f6"
                        stopOpacity="0.25"
                      />
                      <stop
                        offset="100%"
                        stopColor="#3b82f6"
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line
                    x1="10"
                    y1="20"
                    x2={chartWidth - 10}
                    y2="20"
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <line
                    x1="10"
                    y1={chartHeight / 2}
                    x2={chartWidth - 10}
                    y2={chartHeight / 2}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <line
                    x1="10"
                    y1={chartHeight - 20}
                    x2={chartWidth - 10}
                    y2={chartHeight - 20}
                    stroke="#e2e8f0"
                    strokeWidth="1.5"
                  />

                  {/* Shaded Area Under Points */}
                  <path
                    d={`M 20,${chartHeight - 20} L ${points} L ${chartWidth - 20},${chartHeight - 20} Z`}
                    fill="url(#chart-grad)"
                  />

                  {/* Connection Line */}
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                  />

                  {/* Glowing Data Dots */}
                  {completedOrders.map((o, idx) => {
                    const x =
                      (idx / Math.max(completedOrders.length - 1, 1)) *
                        (chartWidth - 40) +
                      20;
                    const y =
                      chartHeight -
                      ((o.totalAmount / maxPrice) * (chartHeight - 40) + 20);
                    return (
                      <g key={o.id} className="cursor-pointer group/dot">
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#3b82f6"
                          className="transition-all hover:scale-150"
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r="8"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="1"
                          className="opacity-0 group-hover/dot:opacity-100 animate-ping"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Chart Axis Labels */}
                <div className="flex justify-between px-4 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                  <span>Earliest Records</span>
                  <span>Timeline Progression Flow</span>
                  <span>Latest Transaction</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Watch Grid Component */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-900">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold">Low Stock Warnings</h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-sm bg-rose-50 text-rose-600 border border-rose-100">
                {stats.lowStockCount} Products
              </span>
            </div>

            {/* List limit items < 10 */}
            <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
              {lowStockProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-100 rounded-lg">
                  <span className="p-2.5 bg-white rounded-full text-emerald-500 mb-1 border border-slate-100">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </span>
                  <p className="text-xs font-semibold text-slate-700">
                    All Stocks Safe
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Nothing is currently below threshold level.
                  </p>
                </div>
              ) : (
                lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-900 truncate max-w-[130px]">
                        {p.name}
                      </p>
                      <p className="font-mono text-[10px] text-slate-400">
                        {p.sku}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 font-bold font-mono text-[10px] rounded-xs ${p.quantity === 0 ? "bg-red-50 text-red-600 border border-red-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}
                      >
                        {p.quantity === 0 ? "OUT" : `${p.quantity} left`}
                      </span>
                      <button
                        onClick={() => setRestockProduct(p)}
                        className="p-1 text-slate-500 hover:text-blue-600 hover:bg-white rounded transition-colors"
                        title="Restock Item"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 pt-3 border-t border-slate-100 mt-2">
            Items falling below <span className="font-bold">10 units</span> are
            highlighted automatic in warning feeds.
          </p>
        </div>
      </div>
      {/* Grid: Quick Stats Chart and Recent Transactions List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Stock Breakdown (Custom SVG Bar Chart) */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Total Asset Levels
            </h3>
            <p className="text-xs text-slate-400">
              Available physical items in database registries
            </p>
          </div>

          <div className="space-y-3.5">
            {products.slice(0, 5).map((p) => {
              const maxProductQty = Math.max(
                ...products.map((p) => p.quantity),
                120,
              );
              const pct = Math.min((p.quantity / maxProductQty) * 100, 100);
              const colorClass =
                p.quantity < 10 ? "bg-amber-500" : "bg-blue-500";

              return (
                <div key={p.id} className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-medium text-slate-700 truncate max-w-[170px]">
                      {p.name}
                    </span>
                    <span className="font-mono text-slate-400 font-semibold">
                      {p.quantity} units
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {products.length > 5 && (
              <p className="text-[11px] text-slate-400 text-center font-mono">
                + {products.length - 5} more products registered in system
              </p>
            )}
          </div>
        </div>

        {/* Recent Orders Stream */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Order Logs Stream
              </h3>
              <p className="text-xs text-slate-400">
                Historic flow of processed client acquisitions
              </p>
            </div>
            <button
              onClick={() => onNavigate("orders")}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              System Operations &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
            {recentOrdersSorted.length === 0 ? (
              <div className="py-12 bg-slate-50 border border-dashed border-slate-100 rounded-lg text-center text-slate-400 text-xs">
                No orders filed. Please toggle Order Processor tab.
              </div>
            ) : (
              recentOrdersSorted.slice(0, 5).map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {o.customerName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {o.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {o.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                      items • {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="font-semibold text-slate-900">
                      ${Number(o.totalAmount).toFixed(2)}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded-sm border ${
                        o.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-slate-50 text-slate-500 border-slate-200 line-through"
                      }`}
                    >
                      {o.status === "Completed" ? "Completed" : "Cancelled"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>{" "}
      {/* Quick Restock Dialog */}
      {restockProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleQuickRestockSubmit}
            className="w-full max-w-sm bg-white border border-slate-200 rounded-xl shadow-xl p-5 space-y-4"
          >
            <div className="flex items-center gap-2 text-blue-600">
              <RefreshCw className="w-5 h-5" />
              <h3 className="font-bold text-slate-950">Quick Stock Restock</h3>
            </div>

            <p className="text-xs text-slate-500">
              Add custom stock allocation to physical listing{" "}
              <strong className="text-slate-800">
                "{restockProduct.name}"
              </strong>{" "}
              (SKU: {restockProduct.sku}).
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-tight">
                Quantity to Add
              </label>
              <input
                type="number"
                min="1"
                required
                value={restockQty}
                onChange={(e) => setRestockQty(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setRestockProduct(null)}
                className="flex-1 py-2 text-slate-500 font-semibold border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
              >
                Apply Restock
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
