import React from 'react';
import { PhoneCall, CheckSquare, XCircle, Share2, Printer } from 'lucide-react';
import { getDisplayToken } from '../utils/printService.js';

export const QueueTable = ({ tokens = [], onStatusUpdate, onTransferTrigger, onReprint, highlightedRowId }) => {
  if (tokens.length === 0) {
    return (
      <div className="bg-surface p-12 text-center rounded-lg border border-border">
        <p className="text-textSub text-sm font-medium">No patient visits queued in this category today.</p>
      </div>
    );
  }

  // Format issue time
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Helper for status classes
  const getStatusClasses = (status) => {
    switch (status) {
      case 'Waiting':
        return { dot: 'bg-amber-500 animate-pulse', text: 'text-amber-700' };
      case 'Called':
        return { dot: 'bg-primary animate-ping', text: 'text-primary' };
      case 'Completed':
        return { dot: 'bg-success', text: 'text-success' };
      case 'Cancelled':
        return { dot: 'bg-destructive', text: 'text-destructive' };
      default:
        return { dot: 'bg-slate-400', text: 'text-textSub' };
    }
  };

  return (
    <div className="bg-surface rounded border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-dense">
          <thead>
            <tr className="border-b border-border select-none bg-slate-50/80">
              <th className="border-r border-border/55 text-center">Token</th>
              <th className="border-r border-border/55">Patient Code</th>
              <th className="border-r border-border/55">Patient Name</th>
              <th className="border-r border-border/55">Phone</th>
              <th className="border-r border-border/55">Assigned Provider</th>
              <th className="border-r border-border/55 text-center">Visit Type</th>
              <th className="border-r border-border/55 text-center">Issued At</th>
              <th className="border-r border-border/55 text-center">Queue Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {tokens.map((token) => {
              const displayToken = getDisplayToken(token);
              const isHighlighted = token.tokenId === highlightedRowId;
              const statusStyles = getStatusClasses(token.status);
              const docName = token.doctor?.username
                ? `Dr. ${token.doctor.username.charAt(0).toUpperCase() + token.doctor.username.slice(1)}`
                : '-';

              return (
                <tr
                  key={token.tokenId}
                  className={`hover:bg-slate-50/50 transition duration-150 ${
                    isHighlighted ? 'row-flash-success font-semibold' : ''
                  }`}
                >
                  {/* Token Number */}
                  <td className="border-r border-border/40 text-center font-mono font-bold text-primary select-all text-sm">
                    {displayToken}
                  </td>

                  {/* Patient Code */}
                  <td className="border-r border-border/40 font-mono text-xs text-textSub">
                    {token.patient?.patientCode || '-'}
                  </td>

                  {/* Patient Name */}
                  <td className="border-r border-border/40 font-medium text-textMain">
                    {token.patient?.name || '-'}
                  </td>

                  {/* Phone */}
                  <td className="border-r border-border/40 text-textSub font-mono text-xs">
                    {token.patient?.phone || '-'}
                  </td>

                  {/* Doctor */}
                  <td className="border-r border-border/40 text-textMain text-xs font-semibold">
                    {docName}
                  </td>

                  {/* Consultation Type */}
                  <td className="border-r border-border/40 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                      token.consultationType === 'Follow-up'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {token.consultationType}
                    </span>
                  </td>

                  {/* Time Issued */}
                  <td className="border-r border-border/40 text-center font-mono text-xs text-textSub">
                    {formatTime(token.createdAt)}
                  </td>

                  {/* Queue Status */}
                  <td className="border-r border-border/40 text-center">
                    <span className={`status-chip ${statusStyles.text}`}>
                      <span className={`status-dot ${statusStyles.dot}`} />
                      {token.status}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      
                      {/* Call Patient (only for Waiting state) */}
                      {token.status === 'Waiting' && (
                        <button
                          onClick={() => onStatusUpdate && onStatusUpdate(token.tokenId, 'Called')}
                          className="p-1 text-amber-600 hover:text-amber-800 rounded hover:bg-amber-50 transition min-w-[28px] min-h-[28px] flex items-center justify-center border border-amber-200"
                          title="Call Patient to Cabin"
                        >
                          <PhoneCall size={12} />
                        </button>
                      )}

                      {/* Complete Visit (only for Called state) */}
                      {token.status === 'Called' && (
                        <button
                          onClick={() => onStatusUpdate && onStatusUpdate(token.tokenId, 'Completed')}
                          className="p-1 text-emerald-600 hover:text-emerald-800 rounded hover:bg-emerald-50 transition min-w-[28px] min-h-[28px] flex items-center justify-center border border-emerald-200"
                          title="Complete Consultation"
                        >
                          <CheckSquare size={12} />
                        </button>
                      )}

                      {/* Cancel Token (only for Waiting / Called states) */}
                      {(token.status === 'Waiting' || token.status === 'Called') && (
                        <button
                          onClick={() => onStatusUpdate && onStatusUpdate(token.tokenId, 'Cancelled')}
                          className="p-1 text-red-600 hover:text-red-800 rounded hover:bg-red-50 transition min-w-[28px] min-h-[28px] flex items-center justify-center border border-red-200"
                          title="Cancel Patient Token"
                        >
                          <XCircle size={12} />
                        </button>
                      )}

                      {/* Transfer Token (only for Waiting / Called states) */}
                      {(token.status === 'Waiting' || token.status === 'Called') && (
                        <button
                          onClick={() => onTransferTrigger && onTransferTrigger(token)}
                          className="p-1 text-indigo-600 hover:text-indigo-800 rounded hover:bg-indigo-50 transition min-w-[28px] min-h-[28px] flex items-center justify-center border border-indigo-200"
                          title="Transfer to another Doctor"
                        >
                          <Share2 size={12} />
                        </button>
                      )}

                      {/* Reprint Token (Always Available) */}
                      <button
                        onClick={() => onReprint && onReprint(token)}
                        className="p-1 text-slate-600 hover:text-slate-800 rounded hover:bg-slate-50 transition min-w-[28px] min-h-[28px] flex items-center justify-center border border-slate-200"
                        title="Reprint Token Slip"
                      >
                        <Printer size={12} />
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

export default QueueTable;
