import React, { useState } from 'react';
import {
  X,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import {
  CartItem,
  MedicineProduct,
  DispensingOrder,
  OrderLineItem,
} from '../types/pharmacy';
import {
  formatCurrency,
  findActiveInteractions,
} from '../utils/dateAndCurrency';

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  products: MedicineProduct[];
  onUpdateQuantity: (
    productId: string,
    packVariant: CartItem['packVariant'],
    delta: number
  ) => void;
  onRemoveItem: (
    productId: string,
    packVariant: CartItem['packVariant']
  ) => void;
  onCompleteStorefrontOrder: (order: DispensingOrder) => void;
  onViewOrdersLedger: () => void;
}

const FREE_DELIVERY_THRESHOLD = 75.0;

export const CartCheckoutDrawer: React.FC<CartCheckoutDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  products,
  onUpdateQuantity,
  onRemoveItem,
  onCompleteStorefrontOrder,
  onViewOrdersLedger,
}) => {
  const [step, setStep] = useState<'bag' | 'checkout' | 'confirmed'>('bag');
  const [customerName, setCustomerName] = useState('Evelyn Gallagher');
  const [customerPhone, setCustomerPhone] = useState('+1 (555) 482-1930');
  const [customerAddress, setCustomerAddress] = useState(
    '240 Mercer Street, Apt 6B, New York'
  );
  const [postalCode, setPostalCode] = useState('10012');
  const [paymentMethod, setPaymentMethod] = useState<
    'Cash on Delivery (COD)' | 'UPI / Clinical QR' | 'Card Terminal'
  >('Cash on Delivery (COD)');
  const [discountTier, setDiscountTier] = useState<
    'Standard (0%)' | 'Senior Citizen (10%)' | 'Hospital Staff (15%)'
  >('Standard (0%)');
  const [doctorName, setDoctorName] = useState('Dr. Aris Thorne, MD');
  const [doctorRegNo, setDoctorRegNo] = useState('MCI-48291-EN');
  const [formError, setFormError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<DispensingOrder | null>(
    null
  );

  if (!isOpen) return null;

  // Enrich cart items
  const detailedItems = cartItems
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      const unitEffectivePrice =
        item.packVariant === 'Clinical 3-Pack (Save 8%)'
          ? Number((product.price * 3 * 0.92).toFixed(2))
          : product.price;
      const unitsDeducted =
        item.packVariant === 'Clinical 3-Pack (Save 8%)'
          ? item.quantity * 3
          : item.quantity;
      return {
        ...item,
        product,
        unitEffectivePrice,
        unitsDeducted,
        lineTotal: Number((unitEffectivePrice * item.quantity).toFixed(2)),
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const requiresPrescription = detailedItems.some(
    (d) => d.product.schedule !== 'OTC Direct'
  );

  const activeInteractions = findActiveInteractions(
    detailedItems.map((d) => d.product.id),
    products
  );

  const subtotal = Number(
    detailedItems.reduce((acc, item) => acc + item.lineTotal, 0).toFixed(2)
  );

  const discountRate =
    discountTier === 'Senior Citizen (10%)'
      ? 0.1
      : discountTier === 'Hospital Staff (15%)'
      ? 0.15
      : 0;

  const discountAmount = Number((subtotal * discountRate).toFixed(2));
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number((taxableBase * 0.08).toFixed(2));
  const deliveryFee =
    subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : 6.5;
  const totalAmount = Number(
    (taxableBase + taxAmount + deliveryFee).toFixed(2)
  );

  const amountToFreeDelivery = Math.max(
    0,
    Number((FREE_DELIVERY_THRESHOLD - subtotal).toFixed(2))
  );

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !customerName.trim() ||
      !customerPhone.trim() ||
      !customerAddress.trim() ||
      !postalCode.trim()
    ) {
      setFormError(
        'Please complete customer name, phone, street address, and postal code for delivery verification.'
      );
      return;
    }
    if (requiresPrescription && (!doctorName.trim() || !doctorRegNo.trim())) {
      setFormError(
        'Schedule H / H1 items in bag require Prescribing Physician Name and Medical Registration Number.'
      );
      return;
    }
    setFormError('');

    const orderItems: OrderLineItem[] = detailedItems.map((d) => ({
      productId: d.product.id,
      name: `${d.product.name} (${d.packVariant})`,
      genericSalt: d.product.genericSalt,
      batchNumber: d.product.batchNumber,
      expiryDate: d.product.expiryDate,
      rackLocation: d.product.rackLocation,
      quantity: d.unitsDeducted,
      unitPrice: d.unitEffectivePrice,
      gstRate: d.product.gstRate,
      lineTotal: d.lineTotal,
    }));

    const newOrder: DispensingOrder = {
      id: `ORD-${Math.floor(1045 + Math.random() * 8900)}`,
      orderType: 'Storefront Home Delivery',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      postalCode: postalCode.trim(),
      paymentMethod,
      discountTier,
      doctorName: requiresPrescription ? doctorName.trim() : undefined,
      doctorRegNo: requiresPrescription ? doctorRegNo.trim() : undefined,
      items: orderItems,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      status: 'Confirmed',
      createdAt: '2026-10-05 10:18',
    };

    onCompleteStorefrontOrder(newOrder);
    setConfirmedOrder(newOrder);
    setStep('confirmed');
  };

  const handleCloseDrawer = () => {
    if (step === 'confirmed') {
      setStep('bag');
      setConfirmedOrder(null);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-[2px] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Dispensing Bag and Clinical Checkout"
    >
      <div className="w-full max-w-lg bg-[#FAF9F6] h-full flex flex-col border-l border-stone-300 shadow-2xl">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-white border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              {step === 'bag' && 'Clinical Dispensing Bag'}
              {step === 'checkout' && 'Patient Delivery & COD Verification'}
              {step === 'confirmed' && 'Dispensing Order Confirmed'}
            </h2>
            <p className="text-xs text-stone-500">
              {step === 'bag' &&
                `Free cold-chain courier threshold: ${formatCurrency(
                  FREE_DELIVERY_THRESHOLD
                )}`}
              {step === 'checkout' &&
                'Direct batch-traceable dispatch from Veritas Apothecary'}
              {step === 'confirmed' &&
                'Verified by supervising pharmacist ledger'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCloseDrawer}
            className="p-2 text-stone-500 hover:text-stone-900 rounded-md transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Bag Contents */}
        {step === 'bag' && (
          <>
            {/* Free delivery threshold bar */}
            <div className="px-6 py-2.5 bg-stone-100 border-b border-stone-200 text-xs text-stone-700 flex items-center justify-between">
              {amountToFreeDelivery > 0 ? (
                <span>
                  Add{' '}
                  <strong className="font-mono tabular-nums">
                    {formatCurrency(amountToFreeDelivery)}
                  </strong>{' '}
                  more for complimentary insulated clinical delivery
                </span>
              ) : (
                <span className="text-[#0F5338] font-medium">
                  Complimentary insulated cold-chain delivery unlocked
                </span>
              )}
              <span className="font-mono tabular-nums text-stone-500">
                {detailedItems.length} item(s)
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {detailedItems.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <p className="font-serif text-lg text-stone-800">
                    Your dispensing bag is empty
                  </p>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                    Select diagnostic equipment, prescription medications, or
                    clinical supplements from the formulary to begin checkout.
                  </p>
                </div>
              ) : (
                <>
                  {/* Active Drug Interaction Banner */}
                  {activeInteractions.length > 0 && (
                    <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-md text-xs text-amber-950 space-y-1.5">
                      <div className="flex items-center gap-2 font-semibold text-amber-900">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
                        <span>
                          Pharmacist Regimen Advisory ({activeInteractions.length}{' '}
                          detected)
                        </span>
                      </div>
                      {activeInteractions.map((pair, idx) => (
                        <p key={idx} className="leading-relaxed">
                          <strong>
                            {pair.sourceProduct.name} + {pair.targetProduct.name}:
                          </strong>{' '}
                          {pair.interaction.clinicalNote}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Itemized List */}
                  <div className="divide-y divide-stone-200 border-y border-stone-200 bg-white px-4 rounded-md">
                    {detailedItems.map((item) => (
                      <div
                        key={`${item.productId}-${item.packVariant}`}
                        className="py-4 flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-semibold text-stone-900">
                              {item.product.name}
                            </h4>
                            <p className="text-xs text-stone-500 mt-0.5">
                              {item.packVariant} · Batch{' '}
                              <span className="font-mono">
                                {item.product.batchNumber}
                              </span>{' '}
                              · {item.product.schedule}
                            </p>
                          </div>
                          <span className="font-mono text-sm font-semibold text-stone-900 tabular-nums shrink-0">
                            {formatCurrency(item.lineTotal)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center border border-stone-300 rounded bg-[#FAF9F6]">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(
                                  item.productId,
                                  item.packVariant,
                                  -1
                                )
                              }
                              className="w-8 h-7 flex items-center justify-center text-stone-700 hover:bg-stone-200/70 font-mono text-xs cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-mono text-xs font-semibold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(
                                  item.productId,
                                  item.packVariant,
                                  1
                                )
                              }
                              className="w-8 h-7 flex items-center justify-center text-stone-700 hover:bg-stone-200/70 font-mono text-xs cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              onRemoveItem(item.productId, item.packVariant)
                            }
                            className="text-xs text-stone-500 hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer Summary */}
            {detailedItems.length > 0 && (
              <div className="p-6 bg-white border-t border-stone-200 space-y-4">
                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Formulary Subtotal</span>
                    <span className="font-mono tabular-nums text-stone-900">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Clinical Tax (8%)</span>
                    <span className="font-mono tabular-nums text-stone-900">
                      {formatCurrency(taxAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insulated Courier Dispatch</span>
                    <span className="font-mono tabular-nums text-stone-900">
                      {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-semibold text-stone-900">
                    <span>Total Payable</span>
                    <span className="font-mono tabular-nums">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  className="w-full py-3 px-4 rounded-lg bg-[#0F5338] hover:bg-[#0A3D28] text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <span>Proceed to Patient Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Step 2: Checkout & Cash on Delivery Verification Form */}
        {step === 'checkout' && (
          <form
            onSubmit={handlePlaceOrder}
            className="flex-1 overflow-y-auto p-6 space-y-5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-300 rounded-md text-xs text-red-900">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Patient / Recipient Full Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:border-[#0F5338]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Contact Phone (SMS Dispatch)
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md font-mono focus:outline-none focus:border-[#0F5338]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md font-mono focus:outline-none focus:border-[#0F5338]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Street Delivery Address & Apartment
                </label>
                <input
                  type="text"
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:border-[#0F5338]"
                />
              </div>

              {/* Prescription Verification Section if Schedule H / H1 items present */}
              {requiresPrescription && (
                <div className="p-4 bg-stone-100 border border-stone-300 rounded-md space-y-3">
                  <p className="text-xs font-semibold text-stone-900">
                    Schedule H / H1 Physician Verification Required
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Attending Physician Name
                      </label>
                      <input
                        type="text"
                        required
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Medical Council Reg. No.
                      </label>
                      <input
                        type="text"
                        required
                        value={doctorRegNo}
                        onChange={(e) => setDoctorRegNo(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-stone-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Patient Benefit Concession */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Patient Concession Tier
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-200/70 rounded-lg">
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
                      className={`py-1.5 px-2 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap truncate cursor-pointer ${
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

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Settlement Method
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-200/70 rounded-lg">
                  {(
                    [
                      'Cash on Delivery (COD)',
                      'UPI / Clinical QR',
                      'Card Terminal',
                    ] as const
                  ).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-2 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap truncate cursor-pointer ${
                        paymentMethod === method
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Breakdown Box */}
              <div className="p-4 bg-white border border-stone-200 rounded-md space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Items Subtotal</span>
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
                  <span>Clinical GST & Regulatory Tax</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(taxAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Courier Dispatch (Threshold $75.00)</span>
                  <span className="font-mono tabular-nums">
                    {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-semibold text-stone-900">
                  <span>Total Due ({paymentMethod})</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep('bag')}
                className="py-2.5 px-4 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors whitespace-nowrap cursor-pointer"
              >
                Back to Bag
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-lg bg-[#0F5338] hover:bg-[#0A3D28] text-white text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                Confirm Order ·{' '}
                <span className="font-mono tabular-nums">
                  {formatCurrency(totalAmount)}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Post-Order Confirmation State */}
        {step === 'confirmed' && confirmedOrder && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="p-4 bg-[#0F5338]/10 border border-[#0F5338]/30 rounded-md flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0F5338] shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-stone-900 text-sm">
                    Order #{confirmedOrder.id} Confirmed — Preparing Shipment
                  </p>
                  <p className="text-stone-600">
                    FEFO batch numbers reserved and deducted from dispensary
                    inventory. Cold-chain verification seal assigned.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white border border-stone-200 rounded-md space-y-3 text-xs">
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-500">Recipient</span>
                  <span className="font-medium text-stone-900">
                    {confirmedOrder.customerName} ({confirmedOrder.customerPhone})
                  </span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-500">Delivery Destination</span>
                  <span className="font-medium text-stone-900 text-right">
                    {confirmedOrder.customerAddress}, {confirmedOrder.postalCode}
                  </span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-500">Settlement</span>
                  <span className="font-medium text-stone-900">
                    {confirmedOrder.paymentMethod}
                  </span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <span className="text-stone-500 block font-medium">
                    Dispensed Batches
                  </span>
                  {confirmedOrder.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-stone-800 font-mono text-[11px]"
                    >
                      <span className="truncate max-w-[240px]">
                        {item.quantity}x {item.name} [{item.batchNumber}]
                      </span>
                      <span className="tabular-nums">
                        {formatCurrency(item.lineTotal)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-semibold text-stone-900">
                  <span>Total Amount</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(confirmedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  handleCloseDrawer();
                  onViewOrdersLedger();
                }}
                className="flex-1 py-2.5 px-4 rounded-lg bg-[#0F5338] hover:bg-[#0A3D28] text-white text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                Inspect in Orders & Ledger
              </button>
              <button
                type="button"
                onClick={handleCloseDrawer}
                className="py-2.5 px-4 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors whitespace-nowrap cursor-pointer"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
