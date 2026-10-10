export type ServiceCategoryId =
  | 'immigration-visas'
  | 'business-registration'
  | 'ngo-nonprofit'
  | 'government-documents'
  | 'licences-permits'
  | 'tax-compliance'
  | 'investment-relocation'
  | 'government-services'
  | (string & {});

export interface SubCategoryDetail {
  id: string;
  name: string;
  summary: string;
  portal: string;
  timeline: string;
  statutoryNote: string;
  requirements: string[];
  feeNote?: string;
  steps: Array<
    | {
        title: string;
        detail: string;
      }
    | string
  >;
}

export interface ServiceCategory {
  id: ServiceCategoryId;
  name: string;
  shortLabel: string;
  editorialHeadline: string;
  agency: string;
  heroImage: string;
  subCategories: SubCategoryDetail[];
  tagline?: string;
  description?: string;
  agencyBadge?: string;
  heroSubtitle?: string;
  overview?: string;
}

export interface BlogArticleSection {
  heading: string;
  paragraphs: string[];
  checklist?: string[];
  callout?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  categoryId: ServiceCategoryId;
  categoryName: string;
  subCategoryName: string;
  author: string;
  authorRole: string;
  publishedDate: string;
  readTime: string;
  image: string;
  isTopStory: boolean;
  isFeatured: boolean;
  keywords: string[];
  keyTakeaways: string[];
  officialPortal: string;
  sections: BlogArticleSection[];
  status?: 'published' | 'draft' | 'unpublished';
  tags?: string[];
  content?: string;
  createdAt?: string;
  updatedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export const EDITORIAL_IMAGES = {
  immigration: '/src/assets/images/serikali_immigration_visas_1790882120216.jpg',
  business: '/src/assets/images/serikali_business_registration_1790882133145.jpg',
  ngo: '/src/assets/images/serikali_ngo_governance_1790882145611.jpg',
  taxAndDocs: '/src/assets/images/serikali_tax_ecitizen_1790882155795.jpg',
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'immigration-visas',
    name: 'Immigration & Visas',
    shortLabel: 'Immigration & Visas',
    tagline: 'Work permits, passes, eTA & permanent residency.',
    editorialHeadline:
      'Navigate Kenyan Directorate of Immigration Services (eFNS) work permits, passes, residency, and citizenship.',
    description:
      'Comprehensive procedural guidance and application support for expatriates, employers, diplomats, and families applying through the Kenya Electronic Foreign Nationals Services (eFNS) portal at Nyayo House.',
    agency: 'Directorate of Immigration Services · eFNS Portal',
    heroImage: EDITORIAL_IMAGES.immigration,
    subCategories: [
      {
        id: 'work-permits',
        name: 'Work permits',
        summary:
          'Statutory authorization for foreign nationals engaging in employment, consultancy, investment, or specialized missionary/charitable work in Kenya (Classes A, B, C, D, F, G, I, K, M).',
        portal: 'fns.immigration.go.ke (eFNS)',
        timeline: '6 to 12 Weeks',
        statutoryNote: 'Form 25 · Permit Issuance & Alien Card Registration Required',
        requirements: [
          'Duly filled and signed Form 25 online application via eFNS',
          'Signed cover letter from employer or investing company addressed to the Director General of Immigration',
          'Copies of valid national passport (bio-data page with at least 6 months validity)',
          'Certified copies of academic & professional certificates (and CV)',
          'Name and details of Kenyan Understudy (for Class D employment permits) with contract & credentials',
          'Company Certificate of Incorporation, CR12, and valid Tax Compliance Certificate (TCC)',
          'Proof of capital investment (minimum USD 100,000 bank statement/audit report for Class G Investor Permit)',
        ],
        steps: [
          {
            title: '01. Determine Appropriate Permit Class',
            detail:
              'Match your role to the statutory class: Class D for skilled employment, Class G for specific trade/consultancy/investment, Class K for ordinary residents (35+ years with guaranteed annual income), or Class I for approved religious/charitable work.',
          },
          {
            title: '02. Compile Dossier & Kenyan Understudy Records',
            detail:
              'Ensure corporate tax compliance, CR12, and understudy documentation (for Class D) are certified and formatted to Directorate of Immigration standards.',
          },
          {
            title: '03. Submit via eFNS & Track Committee Review',
            detail:
              'Upload the complete packet on the eFNS portal, pay the statutory processing fee, and monitor Permit Determination Committee status.',
          },
          {
            title: '04. Endorsement, Security Bond & Alien Card',
            detail:
              'Upon approval, pay the annual permit fee, execute the immigration security bond, endorse the permit in the passport, and register for a Foreign National Certificate (Alien Card).',
          },
        ],
      },
      {
        id: 'passes',
        name: 'Passes',
        summary:
          'Short-term and purpose-specific immigration passes including Special Pass (up to 6 months), Student/Pupil Pass, Internship/Research Pass, and Visitor Pass extensions.',
        portal: 'fns.immigration.go.ke (eFNS)',
        timeline: '5 to 15 Working Days',
        statutoryNote: 'Form 32 (Special Pass) · Form 30 (Student Pass)',
        requirements: [
          'Completed online application on eFNS (Form 32 for Special Pass or Form 30 for Student Pass)',
          'Official cover letter from the host institution, university, or contracting company in Kenya',
          'Clear copy of applicant passport bio-data page and current legal immigration status/entry stamp',
          'Certified academic credentials and clearance from relevant regulatory bodies where applicable',
          'Certificate of Incorporation and KRA PIN of the sponsoring organization',
        ],
        steps: [
          {
            title: '01. Select Pass Category on eFNS',
            detail:
              'Choose Special Pass for short-term assignments/while awaiting work permit processing, or Student Pass for accredited educational institutions.',
          },
          {
            title: '02. Upload Sponsor & Institutional Clearances',
            detail:
              'Attach the host organization’s registration certificates, admission/contract letter, and passport copies.',
          },
          {
            title: '03. Pay Statutory Fee & Download Issued Pass',
            detail:
              'Once approved, settle the invoice via eCitizen/eFNS and print the digital Special Pass or Student Pass endorsement.',
          },
        ],
      },
      {
        id: 'visas',
        name: 'Visas',
        summary:
          'Electronic Travel Authorization (eTA), East Africa Tourist Visa, Diplomatic/Official Visas, and Multiple-Entry Visa guidance for seamless arrival into Kenya.',
        portal: 'etakenya.go.ke & eFNS',
        timeline: '72 Hours (Standard eTA)',
        statutoryNote: 'Mandatory Prior to Boarding · Single & Multiple Entry Options',
        requirements: [
          'Valid passport for at least six (6) months beyond planned date of arrival with at least one blank page',
          'Recent passport-style color photograph or live selfie upload',
          'Confirmed flight booking itinerary (arrival and return/onward ticket)',
          'Proof of accommodation (hotel booking confirmation or host invitation letter with Kenyan ID/Alien Card)',
          'Yellow fever vaccination certificate (if traveling from or transiting through endemic zones)',
        ],
        steps: [
          {
            title: '01. Complete Kenya eTA Application Online',
            detail:
              'Submit traveler bio-data, arrival flight details, and accommodation proof on the official etakenya.go.ke portal at least 3 days before departure.',
          },
          {
            title: '02. Attach Supporting Travel Documents',
            detail:
              'For business visits, include an invitation letter from the Kenyan company and their Certificate of Incorporation.',
          },
          {
            title: '03. Receive Approved PDF Authorization',
            detail:
              'Present the approved eTA document at airline check-in and to border control officers upon arrival at JKIA, Moi International, or land borders.',
          },
        ],
      },
      {
        id: 'permanent-residence',
        name: 'Permanent residence',
        summary:
          'Long-term permanent residency status under Section 37 of the Kenya Citizenship and Immigration Act for qualifying long-term work permit holders, spouses of Kenyan citizens, and former citizens.',
        portal: 'fns.immigration.go.ke (eFNS)',
        timeline: '4 to 9 Months',
        statutoryNote: 'Section 37 Categories A, B, C & D · Interview Required',
        requirements: [
          'Application letter addressed to the Director General of Immigration Services stating category of qualification',
          'Proof of holding valid Kenyan work permits continuously for at least 7 years (and continuous residency for 3 years immediately preceding application) for Category B',
          'Certified marriage certificate and spouse Kenyan ID/Passport (for Category D — Spouses of Kenyan Citizens married for at least 3 years)',
          'Valid Police Clearance Certificate (Good Conduct) and Valid Tax Compliance Certificate from KRA',
          'Proof of contribution to Kenya’s economic or social development',
        ],
        steps: [
          {
            title: '01. Eligibility Audit & Category Verification',
            detail:
              'Confirm residency continuity, work permit history, or marital tenure under Section 37 of the Act.',
          },
          {
            title: '02. Dossier Submission & Biometrics',
            detail:
              'File the online eFNS Permanent Residence form, submit physical certified originals at Nyayo House, and complete security vetting.',
          },
          {
            title: '03. Advisory Committee Interview & Certificate',
            detail:
              'Attend the statutory interview (for spouse/permit categories) and upon approval, pay the issuance fee for the Certificate of Permanent Residence.',
          },
        ],
      },
      {
        id: 'citizenship',
        name: 'Citizenship',
        summary:
          'Acquisition of Kenyan citizenship by registration (marriage, lawful residence of 7+ years, children/adopted dependents), Dual Citizenship declaration, and Regaining Kenyan Citizenship.',
        portal: 'fns.immigration.go.ke (eFNS)',
        timeline: '6 to 12 Months',
        statutoryNote: 'Kenya Citizenship & Immigration Act, 2011 · Constitutional Dual Nationality',
        requirements: [
          'Completed statutory application form on eFNS corresponding to marriage, 7-year lawful residence, or regaining citizenship',
          'Declaration of Dual Citizenship (Form 3) for Kenyan citizens acquiring a second nationality or foreign nationals retaining prior citizenship',
          'Certificate of Good Conduct, KRA Tax Compliance Certificate, and two Kenyan citizen referees',
          'Sworn oath/affirmation of allegiance before a Commissioner for Oaths or Magistrate',
        ],
        steps: [
          {
            title: '01. Statutory Qualification & Referee Endorsement',
            detail:
              'Gather proof of 7 years continuous lawful residence or 7 years valid marriage to a Kenyan citizen, plus endorsements from two Kenyan citizens.',
          },
          {
            title: '02. Online eFNS Filing & Vetting',
            detail:
              'Submit the electronic application, upload notarized affidavits, and attend the Citizenship Advisory Committee interview.',
          },
          {
            title: '03. Oath of Allegiance & Registration Certificate',
            detail:
              'Execute the final Oath of Allegiance and receive the Certificate of Registration as a Kenyan Citizen, enabling Kenyan Passport & ID issuance.',
          },
        ],
      },
      {
        id: 'dependent-passes',
        name: 'Dependent passes',
        summary:
          'Legal residence passes (Form 28) for spouses, children, and qualifying dependent parents/relatives of Kenyan citizens, Permanent Residents, or valid Work Permit holders.',
        portal: 'fns.immigration.go.ke (eFNS)',
        timeline: '3 to 6 Weeks',
        statutoryNote: 'Form 28 · Valid for Duration of Principal Permit',
        requirements: [
          'Completed Form 28 Dependent Pass application signed by the principal applicant (sponsor)',
          'Certified copy of Marriage Certificate (for spouse) or Birth Certificate (for children), translated into English if in another language',
          'Copy of Principal’s valid Kenyan Work Permit, Permanent Residence Certificate, or Kenyan National ID',
          'Proof of sufficient assured income/financial means to maintain the dependents in Kenya',
          'Two recent passport-size photographs and bio-data page of the dependent’s passport',
        ],
        steps: [
          {
            title: '01. Prepare Certified Relationship Documents',
            detail:
              'Ensure foreign marriage or birth certificates are apostilled/authenticated or certified by the issuing embassy.',
          },
          {
            title: '02. File Form 28 under Sponsor eFNS Account',
            detail:
              'Submit the application linked to the principal work permit or citizen sponsor profile and pay the filing fee.',
          },
          {
            title: '03. Issuance, Security Bond & Re-Entry Pass',
            detail:
              'Upon approval, pay the issuance fee, execute the dependent security bond, and endorse the Re-Entry Pass in the dependent’s passport.',
          },
        ],
      },
    ],
  },
  {
    id: 'business-registration',
    name: 'Business & Company Registration',
    shortLabel: 'Business & Company',
    tagline: 'Companies, business names, KRA PIN & foreign branches.',
    editorialHeadline:
      'Incorporate private limited companies, business names, and foreign-owned entities via the Business Registration Service (BRS).',
    description:
      'End-to-end corporate structuring and statutory registration on the eCitizen Business Registration Service (BRS) portal, paired with instant KRA PIN, NSSF, SHIF, and county permit onboarding.',
    agency: 'Business Registration Service (BRS) · Office of the Attorney General',
    heroImage: EDITORIAL_IMAGES.business,
    subCategories: [
      {
        id: 'company-registration',
        name: 'Company registration',
        summary:
          'Incorporation of Private Limited Companies (Ltd), Public Companies (PLC), and Companies Limited by Guarantee on the eCitizen BRS portal with unified CR1, CR2, CR8, and Beneficial Ownership filings.',
        portal: 'brs.ecitizen.go.ke',
        timeline: '3 to 7 Working Days',
        statutoryNote: 'Companies Act, 2015 · Includes Certificate of Incorporation & CR12',
        requirements: [
          '3 to 5 proposed company names in order of preference for name reservation',
          'Nature of business activities, registered physical office address, and postal address in Kenya',
          'National ID / Passport copies and KRA PIN certificates for all directors and shareholders',
          'Passport-size photographs, residential addresses, email addresses, and phone numbers of directors',
          'Shareholding distribution and Beneficial Ownership (BOF1) particulars',
        ],
        steps: [
          {
            title: '01. Name Reservation & Share Structure Design',
            detail:
              'Conduct name search via BRS on eCitizen and structure nominal share capital, director powers, and Articles of Association.',
          },
          {
            title: '02. Execute Statutory Forms (CR1, CR2, CR8, BOF1)',
            detail:
              'Generate and sign the statutory registration forms and Register of Beneficial Owners.',
          },
          {
            title: '03. Certificate of Incorporation & Official CR12',
            detail:
              'Receive the digital Certificate of Incorporation, initial CR12, and integrated statutory registrations (KRA, NSSF, SHIF).',
          },
        ],
      },
      {
        id: 'business-names',
        name: 'Business names',
        summary:
          'Fast-track Sole Proprietorship and Partnership registration (BN2) for entrepreneurs, consultants, and local enterprises operating under a trade name.',
        portal: 'brs.ecitizen.go.ke',
        timeline: '1 to 3 Working Days',
        statutoryNote: 'Registration of Business Names Act · BN2 & BN3 Certificate',
        requirements: [
          'Proposed business trade names for availability search',
          'Copy of Kenyan National ID (or Alien Card for foreign residents) and personal KRA PIN',
          'Passport-size photograph of the proprietor(s) or partners',
          'Plot number, building name, street, county, and P.O. Box of the business premises',
        ],
        steps: [
          {
            title: '01. Name Search & Reservation',
            detail:
              'Submit preferred trade names on the eCitizen BRS portal for registrar clearance.',
          },
          {
            title: '02. Sign Form BN2 & Upload Proprietor Details',
            detail:
              'Download, sign, and re-upload the generated BN2 form with proprietor KRA PIN and ID details.',
          },
          {
            title: '03. Download Certificate of Registration (BN3)',
            detail:
              'Receive your official Certificate of Registration to open a business bank account and apply for county permits.',
          },
        ],
      },
      {
        id: 'kra-pin',
        name: 'KRA PIN',
        summary:
          'Kenya Revenue Authority (KRA) Personal Identification Number registration for newly incorporated companies, foreign directors, non-resident investors, and expatriates.',
        portal: 'itax.kra.go.ke',
        timeline: '1 to 3 Working Days',
        statutoryNote: 'Mandatory for Banking, Contracts, Work Permits & Property',
        requirements: [
          'Certificate of Incorporation and CR12 (for Corporate KRA PIN)',
          'Director KRA PINs (at least one tax-registered director/representative)',
          'Valid Passport, Work Permit / Special Pass / Investor endorsement letter (for Foreign National Individual PIN)',
          'Tax obligation selection (Income Tax Company/Resident, PAYE, VAT where applicable)',
        ],
        steps: [
          {
            title: '01. Taxpayer Profile & Obligation Setup',
            detail:
              'Determine required tax obligations (Corporate Income Tax, VAT, PAYE, or Individual Resident/Non-Resident status).',
          },
          {
            title: '02. iTax Submission & Director Linking',
            detail:
              'File the iTax registration application linking corporate directors or submitting foreign national endorsement documents.',
          },
          {
            title: '03. Issue KRA PIN Certificate & iTax Credentials',
            detail:
              'Receive the official KRA PIN Certificate ready for corporate bank account opening and eTIMS onboarding.',
          },
        ],
      },
      {
        id: 'business-permits',
        name: 'Business permits',
        summary:
          'Unified County Single Business Permits (SBP), Fire Safety Clearance, Health Certificates, and outdoor signage permits across Nairobi City County and all 47 counties.',
        portal: 'nairobiservices.go.ke / County Portals',
        timeline: '2 to 5 Working Days',
        statutoryNote: 'Annual County Trade Licensing · Nairobi & All 47 Counties',
        requirements: [
          'Certificate of Incorporation or Business Name Registration Certificate',
          'Company or Proprietor KRA PIN Certificate',
          'Physical premises details (LR/Plot Number, Building Name, Floor/Suite, Street, Sub-County & Ward)',
          'Number of employees and floor area in square meters for trade tariff classification',
        ],
        steps: [
          {
            title: '01. Activity Code & Premises Assessment',
            detail:
              'Select the accurate county trade code matching your business size and sector on Nairobi Pay or the respective county portal.',
          },
          {
            title: '02. Fire & Public Health Inspection Invoice',
            detail:
              'Generate the unified invoice covering the Single Business Permit and statutory fire safety clearance.',
          },
          {
            title: '03. Permit Issuance & Display',
            detail:
              'Download the QR-verifiable Unified Business Permit for mandatory display at your registered office.',
          },
        ],
      },
      {
        id: 'tax-registration',
        name: 'Tax registration',
        summary:
          'Comprehensive statutory tax onboarding including VAT registration, PAYE employer registration, eTIMS electronic invoicing setup, SHIF, NSSF, and Affordable Housing Levy compliance.',
        portal: 'itax.kra.go.ke & etims.kra.go.ke',
        timeline: '2 to 5 Working Days',
        statutoryNote: 'eTIMS Mandatory for All Deductible Business Expenses',
        requirements: [
          'Company KRA PIN Certificate and Certificate of Incorporation',
          'CR12 dated within the last 6 months',
          'Tax Agent / Director National ID or Alien Card for eTIMS device/software activation',
          'Signed eTIMS commitment form and business contact details',
        ],
        steps: [
          {
            title: '01. Obligation Amendment (VAT / PAYE / MRI)',
            detail:
              'Activate additional tax obligations on iTax based on your revenue threshold and payroll structure.',
          },
          {
            title: '02. eTIMS Onboarding & Integration',
            detail:
              'Register on the KRA eTIMS portal (eTIMS Lite, Client Software, or Online Portal) to issue tax-compliant invoices.',
          },
          {
            title: '03. Statutory Payroll Registrations (NSSF & SHIF)',
            detail:
              'Complete employer registration with NSSF and Social Health Authority (SHA/SHIF) for seamless monthly payroll compliance.',
          },
        ],
      },
      {
        id: 'foreign-owned-businesses',
        name: 'Foreign-owned businesses',
        summary:
          'Registration of 100% foreign-owned Kenyan subsidiaries or Branch Offices of foreign companies (Certificate of Compliance), including nomadic director PINs and KenInvest facilitation.',
        portal: 'brs.ecitizen.go.ke & invest.go.ke',
        timeline: '7 to 14 Working Days',
        statutoryNote: 'Part XXXVII Companies Act · Subsidiary vs Foreign Branch',
        requirements: [
          'Certified and notarized Certificate of Incorporation and Memorandum/Articles of the parent company (for Foreign Branch)',
          'Passports, residential addresses, and notarized details of foreign directors and shareholders',
          'Appointment of a Local Representative resident in Kenya (mandatory for a Foreign Branch under Section 979)',
          'Registered physical office address in Kenya',
        ],
        steps: [
          {
            title: '01. Subsidiary vs Foreign Branch Structuring',
            detail:
              'Advise on tax rates (30% resident subsidiary vs branch taxation) and local representative requirements.',
          },
          {
            title: '02. Document Notarization & BRS Filing',
            detail:
              'Prepare apostilled parent company documents or foreign director declarations and file via eCitizen BRS.',
          },
          {
            title: '03. Certificate of Compliance, KRA PIN & Banking',
            detail:
              'Secure the Certificate of Compliance/Incorporation, obtain non-resident director KRA PINs, and facilitate multi-currency corporate banking.',
          },
        ],
      },
    ],
  },
  {
    id: 'ngo-nonprofit',
    name: 'NGO & Nonprofit Registration',
    shortLabel: 'NGO & Nonprofits',
    tagline: 'PBOs, NGOs, CBOs, foundations & annual compliance.',
    editorialHeadline:
      'Register Public Benefit Organizations (NGOs), Foundations, Trusts, and CBOs in full compliance with the PBO Act.',
    description:
      'Specialized legal and regulatory registration for national and international Non-Governmental Organizations (Public Benefit Organizations), Community-Based Organizations, Charitable Trusts, and Companies Limited by Guarantee.',
    agency: 'Public Benefits Organizations Regulatory Authority (PBORA)',
    heroImage: EDITORIAL_IMAGES.ngo,
    subCategories: [
      {
        id: 'ngo-registration',
        name: 'NGO registration',
        summary:
          'Registration of National Public Benefit Organizations (NGOs) under the Public Benefit Organizations (PBO) Act with the PBORA (formerly NGO Coordination Board).',
        portal: 'pbora.go.ke / eCitizen',
        timeline: '6 to 12 Weeks',
        statutoryNote: 'Public Benefit Organizations Act · National Scope',
        requirements: [
          'Approved Name Reservation from the Public Benefit Organizations Regulatory Authority',
          'Draft NGO Constitution signed by at least three (3) founding board members',
          'Proposed 1-Year Budget and strategic thematic intervention plan',
          'Valid Certificates of Good Conduct (Police Clearance), KRA PINs, IDs/Passports, and CVs of at least 3 officials (Chairman, Secretary, Treasurer)',
          'Two passport-size color photos of each board official and minutes of the founding meeting',
        ],
        steps: [
          {
            title: '01. Name Search & Governance Constitution Drafting',
            detail:
              'Reserve the organization’s name with PBORA and draft a compliant PBO Constitution aligned with your charitable objectives.',
          },
          {
            title: '02. Officials Vetting & Dossier Submission',
            detail:
              'Compile Police Clearances, KRA PINs, CVs, and the 1-year budget for submission to the Authority.',
          },
          {
            title: '03. Security Vetting & Certificate of Registration',
            detail:
              'Track inter-agency vetting and receive the official Certificate of Registration to commence operations and donor fundraising.',
          },
        ],
      },
      {
        id: 'cbo-registration',
        name: 'CBO registration',
        summary:
          'Registration of Community-Based Organizations (CBOs) and Self-Help Groups at the Sub-County Directorate of Social Development for grassroots programs.',
        portal: 'Department of Social Development',
        timeline: '2 to 4 Weeks',
        statutoryNote: 'Community Groups Registration Act, 2022',
        requirements: [
          'CBO Constitution and By-Laws signed by executive committee members',
          'Minutes of the founding community meeting with attendance register (minimum 10 members)',
          'Copies of Kenyan National IDs and KRA PINs of all members and officials',
          'List of committee officials (Chairperson, Vice-Chair, Secretary, Treasurer) with contact details',
        ],
        steps: [
          {
            title: '01. Draft CBO Constitution & Founding Minutes',
            detail:
              'Structure the group’s governance rules, election terms, and community development objectives.',
          },
          {
            title: '02. Sub-County Social Development Review',
            detail:
              'Submit the member register, ID copies, and constitution to the Sub-County Social Development Officer.',
          },
          {
            title: '03. Certificate Issuance & Group Bank Account',
            detail:
              'Obtain the CBO Registration Certificate and KRA PIN to open a multi-signatory bank account.',
          },
        ],
      },
      {
        id: 'foundations',
        name: 'Foundations',
        summary:
          'Establishment of Foundations and Charitable Institutions registered as Companies Limited by Guarantee (under BRS) or Perpetual Charitable Trusts.',
        portal: 'brs.ecitizen.go.ke & Lands Registry',
        timeline: '4 to 8 Weeks',
        statutoryNote: 'Company Limited by Guarantee or Incorporated Trust',
        requirements: [
          'Proposed Foundation name and philanthropic objects (education, healthcare, conservation, relief of poverty)',
          'Details, IDs/Passports, KRA PINs, and Police Clearances of Directors/Trustees',
          'Draft Articles of Association (Non-Profit Guarantee clause) or Trust Deed',
          'Statement of initial endowment or funding sources and 3-year projected program budget',
        ],
        steps: [
          {
            title: '01. Select Legal Vehicle (Guarantee vs Trust)',
            detail:
              'Determine whether a Company Limited by Guarantee or a Registered Perpetual Trust best fits your endowment and governance model.',
          },
          {
            title: '02. Draft Articles / Trust Deed & Vetting',
            detail:
              'Prepare non-distribution clauses required for future KRA Income Tax Exemption and submit for registration.',
          },
          {
            title: '03. Incorporation & Tax Exemption Application',
            detail:
              'Receive incorporation certificates and prepare for KRA Charitable Tax Exemption certification.',
          },
        ],
      },
      {
        id: 'international-ngos',
        name: 'International NGOs',
        summary:
          'Registration of International Non-Governmental Organizations (INGOs) establishing country or regional headquarters in Kenya under the PBO Act.',
        portal: 'pbora.go.ke',
        timeline: '8 to 14 Weeks',
        statutoryNote: 'Requires Kenyan Resident Board Representation (1/3 Rule)',
        requirements: [
          'Notarized Certificate of Registration and Charter/By-Laws from the parent country of origin',
          'Board Resolution from the international headquarters authorizing registration and operations in Kenya',
          'At least one-third (1/3) Kenyan board representation among local country officials',
          'Interpol / Police Clearance Certificates, Passports, CVs, and photographs of foreign directors, plus Good Conduct & KRA PINs for Kenyan officials',
        ],
        steps: [
          {
            title: '01. Parent Charter Authentication & Local Board Setup',
            detail:
              'Verify notarized headquarters documents and constitute the local board meeting the statutory Kenyan representation requirement.',
          },
          {
            title: '02. PBORA International Filing & Vetting',
            detail:
              'Lodge the international registration packet, country budget, and bilateral agreements.',
          },
          {
            title: '03. Country Registration & Class I Work Permits',
            detail:
              'Upon INGO certificate issuance, sponsor expatriate country directors for Class I permits and duty-free privileges.',
          },
        ],
      },
      {
        id: 'compliance',
        name: 'Compliance',
        summary:
          'Annual NGO/PBO Statutory Returns (Form 14), audited financial statement filings, change of officials, constitution amendments, and KRA Tax Exemption renewals.',
        portal: 'pbora.go.ke & itax.kra.go.ke',
        timeline: '5 to 15 Working Days',
        statutoryNote: 'Form 14 Annual Returns Due Within 3 Months of Financial Year-End',
        requirements: [
          'ICPAK-certified Audited Financial Statements for the preceding financial year (for budgets above statutory threshold)',
          'Completed Form 14 Annual Return detailing project expenditure, donor sources, and staff count (local vs expatriate)',
          'Board minutes approving the annual report or changes in board officials',
          'Valid KRA Tax Compliance Certificate and PAYE/Withholding Tax remittance records',
        ],
        steps: [
          {
            title: '01. Financial Audit & Programmatic Reconciliation',
            detail:
              'Align project disbursements, administrative ratios, and donor receipts with PBORA reporting templates.',
          },
          {
            title: '02. Lodge Form 14 & Governance Updates',
            detail:
              'File annual returns, board changes, or address updates to maintain active legal standing.',
          },
          {
            title: '03. Secure PBORA Compliance & Tax Exemption Renewal',
            detail:
              'Obtain official acknowledgement receipts required by international donors and Kenyan commercial banks.',
          },
        ],
      },
    ],
  },
  {
    id: 'government-documents',
    name: 'Government Documents',
    shortLabel: 'Govt Documents',
    tagline: 'Passports, National ID, birth certificates & Good Conduct.',
    editorialHeadline:
      'Fast, accurate procedural guidance for Kenyan Passports, National IDs, Civil Registration, and Police Clearance.',
    description:
      'Step-by-step assistance for citizens and diaspora applicants obtaining or replacing vital civil registration documents, e-Passports, Certificates of Good Conduct (DCI), and National Identity cards.',
    agency: 'Civil Registration Services · Directorate of Immigration · DCI',
    heroImage: EDITORIAL_IMAGES.taxAndDocs,
    subCategories: [
      {
        id: 'passport',
        name: 'Passport',
        summary:
          'New East African Community (EAC) biometric e-Passport applications, renewals, mutilated/lost passport replacements, and diaspora passport processing (34, 50, or 66 pages).',
        portal: 'accounts.ecitizen.go.ke (Immigration)',
        timeline: '10 to 21 Working Days',
        statutoryNote: 'A-Series (34p), B-Series (50p), C-Series (66p) Biometric e-Passport',
        requirements: [
          'Original and copy of Kenyan National ID Card and Birth Certificate',
          'Recommender’s Kenyan National ID copy and signed recommendation section on the eCitizen form',
          'Copies of parents’ National ID cards (or death certificates where applicable)',
          'Old passport (for renewals) or Police Abstract & sworn affidavit (for lost passport replacement)',
          'eCitizen invoice payment receipt and scheduled biometric capture appointment slip',
        ],
        steps: [
          {
            title: '01. Online eCitizen Application & Series Selection',
            detail:
              'Complete the e-Passport application on eCitizen, upload clear PDF scans of civil documents, and pay the government fee.',
          },
          {
            title: '02. Book Biometrics Appointment',
            detail:
              'Select your preferred immigration station (Nyayo House Nairobi, Mombasa, Kisumu, Eldoret, Nakuru, Embu, Kisii, Kericho, or Diaspora Embassy).',
          },
          {
            title: '03. Biometric Capture & Passport Collection',
            detail:
              'Present physical originals for fingerprint/photo capture and track printing status until ready for collection.',
          },
        ],
      },
      {
        id: 'national-id',
        name: 'National ID',
        summary:
          'First-time Maisha Namba / Kenyan National Identity Card applications, duplicate replacements for lost/damaged IDs, and change of particulars (name or marital status).',
        portal: 'National Registration Bureau (NRB) / Huduma Centres',
        timeline: '14 to 30 Working Days',
        statutoryNote: 'Mandatory for All Citizens Aged 18+ · NRB Biometric Registration',
        requirements: [
          'Original Birth Certificate and copy of parents’ Kenyan National ID cards (for first-time applicants)',
          'School leaving certificate, baptismal card, or Chief’s identification letter',
          'Police Abstract and eCitizen replacement fee receipt (for lost/duplicate ID cards)',
          'Deed Poll & Kenya Gazette Notice + Marriage Certificate (for change of name)',
        ],
        steps: [
          {
            title: '01. Document Verification & Chief’s Clearance',
            detail:
              'Verify parentage and birth records (or Police Abstract for replacements) prior to visiting the registration desk.',
          },
          {
            title: '02. Biometric Fingerprint & Photo Capture',
            detail:
              'Complete fingerprint impressions and digital photo capture at a Huduma Centre or NRB Sub-County office.',
          },
          {
            title: '03. Waiting Card Tracking & Collection',
            detail:
              'Use your serial waiting slip to track production and collect your printed National ID card.',
          },
        ],
      },
      {
        id: 'birth-certificates',
        name: 'Birth certificates',
        summary:
          'Current birth registration, Late Birth Registration (after 6 months), re-issuance of lost birth certificates, and foreign birth registration for Kenyan citizens born abroad.',
        portal: 'crs.ecitizen.go.ke (Civil Registration Services)',
        timeline: '5 to 14 Working Days',
        statutoryNote: 'Births and Deaths Registration Act · Required for Passport & Schooling',
        requirements: [
          'Hospital Birth Notification slip (Form B1) and copies of both parents’ National IDs / Passports',
          'Baptismal card, municipal clinic immunization card, and school leaving certificate (for Late Birth Registration)',
          'Foreign birth certificate and parents’ Kenyan passports/IDs (for Kenyan citizens born abroad)',
        ],
        steps: [
          {
            title: '01. Lodge Application on eCitizen CRS Portal',
            detail:
              'Select current or late registration under the Civil Registration Services department on eCitizen.',
          },
          {
            title: '02. Upload Notification & Parent IDs',
            detail:
              'Attach clear scans of the hospital notification or late-registration supporting evidence and pay the statutory fee.',
          },
          {
            title: '03. Registry Verification & Certificate Collection',
            detail:
              'Collect the official security-printed Birth Certificate from the designated Civil Registry or Huduma Centre.',
          },
        ],
      },
      {
        id: 'good-conduct-certificate',
        name: 'Good conduct certificate',
        summary:
          'Directorate of Criminal Investigations (DCI) Police Clearance Certificate (Certificate of Good Conduct) for employment, visa applications, work permits, and NGO board appointments.',
        portal: 'dci.ecitizen.go.ke',
        timeline: '5 to 14 Working Days',
        statutoryNote: 'DCI Forensic Fingerprint Clearance · Valid for 1 Year',
        requirements: [
          'Original Kenyan National ID (for citizens 18+) or Original Passport & Alien/Refugee Card (for foreign residents)',
          'Clear PDF copy of ID/Passport uploaded on the eCitizen DCI portal',
          'Two sets of printed C24 fingerprint forms & payment receipt of KSh 1,050',
          'Certified fingerprint impressions taken at Kenya Embassy/Local Police (for Kenyans in the Diaspora)',
        ],
        steps: [
          {
            title: '01. Apply & Pay on eCitizen DCI Portal',
            detail:
              'Submit the Police Clearance application online, select your fingerprinting center (DCI HQ Kiambu Rd or Huduma Centre), and download Form C24.',
          },
          {
            title: '02. Live Fingerprint Capture',
            detail:
              'Attend your booked appointment with your original ID and duplicate C24 forms for forensic fingerprint capture.',
          },
          {
            title: '03. Download Digital Certificate of Good Conduct',
            detail:
              'Once forensic vetting completes, download the QR-verifiable Police Clearance Certificate directly from your eCitizen account.',
          },
        ],
      },
      {
        id: 'civil-registration',
        name: 'Civil registration',
        summary:
          'Marriage registration (Civil, Customary, Christian, Hindu, Islamic), Certificate of No Impediment to Marriage (Single Status Certificate), and Death Certificate registration.',
        portal: 'oag.ecitizen.go.ke (Registrar of Marriages)',
        timeline: '21 Days Notice (Marriage) / 7–14 Days (Certificates)',
        statutoryNote: 'Marriage Act, 2014 · Sheria House & County Registries',
        requirements: [
          'National IDs or Valid Passports & Birth Certificates of both intended spouses',
          'Certificate of No Impediment to Marriage from home country (for foreign nationals marrying in Kenya)',
          'Sworn affidavits of marital status and passport-size color photos',
          'Copy of existing traditional/religious marriage certificate (for registration/certification of customary marriages)',
        ],
        steps: [
          {
            title: '01. Online Notice of Marriage on eCitizen',
            detail:
              'Lodge the 21-day statutory Notice of Marriage or application for Certificate of No Impediment via the Office of the Attorney General portal.',
          },
          {
            title: '02. In-Person Verification & Interview',
            detail:
              'Both parties present original identification and single-status proofs at Sheria House or the County Registrar of Marriages.',
          },
          {
            title: '03. Solemnization or Certificate Issuance',
            detail:
              'Complete the civil ceremony or collect your certified Marriage Certificate / Certificate of No Impediment.',
          },
        ],
      },
      {
        id: 'document-replacement',
        name: 'Document replacement',
        summary:
          'Fast-track replacement and reconstruction of lost, mutilated, or misspelled government documents including Passports, IDs, Birth Certificates, Title Deeds, and Academic Certificates.',
        portal: 'eCitizen & Issuing Agencies',
        timeline: '7 to 21 Working Days',
        statutoryNote: 'Requires Police Abstract & Commissioner for Oaths Affidavit',
        requirements: [
          'Official Kenya Police Abstract reporting the loss or destruction of the document',
          'Sworn Affidavit of Loss or Correction of Name executed before a Commissioner for Oaths',
          'Copy of the lost document (or serial/entry number) and National ID copy',
          'Kenya Gazette Notice (where required for Deed Poll name changes or lost Title Deeds)',
        ],
        steps: [
          {
            title: '01. Obtain Police Abstract & Sworn Affidavit',
            detail:
              'Record the loss at a police station and prepare a legally compliant affidavit detailing the document particulars.',
          },
          {
            title: '02. File Duplicate / Rectification Request',
            detail:
              'Submit the replacement application on the relevant eCitizen agency portal with supporting archival copies.',
          },
          {
            title: '03. Verification & Re-Issuance',
            detail:
              'Follow through registry verification to obtain your newly issued official replacement certificate.',
          },
        ],
      },
    ],
  },
  {
    id: 'licences-permits',
    name: 'Licences & Permits',
    shortLabel: 'Licences & Permits',
    tagline: 'Business, professional, regulatory & sector permits.',
    editorialHeadline:
      'Secure county trade permits, professional practicing licences, and sector-specific regulatory approvals.',
    description:
      'Navigate Kenya’s multi-agency regulatory landscape—from County Single Business Permits and NEMA Environmental Licences to NCA, EPRA, CBK, CAK, Pharmacy & Poisons Board, and Tourism Regulatory Authority permits.',
    agency: 'County Governments · NEMA · NCA · Sector Regulators',
    heroImage: EDITORIAL_IMAGES.business,
    subCategories: [
      {
        id: 'business-permits-lic',
        name: 'Business permits',
        summary:
          'Unified County Single Business Permits, Liquor Licences, Food Hygiene Licences, and Distribution Permits across all 47 counties in Kenya.',
        portal: 'County Revenue Portals / eCitizen',
        timeline: '2 to 7 Working Days',
        statutoryNote: 'Mandatory Annual Operational Permit for Commercial Premises',
        requirements: [
          'Certificate of Incorporation / Registration and Company KRA PIN',
          'Lease Agreement or Title Deed indicating Plot/LR Number and Ward',
          'Prior year permit copy (for renewals) and fire safety inspection clearance',
        ],
        steps: [
          {
            title: '01. Premises & Trade Code Classification',
            detail:
              'Register the business entity on the county portal and map the accurate tariff code.',
          },
          {
            title: '02. Public Health & Fire Inspection',
            detail:
              'Coordinate county inspection for hospitality, medical, or manufacturing premises.',
          },
          {
            title: '03. Download Annual Unified Business Permit',
            detail:
              'Settle the county invoice via M-Pesa/Bank and print the official QR-coded permit.',
          },
        ],
      },
      {
        id: 'professional-licences',
        name: 'Professional licences',
        summary:
          'Annual practicing certificates and foreign specialist accreditation with Kenyan professional bodies (EBK Engineers, KMPDC Medical, LSK, ICPAK, BORAQS Architects, Nursing & Pharmacy Councils).',
        portal: 'Respective Statutory Professional Boards',
        timeline: '2 to 6 Weeks',
        statutoryNote: 'Prerequisite for Class C & Class D Professional Work Permits',
        requirements: [
          'Certified university degree certificates and academic transcripts',
          'Current practicing licence / Letter of Good Standing from home country regulatory board (for foreign professionals)',
          'Detailed CV and proof of Continuous Professional Development (CPD) points',
          'Passport/National ID copy and KRA PIN certificate',
        ],
        steps: [
          {
            title: '01. Academic & Peer Credential Verification',
            detail:
              'Submit qualifications and home-country Letters of Good Standing to the relevant Kenyan statutory board.',
          },
          {
            title: '02. Temporary or Full Registration Assessment',
            detail:
              'Complete board peer review or temporary foreign practitioner registration required for immigration work permits.',
          },
          {
            title: '03. Issuance of Annual Practicing Certificate',
            detail:
              'Pay the statutory practicing fee and receive your official registration number and practicing licence.',
          },
        ],
      },
      {
        id: 'regulatory-licences',
        name: 'Regulatory licences',
        summary:
          'Cross-cutting statutory clearances including NEMA Environmental Impact Assessment (EIA) Licences, DOSHS Workplace Registration, KEBS Standardization Marks, and ODPC Data Protection Registration.',
        portal: 'nema.go.ke · odpc.go.ke · kebs.org',
        timeline: '1 to 6 Weeks',
        statutoryNote: 'ODPC Data Controller/Processor Registration Mandatory for Digital & HR Entities',
        requirements: [
          'Certificate of Incorporation, CR12, and KRA PIN Certificate',
          'Project Report / EIA Study conducted by a licensed NEMA Lead Expert (for construction/industrial projects)',
          'Data Protection Policy and description of personal data processing activities (for ODPC Registration)',
          'Workplace floor plan and safety audit (for DOSHS registration)',
        ],
        steps: [
          {
            title: '01. Regulatory Gap & Threshold Audit',
            detail:
              'Identify which national regulators (NEMA, ODPC, DOSHS, KEBS) govern your business operations.',
          },
          {
            title: '02. Technical Report & Policy Preparation',
            detail:
              'Prepare EIA project reports, data privacy policies, or product sample submissions.',
          },
          {
            title: '03. Portal Filing & Licence Issuance',
            detail:
              'Submit via the regulator’s portal, pay statutory fees, and download your compliance certificate.',
          },
        ],
      },
      {
        id: 'sector-specific-permits',
        name: 'Sector-specific permits',
        summary:
          'Specialized industry operating licences across Construction (NCA), Energy & Petroleum (EPRA), Telecoms/ICT (CAK), Tourism & Hospitality (TRA), Mining, Healthcare, and Financial Services (CBK/CMA).',
        portal: 'nca.go.ke · epra.go.ke · ca.go.ke · tra.go.ke',
        timeline: '3 to 8 Weeks',
        statutoryNote: 'Sector Clearance Required Before Commercial Launch',
        requirements: [
          'Company incorporation documents, CR12, KRA Tax Compliance Certificate, and audited accounts',
          'Technical director/staff academic and professional practicing certificates (e.g., Engineers/Technicians for NCA & EPRA)',
          'Proof of office premises, equipment ownership/lease, and bank reference letter',
        ],
        steps: [
          {
            title: '01. Category & Class Mapping (e.g. NCA 1 to NCA 8)',
            detail:
              'Determine the exact license tier based on your capital, technical staff credentials, and project value.',
          },
          {
            title: '02. Technical Staff & Equipment Linking',
            detail:
              'Link accredited engineers/specialists and upload equipment logbooks or lease agreements on the regulator portal.',
          },
          {
            title: '03. Committee Approval & Annual Operating Licence',
            detail:
              'Pass regulatory evaluation and receive your official sector operating license.',
          },
        ],
      },
      {
        id: 'renewals',
        name: 'Renewals',
        summary:
          'Proactive annual compliance calendar and renewal management for County Business Permits, NCA Annual Practicing Licences, TRA Licences, Work Permits, and ODPC certificates.',
        portal: 'eCitizen & County Portals',
        timeline: '1 to 10 Working Days',
        statutoryNote: 'Avoid Late Penalties (Typically March 31st Deadline for County Permits)',
        requirements: [
          'Copy of expiring license or permit',
          'Updated KRA Tax Compliance Certificate (TCC) and current CR12',
          'Proof of Continuous Professional Development (CPD) or annual return filing where applicable',
        ],
        steps: [
          {
            title: '01. Pre-Expiry Compliance Check',
            detail:
              'Verify that KRA Tax Compliance and corporate records are up to date 30 days prior to license expiration.',
          },
          {
            title: '02. Generate Renewal Invoice & Submit Updates',
            detail:
              'File the renewal application online and settle county or regulatory levies before penalty deadlines.',
          },
          {
            title: '03. Issue Renewed Annual Certificate',
            detail:
              'Deliver the renewed digital and physical certificates for uninterrupted business operations.',
          },
        ],
      },
    ],
  },
  {
    id: 'tax-compliance',
    name: 'Tax & Compliance',
    shortLabel: 'Tax & Compliance',
    tagline: 'KRA services, PIN registration, returns & TCC.',
    editorialHeadline:
      'Maintain spotless KRA iTax standing, eTIMS integration, monthly returns, and Tax Compliance Certificates.',
    description:
      'Practical tax advisory and iTax execution for individuals, SMEs, NGOs, and multinational subsidiaries in Kenya—covering KRA PINs, monthly VAT/PAYE/Withholding filings, eTIMS onboarding, and Tax Compliance Certificates.',
    agency: 'Kenya Revenue Authority (KRA) · iTax & eTIMS',
    heroImage: EDITORIAL_IMAGES.taxAndDocs,
    subCategories: [
      {
        id: 'kra-services',
        name: 'KRA services',
        summary:
          'End-to-end iTax profile management including KRA email/phone updates, PIN migration, tax obligation amendments, eTIMS invoicing setup, and KRA station audits/objections.',
        portal: 'itax.kra.go.ke',
        timeline: '1 to 5 Working Days',
        statutoryNote: 'Integrated iTax & eTIMS Tax Administration',
        requirements: [
          'Existing KRA PIN number and identification documents (National ID, Alien Card, or Certificate of Incorporation)',
          'CR12 and director ID copies (for corporate profile amendments)',
          'Supporting letters and reconciliations for obligation removal or ledger cleanup',
        ],
        steps: [
          {
            title: '01. iTax Ledger & Profile Diagnostic',
            detail:
              'Review your iTax general ledger to identify dormant obligations, unallocated payments, or outdated contact details.',
          },
          {
            title: '02. Lodge Amendment / eTIMS Application',
            detail:
              'Submit online profile amendments or eTIMS integration requests with KRA station officers.',
          },
          {
            title: '03. Confirmation & Updated PIN Profile',
            detail:
              'Receive updated KRA PIN certificates and verified active eTIMS status.',
          },
        ],
      },
      {
        id: 'tax-compliance-sub',
        name: 'Tax compliance',
        summary:
          'Ongoing monthly and annual statutory tax compliance management—ensuring timely remittance of PAYE, SHIF, NSSF, Housing Levy, VAT (by the 20th), and Corporate Income Tax.',
        portal: 'itax.kra.go.ke',
        timeline: 'Monthly (9th & 20th Deadlines)',
        statutoryNote: 'PAYE/Housing Levy Due 9th · VAT/Withholding/MRI Due 20th',
        requirements: [
          'Monthly payroll summary (salaries, NSSF, SHIF, Housing Levy deductions)',
          'eTIMS sales invoices and supplier eTIMS purchase invoices for VAT reconciliation',
          'Audited financial statements for annual Corporate Income Tax (IT2C) filing',
        ],
        steps: [
          {
            title: '01. Monthly Bookkeeping & eTIMS Validation',
            detail:
              'Reconcile sales and ensure all business expenses are supported by valid eTIMS invoices.',
          },
          {
            title: '02. Prepare & Upload iTax Returns',
            detail:
              'Generate and validate Excel/CSV iTax return sheets for PAYE, VAT, or Monthly Rental Income before statutory cutoffs.',
          },
          {
            title: '03. Generate Payment Registration Slips (PRN)',
            detail:
              'Issue KRA PRN slips for instant settlement via M-Pesa or RTGS/EFT banking.',
          },
        ],
      },
      {
        id: 'pin-registration',
        name: 'PIN registration',
        summary:
          'Specialized KRA PIN registration for Kenyan citizens, foreign residents (Alien Card/Work Permit holders), non-resident foreign directors, diplomats, and newly formed entities.',
        portal: 'itax.kra.go.ke',
        timeline: '1 to 3 Working Days',
        statutoryNote: 'Required for All Financial, Land & Corporate Transactions',
        requirements: [
          'Kenyan National ID (for citizens) or Passport + Work Permit/Special Pass/Investor Endorsement (for foreigners)',
          'Certificate of Incorporation/Compliance and CR12 (for companies, branches, and NGOs)',
          'Active email address and Kenyan mobile phone number',
        ],
        steps: [
          {
            title: '01. Eligibility & Obligation Selection',
            detail:
              'Choose the correct residency classification and initial tax obligations to avoid erroneous automatic assessments.',
          },
          {
            title: '02. iTax Portal Submission & Verification',
            detail:
              'Submit bio-data and supporting immigration/incorporation documents for KRA approval.',
          },
          {
            title: '03. Download Official KRA PIN Certificate',
            detail:
              'Deliver the KRA PIN Certificate and configure your iTax password for immediate use.',
          },
        ],
      },
      {
        id: 'tax-returns',
        name: 'Tax returns',
        summary:
          'Accurate preparation and filing of Individual Income Tax Returns (IT1), Corporate Tax Returns (IT2C), Partnership Returns (IT2P), Nil Returns, and Capital Gains Tax (CGT).',
        portal: 'itax.kra.go.ke',
        timeline: '1 to 5 Working Days (Annual Deadline: June 30)',
        statutoryNote: 'Individual & December Year-End Corporate Returns Due by June 30th',
        requirements: [
          'P9A Tax Deduction Card from employer (for employment income returns)',
          'Withholding Tax certificates and business income/expense summaries',
          'Signed Audited Financial Statements and Trial Balance (for Corporate IT2C returns)',
        ],
        steps: [
          {
            title: '01. Income & Tax Credit Computation',
            detail:
              'Consolidate employment P9 forms, withholding certificates, insurance/mortgage reliefs, and audited accounts.',
          },
          {
            title: '02. iTax Return Filing',
            detail:
              'Complete the IT1 or IT2C return schedules accurately on iTax and upload supporting annexures.',
          },
          {
            title: '03. Filing Receipt & Balance Clearance',
            detail:
              'Generate the official KRA e-Return Acknowledgement Receipt and PRN for any balance due.',
          },
        ],
      },
      {
        id: 'compliance-certificates',
        name: 'Compliance certificates',
        summary:
          'Application for and renewal of KRA Tax Compliance Certificates (TCC), plus resolution of historical penalties, waivers, and ledger discrepancies blocking TCC approval.',
        portal: 'itax.kra.go.ke',
        timeline: '1 to 5 Working Days',
        statutoryNote: 'Valid for 12 Months · Mandatory for Tenders, Work Permits & Licensing',
        requirements: [
          'KRA PIN and iTax login credentials',
          'All due periodic tax returns filed up to date with no outstanding unremitted principal tax',
          'Payment receipts or amnesty/objection filings for any disputed historical assessments',
        ],
        steps: [
          {
            title: '01. Ledger Compliance Health Check',
            detail:
              'Verify that all registered tax obligations have zero missing returns or unpaid principal liabilities.',
          },
          {
            title: '02. Resolve Flags & Submit TCC Application',
            detail:
              'File any pending returns, reconcile unallocated payments, and lodge the TCC application on iTax.',
          },
          {
            title: '03. Download Verifiable KRA TCC',
            detail:
              'Obtain the official QR-verifiable Tax Compliance Certificate valid for 12 months.',
          },
        ],
      },
    ],
  },
  {
    id: 'investment-relocation',
    name: 'Investment & Relocation',
    shortLabel: 'Investment & Relocation',
    tagline: 'KenInvest, foreign investment & relocating to Kenya.',
    editorialHeadline:
      'Turnkey relocation, KenInvest investment certificates, and expatriate onboarding in Kenya.',
    description:
      'Strategic advisory for international investors, multinational executives, digital nomads, and diaspora families relocating to or expanding capital investments into Kenya.',
    agency: 'Kenya Investment Authority (KenInvest) · Immigration · Lands',
    heroImage: EDITORIAL_IMAGES.business,
    subCategories: [
      {
        id: 'investor-services',
        name: 'Investor services',
        summary:
          'Kenya Investment Authority (KenInvest) Investment Certificate facilitation (minimum USD 100,000 for foreign investors), granting automatic Class G/D permit quotas and fast-tracked regulatory licensing.',
        portal: 'invest.go.ke',
        timeline: '10 to 21 Working Days',
        statutoryNote: 'Investment Promotion Act · USD 100,000 Minimum Foreign Investment Threshold',
        requirements: [
          'Kenyan Certificate of Incorporation (or Certificate of Compliance) and CR12',
          'Comprehensive Business Plan / Feasibility Study detailing capital outlay, job creation for Kenyans, and technology transfer',
          'Proof of USD 100,000+ investment capital (bank transfer swift advices, Kenyan bank statement, or imported machinery customs entries)',
          'KRA PIN Certificate and environmental/sector pre-clearances',
        ],
        steps: [
          {
            title: '01. Capital Structuring & Business Plan Preparation',
            detail:
              'Document your USD 100,000+ capital injection or equipment importation to meet Investment Promotion Act criteria.',
          },
          {
            title: '02. KenInvest One-Stop Centre Submission',
            detail:
              'Lodge the Investment Certificate application and undergo site/dossier verification with KenInvest officers.',
          },
          {
            title: '03. Investment Certificate & Permit Quota Allocation',
            detail:
              'Receive the Investment Certificate unlocking up to 3 Class G/D permits and 3 Class C/E permits plus consolidated licenses.',
          },
        ],
      },
      {
        id: 'foreign-investment',
        name: 'Foreign investment',
        summary:
          'Structuring foreign direct investment (FDI) into Kenya, Export Processing Zones (EPZ), Special Economic Zones (SEZ), joint ventures, and capital repatriation protection.',
        portal: 'invest.go.ke · epzakenya.com · sezauthority.go.ke',
        timeline: '2 to 6 Weeks',
        statutoryNote: '10-Year Corporate Tax Holiday Option under EPZ / Preferential SEZ Rates',
        requirements: [
          'Parent company corporate profile, audited financials, and board investment resolution',
          'Target sector analysis (Manufacturing, Agribusiness, ICT/BPO, Renewable Energy, Real Estate, Finance)',
          'Draft Shareholders Agreement or Joint Venture Memorandum',
        ],
        steps: [
          {
            title: '01. SEZ / EPZ vs Mainland Tax & Incentive Comparison',
            detail:
              'Evaluate 10% SEZ corporate tax rates, EPZ 10-year tax holidays, and VAT/customs duty exemptions on plant machinery.',
          },
          {
            title: '02. Entity Incorporation & Zone Licensing',
            detail:
              'Register the special-purpose vehicle and secure EPZA or SEZA enterprise licenses.',
          },
          {
            title: '03. Central Bank & Commercial Banking Onboarding',
            detail:
              'Document foreign capital inflows through authorized dealer banks to guarantee smooth future dividend repatriation.',
          },
        ],
      },
      {
        id: 'relocating-to-kenya',
        name: 'Relocating to Kenya',
        summary:
          'End-to-end relocation playbook for individuals, retirees (Class K Permit), remote professionals, and returning diaspora moving household goods, pets, and vehicles to Kenya.',
        portal: 'eFNS & KRA Customs',
        timeline: '4 to 8 Weeks Pre-Arrival',
        statutoryNote: 'Returning Residents & First-Arrival Work Permit Duty-Free Household Goods Exemption',
        requirements: [
          'Valid Passport and approved Work Permit / Class K Residence Permit / Returning Kenyan Citizen proof',
          'Detailed packing list and Bill of Lading / Air Waybill for personal household effects',
          'Original logbook and proof of 12+ months ownership in left-to-right drive configuration (for duty-free returning resident vehicle import)',
        ],
        steps: [
          {
            title: '01. Immigration & Residency Clearance',
            detail:
              'Secure the appropriate entry visa, Class K/G/D permit, or dual citizenship endorsement prior to shipping effects.',
          },
          {
            title: '02. KRA Customs Duty Exemption Filing',
            detail:
              'Apply for Returning Resident or First-Arrival Work Permit holder customs duty exemption on personal household goods.',
          },
          {
            title: '03. Local Settlement (Banking, SIM, Housing & Schools)',
            detail:
              'Set up KRA PIN, local & USD bank accounts, M-Pesa, residential leases, and Student/Dependent Passes for children.',
          },
        ],
      },
      {
        id: 'expatriate-services',
        name: 'Expatriate services',
        summary:
          'Concierge immigration and compliance management for corporate expatriate teams—covering Special Passes, Class D Permits, Alien Cards, Re-Entry Passes, Kenyan Understudy programs, and expatriate PAYE tax.',
        portal: 'fns.immigration.go.ke & itax.kra.go.ke',
        timeline: 'Ongoing Corporate SLA',
        statutoryNote: 'Full Expatriate Lifecycle from Arrival to Permit Renewal & Cancellation',
        requirements: [
          'Corporate HR roster of foreign staff, permit expiry dates, and Kenyan understudy pairings',
          'Expatriate employment contracts, academic credentials, and professional body clearances',
        ],
        steps: [
          {
            title: '01. Pre-Hire Immigration & Regulatory Feasibility',
            detail:
              'Assess professional board clearance requirements (e.g., EBK, ICPAK, KMPDC) before onboarding international hires.',
          },
          {
            title: '02. Permit, Alien Card & Dependent Processing',
            detail:
              'Manage eFNS submissions, Nyayo House biometrics, security bonds, and family dependent passes.',
          },
          {
            title: '03. Renewal Tracking & Exit De-Registration',
            detail:
              'Track 90-day renewal windows and execute formal permit cancellation & tax clearance upon assignment completion.',
          },
        ],
      },
      {
        id: 'property-business-setup',
        name: 'Property/business setup',
        summary:
          'Commercial office acquisition, Ardhisasa land searches, long-term leasehold structuring for foreign investors, commercial lease registration, and turnkey office compliance.',
        portal: 'ardhisasa.lands.go.ke & BRS',
        timeline: '2 to 6 Weeks',
        statutoryNote: 'Constitutional Article 65: Foreign Nationals May Hold Leasehold Land up to 99 Years',
        requirements: [
          'Title Deed copy and seller/landlord details for official Ardhisasa/Registry search',
          'Purchaser or Tenant Company Certificate of Incorporation, CR12, and KRA PINs',
          'Commercial Lease Heads of Terms or Sale Agreement',
        ],
        steps: [
          {
            title: '01. Official Land Search & Zoning Due Diligence',
            detail:
              'Conduct Ardhisasa and county registry searches to verify title authenticity, leasehold tenure (up to 99 years for non-citizens), and encumbrances.',
          },
          {
            title: '02. Lease / Conveyance Drafting & Stamping',
            detail:
              'Draft commercial leases or transfer instruments, assess Stamp Duty on iTax/Ardhisasa, and register the interest.',
          },
          {
            title: '03. Utility, County & Workplace Activation',
            detail:
              'Complete KPLC, water, fiber internet, and County Single Business Permit registration for the new premises.',
          },
        ],
      },
    ],
  },
  {
    id: 'government-services',
    name: 'Government Services',
    shortLabel: 'Government Services',
    tagline: 'eCitizen, NCA, government portals & procedures.',
    editorialHeadline:
      'Master Kenya’s digital government portals—eCitizen, NCA, Ardhisasa, NTSA TIMS, and official application procedures.',
    description:
      'Clear, practical assistance across all Kenyan government digital platforms—resolving account lockouts, mobile number updates, multi-agency online applications, NCA contractor grading, and NTSA motor vehicle services.',
    agency: 'eCitizen Single Sign-On · NCA · NTSA · Ardhisasa',
    heroImage: EDITORIAL_IMAGES.taxAndDocs,
    subCategories: [
      {
        id: 'ecitizen-services',
        name: 'eCitizen services',
        summary:
          'eCitizen Single Sign-On (SSO) account registration for Kenyan citizens, foreign residents, diplomats, and visitors, plus phone/email recovery and multi-agency service navigation.',
        portal: 'accounts.ecitizen.go.ke',
        timeline: 'Same Day to 3 Working Days',
        statutoryNote: 'Gateway to Over 16,000+ Kenyan Government Services',
        requirements: [
          'Kenyan National ID number (for Citizen accounts) or Alien ID number (for Foreign Resident accounts)',
          'Passport number and active email address (for Visitor/Foreigner accounts)',
          'Active mobile number for OTP verification and digital passport photo',
        ],
        steps: [
          {
            title: '01. Account Type Selection & Identity Validation',
            detail:
              'Register or recover your Citizen, Foreign Resident, or Visitor eCitizen Single Sign-On profile.',
          },
          {
            title: '02. Link Corporate Entities & Agency Dashboards',
            detail:
              'Connect your BRS companies, Immigration eFNS, DCI, NTSA, and Civil Registration dashboards under one profile.',
          },
          {
            title: '03. Payment Reconciliation & Receipt Retrieval',
            detail:
              'Verify Government Paybill (222222) M-Pesa/Card transactions and download official invoices and outputs.',
          },
        ],
      },
      {
        id: 'nca-government-services',
        name: 'NCA/other government services',
        summary:
          'National Construction Authority (NCA) contractor registration (NCA 1 to NCA 8), project registration, foreign contractor accreditation, plus NTSA, AGPO, and IFMIS supplier registration.',
        portal: 'nca.go.ke · ntsa.ecitizen.go.ke · agpo.go.ke',
        timeline: '5 to 15 Working Days',
        statutoryNote: 'NCA Registration Mandatory for All Building, Civil, Electrical & Mechanical Contractors',
        requirements: [
          'Certificate of Incorporation, CR12, and valid KRA Tax Compliance Certificate',
          'Technical Director / Accredited Engineer academic certificates, CV, and EBK/BORAQS practicing licence',
          'Bank reference letter, audited accounts (for higher NCA grades), and office Single Business Permit',
        ],
        steps: [
          {
            title: '01. Contractor Category & Grade Selection',
            detail:
              'Select Building Works, Civil Engineering, Electrical, or Mechanical services and match qualification points for NCA 1–8.',
          },
          {
            title: '02. Portal Filing & Technical Personnel Linking',
            detail:
              'Upload corporate documents and link accredited technical supervisors on the NCA portal.',
          },
          {
            title: '03. Certificate of Registration & Annual Practising Licence',
            detail:
              'Pay statutoryNCA fees and download your Contractor Certificate of Registration and Annual Practicing License.',
          },
        ],
      },
      {
        id: 'online-applications',
        name: 'Online applications',
        summary:
          'Guided execution of complex government online filings including NTSA Foreign Driving Licence Conversion, Logbook Transfers, Ardhisasa Land Registration, and AGPO Youth/Women/PWD Certificates.',
        portal: 'eCitizen · Ardhisasa · NTSA',
        timeline: '2 to 10 Working Days',
        statutoryNote: 'Error-Free Digital Submissions with Proper Document Formatting',
        requirements: [
          'Applicant eCitizen / Ardhisasa login credentials and valid identification',
          'Original foreign driving licence + valid Work Permit/Pass (for NTSA Driving Licence Conversion)',
          'Scanned PDF supporting documents meeting portal size and resolution specifications',
        ],
        steps: [
          {
            title: '01. Pre-Submission Document Formatting',
            detail:
              'Compress, certify, and verify all required annexures so applications are not rejected for illegible uploads.',
          },
          {
            title: '02. Online Portal Submission & Fee Payment',
            detail:
              'Complete digital forms accurately and process official Paybill 222222 payments.',
          },
          {
            title: '03. Biometrics / Inspection Booking & Output Delivery',
            detail:
              'Schedule any required physical verification and retrieve the final government certificate.',
          },
        ],
      },
      {
        id: 'government-portals',
        name: 'Government portals',
        summary:
          'Centralized directory and troubleshooting across Kenya’s primary digital registries: eFNS (Immigration), BRS (Companies), iTax & eTIMS (KRA), Ardhisasa (Lands), PBORA (NGOs), and Nairobi Pay.',
        portal: 'Multi-Portal Advisory',
        timeline: 'Instant Advisory & Resolution',
        statutoryNote: 'Synchronizing Data Across KRA, BRS, Immigration & Lands Registries',
        requirements: [
          'Details of the target government portal and any error codes or stalled application reference numbers',
          'Identification and corporate registration documents for cross-registry verification',
        ],
        steps: [
          {
            title: '01. Cross-Portal Data Audit',
            detail:
              'Identify mismatches between BRS CR12 records, KRA iTax director PINs, and eCitizen SSO profiles.',
          },
          {
            title: '02. Registry Escalation & Data Synchronization',
            detail:
              'Lodge formal correction tickets or registry link requests with the relevant government desk.',
          },
          {
            title: '03. Verified Active Portal Access',
            detail:
              'Restore full transactional capability across all linked government portals.',
          },
        ],
      },
      {
        id: 'application-procedures',
        name: 'Application procedures',
        summary:
          'Verified step-by-step procedural blueprints, official fee schedules, statutory form templates, and pre-filing checklists for Kenyan regulatory and civic processes.',
        portal: 'Serikali Guide Knowledge Base',
        timeline: 'Updated for 2026 Regulations',
        statutoryNote: 'Transparent Statutory Fees, Timelines & Legal Citations',
        requirements: [
          'Selection of your specific immigration, corporate, tax, or civil registration goal',
          'Review of applicant nationality, residency status, and entity structure',
        ],
        steps: [
          {
            title: '01. Consult Verified Procedural Guide',
            detail:
              'Read our step-by-step regulatory breakdown detailing exact forms, statutory fees, and realistic timelines.',
          },
          {
            title: '02. Run Pre-Filing Document Checklist',
            detail:
              'Ensure every affidavit, police clearance, and tax certificate is current before lodging online.',
          },
          {
            title: '03. Self-File with Confidence or Book Assisted Filing',
            detail:
              'Complete the process independently using our guide or book a free consultation with our specialists.',
          },
        ],
      },
    ],
  },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-kenya-work-permits-2026',
    slug: 'complete-guide-kenya-work-permits-class-d-g-k-efns',
    title: 'The Complete 2026 Guide to Kenya Work Permits (Class D, G & K) on the eFNS Portal',
    subtitle:
      'Everything expatriates, HR directors, and foreign investors need to know about Form 25, Kenyan understudy rules, capital proof, and processing timelines at Nyayo House.',
    excerpt:
      'Applying for a Kenyan Work Permit requires strict compliance with the Kenya Citizenship and Immigration Act. Learn how to choose between Class D, Class G, and Class K permits, prepare Kenyan understudy documents, and avoid common eFNS rejections.',
    categoryId: 'immigration-visas',
    categoryName: 'Immigration & Visas',
    subCategoryName: 'Work permits',
    author: 'Adv. Wanjiku Mwangi',
    authorRole: 'Lead Immigration & Regulatory Counsel',
    publishedDate: 'October 2026',
    readTime: '8 min read',
    image: EDITORIAL_IMAGES.immigration,
    isTopStory: true,
    isFeatured: true,
    keywords: [
      'work permit',
      'class d',
      'class g',
      'class k',
      'efns',
      'immigration',
      'visa',
      'expatriate',
      'nyayo house',
      'understudy',
      'investor permit',
    ],
    keyTakeaways: [
      'Class D (Employment) permits require a qualified Kenyan understudy with a signed training plan and certified academic credentials.',
      'Class G (Investor/Consultancy) permits require documentary proof of at least USD 100,000 in capital investment in a Kenyan bank account or audited assets.',
      'Class K (Ordinary Residents) is tailored for retirees and financially independent individuals aged 35+ with an assured annual income of at least USD 24,000.',
      'All approved work permits must be endorsed, backed by a security bond, and followed by Alien Card registration within 90 days.',
    ],
    officialPortal: 'fns.immigration.go.ke (eFNS)',
    sections: [
      {
        heading: '1. Understanding Kenya’s Work Permit Classification System',
        paragraphs: [
          'Under the Kenya Citizenship and Immigration Act, 2011, no foreign national may engage in employment, trade, profession, or voluntary work in Kenya without a valid Work Permit or Special Pass issued by the Directorate of Immigration Services. Selecting the wrong permit class is the single most common reason applications are deferred or rejected by the Permit Determination Committee.',
          'The three most frequently requested categories are Class D (for skilled employment where comparable skills are scarce locally), Class G (for specific trade, business, or consultancy investors), and Class K (for ordinary residents aged 35 and above deriving assured income from outside employment).',
        ],
        checklist: [
          'Class D — Skilled Employment: Sponsored by a Kenyan employer or NGO; requires a designated Kenyan Understudy.',
          'Class G — Investor / Specific Trade: Requires USD 100,000 minimum capital proof, Certificate of Incorporation, CR12, and KRA Tax Compliance.',
          'Class K — Ordinary Resident: Applicants aged 35+ with USD 24,000+ assured annual income; prohibits taking up salaried employment.',
          'Class I — Approved Religious or Charitable Activities: For missionaries and international PBO personnel.',
        ],
      },
      {
        heading: '2. Mandatory Form 25 Dossier & Kenyan Understudy Compliance',
        paragraphs: [
          'Every work permit application is initiated online through the Electronic Foreign Nationals Services (eFNS) portal using statutory Form 25. For Class D applications, the Directorate strictly scrutinizes the Kenyan Understudy package to verify that a Kenyan citizen is genuinely being trained to assume the role over time.',
          'Your cover letter must clearly articulate why the expatriate’s specialized experience is necessary, detail the knowledge-transfer schedule, and attach the understudy’s CV, certified academic certificates, KRA PIN, National ID, and employment contract.',
        ],
        callout:
          'Pro Tip: Ensure all foreign academic degrees not in English are translated by an accredited translator or embassy before uploading to eFNS.',
      },
      {
        heading: '3. From Committee Approval to Alien Card Registration',
        paragraphs: [
          'Once the Permit Determination Committee approves the application and issues an official Notification of Approval on eFNS, the applicant has 90 days to pay the statutory annual issuance fee and execute an Immigration Security Bond (typically KSh 100,000 via an insurance company or bank guarantee).',
          'Immediately after the permit is endorsed, the foreign national must book biometrics on eFNS to register for a Foreign National Certificate (Alien Card), which is mandatory for opening personal bank accounts, registering a KRA PIN, and domestic travel clearances.',
        ],
      },
    ],
  },
  {
    id: 'blog-company-registration-brs-kenya',
    slug: 'how-to-register-company-in-kenya-brs-ecitizen-foreign-local',
    title: 'How to Register a Private Limited Company or Foreign Branch in Kenya via eCitizen BRS',
    subtitle:
      'A step-by-step walkthrough of name reservation, CR1/CR2/CR8 forms, Beneficial Ownership (BOF1), KRA PIN issuance, and 100% foreign-owned subsidiary rules.',
    excerpt:
      'Kenya allows 100% foreign ownership of private limited companies across almost all sectors. Discover how the Business Registration Service (BRS) on eCitizen streamlines incorporation, CR12 issuance, and KRA tax onboarding.',
    categoryId: 'business-registration',
    categoryName: 'Business & Company Registration',
    subCategoryName: 'Company registration',
    author: 'CPA David Ochieng',
    authorRole: 'Corporate Structuring & Tax Partner',
    publishedDate: 'October 2026',
    readTime: '7 min read',
    image: EDITORIAL_IMAGES.business,
    isTopStory: true,
    isFeatured: true,
    keywords: [
      'company registration',
      'business registration',
      'brs',
      'ecitizen',
      'cr12',
      'foreign owned business',
      'kra pin',
      'beneficial ownership',
      'incorporation',
    ],
    keyTakeaways: [
      'Foreign nationals can own 100% of shares in a Kenyan Private Limited Company without requiring a local Kenyan shareholder in most sectors.',
      'The BRS portal automatically generates Form CR1, CR2 (Memorandum), CR8 (Directors’ Residential Address), and BOF1 (Beneficial Ownership).',
      'Foreign Branches (Certificate of Compliance) require a Kenyan-resident Local Representative under Section 979 of the Companies Act.',
      'After incorporation, companies must activate their KRA PIN on iTax and onboard onto eTIMS to issue tax-compliant invoices.',
    ],
    officialPortal: 'brs.ecitizen.go.ke',
    sections: [
      {
        heading: '1. Subsidiary vs. Foreign Branch: Choosing the Right Entity',
        paragraphs: [
          'International founders expanding into Nairobi generally choose between incorporating a new Kenyan Private Limited Company (Subsidiary) or registering a Branch of an existing foreign company (Certificate of Compliance).',
          'A local Subsidiary is treated as a Kenyan tax resident (30% corporate income tax rate) and enjoys limited liability distinct from the parent entity. A Foreign Branch operates as an extension of the overseas headquarters and must appoint a formal Local Representative resident in Kenya.',
        ],
        checklist: [
          'Private Limited Company (Ltd): Minimum 1 director, 1 shareholder; 100% foreign ownership permitted.',
          'Business Name (Sole Proprietorship / Partnership): Ideal for local traders and consultants; no separate legal personality.',
          'Foreign Company Branch: Issued with a Certificate of Compliance; requires notarized parent company charter.',
        ],
      },
      {
        heading: '2. Step-by-Step BRS Incorporation on eCitizen',
        paragraphs: [
          'The entire registration workflow takes place on the Business Registration Service (BRS) module within eCitizen. Applicants submit 3 to 5 proposed company names, declare nominal share capital (commonly KSh 100,000 divided into 1,000 shares of KSh 100 each to minimize initial stamp duty), and enter director/shareholder details.',
          'Once the system generates forms CR1, CR2, CR8, the Statement of Nominal Capital, and BOF1 (Beneficial Ownership Register), all directors and subscribers sign the documents before uploading the executed PDFs for final registrar review.',
        ],
      },
      {
        heading: '3. Post-Incorporation Compliance: KRA PIN, eTIMS, NSSF & SHIF',
        paragraphs: [
          'Upon issuance of your Certificate of Incorporation and initial CR12, your company must complete KRA Corporate PIN registration, register as an employer with NSSF and the Social Health Authority (SHIF), and obtain a County Single Business Permit before opening doors.',
        ],
      },
    ],
  },
  {
    id: 'blog-ngo-pbo-registration-guide',
    slug: 'registering-ngo-pbo-foundation-in-kenya-complete-guide',
    title: 'Registering an NGO, Foundation, or International Non-Profit under Kenya’s PBO Act',
    subtitle:
      'Understand the transition to the Public Benefit Organizations (PBO) Act, board vetting requirements, Form 14 annual returns, and charitable tax exemptions.',
    excerpt:
      'With the operationalization of the Public Benefit Organizations (PBO) Act, registering and maintaining an NGO or International Foundation in Kenya follows new governance and tax benefit standards. Here is the complete regulatory roadmap.',
    categoryId: 'ngo-nonprofit',
    categoryName: 'NGO & Nonprofit Registration',
    subCategoryName: 'NGO registration',
    author: 'Adv. Amina Hassan',
    authorRole: 'Non-Profit & International Development Specialist',
    publishedDate: 'September 2026',
    readTime: '9 min read',
    image: EDITORIAL_IMAGES.ngo,
    isTopStory: true,
    isFeatured: true,
    keywords: [
      'ngo registration',
      'pbo act',
      'nonprofit',
      'foundation',
      'cbo',
      'international ngo',
      'pbora',
      'form 14',
      'charity',
    ],
    keyTakeaways: [
      'All NGOs are now regulated as Public Benefit Organizations (PBOs) by the Public Benefits Organizations Regulatory Authority (PBORA).',
      'International PBOs must ensure at least one-third (1/3) of their local board directors are Kenyan citizens resident in Kenya.',
      'Founding officials must submit valid Police Clearance Certificates (Good Conduct), KRA PINs, CVs, and a 1-year operational budget.',
      'Registered PBOs qualify to apply for KRA Income Tax Exemption and duty/VAT privileges on donor-funded project equipment.',
    ],
    officialPortal: 'pbora.go.ke',
    sections: [
      {
        heading: '1. PBO (NGO) vs. Company Limited by Guarantee vs. CBO',
        paragraphs: [
          'Before filing paperwork, philanthropic founders should align their legal structure with their geographic reach and funding model. A Community-Based Organization (CBO) is registered at the Sub-County level for grassroots initiatives within a single county.',
          'A National or International PBO (NGO) is registered with PBORA for multi-county or nationwide development programs, while a Foundation structured as a Company Limited by Guarantee is ideal for grant-making endowments, research institutes, and social enterprises.',
        ],
      },
      {
        heading: '2. Statutory Requirements for National & International NGOs',
        paragraphs: [
          'After reserving your organization’s name with PBORA, you must submit a signed PBO Constitution, minutes of the founding board meeting, a 1-year itemized budget showing program vs. administrative ratios, and full vetting dossiers for at least three founding officers (Chairperson, Secretary, and Treasurer).',
          'For International NGOs, you must also attach notarized copies of the overseas parent registration certificate, charter, and a board resolution authorizing the opening of the Kenyan country office.',
        ],
        checklist: [
          'Valid DCI Certificate of Good Conduct (or Interpol/Embassy Police Clearance for foreign directors)',
          'KRA PIN Certificates and National IDs for all Kenyan board members',
          'Signed PBO Constitution and 1-Year Thematic Budget',
          'Notarized Parent Charter & Board Resolution (for International NGOs)',
        ],
      },
    ],
  },
  {
    id: 'blog-kenya-epassport-good-conduct-civil-docs',
    slug: 'kenya-epassport-good-conduct-birth-certificate-ecitizen-guide',
    title: 'Fast-Track Guide to Kenyan e-Passports, DCI Good Conduct & Civil Registration Documents',
    subtitle:
      'Avoid biometric appointment delays and rejected uploads when applying for a new passport, lost ID replacement, late birth certificate, or Police Clearance.',
    excerpt:
      'Missing a single recommender signature or uploading an uncertified birth notification can stall your Kenyan passport or civil registration application for weeks. Follow this verified checklist for smooth approval.',
    categoryId: 'government-documents',
    categoryName: 'Government Documents',
    subCategoryName: 'Passport',
    author: 'Kelvin Kiprop',
    authorRole: 'Senior Civic & Documentation Advisor',
    publishedDate: 'September 2026',
    readTime: '6 min read',
    image: EDITORIAL_IMAGES.taxAndDocs,
    isTopStory: true,
    isFeatured: true,
    keywords: [
      'passport',
      'epassport',
      'good conduct',
      'dci',
      'police clearance',
      'birth certificate',
      'national id',
      'marriage certificate',
      'ecitizen',
    ],
    keyTakeaways: [
      'Always match the exact spelling and order of names across your Birth Certificate and National ID before submitting an e-Passport application.',
      'Your passport recommender must be a Kenyan citizen holding a valid National ID who is not an immediate parent.',
      'DCI Certificates of Good Conduct require live fingerprint capture on duplicate Form C24 at a Huduma Centre or DCI HQ.',
      'Lost passports and IDs require both an official Kenya Police Abstract and a sworn Commissioner for Oaths Affidavit.',
    ],
    officialPortal: 'accounts.ecitizen.go.ke',
    sections: [
      {
        heading: '1. Preparing a Flawless e-Passport Application',
        paragraphs: [
          'Kenya issues 34-page (A-Series), 50-page (B-Series), and 66-page (C-Series) East African Community biometric e-Passports. All applications, renewals, and replacements are lodged online via the Directorate of Immigration Services tab on eCitizen.',
          'Before paying the invoice, double-check that your scanned PDF uploads include both sides of your National ID, your full Birth Certificate, both parents’ IDs (or death certificates), and the signed recommender page.',
        ],
      },
      {
        heading: '2. DCI Police Clearance (Certificate of Good Conduct)',
        paragraphs: [
          'Whether you are applying for a visa, a new job, or an NGO board seat, a valid DCI Police Clearance Certificate is essential. After paying KSh 1,050 on eCitizen, print your invoice and two copies of the C24 fingerprint chart, and attend your chosen Huduma Centre with your original National ID.',
        ],
      },
    ],
  },
  {
    id: 'blog-kra-tax-compliance-etims-foreigners',
    slug: 'kra-pin-tax-compliance-certificate-etims-guide-kenya',
    title: 'Mastering KRA PIN Registration, eTIMS Invoicing & Tax Compliance Certificates (TCC)',
    subtitle:
      'How businesses, expatriates, and non-resident directors stay compliant on iTax, clear historical ledger penalties, and integrate eTIMS.',
    excerpt:
      'Under Kenyan tax law, only business expenses supported by valid eTIMS electronic tax invoices are tax-deductible. Learn how to register KRA PINs for foreign directors, file monthly returns, and secure your annual TCC.',
    categoryId: 'tax-compliance',
    categoryName: 'Tax & Compliance',
    subCategoryName: 'Tax compliance',
    author: 'CPA David Ochieng',
    authorRole: 'Corporate Structuring & Tax Partner',
    publishedDate: 'September 2026',
    readTime: '7 min read',
    image: EDITORIAL_IMAGES.taxAndDocs,
    isTopStory: false,
    isFeatured: true,
    keywords: [
      'kra',
      'kra pin',
      'tax compliance',
      'tcc',
      'etims',
      'itax',
      'tax returns',
      'vat',
      'paye',
      'foreign director pin',
    ],
    keyTakeaways: [
      'Every Kenyan business—including VAT-exempt entities, consultants, and landlords—must issue eTIMS invoices for clients to deduct expenses.',
      'Foreign directors and expatriates can obtain an individual KRA PIN using their passport and work permit or company endorsement.',
      'Monthly PAYE, SHIF, NSSF, and Housing Levy are due by the 9th of the following month; VAT and Withholding Tax are due by the 20th.',
      'A valid KRA Tax Compliance Certificate (TCC) is mandatory for work permit renewals, government tenders, and county licensing.',
    ],
    officialPortal: 'itax.kra.go.ke & etims.kra.go.ke',
    sections: [
      {
        heading: '1. KRA PIN Registration for Companies & Expatriates',
        paragraphs: [
          'No corporate bank account, commercial lease, or work permit renewal can proceed in Kenya without a valid KRA PIN. For newly incorporated companies, the corporate PIN is linked to at least one tax-registered director on iTax.',
          'For foreign nationals relocating to Kenya or serving as non-resident directors, KRA issues individual PINs upon verification of the passport, immigration endorsement, or corporate CR12.',
        ],
      },
      {
        heading: '2. Why eTIMS Compliance is Non-Negotiable in 2026',
        paragraphs: [
          'The Kenya Revenue Authority requires all persons in business to onboard onto the Electronic Tax Invoice Management System (eTIMS). Corporate clients will not pay supplier invoices that lack an eTIMS QR code because non-eTIMS expenses are disallowed during Corporate Income Tax audits.',
        ],
      },
    ],
  },
  {
    id: 'blog-relocating-investing-in-kenya-keninvest',
    slug: 'relocating-to-kenya-investor-guide-keninvest-expat-setup',
    title: 'Relocating & Investing in Kenya: The USD 100,000 KenInvest Route, Property & Expat Setup',
    subtitle:
      'How international founders, retirees, and returning diaspora structure investments, import duty-free household goods, and acquire 99-year leasehold property.',
    excerpt:
      'Nairobi is East Africa’s premier commercial and diplomatic hub. This blueprint walks you through Kenya Investment Authority (KenInvest) certification, expatriate permit quotas, returning resident duty exemptions, and Ardhisasa property rules.',
    categoryId: 'investment-relocation',
    categoryName: 'Investment & Relocation',
    subCategoryName: 'Relocating to Kenya',
    author: 'Adv. Wanjiku Mwangi',
    authorRole: 'Lead Immigration & Regulatory Counsel',
    publishedDate: 'August 2026',
    readTime: '10 min read',
    image: EDITORIAL_IMAGES.business,
    isTopStory: true,
    isFeatured: true,
    keywords: [
      'relocating to kenya',
      'foreign investment',
      'keninvest',
      'investor services',
      'expatriate',
      'property',
      'ardhisasa',
      'duty free',
      'returning resident',
    ],
    keyTakeaways: [
      'Foreign investors committing at least USD 100,000 qualify for a KenInvest Investment Certificate and up to 6 automatic work permit quotas.',
      'Under Article 65 of the Constitution of Kenya, non-citizens may hold property under leasehold tenure for terms of up to 99 years.',
      'First-arrival Work Permit holders and Returning Kenyan Residents qualify for customs duty exemption on personal household effects.',
    ],
    officialPortal: 'invest.go.ke & fns.immigration.go.ke',
    sections: [
      {
        heading: '1. The KenInvest One-Stop Investment Certificate',
        paragraphs: [
          'The Kenya Investment Authority (KenInvest) issues statutory Investment Certificates to foreign investors demonstrating at least USD 100,000 (or equivalent) in capital investment and clear economic benefit to Kenya.',
          'Holders of an Investment Certificate receive facilitated work permit quotas (3 Class G/D management permits and 3 Class C/E technical permits) and streamlined NEMA, county, and sector licensing.',
        ],
      },
      {
        heading: '2. Property Acquisition & Commercial Leases for Foreigners',
        paragraphs: [
          'While freehold agricultural land is restricted to Kenyan citizens, foreign individuals and foreign-owned companies can freely purchase apartments, commercial offices, and urban land held on 99-year government or county leaseholds, verified digitally via the Ardhisasa platform.',
        ],
      },
    ],
  },
  {
    id: 'blog-licences-permits-nca-nema-odpc-kenya',
    slug: 'business-licences-permits-kenya-sbp-nca-nema-odpc',
    title: 'Essential Business Licences & Regulatory Permits in Kenya: County SBP, NCA, NEMA & ODPC',
    subtitle:
      'A sector-by-sector compliance checklist so your company never faces county enforcement, data privacy fines, or construction stop-orders.',
    excerpt:
      'Incorporating a company is only step one. Before commencing commercial operations, businesses must secure a County Single Business Permit and any applicable sector clearances from NCA, NEMA, ODPC, EPRA, or TRA.',
    categoryId: 'licences-permits',
    categoryName: 'Licences & Permits',
    subCategoryName: 'Regulatory licences',
    author: 'Kelvin Kiprop',
    authorRole: 'Senior Civic & Documentation Advisor',
    publishedDate: 'August 2026',
    readTime: '6 min read',
    image: EDITORIAL_IMAGES.ngo,
    isTopStory: false,
    isFeatured: true,
    keywords: [
      'business permit',
      'single business permit',
      'nca',
      'nema',
      'odpc',
      'data protection',
      'professional licence',
      'regulatory licence',
      'renewals',
    ],
    keyTakeaways: [
      'Every physical or commercial enterprise in Nairobi and across the 47 counties requires an annual Single Business Permit (renewable by March 31).',
      'Contractors in building, civil, electrical, or mechanical works must register with the National Construction Authority (NCA 1 to NCA 8).',
      'Organizations processing personal client or employee data must register as Data Controllers/Processors with the ODPC.',
    ],
    officialPortal: 'nairobiservices.go.ke · nca.go.ke · odpc.go.ke',
    sections: [
      {
        heading: '1. Unified County Single Business Permits (SBP)',
        paragraphs: [
          'In Nairobi City County and major urban counties, the Unified Business Permit consolidates your trade licence, fire safety clearance, food/health hygiene certificate, and outdoor signage permit into a single online invoice on the county revenue portal.',
        ],
      },
      {
        heading: '2. Sector-Specific & Professional Accreditation',
        paragraphs: [
          'Regulated industries require national agency clearance prior to county licensing. Construction firms need NCA accreditation; energy and solar installers need EPRA licensing; hospitality operators need Tourism Regulatory Authority (TRA) classification; and digital platforms require ODPC registration.',
        ],
      },
    ],
  },
  {
    id: 'blog-ecitizen-single-sign-on-portals-guide',
    slug: 'mastering-ecitizen-single-sign-on-government-portals-kenya',
    title: 'Navigating eCitizen Single Sign-On, Ardhisasa & NTSA Portals Without Frustration',
    subtitle:
      'How to resolve phone number lockouts, link corporate BRS profiles, convert foreign driving licences on NTSA, and verify Paybill 222222 payments.',
    excerpt:
      'With over 16,000 Kenyan government services consolidated under the eCitizen Single Sign-On (SSO) architecture and Paybill 222222, knowing how to manage your digital identity saves days of queuing at Huduma Centres.',
    categoryId: 'government-services',
    categoryName: 'Government Services',
    subCategoryName: 'eCitizen services',
    author: 'Adv. Amina Hassan',
    authorRole: 'Non-Profit & International Development Specialist',
    publishedDate: 'August 2026',
    readTime: '5 min read',
    image: EDITORIAL_IMAGES.immigration,
    isTopStory: false,
    isFeatured: true,
    keywords: [
      'ecitizen',
      'government services',
      'ntsa',
      'ardhisasa',
      'driving licence',
      'paybill 222222',
      'online applications',
      'government portals',
    ],
    keyTakeaways: [
      'Foreign residents holding an Alien Card should register a Foreign Resident eCitizen account rather than a temporary Visitor account.',
      'All official Kenyan government digital payments route through the unified Government Paybill 222222.',
      'Expatriates with a valid Work Permit and original foreign driver’s license can apply online via NTSA for a Kenyan Driving Licence conversion.',
    ],
    officialPortal: 'accounts.ecitizen.go.ke',
    sections: [
      {
        heading: '1. Citizen vs. Foreign Resident vs. Visitor eCitizen Accounts',
        paragraphs: [
          'Your eCitizen account category determines which government agencies you can access. Kenyan citizens register using their National ID number; expatriates with an issued Alien Card register as Foreign Residents (unlocking NTSA, BRS, and DCI services); while short-term travelers use Visitor accounts for eTA and tourist permits.',
        ],
      },
      {
        heading: '2. Converting a Foreign Driving Licence & Linking BRS Entities',
        paragraphs: [
          'Once logged into eCitizen, foreign residents can open the National Transport and Safety Authority (NTSA) service portal to convert a valid foreign driving license into a Kenyan smart driving license without sitting a driving test, provided their work permit or dependent pass is valid.',
        ],
      },
    ],
  },
];

export type ConsultationStatus =
  | 'Pending Review'
  | 'Confirmed'
  | 'Scheduled'
  | 'Completed'
  | 'Cancelled';

export interface ConsultationBooking {
  id: string;
  reference: string;
  bookingRef?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceCategoryId: string;
  serviceCategoryName: string;
  serviceId?: string;
  serviceName?: string;
  subCategoryName: string;
  format: string;
  preferredDate: string;
  caseSummary: string;
  status: ConsultationStatus;
  advisorNotes?: string;
  createdAt: string;
}

export type InquiryStatus = 'New' | 'In Progress' | 'Resolved';

export interface ClientInquiry {
  id: string;
  reference: string;
  fullName: string;
  email: string;
  phone: string;
  topic: string;
  subCategory?: string;
  message: string;
  source: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface BlogDonation {
  id: string;
  reference: string;
  ref?: string;
  donorName: string;
  contact: string;
  donorContact?: string;
  amount: number;
  method: string;
  blogTitle: string;
  note?: string;
  createdAt: string;
}

export const INITIAL_CONSULTATIONS: ConsultationBooking[] = [
  {
    id: 'cons-101',
    reference: 'SG-CONS-4821',
    bookingRef: 'SG-CONS-4821',
    clientName: 'Dr. Marcus Vance',
    clientEmail: 'mvance@globalhealth-org.ch',
    clientPhone: '+254 711 849 201',
    serviceCategoryId: 'immigration-visas',
    serviceCategoryName: 'Immigration & Visas',
    serviceId: 'immigration-visas',
    serviceName: 'Immigration & Visas',
    subCategoryName: 'Work permits',
    format: 'Video Call (Google Meet / Zoom)',
    preferredDate: '2026-10-06',
    caseSummary:
      'Relocating regional medical director to Nairobi office. Need Class D work permit & dependent passes for spouse and 2 children.',
    status: 'Confirmed',
    advisorNotes: 'Assigned to Adv. Wanjiku Mwangi. Kenyan understudy CV requested.',
    createdAt: '2026-10-01 08:30 EAT',
  },
  {
    id: 'cons-102',
    reference: 'SG-CONS-5190',
    bookingRef: 'SG-CONS-5190',
    clientName: 'Amina El-Masri',
    clientEmail: 'amina@nileventures.ae',
    clientPhone: '+971 50 492 1833',
    serviceCategoryId: 'business-registration',
    serviceCategoryName: 'Business & Company Registration',
    serviceId: 'business-registration',
    serviceName: 'Business & Company Registration',
    subCategoryName: 'Foreign-owned businesses',
    format: 'Video Call (Google Meet / Zoom)',
    preferredDate: '2026-10-08',
    caseSummary:
      'Setting up a 100% foreign-owned Kenyan subsidiary + KenInvest USD 100,000 Investment Certificate and KRA PINs for two non-resident directors.',
    status: 'Pending Review',
    advisorNotes: 'Prepare Subsidiary vs Branch tax comparison deck.',
    createdAt: '2026-10-01 10:15 EAT',
  },
  {
    id: 'cons-103',
    reference: 'SG-CONS-5304',
    bookingRef: 'SG-CONS-5304',
    clientName: 'Rev. Samuel Omondi',
    clientEmail: 'somondi@hopefoundation.or.ke',
    clientPhone: '+254 722 391 044',
    serviceCategoryId: 'ngo-nonprofit',
    serviceCategoryName: 'NGO & Nonprofit Registration',
    serviceId: 'ngo-nonprofit',
    serviceName: 'NGO & Nonprofit Registration',
    subCategoryName: 'NGO registration',
    format: 'In-Person Nairobi Office',
    preferredDate: '2026-10-07',
    caseSummary:
      'Transitioning our community organization into a national Public Benefit Organization (PBO) under PBORA and applying for KRA tax exemption.',
    status: 'Pending Review',
    createdAt: '2026-10-01 11:40 EAT',
  },
];

export const INITIAL_INQUIRIES: ClientInquiry[] = [
  {
    id: 'inq-201',
    reference: 'SG-INQ-201',
    fullName: 'Grace Njeri Kariuki',
    email: 'grace.njeri@gmail.com',
    phone: '+254 790 221 884',
    topic: 'Government Documents',
    subCategory: 'Passport',
    message:
      'My 34-page passport is full and I have an urgent Schengen business trip in 3 weeks. Need assistance with 50-page B-series e-Passport renewal on eCitizen.',
    source: 'Contact Page',
    status: 'New',
    createdAt: '2026-10-01 09:10 EAT',
  },
  {
    id: 'inq-202',
    reference: 'SG-INQ-202',
    fullName: 'Eng. Brian Kipchoge',
    email: 'bkipchoge@apexbuilders.co.ke',
    phone: '+254 720 618 900',
    topic: 'Licences & Permits',
    subCategory: 'Sector-specific permits',
    message:
      'Requesting callback & checklist for upgrading our construction firm from NCA 6 to NCA 4 Building Works and renewing our annual practicing licence.',
    source: 'Service Detail Callback',
    status: 'In Progress',
    createdAt: '2026-10-01 10:45 EAT',
  },
  {
    id: 'inq-203',
    reference: 'SG-INQ-203',
    fullName: 'Chen Wei',
    email: 'chen.wei@sinotech-ea.com',
    phone: '+254 733 901 412',
    topic: 'Tax & Compliance',
    subCategory: 'Compliance certificates',
    message:
      'Need KRA iTax ledger reconciliation and Tax Compliance Certificate (TCC) renewal for work permit renewal dossier.',
    source: 'Contact Page',
    status: 'Resolved',
    createdAt: '2026-09-30 15:20 EAT',
  },
];

export const INITIAL_DONATIONS: BlogDonation[] = [
  {
    id: 'don-301',
    reference: 'SG-DON-842910',
    ref: 'SG-DON-842910',
    donorName: 'Sarah Jenkins',
    contact: 'sjenkins@ukexpat.org',
    donorContact: 'sjenkins@ukexpat.org',
    amount: 2500,
    method: 'Card / International',
    blogTitle:
      'The Complete 2026 Guide to Kenya Work Permits (Class D, G & K) on the eFNS Portal',
    note: 'This Class K permit breakdown saved me weeks of confusion. Thank you!',
    createdAt: '2026-09-29 14:12 EAT',
  },
  {
    id: 'don-302',
    reference: 'SG-DON-910422',
    ref: 'SG-DON-910422',
    donorName: 'Peter Mbugua',
    contact: '0722481920',
    donorContact: '0722481920',
    amount: 1000,
    method: 'M-Pesa Express',
    blogTitle:
      'How to Register a Private Limited Company or Foreign Branch in Kenya via eCitizen BRS',
    note: 'Keep up the detailed civic guides.',
    createdAt: '2026-09-30 18:05 EAT',
  },
];

