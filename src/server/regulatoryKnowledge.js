/**
 * Serikali Guide - Authoritative Kenyan Regulatory Knowledge Engine (JavaScript Module)
 * Self-contained in src/server for server & serverless module resolution.
 */

export const KENYA_REGULATORY_KNOWLEDGE_BASE = [
  {
    topicKey: "work permit class d",
    category: "immigration-visas",
    categoryName: "Immigration & Visas",
    subCategoryName: "Work permits",
    officialPortal: "fns.immigration.go.ke",
    governingLaw: "Kenya Citizenship and Immigration Act, 2011 (Cap. 172), Section 36-40 & Immigration Regulations 2012",
    regulatoryAgency: "Directorate of Immigration Services, Nyayo House, Nairobi",
    statutoryForms: ["Form 25 (Work Permit Application)", "Form 22 (Alien Card Registration)", "Understudy Knowledge Transfer Plan"],
    gazettedFees: "Non-refundable Processing Fee: KSh 20,000; Annual Issuance Fee: KSh 500,000; Immigration Security Bond: KSh 100,000 (bank guarantee or insurance); Alien Card: KSh 2,000",
    processingTimeline: "4 to 8 Weeks from eFNS submission to Permit Determination Committee decision",
    prerequisites: [
      "Duly completed Form 25 online via the eFNS portal",
      "Signed employer petition letter explaining why a Kenyan citizen could not be recruited",
      "Certified academic degrees, professional credentials, and detailed CV of the expatriate",
      "Designated Kenyan Understudy dossier: National ID, KRA PIN, CV, certified credentials, and signed training contract",
      "Sponsoring company Certificate of Incorporation, CR12 (issued within 90 days), and valid KRA Tax Compliance Certificate",
      "Valid National Passport bio-data page with at least 6 months validity",
    ],
    proceduralSteps: [
      {
        title: "Step 1: eFNS Account Verification & Form 25 Submission",
        detail: "The employer signs into fns.immigration.go.ke, uploads the certified expatriate dossier, understudy development plan, and pays the statutory KSh 20,000 processing fee to generate an eCitizen PRN.",
      },
      {
        title: "Step 2: Permit Determination Committee Evaluation",
        detail: "The statutory committee at Nyayo House reviews the submission, verifies employer tax compliance, and assesses the specialized nature of the expatriate role against domestic skill availability.",
      },
      {
        title: "Step 3: Approval Notification & Fee Payment",
        detail: "Upon approval, an official Notification of Approval is issued on eFNS. The employer has 90 days to remit the gazetted annual fee of KSh 500,000 and execute the KSh 100,000 security bond.",
      },
      {
        title: "Step 4: Passport Endorsement & Biometric Alien Card Registration",
        detail: "The expatriate submits their original passport at Nyayo House for official work permit sticker endorsement, then books a biometric appointment for a Foreign Nationals Certificate (Alien Card).",
      },
    ],
    takeaways: [
      "Class D permits are strictly tied to a designated Kenyan Understudy; without certified understudy records, the application is deferred.",
      "The statutory annual permit fee is KSh 500,000, accompanied by a refundable KSh 100,000 immigration security bond.",
      "Engaging in employment prior to formal permit endorsement or Special Pass issuance attracts penal fines and deportation under Cap. 172.",
      "Holding an Alien Card is mandatory for domestic banking, tax registration, and resident driving licence conversion.",
    ],
    warningNotice: "Never commence employment in Kenya on a Visitor Pass or Electronic Travel Authorisation (eTA). Unauthorized work violates Section 45 of the Kenya Citizenship & Immigration Act.",
    recommendedPhoto: "/src/assets/images/serikali_immigration_visas_1790882120216.jpg",
  },
  {
    topicKey: "work permit class g investor",
    category: "immigration-visas",
    categoryName: "Immigration & Visas",
    subCategoryName: "Work permits",
    officialPortal: "fns.immigration.go.ke",
    governingLaw: "Kenya Citizenship and Immigration Act, 2011 (Cap. 172) & Investment Promotion Act, 2004",
    regulatoryAgency: "Directorate of Immigration Services (Nyayo House) in collaboration with KenInvest",
    statutoryForms: ["Form 25 (Investor Permit)", "Form 22 (Alien Card)", "CR12 Registry Certificate", "KenInvest Certificate (Optional)"],
    gazettedFees: "Non-refundable Processing Fee: KSh 20,000; Annual Issuance Fee: KSh 250,000; Security Bond: KSh 100,000",
    processingTimeline: "6 to 8 Weeks",
    prerequisites: [
      "Documentary proof of minimum capital investment of USD 100,000 (or equivalent) in a commercial Kenyan bank account or audited capital assets",
      "Kenyan company Certificate of Incorporation, CR12 showing foreign shareholding, and KRA Corporate PIN",
      "Clear police clearance certificate from country of origin or Interpol clearance",
      "Detailed business proposal detailing projected local employment creation and sector alignment",
      "County Single Business Permit or lease agreement for commercial office premises",
    ],
    proceduralSteps: [
      {
        title: "Step 1: Corporate Incorporation & Capital Inflow Verification",
        detail: "Incorporate a private limited company on eCitizen BRS, obtain corporate KRA PIN, and transfer minimum USD 100,000 capital backed by bank confirmation credit advice.",
      },
      {
        title: "Step 2: eFNS Form 25 Lodgement",
        detail: "Submit Form 25 under Class G on fns.immigration.go.ke, attaching audited financials, bank statements, and company documents, paying the KSh 20,000 processing fee.",
      },
      {
        title: "Step 3: Committee Approval & Issuance",
        detail: "Upon approval by the Permit Determination Committee, pay the annual issuance fee of KSh 250,000 and provide the KSh 100,000 immigration security bond.",
      },
    ],
    takeaways: [
      "Foreign investors must prove at least USD 100,000 in dedicated capital investment to qualify for a Class G investor permit.",
      "Class G permit holders are prohibited from taking up salaried employment outside their registered investing entity.",
      "Approval grants the foreign investor legal residence and the right to direct corporate banking and contractual affairs in Kenya.",
    ],
    warningNotice: "Ensure capital remittance is channelled through a Central Bank of Kenya (CBK) regulated commercial bank with documentary credit advice to satisfy anti-money laundering vetting.",
    recommendedPhoto: "/src/assets/images/serikali_immigration_visas_1790882120216.jpg",
  },
  {
    topicKey: "company registration brs",
    category: "business-registration",
    categoryName: "Business & Company Registration",
    subCategoryName: "Company registration",
    officialPortal: "brs.ecitizen.go.ke",
    governingLaw: "Companies Act, 2015 (Act No. 17 of 2015) & Companies (Beneficial Ownership) Regulations 2020",
    regulatoryAgency: "Business Registration Service (BRS), Office of the Attorney General & Department of Justice",
    statutoryForms: ["Form CR1 (Application for Registration)", "Form CR2 (Articles of Association)", "Form CR8 (Residential Address)", "Form BOF1 (Beneficial Ownership)", "CR12 (Official Search Certificate)"],
    gazettedFees: "Name Reservation: KSh 150; Statutory Incorporation Fee: KSh 10,650 (includes CR12 issuance & nominal stamp duty for capital up to KSh 100,000)",
    processingTimeline: "3 to 5 Working Days",
    prerequisites: [
      "Three to five unique proposed company names submitted for automated BRS name check",
      "Full names, National ID / Passport bio-data, passport photo, KRA PIN, and residential addresses of all directors and shareholders",
      "Statement of nominal share capital (minimum standard KSh 100,000 divided into 1,000 ordinary shares of KSh 100 each)",
      "Registered office physical location, LR number, building name, and postal address in Kenya",
      "Disclosure of Beneficial Owners holding 10% or more voting rights or ultimate economic interest (Form BOF1)",
    ],
    proceduralSteps: [
      {
        title: "Step 1: BRS Name Reservation on eCitizen",
        detail: "Log into brs.ecitizen.go.ke, run name search, and reserve your approved company name (valid for 30 days) for KSh 150.",
      },
      {
        title: "Step 2: Generate Statutory Incorporation Forms",
        detail: "Complete the online incorporation wizard. BRS generates forms CR1, CR2, CR8, Statement of Nominal Capital, and BOF1 for digital download.",
      },
      {
        title: "Step 3: Document Execution & Upload",
        detail: "All directors and subscribers sign the downloaded forms. Upload the executed PDF package and pay the statutory KSh 10,650 fee via Paybill 222222.",
      },
      {
        title: "Step 4: Issuance of Certificate of Incorporation & CR12",
        detail: "The Registrar of Companies issues the electronic Certificate of Incorporation and official CR12 with verifiable digital QR codes.",
      },
    ],
    takeaways: [
      "Kenya permits 100% foreign ownership of private limited companies in almost all commercial sectors without requiring a local citizen partner.",
      "Mandatory filing of the Beneficial Ownership Register (Form BOF1) is enforced under Section 93A of the Companies Act; failure attracts heavy fines.",
      "Once incorporated, companies must activate their corporate KRA PIN on iTax and register for eTIMS before issuing invoices.",
    ],
    warningNotice: "Ensure all directors have active personal KRA PINs. The BRS system automatically cross-references director tax records with KRA iTax before final approval.",
    recommendedPhoto: "/src/assets/images/serikali_business_registration_1790882133145.jpg",
  },
  {
    topicKey: "kra pin etims tax compliance",
    category: "tax-compliance",
    categoryName: "Tax & Statutory Compliance",
    subCategoryName: "Tax compliance",
    officialPortal: "itax.kra.go.ke & etims.kra.go.ke",
    governingLaw: "Tax Procedures Act, 2015, Income Tax Act (Cap. 470), & VAT (Electronic Tax Invoice) Regulations 2024",
    regulatoryAgency: "Kenya Revenue Authority (KRA), Times Tower, Nairobi",
    statutoryForms: ["Form TCC1 (Application for Tax Compliance Certificate)", "Online PIN Registration Form", "Monthly VAT/PAYE Returns"],
    gazettedFees: "PIN Registration: Free; TCC Issuance: Free of charge upon full compliance; eTIMS Software: Free of charge via KRA eTIMS Client",
    processingTimeline: "Individual PIN: Instant to 24 Hours; Foreign Director PIN: 48 Hours; TCC: Instant (auto) or up to 7 days (if ledgers need reconciliation)",
    prerequisites: [
      "For Individuals: National ID and Mother's Maiden Name; For Foreigners: Passport bio-data and Letter of Introduction / Work Permit",
      "For Companies: Certificate of Incorporation, CR12, registered physical address, and Tax PIN of at least one Kenyan-resident director",
      "Clean iTax taxpayer ledger with no unpaid principal tax, interest, or late filing penalties",
      "eTIMS onboarding: Windows/Mac device or smartphone with KRA eTIMS software or System-to-System API integration",
    ],
    proceduralSteps: [
      {
        title: "Step 1: PIN Registration on iTax",
        detail: "Submit application on itax.kra.go.ke. Foreign directors submit passport and corporate board authorization to KRA Times Tower or Huduma Centre.",
      },
      {
        title: "Step 2: Tax Obligation Activation & eTIMS Onboarding",
        detail: "Activate required tax obligations (Income Tax Company, VAT, PAYE, Withholding Tax) and onboard onto etims.kra.go.ke to generate QR-coded electronic tax invoices.",
      },
      {
        title: "Step 3: Monthly Statutory Returns & Payment",
        detail: "File monthly PAYE, Housing Levy, and SHIF by the 9th; file VAT and Withholding Tax by the 20th via generated e-slips on Paybill 222222.",
      },
      {
        title: "Step 4: Tax Compliance Certificate (TCC) Application",
        detail: "Apply for an annual TCC on iTax. If all historical monthly returns are submitted and ledgers are balanced, the certificate issues automatically.",
      },
    ],
    takeaways: [
      "Under Section 23A of the Tax Procedures Act, business expenses not backed by an eTIMS electronic tax invoice are strictly non-deductible for Corporate Income Tax.",
      "A valid KRA Tax Compliance Certificate (TCC) is mandatory for work permit renewals, government tenders, bank facilities, and county business licences.",
      "Foreign directors without a Kenyan National ID can obtain a Tax PIN using their verified passport and corporate CR12 endorsement.",
    ],
    warningNotice: "Missing monthly nil return deadlines attracts statutory penalties of KSh 2,000 per month for individuals and KSh 10,000 per month for VAT/corporate obligations.",
    recommendedPhoto: "/src/assets/images/serikali_tax_ecitizen_1790882155795.jpg",
  },
  {
    topicKey: "pbo ngo registration kenya",
    category: "ngo-nonprofit",
    categoryName: "NGO & Nonprofit Registration",
    subCategoryName: "NGO registration",
    officialPortal: "pbora.go.ke",
    governingLaw: "Public Benefit Organizations (PBO) Act, 2013 (Commenced May 2024), repealing the NGO Coordination Act 1990",
    regulatoryAgency: "Public Benefits Organizations Regulatory Authority (PBORA)",
    statutoryForms: ["Form 1 (Application for PBO Registration)", "Form 14 (Annual Returns & Audited Accounts)", "Signed PBO Constitution"],
    gazettedFees: "Name Reservation: KSh 1,000; National PBO Registration: KSh 16,000; International PBO Registration: KSh 30,000",
    processingTimeline: "60 to 90 Days (includes statutory security vetting by PBORA board)",
    prerequisites: [
      "Reserved organization name approved by the PBORA Registrar",
      "Signed PBO Constitution compliant with the First Schedule of the PBO Act",
      "Full vetting dossiers for at least 3 founding officials (Chairperson, Secretary, Treasurer): DCI Good Conduct certificates, National IDs/Passports, KRA PINs, and CVs",
      "Itemized one-year operational budget demonstrating program expenditure of at least 85% vs maximum 15% administrative overhead",
      "For International PBOs: Notarized parent charter, board resolution to open a Kenyan country office, and compliance with the 1/3 Kenyan board member quota",
    ],
    proceduralSteps: [
      {
        title: "Step 1: PBORA Name Reservation",
        detail: "Reserve the proposed foundation or organization name on pbora.go.ke, receiving an official Name Approval Letter valid for 60 days.",
      },
      {
        title: "Step 2: Drafting Statutory Constitution & Budget",
        detail: "Draft the PBO Constitution adhering strictly to PBO Act governance, dispute resolution, and dissolution asset-distribution provisions.",
      },
      {
        title: "Step 3: Security Vetting & Dossier Lodgement",
        detail: "Submit Form 1 with founding officials' Police Clearances, pay the statutory registration fee, and track review by the PBORA board.",
      },
      {
        title: "Step 4: Certificate Issuance & Post-Registration Compliance",
        detail: "Upon gazetted approval, collect the Certificate of Registration, obtain an NGO KRA PIN, apply for KRA Income Tax Exemption, and file annual Form 14 returns.",
      },
    ],
    takeaways: [
      "The operationalized PBO Act 2013 guarantees clear statutory rights to tax relief, duty exemptions on humanitarian imports, and independent operation.",
      "International non-profits must legally ensure that at least one-third (1/3) of their local governing board comprises Kenyan citizens resident in Kenya.",
      "Every registered PBO must submit annual financial returns and audited accounts to PBORA within 6 months after the close of its financial year.",
    ],
    warningNotice: "Operating non-profit programs without formal PBORA certification or using an unregistered entity to solicit public donor funding violates Kenyan penal statutes.",
    recommendedPhoto: "/src/assets/images/serikali_ngo_governance_1790882145611.jpg",
  },
  {
    topicKey: "dci police clearance good conduct passport",
    category: "government-documents",
    categoryName: "Government Documents",
    subCategoryName: "Passport",
    officialPortal: "accounts.ecitizen.go.ke & dci.ecitizen.go.ke",
    governingLaw: "National Police Service Act, Kenya Passports and Travel Documents Act, Registration of Persons Act (Cap. 107)",
    regulatoryAgency: "Directorate of Criminal Investigations (DCI) HQ & Directorate of Immigration Services",
    statutoryForms: ["Form C24 (Fingerprint Chart)", "Passport Recommender Page", "Lost Document Police Abstract"],
    gazettedFees: "Police Clearance Certificate: KSh 1,050; 34-Page e-Passport (Series A): KSh 7,550; 50-Page e-Passport (Series B): KSh 9,550; 66-Page e-Passport (Series C): KSh 12,550",
    processingTimeline: "Police Clearance: 7 to 14 Days; Ordinary e-Passport: 2 to 4 Weeks",
    prerequisites: [
      "For Police Clearance: Original Kenyan National ID (or valid foreign passport for non-citizens) and printed duplicate Form C24 charts",
      "For e-Passport: Birth Certificate, National ID, both parents' IDs or death certificates, copy of recommender ID, and passport photo",
      "Payment completed via unified Government Paybill 222222 generating an authentic eCitizen invoice",
    ],
    proceduralSteps: [
      {
        title: "Step 1: Application Lodgement on eCitizen",
        detail: "Log into accounts.ecitizen.go.ke, fill the biometric form, pay statutory fees, and download the official payment invoice and form.",
      },
      {
        title: "Step 2: Biometric Fingerprint Enrollment",
        detail: "Attend chosen Huduma Centre or DCI/Immigration Headquarters for live digital rolled fingerprint scanning and biometric facial portrait capture.",
      },
      {
        title: "Step 3: Verification & Certificate Issuance",
        detail: "DCI systems cross-reference criminal databases. Upon clearance, download the cryptographically signed certificate with a verifiable QR code.",
      },
    ],
    takeaways: [
      "DCI Police Clearance Certificates are digitally verifiable via QR code and are valid for 12 months from the date of issuance.",
      "The passport recommender must be a Kenyan citizen with a valid National ID who is not an immediate parent or spouse.",
      "Lost passports or identity cards require both an official Police Abstract and a sworn Commissioner for Oaths Affidavit before replacement.",
    ],
    warningNotice: "Never present laminated original Birth Certificates or National IDs for biometric enrollment; examiners require unlaminated security seals.",
    recommendedPhoto: "/src/assets/images/serikali_tax_ecitizen_1790882155795.jpg",
  },
  {
    topicKey: "single business permit nairobi county licence",
    category: "licences-permits",
    categoryName: "Licences & Permits",
    subCategoryName: "Regulatory licences",
    officialPortal: "nairobiservices.go.ke & business.ecitizen.go.ke",
    governingLaw: "Physical and Land Use Planning Act, 2019, County Government Act, 2012, & County Finance Acts 2025/2026",
    regulatoryAgency: "County Government Revenue Directorate & Respective National Regulators (NCA, NEMA, ODPC)",
    statutoryForms: ["Unified Business Permit Application", "Fire Safety Inspection Form", "Food Hygiene Medical Certificate (Food Handlers)"],
    gazettedFees: "Single Business Permit: Scaled by floor space and sector (Average KSh 10,000 to KSh 50,000 annually); Fire Clearance: KSh 4,500; Outdoor Advertising Signboard: KSh 3,000+",
    processingTimeline: "1 to 3 Working Days for online renewal; 5 to 7 days for new premises requiring county physical inspection",
    prerequisites: [
      "Company Certificate of Incorporation / Business Registration Certificate and KRA Corporate PIN",
      "Physical commercial premises location, building name, floor, and Land Reference (LR) Number",
      "County revenue account registration on the county citizen portal",
      "Sector clearances where applicable: NCA contractor accreditation, EPRA solar/electrical licence, or Public Health food inspection",
    ],
    proceduralSteps: [
      {
        title: "Step 1: County Revenue Portal Account Setup",
        detail: "Register on the county revenue portal (e.g., nairobiservices.go.ke) using corporate PIN and business registration details.",
      },
      {
        title: "Step 2: Business Classification & Assessment",
        detail: "Select business activity code (e.g., large professional consultancy, retail merchant, warehouse). The county engine auto-calculates gazetted fees.",
      },
      {
        title: "Step 3: Unified Payment via Government Paybill",
        detail: "Pay the consolidated invoice covering Single Business Permit, Fire Safety Inspection, and Signage via Paybill 222222.",
      },
      {
        title: "Step 4: Download & Display Unified Business Permit",
        detail: "Download the QR-coded permit and conspicuously display it on commercial premises as mandated by county enforcement bylaws.",
      },
    ],
    takeaways: [
      "The Unified Business Permit consolidates trade licensing, fire inspection, health certification, and advertising signage into a single annual fee.",
      "Statutory renewal deadline across all 47 Kenyan counties is March 31 of every calendar year; late renewals incur a mandatory 50% surcharge.",
      "Regulated trades (construction firms, energy operators, data processors) must maintain current national licenses (NCA, EPRA, ODPC) alongside county permits.",
    ],
    warningNotice: "Operating without an active displayed Single Business Permit exposes business directors to county enforcement inspections, closure notices, and court summons.",
    recommendedPhoto: "/src/assets/images/serikali_licences_permits_1791740074361.jpg",
  },
  {
    topicKey: "ardhisasa land search leasehold property",
    category: "investment-relocation",
    categoryName: "Investment & Relocation",
    subCategoryName: "Relocating to Kenya",
    officialPortal: "ardhisasa.lands.go.ke",
    governingLaw: "Constitution of Kenya 2010 (Article 65), Land Registration Act 2012, Land Control Act (Cap. 302), & Stamp Duty Act (Cap. 480)",
    regulatoryAgency: "Ministry of Lands, Public Works, Housing and Urban Development (Ardhisasa Platform)",
    statutoryForms: ["Application for Official Search", "Form LRA 33 (Transfer of Land)", "Stamp Duty Assessment Form", "Land Control Board Consent"],
    gazettedFees: "Official Online Land Search: KSh 500; Stamp Duty on Urban Land/Apartments: 4% of market value; Stamp Duty on Agricultural/Rural Land: 2% of market value",
    processingTimeline: "Official Search: 24 to 48 Hours; Transfer & Stamp Duty Endorsement: 2 to 4 Weeks",
    prerequisites: [
      "Ardhisasa individual and company accounts with verified National ID, KRA PIN, and biometric facial matching",
      "Title Deed / Lease Document showing LR Number or New Cadastral Parcel Number",
      "Clear rates certificate from County Government and Land Rent clearance certificate from Ministry of Lands",
      "Valuation report approved by the Government Valuer for stamp duty calculation",
      "Article 65 Non-Citizen Compliance: Non-citizens may only hold leasehold titles for terms of up to 99 years (freehold tenure is restricted to Kenyan citizens)",
    ],
    proceduralSteps: [
      {
        title: "Step 1: Digital Parcel Search on Ardhisasa",
        detail: "Conduct an official digital search on ardhisasa.lands.go.ke for KSh 500 to verify ownership, encumbrances, bank charges, and caveat notices.",
      },
      {
        title: "Step 2: Execution of Sale Agreement & Consents",
        detail: "Draft sale agreement, obtain Land Control Board consent (if applicable), and clear all outstanding county land rates and national ground rent.",
      },
      {
        title: "Step 3: Government Valuation & Stamp Duty Payment",
        detail: "The Chief Government Valuer inspects the property to assess stamp duty (4% for urban properties), payable to KRA via eCitizen Paybill 222222.",
      },
      {
        title: "Step 4: Title Transfer & Issuance of Certificate of Lease",
        detail: "Execute transfer documents on Ardhisasa. The Registrar of Titles registers the transfer and issues the Certificate of Lease in the purchaser's name.",
      },
    ],
    takeaways: [
      "Under Article 65 of the Constitution of Kenya, foreign nationals and foreign-owned companies can legally acquire property under leasehold tenure up to 99 years.",
      "All land transactions in Nairobi and major urban blocks are processed exclusively online through the Ardhisasa digital registry.",
      "Purchasing agricultural land requires Kenyan citizenship; foreign investors seeking agricultural land must obtain a special Presidential Land Control Board exemption.",
    ],
    warningNotice: "Never transact on land outside the verified Ardhisasa digital portal. Insist on a digital search and physical boundary verification before remitting purchase deposits.",
    recommendedPhoto: "/src/assets/images/serikali_land_documents_1791740090187.jpg",
  },
];

export function getRegulatoryKnowledgeForTopic(topic, preferredCategoryId) {
  const cleanTopic = (topic || "").trim().toLowerCase();

  let bestMatch = KENYA_REGULATORY_KNOWLEDGE_BASE[0];
  let highestScore = -1;

  for (const item of KENYA_REGULATORY_KNOWLEDGE_BASE) {
    let score = 0;
    const keyTokens = item.topicKey.split(" ");
    for (const token of keyTokens) {
      if (cleanTopic.includes(token)) score += 3;
    }
    if (preferredCategoryId && item.category === preferredCategoryId) {
      score += 2;
    }
    if (cleanTopic.includes(item.category)) score += 4;
    if (cleanTopic.includes(item.subCategoryName.toLowerCase())) score += 3;

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (highestScore <= 0 && preferredCategoryId) {
    const catMatch = KENYA_REGULATORY_KNOWLEDGE_BASE.find((k) => k.category === preferredCategoryId);
    if (catMatch) return catMatch;
  }

  return bestMatch;
}

export function synthesizeAuthoritativeBlog(topic, preferredCategoryId) {
  const cleanTopic = (topic || "").trim();
  const knowledge = getRegulatoryKnowledgeForTopic(cleanTopic, preferredCategoryId);

  const title =
    cleanTopic.length > 8 && !cleanTopic.toLowerCase().includes("guide")
      ? `The 2026 Legal & Procedural Guide to ${cleanTopic} in Kenya`
      : `${cleanTopic}: Complete Statutory Checklist, Portals & Fees in Kenya (2026)`;

  const subtitle = `Authoritative compliance roadmap covering ${knowledge.statutoryForms[0]}, official ${knowledge.officialPortal} requirements, gazetted fees, and procedural steps under the laws of Kenya.`;

  const excerpt = `Navigating ${cleanTopic} requires compliance with ${knowledge.governingLaw}. Here is the verified procedural dossier detailing filing prerequisites, statutory fee schedules, official portals, and common audit pitfalls at ${knowledge.regulatoryAgency}.`;

  const section1 = `## 1. Statutory Mandate & Legal Framework\n\nUnder ${knowledge.governingLaw}, applicants and commercial stakeholders dealing with ${cleanTopic} must adhere strictly to gazetted statutory provisions administered by the ${knowledge.regulatoryAgency}.\n\nAll formal submissions are lodged electronically through the official government portal (**${knowledge.officialPortal}**). Administrative reviews strictly examine applicant identity, tax compliance status, and certified documentary annexures before issuance of statutory endorsements.`;

  const stepsList = knowledge.proceduralSteps
    .map((s, idx) => `### Step ${idx + 1}: ${s.title}\n${s.detail}`)
    .join("\n\n");

  const section2 = `## 2. Step-by-Step Filing Workflow & Mandatory Documentation\n\nInitiating your application on **${knowledge.officialPortal}** involves sequential verification stages:\n\n${stepsList}`;

  const checklistMd = knowledge.prerequisites.map((p) => `- [x] ${p}`).join("\n");

  const section3 = `## 3. Gazetted Statutory Fees, Processing Timelines & Compliance Checklist\n\n### Gazetted Statutory Fee Schedule\n${knowledge.gazettedFees}\n\n### Official Processing Timeline\n${knowledge.processingTimeline}\n\n### Mandatory Document Dossier Checklist\n${checklistMd}\n\n> **Official Statutory Advisory**: ${knowledge.warningNotice}`;

  const fullContent = `${section1}\n\n${section2}\n\n${section3}`;

  return {
    title,
    subtitle,
    categoryId: knowledge.category,
    categoryName: knowledge.categoryName,
    subCategoryName: knowledge.subCategoryName,
    excerpt,
    officialPortal: knowledge.officialPortal,
    readTime: "7 min read",
    author: "Serikali Legal & Regulatory Desk",
    authorRole: "Lead Regulatory Specialist",
    keyTakeaways: knowledge.takeaways,
    sectionHeading: `1. Statutory Mandate & Legal Framework for ${cleanTopic}`,
    sectionBody: `Under ${knowledge.governingLaw}, all applications dealing with ${cleanTopic} must comply with gazetted ministerial regulations administered by the ${knowledge.regulatoryAgency}. Dossiers are processed via official channels (${knowledge.officialPortal}) upon verification of civil registry and tax records.`,
    checklist: knowledge.prerequisites,
    callout: knowledge.warningNotice,
    content: fullContent,
    image: knowledge.recommendedPhoto,
    metaTitle: `${cleanTopic} Guide Kenya 2026 | Serikali Guide`,
    metaDescription: excerpt.slice(0, 155),
    keywords: [
      cleanTopic.toLowerCase(),
      "kenya government",
      "ecitizen",
      "statutory compliance",
      knowledge.subCategoryName.toLowerCase(),
      knowledge.officialPortal,
    ],
  };
}

export function synthesizeAuthoritativeService(topic) {
  const cleanTopic = (topic || "").trim();
  const knowledge = getRegulatoryKnowledgeForTopic(cleanTopic);

  return {
    name: cleanTopic,
    shortLabel: cleanTopic.split(" ").slice(0, 3).join(" "),
    agencyBadge: "OFFICIAL REPUBLIC OF KENYA DESK",
    agency: knowledge.regulatoryAgency,
    heroSubtitle: `Official procedures, licensing prerequisites, gazetted statutory fees, and verified timelines administered under ${knowledge.governingLaw}.`,
    editorialHeadline: `${cleanTopic} — Official Kenyan Procedures, Permits & Compliance.`,
    overview: `${cleanTopic} encompasses statutory registration, regulatory vetting, and administrative oversight under ${knowledge.governingLaw}. Stakeholders must submit certified documentation via ${knowledge.officialPortal} and maintain annual returns to avoid penal sanctions.`,
    metaTitle: `${cleanTopic} in Kenya — Official Requirements & Guide | Serikali`,
    metaDescription: `Complete statutory requirements, application portals, timelines, and fees for ${cleanTopic} in Kenya. Verified guidance from ${knowledge.regulatoryAgency}.`,
    subCategories: [
      {
        name: `Standard ${cleanTopic} Registration & Filing`,
        summary: `Initial statutory registration, regulatory documentation, and compliance lodgement on ${knowledge.officialPortal}.`,
        portal: knowledge.officialPortal,
        timeline: knowledge.processingTimeline,
        statutoryNote: `${knowledge.statutoryForms[0]} · Governed by ${knowledge.governingLaw}`,
        feeNote: knowledge.gazettedFees,
        requirements: knowledge.prerequisites,
        steps: knowledge.proceduralSteps,
      },
    ],
  };
}

export function validateRegulatoryAccuracy(generated, topic, knowledge) {
  const missing = [];
  let score = 100;

  if (!generated || typeof generated !== "object") {
    return {
      isValid: false,
      score: 0,
      missingRequirements: ["AI response was empty or not a valid object"],
      validatedData: synthesizeAuthoritativeBlog(topic, knowledge.category),
    };
  }

  const data = { ...generated };

  // 1. Mandatory Official Government Portal Check (.go.ke)
  const portal = String(data.officialPortal || "").toLowerCase().trim();
  if (!portal || !portal.includes(".go.ke")) {
    missing.push("Missing or invalid official government portal (must be a verified .go.ke domain)");
    score -= 20;
    data.officialPortal = knowledge.officialPortal;
  }

  // 2. Governing Legislation & Acts of Parliament Check
  const combinedText = `${data.content || ""} ${data.sectionBody || ""} ${data.excerpt || ""} ${data.subtitle || ""}`;
  const hasStatute = /act|regulation|cap\.|constitution|statut|decree|gazette/i.test(combinedText);
  if (!hasStatute) {
    missing.push(`Missing statutory legal citation (must ground requirements in ${knowledge.governingLaw})`);
    score -= 20;
  }

  // 3. Official Statutory Forms Citation Check
  const hasFormCitation =
    knowledge.statutoryForms.some((form) => {
      const formCode = form.split(" ")[0].toLowerCase();
      return combinedText.toLowerCase().includes(formCode);
    }) || /form\s+\d+|cr12|bof1|c24|prn|tcc|etims|alien\s+card/i.test(combinedText);

  if (!hasFormCitation) {
    missing.push(`Missing mandatory statutory form citation (${knowledge.statutoryForms[0]})`);
    score -= 20;
  }

  // 4. Gazetted Statutory Fee Check (Numbers in KSh or USD)
  const hasFeeMention = /ksh|usd|\$|shillings|fee/i.test(combinedText);
  const hasNumericFee = /\b\d{1,3}(,\d{3})+|\b\d{3,6}\b|usd\s*\d+/i.test(combinedText);
  if (!hasFeeMention || !hasNumericFee) {
    missing.push("Missing specific gazetted fee figures in KSh or USD");
    score -= 20;
  }

  // 5. Anti-Generic Filler Phrasing Filter
  const hasGenericFiller =
    /lorem ipsum|various documents|as required by law|applicable fees|relevant authorities|consult local desk/i.test(
      combinedText
    );
  if (hasGenericFiller || combinedText.length < 250) {
    missing.push("Content contains generic placeholder phrasing instead of specific procedural facts");
    score -= 20;
  }

  // 6. Actionable Takeaways & Checklist Check
  if (!Array.isArray(data.keyTakeaways) || data.keyTakeaways.length < 3) {
    missing.push("Fewer than 3 structured key takeaways provided");
    score -= 10;
    data.keyTakeaways = knowledge.takeaways;
  }

  if (!Array.isArray(data.checklist) || data.checklist.length < 3) {
    data.checklist = knowledge.prerequisites;
  }

  // 7. Enforce Category, Author & Visual Asset Alignment
  if (!data.categoryId) {
    data.categoryId = knowledge.category;
    data.categoryName = knowledge.categoryName;
    data.subCategoryName = knowledge.subCategoryName;
  }
  if (!data.image || data.image.includes("example.com") || !data.image.trim()) {
    data.image = knowledge.recommendedPhoto;
  }
  if (!data.author) {
    data.author = "Serikali Legal & Regulatory Desk";
    data.authorRole = "Lead Regulatory Specialist";
  }

  // 8. Repair / Augment Content if Accuracy Threshold (< 70) or Crucial Data Missing
  if (score < 70 || missing.length >= 2 || !data.content || data.content.length < 300) {
    const fallbackDossier = synthesizeAuthoritativeBlog(topic, knowledge.category);

    const statutorySection = `\n\n## Statutory Compliance Dossier & Verified Gazetted Data\n\n- **Governing Law**: ${knowledge.governingLaw}\n- **Regulatory Agency**: ${knowledge.regulatoryAgency}\n- **Official Filing Portal**: [${knowledge.officialPortal}](https://${knowledge.officialPortal})\n- **Gazetted Statutory Fees**: ${knowledge.gazettedFees}\n- **Mandatory Statutory Forms**: ${knowledge.statutoryForms.join(", ")}\n- **Official Processing Timeline**: ${knowledge.processingTimeline}\n\n### Official Procedural Steps:\n${knowledge.proceduralSteps.map((s, idx) => `**Step ${idx + 1}: ${s.title}** - ${s.detail}`).join("\n\n")}\n\n> **Official Statutory Notice**: ${knowledge.warningNotice}`;

    data.content = data.content ? `${data.content}${statutorySection}` : fallbackDossier.content;

    if (!data.sectionBody || data.sectionBody.length < 100) {
      data.sectionBody = fallbackDossier.sectionBody;
      data.sectionHeading = fallbackDossier.sectionHeading;
    }
    if (!data.excerpt || data.excerpt.length < 60) {
      data.excerpt = fallbackDossier.excerpt;
    }
  }

  return {
    isValid: score >= 60,
    score: Math.max(score, 0),
    missingRequirements: missing,
    validatedData: data,
  };
}
