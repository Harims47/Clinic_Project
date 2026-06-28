import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Package, Layers, Percent, Database, Plus } from 'lucide-react';
import productSchema from '../validation.js';
import { 
  useManufacturersList, 
  useCreateManufacturer, 
  useHsnCodesList, 
  useCreateHsnCode 
} from '../hooks/useProducts.js';
import MfrModal from './MfrModal.jsx';
import HsnModal from './HsnModal.jsx';

export const ProductDrawer = ({ product, isOpen, onClose, onSubmit, isSubmitting }) => {
  const [isMfrModalOpen, setIsMfrModalOpen] = useState(false);
  const [isHsnModalOpen, setIsHsnModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: '',
      genericName: '',
      mfrId: '',
      pack: '',
      mrp: '',
      unit: '',
      hsnId: '',
      taxPercent: 0,
      lowStockLevel: 10,
      packNo: '',
      boxNo: ''
    }
  });

  // Fetch lists for selects
  const { data: manufacturers = [], refetch: refetchMfrs } = useManufacturersList();
  const { data: hsnCodes = [], refetch: refetchHsns } = useHsnCodesList();

  // Create inline mutations
  const createMfrMutation = useCreateManufacturer();
  const createHsnMutation = useCreateHsnCode();

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isMfrModalOpen && !isHsnModalOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isMfrModalOpen, isHsnModalOpen]);

  // Load defaults on item switch
  useEffect(() => {
    if (product) {
      reset({
        productName: product.productName || '',
        genericName: product.genericName || '',
        mfrId: product.mfrId || '',
        pack: product.pack || '',
        mrp: product.mrp || '',
        unit: product.unit || '',
        hsnId: product.hsnId || '',
        taxPercent: product.taxPercent || 0,
        lowStockLevel: product.lowStockLevel || 10,
        packNo: product.packNo || '',
        boxNo: product.boxNo || ''
      });
    } else {
      reset({
        productName: '',
        genericName: '',
        mfrId: '',
        pack: '',
        mrp: '',
        unit: '',
        hsnId: '',
        taxPercent: 0,
        lowStockLevel: 10,
        packNo: '',
        boxNo: ''
      });
    }
  }, [product, reset, isOpen]);

  if (!isOpen) return null;

  // Handle inline manufacturer submission
  const handleAddMfr = async (mfrName) => {
    try {
      const newMfr = await createMfrMutation.mutateAsync(mfrName);
      await refetchMfrs();
      // Auto-select newly created manufacturer
      setValue('mfrId', newMfr.mfrId);
      setIsMfrModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle inline HSN Code submission
  const handleAddHsn = async (hsnData) => {
    try {
      const newHsn = await createHsnMutation.mutateAsync(hsnData);
      await refetchHsns();
      // Auto-select newly created HSN code
      setValue('hsnId', newHsn.hsnId);
      setIsHsnModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex justify-end">
      {/* Backdrop Backdrop Exits */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Drawer Shell */}
      <div className="relative bg-surface w-full max-w-[480px] h-full shadow-lg flex flex-col drawer-slide-in border-l border-border z-10">
        
        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-textMain text-sm">
              {product ? 'Edit Product Master' : 'Register New Product'}
            </h3>
            <p className="text-[10px] text-textSub mt-0.5 uppercase tracking-wider font-semibold">
              {product ? `Product ID: ${product.productId}` : 'Module: Products'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-textSub hover:text-textMain p-1 rounded hover:bg-slate-200/50 transition"
            title="Press Esc to exit"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form Body Container */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Item Identity */}
          <div className="bg-slate-50/50 p-4 rounded border border-border/80">
            <h4 className="form-group-header">
              <Package size={14} /> Item Identity
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Crocin 650mg"
                  className={`w-full px-3 py-1.5 rounded border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary ${
                    errors.productName ? 'border-destructive' : 'border-border'
                  }`}
                  {...register('productName')}
                />
                {errors.productName && <span className="text-xs text-destructive mt-1 block">{errors.productName.message}</span>}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">Generic Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol"
                  className={`w-full px-3 py-1.5 rounded border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary ${
                    errors.genericName ? 'border-destructive' : 'border-border'
                  }`}
                  {...register('genericName')}
                />
                {errors.genericName && <span className="text-xs text-destructive mt-1 block">{errors.genericName.message}</span>}
              </div>
            </div>
          </div>

          {/* Section 2: Details & Location */}
          <div className="bg-slate-50/50 p-4 rounded border border-border/80">
            <h4 className="form-group-header">
              <Layers size={14} /> Details & Location
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider">Manufacturer</label>
                  <button
                    type="button"
                    onClick={() => setIsMfrModalOpen(true)}
                    className="text-[11px] font-bold text-primary hover:text-primary-hover flex items-center gap-0.5"
                  >
                    <Plus size={12} /> Add New
                  </button>
                </div>
                <select
                  className={`w-full px-3 py-1.5 rounded border border-border text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-primary ${
                    errors.mfrId ? 'border-destructive' : 'border-border'
                  }`}
                  {...register('mfrId')}
                >
                  <option value="">Select Manufacturer</option>
                  {manufacturers.map((m) => (
                    <option key={m.mfrId} value={m.mfrId}>{m.mfrName}</option>
                  ))}
                </select>
                {errors.mfrId && <span className="text-xs text-destructive mt-1 block">{errors.mfrId.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">Pack Configuration</label>
                  <input
                    type="text"
                    placeholder="e.g. 10s, 15s"
                    className="w-full px-3 py-1.5 rounded border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                    {...register('pack')}
                  />
                  {errors.pack && <span className="text-xs text-destructive mt-1 block">{errors.pack.message}</span>}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">Unit Form</label>
                  <input
                    type="text"
                    placeholder="e.g. Tablet, Syrup"
                    className="w-full px-3 py-1.5 rounded border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                    {...register('unit')}
                  />
                  {errors.unit && <span className="text-xs text-destructive mt-1 block">{errors.unit.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">Cabinet/Pack No</label>
                  <input
                    type="text"
                    placeholder="e.g. P3"
                    className="w-full px-3 py-1.5 rounded border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                    {...register('packNo')}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">Shelf/Box No</label>
                  <input
                    type="text"
                    placeholder="e.g. B-12"
                    className="w-full px-3 py-1.5 rounded border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                    {...register('boxNo')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Pricing & Tax */}
          <div className="bg-slate-50/50 p-4 rounded border border-border/80">
            <h4 className="form-group-header">
              <Percent size={14} /> Taxation & Pricing
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">MRP (INR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={`w-full px-3 py-1.5 rounded border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary ${
                      errors.mrp ? 'border-destructive' : 'border-border'
                    }`}
                    {...register('mrp')}
                  />
                  {errors.mrp && <span className="text-xs text-destructive mt-1 block">{errors.mrp.message}</span>}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">Tax Percent (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="12.00"
                    className="w-full px-3 py-1.5 rounded border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                    {...register('taxPercent')}
                  />
                  {errors.taxPercent && <span className="text-xs text-destructive mt-1 block">{errors.taxPercent.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider">HSN Code</label>
                    <button
                      type="button"
                      onClick={() => setIsHsnModalOpen(true)}
                      className="text-[11px] font-bold text-primary hover:text-primary-hover flex items-center gap-0.5"
                    >
                      <Plus size={12} /> Add New
                    </button>
                  </div>
                  <select
                    className="w-full px-3 py-1.5 rounded border border-border text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    {...register('hsnId')}
                  >
                    <option value="">Select HSN</option>
                    {hsnCodes.map((h) => (
                      <option key={h.hsnId} value={h.hsnId}>{h.hsnCode} ({h.description || 'No Description'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">Low Stock Warning Limit</label>
                  <input
                    type="number"
                    placeholder="10"
                    className="w-full px-3 py-1.5 rounded border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                    {...register('lowStockLevel')}
                  />
                  {errors.lowStockLevel && <span className="text-xs text-destructive mt-1 block">{errors.lowStockLevel.message}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Read-only Metrics (visible when editing) */}
          {product && (
            <div className="bg-slate-100 p-4 rounded border border-border">
              <h4 className="form-group-header text-slate-500 border-slate-300">
                <Database size={14} /> Inventory Values (Read-Only)
              </h4>
              <p className="text-[11px] text-textSub mb-3">
                Calculated automatically via transactional operations (Purchases / Billing Sales).
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-2 rounded border border-slate-200 text-center">
                  <span className="block text-[10px] text-textSub font-semibold uppercase tracking-wider">Purchase Cost</span>
                  <span className="text-xs font-bold text-textMain font-mono">₹{parseFloat(product.purchaseRate || 0).toFixed(2)}</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200 text-center">
                  <span className="block text-[10px] text-textSub font-semibold uppercase tracking-wider">Selling Price</span>
                  <span className="text-xs font-bold text-textMain font-mono">₹{parseFloat(product.salesPrice || 0).toFixed(2)}</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200 text-center">
                  <span className="block text-[10px] text-textSub font-semibold uppercase tracking-wider">Available Stock</span>
                  <span className="text-xs font-bold text-textMain font-mono">{product.stockQty || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Hidden Submit trigger to support form Enter submit action */}
          <button type="submit" className="hidden" />

        </form>

        {/* Sticky Footer */}
        <div className="px-6 py-4 border-t border-border bg-slate-50/50 flex justify-end gap-3 sticky bottom-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-border rounded text-xs font-bold text-textMain bg-white hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded text-xs font-bold shadow-sm transition disabled:opacity-60 flex items-center gap-1.5 min-h-[36px]"
          >
            {isSubmitting && <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />}
            {isSubmitting ? 'Saving Master...' : 'Save Product (Ctrl+S)'}
          </button>
        </div>

      </div>

      {/* Inline Creation Modals */}
      <MfrModal
        isOpen={isMfrModalOpen}
        onClose={() => setIsMfrModalOpen(false)}
        onSubmit={handleAddMfr}
        isSubmitting={createMfrMutation.isPending}
      />

      <HsnModal
        isOpen={isHsnModalOpen}
        onClose={() => setIsHsnModalOpen(false)}
        onSubmit={handleAddHsn}
        isSubmitting={createHsnMutation.isPending}
      />
    </div>
  );
};

export default ProductDrawer;
