import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import patientSchema from '../validation.js';

export const PatientForm = ({ defaultValues, onSubmit, onCancel, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: defaultValues || {
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

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      
      {/* Grid Fields Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-textSub uppercase tracking-wider mb-1.5">Full Name *</label>
          <input
            type="text"
            className={`w-full px-3 py-2 rounded border text-sm focus:outline-none focus:ring-1 ${
              errors.name ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'
            }`}
            placeholder="e.g. John Doe"
            {...register('name')}
          />
          {errors.name && <span className="text-xs text-destructive mt-1 block">{errors.name.message}</span>}
        </div>

        {/* DOB */}
        <div>
          <label className="block text-xs font-semibold text-textSub uppercase tracking-wider mb-1.5">Date of Birth *</label>
          <input
            type="date"
            className={`w-full px-3 py-2 rounded border text-sm focus:outline-none focus:ring-1 ${
              errors.dateOfBirth ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'
            }`}
            {...register('dateOfBirth')}
          />
          {errors.dateOfBirth && <span className="text-xs text-destructive mt-1 block">{errors.dateOfBirth.message}</span>}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs font-semibold text-textSub uppercase tracking-wider mb-1.5">Gender *</label>
          <select
            className={`w-full px-3 py-2 rounded border text-sm bg-white focus:outline-none focus:ring-1 ${
              errors.gender ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'
            }`}
            {...register('gender')}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && <span className="text-xs text-destructive mt-1 block">{errors.gender.message}</span>}
        </div>

        {/* Primary Phone */}
        <div>
          <label className="block text-xs font-semibold text-textSub uppercase tracking-wider mb-1.5">Primary Phone *</label>
          <input
            type="text"
            className={`w-full px-3 py-2 rounded border text-sm focus:outline-none focus:ring-1 ${
              errors.phone ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'
            }`}
            placeholder="e.g. 9876543210"
            {...register('phone')}
          />
          {errors.phone && <span className="text-xs text-destructive mt-1 block">{errors.phone.message}</span>}
        </div>

        {/* Alternate Phone */}
        <div>
          <label className="block text-xs font-semibold text-textSub uppercase tracking-wider mb-1.5">Alternate Phone</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. 9876543211"
            {...register('alternatePhone')}
          />
          {errors.alternatePhone && <span className="text-xs text-destructive mt-1 block">{errors.alternatePhone.message}</span>}
        </div>

        {/* Blood Group */}
        <div>
          <label className="block text-xs font-semibold text-textSub uppercase tracking-wider mb-1.5">Blood Group</label>
          <select
            className="w-full px-3 py-2 rounded border border-border text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
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
          {errors.bloodGroup && <span className="text-xs text-destructive mt-1 block">{errors.bloodGroup.message}</span>}
        </div>

        {/* Emergency Contact Name */}
        <div>
          <label className="block text-xs font-semibold text-textSub uppercase tracking-wider mb-1.5">Emergency Contact Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. Mary Doe"
            {...register('emergencyContactName')}
          />
          {errors.emergencyContactName && <span className="text-xs text-destructive mt-1 block">{errors.emergencyContactName.message}</span>}
        </div>

        {/* Emergency Contact Phone */}
        <div>
          <label className="block text-xs font-semibold text-textSub uppercase tracking-wider mb-1.5">Emergency Contact Phone</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. 9876543212"
            {...register('emergencyContactPhone')}
          />
          {errors.emergencyContactPhone && <span className="text-xs text-destructive mt-1 block">{errors.emergencyContactPhone.message}</span>}
        </div>

        {/* Balanced spacing spacer */}
        <div></div>

        {/* Address Line 1 */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-textSub uppercase tracking-wider mb-1.5">Address Line 1</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. 123 Main Street"
            {...register('addressLine1')}
          />
          {errors.addressLine1 && <span className="text-xs text-destructive mt-1 block">{errors.addressLine1.message}</span>}
        </div>

        {/* Address Line 2 */}
        <div>
          <label className="block text-xs font-semibold text-textSub uppercase tracking-wider mb-1.5">Address Line 2</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. Apt 4B"
            {...register('addressLine2')}
          />
          {errors.addressLine2 && <span className="text-xs text-destructive mt-1 block">{errors.addressLine2.message}</span>}
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-semibold text-textSub uppercase tracking-wider mb-1.5">City</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. Bangalore"
            {...register('city')}
          />
          {errors.city && <span className="text-xs text-destructive mt-1 block">{errors.city.message}</span>}
        </div>

        {/* State */}
        <div>
          <label className="block text-xs font-semibold text-textSub uppercase tracking-wider mb-1.5">State</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. Karnataka"
            {...register('state')}
          />
          {errors.state && <span className="text-xs text-destructive mt-1 block">{errors.state.message}</span>}
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-xs font-semibold text-textSub uppercase tracking-wider mb-1.5">Pincode</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. 560001"
            {...register('pincode')}
          />
          {errors.pincode && <span className="text-xs text-destructive mt-1 block">{errors.pincode.message}</span>}
        </div>

        {/* Remarks / Clinical Notes */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-textSub uppercase tracking-wider mb-1.5">Remarks / Medical History Notes</label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 rounded border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="Chronic conditions, allergies, regular prescriptions notes..."
            {...register('remarks')}
          />
          {errors.remarks && <span className="text-xs text-destructive mt-1 block">{errors.remarks.message}</span>}
        </div>

      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-border rounded text-sm font-semibold hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-primary text-white font-semibold rounded text-sm shadow hover:bg-primary-hover disabled:opacity-50 transition"
        >
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

    </form>
  );
};

export default PatientForm;
