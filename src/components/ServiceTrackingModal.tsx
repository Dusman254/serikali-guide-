import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  FileCheck2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  PlusCircle,
} from 'lucide-react';
import { useSerikali } from '../context/SerikaliContext';
import { ServiceRequestSubmission } from '../types/serviceApplication';

interface ServiceTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReference?: string;
}

export const ServiceTrackingModal: React.FC<ServiceTrackingModalProps> = ({
  isOpen,
  onClose,
  initialReference,
}) => {
  const { serviceRequests, openGetStarted } = useSerikali();
  const [refInput, setRefInput] = useState(initialReference || '');
  const [selectedRef, setSelectedRef] = useState<string>(
    initialReference || serviceRequests[0]?.referenceNumber || ''
  );
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialReference) {
      setSelectedRef(initialReference);
      setRefInput(initialReference);
    }
  }, [initialReference]);

  // Derive activeRequest directly from live real-time serviceRequests
  const activeRequest = useMemo(() => {
    if (!selectedRef) return serviceRequests[0] || null;
    const clean = selectedRef.trim().toLowerCase();
    return (
      serviceRequests.find(
        (r) =>
          r.referenceNumber.toLowerCase() === clean ||
          r.id.toLowerCase() === clean ||
          r.clientPhone.toLowerCase() === clean ||
          r.clientEmail.toLowerCase() === clean
      ) ||
      (hasSearched ? null : serviceRequests[0] || null)
    );
  }, [serviceRequests, selectedRef, hasSearched]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const clean = refInput.trim();
    if (!clean) return;
    setSelectedRef(clean);
  };

  const statusOrder: ServiceRequestSubmission['status'][] = [
    'Received',
    'Payment confirmed',
    'Documents under review',
    'Processing at Agency',
    'Completed',
  ];

  const getStepIndex = (status: ServiceRequestSubmission['status']) => {
    if (status === 'Cancelled') return -1;
    if (status === 'Additional information required') return 2;
    if (status === 'Documents pending') return 1;
    return statusOrder.indexOf(status);
  };

  const currentStepIdx = activeRequest ? getStepIndex(activeRequest.status) : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Track My Immigration Service Request"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#141413]/70 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-[#F4F3EF] border border-[#141413] shadow-2xl p-5 sm:p-8 space-y-6 my-auto text-[#141413]">
        {/* Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#141413]/12">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#D94E34] font-semibold">
                SERIKALI GUIDE · TRACK SERVICE REQUEST
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#1F6F43]/10 text-[#1F6F43] text-[9px] font-mono-num font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F6F43] animate-pulse" />
                LIVE SYNC
              </span>
            </div>
            <h3 className="font-editorial text-2xl sm:text-3xl text-[#141413] mt-0.5">
              Track My Service
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 border border-[#141413]/20 hover:bg-[#141413] hover:text-[#F4F3EF] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Reference Form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6E6D68] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="Enter reference number (e.g. SG-2026-001245) or phone..."
              className="w-full bg-[#EAE9E4] border border-[#141413]/25 pl-9 pr-3 py-2.5 text-xs font-mono-num text-[#141413] focus:outline-none focus:border-[#141413]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider hover:bg-[#2B2B28] cursor-pointer"
          >
            Track
          </button>
        </form>

        {/* Result Area */}
        {activeRequest ? (
          <div className="space-y-6 bg-[#EAE9E4]/60 border border-[#141413]/15 p-5">
            {/* Header row */}
            <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-[#141413]/10">
              <div>
                <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#6E6D68] block">
                  Reference Number
                </span>
                <span className="text-sm font-mono-num font-bold text-[#D94E34]">
                  {activeRequest.referenceNumber}
                </span>
                <h4 className="font-editorial text-xl text-[#141413] mt-0.5 font-semibold">
                  {activeRequest.serviceName}
                </h4>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#6E6D68] block">
                  Current Status
                </span>
                <span className="inline-block mt-0.5 px-2.5 py-1 text-[11px] font-mono-num uppercase tracking-wider font-semibold bg-[#1F6F43] text-[#F4F3EF]">
                  {activeRequest.status}
                </span>
              </div>
            </div>

            {/* Visual Timeline */}
            <div>
              <p className="text-[10px] font-mono-num uppercase tracking-[0.16em] text-[#6E6D68] mb-3 font-semibold">
                Service Progress Timeline
              </p>
              <div className="space-y-3">
                {[
                  { title: 'Request Submitted', desc: `Filed on ${activeRequest.createdAt}` },
                  { title: 'Payment Confirmed', desc: `Assistance fee paid via ${activeRequest.paymentMethod.toUpperCase()}` },
                  { title: 'Documents Under Review', desc: 'Dossier audit & statutory format verification' },
                  { title: 'Processing at Agency / Portal', desc: 'Filing with Directorate of Immigration / BRS' },
                  { title: 'Service Completed', desc: 'Official document endorsed & ready for collection' },
                ].map((step, idx) => {
                  const isDone = currentStepIdx > idx;
                  const isCurrent = currentStepIdx === idx;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <div className="w-5 h-5 rounded-full bg-[#1F6F43] text-[#F4F3EF] flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        ) : isCurrent ? (
                          <div className="w-5 h-5 rounded-full bg-[#D94E34] text-[#F4F3EF] flex items-center justify-center animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-[#141413]/20 bg-[#F4F3EF]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-xs font-mono-num uppercase tracking-wider ${
                            isCurrent
                              ? 'font-bold text-[#141413]'
                              : isDone
                              ? 'text-[#1F6F43] font-medium'
                              : 'text-[#8E8D87]'
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-xs text-[#5E5D59]">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Notes & Next Steps */}
            {(activeRequest.statusNotes || activeRequest.nextStepNote) && (
              <div className="p-3.5 bg-[#F4F3EF] border-l-3 border-[#D94E34] text-xs space-y-1">
                {activeRequest.statusNotes && (
                  <p className="text-[#141413]">
                    <strong>Auditor Update:</strong> {activeRequest.statusNotes}
                  </p>
                )}
                {activeRequest.nextStepNote && (
                  <p className="text-[#5E5D59]">
                    <strong>Next Action:</strong> {activeRequest.nextStepNote}
                  </p>
                )}
              </div>
            )}

            {/* Client & Fee Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono-num pt-2 border-t border-[#141413]/10">
              <div>
                <span className="text-[#6E6D68] block">Client:</span>
                <span className="font-medium text-[#141413]">{activeRequest.clientName}</span>
              </div>
              <div>
                <span className="text-[#6E6D68] block">Fee Paid:</span>
                <span className="font-semibold text-[#141413]">
                  {activeRequest.currency} {activeRequest.totalPaid.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[#6E6D68] block">Govt Fee:</span>
                <span className="text-[#5E5D59]">
                  {activeRequest.governmentFeeIncluded
                    ? 'Included'
                    : 'Paid separately to authority'}
                </span>
              </div>
              <div>
                <span className="text-[#6E6D68] block">Documents:</span>
                <span className="text-[#141413]">
                  {activeRequest.documents?.length || 0} attached
                </span>
              </div>
            </div>
          </div>
        ) : hasSearched ? (
          <div className="text-center py-8 bg-[#EAE9E4]/40 border border-[#141413]/10 space-y-2">
            <AlertCircle className="w-8 h-8 text-[#D94E34] mx-auto" />
            <h4 className="font-editorial text-lg text-[#141413]">Request Not Found</h4>
            <p className="text-xs text-[#5E5D59] max-w-sm mx-auto">
              No service request matching &ldquo;{refInput}&rdquo; was found in our system.
              Please check your reference number format (e.g. SG-2026-001245).
            </p>
          </div>
        ) : null}

        {/* Quick Recent User Requests */}
        {serviceRequests.length > 0 && !hasSearched && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#6E6D68] block">
              Recent Service Requests on This Device:
            </span>
            <div className="space-y-1.5">
              {serviceRequests.slice(0, 3).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setRefInput(r.referenceNumber);
                    setSelectedRef(r.referenceNumber);
                  }}
                  className="w-full text-left p-2.5 bg-[#EAE9E4]/50 hover:bg-[#EAE9E4] border border-[#141413]/10 flex items-center justify-between text-xs font-mono-num cursor-pointer"
                >
                  <div>
                    <span className="font-semibold text-[#D94E34] mr-2">
                      {r.referenceNumber}
                    </span>
                    <span className="text-[#141413]">{r.serviceName}</span>
                  </div>
                  <span className="text-[10px] text-[#1F6F43] bg-[#1F6F43]/10 px-2 py-0.5">
                    {r.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          <a
            href="https://wa.me/254795762978?text=Hello%20Serikali%20Guide!%20I%20am%20inquiring%20about%20my%20service%20request%20status."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#1F6F43] hover:underline font-mono-num"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Need immediate status update? Chat on WhatsApp</span>
          </a>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                openGetStarted();
              }}
              className="px-4 py-2 bg-[#D94E34] hover:bg-[#BF3E26] text-[#F4F3EF] font-mono-num uppercase tracking-wider text-[11px] flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Request Another Service</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#141413]/25 text-[#141413] font-mono-num uppercase tracking-wider text-[11px] hover:bg-[#141413] hover:text-[#F4F3EF] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
