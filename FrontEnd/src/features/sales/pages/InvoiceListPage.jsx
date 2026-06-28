import React, { useState, useEffect } from 'react';
import { Search, Printer, Ban, Loader2, Calendar, AlertTriangle } from 'lucide-react';
import { useSalesList, useCancelInvoice } from '../hooks/useSales.js';
import { printInvoiceReceipt } from '../utils/printInvoiceService.js';

export const InvoiceListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12;

  const [toast, setToast] = useState(null);

  // Debounce search input queries
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: listData, isLoading, isError, error, refetch } = useSalesList({
    search: debouncedSearch,
    date: filterDate,
    page,
    limit
  });

  const cancelInvoiceMutation = useCancelInvoice();

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleReprint = (invoice) => {
    printInvoiceReceipt(invoice);
    triggerToast(`Spooling reprint request for Invoice ${invoice.invoiceNumber}.`);
  };

  const handleCancelClick = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to cancel this invoice? This will restore all line item medicine stock counts to the pharmacy inventory.')) {
      return;
    }

    try {
      await cancelInvoiceMutation.mutateAsync(invoiceId);
      triggerToast('Invoice cancelled successfully and inventory quantities restored.');
      refetch();
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Failed to cancel invoice.', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div>
        <h1 className="text-xl font-bold text-textMain tracking-tight">Pharmacy Billing Ledger</h1>
        <p className="text-xs text-textSub mt-0.5">List of all historical pharmacy sales invoices, payments, and cancellations</p>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-surface p-3 rounded border border-border shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Search invoices by Invoice ID, Patient Name, or Phone..."
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
              className="text-xs font-bold text-destructive hover:text-red-700 px-2 hover:bg-slate-50 border border-border rounded transition"
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      {/* Invoice List Table */}
      {isLoading ? (
        <div className="bg-surface p-20 text-center rounded border border-border flex items-center justify-center gap-2">
          <Loader2 className="animate-spin text-primary" size={20} />
          <span className="text-textSub text-xs font-semibold">Querying sales records...</span>
        </div>
      ) : isError ? (
        <div className="bg-red-50 text-destructive p-4 rounded border border-red-200 text-xs">
          <h4 className="font-bold">Failed to load invoice history</h4>
          <p className="mt-0.5">{error?.response?.data?.message || error?.message}</p>
        </div>
      ) : (listData?.invoices || []).length === 0 ? (
        <div className="bg-surface p-20 text-center rounded border border-border text-textSub text-xs select-none">
          No invoices match your filters.
        </div>
      ) : (
        <>
          <div className="bg-surface border border-border rounded shadow-sm overflow-hidden select-none">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-border text-[10px] font-bold uppercase tracking-wider text-textSub h-[38px]">
                <tr>
                  <th className="px-4 py-2" style={{ width: '120px' }}>Invoice ID</th>
                  <th className="px-4 py-2" style={{ width: '150px' }}>Date & Time</th>
                  <th className="px-4 py-2">Patient Details</th>
                  <th className="px-4 py-2 text-center" style={{ width: '100px' }}>Payment Mode</th>
                  <th className="px-4 py-2 text-right" style={{ width: '110px' }}>Total GST Tax</th>
                  <th className="px-4 py-2 text-right" style={{ width: '110px' }}>Net Total</th>
                  <th className="px-4 py-2 text-center" style={{ width: '100px' }}>Status</th>
                  <th className="px-4 py-2 text-center" style={{ width: '110px' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {(listData.invoices || []).map(invoice => {
                  const formattedDate = new Date(invoice.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  });
                  const isCancelled = invoice.paymentStatus === 'Cancelled';
                  return (
                    <tr key={invoice.invoiceId} className={`hover:bg-slate-50/50 h-[38px] ${isCancelled ? 'bg-red-50/10 opacity-70' : ''}`}>
                      <td className="px-4 py-1.5 font-mono font-bold text-textMain">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-1.5 text-textSub">{formattedDate}</td>
                      <td className="px-4 py-1.5">
                        {invoice.patient ? (
                          <>
                            <strong className="text-textMain block font-bold">{invoice.patient.name}</strong>
                            <span className="text-[10px] text-textSub block">{invoice.patient.phone} • {invoice.patient.patientCode}</span>
                          </>
                        ) : (
                          <span className="text-textSub italic font-medium">Walk-In OTC Customer</span>
                        )}
                      </td>
                      <td className="px-4 py-1.5 text-center text-textMain font-semibold">{invoice.paymentMode}</td>
                      <td className="px-4 py-1.5 text-right font-mono text-textSub">₹{Number(invoice.taxAmount).toFixed(2)}</td>
                      <td className="px-4 py-1.5 text-right font-mono font-bold text-textMain">₹{Number(invoice.netAmount).toFixed(2)}</td>
                      <td className="px-4 py-1.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isCancelled ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {invoice.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-1.5 text-center flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleReprint(invoice)}
                          className="p-1 text-textSub hover:text-primary rounded hover:bg-slate-100 transition"
                          title="Reprint Receipt"
                        >
                          <Printer size={14} />
                        </button>
                        {!isCancelled && (
                          <button
                            type="button"
                            onClick={() => handleCancelClick(invoice.invoiceId)}
                            className="p-1 text-textSub hover:text-destructive rounded hover:bg-slate-100 transition"
                            title="Cancel Invoice"
                          >
                            <Ban size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {listData.totalPages > 1 && (
            <div className="flex items-center justify-between bg-surface px-4 py-2 rounded border border-border shadow-sm text-xs select-none">
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

      {/* Floating toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded shadow-lg z-50 flex items-center gap-2.5 max-w-sm animate-fade-in transition">
          <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Printer size={12} className="animate-pulse" />
          </div>
          <span className="text-xs font-semibold tracking-wide leading-tight">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default InvoiceListPage;
