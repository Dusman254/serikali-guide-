import { ProgressiveQuestion, PersonalizedServiceResult } from '../types/serviceAssistant';
import { ServiceCategoryId } from './serikaliData';

// Detailed requirements data with guidance notes
export const DETAILED_SERVICE_RESULTS: Record<string, PersonalizedServiceResult> = {
  'passport-renewal': {
    serviceId: 'passport',
    subCategoryId: 'passport',
    categoryId: 'government-documents',
    serviceName: 'Kenyan Passport Renewal',
    categoryName: 'Government Documents & Passports',
    summary: 'Statutory renewal of expired or expiring 32/50/66-page Kenyan East African e-Passport via eCitizen and Nyayo House / regional immigration centers.',
    whyThisService: 'Recommended because you hold an existing Kenyan passport that has expired or is nearing validity expiration.',
    officialPortal: 'accounts.ecitizen.go.ke (Directorate of Immigration)',
    estimatedTimeline: '10 to 15 Working Days (Expedited options available for urgent medical/academic travel)',
    statutoryFeeNote: 'KSh 7,550 (Series A, 34 Pgs) · KSh 9,550 (Series B, 50 Pgs) · KSh 12,550 (Series C, 66 Pgs)',
    requirements: [
      {
        id: 'req-curr-pass',
        label: 'Original Current Passport + Bio-data Photocopy',
        isMandatory: true,
        whyNeeded: 'Directorate of Immigration requires physical cancellation of the previous booklet before the new e-Passport is issued.',
        whatCounts: 'Physical original booklet in any validity state plus clear photocopies of pages 2-3 and the endorsement pages.',
        commonMistakes: 'Forgetting to carry the physical old passport to the biometrics appointment, which halts processing.',
      },
      {
        id: 'req-nat-id',
        label: 'Original National ID Card + 1 Photocopy',
        isMandatory: true,
        whyNeeded: 'Verifies continuous citizenship and cross-matches your National Population Register records.',
        whatCounts: 'Valid Republic of Kenya plastic identity card or waiting slip with certified extract.',
        commonMistakes: 'Presenting a laminated photocopy or an unverified waiting slip without serial numbers.',
      },
      {
        id: 'req-ecitizen-form',
        label: 'eCitizen Form 19 Generated Application + 3 Invoices',
        isMandatory: true,
        whyNeeded: 'Official serialized receipt proving payment of statutory treasury fees via Pesaflow.',
        whatCounts: 'Computer-generated PDF printout from eCitizen bearing complete bar-codes and transaction hashes.',
        commonMistakes: 'Printing only page 1 and missing the serialized statutory declaration page.',
      },
      {
        id: 'req-photos',
        label: '3 Recent Color Passport Photographs (ICAO Standard)',
        isMandatory: true,
        whyNeeded: 'Stored in the physical civil dossier alongside electronic digital camera capture at Nyayo House.',
        whatCounts: 'White background, 2.5 x 2 inches, neutral facial expression, ears clearly visible, no spectacles or headwear (except religious).',
        commonMistakes: 'Using photos older than 6 months or with gray/off-white background.',
      },
      {
        id: 'req-recommender',
        label: 'Recommender National ID Photocopy (Citizen of Good Standing)',
        isMandatory: true,
        whyNeeded: 'Section 13 requires a Kenyan professional (advocate, doctor, civil servant, or magistrate) to certify the declaration.',
        whatCounts: 'Signed Section 13 declaration on Form 19 with certified ID copy of recommender.',
        commonMistakes: 'Using a recommender who is a direct family member with matching surname.',
      },
    ],
    nextSteps: [
      { number: 1, title: 'Document Verification', description: 'Compile your original ID, current passport, photos, and signed recommender declaration.' },
      { number: 2, title: 'eCitizen Portal Filing', description: 'Log in to eCitizen immigration portal, select Form 19, select booklet series, and pay via M-Pesa/Card.' },
      { number: 3, title: 'Book Biometrics Appointment', description: 'Download the generated Form 19 & payment receipt and pick your appointment slot at Nyayo House or your regional center.' },
      { number: 4, title: 'In-Person Enrollment', description: 'Present yourself on the booked date for physical fingerprint scanning, digital facial photo, and signature capture.' },
      { number: 5, title: 'Collection Tracking', description: 'Track SMS/online status alert and collect the new 10-year biometric passport.' },
    ],
    guideUrl: { page: 'service-detail', serviceId: 'government-documents', subCategoryId: 'passport' },
  },

  'passport-new': {
    serviceId: 'passport',
    subCategoryId: 'passport',
    categoryId: 'government-documents',
    serviceName: 'First-Time Kenyan Passport Application',
    categoryName: 'Government Documents & Passports',
    summary: 'First-time issuance of the Republic of Kenya East African e-Passport for citizens who have never previously held an official travel document.',
    whyThisService: 'Recommended because you are applying for your first ever passport.',
    officialPortal: 'accounts.ecitizen.go.ke (Directorate of Immigration)',
    estimatedTimeline: '14 to 21 Working Days',
    statutoryFeeNote: 'KSh 7,550 (34 Pgs) · KSh 9,550 (50 Pgs) · KSh 12,550 (66 Pgs)',
    requirements: [
      {
        id: 'req-orig-id',
        label: 'Original National ID Card + Photocopy',
        isMandatory: true,
        whyNeeded: 'Prerequisite identity token verifying age of majority and citizenship status.',
        whatCounts: 'Original National Identity Card.',
        commonMistakes: 'Applying before obtaining a National ID if above 18 years.',
      },
      {
        id: 'req-birth-cert',
        label: 'Original Birth Certificate + Photocopy',
        isMandatory: true,
        whyNeeded: 'Establishes place of birth, lineage, and statutory eligibility under the Kenya Citizenship Act.',
        whatCounts: 'Official certified civil register Birth Certificate with security watermark.',
        commonMistakes: 'Presenting a hospital notification card or clinic baptismal card instead of civil birth certificate.',
      },
      {
        id: 'req-parents-id',
        label: 'Parents National ID / Death Certificate Photocopies',
        isMandatory: true,
        whyNeeded: 'Constitutional proof of citizenship by birth through at least one Kenyan parent.',
        whatCounts: 'Copies of mother/father National ID cards or official civil death certificates.',
        commonMistakes: 'Lack of alternative documentation if parents are deceased.',
      },
      {
        id: 'req-photos-new',
        label: '3 Passport Photographs (White Background, ICAO Format)',
        isMandatory: true,
        whyNeeded: 'Dossier archiving and physical ledger verification.',
        whatCounts: '2.5 x 2 inches, clear border, white background, no sunglasses or shadows.',
        commonMistakes: 'Wearing white shirts that blend into the white background.',
      },
    ],
    nextSteps: [
      { number: 1, title: 'Collate Lineage & Identity Credentials', description: 'Ensure you have original ID, Birth Certificate, and parental identification documents.' },
      { number: 2, title: 'Fill Form 19 on eCitizen', description: 'Complete online bio-data entries and remit treasury invoice.' },
      { number: 3, title: 'Obtain Recommender Signature', description: 'Have an advocate, religious leader, or doctor complete and sign Section 13.' },
      { number: 4, title: 'Biometrics & Submission', description: 'Visit Nyayo House or regional passport center on your appointment date.' },
      { number: 5, title: 'Collection', description: 'Receive notification and collect booklet with National ID.' },
    ],
    guideUrl: { page: 'service-detail', serviceId: 'government-documents', subCategoryId: 'passport' },
  },

  'passport-lost-replace': {
    serviceId: 'passport',
    subCategoryId: 'passport',
    categoryId: 'government-documents',
    serviceName: 'Passport Replacement',
    categoryName: 'Government Documents & Passports',
    summary: 'Statutory replacement and gazetting of a lost or stolen Kenyan passport to cancel previous bio-credentials and issue a new e-Passport.',
    whyThisService: 'Recommended because your passport was lost or stolen and must be formally gazetted and replaced.',
    officialPortal: 'accounts.ecitizen.go.ke / DCI Police Abstract',
    estimatedTimeline: '15 to 25 Working Days (Includes security vetting & database cancellation)',
    statutoryFeeNote: 'KSh 20,050 (Statutory Replacement Penalty & e-Passport Fee)',
    requirements: [
      {
        id: 'req-police-abs',
        label: 'Original Police Abstract with OB Number',
        isMandatory: true,
        whyNeeded: 'Official record establishing date, station, and circumstances under which the travel document was lost.',
        whatCounts: 'Police abstract signed and stamped by the Officer Commanding Station (OCS).',
        commonMistakes: 'Abstract missing the official rubber stamp or OB number.',
      },
      {
        id: 'req-loss-affidavit',
        label: 'Sworn Affidavit of Loss (Commissioned by High Court Advocate)',
        isMandatory: true,
        whyNeeded: 'Legal oath declaring that the document is neither held by creditors nor pledged for illegal travel.',
        whatCounts: 'Notarized affidavit signed before a Commissioner for Oaths.',
        commonMistakes: 'Unstamped or undated affidavit.',
      },
      {
        id: 'req-nat-id-lost',
        label: 'Original National ID + Previous Passport Photocopy (if available)',
        isMandatory: true,
        whyNeeded: 'Matches previous serial number to cancel it on the INTERPOL Stolen & Lost Travel Documents (SLTD) database.',
        whatCounts: 'Any prior photocopy, photo of passport page, or exact passport number.',
        commonMistakes: 'Not knowing the lost passport number.',
      },
    ],
    nextSteps: [
      { number: 1, title: 'Report Loss to Nearest Police Station', description: 'Obtain a verified Police Abstract with an Occurrence Book (OB) entry.' },
      { number: 2, title: 'Swear Affidavit of Loss', description: 'Execute a formal affidavit before a licensed Commissioner for Oaths.' },
      { number: 3, title: 'File Replacement Application on eCitizen', description: 'Select "Replacement of Lost Passport", attach abstract, and remit statutory fee.' },
      { number: 4, title: 'Security Vetting & Biometrics', description: 'Attend mandatory security debrief at Nyayo House / regional immigration desk.' },
      { number: 5, title: 'New Passport Issuance', description: 'Collect your new passport once security clearance is endorsed.' },
    ],
    guideUrl: { page: 'service-detail', serviceId: 'government-documents', subCategoryId: 'passport' },
  },

  'work-permit-class-d': {
    serviceId: 'work-permits',
    subCategoryId: 'work-permits',
    categoryId: 'immigration-visas',
    serviceName: 'Class D Work Permit (Employment)',
    categoryName: 'Immigration & Visas',
    summary: 'Statutory work authorization issued under the Kenya Citizenship and Immigration Act for foreign nationals offered specific employment by a registered Kenyan company or institution.',
    whyThisService: 'Recommended because you are an expatriate hired by an organization in Kenya, or an employer sponsoring a foreign specialist.',
    officialPortal: 'fns.immigration.go.ke (eFNS)',
    estimatedTimeline: '6 to 10 Weeks (Vetted by Immigration Permit Determination Committee)',
    statutoryFeeNote: 'Processing Fee: KSh 20,000 (Non-refundable) · Issuance Fee: KSh 400,000 per year',
    requirements: [
      {
        id: 'req-wp-form25',
        label: 'Completed Form 25 Online Application via eFNS',
        isMandatory: true,
        whyNeeded: 'Statutory instrument submitted to the Permit Determination Committee.',
        whatCounts: 'Electronically generated Form 25 with digital signature from employer representative.',
        commonMistakes: 'Inconsistent job title between Form 25, employment contract, and board resolution.',
      },
      {
        id: 'req-wp-coverletter',
        label: 'Employer Sponsoring Cover Letter to Director General',
        isMandatory: true,
        whyNeeded: 'Explains specific technical or managerial justification for hiring an expatriate instead of a local citizen.',
        whatCounts: 'Company letterhead signed by CEO, Managing Director, or authorized Director.',
        commonMistakes: 'Failing to clearly state the unique specialization that justifies hiring non-citizens.',
      },
      {
        id: 'req-wp-understudy',
        label: 'Kenyan Understudy Program (CV, ID, Contract & Training Plan)',
        isMandatory: true,
        whyNeeded: 'Statutory mandate requiring expatriates to train Kenyan citizens to take over the role upon permit expiration.',
        whatCounts: 'Certified copy of Kenyan understudy National ID, degree certificates, detailed training curriculum, and timeline.',
        commonMistakes: 'Submitting an understudy whose academic credentials do not match the expatriate field.',
      },
      {
        id: 'req-wp-corp-docs',
        label: 'Company Incorporation (CR12, TCC, Business Permit)',
        isMandatory: true,
        whyNeeded: 'Confirms the employer is a legally registered, tax-compliant corporate entity in Kenya.',
        whatCounts: 'Current CR12 (issued within 3 months), valid KRA Tax Compliance Certificate, and County Single Business Permit.',
        commonMistakes: 'Submitting an expired Tax Compliance Certificate.',
      },
      {
        id: 'req-wp-cv-certs',
        label: 'Expatriate CV & Certified Professional Certificates',
        isMandatory: true,
        whyNeeded: 'Authenticates professional competencies required for the statutory job position.',
        whatCounts: 'Certified copies of university degrees and professional certifications (translated to English if in foreign language).',
        commonMistakes: 'Uncertified foreign language degrees without certified translation.',
      },
    ],
    nextSteps: [
      { number: 1, title: 'Corporate & Understudy Compilation', description: 'Assemble employer CR12, TCC, job description, and nominate a qualified Kenyan citizen understudy.' },
      { number: 2, title: 'eFNS Portal Submission', description: 'Submit electronic application on fns.immigration.go.ke and pay KSh 20,000 processing fee.' },
      { number: 3, title: 'Committee Review & Security Vetting', description: 'Permit Determination Committee vets the application at Nyayo House.' },
      { number: 4, title: 'Notification of Approval', description: 'Receive approval letter and pay the statutory issuance fee (KSh 400,000/yr).' },
      { number: 5, title: 'Alien Card & Passport Endorsement', description: 'Register for Foreign Nationals Certificate (Alien Card) and passport endorsement stamp.' },
    ],
    guideUrl: { page: 'service-detail', serviceId: 'immigration-visas', subCategoryId: 'work-permits' },
  },

  'work-permit-class-g': {
    serviceId: 'work-permits',
    subCategoryId: 'work-permits',
    categoryId: 'immigration-visas',
    serviceName: 'Class G Work Permit (Investors & Entrepreneurs)',
    categoryName: 'Immigration & Visas',
    summary: 'Statutory permit for foreign investors and entrepreneurs establishing a business, trade, or commercial venture in the Republic of Kenya.',
    whyThisService: 'Recommended because you are an investor or business owner directing capital into a Kenyan commercial enterprise.',
    officialPortal: 'fns.immigration.go.ke (eFNS) / KenInvest',
    estimatedTimeline: '6 to 10 Weeks',
    statutoryFeeNote: 'Processing Fee: KSh 20,000 · Issuance Fee: KSh 250,000 per year',
    requirements: [
      {
        id: 'req-wp-g-proof-funds',
        label: 'Proof of Capital Investment (Minimum USD 100,000)',
        isMandatory: true,
        whyNeeded: 'Statutory threshold establishing genuine commercial capability to foster economic growth and employment.',
        whatCounts: 'Kenyan bank statement in company name or audited accounts demonstrating capital inflow.',
        commonMistakes: 'Submitting personal overseas bank statements that have not been remitted to a Kenyan bank account.',
      },
      {
        id: 'req-wp-g-corp',
        label: 'Company CR12 & Memorandum & Articles of Association',
        isMandatory: true,
        whyNeeded: 'Validates shareholding structure showing applicant owns shares in the registered enterprise.',
        whatCounts: 'Official BRS CR12 stating applicant as Director/Shareholder.',
        commonMistakes: 'Applicant not listed as a legal shareholder on the CR12.',
      },
      {
        id: 'req-wp-g-keninvest',
        label: 'Kenya Investment Authority (KenInvest) Certificate (Recommended)',
        isMandatory: false,
        whyNeeded: 'Expedites permit approval by providing official government verification of investor privileges.',
        whatCounts: 'Official KenInvest Investment Certificate.',
        commonMistakes: 'Not taking advantage of KenInvest facilitation.',
      },
    ],
    nextSteps: [
      { number: 1, title: 'Company Registration & Capital Inflow', description: 'Incorporate Kenyan company and remit investment capital into a local bank account.' },
      { number: 2, title: 'eFNS Filing & Processing Fee', description: 'Submit Form 25 on eFNS portal with audited bank proof and CR12.' },
      { number: 3, title: 'Permit Committee Review', description: 'Application vetted by the Directorate of Immigration Services.' },
      { number: 4, title: 'Issuance Fee Remittance', description: 'Pay issuance fee upon receiving formal Approval in Principle.' },
      { number: 5, title: 'Alien Card Biometrics', description: 'Complete biometrics at Nyayo House for the Alien Registration Certificate.' },
    ],
    guideUrl: { page: 'service-detail', serviceId: 'immigration-visas', subCategoryId: 'work-permits' },
  },

  'special-pass': {
    serviceId: 'passes',
    subCategoryId: 'passes',
    categoryId: 'immigration-visas',
    serviceName: 'Special Pass (Short-Term Work Authorization)',
    categoryName: 'Immigration & Visas',
    summary: 'Temporary authorization issued to foreign nationals who wish to engage in short-term employment, specialized consultancy, emergency technical repair, or while awaiting work permit approval.',
    whyThisService: 'Recommended because you need lawful authorization to work in Kenya for a temporary duration (up to 3 to 6 months).',
    officialPortal: 'fns.immigration.go.ke (eFNS)',
    estimatedTimeline: '7 to 14 Working Days',
    statutoryFeeNote: 'KSh 50,000 per month or part thereof (Valid for maximum 3 months, renewable once for up to 6 months total)',
    requirements: [
      {
        id: 'req-sp-letter',
        label: 'Detailed Sponsoring Letter from Host Entity',
        isMandatory: true,
        whyNeeded: 'Outlines the specific assignment, urgent justification, and exact duration.',
        whatCounts: 'Company/Institution letterhead signed by executive management.',
        commonMistakes: 'Vague assignment descriptions or stating indefinite duration.',
      },
      {
        id: 'req-sp-passport',
        label: 'Valid Passport Bio-data Page + Valid Entry Stamp / eTA',
        isMandatory: true,
        whyNeeded: 'Confirms lawful entry into Kenya and minimum 6 months booklet validity.',
        whatCounts: 'Clear scan of passport bio-data and latest immigration endorsement.',
        commonMistakes: 'Applying after visitor visa/eTA has expired (incurs overstay penalty).',
      },
      {
        id: 'req-sp-cv',
        label: 'Applicant CV & Technical Credentials',
        isMandatory: true,
        whyNeeded: 'Demonstrates qualification to undertake the specialized assignment.',
        whatCounts: 'Up-to-date resume highlighting relevant technical or consulting track record.',
        commonMistakes: 'Missing academic or professional certifications.',
      },
    ],
    nextSteps: [
      { number: 1, title: 'Host Letter & Dossier Preparation', description: 'Obtain sponsoring letter stating project duration and company credentials.' },
      { number: 2, title: 'eFNS Online Filing', description: 'Log in to eFNS, navigate to "Apply for a Pass", choose Special Pass, upload documents.' },
      { number: 3, title: 'Immigration Assessment', description: 'Immigration Special Pass Section vets the urgency and host profile.' },
      { number: 4, title: 'Fee Remittance', description: 'Upon approval, pay KSh 50,000 per month statutory fee via eFNS.' },
      { number: 5, title: 'Pass Endorsement', description: 'Download approved Special Pass certificate and present passport for endorsement.' },
    ],
    guideUrl: { page: 'service-detail', serviceId: 'immigration-visas', subCategoryId: 'passes' },
  },

  'eta-visa': {
    serviceId: 'visas',
    subCategoryId: 'visas',
    categoryId: 'immigration-visas',
    serviceName: 'Kenya Electronic Travel Authorisation (eTA)',
    categoryName: 'Immigration & Visas',
    summary: 'Mandatory electronic travel authorization required for all foreign visitors entering the Republic of Kenya for tourism, transit, business meetings, or conferences.',
    whyThisService: 'Recommended because you are traveling to Kenya for short-term visits, business conferences, tourism, or transit.',
    officialPortal: 'etakenya.go.ke (Official Single Window)',
    estimatedTimeline: '34 to 72 Hours (Standard) · Premium expedited available within 24 hours',
    statutoryFeeNote: 'USD 35 (Approx. KSh 4,600) Government Processing Fee',
    requirements: [
      {
        id: 'req-eta-passport',
        label: 'Valid Passport (Minimum 6 Months Validity + 1 Blank Page)',
        isMandatory: true,
        whyNeeded: 'International civil aviation security protocol for entry clearance.',
        whatCounts: 'High-resolution color scan of bio-data page.',
        commonMistakes: 'Cropped or blurry passport photo page.',
      },
      {
        id: 'req-eta-photo',
        label: 'Passport-Style Selfie / Digital Photograph',
        isMandatory: true,
        whyNeeded: 'Biometric facial match during border arrival e-Gates.',
        whatCounts: 'Clear forward-facing selfie against a plain white or light background.',
        commonMistakes: 'Wearing sunglasses, caps, or photos with low lighting.',
      },
      {
        id: 'req-eta-flight',
        label: 'Flight Return / Onward Ticket & Accommodation Details',
        isMandatory: true,
        whyNeeded: 'Proof of itinerary and confirmed departure from Kenya.',
        whatCounts: 'Confirmed airline booking reference and hotel reservation or host invitation letter.',
        commonMistakes: 'Unconfirmed flight bookings.',
      },
    ],
    nextSteps: [
      { number: 1, title: 'Apply at Least 3 Days Prior to Travel', description: 'Visit etakenya.go.ke with valid passport and ticket details.' },
      { number: 2, title: 'Upload Bio-Data & Selfie', description: 'Fill travel itinerary, flight numbers, and contact details in Kenya.' },
      { number: 3, title: 'Remit Government Processing Fee', description: 'Pay USD 35 via debit/credit card.' },
      { number: 4, title: 'Receive eTA Authorization PDF', description: 'Check email and download the approved eTA certificate bearing QR verification code.' },
      { number: 5, title: 'Boarding & Border Arrival', description: 'Present electronic or printed eTA at airline check-in and Kenyan border control (JKIA, MIA).' },
    ],
    guideUrl: { page: 'service-detail', serviceId: 'immigration-visas', subCategoryId: 'visas' },
  },

  'company-registration': {
    serviceId: 'company-registration',
    subCategoryId: 'company-registration',
    categoryId: 'business-registration',
    serviceName: 'Private Limited Company Registration (LTD)',
    categoryName: 'Business & Company Registration',
    summary: 'Statutory incorporation of a Private Limited Company with the Business Registration Service (BRS) via eCitizen, providing corporate legal entity status, CR12 certificate, and corporate KRA PIN.',
    whyThisService: 'Recommended because you want to register a new legal company, start commercial operations, or open a corporate bank account in Kenya.',
    officialPortal: 'brs.ecitizen.go.ke (Business Registration Service)',
    estimatedTimeline: '3 to 5 Working Days',
    statutoryFeeNote: 'KSh 10,650 (Statutory BRS Incorporation & Registration Fee)',
    requirements: [
      {
        id: 'req-comp-name',
        label: '3 Proposed Company Names (in order of priority)',
        isMandatory: true,
        whyNeeded: 'BRS name search to ensure uniqueness and non-infringement of existing registered trademarks.',
        whatCounts: 'Distinctive company names ending in "Limited" or "LTD".',
        commonMistakes: 'Using generic single-word names already registered.',
      },
      {
        id: 'req-comp-directors',
        label: 'National IDs & KRA PINs of All Directors / Shareholders',
        isMandatory: true,
        whyNeeded: 'Identifies beneficial ownership and corporate governance compliance.',
        whatCounts: 'Clear color copy of ID/Passport and active KRA PIN certificate for every director.',
        commonMistakes: 'Directors having inactive or dormant KRA PIN records.',
      },
      {
        id: 'req-comp-address',
        label: 'Registered Physical & Postal Address in Kenya',
        isMandatory: true,
        whyNeeded: 'Legal domicile for statutory notices and county licensing.',
        whatCounts: 'Plot number, building name, street name, postal code, and contact email.',
        commonMistakes: 'Missing building or street name on Form CR1.',
      },
    ],
    nextSteps: [
      { number: 1, title: 'Name Search & Reservation', description: 'Submit 3 proposed names on BRS portal for statutory clearance.' },
      { number: 2, title: 'Draft Articles & Form CR1, CR2, CR8', description: 'Enter share capital, director bio-data, and registered physical address.' },
      { number: 3, title: 'Digital Signatures & Fee Payment', description: 'Upload signed statutory documents and remit KSh 10,650 BRS fee.' },
      { number: 4, title: 'Certificate of Incorporation & CR12', description: 'Download official digital Certificate of Incorporation and CR12 list of directors.' },
      { number: 5, title: 'Corporate KRA PIN & Bank Account', description: 'Auto-generate corporate KRA PIN and proceed to open commercial bank account.' },
    ],
    guideUrl: { page: 'service-detail', serviceId: 'business-registration', subCategoryId: 'company-registration' },
  },

  'ngo-registration': {
    serviceId: 'ngo-registration',
    subCategoryId: 'ngo-registration',
    categoryId: 'ngo-nonprofit',
    serviceName: 'NGO / Public Benefit Organization Registration',
    categoryName: 'NGO & Nonprofit Registration',
    summary: 'Statutory registration of non-governmental organizations and charitable foundations under the NGO Co-ordination Board pursuant to the Public Benefit Organizations Act.',
    whyThisService: 'Recommended because you are forming a non-profit organization, philanthropic foundation, or charitable institution in Kenya.',
    officialPortal: 'ngobureau.go.ke / eCitizen NGO Portal',
    estimatedTimeline: '60 to 90 Days (Includes national security vetting & inter-agency clearance)',
    statutoryFeeNote: 'KSh 16,000 (Local NGO) · KSh 30,000 (International NGO)',
    requirements: [
      {
        id: 'req-ngo-constitution',
        label: 'Standard NGO Constitution (Form 1 Schedule)',
        isMandatory: true,
        whyNeeded: 'Governing instrument defining non-profit objectives, membership, dissolution clause, and board powers.',
        whatCounts: 'Duly signed constitution by at least 3 top officials with certified contact details.',
        commonMistakes: 'Omitting the mandatory statutory dissolution clause transferring assets to similar non-profit entities.',
      },
      {
        id: 'req-ngo-officers',
        label: 'Credentials of 3 Executive Officials (Chairperson, Secretary, Treasurer)',
        isMandatory: true,
        whyNeeded: 'Security vetting by the National Security Council and civil background verification.',
        whatCounts: 'Original National IDs, KRA PINs, Police Clearance (Good Conduct), and passport photos.',
        commonMistakes: 'Officials without valid Police Clearance Certificates.',
      },
      {
        id: 'req-ngo-minutes',
        label: 'Minutes of Formation Meeting with List of Attendants',
        isMandatory: true,
        whyNeeded: 'Verifies statutory consent of founding members to register under the NGO Act.',
        whatCounts: 'Formal signed minutes with attendee register.',
        commonMistakes: 'Minutes not signed by Chairman and Secretary.',
      },
    ],
    nextSteps: [
      { number: 1, title: 'Name Reservation with NGO Board', description: 'Submit proposed NGO name on eCitizen NGO portal.' },
      { number: 2, title: 'Constitution & Form 3 Dossier Drafting', description: 'Prepare constitution, minutes, and personal profiles of officials.' },
      { number: 3, title: 'Submission & Statutory Vetting', description: 'Submit physical and electronic files to the NGO Co-ordination Board at Cooperative Bank House.' },
      { number: 4, title: 'Security & Ministerial Clearance', description: 'Inter-agency vetting by immigration and security departments.' },
      { number: 5, title: 'Issuance of Certificate of Registration', description: 'Receive perpetual Certificate of Registration under the NGO Act.' },
    ],
    guideUrl: { page: 'service-detail', serviceId: 'ngo-nonprofit', subCategoryId: 'ngo-registration' },
  },

  'tax-compliance': {
    serviceId: 'tax-compliance-sub',
    subCategoryId: 'tax-compliance-sub',
    categoryId: 'tax-compliance',
    serviceName: 'KRA Tax Compliance Certificate (TCC)',
    categoryName: 'Tax & Compliance',
    summary: 'Official Kenya Revenue Authority (KRA) certificate confirming that an individual or business has declared and paid all statutory taxes and filed all statutory returns.',
    whyThisService: 'Recommended because you need proof of clean tax standing for work permits, government tenders, bank facilities, or regulatory licenses.',
    officialPortal: 'itax.kra.go.ke (KRA iTax)',
    estimatedTimeline: '24 Hours to 3 Working Days (Instant if no tax arrears exist)',
    statutoryFeeNote: 'Free of Charge (Statutory government fee is Nil; pending tax assessments must be cleared)',
    requirements: [
      {
        id: 'req-tcc-pin',
        label: 'Active KRA PIN with iTax Login Credentials',
        isMandatory: true,
        whyNeeded: 'Accesses taxpayer ledger across VAT, Income Tax, and PAYE accounts.',
        whatCounts: 'Valid KRA PIN certificate.',
        commonMistakes: 'Forgotten iTax password or security question.',
      },
      {
        id: 'req-tcc-returns',
        label: 'Up-to-Date Annual & Monthly Returns Filings',
        isMandatory: true,
        whyNeeded: 'KRA automated compliance engine flags any unfiled statutory period.',
        whatCounts: 'Filed annual returns (Income Tax Resident/Non-Resident) and monthly returns (PAYE/VAT if registered).',
        commonMistakes: 'Unfiled nil returns for inactive periods generating automated statutory penalties.',
      },
    ],
    nextSteps: [
      { number: 1, title: 'Audit iTax Ledger', description: 'Log in to itax.kra.go.ke and check Debt/Repayment ledger for any outstanding liabilities.' },
      { number: 2, title: 'File Missing Returns & Clear Fines', description: 'Submit missing periods or apply for penalty waiver under valid circulars.' },
      { number: 3, title: 'Submit TCC Application Online', description: 'Navigate to "Certificates" -> "Apply for Tax Compliance Certificate".' },
      { number: 4, title: 'Automated Ledger Approval', description: 'If compliant, system issues TCC with QR verification code.' },
      { number: 5, title: 'Certificate Validity', description: 'Certificate remains valid for 12 calendar months from the date of issuance.' },
    ],
    guideUrl: { page: 'service-detail', serviceId: 'tax-compliance', subCategoryId: 'tax-compliance-sub' },
  },
};

// Progressive conversational question flow (One question at a time)
export const FIND_SERVICE_ROOT_QUESTION: ProgressiveQuestion = {
  id: 'q-root',
  prompt: 'What immigration or civic service do you need help with?',
  subPrompt: 'Select a core department below, or search in natural language.',
  options: [
    {
      id: 'opt-passport',
      label: 'Passport Services',
      subLabel: 'Apply, renew, or replace lost/damaged passport',
      nextQuestionId: 'q-passport-action',
    },
    {
      id: 'opt-work-permits',
      label: 'Work Permits & Passes',
      subLabel: 'Class D employment, Class G investor, or Special Pass',
      nextQuestionId: 'q-work-permit-action',
    },
    {
      id: 'opt-visas',
      label: 'Visas & Travel Authorisation (eTA)',
      subLabel: 'Tourism, short business visits, or transit clearance',
      result: DETAILED_SERVICE_RESULTS['eta-visa'],
    },
    {
      id: 'opt-business',
      label: 'Company & Business Registration',
      subLabel: 'Register a limited company (LTD), branch, or KRA PIN',
      result: DETAILED_SERVICE_RESULTS['company-registration'],
    },
    {
      id: 'opt-ngo',
      label: 'NGO & Non-Profit Registration',
      subLabel: 'Charitable foundation or PBO registration with NGO Board',
      result: DETAILED_SERVICE_RESULTS['ngo-registration'],
    },
    {
      id: 'opt-tax',
      label: 'Tax Compliance & KRA Clearance',
      subLabel: 'Obtain Tax Compliance Certificate (TCC) or KRA PIN',
      result: DETAILED_SERVICE_RESULTS['tax-compliance'],
    },
  ],
};

export const PROGRESSIVE_QUESTION_TREE: Record<string, ProgressiveQuestion> = {
  'q-passport-action': {
    id: 'q-passport-action',
    categoryContext: 'Passport Services',
    prompt: 'What would you like to do with your passport?',
    subPrompt: 'Choose the option that matches your current situation.',
    options: [
      {
        id: 'opt-renew',
        label: 'Renew My Existing Passport',
        subLabel: 'My passport has expired or is running out of validity/pages',
        nextQuestionId: 'q-passport-renew-available',
      },
      {
        id: 'opt-apply-first',
        label: 'Apply for My First Passport',
        subLabel: 'I have never had a Kenyan passport before',
        result: DETAILED_SERVICE_RESULTS['passport-new'],
      },
      {
        id: 'opt-lost',
        label: 'Replace a Lost or Stolen Passport',
        subLabel: 'My passport was lost, stolen, or misplaced',
        result: DETAILED_SERVICE_RESULTS['passport-lost-replace'],
      },
      {
        id: 'opt-damaged',
        label: 'Replace a Damaged or Mutilated Passport',
        subLabel: 'Passport booklet is water damaged, torn, or defaced',
        result: DETAILED_SERVICE_RESULTS['passport-renewal'],
      },
    ],
  },

  'q-passport-renew-available': {
    id: 'q-passport-renew-available',
    categoryContext: 'Passport Services · Renewal',
    prompt: 'Is your current physical passport available in your possession?',
    subPrompt: 'Immigration requires surrender of the physical booklet during renewal.',
    options: [
      {
        id: 'opt-avail-yes',
        label: 'Yes, I have the physical passport',
        subLabel: 'I can present it during the biometrics appointment',
        nextQuestionId: 'q-passport-renew-expired',
      },
      {
        id: 'opt-avail-no',
        label: 'No, I cannot locate the physical booklet',
        subLabel: 'It has been lost, stolen, or destroyed',
        result: DETAILED_SERVICE_RESULTS['passport-lost-replace'],
      },
    ],
  },

  'q-passport-renew-expired': {
    id: 'q-passport-renew-expired',
    categoryContext: 'Passport Services · Renewal',
    prompt: 'Has your current passport already expired?',
    subPrompt: 'Both expired passports and passports with under 6 months validity can be renewed.',
    options: [
      {
        id: 'opt-exp-yes',
        label: 'Yes, it has expired',
        subLabel: 'Expired booklets can be renewed without statutory fine',
        result: DETAILED_SERVICE_RESULTS['passport-renewal'],
      },
      {
        id: 'opt-exp-no',
        label: 'No, but validity is ending or pages are full',
        subLabel: 'Passports with under 6 months validity can be renewed anytime',
        result: DETAILED_SERVICE_RESULTS['passport-renewal'],
      },
    ],
  },

  'q-work-permit-action': {
    id: 'q-work-permit-action',
    categoryContext: 'Work Permits & Passes',
    prompt: 'What type of authorization best describes your engagement in Kenya?',
    subPrompt: 'Work authorizations are categorized by the nature of employment or investment.',
    options: [
      {
        id: 'opt-wp-employed',
        label: 'Employed Expatriate / Specialist (Class D)',
        subLabel: 'Offered specific employment by a registered Kenyan organization',
        result: DETAILED_SERVICE_RESULTS['work-permit-class-d'],
      },
      {
        id: 'opt-wp-investor',
        label: 'Investor / Business Owner (Class G)',
        subLabel: 'Investing capital ($100k+) in a registered business enterprise',
        result: DETAILED_SERVICE_RESULTS['work-permit-class-g'],
      },
      {
        id: 'opt-wp-special',
        label: 'Short-Term Work / Consulting (Special Pass)',
        subLabel: 'Temporary assignment of 1 to 6 months duration',
        result: DETAILED_SERVICE_RESULTS['special-pass'],
      },
      {
        id: 'opt-wp-dependent',
        label: 'Spouse or Child of Permit Holder (Dependent Pass)',
        subLabel: 'Lawful stay for family members of expatriates or residents',
        result: {
          serviceId: 'dependent-passes',
          subCategoryId: 'dependent-passes',
          categoryId: 'immigration-visas',
          serviceName: 'Dependent Pass for Family Members',
          categoryName: 'Immigration & Visas',
          summary: 'Statutory authorization for spouses and children under 21 of primary work permit holders, investors, or permanent residents.',
          whyThisService: 'Recommended because you are a dependent family member seeking legal residence tied to a primary permit holder.',
          officialPortal: 'fns.immigration.go.ke (eFNS)',
          estimatedTimeline: '2 to 4 Weeks',
          statutoryFeeNote: 'KSh 10,000 Processing · KSh 20,000 Issuance per year',
          requirements: [
            {
              id: 'req-dp-primary-permit',
              label: 'Copy of Primary Sponsor Valid Work Permit / Alien Card',
              isMandatory: true,
              whyNeeded: 'Establishes lawful basis for dependent residence in Kenya.',
              whatCounts: 'Current work permit endorsement and valid foreign national certificate.',
              commonMistakes: 'Applying before primary work permit is approved and issued.',
            },
            {
              id: 'req-dp-marriage-birth',
              label: 'Marriage Certificate (Spouse) / Birth Certificate (Children)',
              isMandatory: true,
              whyNeeded: 'Proves statutory legal relationship to the primary sponsor.',
              whatCounts: 'Certified civil registration marriage/birth certificates (translated to English if foreign).',
              commonMistakes: 'Uncertified foreign certificates.',
            },
          ],
          nextSteps: [
            { number: 1, title: 'Compile Relationship Documents', description: 'Gather marriage or birth certificates and primary sponsor permit endorsement.' },
            { number: 2, title: 'Submit Dependent Pass on eFNS', description: 'Upload dossier under sponsor company or individual account.' },
            { number: 3, title: 'Immigration Review', description: 'Directorate of Immigration assesses relationship and sponsor financial standing.' },
            { number: 4, title: 'Issuance & Endorsement', description: 'Pay statutory issuance fee and obtain passport endorsement stamp.' },
          ],
          guideUrl: { page: 'service-detail', serviceId: 'immigration-visas', subCategoryId: 'dependent-passes' },
        },
      },
    ],
  },
};

// Natural language query matcher
export function matchServiceByNaturalLanguage(query: string): {
  bestMatch: PersonalizedServiceResult;
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
  otherPossibilities: PersonalizedServiceResult[];
} {
  const clean = query.trim().toLowerCase();

  if (
    clean.includes('lost') ||
    clean.includes('stolen') ||
    clean.includes('misplaced') ||
    clean.includes('abstract')
  ) {
    return {
      bestMatch: DETAILED_SERVICE_RESULTS['passport-lost-replace'],
      confidence: 'high',
      explanation: "Because you've reported a lost passport, this service may be relevant.",
      otherPossibilities: [
        DETAILED_SERVICE_RESULTS['passport-renewal'],
        DETAILED_SERVICE_RESULTS['passport-new'],
      ],
    };
  }

  if (
    clean.includes('renew') ||
    clean.includes('expired') ||
    clean.includes('validity') ||
    clean.includes('pages full')
  ) {
    if (clean.includes('permit') || clean.includes('work')) {
      return {
        bestMatch: DETAILED_SERVICE_RESULTS['work-permit-class-d'],
        confidence: 'high',
        explanation: 'Because your query references renewing work authorization, a work permit renewal process via eFNS is relevant.',
        otherPossibilities: [
          DETAILED_SERVICE_RESULTS['special-pass'],
          DETAILED_SERVICE_RESULTS['work-permit-class-g'],
        ],
      };
    }
    return {
      bestMatch: DETAILED_SERVICE_RESULTS['passport-renewal'],
      confidence: 'high',
      explanation: 'Because your current travel document has expired or is nearing expiration, standard passport renewal applies.',
      otherPossibilities: [
        DETAILED_SERVICE_RESULTS['passport-new'],
        DETAILED_SERVICE_RESULTS['passport-lost-replace'],
      ],
    };
  }

  if (
    clean.includes('passport') ||
    clean.includes('nyayo') ||
    clean.includes('travel document')
  ) {
    return {
      bestMatch: DETAILED_SERVICE_RESULTS['passport-renewal'],
      confidence: 'medium',
      explanation: 'Based on your passport inquiry, this procedural guide outlines the necessary application and renewal requirements.',
      otherPossibilities: [
        DETAILED_SERVICE_RESULTS['passport-new'],
        DETAILED_SERVICE_RESULTS['passport-lost-replace'],
      ],
    };
  }

  if (
    clean.includes('work') ||
    clean.includes('permit') ||
    clean.includes('employment') ||
    clean.includes('job') ||
    clean.includes('hire') ||
    clean.includes('expatriate') ||
    clean.includes('foreign worker')
  ) {
    return {
      bestMatch: DETAILED_SERVICE_RESULTS['work-permit-class-d'],
      confidence: 'high',
      explanation: 'For expatriate employment in Kenya, a statutory Class D Work Permit with a Kenyan understudy is mandated.',
      otherPossibilities: [
        DETAILED_SERVICE_RESULTS['special-pass'],
        DETAILED_SERVICE_RESULTS['work-permit-class-g'],
      ],
    };
  }

  if (
    clean.includes('invest') ||
    clean.includes('investor') ||
    clean.includes('capital') ||
    clean.includes('business permit') ||
    clean.includes('entrepreneur')
  ) {
    return {
      bestMatch: DETAILED_SERVICE_RESULTS['work-permit-class-g'],
      confidence: 'high',
      explanation: 'For foreign investors establishing commercial trade with capital investment ($100k+), Class G Permit is the designated statutory pathway.',
      otherPossibilities: [
        DETAILED_SERVICE_RESULTS['company-registration'],
        DETAILED_SERVICE_RESULTS['work-permit-class-d'],
      ],
    };
  }

  if (
    clean.includes('short term') ||
    clean.includes('consultant') ||
    clean.includes('temporary') ||
    clean.includes('special pass') ||
    clean.includes('emergency')
  ) {
    return {
      bestMatch: DETAILED_SERVICE_RESULTS['special-pass'],
      confidence: 'high',
      explanation: 'For temporary professional assignments under 6 months, a Special Pass provides rapid legal authorization.',
      otherPossibilities: [
        DETAILED_SERVICE_RESULTS['work-permit-class-d'],
        DETAILED_SERVICE_RESULTS['eta-visa'],
      ],
    };
  }

  if (
    clean.includes('visa') ||
    clean.includes('eta') ||
    clean.includes('tourism') ||
    clean.includes('travel to kenya') ||
    clean.includes('entering kenya')
  ) {
    return {
      bestMatch: DETAILED_SERVICE_RESULTS['eta-visa'],
      confidence: 'high',
      explanation: 'All international travelers visiting Kenya must hold a valid electronic Travel Authorisation (eTA) prior to boarding.',
      otherPossibilities: [
        DETAILED_SERVICE_RESULTS['special-pass'],
        DETAILED_SERVICE_RESULTS['work-permit-class-d'],
      ],
    };
  }

  if (
    clean.includes('company') ||
    clean.includes('business') ||
    clean.includes('ltd') ||
    clean.includes('register business') ||
    clean.includes('incorporation')
  ) {
    return {
      bestMatch: DETAILED_SERVICE_RESULTS['company-registration'],
      confidence: 'high',
      explanation: 'For starting a legal commercial venture in Kenya, Private Limited Company registration via BRS provides corporate standing.',
      otherPossibilities: [
        DETAILED_SERVICE_RESULTS['tax-compliance'],
        DETAILED_SERVICE_RESULTS['work-permit-class-g'],
      ],
    };
  }

  if (
    clean.includes('ngo') ||
    clean.includes('nonprofit') ||
    clean.includes('charity') ||
    clean.includes('foundation') ||
    clean.includes('cbo') ||
    clean.includes('pbo')
  ) {
    return {
      bestMatch: DETAILED_SERVICE_RESULTS['ngo-registration'],
      confidence: 'high',
      explanation: 'Non-profit and philanthropic organizations must obtain statutory gazettement from the NGO Co-ordination Board.',
      otherPossibilities: [
        DETAILED_SERVICE_RESULTS['company-registration'],
        DETAILED_SERVICE_RESULTS['tax-compliance'],
      ],
    };
  }

  if (
    clean.includes('tax') ||
    clean.includes('kra') ||
    clean.includes('tcc') ||
    clean.includes('compliance') ||
    clean.includes('pin')
  ) {
    return {
      bestMatch: DETAILED_SERVICE_RESULTS['tax-compliance'],
      confidence: 'high',
      explanation: 'A KRA Tax Compliance Certificate (TCC) confirms all statutory tax obligations and returns are in good standing.',
      otherPossibilities: [
        DETAILED_SERVICE_RESULTS['company-registration'],
        DETAILED_SERVICE_RESULTS['work-permit-class-d'],
      ],
    };
  }

  // Default fallback match
  return {
    bestMatch: DETAILED_SERVICE_RESULTS['passport-renewal'],
    confidence: 'low',
    explanation: 'Based on your inquiry, here is a primary government document service. You can also explore work permits or business registration.',
    otherPossibilities: [
      DETAILED_SERVICE_RESULTS['work-permit-class-d'],
      DETAILED_SERVICE_RESULTS['eta-visa'],
      DETAILED_SERVICE_RESULTS['company-registration'],
    ],
  };
}
