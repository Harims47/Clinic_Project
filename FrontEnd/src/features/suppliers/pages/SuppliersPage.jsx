import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Loader2, Phone, Mail, MapPin } from 'lucide-react';
import { useSuppliersList } from '../hooks/useSuppliers.js';
import SupplierDrawer from '../components/SupplierDrawer.jsx';

export const SuppliersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Debounce search inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: listData, isLoading, isError, error, refetch } = useSuppliersList({
    search: debouncedSearch,
    page,
    limit
  });

  const handleOpenRegister = () => {
    setSelectedSupplier(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-4 select-none">
      
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-textMain tracking-tight">Suppliers Directory</h1>
          <p className="text-xs text-textSub mt-0.5">Register external drug distributors, manage billing profiles and contact channels</p>
        </div>
        <button
          onClick={handleOpenRegister}
          className="bg-primary hover:bg-primary-hover text-white font-bold py-1.5 px-3 rounded text-xs transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus size={14} /> Register Supplier
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-surface p-3 border border-border rounded shadow-sm">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Search suppliers by Business Name, Contact Phone, or Email..."
          />
          <div className="absolute left-3 top-3 text-textSub pointer-events-none">
            <Search size={16} />
          </div>
        </div>
      </div>

      {/* Grid List Table */}
      {isLoading ? (
        <div className="bg-surface p-20 text-center rounded border border-border flex items-center justify-center gap-2">
          <Loader2 className="animate-spin text-primary" size={20} />
          <span className="text-textSub text-xs font-semibold">Querying supplier directory...</span>
        </div>
      ) : isError ? (
        <div className="bg-red-50 text-destructive p-4 rounded border border-red-200 text-xs">
          <h4 className="font-bold">Failed to load supplier records</h4>
          <p className="mt-0.5">{error?.response?.data?.message || error?.message}</p>
        </div>
      ) : (listData?.suppliers || []).length === 0 ? (
        <div className="bg-surface p-20 text-center rounded border border-border text-textSub text-xs">
          No suppliers register matches the filter criteria.
        </div>
      ) : (
        <>
          <div className="bg-surface border border-border rounded shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-border text-[10px] font-bold uppercase tracking-wider text-textSub h-[38px]">
                <tr>
                  <th className="px-4 py-2">Supplier Business Name</th>
                  <th className="px-4 py-2" style={{ width: '150px' }}>Contact Phone</th>
                  <th className="px-4 py-2" style={{ width: '180px' }}>GSTIN Code</th>
                  <th className="px-4 py-2">Address Location</th>
                  <th className="px-4 py-2 text-center" style={{ width: '100px' }}>Status</th>
                  <th className="px-4 py-2 text-center" style={{ width: '80px' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {(listData.suppliers || []).map(supplier => (
                  <tr key={supplier.supplierId} className="hover:bg-slate-50/50 h-[38px]">
                    <td className="px-4 py-1.5">
                      <strong className="text-textMain block font-bold">{supplier.supplierName}</strong>
                      {supplier.email && (
                        <span className="text-[10px] text-textSub block flex items-center gap-1 mt-0.5">
                          <Mail size={10} /> {supplier.email}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-1.5 text-textMain font-medium font-mono">
                      <span className="flex items-center gap-1">
                        <Phone size={10} className="text-textSub" /> {supplier.phone}
                      </span>
                    </td>
                    <td className="px-4 py-1.5 font-mono text-textMain uppercase font-semibold">
                      {supplier.gstin || <span className="text-textSub italic font-normal">N/A</span>}
                    </td>
                    <td className="px-4 py-1.5 text-textSub max-w-xs overflow-hidden text-overflow-ellipsis whitespace-nowrap">
                      {supplier.address ? (
                        <span className="flex items-center gap-1">
                          <MapPin size={10} className="flex-shrink-0" /> {supplier.address}
                        </span>
                      ) : (
                        <span className="italic">No address recorded</span>
                      )}
                    </td>
                    <td className="px-4 py-1.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        supplier.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {supplier.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(supplier)}
                        className="p-1 text-textSub hover:text-primary rounded hover:bg-slate-100 transition inline-flex items-center gap-1 font-semibold text-[10px]"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          {listData.totalPages > 1 && (
            <div className="flex items-center justify-between bg-surface px-4 py-2 rounded border border-border shadow-sm text-xs">
              <span className="text-textSub font-medium">
                Page <strong className="text-textMain">{listData.currentPage}</strong> of <strong className="text-textMain">{listData.totalPages}</strong> (Total {listData.totalCount} suppliers)
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-border rounded font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(p + 1, listData.totalPages))}
                  disabled={page === listData.totalPages}
                  className="px-3 py-1.5 border border-border rounded font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Slideout right-side Drawer */}
      <SupplierDrawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); refetch(); }}
        supplier={selectedSupplier}
      />

    </div>
  );
};

export default SuppliersPage;
