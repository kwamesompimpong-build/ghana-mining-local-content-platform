// L.I. 2431 — Minerals and Mining (Local Content and Local Participation) Regulations, 2020

export const SUPPLIER_CATEGORY_LABELS: Record<string, string> = {
  MINING_SERVICES: "Mining Services",
  TECHNICAL_ENGINEERING: "Technical & Engineering",
  EQUIPMENT_SUPPLY: "Equipment Supply",
  CONSUMABLES: "Consumables",
  FUEL_ENERGY: "Fuel & Energy",
  TRANSPORT_LOGISTICS: "Transport & Logistics",
  CAMP_MANAGEMENT: "Camp Management & Catering",
  FINANCIAL_SERVICES: "Financial Services",
  LEGAL_SERVICES: "Legal Services",
  IT_TELECOMMUNICATIONS: "IT & Telecommunications",
  ENVIRONMENTAL_SERVICES: "Environmental Services",
  SECURITY_SERVICES: "Security Services",
  CONSTRUCTION: "Construction",
  LABORATORY_ASSAYING: "Laboratory & Assaying",
  TRAINING_HR: "Training & HR",
  OTHER: "Other",
};

export const OWNERSHIP_TIER_LABELS: Record<string, string> = {
  WHOLLY_GHANAIAN: "100% Ghanaian-Owned",
  MAJORITY_GHANAIAN_JV: "Majority Ghanaian JV (51%+)",
  MINORITY_GHANAIAN_JV: "Minority Ghanaian JV (<51%)",
  FOREIGN_WITH_LOCAL_PARTNER: "Foreign with Local Partner",
  FOREIGN_INCORPORATED: "Foreign Incorporated in Ghana",
};

export const OWNERSHIP_TIER_COLORS: Record<string, string> = {
  WHOLLY_GHANAIAN: "bg-green-100 text-green-800 border-green-300",
  MAJORITY_GHANAIAN_JV: "bg-emerald-100 text-emerald-800 border-emerald-300",
  MINORITY_GHANAIAN_JV: "bg-yellow-100 text-yellow-800 border-yellow-300",
  FOREIGN_WITH_LOCAL_PARTNER: "bg-orange-100 text-orange-800 border-orange-300",
  FOREIGN_INCORPORATED: "bg-red-100 text-red-800 border-red-300",
};

export const EXPATRIATE_POSITION_LABELS: Record<string, string> = {
  EXECUTIVE_MANAGEMENT: "Executive Management",
  TECHNICAL_PROFESSIONAL: "Technical Professional",
  SUPERVISORY: "Supervisory",
  SKILLED_TRADE: "Skilled Trade",
};

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  BUSINESS_REGISTRATION: "Business Registration Certificate",
  TAX_CLEARANCE: "Tax Clearance Certificate",
  MINERALS_COMMISSION_LICENSE: "Minerals Commission License",
  OWNERSHIP_CERTIFICATE: "Ownership Certificate",
  FINANCIAL_STATEMENT: "Audited Financial Statement",
  CAPABILITY_CERTIFICATE: "Capability Certificate",
  WORK_PERMIT: "Work Permit",
  ENVIRONMENTAL_PERMIT: "Environmental Permit",
  INSURANCE_CERTIFICATE: "Insurance Certificate",
  QUALITY_CERTIFICATION: "Quality Certification (ISO, etc.)",
  OTHER: "Other",
};

export const COMPLIANCE_REPORT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REVISION_REQUESTED: "Revision Requested",
};

export const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Western North",
  "Central",
  "Eastern",
  "Volta",
  "Oti",
  "Northern",
  "Savannah",
  "North East",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
] as const;

// Compliance scoring weights
export const SUPPLIER_SCORE_WEIGHTS = {
  ownership: 0.25,
  employment: 0.25,
  procurement: 0.20,
  capacity: 0.15,
  documentation: 0.15,
} as const;

export const MINING_COMPANY_SCORE_WEIGHTS = {
  localSpendRatio: 0.30,
  expatriateQuota: 0.25,
  localizationProgress: 0.20,
  procurementList: 0.15,
  reportingTimeliness: 0.10,
} as const;

// Ownership tier scoring (for supplier compliance)
export const OWNERSHIP_TIER_SCORES: Record<string, number> = {
  WHOLLY_GHANAIAN: 100,
  MAJORITY_GHANAIAN_JV: 75,
  MINORITY_GHANAIAN_JV: 40,
  FOREIGN_WITH_LOCAL_PARTNER: 25,
  FOREIGN_INCORPORATED: 10,
};

export const USER_ROLE_LABELS: Record<string, string> = {
  ADMIN: "Platform Administrator",
  MINING_COMPANY: "Mining Company",
  SUPPLIER: "Supplier / Contractor",
  REGULATOR: "Regulator (Minerals Commission)",
};

export const NAV_ITEMS = {
  ADMIN: [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "Suppliers", href: "/suppliers", icon: "Building2" },
    { label: "Compliance", href: "/compliance", icon: "ClipboardCheck" },
    { label: "Expatriates", href: "/expatriates", icon: "Users" },
    { label: "Procurement", href: "/procurement", icon: "ShoppingCart" },
    { label: "Documents", href: "/documents", icon: "FileText" },
    { label: "Analytics", href: "/analytics", icon: "BarChart3" },
    { label: "Settings", href: "/settings", icon: "Settings" },
  ],
  MINING_COMPANY: [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "Compliance", href: "/compliance", icon: "ClipboardCheck" },
    { label: "Expatriates", href: "/expatriates", icon: "Users" },
    { label: "Procurement", href: "/procurement", icon: "ShoppingCart" },
    { label: "Suppliers", href: "/suppliers", icon: "Building2" },
    { label: "Documents", href: "/documents", icon: "FileText" },
    { label: "Analytics", href: "/analytics", icon: "BarChart3" },
    { label: "Settings", href: "/settings", icon: "Settings" },
  ],
  SUPPLIER: [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "My Profile", href: "/suppliers/register", icon: "Building2" },
    { label: "Procurement", href: "/procurement", icon: "ShoppingCart" },
    { label: "Documents", href: "/documents", icon: "FileText" },
    { label: "Settings", href: "/settings", icon: "Settings" },
  ],
  REGULATOR: [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "Suppliers", href: "/suppliers", icon: "Building2" },
    { label: "Compliance", href: "/compliance", icon: "ClipboardCheck" },
    { label: "Expatriates", href: "/expatriates", icon: "Users" },
    { label: "Analytics", href: "/analytics", icon: "BarChart3" },
    { label: "Documents", href: "/documents", icon: "FileText" },
    { label: "Settings", href: "/settings", icon: "Settings" },
  ],
} as const;
