import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Loader2, X, Bell, Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { 
  useQueueList, 
  useActiveDoctors, 
  useIssueToken, 
  useUpdateTokenStatus, 
  useTransferToken 
} from '../hooks/useQueue.js';
import QueueTable from '../components/QueueTable.jsx';
import IssueTokenDrawer from '../components/IssueTokenDrawer.jsx';
import TransferTokenModal from '../components/TransferTokenModal.jsx';
import { printTokenReceipt } from '../utils/printService.js';

export const QueueDashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchVal, setDebouncedSearchVal] = useState('');
  
  // Filters
  const [statusTab, setStatusTab] = useState('All'); // 'All', 'Waiting', 'Called', 'Completed', 'Cancelled'
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [page, setPage] = useState(1);
  const limit = 12;

  // Drawer / Modals States
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferringToken, setTransferringToken] = useState(null);
  
  const [highlightedRowId, setHighlightedRowId] = useState(null);
  const [toast, setToast] = useState(null);

  const searchInputRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchVal(searchTerm);
      setPage(1);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Focus search input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Fetch doctors and queue list
  const { data: doctors = [], refetch: refetchDoctors } = useActiveDoctors();
  
  const statusParam = statusTab === 'All' ? '' : statusTab;

  const { data: queueData, isLoading, isError, error, refetch: refetchQueue } = useQueueList({
    search: debouncedSearchVal,
    status: statusParam,
    doctorId: selectedDoctorId,
    date: filterDate,
    page,
    limit
  });

  // Mutations
  const issueTokenMutation = useIssueToken();
  const updateStatusMutation = useUpdateTokenStatus();
  const transferTokenMutation = useTransferToken();

  // Keyboard Shortcuts (F2 / Ctrl+F / Esc)
  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setIsIssueOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, []);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(1);
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClearSearch();
    }
  };

  // Intake Drawer Submit
  const handleIssueSubmit = async (formData) => {
    try {
      const token = await issueTokenMutation.mutateAsync(formData);
      triggerToast(`Token issued successfully for patient.`);
      setIsIssueOpen(false);

      // Highlight new token
      setHighlightedRowId(token.tokenId);
      setTimeout(() => {
        setHighlightedRowId(null);
        searchInputRef.current?.focus();
      }, 2000);
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Failed to issue token.', 'error');
    }
  };

  // Status Cycles update
  const handleStatusUpdate = async (tokenId, status) => {
    try {
      await updateStatusMutation.mutateAsync({ id: tokenId, status });
      triggerToast(`Token status updated to "${status}".`);
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  // Reprint Spool trigger
  const handleReprint = (token) => {
    printTokenReceipt(token);
    triggerToast(`Re-spooled print request for token.`);
  };

  // Transfer Modals trigger
  const handleTransferTrigger = (token) => {
    setTransferringToken(token);
    setIsTransferOpen(true);
  };

  const handleTransferSubmit = async (tokenId, targetDoctorId) => {
    try {
      const updated = await transferTokenMutation.mutateAsync({ id: tokenId, doctorId: targetDoctorId });
      setIsTransferOpen(false);
      setTransferringToken(null);
      triggerToast(`Token successfully transferred to new provider.`);
      
      // Highlight row
      setHighlightedRowId(updated.tokenId);
      setTimeout(() => setHighlightedRowId(null), 2000);
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Failed to transfer token.', 'error');
    }
  };

  // Count queues in tabs
  const getQueueCountForTab = (tab) => {
    if (!queueData) return 0;
    // Note: React Query keeps cache, so we use count stats dynamically or fetch totals
    return queueData.totalCount || 0;
  };

  // Quick select doctor filters
  const handleDoctorCardClick = (doctorId) => {
    setSelectedDoctorId(prev => prev === doctorId ? '' : doctorId);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-textMain tracking-tight">Queue Management Dashboard</h1>
          <div className="flex items-center gap-3 mt-1 select-none">
            <span className="text-[11px] text-textSub font-medium">Shortcuts:</span>
            <span className="flex items-center gap-1"><span className="kbd-keycap">F2</span> <span className="text-[10px] text-textSub font-semibold">Issue Token</span></span>
            <span className="flex items-center gap-1"><span className="kbd-keycap">Ctrl+F</span> <span className="text-[10px] text-textSub font-semibold">Search Input</span></span>
            <span className="flex items-center gap-1"><span className="kbd-keycap">Esc</span> <span className="text-[10px] text-textSub font-semibold">Clear Search</span></span>
          </div>
        </div>
        <button
          onClick={() => setIsIssueOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded text-xs shadow-sm transition"
        >
          <Plus size={14} />
          Issue Token [F2]
        </button>
      </div>

      {/* Doctor Availability cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div 
          onClick={() => handleDoctorCardClick('')}
          className={`p-3 rounded border cursor-pointer transition select-none flex flex-col justify-between ${
            selectedDoctorId === '' 
              ? 'bg-blue-50 border-primary/50 text-primary shadow-sm' 
              : 'bg-white border-border text-textMain hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-textSub">All Providers</span>
          <span className="text-xl font-bold font-mono mt-1">
            {doctors.reduce((sum, d) => sum + d.waitingCount, 0)}
          </span>
          <span className="text-[10px] text-textSub mt-0.5">patients waiting</span>
        </div>

        {doctors.map((doc) => {
          const isSelected = selectedDoctorId === doc.userId;
          const docCapitalized = doc.username.charAt(0).toUpperCase() + doc.username.slice(1);
          return (
            <div 
              key={doc.userId}
              onClick={() => handleDoctorCardClick(doc.userId)}
              className={`p-3 rounded border cursor-pointer transition select-none flex flex-col justify-between ${
                isSelected 
                  ? 'bg-blue-50 border-primary/50 text-primary shadow-sm' 
                  : 'bg-white border-border text-textMain hover:bg-slate-50'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-textSub">Dr. {docCapitalized}</span>
              <span className="text-xl font-bold font-mono mt-1">{doc.waitingCount}</span>
              <span className="text-[10px] text-textSub mt-0.5">waiting in cabin queue</span>
            </div>
          );
        })}
      </div>

      {/* Query Filter and Search panel */}
      <div className="bg-surface p-3 rounded border border-border shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-12 py-2 text-sm rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            placeholder="Search active queues by Patient Name, Phone, or Code..."
          />
          <div className="absolute left-3 top-3 text-textSub pointer-events-none">
            <Search size={16} />
          </div>
          <div className="absolute right-3 top-2.5 flex items-center gap-1.5 select-none">
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-textSub hover:text-textMain p-0.5 hover:bg-slate-100 rounded transition"
              >
                <X size={14} />
              </button>
            )}
            <span className="kbd-keycap">Ctrl+F</span>
          </div>
        </div>

        {/* Date and doctor selectors */}
        <div className="flex gap-2 flex-wrap">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm rounded border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
          
          <select
            value={selectedDoctorId}
            onChange={(e) => { setSelectedDoctorId(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm rounded border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Doctors</option>
            {doctors.map(d => (
              <option key={d.userId} value={d.userId}>
                Dr. {d.username.charAt(0).toUpperCase() + d.username.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Tabs Panels */}
      <div className="flex border-b border-border select-none overflow-x-auto gap-1">
        {['All', 'Waiting', 'Called', 'Completed', 'Cancelled'].map((tab) => {
          const isActive = statusTab === tab;
          return (
            <button
              key={tab}
              onClick={() => { setStatusTab(tab); setPage(1); }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-primary text-primary bg-blue-50/20'
                  : 'border-transparent text-textSub hover:text-textMain hover:border-slate-300'
              }`}
            >
              {tab === 'Called' ? 'Called (Active)' : tab}
            </button>
          );
        })}
      </div>

      {/* Queue Listings Table */}
      {isLoading ? (
        <div className="bg-surface p-20 text-center rounded border border-border flex items-center justify-center gap-2">
          <Loader2 className="animate-spin text-primary" size={20} />
          <span className="text-textSub text-xs font-semibold">Loading daily queue...</span>
        </div>
      ) : isError ? (
        <div className="bg-red-50 text-destructive p-4 rounded border border-red-200 text-xs">
          <h4 className="font-bold">Failed to load active queue</h4>
          <p className="mt-0.5">{error?.response?.data?.message || error?.message}</p>
        </div>
      ) : (
        <>
          <QueueTable
            tokens={queueData?.tokens || []}
            onStatusUpdate={handleStatusUpdate}
            onTransferTrigger={handleTransferTrigger}
            onReprint={handleReprint}
            highlightedRowId={highlightedRowId}
          />

          {/* Pagination control */}
          {queueData && queueData.totalPages > 1 && (
            <div className="flex items-center justify-between bg-surface px-4 py-2 rounded border border-border shadow-sm text-xs">
              <span className="text-textSub font-medium">
                Page <strong className="text-textMain">{queueData.currentPage}</strong> of <strong className="text-textMain">{queueData.totalPages}</strong> (Total {queueData.totalCount} queue items)
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
                  onClick={() => setPage(p => Math.min(p + 1, queueData.totalPages))}
                  disabled={page === queueData.totalPages}
                  className="px-3 py-1.5 border border-border rounded font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals & Drawers */}
      <IssueTokenDrawer
        patient={null}
        isOpen={isIssueOpen}
        onClose={() => setIsIssueOpen(false)}
        onSubmit={handleIssueSubmit}
        isSubmitting={issueTokenMutation.isPending}
      />

      <TransferTokenModal
        isOpen={isTransferOpen}
        onClose={() => { setIsTransferOpen(false); setTransferringToken(null); }}
        onTransfer={handleTransferSubmit}
        token={transferringToken}
        isSubmitting={transferTokenMutation.isPending}
      />

      {/* Floating notifications toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded shadow-lg z-50 flex items-center gap-2.5 max-w-sm animate-fade-in transition duration-300">
          <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Bell size={12} className="animate-pulse" />
          </div>
          <span className="text-xs font-semibold tracking-wide leading-tight">{toast.message}</span>
          <button 
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-0.5 hover:bg-slate-800 rounded transition ml-auto"
          >
            <X size={12} />
          </button>
        </div>
      )}

    </div>
  );
};

export default QueueDashboardPage;
