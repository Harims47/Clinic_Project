import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Loader2, X, Bell } from 'lucide-react';
import { useProductsList, useCreateProduct, useUpdateProduct } from '../hooks/useProducts.js';
import ProductTable from '../components/ProductTable.jsx';
import ProductDrawer from '../components/ProductDrawer.jsx';

export const ProductListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchVal, setDebouncedSearchVal] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12;

  // Modals/Drawer States
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  
  // Trackers
  const [editingProduct, setEditingProduct] = useState(null);
  const [highlightedRowId, setHighlightedRowId] = useState(null);
  
  // Toast notifications
  const [toast, setToast] = useState(null);

  const searchInputRef = useRef(null);

  // Debounced Search logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchVal(searchTerm);
      setPage(1);
    }, 250);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Focus on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Queries & Mutations
  const { data, isLoading, isError, error } = useProductsList({
    search: debouncedSearchVal,
    page,
    limit
  });

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const isFormSubmitting = createProductMutation.isPending || updateProductMutation.isPending;

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      // F2 - Open Register Product Drawer
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

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(1);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClearSearch();
    }
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const handleNextPage = () => {
    if (data && page < data.totalPages) setPage(p => p + 1);
  };

  // Open Handlers
  const handleOpenRegister = () => {
    setEditingProduct(null);
    setFormDrawerOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormDrawerOpen(true);
  };

  // Close Handlers
  const handleCloseForm = () => {
    setFormDrawerOpen(false);
    setEditingProduct(null);
    createProductMutation.reset();
    updateProductMutation.reset();
  };

  // Drawer Form submission handler
  const handleFormSubmit = async (formData) => {
    try {
      let savedProduct;
      if (editingProduct) {
        savedProduct = await updateProductMutation.mutateAsync({
          id: editingProduct.productId,
          productData: formData
        });
        triggerToast(`Product "${savedProduct.productName}" updated successfully.`);
      } else {
        savedProduct = await createProductMutation.mutateAsync(formData);
        triggerToast(`Product "${savedProduct.productName}" registered successfully.`);
      }
      
      const savedId = savedProduct.productId;
      handleCloseForm();

      // Highlight row for 2 seconds
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
          <h1 className="text-xl font-bold text-textMain tracking-tight">Product Inventory</h1>
          <div className="flex items-center gap-3 mt-1 select-none">
            <span className="text-[11px] text-textSub font-medium">Shortcuts:</span>
            <span className="flex items-center gap-1"><span className="kbd-keycap">F2</span> <span className="text-[10px] text-textSub font-semibold">Register Item</span></span>
            <span className="flex items-center gap-1"><span className="kbd-keycap">Ctrl+F</span> <span className="text-[10px] text-textSub font-semibold">Search Input</span></span>
            <span className="flex items-center gap-1"><span className="kbd-keycap">Esc</span> <span className="text-[10px] text-textSub font-semibold">Clear Search</span></span>
          </div>
        </div>
        <button
          onClick={handleOpenRegister}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded text-xs shadow-sm transition"
        >
          <Plus size={14} />
          Register Product [F2]
        </button>
      </div>

      {/* Live Debounced Search Panel */}
      <div className="bg-surface p-3 rounded border border-border shadow-sm">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-12 py-2 text-sm rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            placeholder="Search by Product Trade Name or Generic Ingredient..."
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
                title="Clear Search (Esc)"
              >
                <X size={14} />
              </button>
            )}
            <span className="kbd-keycap">Ctrl+F</span>
          </div>
        </div>
      </div>

      {/* Main Dense Table Grid */}
      {isLoading ? (
        <div className="bg-surface p-20 text-center rounded border border-border flex items-center justify-center gap-2">
          <Loader2 className="animate-spin text-primary" size={20} />
          <span className="text-textSub text-xs font-semibold">Loading inventory...</span>
        </div>
      ) : isError ? (
        <div className="bg-red-50 text-destructive p-4 rounded border border-red-200 text-xs">
          <h4 className="font-bold">Failed to load product inventory</h4>
          <p className="mt-0.5">{error?.response?.data?.message || error?.message}</p>
        </div>
      ) : (
        <>
          <ProductTable 
            products={data?.products || []} 
            onEdit={handleOpenEdit}
            highlightedRowId={highlightedRowId}
          />

          {/* Pagination bar */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between bg-surface px-4 py-2 rounded border border-border shadow-sm text-xs">
              <span className="text-textSub font-medium">
                Page <strong className="text-textMain">{data.currentPage}</strong> of <strong className="text-textMain">{data.totalPages}</strong> (Total {data.totalCount} products)
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
          DRAWER: REGISTER / EDIT SIDE PANEL
          ======================================================== */}
      <ProductDrawer
        product={editingProduct}
        isOpen={formDrawerOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        isSubmitting={isFormSubmitting}
      />

      {/* ========================================================
          FLOATING CLINICAL TOAST NOTIFICATION
          ======================================================= */}
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

export default ProductListPage;
