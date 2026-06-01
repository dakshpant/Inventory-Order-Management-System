import React, { useEffect, useState } from "react";
import { LayoutDashboard, Package, Users, ShoppingBag, Bell, Menu, X, RefreshCw, } from "lucide-react";
import { StatsService } from "./services/stats.service";
import Dashboard from "./components/Dashboard";
import ProductSection from "./components/ProductSection";
import CustomerSection from "./components/CustomerSection";
import OrderSection from "./components/OrderSection";
export default function App() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    lowStockCount: 0,
    revenue: 0,
  });
  const handleRefreshState = () => {
    setRefreshSignal((prev) => prev + 1);
  };
  useEffect(() => {
    StatsService.get()
      .then(setStats)
      .catch(() => undefined);
  }, [refreshSignal]);
  const handleNavClick = (section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };
  return (<div className="min-h-screen bg-slate-50 flex" id="app-container">
    {/* 1. SIDEBAR NAVIGATION - DESKTOP SCREEN */}
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-[#1e293b] shrink-0 select-none">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center gap-2.5 px-6 bg-slate-950 border-b border-slate-800">
        <span className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-base shadow-sm ring-1 ring-white/10 animate-pulse">
          I
        </span>
        <div>
          <h3 className="font-extrabold text-white text-sm tracking-tight">
            StockCore OS
          </h3>
          <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase font-mono mt-0.5">
            Control Terminal
          </p>
        </div>
      </div>

      {/* Sidebar Nav anchors */}
      <nav className="flex-1 py-6 px-3 space-y-1 text-sm font-semibold">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Management Panel
        </div>

        <button onClick={() => handleNavClick("dashboard")} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md transition-colors group ${activeSection === "dashboard"
          ? "bg-blue-600/15 text-blue-400 font-bold border-l-2 border-blue-500"
          : "hover:bg-slate-800 hover:text-white text-slate-400"}`}>
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className="w-5 h-5 opacity-80 group-hover:scale-105 transition-transform" />
            <span>Real-Time Analytics</span>
          </div>
        </button>

        <button onClick={() => handleNavClick("products")} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md transition-colors group ${activeSection === "products"
          ? "bg-blue-600/15 text-blue-400 font-bold border-l-2 border-blue-500"
          : "hover:bg-slate-800 hover:text-white text-slate-400"}`}>
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 opacity-80 group-hover:scale-105 transition-transform" />
            <span>Catalog Products</span>
          </div>
          {/* Stock Alerts Badging right in the sidebar drawer! */}
          {stats.lowStockCount > 0 && (<span className="inline-flex items-center justify-center px-2 py-0.5 text-[9px] font-extrabold bg-red-600 text-white rounded-full animate-pulse shadow-xs">
            {stats.lowStockCount} alert
          </span>)}
        </button>

        <button onClick={() => handleNavClick("customers")} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md transition-colors group ${activeSection === "customers"
          ? "bg-blue-600/15 text-blue-400 font-bold border-l-2 border-blue-500"
          : "hover:bg-slate-800 hover:text-white text-slate-400"}`}>
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 opacity-80 group-hover:scale-105 transition-transform" />
            <span>Client Registry</span>
          </div>
        </button>

        <button onClick={() => handleNavClick("orders")} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md transition-colors group ${activeSection === "orders"
          ? "bg-blue-600/15 text-blue-400 font-bold border-l-2 border-blue-500"
          : "hover:bg-slate-800 hover:text-white text-slate-400"}`}>
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 opacity-80 group-hover:scale-105 transition-transform" />
            <span>Order Streamer</span>
          </div>
        </button>
      </nav>

      {/* Footer info blocks */}
      <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono space-y-2">
        <div className="flex justify-between">
          {/* <span>Docker Container</span> */}
          {/* <span className="text-emerald-400 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
          Running
        </span> */}
        </div>
        {/* <div className="flex justify-between">
          <span>Postgres DB Connected</span>
          <span className="text-emerald-400 font-semibold">● Active</span>
        </div> */}
        <div className="pt-2 border-t border-slate-850 italic text-slate-600 text-[9px]">
          v1.4.2 stable build
        </div>
      </div>
    </aside>

    {/* MOBILE HEADER TOP RAIL */}
    <div className="flex flex-col flex-1 min-w-0">
      <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-3">
          {/* Hamburger Button */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1.5 hover:bg-slate-100 rounded-lg lg:hidden text-slate-600" title="Toggle systems terminal navigation">
            {isMobileMenuOpen ? (<X className="w-6 h-6" />) : (<Menu className="w-6 h-6" />)}
          </button>

          {/* Title */}
          <div className="flex items-center gap-2">
            <span className="lg:hidden w-7.5 h-7.5 rounded bg-blue-600 flex items-center justify-center font-black text-white text-sm">
              I
            </span>
            <h1 className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base">
              {activeSection === "dashboard" && "Operations Command Centre"}
              {activeSection === "products" && "Inventory Catalog Management"}
              {activeSection === "customers" && "Active Customer Registry"}
              {activeSection === "orders" && "Acquisition Purchase Orders"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick alert badge */}
          <button onClick={() => {
            setActiveSection("products");
            setIsMobileMenuOpen(false);
          }} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 relative transition-colors" title={stats.lowStockCount
            ? `${stats.lowStockCount} stock warnings pending`
            : "All safe"}>
            <Bell className="w-5 h-5 mb-0.5" />
            {stats.lowStockCount > 0 && (<span className="absolute top-1.5 right-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />)}
          </button>

          {/* Sync counter button */}
          <button onClick={handleRefreshState} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors" title="Hard sync registry lists">
            <RefreshCw className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* MOBILE NAVIGATION DRAWER */}
      {isMobileMenuOpen && (<div className="fixed inset-0 bg-slate-950/60 backdrop-blur-2xs z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
        <div className="absolute top-0 left-0 w-64 h-full bg-slate-900 text-slate-300 flex flex-col p-4 space-y-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-black text-white text-base">
                I
              </span>
              <h3 className="font-extrabold text-white text-sm">
                StockCore UI
              </h3>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-slate-800 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1 flex-1 text-sm font-semibold">
            <button onClick={() => handleNavClick("dashboard")} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left ${activeSection === "dashboard" ? "bg-blue-600/15 text-blue-400 font-bold border-l-2 border-blue-500" : "text-slate-400 hover:bg-slate-800"}`}>
              <LayoutDashboard className="w-5 h-5" />
              <span>Real-Time Analytics</span>
            </button>
            <button onClick={() => handleNavClick("products")} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-left ${activeSection === "products" ? "bg-blue-600/15 text-blue-400 font-bold border-l-2 border-blue-500" : "text-slate-400 hover:bg-slate-800"}`}>
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5" />
                <span>Catalog Products</span>
              </div>
              {stats.lowStockCount > 0 && (<span className="px-2 py-0.5 text-[9px] bg-red-500 text-white font-extrabold rounded-full">
                {stats.lowStockCount} alert
              </span>)}
            </button>
            <button onClick={() => handleNavClick("customers")} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left ${activeSection === "customers" ? "bg-blue-600/15 text-blue-400 font-bold border-l-2 border-blue-500" : "text-slate-400 hover:bg-slate-800"}`}>
              <Users className="w-5 h-5" />
              <span>Client Registry</span>
            </button>
            <button onClick={() => handleNavClick("orders")} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left ${activeSection === "orders" ? "bg-blue-600/15 text-blue-400 font-bold border-l-2 border-blue-500" : "text-slate-400 hover:bg-slate-800"}`}>
              <ShoppingBag className="w-5 h-5" />
              <span>Order Streamer</span>
            </button>
          </div>

          <div className="text-[10px] text-slate-500 font-mono pt-4 border-t border-slate-800">
            FastAPI Persistence Engine
          </div>
        </div>
      </div>)}

      {/* 2. MAIN APPLICATION CONTENT PORT - WITH TRANSITION CONTAINER */}
      <div className="flex-1 overflow-y-auto flex flex-col justify-between">
        <main className="flex-1 px-4 py-8 md:px-8 max-w-7xl w-full mx-auto">
          {activeSection === "dashboard" && (<Dashboard onNavigate={(sect) => setActiveSection(sect)} onRefresh={handleRefreshState} refreshSignal={refreshSignal} />)}

          {activeSection === "products" && (<ProductSection onRefresh={handleRefreshState} refreshSignal={refreshSignal} />)}

          {activeSection === "customers" && (<CustomerSection onRefresh={handleRefreshState} refreshSignal={refreshSignal} />)}

          {activeSection === "orders" && (<OrderSection onRefresh={handleRefreshState} refreshSignal={refreshSignal} />)}
        </main>

        {/* Connected Footer Status Bar */}
        <footer className="bg-white border-t border-slate-200 h-12 flex items-center justify-center px-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Built by</span>
            <span className="font-semibold text-slate-800">Daksh Pant</span>
            <span className="text-slate-300">•</span>
            <span>Assignment for</span>
            <span className="font-semibold text-blue-600">Ethera AI</span>
          </div>
        </footer>
      </div>
    </div>
  </div>);
}


