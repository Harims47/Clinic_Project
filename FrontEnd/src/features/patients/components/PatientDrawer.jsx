import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, User, Phone, MapPin, Clipboard } from 'lucide-react';
import patientSchema from '../validation.js';

export const PatientDrawer = ({ patient, isOpen, onClose, onSubmit, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      dateOfBirth: '',
      gender: 'Male',
      phone: '',
      alternatePhone: '',
      bloodGroup: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      remarks: ''
    }
  });

  // Handle escape keyboard key to exit drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Load default edit values when patient data shifts
  useEffect(() => {
    if (patient) {
      reset({
        name: patient.name || '',
        dateOfBirth: patient.dateOfBirth || '',
        gender: patient.gender || 'Male',
        phone: patient.phone || '',
        alternatePhone: patient.alternatePhone || '',
        bloodGroup: patient.bloodGroup || '',
        emergencyContactName: patient.emergencyContactName || '',
        emergencyContactPhone: patient.emergencyContactPhone || '',
        addressLine1: patient.addressLine1 || '',
        addressLine2: patient.addressLine2 || '',
        city: patient.city || '',
        state: patient.state || '',
        pincode: patient.pincode || '',
        remarks: patient.remarks || ''
      });
    } else {
      reset({
        name: '',
        dateOfBirth: '',
        gender: 'Male',
        phone: '',
        alternatePhone: '',
        bloodGroup: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        remarks: ''
      });
    }
  }, [patient, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex justify-end">
      {/* Drawer Overlay Backdrop Exits */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Drawer Shell */}
      <div className="relative bg-surface w-full max-w-[480px] h-full shadow-lg flex flex-col drawer-slide-in border-l border-border z-10">
        
        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-textMain text-sm">
              {patient ? `Edit Patient Profile` : 'Register New Patient'}
            </h3>
            <p className="text-[10px] text-textSub mt-0.5 uppercase tracking-wider font-semibold">
              {patient ? `Code: ${patient.patientCode}` : 'Module: Patients'}
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
          
          {/* Section 1: Personal Information */}
          <div className="bg-slate-50/50 p-4 rounded border border-border/80">
            <h4 className="form-group-header">
              <User size={14} /> Personal Details
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">Full Name *</label>
                <input
                  type="text"
                  className={`w-full px-3 py-1.5 rounded border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary ${
                    errors.name ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder="e.g. Harold Finch"
                  {...register('name')}
                />
                {errors.name && <span className="text-xs text-destructive mt-1 block">{errors.name.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">DOB *</label>
                  <input
                    type="date"
                    className={`w-full px-3 py-1.5 rounded border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary ${
                      errors.dateOfBirth ? 'border-destructive' : 'border-border'
                    }`}
                    {...register('dateOfBirth')}
                  />
                  {errors.dateOfBirth && <span className="text-xs text-destructive mt-1 block">{errors.dateOfBirth.message}</span>}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">Gender *</label>
                  <select
                    className="w-full px-3 py-1.5 rounded border border-border text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    {...register('gender')}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">Blood Group</label>
                <select
                  className="w-full px-3 py-1.5 rounded border border-border text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  {...register('bloodGroup')}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Numbers */}
          <div className="bg-slate-50/50 p-4 rounded border border-border/80">
            <h4 className="form-group-header">
              <Phone size={14} /> Contact Details
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">Primary Phone *</label>
                <input
                  type="text"
                  className={`w-full px-3 py-1.5 rounded border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary ${
                    errors.phone ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder="e.g. 9876543210"
                  {...register('phone')}
                />
                {errors.phone && <span className="text-xs text-destructive mt-1 block">{errors.phone.message}</span>}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">Alternate Phone</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 rounded border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. 9876543211"
                  {...register('alternatePhone')}
                />
              </div>

              <div className="border-t border-border/50 pt-3 mt-3">
                <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-2">Emergency Contact</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 rounded border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Contact Name"
                      {...register('emergencyContactName')}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 rounded border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Contact Phone"
                      {...register('emergencyContactPhone')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Address details */}
          <div className="bg-slate-50/50 p-4 rounded border border-border/80">
            <h4 className="form-group-header">
              <MapPin size={14} /> Residential Address
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">Address Line 1</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 rounded border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Street details"
                  {...register('addressLine1')}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">Address Line 2</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 rounded border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Apt, Suite, Room #"
                  {...register('addressLine2')}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">City</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1.5 rounded border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="City"
                    {...register('city')}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">State</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1.5 rounded border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="State"
                    {...register('state')}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-textSub uppercase tracking-wider mb-1">Pincode</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1.5 rounded border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Pin"
                    {...register('pincode')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Remarks / Clinical Notes */}
          <div className="bg-slate-50/50 p-4 rounded border border-border/80">
            <h4 className="form-group-header">
              <Clipboard size={14} /> Medical History / Remarks
            </h4>
            <textarea
              rows={3}
              className="w-full px-3 py-1.5 rounded border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              placeholder="Chronic constraints, allergies, historical clinical summaries..."
              {...register('remarks')}
            />
          </div>

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
            {isSubmitting ? 'Saving Profile...' : 'Save Patient (Ctrl+S)'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PatientDrawer;
