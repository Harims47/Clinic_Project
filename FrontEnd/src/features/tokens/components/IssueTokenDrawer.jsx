import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, User, Clipboard, UserCheck, Search, Loader2 } from 'lucide-react';
import queueTokenSchema from '../validation.js';
import { useActiveDoctors, useCheckFollowUp } from '../hooks/useQueue.js';
import { usePatientsList } from '../../patients/hooks/usePatients.js';

export const IssueTokenDrawer = ({ patient: preselectedPatient, isOpen, onClose, onSubmit, isSubmitting }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const searchInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch: watchFields,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(queueTokenSchema),
    defaultValues: {
      patientId: '',
      doctorId: '',
      consultationType: 'New',
      remarks: ''
    }
  });

  const selectedPatientId = watchFields('patientId');
  const selectedDoctorId = watchFields('doctorId');

  // Debounced Patient Search logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setPatientSearch(debouncedSearch);
    }, 250);
    return () => clearTimeout(handler);
  }, [debouncedSearch]);

  // Fetch list of matching patients (if no patient pre-selected)
  const { data: patientData, isLoading: isPatientsLoading } = usePatientsList({
    search: patientSearch,
    page: 1,
    limit: 6
  });

  // Fetch active doctors list
  const { data: doctors = [] } = useActiveDoctors();

  // Check follow-up status dynamically
  const { data: followUpData } = useCheckFollowUp(selectedPatientId, selectedDoctorId);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      if (preselectedPatient) {
        setSelectedPatient(preselectedPatient);
        setValue('patientId', preselectedPatient.patientId);
      } else {
        setSelectedPatient(null);
        setValue('patientId', '');
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }
    }
  }, [isOpen, preselectedPatient, setValue]);

  // Handle follow-up auto-detection adjustments
  useEffect(() => {
    if (followUpData) {
      if (followUpData.isFollowUp) {
        setValue('consultationType', 'Follow-up');
      } else {
        setValue('consultationType', 'New');
      }
    }
  }, [followUpData, setValue]);

  // Global escape trigger
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

  const handleSelectPatient = (pat) => {
    setSelectedPatient(pat);
    setValue('patientId', pat.patientId);
    setDebouncedSearch('');
  };

  const handleClearPatient = () => {
    setSelectedPatient(null);
    setValue('patientId', '');
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex justify-end">
      {/* Backdrop Exit */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Drawer Shell */}
      <div className="relative bg-surface w-full max-w-[480px] h-full shadow-lg flex flex-col drawer-slide-in border-l border-border z-10">
        
        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-textMain text-sm">
              Issue Queue Token
            </h3>
            <p className="text-[10px] text-textSub mt-0.5 uppercase tracking-wider font-semibold">
              Module: Reception Intake Queue
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-textSub hover:text-textMain p-1 rounded hover:bg-slate-200/50 transition"
            title="Press Esc to exit"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form Body Container */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Patient Selection */}
          <div className="bg-slate-50/50 p-4 rounded border border-border/80">
            <h4 className="form-group-header">
              <User size={14} /> 1. Patient Details
            </h4>
            
            {selectedPatient ? (
              <div className="bg-white p-3 rounded border border-border/80 flex justify-between items-center">
                <div>
                  <span className="text-xs font-mono font-bold text-primary block">{selectedPatient.patientCode}</span>
                  <span className="text-[13px] font-bold text-textMain block mt-0.5">{selectedPatient.name}</span>
                  <span className="text-[11px] text-textSub block mt-0.5">
                    {selectedPatient.gender} • {selectedPatient.phone}
                  </span>
                </div>
                {!preselectedPatient && (
                  <button
                    type="button"
                    onClick={handleClearPatient}
                    className="text-[11px] font-bold text-destructive hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 border border-red-200 transition"
                  >
                    Change
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    onChange={(e) => setDebouncedSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 rounded border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Search patient by name or phone..."
                  />
                  <div className="absolute left-3 top-2.5 text-textSub pointer-events-none">
                    <Search size={14} />
                  </div>
                </div>

                {debouncedSearch.length > 0 && (
                  <div className="bg-white border border-border rounded shadow-sm divide-y divide-border/60 overflow-hidden max-h-48 overflow-y-auto">
                    {isPatientsLoading ? (
                      <div className="p-3 text-center text-textSub text-xs flex justify-center items-center gap-1.5">
                        <Loader2 className="animate-spin text-primary" size={14} />
                        Loading patients...
                      </div>
                    ) : (patientData?.patients || []).length === 0 ? (
                      <div className="p-3 text-center text-textSub text-xs">
                        No patients found.
                      </div>
                    ) : (
                      (patientData?.patients || []).map((pat) => (
                        <div
                          key={pat.patientId}
                          onClick={() => handleSelectPatient(pat)}
                          className="px-3 py-2 hover:bg-slate-50 cursor-pointer text-xs flex justify-between items-center"
                        >
                          <div>
                            <span className="font-semibold text-textMain block">{pat.name}</span>
                            <span className="text-[10px] text-textSub block">{pat.phone} • {pat.patientCode}</span>
                          </div>
                          <UserCheck size={14} className="text-primary opacity-40 hover:opacity-100" />
                        </div>
                      ))
                    )}
                  </div>
                )}
                {errors.patientId && <span className="text-xs text-destructive mt-1 block">{errors.patientId.message}</span>}
              </div>
            )}
          </div>

          {/* Section 2: Queue Doctor and type */}
          {selectedPatientId && (
            <div className="bg-slate-50/50 p-4 rounded border border-border/80 space-y-4">
              <h4 className="form-group-header">
                <Clipboard size={14} /> 2. Queue Allocation
              </h4>
              
              <div>
                <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">
                  Select Provider / Doctor *
                </label>
                <select
                  className={`w-full px-3 py-1.5 rounded border border-border text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-primary ${
                    errors.doctorId ? 'border-destructive' : 'border-border'
                  }`}
                  {...register('doctorId')}
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc.userId} value={doc.userId}>
                      Dr. {doc.username.charAt(0).toUpperCase() + doc.username.slice(1)} (Waiting: {doc.waitingCount})
                    </option>
                  ))}
                </select>
                {errors.doctorId && <span className="text-xs text-destructive mt-1 block">{errors.doctorId.message}</span>}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">
                  Consultation Type
                </label>
                <select
                  className="w-full px-3 py-1.5 rounded border border-border text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  {...register('consultationType')}
                >
                  <option value="New">New Consultation</option>
                  <option value="Follow-up">Follow-up Consultation</option>
                  <option value="Routine Review">Routine Review</option>
                  <option value="Specialist Consult">Specialist Consult</option>
                </select>
              </div>

              {/* Follow-up Banner Alert */}
              {followUpData?.isFollowUp && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded text-xs leading-normal">
                  <h5 className="font-bold flex items-center gap-1">
                    ℹ️ Follow-up Detected
                  </h5>
                  <p className="mt-0.5">
                    This patient had a completed consultation with the selected doctor within the last 7 days (Last visit: {new Date(followUpData.lastVisitDate).toLocaleDateString('en-IN')}). Defaulting status type to Follow-up.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">Remarks</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-1.5 rounded border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Notes, symptoms, instructions..."
                  {...register('remarks')}
                />
                {errors.remarks && <span className="text-xs text-destructive mt-1 block">{errors.remarks.message}</span>}
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
            disabled={isSubmitting || !selectedPatientId}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded text-xs font-bold shadow-sm transition disabled:opacity-60 flex items-center gap-1.5 min-h-[36px]"
          >
            {isSubmitting && <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />}
            {isSubmitting ? 'Generating Token...' : 'Print & Issue Token'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default IssueTokenDrawer;
