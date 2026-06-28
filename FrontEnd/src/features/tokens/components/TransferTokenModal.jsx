import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useActiveDoctors } from '../hooks/useQueue.js';

export const TransferTokenModal = ({ isOpen, onClose, onTransfer, token, isSubmitting }) => {
  const selectRef = useRef(null);
  const { data: doctors = [] } = useActiveDoctors();

  // Focus select on load
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        selectRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !token) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const targetDoctorId = formData.get('doctorId');
    if (targetDoctorId) {
      onTransfer(token.tokenId, Number(targetDoctorId));
    }
  };

  const currentDoctorId = token.doctorId;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      {/* Backdrop Exit */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog Content */}
      <div className="relative bg-surface w-full max-w-sm rounded-lg shadow-xl border border-border flex flex-col z-10 overflow-hidden transform scale-100 transition-all duration-150">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-slate-50">
          <span className="font-bold text-textMain text-xs uppercase tracking-wider">
            Transfer Token
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
            <p className="text-xs text-textSub">
              Transfer patient <strong className="text-textMain">{token.patient?.name}</strong> to another doctor's active waiting queue today.
            </p>
            <div>
              <label className="block text-[10px] font-bold text-textSub uppercase tracking-wider mb-1">
                Select Target Doctor *
              </label>
              <select
                ref={selectRef}
                name="doctorId"
                required
                className="w-full px-3 py-1.5 rounded border border-border text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="">Choose Doctor</option>
                {doctors
                  .filter((doc) => doc.userId !== currentDoctorId)
                  .map((doc) => (
                    <option key={doc.userId} value={doc.userId}>
                      Dr. {doc.username.charAt(0).toUpperCase() + doc.username.slice(1)} (Waiting: {doc.waitingCount})
                    </option>
                  ))}
              </select>
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
              {isSubmitting ? 'Transferring...' : 'Confirm Transfer'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default TransferTokenModal;
