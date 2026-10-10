import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  HelpCircle,
  Eye,
  Save,
  RotateCcw,
  Sparkles,
  CreditCard,
  Building,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useSerikali } from '../context/SerikaliContext';
import {
  ManagedServiceItem,
  ServiceStatus,
  ServiceQuestionConfig,
  ServiceDocumentRequirement,
} from '../types/serviceApplication';
import { ServiceCategoryId } from '../data/serikaliData';

export const AdminServicesManager: React.FC = () => {
  const { showToast } = useStore();
  const {
    managedServices,
    updateServicePricing,
    addManagedService,
    deleteManagedService,
    serviceCategories,
  } = useSerikali();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ServiceCategoryId | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | 'all'>('all');

  // Currently editing service
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ServiceCategoryId>('government-documents');
  const [formDesc, setFormDesc] = useState('');
  const [formServiceFee, setFormServiceFee] = useState<number>(2500);
  const [formGovtFee, setFormGovtFee] = useState<number>(0);
  const [formGovtFeeIncluded, setFormGovtFeeIncluded] = useState<boolean>(false);
  const [formDiscount, setFormDiscount] = useState<number>(0);
  const [formCurrency, setFormCurrency] = useState<string>('KES');
  const [formStatus, setFormStatus] = useState<ServiceStatus>('ACTIVE');
  const [formProcessingInfo, setFormProcessingInfo] = useState('10 to 15 working days');
  const [formRequirementsText, setFormRequirementsText] = useState('');

  // Questions & Documents
  const [formQuestions, setFormQuestions] = useState<ServiceQuestionConfig[]>([]);
  const [formDocuments, setFormDocuments] = useState<ServiceDocumentRequirement[]>([]);

  // Temp item builders
  const [newQuestionPrompt, setNewQuestionPrompt] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'boolean' | 'text' | 'choice'>('boolean');
  const [newQuestionOptions, setNewQuestionOptions] = useState('');
  const [newQuestionRequired, setNewQuestionRequired] = useState(true);

  const [newDocName, setNewDocName] = useState('');
  const [newDocDesc, setNewDocDesc] = useState('');
  const [newDocMandatory, setNewDocMandatory] = useState(true);

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return managedServices.filter((svc) => {
      if (categoryFilter !== 'all' && svc.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && svc.status !== statusFilter) return false;
      if (!q) return true;
      return (
        svc.name.toLowerCase().includes(q) ||
        svc.description.toLowerCase().includes(q) ||
        svc.categoryName.toLowerCase().includes(q)
      );
    });
  }, [managedServices, searchQuery, categoryFilter, statusFilter]);

  const handleStartEdit = (svc: ManagedServiceItem) => {
    setIsAddingNew(false);
    setEditingServiceId(svc.id);
    setFormName(svc.name);
    setFormCategory(svc.category);
    setFormDesc(svc.description);
    setFormServiceFee(svc.serviceFee);
    setFormGovtFee(svc.governmentFee);
    setFormGovtFeeIncluded(svc.governmentFeeIncluded);
    setFormDiscount(svc.discount || 0);
    setFormCurrency(svc.currency || 'KES');
    setFormStatus(svc.status);
    setFormProcessingInfo(svc.processingInfo || '10 to 15 working days');
    setFormRequirementsText((svc.requirements || []).join('\n'));
    setFormQuestions(svc.questions || []);
    setFormDocuments(svc.documents || []);
  };

  const handleStartCreate = () => {
    setEditingServiceId(null);
    setIsAddingNew(true);
    setFormName('');
    setFormCategory('government-documents');
    setFormDesc('');
    setFormServiceFee(2500);
    setFormGovtFee(1000);
    setFormGovtFeeIncluded(false);
    setFormDiscount(0);
    setFormCurrency('KES');
    setFormStatus('ACTIVE');
    setFormProcessingInfo('10 to 15 working days');
    setFormRequirementsText('Original National ID + copy\nRecent passport photographs');
    setFormQuestions([
      {
        id: `q-${Date.now()}-1`,
        prompt: 'Do you currently hold this document or permit?',
        type: 'boolean',
        required: true,
      },
    ]);
    setFormDocuments([
      {
        id: `doc-${Date.now()}-1`,
        name: 'National Identity Card or Passport',
        description: 'Certified copy of identity document',
        isMandatory: true,
      },
    ]);
  };

  const handleCancelForm = () => {
    setEditingServiceId(null);
    setIsAddingNew(false);
  };

  const handleAddQuestion = () => {
    if (!newQuestionPrompt.trim()) return;
    const options =
      newQuestionType === 'choice'
        ? newQuestionOptions
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    const newQ: ServiceQuestionConfig = {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      prompt: newQuestionPrompt.trim(),
      type: newQuestionType,
      options,
      required: newQuestionRequired,
    };

    setFormQuestions((prev) => [...prev, newQ]);
    setNewQuestionPrompt('');
    setNewQuestionOptions('');
  };

  const handleRemoveQuestion = (id: string) => {
    setFormQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleAddDocument = () => {
    if (!newDocName.trim()) return;
    const newDoc: ServiceDocumentRequirement = {
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: newDocName.trim(),
      description: newDocDesc.trim() || 'Official certified copy',
      isMandatory: newDocMandatory,
    };

    setFormDocuments((prev) => [...prev, newDoc]);
    setNewDocName('');
    setNewDocDesc('');
  };

  const handleRemoveDocument = (id: string) => {
    setFormDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Please enter a service name.');
      return;
    }

    const matchedCat = serviceCategories.find((c) => c.id === formCategory);
    const categoryName = matchedCat?.name || 'Immigration & Government Services';

    const reqs = formRequirementsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: Partial<ManagedServiceItem> = {
      name: formName.trim(),
      category: formCategory,
      categoryName,
      description: formDesc.trim(),
      serviceFee: Number(formServiceFee) || 0,
      governmentFee: Number(formGovtFee) || 0,
      governmentFeeIncluded: Boolean(formGovtFeeIncluded),
      discount: Number(formDiscount) || 0,
      currency: formCurrency.trim() || 'KES',
      status: formStatus,
      processingInfo: formProcessingInfo.trim(),
      requirements: reqs,
      questions: formQuestions,
      documents: formDocuments,
    };

    if (isAddingNew) {
      addManagedService(payload);
      showToast(`Created new service: "${formName.trim()}".`);
      setIsAddingNew(false);
    } else if (editingServiceId) {
      updateServicePricing(editingServiceId, payload);
      showToast(`Updated service "${formName.trim()}" successfully.`);
      setEditingServiceId(null);
    }
  };

  const handleDelete = (svc: ManagedServiceItem) => {
    if (confirm(`Are you sure you want to delete or archive "${svc.name}"?`)) {
      deleteManagedService(svc.id);
      showToast(`Service "${svc.name}" deleted.`);
      if (editingServiceId === svc.id) {
        setEditingServiceId(null);
      }
    }
  };

  const handleQuickStatusToggle = (svc: ManagedServiceItem) => {
    const nextStatus: ServiceStatus =
      svc.status === 'ACTIVE'
        ? 'INACTIVE'
        : svc.status === 'INACTIVE'
        ? 'COMING_SOON'
        : 'ACTIVE';

    updateServicePricing(svc.id, { status: nextStatus });
    showToast(`Status updated to ${nextStatus} for ${svc.name}.`);
  };

  // Live price calculation for the form
  const computedFinalFee = Math.max(
    0,
    Number(formServiceFee) +
      (formGovtFeeIncluded ? Number(formGovtFee) : 0) -
      Number(formDiscount)
  );

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-[#EAE9E4]/60 border border-[#141413]/15 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#D94E34] font-semibold block">
            ADMIN SERVICE MANAGEMENT &amp; PRICING CONTROL
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl text-[#141413] mt-0.5">
            Services &amp; Pricing Directory
          </h2>
          <p className="text-xs text-[#5E5D59] mt-1 max-w-2xl leading-relaxed">
            Configure Serikali Guide assistance fees, separate official government fees,
            availability, customized questionnaires, and document requirements. Changes
            reflect immediately in the &ldquo;Get Started&rdquo; user flow.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="px-5 py-2.5 bg-[#141413] text-[#F4F3EF] hover:bg-[#2B2B28] text-xs font-mono-num uppercase tracking-wider flex items-center gap-2 cursor-pointer shrink-0 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 text-[#D94E34]" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Editor Modal / Panel (When adding or editing) */}
      {(isAddingNew || editingServiceId) && (
        <form
          onSubmit={handleSaveService}
          className="bg-[#F4F3EF] border-2 border-[#141413] p-6 sm:p-8 space-y-6 shadow-xl"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#141413]/15">
            <div>
              <span className="text-[10px] font-mono-num uppercase tracking-widest text-[#D94E34] font-bold">
                {isAddingNew ? 'NEW SERVICE ENTRY' : 'EDIT SERVICE & PRICING'}
              </span>
              <h3 className="font-editorial text-2xl text-[#141413]">
                {isAddingNew ? 'Create New Assisted Service' : `Editing: ${formName}`}
              </h3>
            </div>

            <button
              type="button"
              onClick={handleCancelForm}
              className="text-xs font-mono-num uppercase text-[#6E6D68] hover:text-[#141413] cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-mono-num uppercase text-[#141413] font-semibold block mb-1">
                Service Name *
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Passport Renewal"
                className="w-full px-3 py-2 bg-[#EAE9E4] border border-[#141413]/25 text-xs text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>

            <div>
              <label className="text-xs font-mono-num uppercase text-[#141413] font-semibold block mb-1">
                Category Pillar *
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as ServiceCategoryId)}
                className="w-full px-3 py-2 bg-[#EAE9E4] border border-[#141413]/25 text-xs text-[#141413] focus:outline-none focus:border-[#141413]"
              >
                {serviceCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono-num uppercase text-[#141413] font-semibold block mb-1">
                Availability Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as ServiceStatus)}
                className="w-full px-3 py-2 bg-[#EAE9E4] border border-[#141413]/25 text-xs text-[#141413] focus:outline-none focus:border-[#141413]"
              >
                <option value="ACTIVE">ACTIVE (Available for purchase)</option>
                <option value="INACTIVE">INACTIVE (Currently unavailable)</option>
                <option value="COMING_SOON">COMING SOON</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono-num uppercase text-[#141413] font-semibold block mb-1">
              Short Description *
            </label>
            <textarea
              rows={2}
              required
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Clear summary describing what the client is applying for..."
              className="w-full px-3 py-2 bg-[#EAE9E4] border border-[#141413]/25 text-xs text-[#141413] focus:outline-none focus:border-[#141413]"
            />
          </div>

          {/* Section 2: PRICING CONFIGURATION (Separating Service Fee from Government Fee) */}
          <div className="bg-[#EAE9E4]/70 border border-[#141413]/20 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-num uppercase tracking-wider text-[#141413] font-bold">
                PRICING &amp; OFFICIAL FEE TRANSPARENCY
              </span>
              <span className="text-[11px] font-mono-num text-[#D94E34]">
                Strict Fee Separation Model
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-[11px] font-mono-num uppercase text-[#6E6D68] block mb-1">
                  Currency
                </label>
                <input
                  type="text"
                  value={formCurrency}
                  onChange={(e) => setFormCurrency(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs font-mono-num text-[#141413]"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono-num uppercase text-[#141413] font-semibold block mb-1">
                  Serikali Guide Service Fee *
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={formServiceFee}
                  onChange={(e) => setFormServiceFee(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs font-mono-num text-[#141413] font-bold"
                />
                <span className="text-[10px] text-[#5E5D59] block mt-0.5">
                  Assistance fee payable to Serikali
                </span>
              </div>

              <div>
                <label className="text-[11px] font-mono-num uppercase text-[#6E6D68] block mb-1">
                  Official Government Fee
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formGovtFee}
                  onChange={(e) => setFormGovtFee(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs font-mono-num text-[#141413]"
                />
                <span className="text-[10px] text-[#5E5D59] block mt-0.5">
                  eCitizen / Department tariff
                </span>
              </div>

              <div>
                <label className="text-[11px] font-mono-num uppercase text-[#6E6D68] block mb-1">
                  Special Discount
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formDiscount}
                  onChange={(e) => setFormDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs font-mono-num text-[#141413]"
                />
              </div>
            </div>

            {/* Government Fee Inclusion Switch */}
            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono-num">
                <input
                  type="checkbox"
                  checked={formGovtFeeIncluded}
                  onChange={(e) => setFormGovtFeeIncluded(e.target.checked)}
                  className="w-4 h-4 rounded text-[#141413]"
                />
                <span className="text-[#141413] font-medium">
                  Official Government fee is <strong>INCLUDED</strong> in total payable to Serikali Guide
                </span>
              </label>
            </div>

            {/* Live Computed Pricing Summary */}
            <div className="p-3 bg-[#F4F3EF] border border-[#141413]/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono-num">
              <div>
                <span className="text-[#6E6D68] block">Fee Breakdown:</span>
                <span>
                  Service: {formCurrency} {formServiceFee.toLocaleString()} + Govt:{' '}
                  {formGovtFeeIncluded
                    ? `${formCurrency} ${formGovtFee.toLocaleString()} (Included)`
                    : 'Paid separately to authority'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase text-[#6E6D68] block">
                  Total Payable to Serikali Guide:
                </span>
                <span className="text-base font-bold text-[#1F6F43]">
                  {formCurrency} {computedFinalFee.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Questions Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono-num uppercase text-[#141413] font-semibold">
                Service-Specific Questions ({formQuestions.length})
              </label>
              <span className="text-[11px] font-mono-num text-[#6E6D68]">
                Asked dynamically during Step 3 of the application
              </span>
            </div>

            <div className="space-y-2">
              {formQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between p-2.5 bg-[#EAE9E4] border border-[#141413]/12 text-xs"
                >
                  <div>
                    <span className="font-mono-num text-[11px] text-[#6E6D68] mr-2">
                      0{idx + 1}. [{q.type.toUpperCase()}]
                    </span>
                    <span className="font-medium text-[#141413]">{q.prompt}</span>
                    {q.options && (
                      <span className="text-[11px] text-[#5E5D59] block ml-6">
                        Options: {q.options.join(', ')}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(q.id)}
                    className="text-[#D94E34] hover:opacity-80 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Question Sub-form */}
            <div className="flex flex-wrap items-center gap-2 pt-2 p-3 bg-[#EAE9E4]/40 border border-[#141413]/10">
              <input
                type="text"
                value={newQuestionPrompt}
                onChange={(e) => setNewQuestionPrompt(e.target.value)}
                placeholder="Question prompt (e.g. 'Has your passport expired?')"
                className="flex-1 min-w-[200px] px-3 py-1.5 bg-[#F4F3EF] border border-[#141413]/20 text-xs"
              />
              <select
                value={newQuestionType}
                onChange={(e) => setNewQuestionType(e.target.value as any)}
                className="px-2.5 py-1.5 bg-[#F4F3EF] border border-[#141413]/20 text-xs"
              >
                <option value="boolean">Yes / No</option>
                <option value="text">Text Input</option>
                <option value="choice">Multiple Choice</option>
              </select>

              {newQuestionType === 'choice' && (
                <input
                  type="text"
                  value={newQuestionOptions}
                  onChange={(e) => setNewQuestionOptions(e.target.value)}
                  placeholder="Comma-separated options"
                  className="w-48 px-3 py-1.5 bg-[#F4F3EF] border border-[#141413]/20 text-xs"
                />
              )}

              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3 py-1.5 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider cursor-pointer"
              >
                Add Question
              </button>
            </div>
          </div>

          {/* Section 4: Required Documents Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono-num uppercase text-[#141413] font-semibold">
                Required Documents Checklist ({formDocuments.length})
              </label>
              <span className="text-[11px] font-mono-num text-[#6E6D68]">
                Collected during Step 4 with progress tracking
              </span>
            </div>

            <div className="space-y-2">
              {formDocuments.map((doc, idx) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2.5 bg-[#EAE9E4] border border-[#141413]/12 text-xs"
                >
                  <div>
                    <span className="font-mono-num text-[11px] text-[#6E6D68] mr-2">
                      0{idx + 1}. {doc.isMandatory ? '[MANDATORY]' : '[OPTIONAL]'}
                    </span>
                    <span className="font-medium text-[#141413]">{doc.name}</span>
                    <span className="text-[#5E5D59] text-[11px] block ml-6">
                      {doc.description}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(doc.id)}
                    className="text-[#D94E34] hover:opacity-80 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Document Sub-form */}
            <div className="flex flex-wrap items-center gap-2 pt-2 p-3 bg-[#EAE9E4]/40 border border-[#141413]/10">
              <input
                type="text"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="Document name (e.g. Police Abstract)"
                className="flex-1 min-w-[180px] px-3 py-1.5 bg-[#F4F3EF] border border-[#141413]/20 text-xs"
              />
              <input
                type="text"
                value={newDocDesc}
                onChange={(e) => setNewDocDesc(e.target.value)}
                placeholder="Description / guidance note"
                className="flex-1 min-w-[200px] px-3 py-1.5 bg-[#F4F3EF] border border-[#141413]/20 text-xs"
              />
              <label className="flex items-center gap-1.5 text-xs font-mono-num text-[#141413]">
                <input
                  type="checkbox"
                  checked={newDocMandatory}
                  onChange={(e) => setNewDocMandatory(e.target.checked)}
                />
                <span>Mandatory</span>
              </label>

              <button
                type="button"
                onClick={handleAddDocument}
                className="px-3 py-1.5 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider cursor-pointer"
              >
                Add Document
              </button>
            </div>
          </div>

          {/* Section 5: Statutory Requirements & Turnaround */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono-num uppercase text-[#141413] font-semibold block mb-1">
                Estimated Turnaround Timeline
              </label>
              <input
                type="text"
                value={formProcessingInfo}
                onChange={(e) => setFormProcessingInfo(e.target.value)}
                placeholder="e.g. 10 to 15 working days following biometrics"
                className="w-full px-3 py-2 bg-[#EAE9E4] border border-[#141413]/25 text-xs text-[#141413]"
              />
            </div>

            <div>
              <label className="text-xs font-mono-num uppercase text-[#141413] font-semibold block mb-1">
                Statutory Requirements Checklist (One per line)
              </label>
              <textarea
                rows={3}
                value={formRequirementsText}
                onChange={(e) => setFormRequirementsText(e.target.value)}
                placeholder="One statutory requirement per line..."
                className="w-full px-3 py-2 bg-[#EAE9E4] border border-[#141413]/25 text-xs text-[#141413]"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-[#141413]/15 flex items-center justify-between">
            <button
              type="button"
              onClick={handleCancelForm}
              className="px-4 py-2 border border-[#141413]/25 text-xs font-mono-num uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#141413] hover:bg-[#2B2B28] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4 text-[#D94E34]" />
              <span>{isAddingNew ? 'Create Service' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Services Table & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#6E6D68] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services by title, category, or description..."
              className="w-full pl-9 pr-4 py-2 bg-[#EAE9E4] border border-[#141413]/20 text-xs font-mono-num text-[#141413] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-3 py-2 bg-[#EAE9E4] border border-[#141413]/20 text-xs font-mono-num text-[#141413]"
            >
              <option value="all">All Categories</option>
              {serviceCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-[#EAE9E4] border border-[#141413]/20 text-xs font-mono-num text-[#141413]"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="COMING_SOON">Coming Soon</option>
            </select>
          </div>
        </div>

        {/* Services Grid / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((svc) => (
            <div
              key={svc.id}
              className={`bg-[#F4F3EF] border p-5 flex flex-col justify-between transition-colors ${
                svc.status === 'ACTIVE'
                  ? 'border-[#141413]/20 hover:border-[#141413]'
                  : 'border-[#141413]/10 opacity-70 bg-[#EAE9E4]/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#6E6D68]">
                    {svc.categoryName}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleQuickStatusToggle(svc)}
                    className={`px-2 py-0.5 text-[9px] font-mono-num uppercase font-semibold cursor-pointer border ${
                      svc.status === 'ACTIVE'
                        ? 'bg-[#1F6F43]/10 text-[#1F6F43] border-[#1F6F43]/30'
                        : svc.status === 'COMING_SOON'
                        ? 'bg-[#D94E34]/10 text-[#D94E34] border-[#D94E34]/30'
                        : 'bg-[#141413]/10 text-[#6E6D68] border-[#141413]/20'
                    }`}
                  >
                    {svc.status} (Toggle)
                  </button>
                </div>

                <h4 className="font-editorial text-xl text-[#141413] mb-1.5 font-medium">
                  {svc.name}
                </h4>

                <p className="text-xs text-[#5E5D59] line-clamp-2 mb-4 leading-relaxed">
                  {svc.description}
                </p>

                {/* Pricing Box */}
                <div className="bg-[#EAE9E4] p-3 border border-[#141413]/10 space-y-1 font-mono-num text-xs mb-3">
                  <div className="flex justify-between">
                    <span className="text-[#6E6D68]">Assistance Fee:</span>
                    <strong className="text-[#141413]">
                      {svc.currency} {svc.serviceFee.toLocaleString()}
                    </strong>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#6E6D68]">Official Govt Fee:</span>
                    <span className="text-[#D94E34]">
                      {svc.governmentFee > 0
                        ? `${svc.currency} ${svc.governmentFee.toLocaleString()}`
                        : 'Nil'}
                    </span>
                  </div>

                  <div className="text-[10px] text-[#5E5D59] pt-1 border-t border-[#141413]/8">
                    {svc.governmentFeeIncluded ? (
                      <span className="text-[#1F6F43] font-semibold">
                        ✓ Govt fee included in checkout
                      </span>
                    ) : (
                      <span>Govt fee paid separately to authority</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono-num text-[#6E6D68] mb-3">
                  <span>Questions: {svc.questions?.length || 0}</span>
                  <span>·</span>
                  <span>Documents: {svc.documents?.length || 0}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#141413]/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleStartEdit(svc)}
                  className="inline-flex items-center gap-1.5 text-xs font-mono-num uppercase tracking-wider text-[#141413] hover:text-[#D94E34] cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Pricing</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(svc)}
                  className="text-xs font-mono-num uppercase tracking-wider text-[#D94E34] hover:opacity-80 p-1 cursor-pointer"
                  title="Delete service"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
