import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, User, Users, Clipboard, ShoppingCart, Loader2, CreditCard, Check } from 'lucide-react';
import { useQueueList } from '../../tokens/hooks/useQueue.js';
import { useProductsList } from '../../products/hooks/useProducts.js';
import { useCreateInvoice } from '../hooks/useSales.js';
import { printInvoiceReceipt } from '../utils/printInvoiceService.js';

export const SalesBillingPage = () => {
  // Mode selection: 'Clinic' or 'OTC' (Walk-In)
  const [billingMode, setBillingMode] = useState('OTC'); 
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);

  // Billing entries
  const [billingItems, setBillingItems] = useState([]);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [invoiceDiscount, setInvoiceDiscount] = useState(0);

  // Medicine search
  const [medSearch, setMedSearch] = useState('');
  const [debouncedMedSearch, setDebouncedMedSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [toast, setToast] = useState(null);
  const searchInputRef = useRef(null);

  // Debounce medicine search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMedSearch(medSearch);
    }, 200);
    return () => clearTimeout(handler);
  }, [medSearch]);

  // Fetch active patient queues (Called and Waiting)
  const { data: queueData, refetch: refetchQueue } = useQueueList({
    status: '', // Fetch all active (Waiting & Called)
    date: new Date().toISOString().split('T')[0],
    page: 1,
    limit: 50
  });

  // Filter queues to only show Waiting or Called
  const activeQueues = (queueData?.tokens || []).filter(t => t.status === 'Waiting' || t.status === 'Called');

  // Fetch medicines list based on search query
  const { data: productData, isLoading: isProductsLoading } = useProductsList({
    search: debouncedMedSearch,
    page: 1,
    limit: 12
  });

  const createInvoiceMutation = useCreateInvoice();

  // Focus drug search on load
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Global Hotkeys (F2: New walk-in bill / Ctrl+Enter: Checkout)
  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        handleResetForm();
        setBillingMode('OTC');
        triggerToast('Reset billing grid for OTC Walk-in Customer.');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleCheckoutSubmit();
      }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [billingItems, paymentMode, invoiceDiscount, selectedPatient, selectedToken, billingMode]);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleResetForm = () => {
    setBillingItems([]);
    setInvoiceDiscount(0);
    setPaymentMode('Cash');
    setSelectedPatient(null);
    setSelectedToken(null);
    setMedSearch('');
    searchInputRef.current?.focus();
  };

  const handleSelectQueuePatient = (token) => {
    setSelectedPatient(token.patient);
    setSelectedToken(token);
    setBillingMode('Clinic');
    triggerToast(`Loaded billing queue context for Patient ${token.patient.name}.`);
    searchInputRef.current?.focus();
  };

  const handleAddMedicine = (product) => {
    if (product.stockQty <= 0) {
      triggerToast(`Product batch "${product.batchNumber}" is out of stock!`, 'error');
      return;
    }

    // Check if product batch already added
    const existingIndex = billingItems.findIndex(
      item => item.productId === product.productId && item.batchNumber === product.batchNumber
    );
    if (existingIndex > -1) {
      const updated = [...billingItems];
      const newQty = updated[existingIndex].quantity + 1;
      if (newQty > product.stockQty) {
        triggerToast(`Cannot exceed available batch stock of ${product.stockQty} for ${product.productName} (Batch: ${product.batchNumber}).`, 'error');
        return;
      }
      updated[existingIndex].quantity = newQty;
      setBillingItems(updated);
    } else {
      setBillingItems([
        ...billingItems,
        {
          productId: product.productId,
          productName: product.productName,
          genericName: product.genericName,
          batchNumber: product.batchNumber,
          expiryDate: product.expiryDate,
          mrp: Number(product.mrp),
          taxPercent: Number(product.taxPercent || 0),
          stockQty: product.stockQty,
          quantity: 1,
          discountAmount: 0
        }
      ]);
    }

    setMedSearch('');
    setShowDropdown(false);
    triggerToast(`Added ${product.productName} (Batch: ${product.batchNumber}) to billing list.`);
  };

  const handleQuantityChange = (index, value) => {
    const qty = parseInt(value, 10);
    if (isNaN(qty) || qty <= 0) return;

    const updated = [...billingItems];
    if (qty > updated[index].stockQty) {
      triggerToast(`Cannot exceed available stock of ${updated[index].stockQty} units.`, 'error');
      updated[index].quantity = updated[index].stockQty;
    } else {
      updated[index].quantity = qty;
    }
    setBillingItems(updated);
  };

  const handleDiscountChange = (index, value) => {
    const disc = parseFloat(value);
    if (isNaN(disc) || disc < 0) return;

    const updated = [...billingItems];
    const maxLineTotal = updated[index].mrp * updated[index].quantity;
    if (disc > maxLineTotal) {
      triggerToast(`Discount cannot exceed line subtotal ₹${maxLineTotal.toFixed(2)}.`, 'error');
      updated[index].discountAmount = maxLineTotal;
    } else {
      updated[index].discountAmount = disc;
    }
    setBillingItems(updated);
  };

  const handleRemoveRow = (index) => {
    const updated = billingItems.filter((_, i) => i !== index);
    setBillingItems(updated);
  };

  // Perform client side GST reverse and net total sums
  const calculateTotals = () => {
    let subTotal = 0;
    let taxAmount = 0;
    let totalDiscount = Number(invoiceDiscount);
    let netAmount = 0;

    billingItems.forEach(item => {
      const lineGross = item.mrp * item.quantity;
      const lineNet = lineGross - Number(item.discountAmount);

      const taxRate = Number(item.taxPercent || 0);
      const exclTaxSubtotal = lineNet / (1 + (taxRate / 100));
      const lineTax = lineNet - exclTaxSubtotal;

      subTotal += exclTaxSubtotal;
      taxAmount += lineTax;
      totalDiscount += Number(item.discountAmount);
      netAmount += lineNet;
    });

    const finalNet = Math.max(netAmount - Number(invoiceDiscount), 0);

    return {
      subTotal,
      taxAmount,
      totalDiscount,
      netAmount: finalNet
    };
  };

  const totals = calculateTotals();

  const handleCheckoutSubmit = async () => {
    if (billingItems.length === 0) {
      triggerToast('Cannot check out an empty invoice grid.', 'error');
      return;
    }

    if (billingMode === 'Clinic' && !selectedPatient) {
      triggerToast('Please select a valid patient visit from the queue tab.', 'error');
      return;
    }

    const payload = {
      patientId: billingMode === 'Clinic' ? selectedPatient.patientId : null,
      tokenId: billingMode === 'Clinic' ? selectedToken.tokenId : null,
      paymentMode,
      discountAmount: Number(invoiceDiscount),
      items: billingItems.map(it => ({
        productId: it.productId,
        batchNumber: it.batchNumber,
        quantity: it.quantity,
        discountAmount: Number(it.discountAmount)
      }))
    };

    try {
      const invoice = await createInvoiceMutation.mutateAsync(payload);
      triggerToast('Invoice generated and printed successfully!');
      
      // Spool invoice thermal receipt
      printInvoiceReceipt(invoice);

      // Reset components
      handleResetForm();
      refetchQueue();
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Checkout failed.', 'error');
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-4 h-[calc(100vh-140px)]">
      
      {/* Active Patients Queue Column (Left) */}
      <div className="w-full xl:w-80 flex flex-col bg-white border border-border rounded shadow-sm flex-shrink-0 select-none overflow-hidden">
        <div className="p-3 border-b border-border bg-slate-50/50 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-textMain flex items-center gap-1.5">
            <Users size={14} className="text-primary" /> Active Queue Visits
          </span>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
            {activeQueues.length} pending
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
          {activeQueues.length === 0 ? (
            <div className="p-8 text-center text-textSub text-xs">
              No pending token lines in daily queues.
            </div>
          ) : (
            activeQueues.map(token => {
              const isSelected = selectedToken?.tokenId === token.tokenId;
              return (
                <div
                  key={token.tokenId}
                  onClick={() => handleSelectQueuePatient(token)}
                  className={`p-3 cursor-pointer hover:bg-slate-50 transition flex flex-col gap-1 border-l-2 ${
                    isSelected ? 'border-primary bg-blue-50/20' : 'border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-mono font-bold text-primary">
                      {token.displayToken || `#${token.tokenNumber}`}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      token.status === 'Called' ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {token.status}
                    </span>
                  </div>
                  <span className="text-[13px] font-bold text-textMain mt-0.5">{token.patient?.name}</span>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-textSub">
                    <span>{token.patient?.phone}</span>
                    <span>Dr. {token.doctor?.username?.toUpperCase()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Billing Grid Workspace (Right) */}
      <div className="flex-1 flex flex-col bg-white border border-border rounded shadow-sm overflow-hidden">
        
        {/* Workspace Toolbar Header */}
        <div className="px-4 py-3 border-b border-border bg-slate-50/50 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3 select-none">
            <h2 className="font-bold text-textMain text-sm flex items-center gap-1.5">
              <ShoppingCart size={16} className="text-primary" /> POS Billing Terminal
            </h2>
            <div className="flex rounded border border-border bg-white overflow-hidden p-0.5 text-xs">
              <button
                type="button"
                onClick={() => { setBillingMode('OTC'); setSelectedPatient(null); setSelectedToken(null); }}
                className={`px-3 py-1 font-semibold rounded transition ${
                  billingMode === 'OTC' ? 'bg-primary text-white' : 'text-textSub hover:text-textMain'
                }`}
              >
                OTC Walk-In
              </button>
              <button
                type="button"
                onClick={() => setBillingMode('Clinic')}
                className={`px-3 py-1 font-semibold rounded transition ${
                  billingMode === 'Clinic' ? 'bg-primary text-white' : 'text-textSub hover:text-textMain'
                }`}
              >
                Clinic Patient
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 select-none">
            <span className="text-[10px] text-textSub"><kbd className="kbd-keycap">F2</kbd> New Walk-in</span>
            <span className="text-[10px] text-textSub"><kbd className="kbd-keycap">Ctrl+Enter</kbd> Checkout</span>
            <button
              onClick={handleResetForm}
              className="text-[11px] font-bold border border-border bg-white hover:bg-slate-50 text-textMain px-2.5 py-1.5 rounded transition"
            >
              Reset [F2]
            </button>
          </div>
        </div>

        {/* Selected Customer Info banner */}
        {billingMode === 'Clinic' && selectedPatient && (
          <div className="bg-blue-50/65 px-4 py-2 border-b border-border text-xs flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><span className="text-textSub font-semibold">Patient:</span> <strong className="text-textMain">{selectedPatient.name}</strong></span>
              <span className="flex items-center gap-1"><span className="text-textSub font-semibold">Phone:</span> <strong className="text-textMain">{selectedPatient.phone}</strong></span>
              <span className="flex items-center gap-1"><span className="text-textSub font-semibold">Token:</span> <strong className="text-primary font-mono">{selectedToken?.displayToken}</strong></span>
            </div>
            <button 
              onClick={() => { setSelectedPatient(null); setSelectedToken(null); }} 
              className="text-destructive hover:text-red-700 text-[10px] font-bold"
            >
              Deselect
            </button>
          </div>
        )}

        {/* Live Medicine Search Box */}
        <div className="p-4 border-b border-border bg-slate-50/20 relative z-20">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={medSearch}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => { setMedSearch(e.target.value); setShowDropdown(true); }}
              className="w-full pl-10 pr-12 py-2 text-sm rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Search medications by Brand Name or Generic Salt formulation..."
            />
            <div className="absolute left-3 top-3 text-textSub pointer-events-none">
              <Search size={16} />
            </div>
            {medSearch && (
              <button 
                type="button" 
                onClick={() => setMedSearch('')}
                className="absolute right-3 top-2.5 text-textSub hover:text-textMain px-1 rounded transition"
              >
                Clear
              </button>
            )}
          </div>

          {/* Autocomplete Results Panel */}
          {showDropdown && medSearch.trim().length > 0 && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute left-4 right-4 mt-1 bg-white border border-border rounded-md shadow-lg divide-y divide-border/60 z-20 max-h-64 overflow-y-auto">
                {isProductsLoading ? (
                  <div className="p-4 text-center text-textSub text-xs flex justify-center items-center gap-1.5">
                    <Loader2 className="animate-spin text-primary" size={14} />
                    Searching drug inventory database...
                  </div>
                ) : (productData?.products || []).length === 0 ? (
                  <div className="p-4 text-center text-textSub text-xs">
                    No matching products found.
                  </div>
                ) : (
                  (productData?.products || []).flatMap(prod => {
                    const productBatches = prod.batches || [];
                    if (productBatches.length === 0) {
                      return [{
                        productId: prod.productId,
                        productName: prod.productName,
                        genericName: prod.genericName,
                        taxPercent: prod.taxPercent,
                        batchNumber: 'NO BATCH',
                        expiryDate: 'N/A',
                        stockQty: 0,
                        mrp: Number(prod.mrp)
                      }];
                    }
                    return productBatches.map(batch => ({
                      productId: prod.productId,
                      productName: prod.productName,
                      genericName: prod.genericName,
                      taxPercent: prod.taxPercent,
                      batchNumber: batch.batchNumber,
                      expiryDate: batch.expiryDate,
                      stockQty: batch.stockQty,
                      mrp: Number(batch.mrp)
                    }));
                  }).map((item, idx) => {
                    const isOutOfStock = item.stockQty <= 0;
                    const displayKey = `${item.productId}-${item.batchNumber}-${idx}`;
                    return (
                      <div
                        key={displayKey}
                        onClick={() => !isOutOfStock && handleAddMedicine(item)}
                        className={`px-4 py-2 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition ${
                          isOutOfStock ? 'opacity-55 cursor-not-allowed bg-red-50/20' : ''
                        }`}
                      >
                        <div>
                          <strong className="text-textMain text-xs block">{item.productName}</strong>
                          <span className="text-[10px] text-textSub block mt-0.5">
                            {item.genericName || 'No salt'} • Batch: <strong className="font-mono">{item.batchNumber}</strong> (Exp: {item.expiryDate})
                          </span>
                        </div>
                        <div className="text-right text-xs">
                          <span className="block font-bold text-textMain">₹{item.mrp.toFixed(2)}</span>
                          <span className={`text-[10px] font-semibold mt-0.5 block ${
                            isOutOfStock ? 'text-destructive' : 'text-emerald-600'
                          }`}>
                            {isOutOfStock ? 'OUT OF STOCK' : `Stock: ${item.stockQty} units`}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Dense Sales Checkout Items Grid Table */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {billingItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center select-none text-textSub gap-2.5">
              <ShoppingCart size={40} className="stroke-[1.5] text-slate-300" />
              <div>
                <p className="text-xs font-bold text-textMain">Billing grid is empty</p>
                <p className="text-[10px] text-textSub mt-0.5">Use the search box above to load medicines.</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead className="bg-slate-50 border-b border-border text-[10px] font-bold uppercase tracking-wider text-textSub sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-center" style={{ width: '40px' }}>S.No</th>
                  <th className="px-4 py-2">Medication Description</th>
                  <th className="px-4 py-2 text-center" style={{ width: '80px' }}>Tax (GST%)</th>
                  <th className="px-4 py-2 text-right" style={{ width: '90px' }}>MRP (₹)</th>
                  <th className="px-4 py-2 text-center" style={{ width: '100px' }}>Quantity</th>
                  <th className="px-4 py-2 text-right" style={{ width: '100px' }}>Discount (₹)</th>
                  <th className="px-4 py-2 text-right" style={{ width: '110px' }}>Line Total (₹)</th>
                  <th className="px-4 py-2 text-center" style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {billingItems.map((item, index) => {
                  const lineTotal = (item.mrp * item.quantity) - Number(item.discountAmount);
                  return (
                    <tr key={`${item.productId}-${item.batchNumber}`} className="hover:bg-slate-50/50 group h-[38px]">
                      <td className="px-4 py-1.5 text-center text-textSub font-medium">{index + 1}</td>
                      <td className="px-4 py-1.5">
                        <strong className="text-textMain block font-bold leading-normal">{item.productName}</strong>
                        <span className="text-[10px] text-textSub block leading-none mt-0.5">
                          {item.genericName} • Batch: <strong className="font-mono">{item.batchNumber}</strong> (Exp: {item.expiryDate})
                        </span>
                      </td>
                      <td className="px-4 py-1.5 text-center text-textSub font-mono font-semibold">{item.taxPercent}%</td>
                      <td className="px-4 py-1.5 text-right font-mono text-textMain">₹{item.mrp.toFixed(2)}</td>
                      <td className="px-4 py-1.5 text-center">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                          className="w-16 px-2 py-0.5 text-center border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono font-semibold text-textMain"
                          min="1"
                          max={item.stockQty}
                        />
                        <span className="text-[9px] text-textSub block mt-0.5">Avail: {item.stockQty}</span>
                      </td>
                      <td className="px-4 py-1.5 text-right">
                        <input
                          type="number"
                          value={item.discountAmount || ''}
                          onChange={(e) => handleDiscountChange(index, e.target.value)}
                          className="w-20 px-2 py-0.5 text-right border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono text-textMain"
                          placeholder="0.00"
                          min="0"
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

        {/* Summaries, payment selections, and checkout actions footer */}
        <div className="border-t border-border bg-slate-50/50 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 select-none">
          
          {/* Payment mode choice selection */}
          <div className="space-y-2">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-textSub">Select Payment Channel</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['Cash', 'UPI', 'Card', 'Mixed'].map(mode => {
                const isActive = paymentMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`p-2 rounded border font-semibold text-center transition flex items-center justify-center gap-1.5 ${
                      isActive 
                        ? 'border-primary bg-primary text-white shadow-sm' 
                        : 'border-border bg-white text-textMain hover:bg-slate-50'
                    }`}
                  >
                    {isActive && <Check size={12} />}
                    {mode}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Invoice level overall discount */}
          <div className="space-y-2">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-textSub">Overall Invoice Discount</span>
            <div className="relative">
              <input
                type="number"
                value={invoiceDiscount || ''}
                onChange={(e) => setInvoiceDiscount(Math.max(parseFloat(e.target.value) || 0, 0))}
                className="w-full pl-8 pr-4 py-1.5 text-sm rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono font-semibold"
                placeholder="0.00"
              />
              <div className="absolute left-3 top-2.5 text-textSub font-mono font-bold text-xs pointer-events-none">
                ₹
              </div>
            </div>
            <span className="text-[9px] text-textSub block">Deducted directly from net total checkout bill.</span>
          </div>

          {/* Billing calculations and submit triggers */}
          <div className="bg-white p-3 rounded border border-border space-y-2.5">
            <div className="space-y-1.5 text-xs text-textMain border-b border-border/80 pb-2">
              <div className="flex justify-between">
                <span className="text-textSub">Gross Subtotal:</span>
                <span className="font-mono">₹{totals.subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textSub">Total GST Tax:</span>
                <span className="font-mono">₹{totals.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span className="text-emerald-600/80">Total Discount:</span>
                <span className="font-mono font-medium">-₹{totals.totalDiscount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-textMain">
              <span className="text-[11px] font-bold uppercase tracking-wider">Net Bill Total:</span>
              <span className="text-lg font-bold font-mono text-primary">₹{totals.netAmount.toFixed(2)}</span>
            </div>

            <button
              type="button"
              onClick={handleCheckoutSubmit}
              disabled={billingItems.length === 0 || createInvoiceMutation.isPending}
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2 rounded text-xs transition flex items-center justify-center gap-1.5 shadow-sm min-h-[38px]"
            >
              {createInvoiceMutation.isPending ? (
                <>
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                  Generating invoice...
                </>
              ) : (
                'Generate & Print Invoice [Ctrl+Enter]'
              )}
            </button>
          </div>

        </div>

      </div>

      {/* Floating notification Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded shadow-lg z-50 flex items-center gap-2.5 max-w-sm animate-fade-in transition">
          <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <ShoppingCart size={12} className="animate-pulse" />
          </div>
          <span className="text-xs font-semibold tracking-wide leading-tight">{toast.message}</span>
        </div>
      )}

    </div>
  );
};

export default SalesBillingPage;
