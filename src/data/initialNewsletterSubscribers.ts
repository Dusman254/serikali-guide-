import { NewsletterSubscriber } from '../types/serviceApplication';

export const INITIAL_NEWSLETTER_SUBSCRIBERS: NewsletterSubscriber[] = [
  {
    id: 'sub-001',
    email: 'k.odhiambo@safari-holdings.co.ke',
    name: 'Kennedy Odhiambo',
    subscribedAt: 'Jan 15, 2026, 09:20 AM',
    source: 'Website Footer',
    status: 'active',
    lastSentAt: 'Oct 02, 2026, 04:15 PM',
    campaignHistory: [
      {
        subject: 'Gazette Notice: New Expatriate Class D Work Permit Rulings',
        sentAt: 'Oct 02, 2026, 04:15 PM',
      },
    ],
  },
  {
    id: 'sub-002',
    email: 'sarah.jenkins@unhabitat-regional.org',
    name: 'Sarah Jenkins',
    subscribedAt: 'Feb 03, 2026, 11:45 AM',
    source: 'Service Application Flow',
    status: 'active',
    lastSentAt: 'Oct 02, 2026, 04:15 PM',
    campaignHistory: [
      {
        subject: 'Gazette Notice: New Expatriate Class D Work Permit Rulings',
        sentAt: 'Oct 02, 2026, 04:15 PM',
      },
    ],
  },
  {
    id: 'sub-003',
    email: 'compliance@africacapital-partners.com',
    name: 'Marcus Lindqvist',
    subscribedAt: 'Mar 12, 2026, 02:10 PM',
    source: 'Consultation Booking',
    status: 'active',
  },
  {
    id: 'sub-004',
    email: 'amara.diallo@westafrican-trade.net',
    name: 'Amara Diallo',
    subscribedAt: 'Apr 20, 2026, 08:30 AM',
    source: 'Website Footer',
    status: 'active',
  },
  {
    id: 'sub-005',
    email: 'director@lake-basin-ngo.org',
    name: 'Grace Wambui',
    subscribedAt: 'May 08, 2026, 03:50 PM',
    source: 'NGO Compliance Playbook',
    status: 'active',
  },
];
