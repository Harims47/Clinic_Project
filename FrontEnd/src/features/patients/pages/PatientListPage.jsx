import React, { useState, useEffect, useRef } from 'react';
import { Search, UserPlus, Loader2, X, Bell } from 'lucide-react';
import { usePatientsList, useRegisterPatient, useUpdatePatient } from '../hooks/usePatients.js';
import PatientTable from '../components/PatientTable.jsx';
import PatientDrawer from '../components/PatientDrawer.jsx';
import PatientDetailsDrawer from '../components/PatientDetailsDrawer.jsx';

export const PatientListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12; // Adjusted to list more records cleanly

  // Modals/Drawer States
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  
  // Trackers
  const [editingPatient, setEditingPatient] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [highlightedRowId, setHighlightedRowId] = useState(null);
  
  // Toast notifications
  const [toast, setToast] = useState(null);

  const searchInputRef = useRef(null);

  // Queries & Mutations
  const { data, isLoading, isError, error } = usePatientsList({
    search: searchVal,
    page,
    limit
  });

  const registerMutation = useRegisterPatient();
  const updateMutation = useUpdatePatient();

  const isFormSubmitting = registerMutation.isLoading || updateMutation.isLoading;

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      // F2 - Open Register Patient Drawer
      if (e.key === 'F2') {
        e.preventDefault();
        handleOpenRegister();
      }

      // Ctrl+F - Focus Search Input
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, []);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchVal(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchVal('');
    setPage(1);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const handleNextPage = () => {
    if (data && page < data.totalPages) setPage(p => p + 1);
  };

  // Open Handlers
  const handleOpenRegister = () => {
    setEditingPatient(null);
    setFormDrawerOpen(true);
  };

  const handleOpenEdit = (patient) => {
    setEditingPatient(patient);
    setFormDrawerOpen(true);
    setDetailsDrawerOpen(false); // Close details if transitioning to edit
  };

  const handleOpenDetails = (patient) => {
    setViewingPatient(patient);
    setDetailsDrawerOpen(true);
  };

  // Close Handlers
  const handleCloseForm = () => {
    setFormDrawerOpen(false);
    setEditingPatient(null);
    registerMutation.reset();
    updateMutation.reset();
  };

  const handleCloseDetails = () => {
    setDetailsDrawerOpen(false);
    setViewingPatient(null);
  };

  // Drawer Form submission handler
  const handleFormSubmit = async (formData) => {
    try {
      let savedPatient;
      if (editingPatient) {
        savedPatient = await updateMutation.mutateAsync({
          id: editingPatient.patientId,
          patientData: formData
        });
        triggerToast(`Patient "${savedPatient.name}" updated successfully.`);
      } else {
        savedPatient = await registerMutation.mutateAsync(formData);
        triggerToast(`Patient "${savedPatient.name}" registered successfully.`);
      }
      
      const savedId = savedPatient.patientId;
      handleCloseForm();

      // Implement interaction lifecycle: Highlight new row for 2 seconds, then redirect focus
      setHighlightedRowId(savedId);
      setTimeout(() => {
        setHighlightedRowId(null);
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 2000);
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Operation failed.', 'error');
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Title & Keyboard actions header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-textMain tracking-tight">Patient Register Directory</h1>
          <div className="flex items-center gap-3 mt-1 select-none">
            <span className="text-[11px] text-textSub font-medium">Shortcuts:</span>
            <span className="flex items-center gap-1"><span className="kbd-keycap">F2</span> <span className="text-[10px] text-textSub font-semibold">New Profile</span></span>
            <span className="flex items-center gap-1"><span className="kbd-keycap">Ctrl+F</span> <span className="text-[10px] text-textSub font-semibold">Search Input</span></span>
          </div>
        </div>
        <button
          onClick={handleOpenRegister}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded text-xs shadow-sm transition"
        >
          <UserPlus size={14} />
          Register Patient [F2]
        </button>
      </div>

      {/* Query Search Panel */}
      <div className="bg-surface p-3 rounded border border-border shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-12 py-2 text-sm rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Search by Name, Phone, or Code..."
            />
            <div className="absolute right-3 top-2.5 select-none pointer-events-none">
              <span className="kbd-keycap">Ctrl+F</span>
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-xs transition"
          >
            Search
          </button>
          {searchVal && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-3 py-2 border border-border bg-white text-textMain font-bold rounded text-xs hover:bg-slate-50 transition"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Main Dense Table Grid */}
      {isLoading ? (
        <div className="bg-surface p-20 text-center rounded border border-border flex items-center justify-center gap-2">
          <Loader2 className="animate-spin text-primary" size={20} />
          <span className="text-textSub text-xs font-semibold">Loading directories...</span>
        </div>
      ) : isError ? (
        <div className="bg-red-50 text-destructive p-4 rounded border border-red-200 text-xs">
          <h4 className="font-bold">Failed to load patients</h4>
          <p className="mt-0.5">{error?.response?.data?.message || error?.message}</p>
        </div>
      ) : (
        <>
          <PatientTable 
            patients={data?.patients || []} 
            onView={handleOpenDetails}
            onEdit={handleOpenEdit}
            highlightedRowId={highlightedRowId}
          />

          {/* Paginations bar */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between bg-surface px-4 py-2 rounded border border-border shadow-sm text-xs">
              <span className="text-textSub font-medium">
                Page <strong className="text-textMain">{data.currentPage}</strong> of <strong className="text-textMain">{data.totalPages}</strong> (Total {data.totalCount} patients)
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-border rounded font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={page === data.totalPages}
                  className="px-3 py-1.5 border border-border rounded font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================
          DRAWER 1: REGISTER / EDIT SIDE PANEL
          ======================================================== */}
      <PatientDrawer
        patient={editingPatient}
        isOpen={formDrawerOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        isSubmitting={isFormSubmitting}
      />

      {/* ========================================================
          DRAWER 2: DETAILS INSPECT SHEET
          ======================================================== */}
      <PatientDetailsDrawer
        patient={viewingPatient}
        isOpen={detailsDrawerOpen}
        onClose={handleCloseDetails}
        onEdit={handleOpenEdit}
      />

      {/* ========================================================
          FLOATING CLINICAL TOAST NOTIFICATION
          ======================================================== */}
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

export default PatientListPage;
