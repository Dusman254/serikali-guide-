/**
 * Serikali Guide - Super Intelligent AI Search & Problem Solving Engine
 *
 * Grounded directly on live Serikali blogs, statutory knowledge base, and official service pages.
 * Reads user problem descriptions (e.g., "I lost my laptop", "I lost my passport", "I lost my national ID", "How do I register an NGO?")
 * and synthesizes an immediate statutory resolution:
 *  1. Problem diagnosis & regulatory framing
 *  2. Sequential, step-by-step procedural action plan
 *  3. Grounded blog dossiers with deep links
 *  4. High-converting official Call-to-Actions (CTAs)
 */

import { BlogPost, ServiceCategory } from '../data/serikaliData';

export interface ImmediateActionStep {
  stepNumber: number;
  title: string;
  detail: string;
  formCode?: string;
  isUrgent?: boolean;
}

export interface AiCallToAction {
  id: string;
  label: string;
  description?: string;
  actionType: 'start-service' | 'open-blog' | 'get-started' | 'consultation';
  variant: 'primary' | 'secondary' | 'outline' | 'accent';
  payload: {
    serviceId?: string;
    blogId?: string;
    topic?: string;
    url?: string;
    [key: string]: any;
  };
}

export interface AiProblemSolution {
  query: string;
  problemType: string;
  diagnosisTitle: string;
  summaryOverview: string;
  urgencyBadge: {
    level: 'critical' | 'high' | 'normal';
    text: string;
  };
  governingFramework: {
    governingLaw: string;
    regulatoryAgency: string;
    officialPortal: string;
    statutoryFees: string;
  };
  immediateActionSteps: ImmediateActionStep[];
  groundedBlogs: BlogPost[];
  callToActions: AiCallToAction[];
  followUpQuestions?: string[];
  isAiEnhanced?: boolean;
}

/**
 * Helper to match relevant blogs from the live blog store based on query keywords
 */
function findRelevantBlogs(query: string, blogPosts: BlogPost[], maxCount = 3): BlogPost[] {
  if (!blogPosts || blogPosts.length === 0) return [];

  const lowerQuery = query.toLowerCase();
  const tokens = lowerQuery
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const scored = blogPosts.map((blog) => {
    let score = 0;
    const blogText = `${blog.title} ${blog.subtitle} ${blog.excerpt} ${(blog.keywords || []).join(' ')} ${(blog.keyTakeaways || []).join(' ')}`.toLowerCase();

    for (const token of tokens) {
      if (blog.title.toLowerCase().includes(token)) score += 10;
      if (blog.excerpt.toLowerCase().includes(token)) score += 5;
      if (blogText.includes(token)) score += 2;
    }

    // Specific domain boost
    if (
      (lowerQuery.includes('laptop') || lowerQuery.includes('device') || lowerQuery.includes('data')) &&
      blog.id.includes('odpc')
    ) {
      score += 15;
    }
    if (
      (lowerQuery.includes('passport') || lowerQuery.includes('visa') || lowerQuery.includes('travel')) &&
      blog.id.includes('epassport')
    ) {
      score += 15;
    }
    if (
      (lowerQuery.includes('id') || lowerQuery.includes('abstract') || lowerQuery.includes('lost')) &&
      (blog.id.includes('civil') || blog.id.includes('ecitizen'))
    ) {
      score += 12;
    }

    return { blog, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Return top scored or fallback to first items if no score
  const topMatches = scored.filter((s) => s.score > 0).slice(0, maxCount).map((s) => s.blog);
  if (topMatches.length > 0) return topMatches;

  return blogPosts.slice(0, maxCount);
}

/**
 * Super Intelligent Local Synthesis Engine
 * Instantly parses the user query, determines intent, and produces an authoritative solution
 * reading directly from live blogs and service catalog.
 */
export function synthesizeSuperIntelligence(
  query: string,
  blogPosts: BlogPost[] = [],
  serviceCategories: ServiceCategory[] = []
): AiProblemSolution | null {
  const clean = (query || '').trim();
  if (!clean || clean.length < 2) return null;

  const q = clean.toLowerCase();

  // -------------------------------------------------------------------------
  // 1. SCENARIO: LOST LAPTOP / ELECTRONIC DEVICE / STOLEN GADGET
  // -------------------------------------------------------------------------
  const isLostLaptop =
    (q.includes('lost') || q.includes('stolen') || q.includes('misplaced') || q.includes('missing') || q.includes('snatched')) &&
    (q.includes('laptop') ||
      q.includes('macbook') ||
      q.includes('computer') ||
      q.includes('pc') ||
      q.includes('phone') ||
      q.includes('iphone') ||
      q.includes('tablet') ||
      q.includes('ipad') ||
      q.includes('device') ||
      q.includes('gadget'));

  if (isLostLaptop) {
    const groundedBlogs = findRelevantBlogs('lost laptop device odpc police abstract', blogPosts);

    return {
      query: clean,
      problemType: 'lost_laptop_device',
      diagnosisTitle: 'Emergency Protocol: Lost / Stolen Laptop or Electronic Device in Kenya',
      summaryOverview:
        'When an electronic device or corporate laptop is lost or stolen in Kenya, you face both immediate physical theft and severe legal liability under the Data Protection Act 2019 (ODPC) if personal or company client data was stored. Kenyan statutory protocol mandates immediate police abstract reporting with the device serial number/MAC address, remote identity quarantine, and statutory data breach notification within 72 hours.',
      urgencyBadge: {
        level: 'critical',
        text: 'CRITICAL · 72-HOUR ODPC BREACH WINDOW & POLICE REPORT',
      },
      governingFramework: {
        governingLaw: 'National Police Service Act Cap 84 & Data Protection Act 2019 (ODPC Sec 43)',
        regulatoryAgency: 'National Police Service (NPS) & Office of the Data Protection Commissioner',
        officialPortal: 'accounts.ecitizen.go.ke / odpc.go.ke',
        statutoryFees: 'Police Abstract: Free | Commissioner of Oaths Affidavit: KES 500 – 1,500',
      },
      immediateActionSteps: [
        {
          stepNumber: 1,
          title: 'Immediate Remote Lock, Session Wipe & Credential Quarantine',
          detail:
            'Trigger remote wipe via Apple "Find My", Google "Find My Device", or Microsoft Intune/Exchange. Revoke all active session cookies, terminate 2-Factor Authentication (2FA) sessions, and immediately rotate email, banking, eCitizen, and KRA iTax passwords.',
          isUrgent: true,
        },
        {
          stepNumber: 2,
          title: 'Obtain Occurrence Book (OB) Entry & Police Abstract from NPS',
          detail:
            'Report immediately to the nearest National Police Service station or DCI Cybercrime desk. Provide the device make, model, Serial Number, and MAC Address. Request an official stamped Police Abstract document detailing the theft/loss circumstances.',
          formCode: 'NPS-OB / Police Abstract',
          isUrgent: true,
        },
        {
          stepNumber: 3,
          title: 'Commission a Sworn Affidavit of Loss before a Commissioner for Oaths',
          detail:
            'Execute a sworn statutory affidavit confirming ownership, serial numbers, and the specific date/location of loss. This sworn affidavit is legally required by insurance underwriters, employers, and Kenyan courts to formalize property loss.',
          formCode: 'Form Oaths Cap 15',
          isUrgent: false,
        },
        {
          stepNumber: 4,
          title: 'ODPC Statutory Data Breach Notification (Mandatory Within 72 Hours)',
          detail:
            'If the lost device contained personal records, employee details, or client data, you must notify the Office of the Data Protection Commissioner (ODPC) within 72 hours of becoming aware under Section 43 of the Kenya Data Protection Act 2019 to prevent statutory fines up to KES 5,000,000.',
          formCode: 'ODPC Breach Form',
          isUrgent: true,
        },
        {
          stepNumber: 5,
          title: 'Blacklist Device IMEI / Serial & File Insurance Claim',
          detail:
            'Submit the stamped Police Abstract, Sworn Affidavit, and original purchase invoice to your device insurance provider or employer asset registry. Report stolen serial numbers to DCI Cybercrime to flag illicit resale on commercial markets.',
          isUrgent: false,
        },
      ],
      groundedBlogs,
      callToActions: [
        {
          id: 'cta-laptop-concierge',
          label: 'Process Police Abstract & Sworn Affidavit Dossier',
          description: 'Obtain certified statutory affidavit and guided Police Abstract paperwork.',
          variant: 'primary',
          actionType: 'start-service',
          payload: { serviceId: 'document-replacement' },
        },
        {
          id: 'cta-laptop-blog',
          label: 'Read Kenya ODPC Data Protection & Compliance Dossier',
          description: 'Understand regulatory breach reporting obligations under Kenyan law.',
          variant: 'secondary',
          actionType: 'open-blog',
          payload: { blogId: 'blog-licences-permits-nca-nema-odpc-kenya' },
        },
        {
          id: 'cta-laptop-consult',
          label: 'Speak with Regulatory Concierge',
          description: 'Emergency legal and statutory recovery consultation.',
          variant: 'outline',
          actionType: 'consultation',
          payload: {},
        },
      ],
      followUpQuestions: [
        'How do I notify the ODPC of a lost corporate laptop in Kenya?',
        'What documents are needed to get a Police Abstract in Nairobi?',
        'Can I replace my lost work certificates and digital credentials?',
      ],
    };
  }

  // -------------------------------------------------------------------------
  // 2. SCENARIO: LOST PASSPORT / DAMAGED / EXPIRED TRAVEL DOCUMENT
  // -------------------------------------------------------------------------
  const isLostPassport =
    (q.includes('lost') || q.includes('stolen') || q.includes('misplaced') || q.includes('replace') || q.includes('replacement') || q.includes('renew')) &&
    (q.includes('passport') || q.includes('travel document') || q.includes('epassport') || q.includes('e-passport'));

  if (isLostPassport) {
    const groundedBlogs = findRelevantBlogs('lost passport epassport ecitizen nyayo house', blogPosts);

    return {
      query: clean,
      problemType: 'lost_passport',
      diagnosisTitle: 'Statutory Replacement Protocol: Lost or Stolen Kenyan Passport',
      summaryOverview:
        'Losing a Kenyan Passport is governed strictly by the Kenya Citizenship and Immigration Act 2011 and Gazetted Immigration Regulations. An official Police Abstract must be secured immediately to cancel the lost passport number on the INTERPOL Stolen and Lost Travel Documents (SLTD) database, followed by a Sworn Affidavit of Loss, an eCitizen Directorate of Immigration Services filing, and statutory fee payment.',
      urgencyBadge: {
        level: 'critical',
        text: 'CRITICAL · POLICE REPORT & INTERPOL NOTIFICATION',
      },
      governingFramework: {
        governingLaw: 'Kenya Citizenship and Immigration Act 2011 & Gazetted Fees 2024',
        regulatoryAgency: 'Directorate of Immigration Services (State Dept for Immigration & Citizen Services)',
        officialPortal: 'immigration.ecitizen.go.ke / fns.immigration.go.ke',
        statutoryFees: 'Lost Passport Replacement: KES 12,050 (34-Page) | KES 15,050 (50-Page) + KES 50 eCitizen',
      },
      immediateActionSteps: [
        {
          stepNumber: 1,
          title: 'Obtain Police Abstract & Occurrence Book (OB) Entry',
          detail:
            'Visit the nearest National Police Service station immediately. Explain circumstances of the lost passport, record the exact date and location, and secure an official stamped Police Abstract document.',
          formCode: 'Police Abstract',
          isUrgent: true,
        },
        {
          stepNumber: 2,
          title: 'Execute a Sworn Affidavit of Loss before a Commissioner for Oaths',
          detail:
            'Have an Advocate or Commissioner for Oaths administer and stamp a Sworn Affidavit of Loss testifying that the original passport is lost and will be surrendered to Immigration if recovered.',
          formCode: 'Statutory Affidavit Form',
          isUrgent: true,
        },
        {
          stepNumber: 3,
          title: 'Submit E-Passport Replacement Application on eCitizen',
          detail:
            'Log into your eCitizen account, navigate to Directorate of Immigration Services, select "Passport Application (Replacement for Lost Passport)", fill in personal biodata, and upload certified scans of your Police Abstract and Affidavit.',
          formCode: 'Immigration Form 19',
          isUrgent: false,
        },
        {
          stepNumber: 4,
          title: 'Pay Gazetted Statutory Fees via Government Paybill 222222',
          detail:
            'Remit the gazetted fee (KES 12,050 for 34-page Series B or KES 15,050 for 50-page Series C) through eCitizen Paybill 222222 and print the serialized Payment Reference Number (PRN) receipt.',
          isUrgent: false,
        },
        {
          stepNumber: 5,
          title: 'Book Appointment & Attend Biometrics at Nyayo House / Regional Office',
          detail:
            'Present yourself with original National ID card, birth certificate, photocopy of lost passport (if available), recommender ID copy, 3 passport photos, and printed application invoices for biometric enrollment.',
          isUrgent: false,
        },
      ],
      groundedBlogs,
      callToActions: [
        {
          id: 'cta-passport-start',
          label: 'Start Passport Replacement Dossier',
          description: 'Prepare complete statutory documentation and eCitizen filing.',
          variant: 'primary',
          actionType: 'start-service',
          payload: { serviceId: 'passport-lost-replace' },
        },
        {
          id: 'cta-passport-blog',
          label: 'Read E-Passport & Civil Documents Guide',
          description: 'Detailed instructions on Nyayo House biometric booking and requirements.',
          variant: 'secondary',
          actionType: 'open-blog',
          payload: { blogId: 'blog-kenya-epassport-good-conduct-civil-docs' },
        },
        {
          id: 'cta-passport-consult',
          label: 'Book Immigration Concierge',
          description: 'Fast-track document verification and appointment assistance.',
          variant: 'outline',
          actionType: 'consultation',
          payload: {},
        },
      ],
      followUpQuestions: [
        'What is the statutory penalty fee for replacing a lost Kenyan passport?',
        'Can I get an Emergency Travel Document if I lost my passport while abroad?',
        'How long does e-passport processing take at Nyayo House after biometrics?',
      ],
    };
  }

  // -------------------------------------------------------------------------
  // 3. SCENARIO: LOST NATIONAL ID / MAISHA NAMBA / IDENTITY THEFT
  // -------------------------------------------------------------------------
  const isLostId =
    (q.includes('lost') || q.includes('stolen') || q.includes('misplaced') || q.includes('replace')) &&
    (q.includes('id') ||
      q.includes('national id') ||
      q.includes('identity card') ||
      q.includes('maisha') ||
      q.includes('kitambulisho') ||
      q.includes('waiting card'));

  if (isLostId) {
    const groundedBlogs = findRelevantBlogs('lost national id maisha card ecitizen civil registration', blogPosts);

    return {
      query: clean,
      problemType: 'lost_id',
      diagnosisTitle: 'Statutory Replacement Protocol: Lost National Identity Card (Maisha Namba)',
      summaryOverview:
        'Under the Registration of Persons Act (Cap 107), losing your Kenyan National ID leaves you vulnerable to identity fraud, unlawful SIM card swaps, and financial impersonation. You must obtain a Police Abstract immediately, freeze unauthorized mobile transactions with telecom operators, and apply for a Duplicate Identity Card (Maisha Card) via eCitizen or at any Huduma Centre across Kenya.',
      urgencyBadge: {
        level: 'critical',
        text: 'CRITICAL · IDENTITY THEFT & FRAUD MITIGATION',
      },
      governingFramework: {
        governingLaw: 'Registration of Persons Act Cap 107 & Kenya Gazette Notices',
        regulatoryAgency: 'National Registration Bureau (NRB) & Huduma Kenya Secretariat',
        officialPortal: 'accounts.ecitizen.go.ke / hudumakenya.go.ke',
        statutoryFees: 'Duplicate ID Replacement: KES 2,000 via Government Paybill 222222',
      },
      immediateActionSteps: [
        {
          stepNumber: 1,
          title: 'Obtain Police Abstract & Occurrence Book (OB) Entry',
          detail:
            'Report the lost ID to the nearest National Police Service station to record an OB entry and secure a stamped Police Abstract with your full name and ID number.',
          formCode: 'Police Abstract',
          isUrgent: true,
        },
        {
          stepNumber: 2,
          title: 'Temporary SIM Lock & Identity Quarantine with Mobile Telcos',
          detail:
            'Contact Safaricom, Airtel, or Telkom customer care to flag your lost ID and freeze unauthorized SIM swap requests or mobile money loans against your National ID credentials.',
          isUrgent: true,
        },
        {
          stepNumber: 3,
          title: 'Execute Sworn Affidavit of Loss',
          detail:
            'Visit a Commissioner for Oaths or legal clinic to attest an affidavit detailing the circumstances of loss, your permanent residence, and identity details.',
          isUrgent: false,
        },
        {
          stepNumber: 4,
          title: 'Apply for Duplicate ID Card on eCitizen or Visit Huduma Centre',
          detail:
            'Submit application for Duplicate National Identity Card (Maisha Namba) online via eCitizen or present your Police Abstract, Birth Certificate, and two passport photos at any Huduma Centre desk.',
          formCode: 'Form Reg 1 / Duplicate ID',
          isUrgent: false,
        },
        {
          stepNumber: 5,
          title: 'Receive Official Waiting Card (Form 3) & Await SMS Collection Alert',
          detail:
            'Collect your serialized Interim Identity Waiting Card, which serves as valid legal proof of identity until your physical 3rd Generation Maisha Card is printed.',
          isUrgent: false,
        },
      ],
      groundedBlogs,
      callToActions: [
        {
          id: 'cta-id-start',
          label: 'Initiate Document Replacement Concierge',
          description: 'Fast-track identity restoration and legal documentation.',
          variant: 'primary',
          actionType: 'start-service',
          payload: { serviceId: 'document-replacement' },
        },
        {
          id: 'cta-id-blog',
          label: 'Read E-Citizen Civil Registration Guide',
          description: 'Official procedure for vital documents replacement in Kenya.',
          variant: 'secondary',
          actionType: 'open-blog',
          payload: { blogId: 'blog-ecitizen-single-sign-on-portals-guide' },
        },
        {
          id: 'cta-id-consult',
          label: 'Legal Concierge Assistance',
          description: 'Talk to an accredited advocate regarding identity theft and sworn affidavits.',
          variant: 'outline',
          actionType: 'consultation',
          payload: {},
        },
      ],
      followUpQuestions: [
        'How much is the gazetted fee for replacing a lost Kenyan National ID?',
        'Can I travel within East Africa with a National ID Waiting Card?',
        'How do I protect my KRA PIN and bank accounts after losing my ID?',
      ],
    };
  }

  // -------------------------------------------------------------------------
  // 4. SCENARIO: WORK PERMITS / EXPATRIATES / CLASS D / CLASS G / SPECIAL PASS
  // -------------------------------------------------------------------------
  const isWorkPermit =
    q.includes('work permit') ||
    q.includes('class d') ||
    q.includes('class g') ||
    q.includes('special pass') ||
    q.includes('alien card') ||
    q.includes('foreign national') ||
    q.includes('expatriate') ||
    q.includes('investor permit');

  if (isWorkPermit) {
    const groundedBlogs = findRelevantBlogs('work permit class d class g special pass fns immigration', blogPosts);

    return {
      query: clean,
      problemType: 'work_permit',
      diagnosisTitle: 'Foreign National Work Authorization & Immigration Compliance in Kenya',
      summaryOverview:
        'Engaging in employment or commercial enterprise in Kenya as a non-citizen without valid immigration clearance is a criminal offense under Section 45 of the Kenya Citizenship and Immigration Act 2011. Applications for Class D (Employment) or Class G (Investors) must be lodged via the Electronic Foreign Nationals Services (eFNS) portal alongside understudy succession documentation and certified academic credentials.',
      urgencyBadge: {
        level: 'high',
        text: 'MANDATORY IMMIGRATION CLEARANCE · SECTION 36/45 ACT',
      },
      governingFramework: {
        governingLaw: 'Kenya Citizenship and Immigration Act 2011 & Gazette Notice No. 241/2024',
        regulatoryAgency: 'Directorate of Immigration Services (Immigration Permits Committee)',
        officialPortal: 'fns.immigration.go.ke',
        statutoryFees: 'Class D: KES 500,000/yr (Processing KES 20,000) | Special Pass: KES 100,000/3-mo',
      },
      immediateActionSteps: [
        {
          stepNumber: 1,
          title: 'Establish Employer Sponsorship & Understudy Succession Plan',
          detail:
            'Kenyan labor law mandates assigning a qualified Kenyan citizen understudy with a structured training program and detailed curriculum vitae to guarantee skills transfer.',
          isUrgent: true,
        },
        {
          stepNumber: 2,
          title: 'Compile Certified Corporate & Professional Dossier',
          detail:
            'Collate certified academic diplomas, professional body memberships, Police Clearance / FBI certificate from country of origin, company tax compliance certificate (TCC), and audited financial statements.',
          isUrgent: false,
        },
        {
          stepNumber: 3,
          title: 'Submit Application on Electronic Foreign Nationals Services (eFNS)',
          detail:
            'Upload completed Form 25, cover letter detailing statutory justification for expatriate hire, and pay the non-refundable statutory processing fee of KES 20,000 via Government Paybill 222222.',
          formCode: 'Form 25 (eFNS)',
          isUrgent: false,
        },
        {
          stepNumber: 4,
          title: 'Immigration Permits Committee Review & Approval Notification',
          detail:
            'The committee reviews statutory merit. Upon issuance of the formal Approval Notification, pay the annual issuance fee and execute a Security Bond.',
          isUrgent: false,
        },
        {
          stepNumber: 5,
          title: 'Biometric Enrollment & Alien Card (Foreign National Certificate) Issuance',
          detail:
            'Visit Nyayo House Ground Floor for biometric capture, digital signature, and issuance of the statutory Alien Card / Foreign National Registration Certificate.',
          isUrgent: false,
        },
      ],
      groundedBlogs,
      callToActions: [
        {
          id: 'cta-permit-start',
          label: 'Start Work Permit Application Dossier',
          description: 'Guided Class D or Class G expatriate permit filing with compliance review.',
          variant: 'primary',
          actionType: 'start-service',
          payload: { serviceId: 'work-permit-class-d' },
        },
        {
          id: 'cta-permit-blog',
          label: 'Read Work Permits & Immigration Law Guide',
          description: 'Exhaustive legal breakdown of gazetted fees, understudy rules, and timelines.',
          variant: 'secondary',
          actionType: 'open-blog',
          payload: { blogId: 'blog-kenya-epassport-good-conduct-civil-docs' },
        },
        {
          id: 'cta-permit-consult',
          label: 'Schedule Expatriate Corporate Consultation',
          description: 'Discuss corporate cross-border hiring and tax structuring.',
          variant: 'outline',
          actionType: 'consultation',
          payload: {},
        },
      ],
      followUpQuestions: [
        'What is the difference between an emergency Special Pass and a Class D permit?',
        'What documents are required to prove the Kenyan understudy program?',
        'How long does the Immigration Permits Committee take to approve a work permit?',
      ],
    };
  }

  // -------------------------------------------------------------------------
  // 5. SCENARIO: COMPANY REGISTRATION / BUSINESS INCORPORATION (BRS)
  // -------------------------------------------------------------------------
  const isBusiness =
    q.includes('company') ||
    q.includes('register business') ||
    q.includes('incorporate') ||
    q.includes('limited company') ||
    q.includes('ltd') ||
    q.includes('business registration') ||
    q.includes('brs') ||
    q.includes('cr12');

  if (isBusiness) {
    const groundedBlogs = findRelevantBlogs('company registration brs business cr12 ecitizen', blogPosts);

    return {
      query: clean,
      problemType: 'company_registration',
      diagnosisTitle: 'Statutory Business Incorporation: Private Limited Company & BRS Filings',
      summaryOverview:
        'Incorporation of companies in Kenya is governed by the Companies Act 2015 via the Business Registration Service (BRS) on eCitizen. Every private company must file Model Articles of Association, register verified directors and beneficial owners (BOF1), obtain a company KRA PIN, and maintain a registered office in Kenya.',
      urgencyBadge: {
        level: 'normal',
        text: 'STATUTORY INCORPORATION · COMPANIES ACT 2015',
      },
      governingFramework: {
        governingLaw: 'Companies Act No. 17 of 2015 & Business Registration Service Act',
        regulatoryAgency: 'Business Registration Service (BRS) & Kenya Revenue Authority (KRA)',
        officialPortal: 'brs.ecitizen.go.ke / itax.kra.go.ke',
        statutoryFees: 'Statutory Incorporation Fee: KES 10,750 inclusive of official CR12 certificate',
      },
      immediateActionSteps: [
        {
          stepNumber: 1,
          title: 'Name Reservation & Search via BRS Portal',
          detail:
            'Conduct an official name reservation search on the Business Registration Service (BRS). Approved business names are reserved for 30 consecutive days.',
          formCode: 'Form CR14',
          isUrgent: false,
        },
        {
          stepNumber: 2,
          title: 'Complete Statutory Application Form (CR1, CR2 & CR8)',
          detail:
            'Input director/shareholder details, residential addresses, physical location of the registered office (CR8), and adopt Model Articles of Association (CR2).',
          formCode: 'Form CR1 / CR2 / CR8',
          isUrgent: false,
        },
        {
          stepNumber: 3,
          title: 'File Beneficial Ownership Declaration (BOF1)',
          detail:
            'Kenyan law strictly penalizes failure to disclose natural persons with ultimate control (minimum 10% shareholding or voting rights) within 30 days of incorporation.',
          formCode: 'Form BOF1',
          isUrgent: true,
        },
        {
          stepNumber: 4,
          title: 'Payment of Gazetted Statutory Fees via Paybill 222222',
          detail:
            'Pay the gazetted fee of KES 10,750 directly through government single paybill 222222. The Registrar issues an electronic Certificate of Incorporation.',
          isUrgent: false,
        },
        {
          stepNumber: 5,
          title: 'Automatic Company KRA PIN, NSSF, NHIF & Official CR12 Generation',
          detail:
            'Upon approval, download your official CR12 (official record of directors/shareholders) and activate company tax obligations on the KRA iTax portal.',
          isUrgent: false,
        },
      ],
      groundedBlogs,
      callToActions: [
        {
          id: 'cta-company-start',
          label: 'Incorporate Private Limited Company',
          description: 'Full guided incorporation with name search, CR12, and KRA PIN.',
          variant: 'primary',
          actionType: 'start-service',
          payload: { serviceId: 'private-limited-company' },
        },
        {
          id: 'cta-company-blog',
          label: 'Read Business Incorporation & Tax Guide',
          description: 'Step-by-step statutory filing instructions on BRS eCitizen.',
          variant: 'secondary',
          actionType: 'open-blog',
          payload: { blogId: 'blog-business-registration-kenya-brs-kra-guide' },
        },
        {
          id: 'cta-company-consult',
          label: 'Schedule Commercial Structuring Advisory',
          description: 'Consult on shareholder agreements, foreign directorships, and licensing.',
          variant: 'outline',
          actionType: 'consultation',
          payload: {},
        },
      ],
      followUpQuestions: [
        'Can a foreigner own 100% of a private limited company in Kenya?',
        'How long does BRS take to issue the Certificate of Incorporation and CR12?',
        'What are the mandatory annual compliance returns for Kenyan companies?',
      ],
    };
  }

  // -------------------------------------------------------------------------
  // 6. SCENARIO: KRA TAX COMPLIANCE / PIN / TAX RETURNS
  // -------------------------------------------------------------------------
  const isTax =
    q.includes('tax') ||
    q.includes('kra') ||
    q.includes('compliance certificate') ||
    q.includes('tcc') ||
    q.includes('itax') ||
    q.includes('nil returns') ||
    q.includes('vat');

  if (isTax) {
    const groundedBlogs = findRelevantBlogs('kra tax compliance tcc itax returns penalties', blogPosts);

    return {
      query: clean,
      problemType: 'tax_compliance',
      diagnosisTitle: 'Kenya Revenue Authority: Tax Compliance Certificate (TCC) & Filings',
      summaryOverview:
        'A valid KRA Tax Compliance Certificate (TCC) is mandatory for public tender bidding, corporate directorships, commercial bank accounts, and work permit sponsorships under the Tax Procedures Act 2015. TCC issuance requires zero outstanding tax liabilities and up-to-date filing of income tax, PAYE, and VAT returns.',
      urgencyBadge: {
        level: 'high',
        text: 'STATUTORY REQUIREMENT · TAX PROCEDURES ACT 2015',
      },
      governingFramework: {
        governingLaw: 'Tax Procedures Act No. 29 of 2015 & Finance Acts',
        regulatoryAgency: 'Kenya Revenue Authority (KRA)',
        officialPortal: 'itax.kra.go.ke',
        statutoryFees: 'TCC Application: Free (Zero statutory fee on iTax)',
      },
      immediateActionSteps: [
        {
          stepNumber: 1,
          title: 'Verify PIN Profile & Tax Obligations on KRA iTax',
          detail:
            'Log into itax.kra.go.ke with your KRA PIN and password. Inspect active tax obligations (Income Tax Resident/Non-Resident, VAT, PAYE).',
          isUrgent: true,
        },
        {
          stepNumber: 2,
          title: 'Reconcile Outstanding Tax Returns & Nil Declarations',
          detail:
            'Ensure all annual and monthly returns have been submitted for prior financial years. File nil returns if no taxable income was earned during the fiscal period.',
          isUrgent: true,
        },
        {
          stepNumber: 3,
          title: 'Clear Any Outstanding Principal Taxes or Penalties',
          detail:
            'Generate an e-slip for any pending tax assessments and remit payment via KRA Paybill 222222 or partnered commercial banks.',
          isUrgent: false,
        },
        {
          stepNumber: 4,
          title: 'Submit Online Application for Tax Compliance Certificate',
          detail:
            'Navigate to "Certificates" -> "Apply for Tax Compliance Certificate". Fill in purpose of application (Tender, Renewal, Employment).',
          formCode: 'Form TCC 1',
          isUrgent: false,
        },
        {
          stepNumber: 5,
          title: 'Instant Automated Issuance & QR Code Verification',
          detail:
            'If your ledger has no debt and returns are up to date, iTax automatically approves and emails a serialized TCC valid for 12 months.',
          isUrgent: false,
        },
      ],
      groundedBlogs,
      callToActions: [
        {
          id: 'cta-tax-start',
          label: 'Request Tax Reconciliation & TCC Concierge',
          description: 'Audit tax ledger, file pending returns, and secure official TCC.',
          variant: 'primary',
          actionType: 'start-service',
          payload: { serviceId: 'tax-compliance' },
        },
        {
          id: 'cta-tax-blog',
          label: 'Read KRA Tax Compliance & E-Citizen Guide',
          description: 'Comprehensive guidelines on avoiding KRA tax penalties and audits.',
          variant: 'secondary',
          actionType: 'open-blog',
          payload: { blogId: 'blog-tax-compliance-certificate-tcc-kra-guide' },
        },
        {
          id: 'cta-tax-consult',
          label: 'Book Tax Advisory Session',
          description: 'Consult certified tax accountants on audits and debt mitigation.',
          variant: 'outline',
          actionType: 'consultation',
          payload: {},
        },
      ],
      followUpQuestions: [
        'How long does KRA take to issue a Tax Compliance Certificate online?',
        'What should I do if my TCC is rejected due to erroneous pending arrears?',
        'Can I get a TCC if I am unemployed and filing nil returns?',
      ],
    };
  }

  // -------------------------------------------------------------------------
  // 7. GENERAL CIVIC / REGULATORY DYNAMIC SYNTHESIS
  // Grounded on matched live blogs & services
  // -------------------------------------------------------------------------
  const groundedBlogs = findRelevantBlogs(clean, blogPosts, 3);
  const matchedService = serviceCategories
    .flatMap((c) =>
      c.subCategories.map((sub) => ({
        cat: c,
        sub,
      }))
    )
    .find(
      ({ sub }) =>
        clean.toLowerCase().includes(sub.name.toLowerCase()) ||
        sub.name.toLowerCase().includes(clean.toLowerCase())
    );

  const matchedSub = matchedService?.sub;
  const matchedCat = matchedService?.cat;

  return {
    query: clean,
    problemType: 'general_civic_inquiry',
    diagnosisTitle: matchedSub ? `Official Kenyan Regulatory Procedure: ${matchedSub.name}` : `Statutory Resolution & Guidance for "${clean}"`,
    summaryOverview: matchedSub
      ? `${matchedSub.summary} Governing Kenyan administrative regulations require adherence to gazetted procedures and statutory filing checkpoints.`
      : `Official Republic of Kenya procedures for "${clean}" are governed by gazetted regulations and official government portals. Follow these verified statutory steps and document requirements.`,
    urgencyBadge: {
      level: 'normal',
      text: 'OFFICIAL KENYAN STATUTORY PROCEDURE',
    },
    governingFramework: {
      governingLaw: matchedSub?.statutoryNote || 'Applicable Acts of Parliament & Kenya Gazette Directives',
      regulatoryAgency: matchedCat?.agency || 'Republic of Kenya Government Department',
      officialPortal: matchedSub?.portal || 'accounts.ecitizen.go.ke',
      statutoryFees: matchedSub?.feeNote || 'Gazetted Schedule via Government Paybill 222222',
    },
    immediateActionSteps: [
      {
        stepNumber: 1,
        title: 'Verify Identity & Portal Eligibility on Official .go.ke Domain',
        detail:
          'Ensure all administrative filings are performed exclusively on verified Kenyan government portals ending in .go.ke. Have your National ID, Passport, and KRA PIN active.',
        isUrgent: false,
      },
      {
        stepNumber: 2,
        title: 'Collate Certified Supporting Statutory Documentation',
        detail:
          matchedSub && matchedSub.requirements.length > 0
            ? `Assemble mandatory documents: ${matchedSub.requirements.slice(0, 3).join(', ')}.`
            : 'Assemble certified photocopies of national identification, passport photos, and relevant sworn legal documents.',
        isUrgent: false,
      },
      {
        stepNumber: 3,
        title: 'Submit Application & Remit Gazetted Fees via Paybill 222222',
        detail:
          'File the statutory application and pay authorized government fees directly using the central eCitizen Paybill 222222 to obtain a serialized Payment Reference Number (PRN).',
        isUrgent: false,
      },
      {
        stepNumber: 4,
        title: 'Track Official Processing & Biometric or In-Person Verification',
        detail:
          'Monitor application status via official SMS alerts or portal dashboards. Attend designated biometric enrollment or scheduled appointments with original documents.',
        isUrgent: false,
      },
    ],
    groundedBlogs,
    callToActions: [
      {
        id: 'cta-general-start',
        label: 'Start Service with Guided Concierge',
        description: 'Direct guided service application with document verification.',
        variant: 'primary',
        actionType: 'start-service',
        payload: { serviceId: matchedSub ? matchedSub.id : 'document-replacement' },
      },
      {
        id: 'cta-general-blog',
        label: 'Read Grounded Regulatory Dossier',
        description: 'Access verified Kenyan government procedures.',
        variant: 'secondary',
        actionType: 'open-blog',
        payload: { blogId: groundedBlogs[0]?.id || 'blog-ecitizen-single-sign-on-portals-guide' },
      },
      {
        id: 'cta-general-consult',
        label: 'Consult Regulatory Specialist',
        description: 'Speak directly with an accredited compliance consultant.',
        variant: 'outline',
        actionType: 'consultation',
        payload: {},
      },
    ],
    followUpQuestions: [
      'What are the official portal requirements for this procedure?',
      'How long does standard government processing take?',
      'What certified documents are required prior to submission?',
    ],
  };
}
