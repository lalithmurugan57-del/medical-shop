import React, { useState } from 'react';
import { X, Plus, Trash2, Check } from 'lucide-react';
import {
  MedicineProduct,
  PrescriptionRecord,
  PrescribedMedicationItem,
} from '../types/pharmacy';

interface UploadPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: MedicineProduct[];
  onSubmitPrescription: (newRx: PrescriptionRecord) => void;
}

export const UploadPrescriptionModal: React.FC<
  UploadPrescriptionModalProps
> = ({ isOpen, onClose, products, onSubmitPrescription }) => {
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('44');
  const [patientPhone, setPatientPhone] = useState('+1 (555) 740-1928');
  const [doctorName, setDoctorName] = useState('Dr.Julian Mercer, MD');
  const [doctorRegNo, setDoctorRegNo] = useState('MCI-61920-IM');
  const [clinicName, setClinicName] = useState(
    'Metropolitan Internal Medicine Associates'
  );
  const [diagnosisNotes, setDiagnosisNotes] = useState(
    'Subacute bronchial inflammation with Vitamin D insufficiency.'
  );
  const [selectedItems, setSelectedItems] = useState<
    PrescribedMedicationItem[]
  >([
    {
      productId: 'med-05',
      medicineName: 'Augmentin Duo 625 mg Film-Coated Tablets',
      dosageInstruction: '1 tablet every 12 hours after meals (1-0-1)',
      durationDays: 7,
      quantity: 2,
    },
  ]);
  const [newProductId, setNewProductId] = useState('med-03');
  const [newDosage, setNewDosage] = useState(
    '1 unit once daily after morning meal (1-0-0)'
  );
  const [newDuration, setNewDuration] = useState('30');
  const [newQty, setNewQty] = useState('1');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddMedicationRow = () => {
    const prod = products.find((p) => p.id === newProductId);
    if (!prod) return;
    setSelectedItems((prev) => [
      ...prev,
      {
        productId: prod.id,
        medicineName: prod.name,
        dosageInstruction:
          newDosage.trim() || 'As directed by attending physician',
        durationDays: Math.max(1, parseInt(newDuration, 10) || 7),
        quantity: Math.max(1, parseInt(newQty, 10) || 1),
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !doctorName.trim() || !doctorRegNo.trim()) {
      setErrorMsg(
        'Please provide Patient Name, Prescribing Physician Name, and Medical Registration Number.'
      );
      return;
    }
    if (selectedItems.length === 0) {
      setErrorMsg(
        'Please attach at least one prescribed medication to the clinical order.'
      );
      return;
    }

    const rxRecord: PrescriptionRecord = {
      id: `RX-2026-${Math.floor(845 + Math.random() * 150)}`,
      patientName: patientName.trim(),
      patientAge: Math.max(1, parseInt(patientAge, 10) || 35),
      patientPhone: patientPhone.trim(),
      doctorName: doctorName.trim(),
      doctorRegNo: doctorRegNo.trim(),
      clinicName: clinicName.trim() || 'Outpatient Clinical Practice',
      submittedAt: '2026-10-05 10:25',
      status: 'Pending Pharmacist Review',
      diagnosisNotes:
        diagnosisNotes.trim() || 'Routine outpatient prescription order.',
      prescribedItems: selectedItems,
      pharmacistNotes:
        'Awaiting supervising pharmacist Schedule H verification and FEFO batch assignment.',
    };

    onSubmitPrescription(rxRecord);
    setPatientName('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/55 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-rx-title"
    >
      <div className="w-full max-w-2xl bg-[#FAF9F6] border border-stone-300 rounded-lg shadow-xl overflow-hidden my-auto">
        <div className="px-6 py-4 bg-white border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2
              id="upload-rx-title"
              className="font-serif text-lg font-semibold text-stone-900"
            >
              Register Clinical Prescription (Rx Intake)
            </h2>
            <p className="text-xs text-stone-500">
              Log patient prescription for pharmacist Schedule H verification and
              dispensing
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-900 rounded-md cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 max-h-[80vh] overflow-y-auto"
        >
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-300 rounded text-xs text-red-900">
              {errorMsg}
            </div>
          )}

          {/* Patient & Physician Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Patient Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Julianna Vance"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:border-[#0F5338]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Patient Age (Years)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-stone-300 rounded-md focus:outline-none focus:border-[#0F5338]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Patient Phone
              </label>
              <input
                type="tel"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-stone-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Prescribing Doctor *
              </label>
              <input
                type="text"
                required
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Medical Reg. No. *
              </label>
              <input
                type="text"
                required
                value={doctorRegNo}
                onChange={(e) => setDoctorRegNo(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-stone-300 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Hospital / Clinic Name
              </label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Clinical Indication / Diagnosis Notes
              </label>
              <input
                type="text"
                value={diagnosisNotes}
                onChange={(e) => setDiagnosisNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md"
              />
            </div>
          </div>

          {/* Add Medication Builder */}
          <div className="p-4 bg-white border border-stone-200 rounded-md space-y-3">
            <h3 className="text-xs font-semibold text-stone-800">
              Prescribed Formulary Items ({selectedItems.length})
            </h3>

            {selectedItems.length > 0 && (
              <div className="divide-y divide-stone-200 border-y border-stone-200">
                {selectedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-stone-900">
                        {item.medicineName}
                      </p>
                      <p className="text-stone-500">
                        {item.dosageInstruction} ·{' '}
                        <span className="font-mono">
                          {item.durationDays} days · Qty: {item.quantity}
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="text-stone-400 hover:text-red-700 p-1 cursor-pointer"
                      aria-label="Remove medication"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 items-end">
              <div className="sm:col-span-5">
                <label className="block text-[11px] text-stone-600 mb-1">
                  Select Formulary Medicine
                </label>
                <select
                  value={newProductId}
                  onChange={(e) => setNewProductId(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-[#FAF9F6] border border-stone-300 rounded"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.schedule})
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-4">
                <label className="block text-[11px] text-stone-600 mb-1">
                  Dosage Regimen (e.g. 1-0-1)
                </label>
                <input
                  type="text"
                  value={newDosage}
                  onChange={(e) => setNewDosage(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-[#FAF9F6] border border-stone-300 rounded"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-[11px] text-stone-600 mb-1">
                  Days
                </label>
                <input
                  type="number"
                  min={1}
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="w-full px-2 py-2 text-xs font-mono bg-[#FAF9F6] border border-stone-300 rounded"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddMedicationRow}
                  className="w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Drug</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors whitespace-nowrap cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-lg bg-[#0F5338] hover:bg-[#0A3D28] text-white text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Submit to Pharmacist Queue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
