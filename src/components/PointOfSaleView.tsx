import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import {
  MedicineProduct,
  PrescriptionRecord,
  DispensingOrder,
  OrderLineItem,
} from '../types/pharmacy';
import {
  formatCurrency,
  getExpiryStatus,
  findActiveInteractions,
} from '../utils/dateAndCurrency';

interface PointOfSaleViewProps {
  products: MedicineProduct[];
  prescriptions: PrescriptionRecord[];
  onCompleteCounterSale: (
    order: DispensingOrder,
    linkedPrescriptionId?: string
  ) => void;
}

interface PosBillRow {
  productId: string;
  quantity: number;
}

export const PointOfSaleView: React.FC<PointOfSaleViewProps> = ({
  products,
  prescriptions,
  onCompleteCounterSale,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [billRows, setBillRows] = useState<PosBillRow[]>([
    { productId: 'med-05', quantity: 2 },
    { productId: 'med-02', quantity: 1 },
  ]);
  const [customerName, setCustomerName] = useState('Marcus Sterling');
  const [customerPhone, setCustomerPhone] = useState('+1 (555) 892-3104');
  const [doctorName, setDoctorName] = useState('Dr. Helena Rostova, MBBS');
  const [doctorRegNo, setDoctorRegNo] = useState('MCI-77102-ENT');
  const [linkedRxId, setLinkedRxId] = useState<string>('RX-2026-839');
  const [discountTier, setDiscountTier] = useState<
    'Standard (0%)' | 'Senior Citizen (10%)' | 'Hospital Staff (15%)'
  >('Standard (0%)');
  const [paymentMethod, setPaymentMethod] = useState<
    'Counter Cash' | 'UPI / Clinical QR' | 'Card Terminal' | 'Insurance Claim'
  >('UPI / Clinical QR');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastIssuedInvoice, setLastIssuedInvoice] =
    useState<DispensingOrder | null>(null);

  const filteredCatalog = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.genericSalt.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.batchNumber.toLowerCase().includes(q) ||
        p.rackLocation.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const detailedBill = useMemo(() => {
    return billRows
      .map((row) => {
        const product = products.find((p) => p.id === row.productId);
        if (!product) return null;
        const lineTotal = Number((product.price * row.quantity).toFixed(2));
        return {
          ...row,
          product,
          lineTotal,
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
  }, [billRows, products]);

  const requiresScheduleH = detailedBill.some(
    (item) => item.product.schedule !== 'OTC Direct'
  );

  const activeInteractions = useMemo(
    () =>
      findActiveInteractions(
        detailedBill.map((i) => i.product.id),
        products
      ),
    [detailedBill, products]
  );

  const subtotal = Number(
    detailedBill.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
  );
  const discountRate =
    discountTier === 'Senior Citizen (10%)'
      ? 0.1
      : discountTier === 'Hospital Staff (15%)'
      ? 0.15
      : 0;
  const discountAmount = Number((subtotal * discountRate).toFixed(2));
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number(
    detailedBill
      .reduce((sum, item) => {
        const discountedLine = item.lineTotal * (1 - discountRate);
        return sum + discountedLine * (item.product.gstRate / 100);
      }, 0)
      .toFixed(2)
  );
  const grandTotal = Number((taxableAmount + taxAmount).toFixed(2));

  const handleAddProductToBill = (product: MedicineProduct) => {
    if (product.stock <= 0) return;
    setLastIssuedInvoice(null);
    setBillRows((prev) => {
      const existing = prev.find((r) => r.productId === product.id);
      if (existing) {
        return prev.map((r) =>
          r.productId === product.id
            ? { ...r, quantity: Math.min(product.stock, r.quantity + 1) }
            : r
        );
      }
      return [...prev, { productId: product.id, quantity: 1 }];
    });
  };

  const handleStepQty = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setBillRows((prev) =>
      prev
        .map((r) =>
          r.productId === productId
            ? {
                ...r,
                quantity: Math.min(product.stock, r.quantity + delta),
              }
            : r
        )
        .filter((r) => r.quantity > 0)
    );
  };

  const handleLoadPrescription = (rx: PrescriptionRecord) => {
    setCustomerName(rx.patientName);
    setCustomerPhone(rx.patientPhone);
    setDoctorName(rx.doctorName);
    setDoctorRegNo(rx.doctorRegNo);
    setLinkedRxId(rx.id);
    setLastIssuedInvoice(null);
    setErrorMsg('');
    setBillRows(
      rx.prescribedItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }))
    );
  };

  const handleIssueInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (detailedBill.length === 0) {
      setErrorMsg('Add at least one medicine or diagnostic item to the bill.');
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg('Enter walk-in patient name for tax invoice compliance.');
      return;
    }
    if (requiresScheduleH && (!doctorName.trim() || !doctorRegNo.trim())) {
      setErrorMsg(
        'Schedule H / H1 medications in bill require Prescribing Doctor Name & Medical Council Reg. No.'
      );
      return;
    }
    setErrorMsg('');

    const orderItems: OrderLineItem[] = detailedBill.map((d) => ({
      productId: d.product.id,
      name: d.product.name,
      genericSalt: d.product.genericSalt,
      batchNumber: d.product.batchNumber,
      expiryDate: d.product.expiryDate,
      rackLocation: d.product.rackLocation,
      quantity: d.quantity,
      unitPrice: d.product.price,
      gstRate: d.product.gstRate,
      lineTotal: d.lineTotal,
    }));

    const newInvoice: DispensingOrder = {
      id: `INV-${Math.floor(1045 + Math.random() * 8900)}`,
      orderType: 'Walk-In POS Counter',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || 'Walk-In Counter',
      customerAddress: 'Walk-In Dispensary Counter #1',
      postalCode: '10014',
      paymentMethod,
      discountTier,
      doctorName: requiresScheduleH ? doctorName.trim() : undefined,
      doctorRegNo: requiresScheduleH ? doctorRegNo.trim() : undefined,
      prescriptionRef: linkedRxId || undefined,
      items: orderItems,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount: grandTotal,
      status: 'Dispensed at Counter',
      createdAt: '2026-10-05 10:32',
    };

    onCompleteCounterSale(newInvoice, linkedRxId || undefined);
    setLastIssuedInvoice(newInvoice);
    setBillRows([]);
    setLinkedRxId('');
  };

  const pendingPrescriptions = prescriptions.filter(
    (rx) => rx.status !== 'Dispensed'
  );

  return (
    <div className="max-w-[1320px] mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>Dispensary Terminal #1</span>
            <span aria-hidden="true">·</span>
            <span>FEFO Automatic Batch Allocation</span>
            <span aria-hidden="true">·</span>
            <span>Schedule H Compliance Active</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">
            Walk-In Point of Sale &amp; Clinical Billing
          </h1>
        </div>

        {/* Quick-Load Pending Prescriptions Bar */}
        {pendingPrescriptions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-stone-500">
              Load Pending Rx into Counter:
            </span>
            {pendingPrescriptions.map((rx) => (
              <button
                key={rx.id}
                type="button"
                onClick={() => handleLoadPrescription(rx)}
                className="py-1.5 px-3 rounded-md bg-white border border-stone-300 hover:border-[#0F5338] text-xs font-medium text-stone-800 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#0F5338]" />
                <span>
                  {rx.id} · {rx.patientName}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Two-Column POS Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Fast SKU / Salt Search & Shelf Picker */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-stone-200 bg-[#FAF9F6] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scan SKU barcode, batch number, brand, or generic salt..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-md focus:outline-none focus:border-[#0F5338]"
              />
            </div>
            <span className="text-xs text-stone-500 font-mono tabular-nums shrink-0">
              {filteredCatalog.length} SKUs Ready
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-[11px] font-semibold text-stone-500 bg-[#FAF9F6]">
                  <th className="py-2.5 px-4">Medicine &amp; Salt</th>
                  <th className="py-2.5 px-3">FEFO Batch &amp; Vault</th>
                  <th className="py-2.5 px-3 text-right">Stock</th>
                  <th className="py-2.5 px-3 text-right">MRP</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-xs">
                {filteredCatalog.map((item) => {
                  const expiry = getExpiryStatus(item.expiryDate);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-stone-50/90 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <p className="font-semibold text-stone-900">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-stone-500 line-clamp-1">
                          {item.genericSalt} · {item.schedule}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-mono text-stone-800 tabular-nums">
                          {item.batchNumber} ·{' '}
                          <span
                            className={
                              expiry.tone === 'warning'
                                ? 'text-amber-700 font-medium'
                                : 'text-stone-500'
                            }
                          >
                            {item.expiryDate}
                          </span>
                        </p>
                        <p className="text-[11px] text-stone-500">
                          {item.rackLocation}
                        </p>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums">
                        <span
                          className={
                            item.stock <= item.reorderLevel
                              ? 'text-amber-700 font-semibold'
                              : 'text-stone-800'
                          }
                        >
                          {item.stock}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-stone-900 tabular-nums">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          disabled={item.stock <= 0}
                          onClick={() => handleAddProductToBill(item)}
                          className="py-1.5 px-3 rounded bg-[#0F5338] hover:bg-[#0A3D28] disabled:bg-stone-300 text-white text-xs font-medium inline-flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Bill</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (5 cols): Active Counter Tax Invoice OR Printable Receipt */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-lg p-6 space-y-5">
          {lastIssuedInvoice ? (
            <div className="space-y-5">
              <div className="p-4 bg-[#0F5338]/10 border border-[#0F5338]/30 rounded-md flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0F5338] shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-stone-900 text-sm">
                    Tax Invoice #{lastIssuedInvoice.id} Issued
                  </p>
                  <p className="text-stone-600">
                    Inventory stock automatically decremented across FEFO
                    batches.
                  </p>
                </div>
              </div>

              {/* Printable Clinical Receipt Card */}
              <div className="p-5 bg-[#FAF9F6] border border-stone-300 rounded-md space-y-4 text-xs">
                <div className="flex justify-between items-start border-b border-stone-300 pb-3">
                  <div>
                    <p className="font-serif text-base font-semibold text-stone-900">
                      Veritas Apothecary
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Clinical Pharmacy · Drug License DL-NY-2026-8841
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="font-semibold text-stone-900">
                      {lastIssuedInvoice.id}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      {lastIssuedInvoice.createdAt}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-stone-200 pb-3">
                  <div>
                    <span className="text-stone-500 block">Patient</span>
                    <span className="font-semibold text-stone-900">
                      {lastIssuedInvoice.customerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">
                      Prescribing Doctor
                    </span>
                    <span className="font-semibold text-stone-900">
                      {lastIssuedInvoice.doctorName || 'OTC Self-Selection'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 border-b border-stone-300 pb-3">
                  {lastIssuedInvoice.items.map((line, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-start gap-2"
                    >
                      <div>
                        <p className="font-medium text-stone-900">
                          {line.quantity} × {line.name}
                        </p>
                        <p className="font-mono text-[10px] text-stone-500">
                          Batch {line.batchNumber} · Exp {line.expiryDate} · GST{' '}
                          {line.gstRate}%
                        </p>
                      </div>
                      <span className="font-mono font-semibold tabular-nums text-stone-900">
                        {formatCurrency(line.lineTotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span className="tabular-nums">
                      {formatCurrency(lastIssuedInvoice.subtotal)}
                    </span>
                  </div>
                  {lastIssuedInvoice.discountAmount > 0 && (
                    <div className="flex justify-between text-[#0F5338]">
                      <span>Concession</span>
                      <span className="tabular-nums">
                        −{formatCurrency(lastIssuedInvoice.discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-600">
                    <span>CGST + SGST Total</span>
                    <span className="tabular-nums">
                      {formatCurrency(lastIssuedInvoice.taxAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-stone-900 pt-1.5 border-t border-stone-300">
                    <span>Paid ({lastIssuedInvoice.paymentMethod})</span>
                    <span className="tabular-nums">
                      {formatCurrency(lastIssuedInvoice.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Tax Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLastIssuedInvoice(null)}
                  className="py-2.5 px-4 rounded-lg border border-stone-300 hover:bg-stone-100 text-xs font-medium text-stone-800 cursor-pointer"
                >
                  New Counter Bill
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleIssueInvoice} className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h2 className="font-serif text-lg font-semibold text-stone-900">
                  Counter Tax Invoice Draft
                </h2>
                {linkedRxId && (
                  <span className="text-xs font-mono text-[#0F5338] font-medium">
                    Linked: {linkedRxId}
                  </span>
                )}
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-300 rounded text-xs text-red-900">
                  {errorMsg}
                </div>
              )}

              {/* Patient & Doctor Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Walk-In Patient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#FAF9F6] border border-stone-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Patient Phone
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FAF9F6] border border-stone-300 rounded"
                  />
                </div>
              </div>

              {requiresScheduleH && (
                <div className="p-3 bg-stone-100 border border-stone-300 rounded space-y-2.5">
                  <p className="text-[11px] font-semibold text-stone-800">
                    Schedule H / H1 Registry (Required for Rx items in bill)
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-stone-600 mb-0.5">
                        Prescribing Doctor *
                      </label>
                      <input
                        type="text"
                        required
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-stone-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-600 mb-0.5">
                        Medical Reg. No. *
                      </label>
                      <input
                        type="text"
                        required
                        value={doctorRegNo}
                        onChange={(e) => setDoctorRegNo(e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono bg-white border border-stone-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Interaction Alert */}
              {activeInteractions.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
                    <span>Drug Interaction Detected on Counter Bill</span>
                  </div>
                  {activeInteractions.map((pair, idx) => (
                    <p key={idx} className="text-[11px] leading-relaxed">
                      <strong>
                        {pair.sourceProduct.name} + {pair.targetProduct.name}:
                      </strong>{' '}
                      {pair.interaction.clinicalNote}
                    </p>
                  ))}
                </div>
              )}

              {/* Bill Line Items */}
              <div className="border-y border-stone-200 divide-y divide-stone-200 max-h-64 overflow-y-auto">
                {detailedBill.length === 0 ? (
                  <p className="py-8 text-center text-xs text-stone-500">
                    No medicines billed yet. Click “+ Bill” on any item in the
                    left catalog.
                  </p>
                ) : (
                  detailedBill.map((item) => (
                    <div
                      key={item.productId}
                      className="py-2.5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-stone-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="font-mono text-[11px] text-stone-500">
                          Batch {item.product.batchNumber} · GST{' '}
                          {item.product.gstRate}% ·{' '}
                          {formatCurrency(item.product.price)}/u
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center border border-stone-300 rounded bg-[#FAF9F6]">
                          <button
                            type="button"
                            onClick={() => handleStepQty(item.productId, -1)}
                            className="w-6 h-6 flex items-center justify-center font-mono text-stone-700 hover:bg-stone-200 cursor-pointer"
                          >
                            −
                          </button>
                          <span className="w-7 text-center font-mono text-xs font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStepQty(item.productId, 1)}
                            className="w-6 h-6 flex items-center justify-center font-mono text-stone-700 hover:bg-stone-200 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <span className="w-16 text-right font-mono font-semibold text-stone-900 tabular-nums">
                          {formatCurrency(item.lineTotal)}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setBillRows((prev) =>
                              prev.filter((r) => r.productId !== item.productId)
                            )
                          }
                          className="text-stone-400 hover:text-red-700 p-1 cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Concession & Payment Mode Controls */}
              <div className="space-y-3">
                <div>
                  <span className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Concession Category
                  </span>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 rounded-md">
                    {(
                      [
                        'Standard (0%)',
                        'Senior Citizen (10%)',
                        'Hospital Staff (15%)',
                      ] as const
                    ).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setDiscountTier(tier)}
                        className={`py-1.5 px-2 text-[11px] font-medium rounded transition-colors whitespace-nowrap truncate cursor-pointer ${
                          discountTier === tier
                            ? 'bg-white text-stone-900 shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Payment Mode
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-stone-100 rounded-md">
                    {(
                      [
                        'UPI / Clinical QR',
                        'Counter Cash',
                        'Card Terminal',
                        'Insurance Claim',
                      ] as const
                    ).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPaymentMethod(mode)}
                        className={`py-1.5 px-2 text-[11px] font-medium rounded transition-colors whitespace-nowrap truncate cursor-pointer ${
                          paymentMethod === mode
                            ? 'bg-white text-stone-900 shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="p-3.5 bg-[#FAF9F6] border border-stone-200 rounded-md space-y-1 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>MRP Subtotal</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#0F5338]">
                    <span>Concession ({discountTier})</span>
                    <span className="font-mono tabular-nums">
                      −{formatCurrency(discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>CGST + SGST Breakdown</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(taxAmount)}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-semibold text-stone-900">
                  <span>Net Payable at Counter</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={detailedBill.length === 0}
                className="w-full py-3 px-4 rounded-lg bg-[#0F5338] hover:bg-[#0A3D28] disabled:bg-stone-300 text-white text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                Issue Tax Invoice &amp; Deduct FEFO Stock ·{' '}
                <span className="font-mono tabular-nums">
                  {formatCurrency(grandTotal)}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
