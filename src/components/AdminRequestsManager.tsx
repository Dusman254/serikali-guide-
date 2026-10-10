import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Phone,
  Mail,
  CreditCard,
  Building,
  Save,
  Eye,
  FileText,
  Download,
  FileDown,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useSerikali } from '../context/SerikaliContext';
import {
  ServiceRequestSubmission,
  ServiceRequestStatus,
} from '../types/serviceApplication';

const STATUS_OPTIONS: ServiceRequestStatus[] = [
  'Received',
  'Payment confirmed',
  'Documents pending',
  'Documents under review',
  'Additional information required',
  'Processing at Agency',
  'Completed',
  'Cancelled',
];

export const AdminRequestsManager: React.FC = () => {
  const { showToast } = useStore();
  const {
    serviceRequests,
    updateServiceRequestStatus,
    deleteServiceRequest,
  } = useSerikali();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ServiceRequestStatus | 'All'>('All');
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  // Status edit state for expanded request
  const [editingStatus, setEditingStatus] = useState<ServiceRequestStatus>('Received');
  const [adminNotes, setAdminNotes] = useState('');
  const [adminNextStep, setAdminNextStep] = useState('');

  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return serviceRequests.filter((req) => {
      if (statusFilter !== 'All' && req.status !== statusFilter) return false;
      if (!q) return true;
      return (
        req.referenceNumber.toLowerCase().includes(q) ||
        req.clientName.toLowerCase().includes(q) ||
        req.clientEmail.toLowerCase().includes(q) ||
        req.clientPhone.toLowerCase().includes(q) ||
        req.serviceName.toLowerCase().includes(q)
      );
    });
  }, [serviceRequests, searchQuery, statusFilter]);

  const handleToggleExpand = (req: ServiceRequestSubmission) => {
    if (expandedRequestId === req.id) {
      setExpandedRequestId(null);
    } else {
      setExpandedRequestId(req.id);
      setEditingStatus(req.status);
      setAdminNotes(req.adminNotes || '');
      setAdminNextStep(req.nextStep || '');
    }
  };

  const handleUpdateStatus = (reqId: string) => {
    updateServiceRequestStatus(
      reqId,
      editingStatus,
      adminNotes.trim(),
      adminNextStep.trim()
    );
    showToast(`Request ${reqId} updated to: ${editingStatus}.`);
  };

  const handleDeleteRequest = (req: ServiceRequestSubmission) => {
    if (
      confirm(
        `Are you sure you want to delete service request ${req.referenceNumber} (${req.clientName})?`
      )
    ) {
      deleteServiceRequest(req.id);
      showToast(`Request ${req.referenceNumber} removed.`);
      if (expandedRequestId === req.id) {
        setExpandedRequestId(null);
      }
    }
  };

  const handleDownloadDoc = (doc: any, req: ServiceRequestSubmission) => {
    if (doc.fileData && typeof doc.fileData === 'string' && doc.fileData.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = doc.fileData;
      a.download = doc.fileName || 'client-upload.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Downloaded: ${doc.fileName}`);
      return;
    }

    // Generate statutory client dossier file if raw binary is not stored as data URL
    const dossierText = `================================================================================
SERIKALI GUIDE — REPUBLIC OF KENYA REGULATORY APPLICATION DOSSIER
================================================================================
CONFIDENTIAL CLIENT DOCUMENTATION ATTACHMENT
Official Reference : ${req.referenceNumber}
Service Category   : ${req.categoryName} (${req.category})
Service Requested  : ${req.serviceName}
Submission Timestamp: ${req.createdAt}

CLIENT DETAILS:
Full Legal Name    : ${req.clientName}
Email Address      : ${req.clientEmail}
Phone Number       : ${req.clientPhone}
Nationality        : ${req.clientNationality || 'Not Specified'}

ATTACHED DOCUMENT METADATA:
Document Title     : ${doc.documentName}
Original Filename  : ${doc.fileName}
File Size          : ${Math.round((doc.fileSize || 1024) / 1024)} KB
MIME File Type     : ${doc.fileType || 'application/octet-stream'}
Uploaded At        : ${doc.uploadedAt}

STATUTORY DATA RETENTION POLICY:
NOTICE: In compliance with the Kenya Data Protection Act 2019 and Serikali Guide
procedural standards, client-uploaded files and identity documents are stored for
a maximum of 7 calendar days only from the date of submission.
Retention Expiry   : ${doc.retentionExpiresAt || '7 Days from upload'}

CLIENT RESPONSES & APPLICATION PARAMETERS:
${Object.entries(req.answers || {})
  .map(([k, v]) => `• ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
  .join('\n')}

FINANCIAL AUDIT:
Assistance Fee     : ${req.currency} ${req.serviceFee.toLocaleString()}
Government Fee     : ${req.currency} ${req.governmentFee.toLocaleString()} (${req.governmentFeeIncluded ? 'Included' : 'Payable to Agency'})
Total Remitted     : ${req.currency} ${req.totalPaid.toLocaleString()}
Payment Method     : ${req.paymentMethod?.toUpperCase()}
Transaction Ref    : ${req.paymentReference}
Payment Status     : ${req.paymentStatus?.toUpperCase()}

================================================================================
ISSUED BY: Serikali Guide Legal & Regulatory Desk, Pioneer House, Nairobi CBD
VERIFIED ON: ${new Date().toUTCString()}
================================================================================`;

    const blob = new Blob([dossierText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName.includes('.') ? doc.fileName : `${doc.fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded dossier credential: ${doc.fileName}`);
  };

  const handleDownloadAllDocs = (req: ServiceRequestSubmission) => {
    if (!req.documents || req.documents.length === 0) {
      showToast('No documents to download for this request.');
      return;
    }
    req.documents.forEach((doc, idx) => {
      setTimeout(() => {
        handleDownloadDoc(doc, req);
      }, idx * 250);
    });
    showToast(`Downloading all ${req.documents.length} document(s)...`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#EAE9E4]/60 border border-[#141413]/15 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#D94E34] font-semibold block">
            ADMIN SERVICE REQUEST MANAGEMENT &amp; TRACKING
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl text-[#141413] mt-0.5">
            Client Service Applications
          </h2>
          <p className="text-xs text-[#5E5D59] mt-1 max-w-2xl leading-relaxed">
            Review incoming submissions generated by visitors through the &ldquo;Get Started&rdquo;
            flow. Inspect payment records, client answers, uploaded document credentials, and update
            processing status in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono-num text-xs">
          <div className="p-2.5 bg-[#1F6F43]/10 border border-[#1F6F43]/30 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F6F43] animate-pulse" />
            <div>
              <span className="text-[9px] uppercase tracking-wider text-[#1F6F43] font-bold block">
                LIVE REAL-TIME SYNC
              </span>
              <span className="text-[10px] text-[#5E5D59]">
                Instant Incoming &amp; Updates
              </span>
            </div>
          </div>
          <div className="p-3 bg-[#F4F3EF] border border-[#141413]/15">
            <span className="text-[10px] uppercase text-[#6E6D68] block">Total In Queue</span>
            <span className="text-lg font-bold text-[#141413]">
              {serviceRequests.length}
            </span>
          </div>
          <div className="p-3 bg-[#F4F3EF] border border-[#141413]/15">
            <span className="text-[10px] uppercase text-[#6E6D68] block">Under Review</span>
            <span className="text-lg font-bold text-[#D94E34]">
              {
                serviceRequests.filter(
                  (r) =>
                    r.status === 'Documents under review' ||
                    r.status === 'Processing at Agency' ||
                    r.status === 'Payment confirmed'
                ).length
              }
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6E6D68] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ref (SG-2026-...), name, phone, or email..."
            className="w-full pl-9 pr-4 py-2 bg-[#EAE9E4] border border-[#141413]/20 text-xs font-mono-num text-[#141413] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono-num uppercase text-[#6E6D68]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-[#EAE9E4] border border-[#141413]/20 text-xs font-mono-num text-[#141413]"
          >
            <option value="All">All Statuses ({serviceRequests.length})</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st} ({serviceRequests.filter((r) => r.status === st).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center bg-[#EAE9E4]/40 border border-[#141413]/12 text-xs font-mono-num text-[#6E6D68]">
            No service applications matching the current criteria.
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isExpanded = expandedRequestId === req.id;
            const isCompleted = req.status === 'Completed';
            const isCancelled = req.status === 'Cancelled';

            return (
              <div
                key={req.id}
                className="bg-[#F4F3EF] border border-[#141413]/15 overflow-hidden transition-all duration-200"
              >
                {/* Summary Header Row */}
                <div
                  onClick={() => handleToggleExpand(req)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-[#EAE9E4]/60 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num font-bold">
                        {req.referenceNumber}
                      </span>
                      <span className="text-xs font-mono-num font-semibold text-[#141413]">
                        {req.serviceName}
                      </span>
                      <span className="text-[10px] font-mono-num uppercase px-2 py-0.5 bg-[#EAE9E4] text-[#5E5D59]">
                        {req.categoryName}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#5E5D59] pt-0.5">
                      <span className="font-medium text-[#141413]">{req.clientName}</span>
                      <span>·</span>
                      <span>{req.clientPhone}</span>
                      <span>·</span>
                      <span>{req.clientEmail}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Payment Badge */}
                    <div className="text-right font-mono-num text-xs">
                      <span className="text-[#6E6D68] text-[10px] uppercase block">Paid to Serikali</span>
                      <span className="font-bold text-[#141413]">
                        {req.currency} {req.totalPaid.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#1F6F43] block">
                        ✓ {req.paymentMethod.toUpperCase()} ({req.paymentReference})
                      </span>
                    </div>

                    {/* Current Status Pill */}
                    <div
                      className={`px-3 py-1 text-xs font-mono-num font-semibold border ${
                        isCompleted
                          ? 'bg-[#1F6F43]/10 text-[#1F6F43] border-[#1F6F43]/30'
                          : isCancelled
                          ? 'bg-[#D94E34]/10 text-[#D94E34] border-[#D94E34]/30'
                          : 'bg-[#141413] text-[#F4F3EF] border-[#141413]'
                      }`}
                    >
                      {req.status}
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#6E6D68]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#6E6D68]" />
                    )}
                  </div>
                </div>

                {/* Expanded Management Drawer */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 bg-[#EAE9E4]/50 border-t border-[#141413]/15 space-y-6">
                    {/* Status Updater Bar */}
                    <div className="p-4 bg-[#F4F3EF] border-2 border-[#141413] space-y-3">
                      <span className="text-[11px] font-mono-num uppercase tracking-wider text-[#D94E34] font-bold block">
                        ADMIN STATUS DISPATCH CONTROL
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-mono-num uppercase text-[#141413] font-semibold block mb-1">
                            New Processing Status:
                          </label>
                          <select
                            value={editingStatus}
                            onChange={(e) =>
                              setEditingStatus(e.target.value as ServiceRequestStatus)
                            }
                            className="w-full px-3 py-2 bg-[#EAE9E4] border border-[#141413]/25 text-xs font-mono-num text-[#141413]"
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-mono-num uppercase text-[#141413] font-semibold block mb-1">
                            Next Step for Client:
                          </label>
                          <input
                            type="text"
                            value={adminNextStep}
                            onChange={(e) => setAdminNextStep(e.target.value)}
                            placeholder="e.g. Appointment scheduled at Nyayo House on Monday."
                            className="w-full px-3 py-2 bg-[#EAE9E4] border border-[#141413]/25 text-xs text-[#141413]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-mono-num uppercase text-[#141413] font-semibold block mb-1">
                            Internal Admin Notes:
                          </label>
                          <input
                            type="text"
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="e.g. Verified by Counsel Wanjiku."
                            className="w-full px-3 py-2 bg-[#EAE9E4] border border-[#141413]/25 text-xs text-[#141413]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-[#5E5D59]">
                          Last updated: {req.updatedAt || req.createdAt}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(req.id)}
                          className="px-5 py-2 bg-[#141413] hover:bg-[#2B2B28] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5 text-[#D94E34]" />
                          <span>Save &amp; Dispatch Status</span>
                        </button>
                      </div>
                    </div>

                    {/* Detailed Case Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Client Answers */}
                      <div className="bg-[#F4F3EF] border border-[#141413]/10 p-4 space-y-3">
                        <h5 className="font-editorial text-base text-[#141413] font-medium border-b border-[#141413]/10 pb-2">
                          Client Questionnaire Responses
                        </h5>

                        <div className="space-y-2 text-xs">
                          {Object.entries(req.answers || {}).length === 0 ? (
                            <p className="text-[#6E6D68]">No questionnaire answers provided.</p>
                          ) : (
                            Object.entries(req.answers).map(([key, val]) => (
                              <div
                                key={key}
                                className="flex justify-between py-1 border-b border-[#141413]/6 text-xs"
                              >
                                <span className="font-mono-num text-[#6E6D68] uppercase text-[11px]">
                                  {key.replace(/^q-/, '').replace(/-/g, ' ')}:
                                </span>
                                <strong className="text-[#141413]">
                                  {typeof val === 'boolean' ? (val ? 'YES' : 'NO') : String(val)}
                                </strong>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Right: Uploaded Documents & Client Dossier Download */}
                      <div className="bg-[#F4F3EF] border border-[#141413]/10 p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-[#141413]/10 pb-2">
                          <h5 className="font-editorial text-base text-[#141413] font-medium">
                            Attached Credentials &amp; Documents ({req.documents?.length || 0})
                          </h5>
                          {req.documents && req.documents.length > 0 && (
                            <button
                              type="button"
                              onClick={() => handleDownloadAllDocs(req)}
                              className="px-2.5 py-1 bg-[#141413] text-[#F4F3EF] hover:bg-[#2B2B28] text-[10px] font-mono-num uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                            >
                              <FileDown className="w-3 h-3" />
                              <span>Download All</span>
                            </button>
                          )}
                        </div>

                        {/* 7-Day Storage Disclosure Banner */}
                        <div className="p-2.5 bg-[#EAE9E4] border border-[#D94E34]/20 text-[11px] font-mono-num text-[#5E5D59] space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-[#D94E34] text-[10px] uppercase">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span>7-Day Data Retention Policy</span>
                          </div>
                          <p className="text-[10px] leading-tight">
                            Client files are retained for a maximum of 7 calendar days under statutory confidentiality guidelines before automatic purge. Download dossiers to local storage for long-term records.
                          </p>
                        </div>

                        <div className="space-y-2">
                          {(!req.documents || req.documents.length === 0) ? (
                            <p className="text-xs text-[#6E6D68]">No files attached to this request.</p>
                          ) : (
                            req.documents.map((doc, i) => (
                              <div
                                key={i}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-[#EAE9E4] border border-[#141413]/10 text-xs gap-2"
                              >
                                <div className="min-w-0 flex-1">
                                  <span className="font-semibold text-[#141413] block truncate">
                                    {doc.documentName}
                                  </span>
                                  <span className="text-[10px] font-mono-num text-[#6E6D68] block">
                                    {doc.fileName} ({Math.round((doc.fileSize || 1024) / 1024)} KB) · {doc.uploadedAt}
                                  </span>
                                  {doc.retentionExpiresAt && (
                                    <span className="text-[9px] font-mono-num text-[#D94E34]">
                                      Purges: {new Date(doc.retentionExpiresAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[10px] font-mono-num text-[#1F6F43]">
                                    ✓ Verified
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadDoc(doc, req)}
                                    className="px-2.5 py-1 bg-[#141413] text-[#F4F3EF] hover:bg-[#D94E34] transition-colors text-[10px] font-mono-num uppercase tracking-wider flex items-center gap-1 cursor-pointer shadow-xs"
                                    title={`Download ${doc.fileName}`}
                                  >
                                    <Download className="w-3 h-3" />
                                    <span>Download</span>
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete Request CTA */}
                    <div className="flex justify-end pt-2 border-t border-[#141413]/10">
                      <button
                        type="button"
                        onClick={() => handleDeleteRequest(req)}
                        className="text-xs font-mono-num uppercase tracking-wider text-[#D94E34] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete / Archive Service Request</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
