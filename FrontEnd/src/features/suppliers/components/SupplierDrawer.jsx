import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2 } from 'lucide-react';
import { supplierSchema } from '../validation.js';
import { useCreateSupplier, useUpdateSupplier } from '../hooks/useSuppliers.js';

export const SupplierDrawer = ({ isOpen, onClose, supplier = null }) => {
  const isEditMode = !!supplier;
  const createSupplierMutation = useCreateSupplier();
  const updateSupplierMutation = useUpdateSupplier();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      supplierName: '',
      phone: '',
      gstin: '',
      email: '',
      address: '',
      isActive: true
    }
  });

  // Reset form when supplier shifts or opens
  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        reset({
          supplierName: supplier.supplierName || '',
          phone: supplier.phone || '',
          gstin: supplier.gstin || '',
          email: supplier.email || '',
          address: supplier.address || '',
          isActive: supplier.isActive !== false
        });
      } else {
        reset({
          supplierName: '',
          phone: '',
          gstin: '',
          email: '',
          address: '',
          isActive: true
        });
      }
    }
  }, [isOpen, supplier, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await updateSupplierMutation.mutateAsync({
          id: supplier.supplierId,
          supplierData: data
        });
      } else {
        await createSupplierMutation.mutateAsync(data);
      }
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save supplier details');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition" onClick={onClose} />

      {/* Slide-out drawer panel (Right Side) */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white border-l border-border shadow-2xl flex flex-col animate-slide-in select-none">
        
        {/* Drawer Header */}
        <div className="px-4 py-3.5 border-b border-border bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-textMain text-sm">
            {isEditMode ? 'Edit Supplier Profile' : 'Register Supplier'}
          </h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-textSub hover:text-textMain p-1 rounded transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body / Scrollable Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-textMain">
          
          <div>
            <label className="block font-semibold mb-1">Supplier Name *</label>
            <input
              type="text"
              {...register('supplierName')}
              className="w-full px-3 py-1.5 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs"
              placeholder="Apotex Biotech"
            />
            {errors.supplierName && (
              <span className="text-[10px] text-destructive block mt-0.5">{errors.supplierName.message}</span>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-1">Phone Number *</label>
            <input
              type="text"
              {...register('phone')}
              className="w-full px-3 py-1.5 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs"
              placeholder="e.g. +91 99999 88888"
            />
            {errors.phone && (
              <span className="text-[10px] text-destructive block mt-0.5">{errors.phone.message}</span>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-1">GSTIN Registration Number</label>
            <input
              type="text"
              {...register('gstin')}
              className="w-full px-3 py-1.5 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs"
              placeholder="15-character GST code"
            />
            {errors.gstin && (
              <span className="text-[10px] text-destructive block mt-0.5">{errors.gstin.message}</span>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-1">Email Address</label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-3 py-1.5 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs"
              placeholder="e.g. supply@pharmacy.com"
            />
            {errors.email && (
              <span className="text-[10px] text-destructive block mt-0.5">{errors.email.message}</span>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-1">Office/Warehouse Address</label>
            <textarea
              rows="3"
              {...register('address')}
              className="w-full px-3 py-1.5 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs resize-none"
              placeholder="Full warehouse location address..."
            />
            {errors.address && (
              <span className="text-[10px] text-destructive block mt-0.5">{errors.address.message}</span>
            )}
          </div>

          {/* Active status toggle */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/80">
            <input
              id="isActive"
              type="checkbox"
              {...register('isActive')}
              className="h-3.5 w-3.5 text-primary border-border focus:ring-primary rounded"
            />
            <label htmlFor="isActive" className="font-semibold cursor-pointer">
              Active Vendor (Enabled for purchase checkouts)
            </label>
          </div>

        </form>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-border bg-slate-50/50 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border border-border hover:bg-slate-50 rounded transition font-semibold text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={createSupplierMutation.isPending || updateSupplierMutation.isPending}
            className="bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-bold px-5 py-1.5 rounded transition flex items-center gap-1.5 text-xs"
          >
            {(createSupplierMutation.isPending || updateSupplierMutation.isPending) ? (
              <>
                <Loader2 className="animate-spin" size={12} />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>

      </div>
    </>
  );
};

export default SupplierDrawer;
