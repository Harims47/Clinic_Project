import React from 'react';
import { Eye, Edit2 } from 'lucide-react';

// Utility helper to calculate age dynamically from DOB
const calculateAge = (dobString) => {
  if (!dobString) return '-';
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? `${age} yrs` : '-';
};

export const PatientTable = ({ patients = [], onView, onEdit, highlightedRowId }) => {
  if (patients.length === 0) {
    return (
      <div className="bg-surface p-12 text-center rounded-lg border border-border">
        <p className="text-textSub text-sm font-medium">No patient records found.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-dense">
          <thead>
            <tr className="border-b border-border select-none">
              <th className="border-r border-border/55">Patient Code</th>
              <th className="border-r border-border/55">Full Name</th>
              <th className="border-r border-border/55">Age</th>
              <th className="border-r border-border/55">Gender</th>
              <th className="border-r border-border/55">Phone</th>
              <th className="border-r border-border/55">City</th>
              <th className="border-r border-border/55">Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {patients.map((patient) => {
              const isHighlighted = patient.patientId === highlightedRowId;
              
              return (
                <tr 
                  key={patient.patientId} 
                  className={`hover:bg-slate-50/50 transition duration-150 ${
                    isHighlighted ? 'row-flash-success font-semibold' : ''
                  }`}
                >
                  <td className="border-r border-border/40 font-mono text-xs font-bold text-primary select-all">
                    {patient.patientCode || 'Generating...'}
                  </td>
                  <td className="border-r border-border/40 font-medium text-textMain">
                    {patient.name}
                  </td>
                  <td className="border-r border-border/40 text-textMain">
                    {calculateAge(patient.dateOfBirth)}
                  </td>
                  <td className="border-r border-border/40 text-textSub">
                    {patient.gender}
                  </td>
                  <td className="border-r border-border/40 text-textMain font-mono">
                    {patient.phone}
                  </td>
                  <td className="border-r border-border/40 text-textSub">
                    {patient.city || '-'}
                  </td>
                  <td className="border-r border-border/40">
                    <span className="inline-flex items-center gap-1 text-[13px] text-textMain font-medium">
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        patient.isActive 
                          ? 'bg-success animate-pulse' 
                          : 'bg-destructive'
                      }`} />
                      {patient.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => onView && onView(patient)}
                        className="p-1.5 text-textSub hover:text-primary rounded hover:bg-slate-100/50 transition min-w-[32px] min-h-[32px] flex items-center justify-center"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => onEdit && onEdit(patient)}
                        className="p-1.5 text-textSub hover:text-primary rounded hover:bg-slate-100/50 transition min-w-[32px] min-h-[32px] flex items-center justify-center"
                        title="Edit Profile"
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientTable;
