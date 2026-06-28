import React, { useEffect } from 'react';
import { X, User, Phone, MapPin, Clipboard, Calendar, Edit2, ShieldAlert } from 'lucide-react';

// Helper to calculate age dynamically from DOB
const calculateAge = (dobString) => {
  if (!dobString) return '-';
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? `${age} years` : '-';
};

// Helper to format Date string
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper to format Time string
const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const PatientDetailsDrawer = ({ patient, isOpen, onClose, onEdit }) => {
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

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex justify-end">
      {/* Drawer Overlay Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Drawer Shell */}
      <div className="relative bg-surface w-full max-w-[480px] h-full shadow-lg flex flex-col drawer-slide-in border-l border-border z-10">
        
        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-textMain text-sm">Patient Profile Details</h3>
            <span className="text-[10px] text-primary font-mono font-bold uppercase tracking-wider block mt-0.5">
              {patient?.patientCode || 'No Code'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-textSub hover:text-textMain p-1 rounded hover:bg-slate-200/50 transition"
            title="Press Esc to exit"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body Details */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Demographics Overview Card */}
          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded border border-border">
            <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 text-primary flex items-center justify-center">
              <User size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-textMain text-base truncate">{patient?.name}</h4>
              <p className="text-xs text-textSub font-medium mt-0.5">
                {patient?.gender} ({calculateAge(patient?.dateOfBirth)}) • DOB: {formatDate(patient?.dateOfBirth)}
              </p>
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div className="bg-surface p-4 rounded border border-border/80 space-y-3.5">
            <h4 className="font-bold text-textMain uppercase tracking-wider text-[11px] border-b border-border pb-1.5 flex items-center gap-1.5">
              <Phone size={13} className="text-textSub" /> Contact Numbers
            </h4>
            <div className="space-y-2.5 text-[13px]">
              <div>
                <span className="text-[10px] font-semibold text-textSub uppercase tracking-wider block">Primary Phone</span>
                <span className="font-mono text-textMain font-semibold mt-0.5 block">{patient?.phone}</span>
              </div>
              {patient?.alternatePhone && (
                <div>
                  <span className="text-[10px] font-semibold text-textSub uppercase tracking-wider block">Alternate Phone</span>
                  <span className="font-mono text-textMain font-semibold mt-0.5 block">{patient?.alternatePhone}</span>
                </div>
              )}
              {patient?.bloodGroup && (
                <div>
                  <span className="text-[10px] font-semibold text-textSub uppercase tracking-wider block">Blood Group</span>
                  <span className="text-destructive font-bold mt-0.5 block">{patient?.bloodGroup}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Residential Address */}
          <div className="bg-surface p-4 rounded border border-border/80 space-y-3.5">
            <h4 className="font-bold text-textMain uppercase tracking-wider text-[11px] border-b border-border pb-1.5 flex items-center gap-1.5">
              <MapPin size={13} className="text-textSub" /> Residential Address
            </h4>
            <div className="space-y-2.5 text-[13px]">
              <div>
                <span className="text-[10px] font-semibold text-textSub uppercase tracking-wider block">Street Address</span>
                <span className="text-textMain font-medium mt-0.5 block">
                  {patient?.addressLine1 || '-'}
                  {patient?.addressLine2 ? `, ${patient?.addressLine2}` : ''}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-textSub uppercase tracking-wider block">Location details</span>
                <span className="text-textMain font-medium mt-0.5 block">
                  {patient?.city ? `${patient?.city}, ` : ''}
                  {patient?.state ? `${patient?.state} ` : ''}
                  {patient?.pincode ? `(${patient?.pincode})` : ''}
                  {!patient?.city && !patient?.state && !patient?.pincode && '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Emergency Contacts */}
          <div className="bg-surface p-4 rounded border border-border/80 space-y-3.5">
            <h4 className="font-bold text-textMain uppercase tracking-wider text-[11px] border-b border-border pb-1.5 flex items-center gap-1.5">
              <ShieldAlert size={13} className="text-textSub" /> Emergency Contact
            </h4>
            <div className="space-y-2.5 text-[13px]">
              <div>
                <span className="text-[10px] font-semibold text-textSub uppercase tracking-wider block">Contact Name</span>
                <span className="text-textMain font-semibold mt-0.5 block">{patient?.emergencyContactName || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-textSub uppercase tracking-wider block">Contact Phone</span>
                <span className="font-mono text-textMain font-semibold mt-0.5 block">{patient?.emergencyContactPhone || '-'}</span>
              </div>
            </div>
          </div>

          {/* Section 5: Clinical Notes */}
          <div className="bg-surface p-4 rounded border border-border/80 space-y-3.5">
            <h4 className="font-bold text-textMain uppercase tracking-wider text-[11px] border-b border-border pb-1.5 flex items-center gap-1.5">
              <Clipboard size={13} className="text-textSub" /> Remarks & History
            </h4>
            <p className="text-textMain text-[13px] leading-relaxed whitespace-pre-wrap">
              {patient?.remarks || 'No allergies or clinical history summaries recorded.'}
            </p>
          </div>

          {/* Section 6: Audit logs details */}
          <div className="bg-slate-50 p-4 rounded border border-border text-[11px] text-textSub space-y-1.5">
            <div>
              <span><strong>Created By:</strong> {patient?.creator?.username || 'System'}</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">{formatDateTime(patient?.createdAt)}</span>
            </div>
            {patient?.updatedBy && (
              <div className="border-t border-border/50 pt-1.5 mt-1.5">
                <span><strong>Last Editor:</strong> {patient?.editor?.username || '-'}</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">{formatDateTime(patient?.updatedAt)}</span>
              </div>
            )}
          </div>

        </div>

        {/* Sticky Action Footer */}
        <div className="px-6 py-4 border-t border-border bg-slate-50/50 flex justify-end gap-3 sticky bottom-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border rounded text-xs font-bold text-textMain bg-white hover:bg-slate-50 transition"
          >
            Close Details
          </button>
          <button
            type="button"
            onClick={() => onEdit && onEdit(patient)}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <Edit2 size={12} />
            Edit Profile
          </button>
        </div>

      </div>
    </div>
  );
};

export default PatientDetailsDrawer;
