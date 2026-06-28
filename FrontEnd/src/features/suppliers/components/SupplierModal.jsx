import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2 } from 'lucide-react';
import { supplierSchema } from '../validation.js';
import { useCreateSupplier } from '../hooks/useSuppliers.js';

export const SupplierModal = ({ isOpen, onClose, onSuccess }) => {
  const createSupplierMutation = useCreateSupplier();

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

  const onSubmit = async (data) => {
    try {
      const result = await createSupplierMutation.mutateAsync(data);
      reset();
      if (onSuccess) onSuccess(result);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register supplier');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white rounded-lg border border-border shadow-xl w-full max-w-md overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-border bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-textMain text-sm">Register New Supplier</h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-textSub hover:text-textMain rounded transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3.5 text-xs text-textMain">
          <div>
            <label className="block font-semibold mb-1">Supplier Name *</label>
            <input
              type="text"
              {...register('supplierName')}
              className="w-full px-3 py-1.5 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs"
              placeholder="e.g. Apotex Biotech Ltd"
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
              placeholder="e.g. +91 98765 43210"
            />
            {errors.phone && (
              <span className="text-[10px] text-destructive block mt-0.5">{errors.phone.message}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">GSTIN (15 characters)</label>
              <input
                type="text"
                {...register('gstin')}
                className="w-full px-3 py-1.5 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                placeholder="29AAAAA0000A1Z1"
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
                placeholder="vendor@company.com"
              />
              {errors.email && (
                <span className="text-[10px] text-destructive block mt-0.5">{errors.email.message}</span>
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Office/Warehouse Address</label>
            <textarea
              rows="2"
              {...register('address')}
              className="w-full px-3 py-1.5 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs resize-none"
              placeholder="Full mailing address..."
            />
            {errors.address && (
              <span className="text-[10px] text-destructive block mt-0.5">{errors.address.message}</span>
            )}
          </div>

          {/* Modal Footer actions */}
          <div className="border-t border-border pt-3 mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-border hover:bg-slate-50 rounded transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createSupplierMutation.isPending}
              className="bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-bold px-4 py-1.5 rounded transition flex items-center gap-1.5"
            >
              {createSupplierMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" size={12} />
                  Saving...
                </>
              ) : (
                'Register Supplier'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default SupplierModal;
