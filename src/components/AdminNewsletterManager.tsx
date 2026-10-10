import React, { useState, useMemo } from 'react';
import {
  Mail,
  Send,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  UserCheck,
  Clock,
  Trash2,
  Plus,
  X,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useSerikali } from '../context/SerikaliContext';
import { NewsletterSubscriber } from '../types/serviceApplication';

const BULLETIN_TEMPLATES = [
  {
    title: 'Gazette Notice: Expatriate Work Permit Class D Rulings',
    subject: 'SERIKALI GUIDE BRIEFING: Kenya Directorate of Immigration Gazette Update',
    body: `Dear Esteemed Client & Regulatory Partner,

Please be notified that the Kenya Directorate of Immigration Services has gazetted revised compliance guidelines regarding Expatriate Class D Work Permits and Special Passes.

Key Procedural Points:
1. Proof of succession planning and understudy training programs are now mandatory for renewal applications.
2. Verified statutory police clearance certificates (Interpol/CID) must be submitted within 30 days of portal upload.
3. Tax Compliance Certificates (TCC) for both sponsoring company and applicant are strictly verified in real-time with KRA.

For detailed assistance with your dossier filings, reply directly to this briefing or schedule an advisory session at our Pioneer House desk.

Sincerely,
Senior Immigration Advisory Desk
Serikali Guide Kenya — Pioneer House, Nairobi CBD`,
  },
  {
    title: 'KRA Tax Compliance Advisory: Annual Returns & TCC',
    subject: 'STATUTORY TAX ALERT: KRA Corporate Returns & Compliance Checklist',
    body: `Dear Corporate Compliance Officer,

As the statutory filing window approaches, the Serikali Guide Tax Advisory desk reminds foreign businesses and resident entities to ensure full compliance with the Kenya Revenue Authority (KRA).

Compliance Highlights:
• Verify that all directors' PIN numbers are updated on the iTax portal.
• File Nil or audited returns before statutory cutoff to avoid statutory penalties.
• Ensure valid Tax Compliance Certificates (TCC) are maintained for government tendering and immigration renewals.

Our statutory accountants are available to audit your tax health. Contact our desk at Pioneer House.

Kind regards,
Corporate Tax & Regulatory Desk
Serikali Guide Nairobi`,
  },
  {
    title: 'BRS Beneficial Ownership Directive & Corporate Filings',
    subject: 'BRS REGULATORY NOTICE: Beneficial Ownership Register Compliance',
    body: `Dear Company Secretary & Business Owner,

The Business Registration Service (BRS) has issued operational reminders for all private limited companies operating in Kenya to maintain current Beneficial Ownership (BO) registers.

Requirements:
- Submit Form BO-F for all individual shareholders holding more than 10% shares or voting rights.
- Ensure CR12 certificates match updated registry entries.

We can assist with legal audits and official BRS portal filings.

Best regards,
Commercial Registration Specialists
Serikali Guide Kenya`,
  },
];

export const AdminNewsletterManager: React.FC = () => {
  const { showToast } = useStore();
  const {
    newsletterSubscribers,
    addNewsletterSubscriber,
    removeNewsletterSubscriber,
    updateNewsletterSubscriber,
    sendNewsletterBroadcast,
  } = useSerikali();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [hasCopied, setHasCopied] = useState(false);

  // Composer form state
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Manual subscriber add state
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newSource, setNewSource] = useState('Admin Desk Entry');

  const filteredSubscribers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return newsletterSubscribers.filter((sub) => {
      if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
      if (!q) return true;
      return (
        sub.email.toLowerCase().includes(q) ||
        (sub.name && sub.name.toLowerCase().includes(q)) ||
        (sub.source && sub.source.toLowerCase().includes(q))
      );
    });
  }, [newsletterSubscribers, searchQuery, statusFilter]);

  const activeCount = useMemo(
    () => newsletterSubscribers.filter((s) => s.status === 'active').length,
    [newsletterSubscribers]
  );

  const totalBroadcastsSent = useMemo(
    () =>
      newsletterSubscribers.reduce(
        (acc, s) => acc + (s.campaignHistory?.length || (s.lastSentAt ? 1 : 0)),
        0
      ),
    [newsletterSubscribers]
  );

  const handleApplyTemplate = (tpl: typeof BULLETIN_TEMPLATES[0]) => {
    setSubject(tpl.subject);
    setMessageBody(tpl.body);
    showToast(`Loaded template: ${tpl.title}`);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      showToast('Please provide a bulletin subject line.');
      return;
    }
    if (!messageBody.trim()) {
      showToast('Please provide bulletin message content.');
      return;
    }

    setIsSending(true);

    setTimeout(() => {
      const recipientIds = selectedRecipientIds.length > 0 ? selectedRecipientIds : undefined;
      const result = sendNewsletterBroadcast(
        subject.trim(),
        messageBody.trim(),
        recipientIds
      );

      setIsSending(false);
      setIsComposerOpen(false);
      setSubject('');
      setMessageBody('');
      setSelectedRecipientIds([]);

      showToast(
        `✓ Bulletin successfully dispatched to ${result.sentCount} active subscribers!`
      );
    }, 900);
  };

  const handleCopyEmails = () => {
    const activeEmails = newsletterSubscribers
      .filter((s) => s.status === 'active')
      .map((s) => s.email)
      .join(', ');

    if (!activeEmails) {
      showToast('No active email addresses to copy.');
      return;
    }

    navigator.clipboard.writeText(activeEmails).then(() => {
      setHasCopied(true);
      showToast(`Copied ${activeCount} active email addresses to clipboard.`);
      setTimeout(() => setHasCopied(false), 2000);
    });
  };

  const handleExportCsv = () => {
    if (newsletterSubscribers.length === 0) {
      showToast('No subscriber data to export.');
      return;
    }

    const headers = ['ID', 'Email', 'Name', 'Subscribed At', 'Source', 'Status', 'Last Sent At'];
    const rows = newsletterSubscribers.map((s) => [
      s.id,
      s.email,
      s.name || '',
      s.subscribedAt,
      s.source || 'Website Footer',
      s.status,
      s.lastSentAt || 'Never',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `serikali-subscribers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Subscribers CSV exported successfully.');
  };

  const handleAddSubscriberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) {
      showToast('Please enter a valid subscriber email.');
      return;
    }

    const res = addNewsletterSubscriber(newEmail.trim(), newSource.trim(), newName.trim());
    showToast(res.message);
    if (res.success) {
      setIsAddModalOpen(false);
      setNewEmail('');
      setNewName('');
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedRecipientIds.length === filteredSubscribers.length) {
      setSelectedRecipientIds([]);
    } else {
      setSelectedRecipientIds(filteredSubscribers.map((s) => s.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#EAE9E4]/60 border border-[#141413]/15 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#D94E34] font-semibold block">
            STATUTORY INTELLIGENCE &amp; AUDIENCE DESK
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl text-[#141413] mt-0.5">
            Newsletter Subscribers &amp; Broadcasts
          </h2>
          <p className="text-xs text-[#5E5D59] mt-1 max-w-2xl leading-relaxed">
            Manage verified client emails subscribed to Kenya regulatory updates, work permit gazette
            briefings, and corporate compliance alerts. Compose and dispatch direct statutory bulletins
            to your audience in real-time.
          </p>
        </div>

        {/* Counter Cards */}
        <div className="flex flex-wrap items-center gap-3 font-mono-num text-xs">
          <div className="p-3 bg-[#F4F3EF] border border-[#141413]/15">
            <span className="text-[10px] uppercase text-[#6E6D68] block">Total Subscribers</span>
            <span className="text-lg font-bold text-[#141413]">
              {newsletterSubscribers.length}
            </span>
          </div>

          <div className="p-3 bg-[#F4F3EF] border border-[#141413]/15">
            <span className="text-[10px] uppercase text-[#6E6D68] block">Active Audience</span>
            <span className="text-lg font-bold text-[#1F6F43]">
              {activeCount}
            </span>
          </div>

          <div className="p-3 bg-[#F4F3EF] border border-[#141413]/15">
            <span className="text-[10px] uppercase text-[#6E6D68] block">Bulletins Sent</span>
            <span className="text-lg font-bold text-[#D94E34]">
              {totalBroadcastsSent}
            </span>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsComposerOpen(true)}
            className="px-4 py-2.5 bg-[#D94E34] hover:bg-[#BF3E26] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compose &amp; Send Bulletin</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-2.5 bg-[#141413] hover:bg-[#2B2B28] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subscriber</span>
          </button>

          <button
            type="button"
            onClick={handleCopyEmails}
            className="px-3 py-2.5 border border-[#141413]/25 hover:bg-[#EAE9E4] text-[#141413] text-xs font-mono-num uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            {hasCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#1F6F43]" />
                <span className="text-[#1F6F43]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Active Emails</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-2.5 border border-[#141413]/25 hover:bg-[#EAE9E4] text-[#141413] text-xs font-mono-num uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 text-xs font-mono-num">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#6E6D68] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email or name..."
              className="bg-[#F4F3EF] border border-[#141413]/25 pl-8 pr-3 py-1.5 text-xs text-[#141413] focus:outline-none focus:border-[#141413] w-52"
            />
          </div>

          <div className="flex border border-[#141413]/25 overflow-hidden">
            {(['all', 'active', 'unsubscribed'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 uppercase text-[10px] cursor-pointer transition-colors ${
                  statusFilter === st
                    ? 'bg-[#141413] text-[#F4F3EF]'
                    : 'bg-[#F4F3EF] text-[#6E6D68] hover:text-[#141413]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Action Bar */}
      {selectedRecipientIds.length > 0 && (
        <div className="p-3 bg-[#D94E34]/10 border border-[#D94E34]/30 flex items-center justify-between text-xs font-mono-num">
          <span className="text-[#D94E34] font-semibold">
            {selectedRecipientIds.length} subscriber(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsComposerOpen(true);
              }}
              className="px-3 py-1 bg-[#D94E34] text-[#F4F3EF] hover:bg-[#BF3E26] uppercase text-[10px] tracking-wider cursor-pointer flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>Send Broadcast to Selected</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRecipientIds([])}
              className="px-2 py-1 border border-[#141413]/20 text-[#6E6D68] hover:text-[#141413] uppercase text-[10px] cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Subscribers Table */}
      <div className="bg-[#F4F3EF] border border-[#141413]/15 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono-num text-xs">
            <thead>
              <tr className="bg-[#EAE9E4] border-b border-[#141413]/15 text-[#141413] text-[11px] uppercase tracking-wider">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredSubscribers.length > 0 &&
                      selectedRecipientIds.length === filteredSubscribers.length
                    }
                    onChange={handleToggleSelectAll}
                    className="cursor-pointer"
                  />
                </th>
                <th className="p-3 font-semibold">Subscriber Email &amp; Contact</th>
                <th className="p-3 font-semibold">Date Subscribed</th>
                <th className="p-3 font-semibold">Acquisition Source</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Last Broadcast Sent</th>
                <th className="p-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141413]/10">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#6E6D68]">
                    No newsletter subscribers match your query.
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((subscriber) => {
                  const isSelected = selectedRecipientIds.includes(subscriber.id);
                  return (
                    <tr
                      key={subscriber.id}
                      className={`hover:bg-[#EAE9E4]/60 transition-colors ${
                        isSelected ? 'bg-[#EAE9E4]' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(subscriber.id)}
                          className="cursor-pointer"
                        />
                      </td>

                      <td className="p-3">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-[#141413] block">
                            {subscriber.email}
                          </span>
                          {subscriber.name && (
                            <span className="text-[10px] text-[#6E6D68] block">
                              {subscriber.name}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-[#5E5D59]">
                        {subscriber.subscribedAt}
                      </td>

                      <td className="p-3 text-[#141413]">
                        <span className="px-2 py-0.5 bg-[#141413]/5 border border-[#141413]/10 text-[10px]">
                          {subscriber.source || 'Website Footer'}
                        </span>
                      </td>

                      <td className="p-3">
                        {subscriber.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#1F6F43]/10 text-[#1F6F43] border border-[#1F6F43]/20 text-[10px] uppercase font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1F6F43]" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#6E6D68]/10 text-[#6E6D68] border border-[#6E6D68]/20 text-[10px] uppercase font-bold">
                            Unsubscribed
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-[11px] text-[#5E5D59]">
                        {subscriber.lastSentAt ? (
                          <div>
                            <span className="block font-semibold text-[#141413]">
                              {subscriber.lastSentAt}
                            </span>
                            {subscriber.campaignHistory?.[0] && (
                              <span className="text-[10px] text-[#6E6D68] block truncate max-w-[180px]">
                                &ldquo;{subscriber.campaignHistory[0].subject}&rdquo;
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#8E8D87]">— Not yet sent —</span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRecipientIds([subscriber.id]);
                              setIsComposerOpen(true);
                            }}
                            className="p-1 text-[#141413] hover:text-[#D94E34] hover:bg-[#141413]/5 transition-colors cursor-pointer"
                            title="Send Direct Bulletin to this email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              updateNewsletterSubscriber(subscriber.id, {
                                status: subscriber.status === 'active' ? 'unsubscribed' : 'active',
                              });
                              showToast(
                                `Updated status for ${subscriber.email} to: ${
                                  subscriber.status === 'active' ? 'unsubscribed' : 'active'
                                }`
                              );
                            }}
                            className="p-1 text-[#5E5D59] hover:text-[#141413] hover:bg-[#141413]/5 transition-colors cursor-pointer text-[10px] uppercase underline"
                            title="Toggle subscriber status"
                          >
                            {subscriber.status === 'active' ? 'Unsub' : 'Reactivate'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove subscriber ${subscriber.email} permanently?`)) {
                                removeNewsletterSubscriber(subscriber.id);
                                showToast(`Removed ${subscriber.email}`);
                              }
                            }}
                            className="p-1 text-[#6E6D68] hover:text-[#D94E34] hover:bg-[#D94E34]/10 transition-colors cursor-pointer"
                            title="Delete Subscriber"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================
          BROADCAST COMPOSER MODAL
         =================================================================== */}
      {isComposerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/70 backdrop-blur-xs overflow-y-auto"
        >
          <div className="relative w-full max-w-2xl bg-[#F4F3EF] border border-[#141413] shadow-2xl p-6 sm:p-8 space-y-5 my-auto text-[#141413]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#141413]/12">
              <div>
                <span className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#D94E34] font-semibold">
                  BULLETIN ENGINE · BROADCAST DISPATCH
                </span>
                <h3 className="font-editorial text-2xl text-[#141413] mt-0.5">
                  Compose Regulatory Bulletin
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="p-1 border border-[#141413]/20 hover:bg-[#141413] hover:text-[#F4F3EF] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Audience Bar */}
            <div className="p-3 bg-[#EAE9E4] border border-[#141413]/10 text-xs font-mono-num flex items-center justify-between">
              <span className="text-[#6E6D68]">Target Audience:</span>
              <span className="font-bold text-[#1F6F43]">
                {selectedRecipientIds.length > 0
                  ? `${selectedRecipientIds.length} Selected Subscriber(s)`
                  : `All ${activeCount} Active Subscribers`}
              </span>
            </div>

            {/* Template Presets Picker */}
            <div className="space-y-1.5 font-mono-num text-xs">
              <span className="text-[#6E6D68] text-[11px] block">
                Load Preset Template (Optional):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {BULLETIN_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="px-2.5 py-1 bg-[#F4F3EF] border border-[#141413]/25 hover:bg-[#141413] hover:text-[#F4F3EF] transition-colors text-[10px] cursor-pointer truncate max-w-xs"
                  >
                    {tpl.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSendBroadcast} className="space-y-4 font-mono-num text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#141413] block uppercase tracking-wider">
                  Subject Line *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. STATUTORY NOTICE: Kenya Work Permit Gazette Revision 2026"
                  className="w-full bg-[#EAE9E4] border border-[#141413]/25 px-3 py-2 text-xs text-[#141413] focus:outline-none focus:border-[#141413]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#141413] block uppercase tracking-wider">
                  Bulletin Message Content *
                </label>
                <textarea
                  required
                  rows={8}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Enter detailed statutory guidance, procedural notes, or advisory announcements..."
                  className="w-full bg-[#EAE9E4] border border-[#141413]/25 p-3 text-xs text-[#141413] focus:outline-none focus:border-[#141413] leading-relaxed resize-y"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#141413]/10">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="px-4 py-2.5 border border-[#141413]/25 text-xs text-[#141413] hover:bg-[#EAE9E4] cursor-pointer uppercase"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSending}
                  className="px-6 py-2.5 bg-[#D94E34] hover:bg-[#BF3E26] text-[#F4F3EF] text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#F4F3EF] border-t-transparent rounded-full animate-spin" />
                      <span>DISPATCHING EMAILS...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>SEND BROADCAST BULLETIN</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MANUAL ADD SUBSCRIBER MODAL
         =================================================================== */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/70 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-md bg-[#F4F3EF] border border-[#141413] shadow-2xl p-6 space-y-4 text-[#141413]">
            <div className="flex items-center justify-between pb-2 border-b border-[#141413]/12">
              <h3 className="font-editorial text-xl text-[#141413]">
                Add Newsletter Subscriber
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 border border-[#141413]/20 hover:bg-[#141413] hover:text-[#F4F3EF] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubscriberSubmit} className="space-y-3 font-mono-num text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#141413] block uppercase">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="client@company.com"
                  className="w-full bg-[#EAE9E4] border border-[#141413]/25 px-3 py-2 text-xs text-[#141413] focus:outline-none focus:border-[#141413]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#141413] block uppercase">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Kennedy Omondi"
                  className="w-full bg-[#EAE9E4] border border-[#141413]/25 px-3 py-2 text-xs text-[#141413] focus:outline-none focus:border-[#141413]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#141413] block uppercase">
                  Acquisition Channel / Source
                </label>
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="e.g. Pioneer House Desk / Direct Intake"
                  className="w-full bg-[#EAE9E4] border border-[#141413]/25 px-3 py-2 text-xs text-[#141413] focus:outline-none focus:border-[#141413]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#141413]/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 border border-[#141413]/25 text-xs text-[#141413] hover:bg-[#EAE9E4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#141413] hover:bg-[#2B2B28] text-[#F4F3EF] text-xs uppercase font-bold cursor-pointer"
                >
                  Save Subscriber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
