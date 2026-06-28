import React, { useState, useEffect } from 'react';
import { Search, Loader2, Eye, X, Calendar } from 'lucide-react';
import { usePurchaseList, usePurchaseDetails } from '../hooks/usePurchase.js';

// Sub-component: Purchase details modal popup
const PurchaseDetailsModal = ({ id, isOpen, onClose }) => {
  const { data: invoice, isLoading, isError } = usePurchaseDetails(id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white rounded-lg border border-border shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-textMain text-sm">Purchase Inward Details</h3>
            <span className="text-[10px] text-textSub mt-0.5 block font-mono">
              Inward Code: {invoice?.invoiceNumber || 'Loading...'}
            </span>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-textSub hover:text-textMain p-1 rounded transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-textMain">
          {isLoading ? (
            <div className="p-16 text-center text-textSub flex justify-center items-center gap-1.5 font-semibold">
              <Loader2 className="animate-spin text-primary" size={16} />
              Fetching purchase entries...
            </div>
          ) : isError || !invoice ? (
            <div className="p-4 bg-red-50 text-destructive rounded border border-red-200">
              Failed to load purchase invoice item records.
            </div>
          ) : (
            <>
              {/* Meta summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/60 p-3 rounded border border-border">
                <div>
                  <span className="text-textSub font-semibold block uppercase tracking-wider text-[9px]">Supplier Name</span>
                  <strong className="text-textMain text-xs font-bold block mt-0.5">{invoice.supplier?.supplierName}</strong>
                </div>
                <div>
                  <span className="text-textSub font-semibold block uppercase tracking-wider text-[9px]">Supplier Invoice #</span>
                  <strong className="text-textMain text-xs font-mono font-bold block mt-0.5">{invoice.supplierInvoiceNumber}</strong>
                </div>
                <div>
                  <span className="text-textSub font-semibold block uppercase tracking-wider text-[9px]">Inward Date</span>
                  <strong className="text-textMain text-xs block mt-0.5">
                    {new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </strong>
                </div>
                <div>
                  <span className="text-textSub font-semibold block uppercase tracking-wider text-[9px]">Recorded By</span>
                  <strong className="text-textMain text-xs block mt-0.5">{invoice.creator?.username || 'Pharmacist'}</strong>
                </div>
              </div>

              {/* Items grid */}
              <div className="border border-border rounded overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-border text-[9px] font-bold uppercase tracking-wider text-textSub h-[32px]">
                    <tr>
                      <th className="px-3 py-1.5 text-center" style={{ width: '40px' }}>S.No</th>
                      <th className="px-3 py-1.5">Medicine Name</th>
                      <th className="px-3 py-1.5" style={{ width: '100px' }}>Batch No</th>
                      <th className="px-3 py-1.5 text-center" style={{ width: '105px' }}>Expiry</th>
                      <th className="px-3 py-1.5 text-center" style={{ width: '80px' }}>Quantity</th>
                      <th className="px-3 py-1.5 text-right" style={{ width: '90px' }}>Rate (₹)</th>
                      <th className="px-3 py-1.5 text-center" style={{ width: '60px' }}>GST%</th>
                      <th className="px-3 py-1.5 text-right" style={{ width: '90px' }}>MRP (₹)</th>
                      <th className="px-3 py-1.5 text-right" style={{ width: '100px' }}>Line Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {(invoice.items || []).map((item, idx) => {
                      const total = Number(item.itemTotal).toFixed(2);
                      return (
                        <tr key={item.purchaseInvoiceItemId} className="hover:bg-slate-50/50 h-[36px]">
                          <td className="px-3 py-1 text-center text-textSub">{idx + 1}</td>
                          <td className="px-3 py-1">
                            <strong className="text-textMain font-bold block">{item.product?.productName}</strong>
                            <span className="text-[10px] text-textSub block">{item.product?.genericName}</span>
                          </td>
                          <td className="px-3 py-1 font-mono font-semibold uppercase">{item.batchNumber}</td>
                          <td className="px-3 py-1 text-center font-mono">
                            {new Date(item.expiryDate).toLocaleDateString('en-IN', { month: '2-digit', year: 'numeric' })}
                          </td>
                          <td className="px-3 py-1 text-center font-mono font-semibold">{item.quantity}</td>
                          <td className="px-3 py-1 text-right font-mono">₹{Number(item.purchaseRate).toFixed(2)}</td>
                          <td className="px-3 py-1 text-center font-mono">{item.taxPercent}%</td>
                          <td className="px-3 py-1 text-right font-mono font-semibold text-textMain">₹{Number(item.mrp).toFixed(2)}</td>
                          <td className="px-3 py-1 text-right font-mono font-bold text-textMain">₹{total}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary calculations */}
              <div className="flex justify-end pt-2 border-t border-border/80">
                <div className="w-64 space-y-1.5 text-xs text-textMain font-medium">
                  <div className="flex justify-between">
                    <span className="text-textSub">Purchase Subtotal:</span>
                    <span className="font-mono">₹{Number(invoice.subTotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textSub">Purchase GST Total:</span>
                    <span className="font-mono">₹{Number(invoice.taxAmount || 0).toFixed(2)}</span>
                  </div>
                  {Number(invoice.discountAmount) > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span className="text-emerald-600/80">Discount Deducted:</span>
                      <span className="font-mono">-₹{Number(invoice.discountAmount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-textMain border-t border-border/60 pt-1.5 font-bold">
                    <span>NET AMOUNT:</span>
                    <span className="text-sm font-mono text-primary">₹{Number(invoice.netAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3.5 border-t border-border bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border border-border hover:bg-slate-50 rounded transition font-semibold"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
};

export const PurchaseHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [detailsInvoiceId, setDetailsInvoiceId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: listData, isLoading, isError, error } = usePurchaseList({
    search: debouncedSearch,
    date: filterDate,
    page,
    limit
  });

  const handleOpenDetails = (invoiceId) => {
    setDetailsInvoiceId(invoiceId);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4 select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-textMain tracking-tight">Purchase Ledger History</h1>
        <p className="text-xs text-textSub mt-0.5">List of recorded supplier invoices, recorded item quantities, and stock costs</p>
      </div>

      {/* Filters */}
      <div className="bg-surface p-3 rounded border border-border shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Search purchases by Inward ID, Supplier Invoice, or Vendor Name..."
          />
          <div className="absolute left-3 top-3 text-textSub pointer-events-none">
            <Search size={16} />
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm rounded border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {filterDate && (
            <button
              onClick={() => { setFilterDate(''); setPage(1); }}
              className="text-xs font-bold text-destructive hover:text-red-700 px-2 border border-border rounded bg-white hover:bg-slate-50 transition"
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-surface p-20 text-center rounded border border-border flex items-center justify-center gap-2">
          <Loader2 className="animate-spin text-primary" size={20} />
          <span className="text-textSub text-xs font-semibold">Querying purchase history...</span>
        </div>
      ) : isError ? (
        <div className="bg-red-50 text-destructive p-4 rounded border border-red-200 text-xs">
          <h4 className="font-bold">Failed to load purchase records</h4>
          <p className="mt-0.5">{error?.response?.data?.message || error?.message}</p>
        </div>
      ) : (listData?.invoices || []).length === 0 ? (
        <div className="bg-surface p-20 text-center rounded border border-border text-textSub text-xs">
          No purchase invoices matches your filter options.
        </div>
      ) : (
        <>
          <div className="bg-surface border border-border rounded shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-border text-[10px] font-bold uppercase tracking-wider text-textSub h-[38px]">
                <tr>
                  <th className="px-4 py-2" style={{ width: '120px' }}>Inward ID</th>
                  <th className="px-4 py-2" style={{ width: '140px' }}>Supplier Invoice</th>
                  <th className="px-4 py-2" style={{ width: '150px' }}>Inward Date</th>
                  <th className="px-4 py-2">Supplier Details</th>
                  <th className="px-4 py-2 text-right" style={{ width: '110px' }}>Tax (GST ₹)</th>
                  <th className="px-4 py-2 text-right" style={{ width: '120px' }}>Net Total Cost</th>
                  <th className="px-4 py-2 text-center" style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {(listData.invoices || []).map(invoice => {
                  const formattedDate = new Date(invoice.invoiceDate).toLocaleDateString('en-IN', {
                    dateStyle: 'medium'
                  });
                  return (
                    <tr key={invoice.purchaseInvoiceId} className="hover:bg-slate-50/50 h-[38px]">
                      <td className="px-4 py-1.5 font-mono font-bold text-textMain">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-1.5 font-mono text-textMain">{invoice.supplierInvoiceNumber}</td>
                      <td className="px-4 py-1.5 text-textSub">{formattedDate}</td>
                      <td className="px-4 py-1.5">
                        {invoice.supplier ? (
                          <>
                            <strong className="text-textMain block font-bold">{invoice.supplier.supplierName}</strong>
                            <span className="text-[10px] text-textSub block">{invoice.supplier.phone}</span>
                          </>
                        ) : (
                          <span className="text-textSub italic font-medium">Unknown supplier</span>
                        )}
                      </td>
                      <td className="px-4 py-1.5 text-right font-mono text-textSub">₹{Number(invoice.taxAmount).toFixed(2)}</td>
                      <td className="px-4 py-1.5 text-right font-mono font-bold text-textMain">₹{Number(invoice.netAmount).toFixed(2)}</td>
                      <td className="px-4 py-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(invoice.purchaseInvoiceId)}
                          className="p-1 text-textSub hover:text-primary rounded hover:bg-slate-100 transition inline-flex items-center gap-1 font-semibold text-[10px]"
                          title="View items detail popup"
                        >
                          <Eye size={12} /> View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {listData.totalPages > 1 && (
            <div className="flex items-center justify-between bg-surface px-4 py-2 rounded border border-border shadow-sm text-xs">
              <span className="text-textSub font-medium">
                Page <strong className="text-textMain">{listData.currentPage}</strong> of <strong className="text-textMain">{listData.totalPages}</strong> (Total {listData.totalCount} invoices)
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

      {/* Details modal popup */}
      <PurchaseDetailsModal
        id={detailsInvoiceId}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setDetailsInvoiceId(null); }}
      />

    </div>
  );
};

export default PurchaseHistoryPage;
