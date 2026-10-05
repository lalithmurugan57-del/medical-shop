import React, { useState } from 'react';
import { X, Plus, Check, AlertTriangle } from 'lucide-react';
import { MedicineProduct, CartItem } from '../types/pharmacy';
import { ClinicalProductVisual } from './ClinicalProductVisual';
import {
  formatCurrency,
  getExpiryStatus,
  findActiveInteractions,
} from '../utils/dateAndCurrency';

interface ProductMonographModalProps {
  product: MedicineProduct | null;
  onClose: () => void;
  onAddToCart: (
    product: MedicineProduct,
    quantity: number,
    packVariant: CartItem['packVariant']
  ) => void;
  cartItems: CartItem[];
  allProducts: MedicineProduct[];
}

export const ProductMonographModal: React.FC<ProductMonographModalProps> = ({
  product,
  onClose,
  onAddToCart,
  cartItems,
  allProducts,
}) => {
  const [packVariant, setPackVariant] =
    useState<CartItem['packVariant']>('Single Unit');
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const expiryInfo = getExpiryStatus(product.expiryDate);
  const unitEffectivePrice =
    packVariant === 'Clinical 3-Pack (Save 8%)'
      ? Number((product.price * 3 * 0.92).toFixed(2))
      : product.price;

  // Check if adding this product creates a drug interaction with existing cart items
  const cartProductIds = cartItems.map((c) => c.productId);
  const potentialInteractions = findActiveInteractions(
    [...cartProductIds, product.id],
    allProducts
  ).filter(
    (pair) =>
      pair.sourceProduct.id === product.id ||
      pair.targetProduct.id === product.id
  );

  const handleConfirmAdd = () => {
    onAddToCart(product, quantity, packVariant);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1400);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/55 backdrop-blur-[2px] flex items-center justify-center p-4 md:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="monograph-title"
    >
      <div className="relative w-full max-w-4xl bg-[#FAF9F6] border border-stone-300 rounded-lg shadow-xl overflow-hidden my-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <span>Clinical Monograph</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">NDC {product.ndcCode}</span>
            <span aria-hidden="true">·</span>
            <span>{product.schedule}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-900 rounded-md focus-visible:outline-2 focus-visible:outline-[#0F5338] transition-colors"
            aria-label="Close clinical monograph"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contiguous Purchase Module: Sticky Gallery Left + Sticky Purchase Module Right */}
        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[82vh] overflow-y-auto">
          {/* Left Column: Visual & Clinical Monograph Specifications */}
          <div className="md:col-span-6 p-6 md:p-8 border-b md:border-b-0 md:border-r border-stone-200 flex flex-col gap-6">
            <div className="aspect-[4/3] w-full rounded-md overflow-hidden border border-stone-200/80">
              <ClinicalProductVisual product={product} className="w-full h-full" />
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h4 className="text-xs font-semibold text-stone-500">
                  Pharmacological Indications & Profile
                </h4>
                <p className="text-stone-700 leading-relaxed mt-1">
                  {product.description}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-200">
                <h4 className="text-xs font-semibold text-stone-500">
                  Standard Administration & Dosage Protocol
                </h4>
                <p className="text-stone-700 leading-relaxed mt-1">
                  {product.dosageGuidance}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-200">
                <h4 className="text-xs font-semibold text-stone-500">
                  Contraindications & Clinical Precautions
                </h4>
                <p className="text-stone-700 leading-relaxed mt-1">
                  {product.contraindications}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase & Dispensing Module */}
          <div className="md:col-span-6 p-6 md:p-8 bg-white flex flex-col justify-between gap-6">
            <div className="space-y-5">
              {/* Unboxed clean metadata line */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                <span>{product.category}</span>
                <span aria-hidden="true">·</span>
                <span>{product.manufacturer}</span>
                <span aria-hidden="true">·</span>
                <span>{product.storageCondition}</span>
              </div>

              <div>
                <h2
                  id="monograph-title"
                  className="font-serif text-2xl font-semibold text-stone-900 leading-snug"
                >
                  {product.name}
                </h2>
                <p className="text-sm text-stone-600 mt-1.5 font-medium">
                  Active Composition: {product.genericSalt}
                </p>
              </div>

              {/* Price & Tax Row */}
              <div className="pt-3 pb-4 border-y border-stone-200 flex items-baseline justify-between">
                <div>
                  <span className="font-mono text-2xl font-semibold text-stone-900 tabular-nums">
                    {formatCurrency(unitEffectivePrice)}
                  </span>
                  <span className="text-xs text-stone-500 ml-2">
                    incl. {product.gstRate}% clinical GST · {product.packSize}
                  </span>
                </div>
                <span
                  className={`text-xs font-medium ${
                    product.stock <= product.reorderLevel
                      ? 'text-amber-700'
                      : 'text-[#0F5338]'
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} units in dispensary (${
                        product.stock <= product.reorderLevel ? 'Low Stock' : 'Verified Stock'
                      })`
                    : 'Out of Stock'}
                </span>
              </div>

              {/* Traceability Metadata Grid (Unboxed, clean hairline dividers) */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs border-b border-stone-200 pb-4">
                <div>
                  <span className="text-stone-500 block">FEFO Batch Number</span>
                  <span className="font-mono font-medium text-stone-900 tabular-nums">
                    {product.batchNumber}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Batch Expiry</span>
                  <span
                    className={`font-mono font-medium tabular-nums ${
                      expiryInfo.tone === 'warning'
                        ? 'text-amber-700'
                        : expiryInfo.tone === 'critical'
                        ? 'text-red-700'
                        : 'text-stone-900'
                    }`}
                  >
                    {expiryInfo.label}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Dispensary Vault / Rack</span>
                  <span className="font-medium text-stone-900">
                    {product.rackLocation}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Dispensing Classification</span>
                  <span className="font-medium text-stone-900">
                    {product.schedule}
                  </span>
                </div>
              </div>

              {/* Live Drug Interaction Warning if conflict with current bag */}
              {potentialInteractions.length > 0 && (
                <div className="p-3.5 bg-amber-50/90 border border-amber-300 rounded-md text-xs text-amber-950 space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-amber-900">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
                    <span>
                      Pharmacist Interaction Advisory with Current Dispensing Bag
                    </span>
                  </div>
                  {potentialInteractions.map((item, idx) => (
                    <p key={idx} className="leading-relaxed text-amber-900">
                      <span className="font-semibold">
                        {item.interaction.severity} Interaction:
                      </span>{' '}
                      {item.interaction.clinicalNote}
                    </p>
                  ))}
                </div>
              )}

              {/* Variant Selector (Interactive buttons) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700">
                  Dispensing Pack Option
                </label>
                <div className="grid grid-cols-2 gap-2.5 p-1 bg-stone-100 rounded-lg">
                  {(
                    [
                      'Single Unit',
                      'Clinical 3-Pack (Save 8%)',
                    ] as CartItem['packVariant'][]
                  ).map((variant) => (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => setPackVariant(variant)}
                      className={`py-2 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap truncate ${
                        packVariant === variant
                          ? 'bg-white text-stone-900 shadow-sm'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-stone-700">
                  Quantity to Dispense
                </span>
                <div className="flex items-center border border-stone-300 rounded-md bg-[#FAF9F6]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-stone-700 hover:bg-stone-200/60 transition-colors font-mono"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-mono text-sm font-semibold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    className="w-10 h-10 flex items-center justify-center text-stone-700 hover:bg-stone-200/60 transition-colors font-mono"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Primary Purchase / Dispense CTA */}
            <div className="pt-4 border-t border-stone-200 space-y-2">
              <button
                type="button"
                disabled={product.stock === 0}
                onClick={handleConfirmAdd}
                className="w-full py-3 px-5 rounded-lg bg-[#0F5338] hover:bg-[#0A3D28] disabled:bg-stone-300 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>
                      Added to Dispensing Bag —{' '}
                      {formatCurrency(unitEffectivePrice * quantity)}
                    </span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>
                      Add to Dispensing Bag ·{' '}
                      <span className="font-mono tabular-nums">
                        {formatCurrency(unitEffectivePrice * quantity)}
                      </span>
                    </span>
                  </>
                )}
              </button>
              {product.schedule !== 'OTC Direct' && (
                <p className="text-[11px] text-stone-500 text-center">
                  Requires attending physician details or prescription reference at checkout.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
