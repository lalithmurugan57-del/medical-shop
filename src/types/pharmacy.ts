export type ProductCategory =
  | 'Diagnostic Devices'
  | 'Prescription (Rx)'
  | 'Respiratory & Care'
  | 'Clinical Supplements'
  | 'First Aid & Surgical';

export type DrugSchedule =
  | 'OTC Direct'
  | 'Schedule H (Rx Required)'
  | 'Schedule H1 (Strict Registry)';

export type StorageCondition =
  | 'Ambient (15°C–25°C)'
  | 'Cold-Chain (2°C–8°C)'
  | 'Dry & Light-Protected';

export interface DrugInteraction {
  targetProductId: string;
  targetName: string;
  severity: 'Moderate' | 'Major';
  clinicalNote: string;
}

export interface MedicineProduct {
  id: string;
  name: string;
  genericSalt: string;
  category: ProductCategory;
  schedule: DrugSchedule;
  sku: string;
  ndcCode: string;
  batchNumber: string;
  expiryDate: string; // YYYY-MM-DD
  rackLocation: string;
  storageCondition: StorageCondition;
  packSize: string;
  manufacturer: string;
  unitCost: number;
  price: number;
  gstRate: 5 | 12 | 18;
  stock: number;
  reorderLevel: number;
  image?: string;
  packagingTheme: {
    accentHex: string;
    dosageForm: 'Device' | 'Tablet Blister' | 'Softgel Bottle' | 'Nebulizer Kit' | 'Biologic Pen' | 'Sterile Kit';
    strengthLabel: string;
  };
  description: string;
  dosageGuidance: string;
  contraindications: string;
  interactions: DrugInteraction[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  packVariant: 'Single Unit' | 'Clinical 3-Pack (Save 8%)';
}

export interface PrescribedMedicationItem {
  productId: string;
  medicineName: string;
  dosageInstruction: string;
  durationDays: number;
  quantity: number;
}

export type PrescriptionStatus =
  | 'Pending Pharmacist Review'
  | 'Verified & Ready'
  | 'Dispensed'
  | 'Doctor Clarification Needed';

export interface PrescriptionRecord {
  id: string;
  patientName: string;
  patientAge: number;
  patientPhone: string;
  doctorName: string;
  doctorRegNo: string;
  clinicName: string;
  submittedAt: string;
  status: PrescriptionStatus;
  diagnosisNotes: string;
  prescribedItems: PrescribedMedicationItem[];
  pharmacistNotes: string;
}

export interface OrderLineItem {
  productId: string;
  name: string;
  genericSalt: string;
  batchNumber: string;
  expiryDate: string;
  rackLocation: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  lineTotal: number;
}

export type OrderStatus =
  | 'Confirmed'
  | 'Packed'
  | 'Dispatched'
  | 'Delivered'
  | 'Dispensed at Counter';

export interface DispensingOrder {
  id: string;
  orderType: 'Walk-In POS Counter' | 'Storefront Home Delivery';
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  postalCode: string;
  paymentMethod:
    | 'Cash on Delivery (COD)'
    | 'Counter Cash'
    | 'UPI / Clinical QR'
    | 'Card Terminal'
    | 'Insurance Claim';
  discountTier: 'Standard (0%)' | 'Senior Citizen (10%)' | 'Hospital Staff (15%)';
  doctorName?: string;
  doctorRegNo?: string;
  prescriptionRef?: string;
  items: OrderLineItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}
