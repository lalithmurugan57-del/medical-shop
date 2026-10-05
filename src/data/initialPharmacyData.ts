import heroApothecaryImg from '../assets/images/hero_clinical_apothecary_1791194169823.jpg';
import diagnosticMonitorImg from '../assets/images/product_diagnostic_monitor_1791194183712.jpg';
import liposomalVitaminsImg from '../assets/images/product_liposomal_vitamins_1791194196286.jpg';
import nebulizerKitImg from '../assets/images/product_nebulizer_kit_1791194207878.jpg';
import oximeterThermometerImg from '../assets/images/product_oximeter_thermometer_1791194217566.jpg';
import {
  MedicineProduct,
  PrescriptionRecord,
  DispensingOrder,
} from '../types/pharmacy';

export const HERO_APOTHECARY_IMAGE = heroApothecaryImg;

export const INITIAL_PRODUCTS: MedicineProduct[] = [
  {
    id: 'med-01',
    name: 'CardioPress Pro OLED Blood Pressure Monitor',
    genericSalt: 'Oscillometric Arterial Pressure Diagnostic System',
    category: 'Diagnostic Devices',
    schedule: 'OTC Direct',
    sku: 'VR-DIAG-104',
    ndcCode: '50211-0104-01',
    batchNumber: 'BP26-089A',
    expiryDate: '2029-08-30',
    rackLocation: 'Bay A-01 · Diagnostic Showcase',
    storageCondition: 'Ambient (15°C–25°C)',
    packSize: '1 Unit + Wide-Range Cuff (22–42 cm)',
    manufacturer: 'Veritas MedTech GmbH',
    unitCost: 54.0,
    price: 78.5,
    gstRate: 12,
    stock: 28,
    reorderLevel: 10,
    image: diagnosticMonitorImg,
    packagingTheme: {
      accentHex: '#0F5338',
      dosageForm: 'Device',
      strengthLabel: '±2 mmHg Clinical Grade',
    },
    description:
      'Hospital-calibrated upper-arm oscillometric sphygmomanometer featuring atrial fibrillation irregular pulse detection, 120-reading dual-user memory bank, and ergonomic D-ring arterial cuff.',
    dosageGuidance:
      'Rest seated for 5 minutes prior to measurement. Position cuff 2 cm above antecubital fossa at heart level. Record two readings 60 seconds apart.',
    contraindications:
      'Do not apply cuff over arteriovenous shunts, recent mastectomy side, or open dermatological wounds.',
    interactions: [],
  },
  {
    id: 'med-02',
    name: 'AeroMesh Ultrasonic Portable Nebulizer Kit',
    genericSalt: 'Vibrating Mesh Bronchial Aerosol Delivery System (MMAD 2.8 µm)',
    category: 'Respiratory & Care',
    schedule: 'OTC Direct',
    sku: 'VR-RESP-209',
    ndcCode: '50211-0209-04',
    batchNumber: 'NB26-412C',
    expiryDate: '2028-11-15',
    rackLocation: 'Bay B-03 · Respiratory Care',
    storageCondition: 'Ambient (15°C–25°C)',
    packSize: '1 Nebulizer + 2 Masks + 10 Sterile Saline Ampoules',
    manufacturer: 'PulmoCare Swiss AG',
    unitCost: 42.0,
    price: 64.0,
    gstRate: 12,
    stock: 19,
    reorderLevel: 8,
    image: nebulizerKitImg,
    packagingTheme: {
      accentHex: '#1D4ED8',
      dosageForm: 'Nebulizer Kit',
      strengthLabel: '0.25 mL/min Nebulization',
    },
    description:
      'Silent piezoelectric microporous mesh nebulizer engineered for targeted lower-respiratory deposition of bronchodilators, budesonide suspensions, and isotonic 0.9% sodium chloride ampoules.',
    dosageGuidance:
      'Fill medication cup up to 8 mL maximum. Inhale calmly through mouthpiece or mask until aerosol mist ceases (approx. 8–10 minutes). Rinse mesh cap with distilled water after each session.',
    contraindications:
      'Do not use with high-viscosity essential oils or non-nebulizable oral syrups.',
    interactions: [],
  },
  {
    id: 'med-03',
    name: 'Liposomal Cholecalciferol D3 + Menaquinone-7 (K2)',
    genericSalt: 'Vitamin D3 5000 IU (125 mcg) + All-Trans Vitamin K2 MK-7 100 mcg',
    category: 'Clinical Supplements',
    schedule: 'OTC Direct',
    sku: 'VR-SUPP-318',
    ndcCode: '50211-0318-60',
    batchNumber: 'VD26-771B',
    expiryDate: '2027-09-20',
    rackLocation: 'Shelf C-02 · Clinical Nutraceuticals',
    storageCondition: 'Dry & Light-Protected',
    packSize: '60 Amber-Protected Softgels',
    manufacturer: 'Veritas Compounding Labs',
    unitCost: 19.5,
    price: 32.0,
    gstRate: 12,
    stock: 46,
    reorderLevel: 15,
    image: liposomalVitaminsImg,
    packagingTheme: {
      accentHex: '#B45309',
      dosageForm: 'Softgel Bottle',
      strengthLabel: '5000 IU + 100 mcg',
    },
    description:
      'Cold-pressed sunflower phospholipid liposomal formulation pairing bioavailable cholecalciferol with all-trans MK-7 to support osteoblast mineralization and vascular calcium routing.',
    dosageGuidance:
      'Take 1 softgel daily with a lipid-containing meal, or as directed by your attending physician based on serum 25(OH)D assay.',
    contraindications:
      'Caution in patients with primary hyperparathyroidism, hypercalcemia, or granulomatous disorders.',
    interactions: [
      {
        targetProductId: 'med-07',
        targetName: 'Warfarin Sodium / Anticoagulant Regimens',
        severity: 'Major',
        clinicalNote:
          'Vitamin K2 (Menaquinone-7) directly antagonizes coumarin anticoagulants and can reduce INR stability. Monitor prothrombin time closely.',
      },
    ],
  },
  {
    id: 'med-04',
    name: 'ThermoPulse Dual Clinical Oximeter & IR Thermometer',
    genericSalt: 'SpO2 Dual-Wavelength Photoplethysmograph + Non-Contact Thermopile',
    category: 'Diagnostic Devices',
    schedule: 'OTC Direct',
    sku: 'VR-DIAG-112',
    ndcCode: '50211-0112-02',
    batchNumber: 'TP26-503E',
    expiryDate: '2029-04-10',
    rackLocation: 'Bay A-02 · Diagnostic Showcase',
    storageCondition: 'Ambient (15°C–25°C)',
    packSize: '1 Forehead IR Thermometer + 1 Fingertip Pulse Oximeter',
    manufacturer: 'Veritas MedTech GmbH',
    unitCost: 34.0,
    price: 52.0,
    gstRate: 12,
    stock: 31,
    reorderLevel: 10,
    image: oximeterThermometerImg,
    packagingTheme: {
      accentHex: '#0F5338',
      dosageForm: 'Device',
      strengthLabel: 'SpO2 70–100% · 1s IR Scan',
    },
    description:
      'Paired diagnostic kit combining a 1-second supraorbital infrared clinical thermometer with a perfusion-index fingertip pulse oximeter for rapid home or triage vital screening.',
    dosageGuidance:
      'Hold IR probe 2–3 cm perpendicular to center of forehead. For SpO2, insert index finger fully onto photo-sensor pad with nail bed facing up.',
    contraindications:
      'Dark nail enamel, cold peripheral vasoconstriction, or ambient motion tremor may affect SpO2 photoplethysmography.',
    interactions: [],
  },
  {
    id: 'med-05',
    name: 'Augmentin Duo 625 mg Film-Coated Tablets',
    genericSalt: 'Amoxicillin Trihydrate 500 mg + Potassium Clavulanate 125 mg',
    category: 'Prescription (Rx)',
    schedule: 'Schedule H (Rx Required)',
    sku: 'VR-RX-401',
    ndcCode: '50211-0401-10',
    batchNumber: 'AMX-2619F',
    expiryDate: '2026-11-18', // Expiring soon (< 60 days from Oct 2026)
    rackLocation: 'Vault R-01 · Schedule H Dispensary',
    storageCondition: 'Dry & Light-Protected',
    packSize: 'Strip of 10 Desiccant-Pouched Tablets',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals',
    unitCost: 11.2,
    price: 16.8,
    gstRate: 12,
    stock: 14,
    reorderLevel: 20, // Low stock + Expiring soon!
    packagingTheme: {
      accentHex: '#991B1B',
      dosageForm: 'Tablet Blister',
      strengthLabel: '500 mg / 125 mg',
    },
    description:
      'Broad-spectrum beta-lactam bactericidal antibiotic combined with a beta-lactamase inhibitor indicated for acute bacterial sinusitis, otitis media, community-acquired pneumonia, and urinary tract infections.',
    dosageGuidance:
      '1 tablet every 8 to 12 hours at the start of a meal to minimize gastrointestinal intolerance. Complete the full prescribed course.',
    contraindications:
      'Strictly contraindicated in patients with documented hypersensitivity to penicillins, cephalosporins, or previous amoxicillin-clavulanate cholestatic jaundice.',
    interactions: [
      {
        targetProductId: 'med-07',
        targetName: 'Atorvastatin / Oral Anticoagulants',
        severity: 'Moderate',
        clinicalNote:
          'Broad-spectrum penicillins may alter gut flora and potentiate oral anticoagulant effects; monitor patient for bruising or GI distress.',
      },
    ],
  },
  {
    id: 'med-06',
    name: 'GlucaNorm XR 500 Sustained-Release Tablets',
    genericSalt: 'Metformin Hydrochloride IP 500 mg (Extended Release)',
    category: 'Prescription (Rx)',
    schedule: 'Schedule H (Rx Required)',
    sku: 'VR-RX-415',
    ndcCode: '50211-0415-30',
    batchNumber: 'MET-2684K',
    expiryDate: '2027-06-30',
    rackLocation: 'Vault R-04 · Metabolic & Endocrine',
    storageCondition: 'Ambient (15°C–25°C)',
    packSize: 'Box of 30 Hydrophilic Matrix Tablets (3 × 10)',
    manufacturer: 'Sun Clinical Formulations',
    unitCost: 8.5,
    price: 14.2,
    gstRate: 5,
    stock: 64,
    reorderLevel: 25,
    packagingTheme: {
      accentHex: '#0F5338',
      dosageForm: 'Tablet Blister',
      strengthLabel: '500 mg XR',
    },
    description:
      'Biguanide antihyperglycemic agent formulated in a dual-polymer sustained-release matrix to lower basal and postprandial plasma glucose while improving GI tolerability.',
    dosageGuidance:
      'Swallow whole once daily with the evening meal. Do not crush, chew, or divide the extended-release matrix tablet.',
    contraindications:
      'Contraindicated in severe renal impairment (eGFR < 30 mL/min/1.73m²), acute metabolic acidosis, or within 48 hours of iodinated contrast imaging.',
    interactions: [],
  },
  {
    id: 'med-07',
    name: 'LipiShield 20 mg Atorvastatin Calcium Tablets',
    genericSalt: 'Atorvastatin Calcium Trihydrate equivalent to Atorvastatin 20 mg',
    category: 'Prescription (Rx)',
    schedule: 'Schedule H (Rx Required)',
    sku: 'VR-RX-428',
    ndcCode: '50211-0428-30',
    batchNumber: 'ATV-2603M',
    expiryDate: '2027-04-15',
    rackLocation: 'Vault R-02 · Cardiovascular',
    storageCondition: 'Ambient (15°C–25°C)',
    packSize: 'Box of 30 Film-Coated Tablets (3 × 10)',
    manufacturer: 'Cipla Cardiovascular Division',
    unitCost: 13.0,
    price: 21.5,
    gstRate: 12,
    stock: 9, // Low stock (< reorderLevel 18)
    reorderLevel: 18,
    packagingTheme: {
      accentHex: '#7C2D12',
      dosageForm: 'Tablet Blister',
      strengthLabel: '20 mg Statin',
    },
    description:
      'Selective, competitive HMG-CoA reductase inhibitor indicated as an adjunct to diet for reduction of elevated total cholesterol, LDL-C, apolipoprotein B, and triglycerides.',
    dosageGuidance:
      'Take 1 tablet once daily at any time of day, with or without food. Avoid excessive grapefruit juice consumption (>1.2 liters/day).',
    contraindications:
      'Active hepatic disease, unexplained persistent elevations of serum transaminases, pregnancy, and lactation.',
    interactions: [
      {
        targetProductId: 'med-05',
        targetName: 'Augmentin Duo 625 mg',
        severity: 'Moderate',
        clinicalNote:
          'Concurrent systemic antimicrobial therapy requires monitoring for statin-induced myalgia or hepatic transaminase elevation.',
      },
      {
        targetProductId: 'med-03',
        targetName: 'Liposomal Cholecalciferol D3 + K2',
        severity: 'Moderate',
        clinicalNote:
          'Vitamin D3 supplementation may beneficially reduce statin-associated myalgia; space dosing by 2 hours for optimal absorption.',
      },
    ],
  },
  {
    id: 'med-08',
    name: 'Lantus SoloStar Insulin Glargine Cold-Chain Pen',
    genericSalt: 'Insulin Glargine Injection (rDNA Origin) 100 IU/mL',
    category: 'Prescription (Rx)',
    schedule: 'Schedule H1 (Strict Registry)',
    sku: 'VR-COLD-502',
    ndcCode: '50211-0502-01',
    batchNumber: 'INS-2691C',
    expiryDate: '2026-12-02', // Approaching expiry (< 60 days)
    rackLocation: 'Cold Vault C-01 · Medical Refrigerator (4.2°C)',
    storageCondition: 'Cold-Chain (2°C–8°C)',
    packSize: '1 Pre-Filled Disposable Pen (3 mL / 300 Units)',
    manufacturer: 'Sanofi Aventis Biologics',
    unitCost: 26.0,
    price: 38.0,
    gstRate: 5,
    stock: 7, // Low stock + Cold-Chain + Expiring soon
    reorderLevel: 12,
    packagingTheme: {
      accentHex: '#065F46',
      dosageForm: 'Biologic Pen',
      strengthLabel: '100 IU/mL · 3 mL',
    },
    description:
      'Long-acting basal human insulin analog providing peakless 24-hour glycemic coverage. Shipped and dispensed with validated phase-change thermal gel packs.',
    dosageGuidance:
      'Administer subcutaneously once daily at the same time each day into abdomen, thigh, or deltoid. Rotate injection sites within the same region.',
    contraindications:
      'Do not administer intravenously or during episodes of hypoglycemia. Unopened pens must remain refrigerated at 2°C–8°C; do not freeze.',
    interactions: [
      {
        targetProductId: 'med-06',
        targetName: 'GlucaNorm XR 500 (Metformin)',
        severity: 'Moderate',
        clinicalNote:
          'Concomitant Metformin and basal insulin therapy enhances glycemic control; titrate insulin dose carefully to prevent nocturnal hypoglycemia.',
      },
    ],
  },
  {
    id: 'med-09',
    name: 'TraumaSeal Sterile Surgical & First-Aid Field Kit',
    genericSalt: 'Hydrocolloid Dressings, Chlorhexidine Gluconate 2% & Cohesive Bandage Set',
    category: 'First Aid & Surgical',
    schedule: 'OTC Direct',
    sku: 'VR-SURG-604',
    ndcCode: '50211-0604-01',
    batchNumber: 'SRG-2640A',
    expiryDate: '2028-05-01',
    rackLocation: 'Bay D-02 · Surgical & Wound Care',
    storageCondition: 'Ambient (15°C–25°C)',
    packSize: '42-Piece Gamma-Irradiated Sterile Case',
    manufacturer: 'Hartmann Clinical Supplies',
    unitCost: 22.0,
    price: 36.5,
    gstRate: 12,
    stock: 22,
    reorderLevel: 8,
    packagingTheme: {
      accentHex: '#991B1B',
      dosageForm: 'Sterile Kit',
      strengthLabel: '42 Sterile Components',
    },
    description:
      'Comprehensive clinical wound management kit containing non-adherent silver-alginate pads, sterile suture strips, antiseptic chlorhexidine swabs, and trauma shears.',
    dosageGuidance:
      'Irrigate wound with sterile 0.9% saline, disinfect periwound skin with chlorhexidine swab, and apply sterile hydrocolloid pad without stretching.',
    contraindications:
      'Do not apply chlorhexidine preps directly into the middle ear, meninges, or ocular mucosa.',
    interactions: [],
  },
];

export const INITIAL_PRESCRIPTIONS: PrescriptionRecord[] = [
  {
    id: 'RX-2026-841',
    patientName: 'Eleanor Vance',
    patientAge: 62,
    patientPhone: '+1 (555) 234-8910',
    doctorName: 'Dr. Aris Thorne, MD (Endocrinology)',
    doctorRegNo: 'MCI-48291-EN',
    clinicName: 'St. Jude Metabolic & Vascular Institute',
    submittedAt: '2026-10-05 09:14',
    status: 'Pending Pharmacist Review',
    diagnosisNotes:
      'Type 2 Diabetes Mellitus with dyslipidemia. Maintain basal insulin glargine at bedtime + evening sustained-release biguanide.',
    prescribedItems: [
      {
        productId: 'med-06',
        medicineName: 'GlucaNorm XR 500 Sustained-Release Tablets',
        dosageInstruction: '1 tablet once daily with evening meal (0-0-1)',
        durationDays: 30,
        quantity: 1,
      },
      {
        productId: 'med-08',
        medicineName: 'Lantus SoloStar Insulin Glargine Cold-Chain Pen',
        dosageInstruction: '14 Units subcutaneously at 22:00 daily',
        durationDays: 21,
        quantity: 1,
      },
      {
        productId: 'med-07',
        medicineName: 'LipiShield 20 mg Atorvastatin Calcium Tablets',
        dosageInstruction: '1 tablet at bedtime (0-0-1)',
        durationDays: 30,
        quantity: 1,
      },
    ],
    pharmacistNotes:
      'Cold-chain pouch required for SoloStar pen. Counsel patient on nocturnal hypoglycemia signs.',
  },
  {
    id: 'RX-2026-839',
    patientName: 'Marcus Sterling',
    patientAge: 38,
    patientPhone: '+1 (555) 892-3104',
    doctorName: 'Dr. Helena Rostova, MBBS, DLO',
    doctorRegNo: 'MCI-77102-ENT',
    clinicName: 'Aegis Pulmonology & ENT Clinic',
    submittedAt: '2026-10-05 08:40',
    status: 'Verified & Ready',
    diagnosisNotes:
      'Acute bacterial rhinosinusitis with bronchial hyperreactivity. 7-day beta-lactam course + isotonic saline nebulization.',
    prescribedItems: [
      {
        productId: 'med-05',
        medicineName: 'Augmentin Duo 625 mg Film-Coated Tablets',
        dosageInstruction: '1 tablet every 12 hours after meals (1-0-1)',
        durationDays: 7,
        quantity: 2,
      },
      {
        productId: 'med-02',
        medicineName: 'AeroMesh Ultrasonic Portable Nebulizer Kit',
        dosageInstruction: 'Nebulize 3 mL sterile saline twice daily',
        durationDays: 10,
        quantity: 1,
      },
    ],
    pharmacistNotes:
      'Verified penicillin allergy negative with patient by phone at 08:52.',
  },
  {
    id: 'RX-2026-834',
    patientName: 'Clara Lindqvist',
    patientAge: 51,
    patientPhone: '+1 (555) 601-4429',
    doctorName: 'Dr. Vikram Sethi, MD (Cardiology)',
    doctorRegNo: 'MCI-30918-CD',
    clinicName: 'HeartCare Diagnostics & Clinic',
    submittedAt: '2026-10-04 17:20',
    status: 'Dispensed',
    diagnosisNotes:
      'Essential hypertension home monitoring + Vitamin D insufficiency correction.',
    prescribedItems: [
      {
        productId: 'med-01',
        medicineName: 'CardioPress Pro OLED Blood Pressure Monitor',
        dosageInstruction: 'Record morning and evening arterial pressure log',
        durationDays: 90,
        quantity: 1,
      },
      {
        productId: 'med-03',
        medicineName: 'Liposomal Cholecalciferol D3 + Menaquinone-7 (K2)',
        dosageInstruction: '1 softgel daily with breakfast (1-0-0)',
        durationDays: 60,
        quantity: 1,
      },
    ],
    pharmacistNotes:
      'Dispensed under Invoice #INV-1041. Demonstrated proper cuff placement.',
  },
];

export const INITIAL_ORDERS: DispensingOrder[] = [
  {
    id: 'INV-1041',
    orderType: 'Walk-In POS Counter',
    customerName: 'Clara Lindqvist',
    customerPhone: '+1 (555) 601-4429',
    customerAddress: 'Walk-In Dispensary Counter #2',
    postalCode: '10014',
    paymentMethod: 'Card Terminal',
    discountTier: 'Standard (0%)',
    doctorName: 'Dr. Vikram Sethi, MD',
    doctorRegNo: 'MCI-30918-CD',
    prescriptionRef: 'RX-2026-834',
    items: [
      {
        productId: 'med-01',
        name: 'CardioPress Pro OLED Blood Pressure Monitor',
        genericSalt: 'Oscillometric Arterial Pressure Diagnostic System',
        batchNumber: 'BP26-089A',
        expiryDate: '2029-08-30',
        rackLocation: 'Bay A-01 · Diagnostic Showcase',
        quantity: 1,
        unitPrice: 78.5,
        gstRate: 12,
        lineTotal: 78.5,
      },
      {
        productId: 'med-03',
        name: 'Liposomal Cholecalciferol D3 + Menaquinone-7 (K2)',
        genericSalt: 'Vitamin D3 5000 IU + Vitamin K2 MK-7 100 mcg',
        batchNumber: 'VD26-771B',
        expiryDate: '2027-09-20',
        rackLocation: 'Shelf C-02 · Clinical Nutraceuticals',
        quantity: 1,
        unitPrice: 32.0,
        gstRate: 12,
        lineTotal: 32.0,
      },
    ],
    subtotal: 110.5,
    discountAmount: 0,
    taxAmount: 13.26,
    totalAmount: 123.76,
    status: 'Dispensed at Counter',
    createdAt: '2026-10-04 17:35',
  },
  {
    id: 'ORD-1042',
    orderType: 'Storefront Home Delivery',
    customerName: 'Arthur Pendelton',
    customerPhone: '+1 (555) 319-7740',
    customerAddress: '742 Evergreen Terrace, Suite 4B',
    postalCode: '10021',
    paymentMethod: 'Cash on Delivery (COD)',
    discountTier: 'Senior Citizen (10%)',
    items: [
      {
        productId: 'med-04',
        name: 'ThermoPulse Dual Clinical Oximeter & IR Thermometer',
        genericSalt: 'SpO2 Photoplethysmograph + Non-Contact Thermopile',
        batchNumber: 'TP26-503E',
        expiryDate: '2029-04-10',
        rackLocation: 'Bay A-02 · Diagnostic Showcase',
        quantity: 1,
        unitPrice: 52.0,
        gstRate: 12,
        lineTotal: 52.0,
      },
      {
        productId: 'med-09',
        name: 'TraumaSeal Sterile Surgical & First-Aid Field Kit',
        genericSalt: 'Hydrocolloid Dressings & Chlorhexidine 2% Set',
        batchNumber: 'SRG-2640A',
        expiryDate: '2028-05-01',
        rackLocation: 'Bay D-02 · Surgical & Wound Care',
        quantity: 1,
        unitPrice: 36.5,
        gstRate: 12,
        lineTotal: 36.5,
      },
    ],
    subtotal: 88.5,
    discountAmount: 8.85,
    taxAmount: 9.56,
    totalAmount: 89.21,
    status: 'Dispatched',
    createdAt: '2026-10-05 08:12',
  },
];
