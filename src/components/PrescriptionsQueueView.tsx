import React, { useState } from 'react';
import {
  Plus,
  Check,
  AlertTriangle,
  ArrowRight,
  Search,
} from 'lucide-react';
import {
  PrescriptionRecord,
  PrescriptionStatus,
  MedicineProduct,
} from '../types/pharmacy';
import {
  findActiveInteractions,
  formatCurrency,
} from '../utils/dateAndCurrency';

interface PrescriptionsQueueViewProps {
  prescriptions: PrescriptionRecord[];
  products: MedicineProduct[];
  onUpdateStatus: (
    rxId: string,
    newStatus: PrescriptionStatus,
    updatedNotes?: string
  ) => void;
  onLoadRxIntoBag: (rx: PrescriptionRecord) => void;
  onOpenUploadRx: () => void;
}

export const PrescriptionsQueueView: React.FC<PrescriptionsQueueViewProps> = ({
  prescriptions,
  products,
  onUpdateStatus,
  onLoadRxIntoBag,
  onOpenUploadRx,
}) => {
  const [statusFilter, setStatusFilter] = useState<'All' | PrescriptionStatus>(
    'All'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  const filteredRx = prescriptions.filter((rx) => {
    if (statusFilter !== 'All' && rx.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rx.id.toLowerCase().includes(q) ||
        rx.patientName.toLowerCase().includes(q) ||
        rx.doctorName.toLowerCase().includes(q) ||
        rx.doctorRegNo.toLowerCase().includes(q) ||
        rx.clinicName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStartEditNotes = (rx: PrescriptionRecord) => {
    setEditingNotesId(rx.id);
    setNotesDraft(rx.pharmacistNotes);
  };

  const handleSaveNotes = (rx: PrescriptionRecord) => {
    onUpdateStatus(rx.id, rx.status, notesDraft);
    setEditingNotesId(null);
  };

  return (
    <div className="max-w-[1320px] mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>Schedule H &amp; H1 Clinical Registry</span>
            <span aria-hidden="true">·</span>
            <span>Pharmacist Regimen Screening</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">
            Prescription Verification Queue
          </h1>
        </div>

        <button
          type="button"
          onClick={onOpenUploadRx}
          className="py-2.5 px-4 rounded-lg bg-[#0F5338] hover:bg-[#0A3D28] text-white text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Prescription</span>
        </button>
      </div>

      {/* Interactive Status Filter & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-lg overflow-x-auto">
          {(
            [
              'All',
              'Pending Pharmacist Review',
              'Verified & Ready',
              'Dispensed',
              'Doctor Clarification Needed',
            ] as const
          ).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                statusFilter === st
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, physician, MCI Reg. No., or Rx ID..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-md focus:outline-none focus:border-[#0F5338]"
          />
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-6">
        {filteredRx.length === 0 ? (
          <div className="py-16 text-center bg-white border border-stone-200 rounded-lg space-y-3">
            <p className="font-serif text-lg text-stone-900">
              No prescriptions in this verification state
            </p>
            <button
              type="button"
              onClick={onOpenUploadRx}
              className="py-2 px-4 rounded-lg bg-[#0F5338] text-white text-xs font-medium cursor-pointer"
            >
              Register First Prescription
            </button>
          </div>
        ) : (
          filteredRx.map((rx) => {
            const rxProductIds = rx.prescribedItems.map((i) => i.productId);
            const interactions = findActiveInteractions(rxProductIds, products);

            const estimatedTotal = rx.prescribedItems.reduce((sum, item) => {
              const p = products.find((prod) => prod.id === item.productId);
              return sum + (p ? p.price * item.quantity : 0);
            }, 0);

            return (
              <div
                key={rx.id}
                className="bg-white border border-stone-200 rounded-lg p-6 space-y-5"
              >
                {/* Top Unboxed Metadata Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                      <span className="font-mono font-semibold text-stone-900">
                        {rx.id}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Logged {rx.submittedAt}</span>
                      <span aria-hidden="true">·</span>
                      <span>{rx.clinicName}</span>
                    </div>
                    <h2 className="font-serif text-xl font-semibold text-stone-900">
                      Patient: {rx.patientName}{' '}
                      <span className="font-sans text-sm font-normal text-stone-500">
                        ({rx.patientAge} yrs · {rx.patientPhone})
                      </span>
                    </h2>
                  </div>

                  {/* Unboxed Semantic Status Text */}
                  <div className="text-left sm:text-right">
                    <span
                      className={`text-xs font-semibold ${
                        rx.status === 'Verified & Ready' ||
                        rx.status === 'Dispensed'
                          ? 'text-[#0F5338]'
                          : rx.status === 'Doctor Clarification Needed'
                          ? 'text-red-700'
                          : 'text-amber-700'
                      }`}
                    >
                      Status: {rx.status}
                    </span>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Prescriber: {rx.doctorName} ·{' '}
                      <span className="font-mono">{rx.doctorRegNo}</span>
                    </p>
                  </div>
                </div>

                {/* Diagnosis & Interaction Screening */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 space-y-3">
                    <h3 className="text-xs font-semibold text-stone-500">
                      Prescribed Medication Regimen ({rx.prescribedItems.length}{' '}
                      items)
                    </h3>

                    <div className="divide-y divide-stone-200 border border-stone-200 rounded-md bg-[#FAF9F6] px-4">
                      {rx.prescribedItems.map((item, idx) => {
                        const prod = products.find(
                          (p) => p.id === item.productId
                        );
                        return (
                          <div
                            key={idx}
                            className="py-3 flex items-start justify-between gap-4 text-xs"
                          >
                            <div>
                              <p className="font-semibold text-stone-900">
                                {item.medicineName}
                              </p>
                              <p className="text-stone-600 mt-0.5">
                                Sig: {item.dosageInstruction}
                              </p>
                              {prod && (
                                <p className="font-mono text-[11px] text-stone-500 mt-0.5">
                                  FEFO Batch {prod.batchNumber} · Vault:{' '}
                                  {prod.rackLocation}
                                </p>
                              )}
                            </div>
                            <div className="text-right font-mono tabular-nums shrink-0">
                              <span className="font-semibold text-stone-900 block">
                                Qty: {item.quantity} ({item.durationDays}d)
                              </span>
                              {prod && (
                                <span className="text-stone-500 text-[11px]">
                                  {formatCurrency(prod.price * item.quantity)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Clinical Notes & Interaction Check */}
                  <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="text-xs space-y-1">
                        <span className="font-semibold text-stone-500 block">
                          Clinical Indication Notes
                        </span>
                        <p className="text-stone-700 leading-relaxed">
                          {rx.diagnosisNotes}
                        </p>
                      </div>

                      {interactions.length > 0 && (
                        <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-950 space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
                            <span>
                              Automated Drug-Drug Interaction Advisory
                            </span>
                          </div>
                          {interactions.map((pair, i) => (
                            <p key={i} className="text-[11px] leading-relaxed">
                              <strong>
                                {pair.sourceProduct.name} +{' '}
                                {pair.targetProduct.name}:
                              </strong>{' '}
                              {pair.interaction.clinicalNote}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Pharmacist Verification Notes */}
                      <div className="pt-2 border-t border-stone-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-stone-500">
                            Supervising Pharmacist Counseling Note
                          </span>
                          {editingNotesId !== rx.id && (
                            <button
                              type="button"
                              onClick={() => handleStartEditNotes(rx)}
                              className="text-[#0F5338] hover:underline text-[11px] font-medium cursor-pointer"
                            >
                              Edit Note
                            </button>
                          )}
                        </div>

                        {editingNotesId === rx.id ? (
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              value={notesDraft}
                              onChange={(e) => setNotesDraft(e.target.value)}
                              className="w-full p-2 text-xs bg-[#FAF9F6] border border-stone-300 rounded"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingNotesId(null)}
                                className="py-1 px-2.5 text-[11px] border border-stone-300 rounded cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveNotes(rx)}
                                className="py-1 px-2.5 text-[11px] bg-stone-900 text-white rounded cursor-pointer"
                              >
                                Save Note
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-stone-700 italic">
                            “{rx.pharmacistNotes}”
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {rx.status === 'Pending Pharmacist Review' && (
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateStatus(rx.id, 'Verified & Ready')
                            }
                            className="py-2 px-3 rounded-md bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Verify Rx</span>
                          </button>
                        )}
                        {rx.status !== 'Doctor Clarification Needed' &&
                          rx.status !== 'Dispensed' && (
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateStatus(
                                  rx.id,
                                  'Doctor Clarification Needed'
                                )
                              }
                              className="py-2 px-3 rounded-md border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
                            >
                              Flag Doctor Query
                            </button>
                          )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onLoadRxIntoBag(rx)}
                        className="py-2 px-4 rounded-md bg-[#0F5338] hover:bg-[#0A3D28] text-white text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <span>
                          Dispense Regimen (
                          <span className="font-mono tabular-nums">
                            {formatCurrency(estimatedTotal)}
                          </span>
                          )
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
