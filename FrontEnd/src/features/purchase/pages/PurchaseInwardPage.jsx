import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, ShoppingCart, Loader2, Check, UserPlus } from 'lucide-react';
import { useSuppliersList } from '../../suppliers/hooks/useSuppliers.js';
import { useProductsList } from '../../products/hooks/useProducts.js';
import { useCreatePurchase } from '../hooks/usePurchase.js';
import SupplierModal from '../../suppliers/components/SupplierModal.jsx';

export const PurchaseInwardPage = () => {
  const [supplierId, setSupplierId] = useState('');
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Purchase items grid
  const [purchaseItems, setPurchaseItems] = useState([]);

  // Medication search
  const [medSearch, setMedSearch] = useState('');
  const [debouncedMedSearch, setDebouncedMedSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Supplier modal
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  const [toast, setToast] = useState(null);
  const searchInputRef = useRef(null);

  // Debounce medicine searches
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMedSearch(medSearch);
    }, 200);
    return () => clearTimeout(handler);
  }, [medSearch]);

  // Fetch active suppliers list for select dropdown
  const { data: suppliersData } = useSuppliersList({ page: 1, limit: 100 });
  const suppliers = (suppliersData?.suppliers || []).filter(s => s.isActive);

  // Fetch products inventory
  const { data: productData, isLoading: isProductsLoading } = useProductsList({
    search: debouncedMedSearch,
    page: 1,
    limit: 12
  });

  const createPurchaseMutation = useCreatePurchase();

  // Focus search box on load
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Global Hotkeys (F2: Reset / Ctrl+Enter: Inward Submit)
  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        handleResetForm();
        triggerToast('Cleared purchase form draft.');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleInwardSubmit();
      }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [purchaseItems, supplierId, supplierInvoiceNumber, invoiceDate, discountAmount]);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleResetForm = () => {
    setPurchaseItems([]);
    setSupplierId('');
    setSupplierInvoiceNumber('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setDiscountAmount(0);
    setMedSearch('');
    searchInputRef.current?.focus();
  };

  const handleAddProduct = (product) => {
    // Check if product already exists in item grid list
    const exists = purchaseItems.some(item => item.productId === product.productId);
    if (exists) {
      triggerToast(`Product "${product.productName}" is already in the item grid.`, 'error');
      return;
    }

    setPurchaseItems([
      ...purchaseItems,
      {
        productId: product.productId,
        productName: product.productName,
        genericName: product.genericName,
        taxPercent: Number(product.taxPercent || 0),
        batchNumber: '',
        mfgDate: '',
        expiryDate: '',
        quantity: 1,
        purchaseRate: 0.00,
        mrp: Number(product.mrp || 0)
      }
    ]);

    setMedSearch('');
    setShowDropdown(false);
    triggerToast(`Added ${product.productName} to purchase grid.`);
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...purchaseItems];
    if (field === 'quantity') {
      const val = parseInt(value, 10);
      updated[index][field] = isNaN(val) || val <= 0 ? 1 : val;
    } else if (field === 'purchaseRate' || field === 'mrp') {
      const val = parseFloat(value);
      updated[index][field] = isNaN(val) || val < 0 ? 0 : val;
    } else {
      updated[index][field] = value;
    }
    setPurchaseItems(updated);
  };

  const handleRemoveRow = (index) => {
    const updated = purchaseItems.filter((_, i) => i !== index);
    setPurchaseItems(updated);
  };

  const calculateTotals = () => {
    let subTotal = 0;
    let taxAmount = 0;
    
    purchaseItems.forEach(item => {
      const lineSubtotal = Number(item.purchaseRate) * item.quantity;
      const lineTax = lineSubtotal * (Number(item.taxPercent || 0) / 100);
      subTotal += lineSubtotal;
      taxAmount += lineTax;
    });

    const gross = subTotal + taxAmount;
    const netAmount = Math.max(gross - Number(discountAmount), 0);

    return {
      subTotal,
      taxAmount,
      netAmount
    };
  };

  const totals = calculateTotals();

  const handleInwardSubmit = async () => {
    if (!supplierId) {
      triggerToast('Please select a supplier.', 'error');
      return;
    }
    if (!supplierInvoiceNumber.trim()) {
      triggerToast('Please specify the Supplier Invoice Number.', 'error');
      return;
    }
    if (purchaseItems.length === 0) {
      triggerToast('Cannot check out an empty purchase invoice grid.', 'error');
      return;
    }

    // Verify row items data
    for (const [index, item] of purchaseItems.entries()) {
      if (!item.batchNumber.trim()) {
        triggerToast(`Please enter Batch Number for Item #${index + 1}.`, 'error');
        return;
      }
      if (!item.expiryDate) {
        triggerToast(`Please specify Expiry Date for Item #${index + 1}.`, 'error');
        return;
      }
      if (item.purchaseRate <= 0) {
        triggerToast(`Purchase rate for Item #${index + 1} must be greater than zero.`, 'error');
        return;
      }
      if (item.mrp <= 0) {
        triggerToast(`MRP for Item #${index + 1} must be greater than zero.`, 'error');
        return;
      }
      if (item.purchaseRate > item.mrp) {
        triggerToast(`Purchase rate for Item #${index + 1} cannot exceed MRP limit.`, 'error');
        return;
      }
    }

    const payload = {
      supplierId: Number(supplierId),
      supplierInvoiceNumber,
      invoiceDate,
      discountAmount: Number(discountAmount),
      items: purchaseItems.map(it => ({
        productId: it.productId,
        batchNumber: it.batchNumber,
        mfgDate: it.mfgDate || null,
        expiryDate: it.expiryDate,
        quantity: it.quantity,
        purchaseRate: Number(it.purchaseRate),
        mrp: Number(it.mrp)
      }))
    };

    try {
      await createPurchaseMutation.mutateAsync(payload);
      triggerToast('Stock inward checked out and incremented successfully!');
      handleResetForm();
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Stock Inward checkout failed.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-4 select-none h-[calc(100vh-140px)]">
      
      {/* Upper Meta-information card */}
      <div className="bg-white border border-border rounded shadow-sm p-4 space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <h2 className="font-bold text-textMain text-sm flex items-center gap-1.5">
            <ShoppingCart size={16} className="text-primary" /> Record Stock Inward (Purchase)
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-textSub"><kbd className="kbd-keycap">F2</kbd> Reset</span>
            <span className="text-[10px] text-textSub"><kbd className="kbd-keycap">Ctrl+Enter</kbd> Save Stock</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-textMain">
          
          {/* Supplier select box with inline popup register button */}
          <div className="space-y-1">
            <label className="block font-semibold">Select Supplier Vendor *</label>
            <div className="flex gap-1.5">
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs"
              >
                <option value="">-- Choose Supplier --</option>
                {suppliers.map(sup => (
                  <option key={sup.supplierId} value={sup.supplierId}>{sup.supplierName}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsSupplierModalOpen(true)}
                className="p-1.5 border border-border rounded bg-white hover:bg-slate-50 text-primary transition"
                title="Add New Supplier Inline"
              >
                <UserPlus size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-semibold">Supplier Invoice Number *</label>
            <input
              type="text"
              value={supplierInvoiceNumber}
              onChange={(e) => setSupplierInvoiceNumber(e.target.value)}
              className="w-full px-3 py-1.5 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs"
              placeholder="e.g. BILL-99933"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold">Invoice Date *</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full px-3 py-1.5 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            />
          </div>

          {/* Debounced product inventory search */}
          <div className="space-y-1 relative">
            <label className="block font-semibold">Search Medicine Catalog</label>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={medSearch}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => { setMedSearch(e.target.value); setShowDropdown(true); }}
                className="w-full pl-8 pr-3 py-1.5 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                placeholder="Search by drug name..."
              />
              <div className="absolute left-2.5 top-2 text-textSub pointer-events-none">
                <Search size={14} />
              </div>
            </div>

            {/* Results autocomplete panel */}
            {showDropdown && medSearch.trim().length > 0 && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className="absolute left-0 right-0 mt-1 bg-white border border-border rounded shadow-lg divide-y divide-border/60 z-20 max-h-56 overflow-y-auto">
                  {isProductsLoading ? (
                    <div className="p-3 text-center text-textSub text-xs flex justify-center items-center gap-1.5">
                      <Loader2 className="animate-spin text-primary" size={12} />
                      Searching inventory...
                    </div>
                  ) : (productData?.products || []).length === 0 ? (
                    <div className="p-3 text-center text-textSub text-xs">
                      No matching products.
                    </div>
                  ) : (
                    (productData?.products || []).map(prod => (
                      <div
                        key={prod.productId}
                        onClick={() => handleAddProduct(prod)}
                        className="px-3 py-1.5 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition"
                      >
                        <div>
                          <strong className="text-textMain text-xs block">{prod.productName}</strong>
                          <span className="text-[10px] text-textSub block">{prod.genericName || 'No salt'}</span>
                        </div>
                        <div className="text-right text-xs text-textSub">
                          <span>Stock: {prod.stockQty}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Grid workspace table */}
      <div className="flex-1 bg-white border border-border rounded shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto min-h-0">
          {purchaseItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center text-textSub gap-2 select-none h-full">
              <ShoppingCart size={32} className="text-slate-300 stroke-[1.5]" />
              <div>
                <p className="text-xs font-bold text-textMain">Inward purchase table is empty</p>
                <p className="text-[10px] text-textSub mt-0.5">Use the search box above to load catalog medicines.</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-border text-[10px] font-bold uppercase tracking-wider text-textSub sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-center" style={{ width: '40px' }}>S.No</th>
                  <th className="px-4 py-2">Medicine Details</th>
                  <th className="px-4 py-2" style={{ width: '100px' }}>Batch No *</th>
                  <th className="px-4 py-2" style={{ width: '120px' }}>Mfg Date</th>
                  <th className="px-4 py-2" style={{ width: '120px' }}>Expiry Date *</th>
                  <th className="px-4 py-2 text-center" style={{ width: '80px' }}>Quantity *</th>
                  <th className="px-4 py-2 text-right" style={{ width: '90px' }}>Pur. Rate (₹)</th>
                  <th className="px-4 py-2 text-center" style={{ width: '60px' }}>GST%</th>
                  <th className="px-4 py-2 text-right" style={{ width: '90px' }}>MRP (₹)</th>
                  <th className="px-4 py-2 text-right" style={{ width: '100px' }}>Total (+GST)</th>
                  <th className="px-4 py-2 text-center" style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {purchaseItems.map((item, index) => {
                  const lineSubtotal = Number(item.purchaseRate) * item.quantity;
                  const lineTotal = lineSubtotal + (lineSubtotal * (Number(item.taxPercent || 0) / 100));
                  return (
                    <tr key={item.productId} className="hover:bg-slate-50/50 group h-[42px]">
                      <td className="px-4 py-1.5 text-center text-textSub font-medium">{index + 1}</td>
                      <td className="px-4 py-1.5">
                        <strong className="text-textMain block font-bold leading-normal">{item.productName}</strong>
                        <span className="text-[10px] text-textSub block leading-none mt-0.5">{item.genericName}</span>
                      </td>
                      <td className="px-4 py-1.5">
                        <input
                          type="text"
                          value={item.batchNumber}
                          onChange={(e) => handleRowChange(index, 'batchNumber', e.target.value)}
                          className="w-full px-2 py-1 border border-border rounded text-[11px] font-mono uppercase focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-textMain"
                          placeholder="BATCH-01"
                        />
                      </td>
                      <td className="px-4 py-1.5">
                        <input
                          type="date"
                          value={item.mfgDate}
                          onChange={(e) => handleRowChange(index, 'mfgDate', e.target.value)}
                          className="w-full px-2 py-1 border border-border rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-textMain"
                        />
                      </td>
                      <td className="px-4 py-1.5">
                        <input
                          type="date"
                          value={item.expiryDate}
                          onChange={(e) => handleRowChange(index, 'expiryDate', e.target.value)}
                          className="w-full px-2 py-1 border border-border rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-textMain font-medium"
                        />
                      </td>
                      <td className="px-4 py-1.5 text-center">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleRowChange(index, 'quantity', e.target.value)}
                          className="w-16 px-2 py-1 border border-border rounded text-center font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-textMain font-semibold"
                          min="1"
                        />
                      </td>
                      <td className="px-4 py-1.5 text-right">
                        <input
                          type="number"
                          value={item.purchaseRate || ''}
                          onChange={(e) => handleRowChange(index, 'purchaseRate', e.target.value)}
                          className="w-20 px-2 py-1 border border-border rounded text-right font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-textMain"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-1.5 text-center text-textSub font-mono font-semibold">
                        {item.taxPercent}%
                      </td>
                      <td className="px-4 py-1.5 text-right">
                        <input
                          type="number"
                          value={item.mrp || ''}
                          onChange={(e) => handleRowChange(index, 'mrp', e.target.value)}
                          className="w-20 px-2 py-1 border border-border rounded text-right font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-textMain font-semibold"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-1.5 text-right font-mono font-bold text-textMain">
                        ₹{lineTotal.toFixed(2)}
                      </td>
                      <td className="px-4 py-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          className="text-textSub hover:text-destructive p-1 rounded transition opacity-50 group-hover:opacity-100"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Totals computation and checkout footer */}
        <div className="border-t border-border bg-slate-50/50 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          <div className="space-y-2">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-textSub">Inward Invoice Level Discount</span>
            <div className="relative">
              <input
                type="number"
                value={discountAmount || ''}
                onChange={(e) => setDiscountAmount(Math.max(parseFloat(e.target.value) || 0, 0))}
                className="w-full pl-8 pr-4 py-1.5 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono font-semibold"
                placeholder="0.00"
              />
              <div className="absolute left-3 top-2.5 text-textSub font-mono font-bold pointer-events-none">
                ₹
              </div>
            </div>
          </div>

          <div className="hidden md:block" />

          <div className="bg-white p-3 rounded border border-border space-y-2.5 shadow-xs">
            <div className="space-y-1.5 text-textMain border-b border-border/85 pb-2">
              <div className="flex justify-between">
                <span className="text-textSub">Purchase Net Subtotal:</span>
                <span className="font-mono">₹{totals.subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textSub">Purchase GST Paid:</span>
                <span className="font-mono">₹{totals.taxAmount.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="text-emerald-600/85">Vendor Discount:</span>
                  <span className="font-mono font-medium">-₹{Number(discountAmount).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-textMain">
              <span className="text-[10px] font-bold uppercase tracking-wider">Gross Inward Total:</span>
              <span className="text-lg font-bold font-mono text-primary">₹{totals.netAmount.toFixed(2)}</span>
            </div>

            <button
              type="button"
              onClick={handleInwardSubmit}
              disabled={purchaseItems.length === 0 || createPurchaseMutation.isPending}
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2 rounded transition flex items-center justify-center gap-1.5 shadow-sm min-h-[38px]"
            >
              {createPurchaseMutation.isPending ? (
                <>
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                  Recording stock details...
                </>
              ) : (
                'Record Inward Stock [Ctrl+Enter]'
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Floating notification Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded shadow-lg z-50 flex items-center gap-2.5 max-w-sm animate-fade-in transition">
          <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Check size={12} className="animate-pulse" />
          </div>
          <span className="text-xs font-semibold tracking-wide leading-tight">{toast.message}</span>
        </div>
      )}

      {/* Inline Supplier modal popup */}
      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onSuccess={(newSupplier) => {
          setSupplierId(String(newSupplier.supplierId));
          triggerToast(`Registered and selected supplier "${newSupplier.supplierName}".`);
        }}
      />

    </div>
  );
};

export default PurchaseInwardPage;
