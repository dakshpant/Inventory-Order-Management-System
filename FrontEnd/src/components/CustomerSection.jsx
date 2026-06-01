import React, { useEffect, useState } from "react";
import { Users, Search, Trash2, Mail, Phone, Check, X, UserPlus, ShoppingBag, } from "lucide-react";
import { CustomerService } from "../services/customer.service";
import { OrderService } from "../services/order.service";
export default function CustomerSection({ onRefresh, refreshSignal, }) {
    const [customers, setCustomers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    // Modal toggle state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const reloadData = async () => {
        const [freshCustomers, freshOrders] = await Promise.all([
            CustomerService.getAll(),
            OrderService.getAll(),
        ]);
        setCustomers(freshCustomers);
        setOrders(freshOrders);
    };
    useEffect(() => {
        reloadData().catch((err) => setError(err.message || "Unable to load customers"));
    }, [refreshSignal]);
    const openAddModal = () => {
        setError("");
        setName("");
        setEmail("");
        setPhone("");
        setIsModalOpen(true);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!name.trim())
            return setError("Customer name is required");
        if (!email.trim())
            return setError("Customer email is required");
        // Email format validation helper
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return setError("Please enter a valid email address");
        }
        try {
            await CustomerService.create({
                name,
                email,
                phone,
            });
            setSuccess(`registered new customer account: "${name}"`);
            setIsModalOpen(false);
            await reloadData();
            onRefresh();
            setTimeout(() => setSuccess(""), 4000);
        }
        catch (err) {
            setError(err.message || "Error occurred");
        }
    };
    const handleDelete = async (c) => {
        const hasOrders = orders.some((o) => o.customerId === c.id);
        let confirmMsg = `Are you sure you want to delete customer "${c.name}"?`;
        if (hasOrders) {
            confirmMsg = `WARNING: "${c.name}" has existing order records on file. Deleting this customer profile will orphan their historic logs. Proceed?`;
        }
        if (window.confirm(confirmMsg)) {
            try {
                await CustomerService.delete(c.id);
                setSuccess(`Removed customer profile "${c.name}".`);
                await reloadData();
                onRefresh();
                setTimeout(() => setSuccess(""), 4000);
            }
            catch (err) {
                setError(err.message);
            }
        }
    };
    const filteredCustomers = customers.filter((c) => {
        return (c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase()) ||
            c.phone.includes(search));
    });
    return (<div className="space-y-6 animate-fade-in" id="customer-management-section">
      {/* Top Banner Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950">
            Active Client Registry
          </h2>
          <p className="text-xs text-slate-500">
            Monitor client profiles, register new target accounts, and review
            contact indices.
          </p>
        </div>
        <button onClick={openAddModal} className="inline-flex items-center gap-1.5 justify-center px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors" id="btn-add-customer">
          <UserPlus className="w-4 h-4"/>
          Add Client
        </button>
      </div>

      {/* Success Notification */}
      {success && (<div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-xs shadow-xs animate-slide-up">
          <Check className="w-4 h-4 text-emerald-600 shrink-0"/>
          <span className="font-medium">Successfully {success}</span>
        </div>)}

      {/* Search Input Bar */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Search className="w-4 h-4"/>
        </span>
        <input type="text" placeholder="Search by full name, registered email address, or phone digits..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 shadow-2xs"/>
      </div>

      {/* Customers List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (<div className="col-span-full bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs">
            <Users className="w-8 h-8 stroke-1 text-slate-300 mx-auto mb-2"/>
            <p className="font-semibold text-slate-500">No customers found</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Add client records or search with alternative keywords.
            </p>
          </div>) : (filteredCustomers.map((c) => {
            // Compute initials for gorgeous avatar badge
            const initials = c.name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
            // Compute brief quick count of orders this customer placed
            const orderCount = orders.filter((o) => o.customerId === c.id).length;
            return (<div key={c.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 shadow-3xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Beautiful Circle Avatar */}
                      <span className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs tracking-tight shrink-0">
                        {initials || "??"}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 truncate text-sm" title={c.name}>
                          {c.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          {c.id}
                        </span>
                      </div>
                    </div>

                    <button onClick={() => handleDelete(c)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded transition-colors" title="Delete profile">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>

                  {/* Customer Information Panel */}
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0"/>
                      <a href={`mailto:${c.email}`} className="truncate hover:underline hover:text-blue-600">
                        {c.email}
                      </a>
                    </div>
                    {c.phone && (<div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0"/>
                        <span className="font-mono">{c.phone}</span>
                      </div>)}
                  </div>
                </div>

                {/* Bottom Order Statistics */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-1 text-slate-400 font-semibold uppercase tracking-wider text-[9px]">
                    <ShoppingBag className="w-3.5 h-3.5"/>
                    {orderCount === 1
                    ? "1 Order Streamed"
                    : `${orderCount} Orders Streamed`}
                  </span>
                  <span className="font-mono font-bold text-slate-500">
                    Registry Active
                  </span>
                </div>
              </div>);
        }))}
      </div>

      {/* Slide-over or modal for typing incoming Customer profiles */}
      {isModalOpen && (<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600">
                <Users className="w-5 h-5"/>
                <h3 className="font-bold text-slate-950">
                  Add Customer Account
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
                  Full Name
                </label>
                <input type="text" placeholder="e.g. John Connor" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"/>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 uppercase tracking-tight">
                  Email Address
                </label>
                <input type="email" placeholder="e.g. connor@resistance.net" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono lowercase"/>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 uppercase tracking-tight">
                  Phone Number
                </label>
                <input type="tel" placeholder="e.g. 555-0100" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono"/>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-500 font-semibold border border-slate-200 rounded-lg hover:bg-slate-50">
                  Close Input
                </button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm">
                  Create Registry
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
}
