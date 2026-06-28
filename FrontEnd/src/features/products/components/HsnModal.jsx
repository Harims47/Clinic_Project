import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export const HsnModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle escape keyboard key to exit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const hsnCode = formData.get('hsnCode');
    const description = formData.get('description');
    if (hsnCode && hsnCode.trim()) {
      onSubmit({
        hsnCode: hsnCode.trim(),
        description: description?.trim() || ''
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      {/* Backdrop Exit */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog Content */}
      <div className="relative bg-surface w-full max-w-sm rounded-lg shadow-xl border border-border flex flex-col z-10 overflow-hidden transform scale-100 transition-all duration-150">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-slate-50">
          <span className="font-bold text-textMain text-xs uppercase tracking-wider">
            Add HSN Code
          </span>
          <button 
            type="button"
            onClick={onClose}
            className="text-textSub hover:text-textMain p-1 rounded hover:bg-slate-200/50 transition"
          >
            <X size={14} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold text-textSub uppercase tracking-wider mb-1">
                HSN Code *
              </label>
              <input
                ref={inputRef}
                name="hsnCode"
                type="text"
                required
                placeholder="e.g. 3004"
                className="w-full px-3 py-1.5 rounded border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-textSub uppercase tracking-wider mb-1">
                Description / Notes
              </label>
              <input
                name="description"
                type="text"
                placeholder="e.g. Medicines containing penicillin"
                className="w-full px-3 py-1.5 rounded border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-4 py-3 bg-slate-50 border-t border-border flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 border border-border rounded text-[11px] font-bold text-textMain bg-white hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded text-[11px] font-bold shadow-sm transition disabled:opacity-60 flex items-center gap-1"
            >
              {isSubmitting && <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />}
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default HsnModal;
