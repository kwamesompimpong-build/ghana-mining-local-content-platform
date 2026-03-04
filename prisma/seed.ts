import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.procurementOpportunity.deleteMany();
  await prisma.localSpendRecord.deleteMany();
  await prisma.expatriateQuotaSnapshot.deleteMany();
  await prisma.expatriateRecord.deleteMany();
  await prisma.supplierComplianceScore.deleteMany();
  await prisma.supplierCapability.deleteMany();
  await prisma.complianceReport.deleteMany();
  await prisma.document.deleteMany();
  await prisma.ownershipRecord.deleteMany();
  await prisma.supplierProfile.deleteMany();
  await prisma.miningCompanyProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.localProcurementListItem.deleteMany();

  const passwordHash = await hash("admin123", 12);
  const miningHash = await hash("mining123", 12);
  const supplierHash = await hash("supplier123", 12);
  const regulatorHash = await hash("regulator123", 12);

  // ─── Admin Organization ─────────────────────────────────────────
  const adminOrg = await prisma.organization.create({
    data: {
      name: "Ghana Mining LCM Platform",
      type: "REGULATORY_BODY",
      registrationNumber: "GMLCM-001",
      tinNumber: "P0000001",
      region: "Greater Accra",
      isVerified: true,
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@gmlcp.gov.gh",
      passwordHash,
      firstName: "Kwame",
      lastName: "Asante",
      role: "ADMIN",
      organizationId: adminOrg.id,
    },
  });

  // ─── Regulator Organization (Minerals Commission) ──────────────
  const regulatorOrg = await prisma.organization.create({
    data: {
      name: "Minerals Commission of Ghana",
      type: "REGULATORY_BODY",
      registrationNumber: "MC-GOV-001",
      tinNumber: "P0000010",
      region: "Greater Accra",
      isVerified: true,
    },
  });

  await prisma.user.create({
    data: {
      email: "review@mincom.gov.gh",
      passwordHash: regulatorHash,
      firstName: "Ama",
      lastName: "Mensah",
      role: "REGULATOR",
      organizationId: regulatorOrg.id,
    },
  });

  // ─── Mining Companies ──────────────────────────────────────────
  const miningCompanies = [
    {
      name: "Gold Fields Ghana Ltd",
      regNum: "GF-GH-2004",
      tin: "C0012345",
      region: "Western",
      ownershipTier: "FOREIGN_WITH_LOCAL_PARTNER" as const,
      ghanaianPct: 10,
      mineralRight: "ML-2004-0034",
      commodities: ["Gold"],
      district: "Tarkwa-Nsuaem",
      expatQuota: 35,
      userEmail: "ops@goldfields.gh",
      userName: ["Kofi", "Mensah"],
    },
    {
      name: "Newmont Ahafo Operations",
      regNum: "NM-AH-2006",
      tin: "C0023456",
      region: "Ahafo",
      ownershipTier: "FOREIGN_INCORPORATED" as const,
      ghanaianPct: 0,
      mineralRight: "ML-2006-0057",
      commodities: ["Gold"],
      district: "Asutifi North",
      expatQuota: 40,
      userEmail: "ops@newmont-ahafo.gh",
      userName: ["Esi", "Osei"],
    },
    {
      name: "AngloGold Ashanti Obuasi Mine",
      regNum: "AGA-OB-1998",
      tin: "C0034567",
      region: "Ashanti",
      ownershipTier: "FOREIGN_WITH_LOCAL_PARTNER" as const,
      ghanaianPct: 5,
      mineralRight: "ML-1998-0012",
      commodities: ["Gold"],
      district: "Obuasi Municipal",
      expatQuota: 45,
      userEmail: "ops@anglogold-obuasi.gh",
      userName: ["Yaw", "Boateng"],
    },
  ];

  const miningProfiles = [];

  for (const mc of miningCompanies) {
    const org = await prisma.organization.create({
      data: {
        name: mc.name,
        type: "MINING_COMPANY",
        registrationNumber: mc.regNum,
        tinNumber: mc.tin,
        region: mc.region,
        ownershipTier: mc.ownershipTier,
        ghanaianOwnershipPct: mc.ghanaianPct,
        isVerified: true,
      },
    });

    const profile = await prisma.miningCompanyProfile.create({
      data: {
        organizationId: org.id,
        mineralRightNumber: mc.mineralRight,
        commodities: mc.commodities,
        miningDistrict: mc.district,
        approvedExpatQuota: mc.expatQuota,
        currentExpatCount: Math.floor(mc.expatQuota * 0.8),
      },
    });

    miningProfiles.push(profile);

    await prisma.user.create({
      data: {
        email: mc.userEmail,
        passwordHash: miningHash,
        firstName: mc.userName[0],
        lastName: mc.userName[1],
        role: "MINING_COMPANY",
        organizationId: org.id,
      },
    });
  }

  // ─── Suppliers ─────────────────────────────────────────────────
  const suppliers = [
    { name: "Ghana Mining Supplies Ltd", reg: "GMS-2010-001", tin: "C0100001", region: "Western", tier: "WHOLLY_GHANAIAN" as const, pct: 100, categories: ["EQUIPMENT_SUPPLY", "CONSUMABLES"], years: 14, employees: 85, ghEmpPct: 98, revenue: 4200000, status: "APPROVED" as const },
    { name: "AfroCon Engineering Services", reg: "AES-2012-045", tin: "C0100002", region: "Ashanti", tier: "WHOLLY_GHANAIAN" as const, pct: 100, categories: ["TECHNICAL_ENGINEERING", "CONSTRUCTION"], years: 12, employees: 120, ghEmpPct: 95, revenue: 8500000, status: "APPROVED" as const },
    { name: "Kumasi Logistics Group", reg: "KLG-2008-012", tin: "C0100003", region: "Ashanti", tier: "WHOLLY_GHANAIAN" as const, pct: 100, categories: ["TRANSPORT_LOGISTICS"], years: 16, employees: 210, ghEmpPct: 99, revenue: 12000000, status: "APPROVED" as const },
    { name: "SafeGuard Mining Security", reg: "SMS-2015-078", tin: "C0100004", region: "Western", tier: "WHOLLY_GHANAIAN" as const, pct: 100, categories: ["SECURITY_SERVICES"], years: 9, employees: 450, ghEmpPct: 100, revenue: 6800000, status: "APPROVED" as const },
    { name: "TechMine Solutions GH", reg: "TMS-2018-023", tin: "C0100005", region: "Greater Accra", tier: "MAJORITY_GHANAIAN_JV" as const, pct: 60, categories: ["IT_TELECOMMUNICATIONS", "TECHNICAL_ENGINEERING"], years: 6, employees: 35, ghEmpPct: 80, revenue: 2100000, status: "APPROVED" as const },
    { name: "Green Env Consultants", reg: "GEC-2016-034", tin: "C0100006", region: "Greater Accra", tier: "WHOLLY_GHANAIAN" as const, pct: 100, categories: ["ENVIRONMENTAL_SERVICES"], years: 8, employees: 28, ghEmpPct: 96, revenue: 1800000, status: "APPROVED" as const },
    { name: "Volta Camp Services", reg: "VCS-2013-056", tin: "C0100007", region: "Eastern", tier: "MAJORITY_GHANAIAN_JV" as const, pct: 55, categories: ["CAMP_MANAGEMENT"], years: 11, employees: 180, ghEmpPct: 92, revenue: 9200000, status: "APPROVED" as const },
    { name: "AccraLab Assay Services", reg: "ALA-2017-089", tin: "C0100008", region: "Greater Accra", tier: "WHOLLY_GHANAIAN" as const, pct: 100, categories: ["LABORATORY_ASSAYING"], years: 7, employees: 42, ghEmpPct: 93, revenue: 3400000, status: "APPROVED" as const },
    { name: "PetroChem Fuel Ghana", reg: "PCF-2009-067", tin: "C0100009", region: "Western", tier: "MINORITY_GHANAIAN_JV" as const, pct: 40, categories: ["FUEL_ENERGY"], years: 15, employees: 65, ghEmpPct: 85, revenue: 25000000, status: "APPROVED" as const },
    { name: "RockDrill International GH", reg: "RDI-2019-101", tin: "C0100010", region: "Western", tier: "FOREIGN_WITH_LOCAL_PARTNER" as const, pct: 25, categories: ["MINING_SERVICES", "EQUIPMENT_SUPPLY"], years: 5, employees: 90, ghEmpPct: 70, revenue: 15000000, status: "APPROVED" as const },
    { name: "Savanna Training Academy", reg: "STA-2020-112", tin: "C0100011", region: "Northern", tier: "WHOLLY_GHANAIAN" as const, pct: 100, categories: ["TRAINING_HR"], years: 4, employees: 22, ghEmpPct: 100, revenue: 900000, status: "APPROVED" as const },
    { name: "Ashanti Legal Partners", reg: "ALP-2014-033", tin: "C0100012", region: "Ashanti", tier: "WHOLLY_GHANAIAN" as const, pct: 100, categories: ["LEGAL_SERVICES"], years: 10, employees: 15, ghEmpPct: 100, revenue: 1200000, status: "APPROVED" as const },
    { name: "Global Mine Finance GH", reg: "GMF-2021-145", tin: "C0100013", region: "Greater Accra", tier: "FOREIGN_INCORPORATED" as const, pct: 0, categories: ["FINANCIAL_SERVICES"], years: 3, employees: 18, ghEmpPct: 72, revenue: 5000000, status: "UNDER_REVIEW" as const },
    { name: "WestAfrica Drill Co", reg: "WAD-2022-178", tin: "C0100014", region: "Western", tier: "MAJORITY_GHANAIAN_JV" as const, pct: 65, categories: ["MINING_SERVICES"], years: 2, employees: 55, ghEmpPct: 88, revenue: 3800000, status: "PENDING_REVIEW" as const },
    { name: "Cape Coast Consumables", reg: "CCC-2023-190", tin: "C0100015", region: "Central", tier: "WHOLLY_GHANAIAN" as const, pct: 100, categories: ["CONSUMABLES"], years: 1, employees: 12, ghEmpPct: 100, revenue: 500000, status: "PENDING_REVIEW" as const },
  ];

  const supplierProfiles = [];

  for (const sup of suppliers) {
    const org = await prisma.organization.create({
      data: {
        name: sup.name,
        type: "SUPPLIER",
        registrationNumber: sup.reg,
        tinNumber: sup.tin,
        region: sup.region,
        ownershipTier: sup.tier,
        ghanaianOwnershipPct: sup.pct,
        isVerified: sup.status === "APPROVED",
      },
    });

    const profile = await prisma.supplierProfile.create({
      data: {
        organizationId: org.id,
        categories: sup.categories as any[],
        yearsInBusiness: sup.years,
        employeeCount: sup.employees,
        ghanaianEmployeePct: sup.ghEmpPct,
        annualRevenue: sup.revenue,
        qualificationScore: sup.status === "APPROVED" ? Math.floor(40 + sup.pct * 0.4 + sup.ghEmpPct * 0.1 + Math.min(sup.years, 10) * 0.5) : null,
        status: sup.status,
      },
    });

    supplierProfiles.push(profile);

    // Create ownership records
    if (sup.pct === 100) {
      await prisma.ownershipRecord.create({
        data: { organizationId: org.id, shareholderName: "Founding Directors", nationality: "Ghanaian", isGhanaian: true, ownershipPct: 100 },
      });
    } else if (sup.pct > 0) {
      await prisma.ownershipRecord.create({
        data: { organizationId: org.id, shareholderName: "Local Partners", nationality: "Ghanaian", isGhanaian: true, ownershipPct: sup.pct },
      });
      await prisma.ownershipRecord.create({
        data: { organizationId: org.id, shareholderName: "Foreign Partners", nationality: "Various", isGhanaian: false, ownershipPct: 100 - sup.pct },
      });
    } else {
      await prisma.ownershipRecord.create({
        data: { organizationId: org.id, shareholderName: "International Holdings", nationality: "Various", isGhanaian: false, ownershipPct: 100 },
      });
    }

    // Create capability entries
    for (const cat of sup.categories) {
      await prisma.supplierCapability.create({
        data: {
          supplierId: profile.id,
          category: cat as any,
          description: `Provides ${cat.toLowerCase().replace(/_/g, " ")} for the mining industry in Ghana`,
          certifications: sup.years > 5 ? ["ISO 9001:2015", "Ghana Standards Authority"] : ["Ghana Standards Authority"],
          equipmentOwned: [],
          projectHistory: [`Multiple projects in ${sup.region} region`],
        },
      });
    }

    // Create compliance scores for approved suppliers
    if (sup.status === "APPROVED") {
      for (const period of ["2025-Q2", "2025-Q3", "2025-Q4"]) {
        const ownershipScore = sup.pct >= 100 ? 100 : sup.pct >= 51 ? 75 : sup.pct >= 30 ? 40 : 20;
        const employmentScore = sup.ghEmpPct;
        const procurementScore = Math.floor(30 + Math.random() * 40);
        const capacityScore = Math.min(sup.years * 8, 80) + Math.floor(Math.random() * 20);
        const documentScore = 60 + Math.floor(Math.random() * 35);
        const compositeScore = ownershipScore * 0.25 + employmentScore * 0.25 + procurementScore * 0.2 + capacityScore * 0.15 + documentScore * 0.15;

        await prisma.supplierComplianceScore.create({
          data: { supplierId: profile.id, period, ownershipScore, employmentScore, procurementScore, capacityScore, documentScore, compositeScore },
        });
      }
    }

    // Create sample documents
    const docTypes = ["BUSINESS_REGISTRATION", "TAX_CLEARANCE"];
    if (sup.status === "APPROVED") docTypes.push("CAPABILITY_CERTIFICATE");

    for (const docType of docTypes) {
      await prisma.document.create({
        data: {
          organizationId: org.id,
          type: docType as any,
          fileName: `${sup.reg}-${docType.toLowerCase()}.pdf`,
          fileUrl: `/uploads/${sup.reg}-${docType.toLowerCase()}.pdf`,
          status: sup.status === "APPROVED" ? "VERIFIED" : "PENDING",
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // Create supplier user (first supplier)
  const firstSupOrg = await prisma.organization.findUnique({ where: { registrationNumber: "GMS-2010-001" } });
  if (firstSupOrg) {
    await prisma.user.create({
      data: {
        email: "info@ghsupply.com",
        passwordHash: supplierHash,
        firstName: "Akua",
        lastName: "Darko",
        role: "SUPPLIER",
        organizationId: firstSupOrg.id,
      },
    });
  }

  // ─── Expatriate Records ────────────────────────────────────────
  const expatriates = [
    { company: 0, name: "James Mitchell", nat: "Australian", pos: "Mine Manager", cat: "EXECUTIVE_MANAGEMENT", succession: true, understudy: "Kwame Adjei", dept: "Operations" },
    { company: 0, name: "Pierre Dubois", nat: "French", pos: "Chief Geologist", cat: "TECHNICAL_PROFESSIONAL", succession: true, understudy: "Ama Serwaa", dept: "Geology" },
    { company: 0, name: "Michael Chen", nat: "Canadian", pos: "Processing Plant Manager", cat: "EXECUTIVE_MANAGEMENT", succession: false, understudy: null, dept: "Processing" },
    { company: 0, name: "Sarah Williams", nat: "British", pos: "Senior Mining Engineer", cat: "TECHNICAL_PROFESSIONAL", succession: true, understudy: "Kofi Adu", dept: "Engineering" },
    { company: 0, name: "Hans Mueller", nat: "German", pos: "Equipment Superintendent", cat: "SUPERVISORY", succession: true, understudy: "Yaw Mensah", dept: "Maintenance" },
    { company: 0, name: "John O'Brien", nat: "Irish", pos: "Safety Manager", cat: "TECHNICAL_PROFESSIONAL", succession: false, understudy: null, dept: "HSEC" },
    { company: 0, name: "Robert Taylor", nat: "American", pos: "Drill & Blast Engineer", cat: "SKILLED_TRADE", succession: true, understudy: "Kwesi Owusu", dept: "Operations" },
    { company: 1, name: "David Anderson", nat: "American", pos: "General Manager", cat: "EXECUTIVE_MANAGEMENT", succession: true, understudy: "Esi Antwi", dept: "Management" },
    { company: 1, name: "Maria Santos", nat: "Brazilian", pos: "Metallurgist", cat: "TECHNICAL_PROFESSIONAL", succession: true, understudy: "Abena Boateng", dept: "Processing" },
    { company: 1, name: "Tom Wilson", nat: "Australian", pos: "Mine Planning Manager", cat: "TECHNICAL_PROFESSIONAL", succession: false, understudy: null, dept: "Planning" },
    { company: 1, name: "Erik Johansson", nat: "Swedish", pos: "Environmental Manager", cat: "TECHNICAL_PROFESSIONAL", succession: true, understudy: "Nana Asare", dept: "Environment" },
    { company: 1, name: "Li Wei", nat: "Chinese", pos: "Mechanical Engineer", cat: "SKILLED_TRADE", succession: true, understudy: "Mensah Tetteh", dept: "Maintenance" },
    { company: 1, name: "Patrick Moore", nat: "British", pos: "Geotechnical Engineer", cat: "TECHNICAL_PROFESSIONAL", succession: false, understudy: null, dept: "Geology" },
    { company: 2, name: "Andreas Schmidt", nat: "South African", pos: "VP Operations", cat: "EXECUTIVE_MANAGEMENT", succession: true, understudy: "Yaw Asiedu", dept: "Operations" },
    { company: 2, name: "Carlos Rodriguez", nat: "Peruvian", pos: "Chief Mining Engineer", cat: "TECHNICAL_PROFESSIONAL", succession: true, understudy: "Kweku Mensah", dept: "Engineering" },
    { company: 2, name: "Steven Clark", nat: "Australian", pos: "Underground Manager", cat: "SUPERVISORY", succession: false, understudy: null, dept: "Underground" },
    { company: 2, name: "Raj Patel", nat: "Indian", pos: "Process Control Engineer", cat: "TECHNICAL_PROFESSIONAL", succession: true, understudy: "Ama Owusu", dept: "Processing" },
    { company: 2, name: "James Brown", nat: "Canadian", pos: "Shaft Engineer", cat: "SKILLED_TRADE", succession: true, understudy: "Kofi Mensah-Bonsu", dept: "Underground" },
    { company: 2, name: "Ivan Petrov", nat: "Russian", pos: "Electrical Engineer", cat: "SKILLED_TRADE", succession: false, understudy: null, dept: "Maintenance" },
    { company: 2, name: "Mark Thompson", nat: "British", pos: "Finance Controller", cat: "EXECUTIVE_MANAGEMENT", succession: true, understudy: "Akosua Mensah", dept: "Finance" },
  ];

  for (const exp of expatriates) {
    await prisma.expatriateRecord.create({
      data: {
        miningCompanyId: miningProfiles[exp.company].id,
        fullName: exp.name,
        nationality: exp.nat,
        positionTitle: exp.pos,
        positionCategory: exp.cat as any,
        department: exp.dept,
        startDate: new Date(2023, Math.floor(Math.random() * 12), 1),
        endDate: new Date(2026, Math.floor(Math.random() * 12), 1),
        workPermitNumber: `WP-${2024}-${Math.floor(1000 + Math.random() * 9000)}`,
        workPermitExpiry: new Date(2026, Math.floor(Math.random() * 12), 1),
        hasSuccessionPlan: exp.succession,
        understudyName: exp.understudy,
        understudyPosition: exp.understudy ? `Assistant ${exp.pos}` : null,
        localizationTargetDate: exp.succession ? new Date(2027, Math.floor(Math.random() * 12), 1) : null,
        status: "ACTIVE",
      },
    });
  }

  // ─── Compliance Reports ────────────────────────────────────────
  const miningOrgs = await prisma.organization.findMany({ where: { type: "MINING_COMPANY" } });

  for (const org of miningOrgs) {
    for (const period of ["2025-Q1", "2025-Q2", "2025-Q3", "2025-Q4"]) {
      const localSpendRatio = 55 + Math.floor(Math.random() * 25);
      const ghanaianEmploymentPct = 80 + Math.floor(Math.random() * 15);
      const expatQuotaCompliance = Math.random() > 0.2;
      const successionPlanPct = 50 + Math.floor(Math.random() * 40);
      const overallScore = localSpendRatio * 0.3 + (expatQuotaCompliance ? 25 : 0) + ghanaianEmploymentPct * 0.2 + successionPlanPct * 0.1;

      await prisma.complianceReport.create({
        data: {
          organizationId: org.id,
          period,
          localSpendRatio,
          expatQuotaCompliance,
          ghanaianEmploymentPct,
          successionPlanPct,
          overallScore: Math.min(Math.round(overallScore), 100),
          status: period === "2025-Q4" ? "SUBMITTED" : "APPROVED",
          submittedAt: new Date(),
          reviewedBy: period !== "2025-Q4" ? "system" : null,
          reviewedAt: period !== "2025-Q4" ? new Date() : null,
        },
      });
    }
  }

  // ─── Local Spend Records ───────────────────────────────────────
  const categories = ["MINING_SERVICES", "EQUIPMENT_SUPPLY", "TRANSPORT_LOGISTICS", "CONSTRUCTION", "CONSUMABLES", "CAMP_MANAGEMENT", "IT_TELECOMMUNICATIONS", "ENVIRONMENTAL_SERVICES"] as const;

  for (const profile of miningProfiles) {
    for (const period of ["2025-Q3", "2025-Q4"]) {
      for (const cat of categories) {
        const total = Math.floor(500000 + Math.random() * 5000000);
        const localPct = cat === "TRANSPORT_LOGISTICS" || cat === "CAMP_MANAGEMENT" ? 0.7 + Math.random() * 0.25
          : cat === "EQUIPMENT_SUPPLY" ? 0.3 + Math.random() * 0.3
          : 0.5 + Math.random() * 0.35;
        const local = Math.floor(total * localPct);

        await prisma.localSpendRecord.create({
          data: {
            miningCompanyId: profile.id,
            period,
            category: cat,
            totalSpend: total,
            localSpend: local,
            foreignSpend: total - local,
            localSpendPct: (local / total) * 100,
          },
        });
      }
    }
  }

  // ─── Procurement Opportunities ─────────────────────────────────
  const procurements = [
    { company: 0, title: "Underground Ventilation System Upgrade", desc: "Supply and installation of ventilation fans and ducting for underground operations at Tarkwa mine.", cat: "EQUIPMENT_SUPPLY", value: 2500000, ownerTier: null, localOnly: false },
    { company: 0, title: "Haulage Services Contract 2026", desc: "3-year haulage contract for ore transportation from pit to processing plant. Fleet of 30+ trucks required.", cat: "TRANSPORT_LOGISTICS", value: 15000000, ownerTier: "MAJORITY_GHANAIAN_JV", localOnly: true },
    { company: 1, title: "Tailings Storage Facility Environmental Monitoring", desc: "Ongoing environmental monitoring services for TSF including water quality, air quality, and biodiversity surveys.", cat: "ENVIRONMENTAL_SERVICES", value: 800000, ownerTier: "WHOLLY_GHANAIAN", localOnly: true },
    { company: 1, title: "Camp Catering & Facilities Management", desc: "Full catering and camp management services for 500-person residential camp.", cat: "CAMP_MANAGEMENT", value: 4200000, ownerTier: null, localOnly: false },
    { company: 2, title: "Underground Diamond Drilling Programme", desc: "30,000 meters of underground diamond drilling for resource definition at Obuasi Deep.", cat: "MINING_SERVICES", value: 8500000, ownerTier: null, localOnly: false },
    { company: 2, title: "IT Infrastructure Modernization", desc: "Upgrade of mine-wide communications, SCADA systems, and IT infrastructure.", cat: "IT_TELECOMMUNICATIONS", value: 3200000, ownerTier: "MAJORITY_GHANAIAN_JV", localOnly: false },
  ];

  const procurementRecords = [];
  for (const proc of procurements) {
    const record = await prisma.procurementOpportunity.create({
      data: {
        miningCompanyId: miningProfiles[proc.company].id,
        title: proc.title,
        description: proc.desc,
        category: proc.cat as any,
        estimatedValue: proc.value,
        closingDate: new Date(Date.now() + (7 + Math.floor(Math.random() * 60)) * 24 * 60 * 60 * 1000),
        status: "OPEN",
        requiredOwnershipTier: proc.ownerTier as any,
        isLocalOnly: proc.localOnly,
      },
    });
    procurementRecords.push(record);
  }

  // Create bids for first 3 procurement opportunities
  for (let i = 0; i < 3; i++) {
    const bidders = supplierProfiles.filter((s) => s.status === "APPROVED").slice(0, 3 + i);
    for (const bidder of bidders) {
      await prisma.bid.create({
        data: {
          procurementId: procurementRecords[i].id,
          supplierId: bidder.id,
          amount: Math.floor((procurementRecords[i] as any).estimatedValue * (0.8 + Math.random() * 0.3)),
          currency: "GHS",
          technicalProposal: "Comprehensive technical proposal with local content commitment.",
          localContentPct: 50 + Math.floor(Math.random() * 40),
          deliveryTimeline: `${4 + Math.floor(Math.random() * 12)} weeks`,
          status: "SUBMITTED",
        },
      });
    }
  }

  // ─── Local Procurement List Items (L.I. 2431) ─────────────────
  const procListItems = [
    { code: "LPL-001", name: "Mine Haulage Services", cat: "TRANSPORT_LOGISTICS", exclusive: true },
    { code: "LPL-002", name: "Camp Catering Services", cat: "CAMP_MANAGEMENT", exclusive: true },
    { code: "LPL-003", name: "Security Services", cat: "SECURITY_SERVICES", exclusive: true },
    { code: "LPL-004", name: "Environmental Monitoring", cat: "ENVIRONMENTAL_SERVICES", exclusive: true },
    { code: "LPL-005", name: "Civil Construction Works", cat: "CONSTRUCTION", exclusive: false },
    { code: "LPL-006", name: "Laboratory & Assaying Services", cat: "LABORATORY_ASSAYING", exclusive: true },
    { code: "LPL-007", name: "Training & Development", cat: "TRAINING_HR", exclusive: true },
    { code: "LPL-008", name: "General Consumables Supply", cat: "CONSUMABLES", exclusive: false },
    { code: "LPL-009", name: "Legal Advisory Services", cat: "LEGAL_SERVICES", exclusive: true },
    { code: "LPL-010", name: "Fuel & Lubricants Supply", cat: "FUEL_ENERGY", exclusive: false },
  ];

  for (const item of procListItems) {
    await prisma.localProcurementListItem.create({
      data: {
        editionNumber: 1,
        itemCode: item.code,
        itemName: item.name,
        category: item.cat as any,
        description: `L.I. 2431 Local Procurement List - ${item.name}`,
        requiredOwnership: item.exclusive ? "WHOLLY_GHANAIAN" : "MAJORITY_GHANAIAN_JV",
        isExclusiveGhana: item.exclusive,
        effectiveDate: new Date("2020-10-01"),
      },
    });
  }

  console.log("Seed completed successfully!");
  console.log("Demo accounts:");
  console.log("  Admin:     admin@gmlcp.gov.gh / admin123");
  console.log("  Mining Co: ops@goldfields.gh / mining123");
  console.log("  Supplier:  info@ghsupply.com / supplier123");
  console.log("  Regulator: review@mincom.gov.gh / regulator123");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
