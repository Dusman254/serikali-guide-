import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  FileCheck2,
  ShieldCheck,
  CreditCard,
  Phone,
  Upload,
  Trash2,
  Eye,
  AlertCircle,
  HelpCircle,
  FileText,
  Building,
  RotateCcw,
  Sparkles,
  PlusCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useSerikali } from '../context/SerikaliContext';
import {
  ManagedServiceItem,
  ServiceQuestionConfig,
  ServiceDocumentRequirement,
  UploadedDocumentItem,
  ServiceRequestSubmission,
} from '../types/serviceApplication';
import { ServiceCategoryId } from '../data/serikaliData';
import { trackEvent } from '../utils/analytics';

export const GetStartedFlow: React.FC = () => {
  const { navigate } = useStore();
  const {
    managedServices,
    submitServiceRequest,
    isGetStartedOpen,
    closeGetStarted,
    getStartedPreselectedServiceId,
    openTrackModal,
  } = useSerikali();

  // Active Step: 1 (Choose Service), 2 (Service Details), 3 (Questions), 4 (Documents), 5 (Review), 6 (Payment), 7 (Complete)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Selected Service
  const [selectedService, setSelectedService] = useState<ManagedServiceItem | null>(() => {
    if (getStartedPreselectedServiceId) {
      return managedServices.find((s) => s.id === getStartedPreselectedServiceId) || null;
    }
    return null;
  });

  // Step 1: Search & Filter state
  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryId | 'all'>('all');

  // Step 3: Client Details & Answers
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNationality, setClientNationality] = useState('Kenyan');
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Step 4: Documents Uploaded
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocumentItem[]>([]);
  const [uploadError, setUploadError] = useState('');

  // Step 6: Payment state
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<
    'pending' | 'verifying' | 'confirmed' | 'failed'
  >('pending');
  const [paymentTxnRef, setPaymentTxnRef] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Step 7: Completed Request Record
  const [createdRequest, setCreatedRequest] = useState<ServiceRequestSubmission | null>(null);

  // Synchronize preselected service when opened with context
  useEffect(() => {
    if (getStartedPreselectedServiceId) {
      const match = managedServices.find((s) => s.id === getStartedPreselectedServiceId);
      if (match) {
        setSelectedService(match);
        setCurrentStep(2); // Jump directly to Service Details
      }
    }
  }, [getStartedPreselectedServiceId, managedServices]);

  // Keep M-Pesa phone in sync with client phone
  useEffect(() => {
    if (!mpesaPhone && clientPhone) {
      setMpesaPhone(clientPhone);
    }
  }, [clientPhone, mpesaPhone]);

  // Track user funnel progress across steps
  useEffect(() => {
    if (isGetStartedOpen) {
      trackEvent('funnel_step_view', {
        step: currentStep,
        serviceId: selectedService?.id,
      });
    }
  }, [currentStep, isGetStartedOpen, selectedService?.id]);

  // Filtered services for Step 1 (Hook must be called before any early return)
  const filteredServices = useMemo(() => {
    const q = serviceSearch.trim().toLowerCase();
    return managedServices.filter((svc) => {
      if (selectedCategory !== 'all' && svc.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      const haystack = `${svc.name} ${svc.description} ${svc.categoryName} ${(svc.requirements || []).join(' ')}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [managedServices, serviceSearch, selectedCategory]);

  if (!isGetStartedOpen) return null;

  // Category filter counts
  const categoriesList: Array<{ id: ServiceCategoryId | 'all'; label: string }> = [
    { id: 'all', label: 'All Services' },
    { id: 'government-documents', label: 'Passports & Documents' },
    { id: 'immigration-visas', label: 'Work Permits & Visas' },
    { id: 'business-registration', label: 'Company & Business' },
    { id: 'ngo-nonprofit', label: 'NGO & Non-Profit' },
    { id: 'tax-compliance', label: 'KRA Tax Compliance' },
  ];

  // Helper to select service and move to Step 2
  const handleSelectService = (svc: ManagedServiceItem) => {
    if (svc.status === 'INACTIVE') return;
    setSelectedService(svc);
    // Initialize default answers
    const initAnswers: Record<string, any> = {};
    svc.questions.forEach((q) => {
      if (q.type === 'boolean') initAnswers[q.id] = true;
      else if (q.type === 'choice' && q.options && q.options[0]) initAnswers[q.id] = q.options[0];
      else initAnswers[q.id] = '';
    });
    setAnswers(initAnswers);
    setCurrentStep(2);
  };

  // Step 3 Validation & Continue
  const handleQuestionsContinue = () => {
    const errors: Record<string, string> = {};
    if (!clientName.trim()) errors.name = 'Full legal name is required.';
    if (!clientEmail.trim() || !clientEmail.includes('@')) errors.email = 'Valid email is required.';
    if (!clientPhone.trim()) errors.phone = 'Contact phone number is required.';

    if (selectedService) {
      selectedService.questions.forEach((q) => {
        if (q.required) {
          const val = answers[q.id];
          if (val === undefined || val === null || val === '') {
            errors[q.id] = 'This question is required.';
          }
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setCurrentStep(4);
  };

  // Step 4 File Upload Handler with real Data URL conversion & 7-day retention
  const handleFileUpload = (docReq: ServiceDocumentRequirement, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError(`File ${file.name} exceeds 10MB limit.`);
      return;
    }
    setUploadError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const retentionExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const newDoc: UploadedDocumentItem = {
        documentId: docReq.id,
        documentName: docReq.name,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fileData: dataUrl,
        retentionExpiresAt: retentionExpires,
      };

      setUploadedDocs((prev) => {
        const filtered = prev.filter((d) => d.documentId !== docReq.id);
        return [...filtered, newDoc];
      });
    };

    reader.onerror = () => {
      setUploadError(`Error reading file ${file.name}. Please try again.`);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = (docId: string) => {
    setUploadedDocs((prev) => prev.filter((d) => d.documentId !== docId));
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError(`File ${file.name} exceeds 10MB limit.`);
      return;
    }
    setUploadError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const retentionExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const customId = `custom-doc-${Date.now()}`;

      const newDoc: UploadedDocumentItem = {
        documentId: customId,
        documentName: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fileData: dataUrl,
        retentionExpiresAt: retentionExpires,
      };

      setUploadedDocs((prev) => [...prev, newDoc]);
    };

    reader.onerror = () => {
      setUploadError(`Error reading file ${file.name}. Please try again.`);
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRequestAnotherService = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setAnswers({});
    setUploadedDocs([]);
    setPaymentStatus('pending');
    setPaymentTxnRef('');
    setCreatedRequest(null);
    setTermsAccepted(false);
    setUploadError('');
  };

  // Step 6 Payment Confirmation simulation
  const handleExecutePayment = () => {
    if (!selectedService) return;
    setPaymentStatus('verifying');

    const totalToPay = Math.max(
      0,
      selectedService.serviceFee +
        (selectedService.governmentFeeIncluded ? selectedService.governmentFee : 0) -
        (selectedService.discount || 0)
    );

    setTimeout(() => {
      const generatedTxnRef =
        paymentMethod === 'mpesa'
          ? `MPESA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
          : `CARD-TXN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      setPaymentTxnRef(generatedTxnRef);
      setPaymentStatus('confirmed');

      // Submit persistent request to SerikaliContext
      const created = submitServiceRequest({
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        category: selectedService.category,
        categoryName: selectedService.categoryName,
        serviceFee: selectedService.serviceFee,
        governmentFee: selectedService.governmentFee,
        governmentFeeIncluded: selectedService.governmentFeeIncluded,
        discount: selectedService.discount || 0,
        totalPaid: totalToPay,
        currency: selectedService.currency,
        clientName,
        clientEmail,
        clientPhone,
        clientNationality,
        answers,
        documents: uploadedDocs,
        paymentMethod,
        paymentReference: generatedTxnRef,
        paymentStatus: 'confirmed',
        paidAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });

      setCreatedRequest(created);
      setCurrentStep(7);
      trackEvent('funnel_completed', {
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        referenceNumber: created.referenceNumber,
        amount: totalToPay,
      });
    }, 1800);
  };

  const stepsList = [
    { num: 1, label: 'CHOOSE SERVICE' },
    { num: 2, label: 'SERVICE DETAILS' },
    { num: 3, label: 'INFORMATION' },
    { num: 4, label: 'DOCUMENTS' },
    { num: 5, label: 'REVIEW' },
    { num: 6, label: 'PAYMENT' },
    { num: 7, label: 'COMPLETE' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Serikali Guide Interactive Service Application"
      className="fixed inset-0 z-50 bg-[#F4F3EF]/98 backdrop-blur-xl overflow-y-auto"
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-5 sm:py-8 min-h-screen flex flex-col justify-between">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#141413]/12">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-[#141413] text-[#F4F3EF] flex items-center justify-center rounded-xs text-[11px] font-mono-num font-bold">
              SG
            </div>
            <div>
              <span className="text-[11px] font-mono-num uppercase tracking-[0.2em] text-[#141413] font-semibold block leading-none">
                SERIKALI GUIDE · SERVICE APPLICATION
              </span>
              <span className="text-[10px] font-mono-num text-[#6E6D68] block mt-0.5">
                Official Regulatory Procedural Desk · Nairobi, Kenya
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentStep > 1 && currentStep < 7 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className="flex items-center gap-1 px-3 py-1.5 border border-[#141413]/15 text-xs font-mono-num uppercase tracking-wider text-[#141413] hover:bg-[#EAE9E4] cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={closeGetStarted}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#141413]/20 text-xs font-mono-num uppercase tracking-[0.16em] text-[#141413] hover:bg-[#141413] hover:text-[#F4F3EF] transition-colors cursor-pointer"
            >
              <span>Close</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Indicator (Steps 1 to 7) */}
        <div className="py-4 border-b border-[#141413]/10">
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2 sm:gap-4 text-xs font-mono-num">
            {stepsList.map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <div
                  key={step.num}
                  className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-[#141413] font-bold'
                      : isPast
                      ? 'text-[#1F6F43]'
                      : 'text-[#8E8D87]'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      isActive
                        ? 'bg-[#141413] text-[#F4F3EF]'
                        : isPast
                        ? 'bg-[#1F6F43] text-[#F4F3EF]'
                        : 'border border-[#141413]/20 text-[#8E8D87]'
                    }`}
                  >
                    {isPast ? '✓' : `0${step.num}`}
                  </span>
                  <span className="hidden md:inline uppercase tracking-wider text-[11px]">
                    {step.label}
                  </span>
                  {step.num < 7 && <span className="text-[#141413]/20 mx-1">/</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* ===================================================================
            STEP 1: CHOOSE A SERVICE
           =================================================================== */}
        {currentStep === 1 && (
          <div className="py-6 sm:py-10 flex-1 space-y-6">
            <div className="max-w-2xl">
              <span className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#D94E34] font-semibold block mb-1">
                STEP 01 OF 07
              </span>
              <h2 className="font-editorial text-3xl sm:text-5xl text-[#141413] tracking-tight">
                WHAT SERVICE DO YOU NEED?
              </h2>
              <p className="text-xs sm:text-sm text-[#5E5D59] mt-2 leading-relaxed">
                Choose the immigration or regulatory service you would like assistance with.
                All pricing is fully transparent before commitment.
              </p>
            </div>

            {/* Service Search & Filter */}
            <div className="space-y-3 pt-2">
              <div className="relative max-w-xl">
                <Search className="w-4 h-4 text-[#6E6D68] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  placeholder="Search services... (e.g. passport, permit, visa, company, tax)"
                  className="w-full bg-[#EAE9E4] border border-[#141413]/25 pl-10 pr-4 py-2.5 text-xs font-mono-num text-[#141413] placeholder:text-[#8E8D87] focus:outline-none focus:border-[#141413]"
                />
              </div>

              {/* Department Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {categoriesList.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 text-xs font-mono-num uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer border ${
                      selectedCategory === cat.id
                        ? 'bg-[#141413] text-[#F4F3EF] border-[#141413]'
                        : 'bg-[#EAE9E4]/60 text-[#5E5D59] border-[#141413]/12 hover:text-[#141413]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredServices.map((svc) => {
                const isInactive = svc.status === 'INACTIVE';
                const isComingSoon = svc.status === 'COMING_SOON';

                return (
                  <div
                    key={svc.id}
                    className={`bg-[#F4F3EF] border p-5 flex flex-col justify-between transition-all duration-200 ${
                      isInactive
                        ? 'border-[#141413]/10 opacity-60 bg-[#EAE9E4]/30'
                        : 'border-[#141413]/15 hover:border-[#141413] shadow-xs hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Category & Status */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#6E6D68]">
                          {svc.categoryName}
                        </span>
                        {isComingSoon && (
                          <span className="text-[9px] font-mono-num uppercase px-1.5 py-0.5 bg-[#D94E34]/10 text-[#D94E34]">
                            Coming Soon
                          </span>
                        )}
                        {isInactive && (
                          <span className="text-[9px] font-mono-num uppercase px-1.5 py-0.5 bg-[#141413]/10 text-[#6E6D68]">
                            Unavailable
                          </span>
                        )}
                      </div>

                      {/* Service Name */}
                      <h3 className="font-editorial text-xl sm:text-2xl text-[#141413] mb-2 font-medium">
                        {svc.name}
                      </h3>

                      {/* Short Description */}
                      <p className="text-xs text-[#5E5D59] line-clamp-3 leading-relaxed mb-4">
                        {svc.description}
                      </p>
                    </div>

                    {/* Pricing Box & CTA */}
                    <div className="pt-4 border-t border-[#141413]/10 space-y-3">
                      <div className="bg-[#EAE9E4]/70 p-3 border border-[#141413]/10 space-y-1.5">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[11px] font-mono-num uppercase text-[#6E6D68]">
                            Service Fee:
                          </span>
                          <span className="text-sm font-mono-num font-bold text-[#141413]">
                            {svc.currency} {svc.serviceFee.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between text-[11px] font-mono-num">
                          <span className="text-[#6E6D68]">Official Govt Fee:</span>
                          <span className="text-[#D94E34] font-medium">
                            {svc.governmentFee > 0
                              ? `${svc.currency} ${svc.governmentFee.toLocaleString()}`
                              : 'Nil / Variable'}
                          </span>
                        </div>

                        <div className="text-[10px] font-mono-num text-[#6E6D68] pt-0.5 border-t border-[#141413]/8">
                          {svc.governmentFeeIncluded ? (
                            <span className="text-[#1F6F43] font-semibold">
                              ✓ Official fee included in payment
                            </span>
                          ) : (
                            <span>
                              Official fee: <strong>Paid separately to authority</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isInactive}
                        onClick={() => handleSelectService(svc)}
                        className={`w-full py-2.5 px-4 text-xs font-mono-num uppercase tracking-wider flex items-center justify-between cursor-pointer transition-colors ${
                          isInactive
                            ? 'bg-[#EAE9E4] text-[#8E8D87] cursor-not-allowed'
                            : 'bg-[#141413] text-[#F4F3EF] hover:bg-[#2B2B28]'
                        }`}
                      >
                        <span>{isInactive ? 'Currently Unavailable' : 'SELECT SERVICE'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Track Link */}
            <div className="pt-6 border-t border-[#141413]/10 text-center">
              <button
                type="button"
                onClick={() => openTrackModal()}
                className="text-xs font-mono-num uppercase tracking-wider text-[#6E6D68] hover:text-[#141413] underline cursor-pointer"
              >
                Already submitted an application? Track your service request here →
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            STEP 2: SERVICE DETAILS & VALUE BREAKDOWN
           =================================================================== */}
        {currentStep === 2 && selectedService && (
          <div className="py-6 sm:py-10 flex-1 space-y-6 max-w-3xl mx-auto w-full">
            <div>
              <span className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#D94E34] font-semibold block mb-1">
                STEP 02 OF 07 · SERVICE DETAILS
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#141413]">
                {selectedService.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#5E5D59] mt-1.5 leading-relaxed">
                {selectedService.description}
              </p>
            </div>

            {/* Pricing Summary Card */}
            <div className="bg-[#EAE9E4] border border-[#141413]/20 p-5 space-y-3">
              <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#6E6D68] font-bold block">
                FEE TRANSPARENCY BREAKDOWN
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 border-t border-b border-[#141413]/10 font-mono-num">
                <div>
                  <span className="text-xs text-[#6E6D68] block">
                    Serikali Guide Assistance Fee:
                  </span>
                  <span className="text-xl font-bold text-[#141413]">
                    {selectedService.currency} {selectedService.serviceFee.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-[#5E5D59] block mt-0.5">
                    Payable now to begin your dossier preparation.
                  </span>
                </div>

                <div>
                  <span className="text-xs text-[#6E6D68] block">Official Government Fee:</span>
                  <span className="text-xl font-bold text-[#D94E34]">
                    {selectedService.governmentFee > 0
                      ? `${selectedService.currency} ${selectedService.governmentFee.toLocaleString()}`
                      : 'Nil'}
                  </span>
                  <span className="text-[11px] text-[#5E5D59] block mt-0.5">
                    {selectedService.governmentFeeIncluded
                      ? '✓ Included in your total payment to Serikali Guide.'
                      : 'Paid separately to the official authority (eCitizen / Department).'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#5E5D59]">
                Estimated turnaround: <strong>{selectedService.processingInfo}</strong>
              </p>
            </div>

            {/* "What we will help you with" */}
            <div className="bg-[#F4F3EF] border border-[#141413]/15 p-5 space-y-3">
              <h3 className="font-editorial text-lg text-[#141413] font-semibold">
                WHAT WE WILL HELP YOU WITH:
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-[#141413]">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6F43] shrink-0 mt-0.5" />
                  <span>
                    <strong>Statutory Requirement Verification:</strong> We audit your eligibility and credentials against relevant Acts of Parliament.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6F43] shrink-0 mt-0.5" />
                  <span>
                    <strong>Document Preparation & Formatting:</strong> Guidance on certified translations, affidavits, and police abstracts.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6F43] shrink-0 mt-0.5" />
                  <span>
                    <strong>Application Filing Support:</strong> Pre-populating verified forms for eCitizen, eFNS, BRS, or KRA iTax.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6F43] shrink-0 mt-0.5" />
                  <span>
                    <strong>Appointment & Biometrics Guidance:</strong> Securing prompt dates at Nyayo House or regional registry desks.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6F43] shrink-0 mt-0.5" />
                  <span>
                    <strong>End-to-End Tracking:</strong> Active updates until your document is printed, endorsed, and ready for collection.
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 border border-[#141413]/25 text-xs font-mono-num uppercase tracking-wider text-[#141413] hover:bg-[#EAE9E4] cursor-pointer"
              >
                ← Back to Services
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider hover:bg-[#2B2B28] flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>CONTINUE TO INFORMATION</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            STEP 3: CLIENT INFORMATION & SERVICE-SPECIFIC QUESTIONS
           =================================================================== */}
        {currentStep === 3 && selectedService && (
          <div className="py-6 sm:py-10 flex-1 space-y-6 max-w-2xl mx-auto w-full">
            <div>
              <span className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#D94E34] font-semibold block mb-1">
                STEP 03 OF 07 · INFORMATION & CASE DETAILS
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#141413]">
                Client Information
              </h2>
              <p className="text-xs sm:text-sm text-[#5E5D59] mt-1.5 leading-relaxed">
                Provide your primary contact details so our regulatory team can reach you.
              </p>
            </div>

            {/* Primary Contact Inputs */}
            <div className="bg-[#F4F3EF] border border-[#141413]/15 p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono-num uppercase tracking-wider text-[#141413] font-semibold block">
                  Full Legal Name (as per Passport / ID) *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. David Kiprono Ochieng"
                  className="w-full bg-[#EAE9E4] border border-[#141413]/20 px-3 py-2 text-xs font-mono-num text-[#141413] focus:outline-none focus:border-[#141413]"
                />
                {formErrors.name && (
                  <p className="text-[11px] text-[#D94E34]">{formErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono-num uppercase tracking-wider text-[#141413] font-semibold block">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#EAE9E4] border border-[#141413]/20 px-3 py-2 text-xs font-mono-num text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                  {formErrors.email && (
                    <p className="text-[11px] text-[#D94E34]">{formErrors.email}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono-num uppercase tracking-wider text-[#141413] font-semibold block">
                    Phone Number (WhatsApp / M-Pesa) *
                  </label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+254 712 345 678"
                    className="w-full bg-[#EAE9E4] border border-[#141413]/20 px-3 py-2 text-xs font-mono-num text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                  {formErrors.phone && (
                    <p className="text-[11px] text-[#D94E34]">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono-num uppercase tracking-wider text-[#141413] font-semibold block">
                  Current Nationality
                </label>
                <input
                  type="text"
                  value={clientNationality}
                  onChange={(e) => setClientNationality(e.target.value)}
                  placeholder="e.g. Kenyan, British, American"
                  className="w-full bg-[#EAE9E4] border border-[#141413]/20 px-3 py-2 text-xs font-mono-num text-[#141413] focus:outline-none focus:border-[#141413]"
                />
              </div>
            </div>

            {/* Dynamic Service-Specific Questions */}
            {selectedService.questions.length > 0 && (
              <div className="space-y-4 pt-2">
                <h3 className="font-editorial text-xl text-[#141413] font-semibold">
                  Specific Case Details ({selectedService.name}):
                </h3>

                <div className="space-y-4">
                  {selectedService.questions.map((q) => (
                    <div
                      key={q.id}
                      className="bg-[#F4F3EF] border border-[#141413]/15 p-4 space-y-2"
                    >
                      <label className="text-xs font-mono-num text-[#141413] font-medium block">
                        {q.prompt} {q.required && '*'}
                      </label>

                      {q.helpText && (
                        <p className="text-[11px] text-[#6E6D68] italic">{q.helpText}</p>
                      )}

                      {/* Boolean Type */}
                      {q.type === 'boolean' && (
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => setAnswers({ ...answers, [q.id]: true })}
                            className={`px-4 py-1.5 text-xs font-mono-num uppercase tracking-wider cursor-pointer border ${
                              answers[q.id] === true
                                ? 'bg-[#141413] text-[#F4F3EF] border-[#141413]'
                                : 'bg-[#EAE9E4] text-[#141413] border-[#141413]/20'
                            }`}
                          >
                            YES
                          </button>
                          <button
                            type="button"
                            onClick={() => setAnswers({ ...answers, [q.id]: false })}
                            className={`px-4 py-1.5 text-xs font-mono-num uppercase tracking-wider cursor-pointer border ${
                              answers[q.id] === false
                                ? 'bg-[#141413] text-[#F4F3EF] border-[#141413]'
                                : 'bg-[#EAE9E4] text-[#141413] border-[#141413]/20'
                            }`}
                          >
                            NO
                          </button>
                        </div>
                      )}

                      {/* Choice Type */}
                      {q.type === 'choice' && q.options && (
                        <div className="space-y-1.5 pt-1">
                          {q.options.map((opt) => (
                            <label
                              key={opt}
                              className={`flex items-center gap-2 p-2 border text-xs font-mono-num cursor-pointer ${
                                answers[q.id] === opt
                                  ? 'bg-[#141413] text-[#F4F3EF] border-[#141413]'
                                  : 'bg-[#EAE9E4]/60 text-[#141413] border-[#141413]/15'
                              }`}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                checked={answers[q.id] === opt}
                                onChange={() => setAnswers({ ...answers, [q.id]: opt })}
                                className="accent-[#D94E34]"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Text Type */}
                      {q.type === 'text' && (
                        <input
                          type="text"
                          value={answers[q.id] || ''}
                          onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                          placeholder={q.placeholder || 'Your response...'}
                          className="w-full bg-[#EAE9E4] border border-[#141413]/20 px-3 py-2 text-xs font-mono-num text-[#141413] focus:outline-none focus:border-[#141413]"
                        />
                      )}

                      {formErrors[q.id] && (
                        <p className="text-[11px] text-[#D94E34]">{formErrors[q.id]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2.5 border border-[#141413]/25 text-xs font-mono-num uppercase tracking-wider text-[#141413] hover:bg-[#EAE9E4] cursor-pointer"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={handleQuestionsContinue}
                className="px-6 py-3 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider hover:bg-[#2B2B28] flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>CONTINUE TO DOCUMENTS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            STEP 4: REQUIRED DOCUMENTS
           =================================================================== */}
        {currentStep === 4 && selectedService && (
          <div className="py-6 sm:py-10 flex-1 space-y-6 max-w-2xl mx-auto w-full">
            <div>
              <span className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#D94E34] font-semibold block mb-1">
                STEP 04 OF 07 · REQUIRED DOCUMENTS
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#141413]">
                Attach Your Documents
              </h2>
              <p className="text-xs sm:text-sm text-[#5E5D59] mt-1.5 leading-relaxed">
                Upload clear scans or photos of your supporting documents. You can also attach
                any pending documents later after payment.
              </p>
            </div>

            {/* Progress bar */}
            <div className="bg-[#EAE9E4] p-3 border border-[#141413]/15 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono-num">
                <span className="font-semibold text-[#141413]">
                  DOCUMENTS ATTACHED: {uploadedDocs.length} / {selectedService.documents.length}
                </span>
                <span className="text-[#1F6F43] font-bold">
                  {selectedService.documents.length > 0
                    ? Math.round(
                        (uploadedDocs.length / selectedService.documents.length) * 100
                      )
                    : 100}
                  %
                </span>
              </div>
              <div className="w-full h-2 bg-[#141413]/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1F6F43] transition-all duration-300"
                  style={{
                    width: `${
                      selectedService.documents.length > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (uploadedDocs.length / selectedService.documents.length) * 100
                            )
                          )
                        : 100
                    }%`,
                  }}
                />
              </div>
            </div>

            {uploadError && (
              <div className="p-3 bg-[#D94E34]/10 border border-[#D94E34] text-xs text-[#D94E34]">
                {uploadError}
              </div>
            )}

            {/* Documents List */}
            <div className="space-y-3">
              {selectedService.documents.map((docReq) => {
                const uploaded = uploadedDocs.find((d) => d.documentId === docReq.id);

                return (
                  <div
                    key={docReq.id}
                    className="p-4 bg-[#F4F3EF] border border-[#141413]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 max-w-md">
                      <div className="flex items-center gap-2">
                        {uploaded ? (
                          <CheckCircle2 className="w-4 h-4 text-[#1F6F43] shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-[#141413]/30 shrink-0" />
                        )}
                        <h4 className="text-xs font-mono-num font-bold text-[#141413] uppercase tracking-wide">
                          {docReq.name}
                        </h4>
                        {docReq.isMandatory && (
                          <span className="text-[9px] font-mono-num bg-[#D94E34]/10 text-[#D94E34] px-1.5 py-0.5">
                            Mandatory
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#5E5D59] pl-6 leading-tight">
                        {docReq.description}
                      </p>

                      {uploaded && (
                        <div className="pl-6 text-[11px] font-mono-num text-[#1F6F43] flex items-center gap-2">
                          <span>✓ {uploaded.fileName}</span>
                          <span className="text-[#8E8D87]">
                            ({(uploaded.fileSize / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center pl-6 sm:pl-0">
                      {uploaded ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(docReq.id)}
                          className="px-3 py-1.5 text-xs font-mono-num uppercase tracking-wider text-[#D94E34] hover:bg-[#D94E34]/10 border border-[#D94E34]/30 cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      ) : (
                        <label className="px-3 py-1.5 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider hover:bg-[#2B2B28] cursor-pointer flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => handleFileUpload(docReq, e)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Custom / Additional Product Dossiers and Files Uploaded */}
              {uploadedDocs
                .filter(
                  (d) =>
                    !selectedService.documents.some((req) => req.id === d.documentId)
                )
                .map((customDoc) => (
                  <div
                    key={customDoc.documentId}
                    className="p-4 bg-[#F4F3EF] border border-[#141413]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 max-w-md">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#1F6F43] shrink-0" />
                        <h4 className="text-xs font-mono-num font-bold text-[#141413] uppercase tracking-wide">
                          {customDoc.documentName}
                        </h4>
                        <span className="text-[9px] font-mono-num bg-[#1F6F43]/10 text-[#1F6F43] px-1.5 py-0.5">
                          Attached Dossier
                        </span>
                      </div>
                      <div className="pl-6 text-[11px] font-mono-num text-[#5E5D59] flex items-center gap-2">
                        <span>{customDoc.fileName}</span>
                        <span className="text-[#8E8D87]">
                          ({(customDoc.fileSize / 1024).toFixed(1)} KB)
                        </span>
                        <span className="text-[#D94E34] text-[10px]">
                          · 7-day retention active
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center pl-6 sm:pl-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(customDoc.documentId)}
                        className="px-3 py-1.5 text-xs font-mono-num uppercase tracking-wider text-[#D94E34] hover:bg-[#D94E34]/10 border border-[#D94E34]/30 cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}

              {/* Upload Product Dossier or Additional Supporting File Button Card */}
              <div className="p-4 bg-[#EAE9E4]/60 border border-dashed border-[#141413]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-[#D94E34]" />
                    <h4 className="text-xs font-mono-num font-bold text-[#141413] uppercase tracking-wide">
                      Upload Product Dossier or Supporting File
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#5E5D59] pl-6 leading-tight">
                    Attach product specifications, product photos, corporate certificates, or any extra documentation.
                  </p>
                </div>

                <label className="px-4 py-2 bg-[#D94E34] hover:bg-[#BF3E26] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider cursor-pointer flex items-center gap-1.5 self-start sm:self-center shrink-0 shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Attach Product / File</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.zip"
                    onChange={handleCustomFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Note on security and 7-day data retention guarantee */}
            <div className="p-3.5 bg-[#EAE9E4] border border-[#141413]/15 text-xs font-mono-num text-[#141413] space-y-1.5">
              <div className="flex items-center gap-2 text-[#D94E34] font-bold uppercase tracking-wider text-[11px]">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Statutory 7-Day Data Retention Guarantee</span>
              </div>
              <p className="text-[11px] text-[#5E5D59] leading-relaxed">
                Notice: All product documentation and identification credentials uploaded to Serikali Guide are encrypted and retained for a maximum of <strong>7 calendar days only</strong> from date of upload. After 7 days, your files are permanently purged from our servers in compliance with data privacy regulations. Please retain local copies of all uploaded files.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2.5 border border-[#141413]/25 text-xs font-mono-num uppercase tracking-wider text-[#141413] hover:bg-[#EAE9E4] cursor-pointer"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-6 py-3 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider hover:bg-[#2B2B28] flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>CONTINUE TO REVIEW</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            STEP 5: REVIEW YOUR REQUEST
           =================================================================== */}
        {currentStep === 5 && selectedService && (
          <div className="py-6 sm:py-10 flex-1 space-y-6 max-w-2xl mx-auto w-full">
            <div>
              <span className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#D94E34] font-semibold block mb-1">
                STEP 05 OF 07 · COMPLETE REVIEW
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#141413]">
                Review Your Request
              </h2>
              <p className="text-xs sm:text-sm text-[#5E5D59] mt-1.5 leading-relaxed">
                Verify all information before proceeding to payment. You can edit any section.
              </p>
            </div>

            {/* Section 1: Service & Fee Review */}
            <div className="bg-[#F4F3EF] border border-[#141413]/15 p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#141413]/10">
                <span className="text-[11px] font-mono-num uppercase tracking-wider text-[#6E6D68] font-bold">
                  01. SERVICE SELECTED
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-mono-num uppercase tracking-wider text-[#D94E34] hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div>
                <h4 className="font-editorial text-xl text-[#141413] font-semibold">
                  {selectedService.name}
                </h4>
                <p className="text-xs text-[#5E5D59]">{selectedService.categoryName}</p>
              </div>

              <div className="pt-2 border-t border-[#141413]/10 font-mono-num text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Serikali Guide Service Fee:</span>
                  <strong>
                    {selectedService.currency} {selectedService.serviceFee.toLocaleString()}
                  </strong>
                </div>
                <div className="flex justify-between text-[#5E5D59]">
                  <span>Official Government Fee:</span>
                  <span>
                    {selectedService.governmentFee > 0
                      ? `${selectedService.currency} ${selectedService.governmentFee.toLocaleString()}`
                      : 'Nil'}
                  </span>
                </div>
                <div className="text-[10px] text-[#6E6D68]">
                  {selectedService.governmentFeeIncluded
                    ? '✓ Government fee included in payment.'
                    : 'Note: Government fee is paid separately to the official authority.'}
                </div>
              </div>
            </div>

            {/* Section 2: Personal Information */}
            <div className="bg-[#F4F3EF] border border-[#141413]/15 p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#141413]/10">
                <span className="text-[11px] font-mono-num uppercase tracking-wider text-[#6E6D68] font-bold">
                  02. CLIENT DETAILS
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs font-mono-num uppercase tracking-wider text-[#D94E34] hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono-num">
                <div>
                  <span className="text-[#6E6D68] block">Full Name:</span>
                  <span className="font-medium text-[#141413]">{clientName}</span>
                </div>
                <div>
                  <span className="text-[#6E6D68] block">Email:</span>
                  <span className="font-medium text-[#141413]">{clientEmail}</span>
                </div>
                <div>
                  <span className="text-[#6E6D68] block">Phone:</span>
                  <span className="font-medium text-[#141413]">{clientPhone}</span>
                </div>
                <div>
                  <span className="text-[#6E6D68] block">Nationality:</span>
                  <span className="font-medium text-[#141413]">{clientNationality}</span>
                </div>
              </div>
            </div>

            {/* Section 3: Answers & Documents */}
            <div className="bg-[#F4F3EF] border border-[#141413]/15 p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#141413]/10">
                <span className="text-[11px] font-mono-num uppercase tracking-wider text-[#6E6D68] font-bold">
                  03. ANSWERS & DOCUMENTS
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="text-xs font-mono-num uppercase tracking-wider text-[#D94E34] hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              {Object.keys(answers).length > 0 && (
                <div className="space-y-1.5 text-xs font-mono-num">
                  {selectedService.questions.map((q) => (
                    <div key={q.id} className="flex justify-between gap-4 py-1 border-b border-[#141413]/5">
                      <span className="text-[#6E6D68] truncate max-w-[280px]">{q.prompt}</span>
                      <span className="font-medium text-[#141413]">
                        {answers[q.id] === true
                          ? 'YES'
                          : answers[q.id] === false
                          ? 'NO'
                          : String(answers[q.id] || 'N/A')}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 text-xs font-mono-num">
                <span className="text-[#6E6D68] block mb-1">Attached Documents:</span>
                {uploadedDocs.length > 0 ? (
                  <ul className="space-y-1 text-[#1F6F43]">
                    {uploadedDocs.map((d) => (
                      <li key={d.documentId} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {d.documentName} ({d.fileName})
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-[#8E8D87] italic">
                    None attached yet (can be submitted after payment).
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2.5 border border-[#141413]/25 text-xs font-mono-num uppercase tracking-wider text-[#141413] hover:bg-[#EAE9E4] cursor-pointer"
              >
                ← Back to Documents
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(6)}
                className="px-6 py-3 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider hover:bg-[#2B2B28] flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>PROCEED TO PAYMENT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            STEP 6: SERVICE FEE PAYMENT & CHECKOUT
           =================================================================== */}
        {currentStep === 6 && selectedService && (
          <div className="py-6 sm:py-10 flex-1 space-y-6 max-w-2xl mx-auto w-full">
            <div>
              <span className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#D94E34] font-semibold block mb-1">
                STEP 06 OF 07 · PAYMENT
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#141413]">
                Order Summary & Payment
              </h2>
              <p className="text-xs sm:text-sm text-[#5E5D59] mt-1.5 leading-relaxed">
                Review the exact assistance fee breakdown and complete your payment securely.
              </p>
            </div>

            {/* Prominent Price Breakdown Card (Addresses Requirement 15) */}
            <div className="bg-[#EAE9E4] border-2 border-[#141413] p-5 sm:p-6 space-y-4">
              <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#6E6D68] font-bold block">
                ORDER SUMMARY
              </span>

              <div className="space-y-2 text-xs font-mono-num">
                <div className="flex justify-between items-center text-sm font-semibold text-[#141413]">
                  <span>{selectedService.name}</span>
                  <span>
                    {selectedService.currency} {selectedService.serviceFee.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-[#6E6D68] pt-1">
                  <span>Official Government Fee:</span>
                  <span className="text-[#D94E34]">
                    {selectedService.governmentFee > 0
                      ? `${selectedService.currency} ${selectedService.governmentFee.toLocaleString()}`
                      : 'Nil'}
                  </span>
                </div>

                <p className="text-[11px] text-[#6E6D68] italic pb-2">
                  {selectedService.governmentFeeIncluded
                    ? '✓ Official government fee is included in your total payment to Serikali Guide.'
                    : 'Government / official fees are NOT included in this payment and must be paid separately to the relevant authority.'}
                </p>

                {selectedService.discount ? (
                  <div className="flex justify-between items-center text-xs text-[#1F6F43] pt-1 border-t border-[#141413]/10">
                    <span>Discount:</span>
                    <span>- KES {selectedService.discount.toLocaleString()}</span>
                  </div>
                ) : null}

                {/* Total Payable to Serikali Guide */}
                <div className="pt-3 border-t-2 border-[#141413] flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-mono-num uppercase font-bold text-[#141413] block">
                      TOTAL PAYABLE TO SERIKALI GUIDE:
                    </span>
                    <span className="text-[10px] text-[#6E6D68]">
                      Includes comprehensive document review & dossier preparation
                    </span>
                  </div>
                  <span className="text-2xl font-bold font-mono-num text-[#141413]">
                    {selectedService.currency}{' '}
                    {(
                      selectedService.serviceFee +
                      (selectedService.governmentFeeIncluded ? selectedService.governmentFee : 0) -
                      (selectedService.discount || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Gateway Options */}
            <div className="bg-[#F4F3EF] border border-[#141413]/15 p-5 space-y-4">
              <span className="text-[11px] font-mono-num uppercase tracking-wider text-[#6E6D68] font-bold block">
                SELECT PAYMENT METHOD
              </span>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`p-3 border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                    paymentMethod === 'mpesa'
                      ? 'bg-[#141413] text-[#F4F3EF] border-[#141413]'
                      : 'bg-[#EAE9E4]/60 text-[#141413] border-[#141413]/20'
                  }`}
                >
                  <Phone className="w-4 h-4 text-[#1F6F43]" />
                  <div>
                    <span className="text-xs font-mono-num font-bold block">M-Pesa Express</span>
                    <span className="text-[10px] opacity-75">Instant STK prompt</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-[#141413] text-[#F4F3EF] border-[#141413]'
                      : 'bg-[#EAE9E4]/60 text-[#141413] border-[#141413]/20'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#D94E34]" />
                  <div>
                    <span className="text-xs font-mono-num font-bold block">Card Payment</span>
                    <span className="text-[10px] opacity-75">Visa / Mastercard</span>
                  </div>
                </button>
              </div>

              {/* M-Pesa Input */}
              {paymentMethod === 'mpesa' && (
                <div className="space-y-2 pt-2 border-t border-[#141413]/10">
                  <label className="text-xs font-mono-num text-[#141413] font-medium block">
                    M-Pesa Mobile Number:
                  </label>
                  <input
                    type="tel"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    placeholder="e.g. 0712345678"
                    className="w-full bg-[#EAE9E4] border border-[#141413]/20 px-3 py-2 text-xs font-mono-num text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                  <p className="text-[11px] text-[#6E6D68]">
                    An instant M-Pesa STK push prompt will be sent to this phone to enter your PIN.
                  </p>
                </div>
              )}

              {/* Card Inputs */}
              {paymentMethod === 'card' && (
                <div className="space-y-3 pt-2 border-t border-[#141413]/10 text-xs font-mono-num">
                  <div className="space-y-1">
                    <label className="text-[#141413]">Card Number</label>
                    <input
                      type="text"
                      placeholder="4123 ···· ···· 8901"
                      className="w-full bg-[#EAE9E4] border border-[#141413]/20 px-3 py-2 text-xs font-mono-num focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[#141413]">MM / YY</label>
                      <input
                        type="text"
                        placeholder="12/28"
                        className="w-full bg-[#EAE9E4] border border-[#141413]/20 px-3 py-2 text-xs font-mono-num focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[#141413]">CVV</label>
                      <input
                        type="password"
                        placeholder="···"
                        maxLength={4}
                        className="w-full bg-[#EAE9E4] border border-[#141413]/20 px-3 py-2 text-xs font-mono-num focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Terms checkbox */}
              <label className="flex items-start gap-2 pt-2 text-[11px] text-[#5E5D59] cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 accent-[#141413]"
                />
                <span>
                  I accept the{' '}
                  <button
                    type="button"
                    onClick={() => {
                      closeGetStarted();
                      navigate({ page: 'terms' });
                    }}
                    className="text-[#141413] underline font-semibold cursor-pointer"
                  >
                    Terms of Service
                  </button>{' '}
                  and acknowledge that official statutory authority fees are subject to government gazettement.
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-4 py-2.5 border border-[#141413]/25 text-xs font-mono-num uppercase tracking-wider text-[#141413] hover:bg-[#EAE9E4] cursor-pointer"
              >
                ← Back to Review
              </button>

              <button
                type="button"
                disabled={!termsAccepted || paymentStatus === 'verifying'}
                onClick={handleExecutePayment}
                className="px-8 py-3.5 bg-[#D94E34] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider hover:bg-[#BF3E26] flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {paymentStatus === 'verifying' ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#F4F3EF] border-t-transparent rounded-full animate-spin" />
                    <span>VERIFYING PAYMENT...</span>
                  </>
                ) : (
                  <>
                    <span>
                      PAY KES{' '}
                      {(
                        selectedService.serviceFee +
                        (selectedService.governmentFeeIncluded ? selectedService.governmentFee : 0) -
                        (selectedService.discount || 0)
                      ).toLocaleString()}{' '}
                      &amp; SUBMIT
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            STEP 7: SERVICE REQUEST CONFIRMATION (Addresses Requirement 18)
           =================================================================== */}
        {currentStep === 7 && createdRequest && (
          <div className="py-8 sm:py-12 flex-1 space-y-6 max-w-2xl mx-auto w-full text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-[#1F6F43] text-[#F4F3EF] flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono-num uppercase tracking-widest text-[#1F6F43] font-bold">
                PAYMENT CONFIRMED · REQUEST CREATED
              </span>
              <h2 className="font-editorial text-3xl sm:text-5xl text-[#141413]">
                Service Request Received
              </h2>
              <p className="text-xs sm:text-sm text-[#5E5D59] max-w-md mx-auto">
                Your application dossier has been successfully submitted to our specialized legal desk.
              </p>
            </div>

            {/* Reference Card */}
            <div className="bg-[#EAE9E4] border border-[#141413]/25 p-5 sm:p-6 text-left space-y-3 font-mono-num text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#141413]/10">
                <span className="text-[#6E6D68]">Official Reference:</span>
                <span className="text-base font-bold text-[#D94E34]">
                  {createdRequest.referenceNumber}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#6E6D68]">Service:</span>
                <span className="font-semibold text-[#141413]">{createdRequest.serviceName}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#6E6D68]">Amount Paid:</span>
                <span className="font-bold text-[#141413]">
                  {createdRequest.currency} {createdRequest.totalPaid.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#6E6D68]">Transaction Ref:</span>
                <span className="text-[#141413]">{createdRequest.paymentReference}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#141413]/10">
                <span className="text-[#6E6D68]">Initial Status:</span>
                <span className="px-2 py-0.5 bg-[#1F6F43] text-[#F4F3EF] text-[10px] uppercase font-bold">
                  {createdRequest.status}
                </span>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-[#F4F3EF] border border-[#141413]/15 p-5 text-left space-y-2 text-xs">
              <span className="font-mono-num uppercase tracking-wider text-[#141413] font-bold block">
                WHAT HAPPENS NEXT:
              </span>
              <p className="text-[#5E5D59] leading-relaxed">
                1. Our regulatory advocates will audit your answers and documents against official Directorate standards within 24 business hours.
              </p>
              <p className="text-[#5E5D59] leading-relaxed">
                2. You will receive an SMS and WhatsApp alert confirming your finalized submission receipt and booking schedule.
              </p>
              <p className="text-[#5E5D59] leading-relaxed">
                3. You can track live progress anytime using your reference number: <strong>{createdRequest.referenceNumber}</strong>.
              </p>
            </div>

            {/* 7-Day Data Storage Guarantee */}
            <div className="bg-[#EAE9E4] border border-[#141413]/15 p-4 text-left space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#D94E34] text-[11px] font-mono-num uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                <span>Statutory 7-Day Data Retention Policy</span>
              </div>
              <p className="text-[#5E5D59] text-[11px] leading-relaxed">
                Notice: All client documentation, product dossiers, and identity credentials uploaded for this application are securely kept for a maximum of <strong>7 calendar days only</strong>, after which they are permanently and automatically purged from our systems for your data confidentiality.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleRequestAnotherService}
                className="px-6 py-3 bg-[#D94E34] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider hover:bg-[#BF3E26] flex items-center gap-2 cursor-pointer shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>REQUEST ANOTHER SERVICE</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  closeGetStarted();
                  openTrackModal(createdRequest.referenceNumber);
                }}
                className="px-6 py-3 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider hover:bg-[#2B2B28] flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>TRACK MY SERVICE</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={closeGetStarted}
                className="px-5 py-3 border border-[#141413]/25 text-[#141413] text-xs font-mono-num uppercase tracking-wider hover:bg-[#EAE9E4] cursor-pointer"
              >
                Return to Home
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-4 border-t border-[#141413]/10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-num text-[#6E6D68]">
          <span>Serikali Guide · Republic of Kenya Procedural Advisory</span>
          <span>Nairobi, Kenya · Assistance: 0795762978</span>
        </div>
      </div>
    </div>
  );
};
