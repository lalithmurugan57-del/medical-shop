import React, { useState, useMemo } from 'react';
import { Search, Plus, Check, ArrowUpRight } from 'lucide-react';
import {
  MedicineProduct,
  ProductCategory,
  CartItem,
} from '../types/pharmacy';
import { HERO_APOTHECARY_IMAGE } from '../data/initialPharmacyData';
import { ClinicalProductVisual } from './ClinicalProductVisual';
import { formatCurrency, getExpiryStatus } from '../utils/dateAndCurrency';

interface StorefrontViewProps {
  products: MedicineProduct[];
  onInspectProduct: (product: MedicineProduct) => void;
  onAddToCart: (
    product: MedicineProduct,
    quantity: number,
    packVariant: CartItem['packVariant']
  ) => void;
  onOpenUploadRx: () => void;
  onSwitchToPOS: () => void;
}

const CATEGORIES: ('All Formulary' | ProductCategory)[] = [
  'All Formulary',
  'Diagnostic Devices',
  'Prescription (Rx)',
  'Respiratory & Care',
  'Clinical Supplements',
  'First Aid & Surgical',
];

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  products,
  onInspectProduct,
  onAddToCart,
  onOpenUploadRx,
  onSwitchToPOS,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'All Formulary' | ProductCategory
  >('All Formulary');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<
    'featured' | 'price-asc' | 'price-desc' | 'expiry-soon'
  >('featured');
  const [otcOnly, setOtcOnly] = useState(false);
  const [addedFeedbackId, setAddedFeedbackId] = useState<string | null>(null);
  const [heroImgError, setHeroImgError] = useState(false);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (
          selectedCategory !== 'All Formulary' &&
          product.category !== selectedCategory
        ) {
          return false;
        }
        if (otcOnly && product.schedule !== 'OTC Direct') {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            product.name.toLowerCase().includes(q) ||
            product.genericSalt.toLowerCase().includes(q) ||
            product.sku.toLowerCase().includes(q) ||
            product.category.toLowerCase().includes(q) ||
            product.manufacturer.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'expiry-soon') {
          return (
            new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
          );
        }
        return 0;
      });
  }, [products, selectedCategory, searchQuery, sortBy, otcOnly]);

  const handleQuickAdd = (
    e: React.MouseEvent,
    product: MedicineProduct
  ) => {
    e.stopPropagation();
    onAddToCart(product, 1, 'Single Unit');
    setAddedFeedbackId(product.id);
    setTimeout(() => {
      setAddedFeedbackId((prev) => (prev === product.id ? null : prev));
    }, 1200);
  };

  return (
    <div className="space-y-20 pb-16">
      {/* SECTION 1: Storefront Hero */}
      <section className="max-w-[1320px] mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-stone-200/90 rounded-lg p-6 md:p-10">
          {/* Left Editorial Column */}
          <div className="lg:col-span-6 space-y-6">
            {/* Unboxed Regional & Clinical Trust Metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
              <span>ISO 9001:2015 Clinical Dispensary</span>
              <span aria-hidden="true">·</span>
              <span>USP &lt;797&gt; Cold-Chain Verified</span>
              <span aria-hidden="true">·</span>
              <span>Direct Batch Traceability</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900 leading-[1.18] tracking-tight">
              Precision pharmaceutical dispensing and clinical home diagnostics.
            </h1>

            <p className="text-base text-stone-600 leading-relaxed max-w-[62ch]">
              Every formulation, biologic pen, and oscillometric diagnostic
              instrument is dispensed from temperature-logged vaults with full
              FEFO batch and expiry verification on every invoice.
            </p>

            {/* Direct Search Bar inside Hero */}
            <div className="relative max-w-xl">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by brand name, generic salt molecule (e.g. Metformin, Vitamin D3), or SKU..."
                className="w-full pl-10 pr-4 py-3 text-sm bg-[#FAF9F6] border border-stone-300 rounded-lg focus:outline-none focus:border-[#0F5338] text-stone-900 placeholder:text-stone-400"
              />
            </div>

            {/* Hero Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="#formulary-catalog"
                className="py-2.5 px-5 rounded-lg bg-[#0F5338] hover:bg-[#0A3D28] text-white text-xs font-medium transition-colors whitespace-nowrap"
              >
                Browse Clinical Formulary
              </a>
              <button
                type="button"
                onClick={onOpenUploadRx}
                className="py-2.5 px-4 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                Register Doctor Prescription (Rx)
              </button>
              <button
                type="button"
                onClick={onSwitchToPOS}
                className="py-2.5 px-4 text-xs font-medium text-stone-600 hover:text-stone-900 underline underline-offset-4 transition-colors whitespace-nowrap cursor-pointer"
              >
                Open Counter POS Terminal
              </button>
            </div>
          </div>

          {/* Right 16:9 Architectural Hero Visual */}
          <div className="lg:col-span-6">
            <div className="relative aspect-[16/9] w-full rounded-md overflow-hidden bg-stone-900 border border-stone-200">
              {!heroImgError ? (
                <img
                  src={HERO_APOTHECARY_IMAGE}
                  alt="Veritas Apothecary interior with amber medicine bottles and travertine dispensary counter"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-stone-800 flex items-center justify-center p-8 text-stone-300 font-serif">
                  Veritas Apothecary — Clinical Dispensary Vault
                </div>
              )}
              {/* Measured Contrast Scrim for overlay caption */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
                <div className="text-white space-y-1">
                  <p className="text-xs text-stone-300">
                    Dispensary Vault Telemetry · Cold Storage Bay C-01 at 4.2°C
                  </p>
                  <p className="font-serif text-base font-normal text-stone-100">
                    Pharmacist-verified Schedule H &amp; OTC formulary ready for
                    same-day courier or walk-in counter billing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Featured Formulary & Medical Equipment Catalog */}
      <section
        id="formulary-catalog"
        className="max-w-[1320px] mx-auto px-6 space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">
              01. Clinical Formulary &amp; Diagnostic Supply
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Select any medication or medical instrument to inspect its complete
              pharmacological monograph, batch expiry, and interaction profile.
            </p>
          </div>

          {/* Sort & OTC Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={otcOnly}
                onChange={(e) => setOtcOnly(e.target.checked)}
                className="rounded border-stone-300 text-[#0F5338] focus:ring-[#0F5338]"
              />
              <span>OTC Direct Only (Exclude Rx)</span>
            </label>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                    | 'featured'
                    | 'price-asc'
                    | 'price-desc'
                    | 'expiry-soon'
                )
              }
              aria-label="Sort formulary products"
              className="px-3 py-2 text-xs bg-white border border-stone-300 rounded-md text-stone-800 focus:outline-none focus:border-[#0F5338]"
            >
              <option value="featured">Sort: Pharmacist Curated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="expiry-soon">FEFO: Earliest Expiry First</option>
            </select>
          </div>
        </div>

        {/* Interactive Category Segmented Filter Bar */}
        <div className="flex items-center gap-1.5 p-1.5 bg-stone-200/65 rounded-lg overflow-x-auto">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === category
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Product Grid: 3-Column Desktop, 2-Column Tablet */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white border border-stone-200 rounded-lg space-y-3">
            <p className="font-serif text-lg text-stone-900">
              No formulary items match your current filter criteria
            </p>
            <p className="text-xs text-stone-500">
              Try clearing your search query or switching to All Formulary.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All Formulary');
                setSearchQuery('');
                setOtcOnly(false);
              }}
              className="py-2 px-4 rounded-lg bg-stone-900 text-white text-xs font-medium cursor-pointer"
            >
              Reset Formulary Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const expiry = getExpiryStatus(product.expiryDate);
              const isAdded = addedFeedbackId === product.id;

              return (
                <article
                  key={product.id}
                  onClick={() => onInspectProduct(product)}
                  className="group bg-white border border-stone-200/90 rounded-lg overflow-hidden flex flex-col justify-between transition-transform duration-150 ease-out hover:-translate-y-0.5 cursor-pointer"
                >
                  <div>
                    {/* 4:3 Uniform Backdrop Image Stage */}
                    <div className="aspect-[4/3] w-full border-b border-stone-200/70">
                      <ClinicalProductVisual
                        product={product}
                        className="w-full h-full"
                      />
                    </div>

                    {/* Card Content */}
                    <div className="p-6 space-y-2.5">
                      {/* Unboxed Clean Metadata Line */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
                        <span>{product.category}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            product.schedule !== 'OTC Direct'
                              ? 'text-amber-800 font-medium'
                              : 'text-stone-500'
                          }
                        >
                          {product.schedule}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {product.stock} in stock
                        </span>
                      </div>

                      {/* Product Name (16px SemiBold) */}
                      <h3 className="text-base font-semibold text-stone-900 leading-snug group-hover:text-[#0F5338] transition-colors">
                        {product.name}
                      </h3>

                      {/* Active Generic Composition */}
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {product.genericSalt}
                      </p>

                      {/* Traceability Line */}
                      <div className="pt-1 flex items-center gap-2 text-[11px] text-stone-500 font-mono tabular-nums">
                        <span>Batch {product.batchNumber}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            expiry.tone === 'warning'
                              ? 'text-amber-700 font-medium'
                              : 'text-stone-500'
                          }
                        >
                          {expiry.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Baseline-Aligned Price & Actions Footer */}
                  <div className="px-6 pb-6 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-mono text-[15px] font-semibold text-stone-900 tabular-nums block">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {product.packSize.split(' ').slice(0, 3).join(' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectProduct(product);
                        }}
                        className="py-2 px-3 rounded-md border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-medium flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <span>Monograph</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={product.stock === 0}
                        onClick={(e) => handleQuickAdd(e, product)}
                        className={`py-2 px-3.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer ${
                          isAdded
                            ? 'bg-stone-900 text-white'
                            : 'bg-[#0F5338] hover:bg-[#0A3D28] text-white'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Dispense</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 3: Clinical Compounding Standards & Attributable Proof */}
      <section className="max-w-[1320px] mx-auto px-6">
        <div className="bg-white border border-stone-200/90 rounded-lg p-8 md:p-12 space-y-10">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">
              02. Clinical Dispensing Rigor &amp; Cold-Chain Proof
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Every prescription and over-the-counter dispatch undergoes dual
              pharmacist verification, automated drug-interaction screening, and
              continuous thermal telemetry.
            </p>
          </div>

          {/* Quantitative Precision Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-y border-stone-200 py-8">
            <div className="space-y-1.5">
              <p className="font-mono text-2xl sm:text-3xl font-semibold text-[#0F5338] tabular-nums">
                99.94%
              </p>
              <p className="text-sm font-semibold text-stone-900">
                Cold-Chain Thermal Compliance (2°C–8°C)
              </p>
              <p className="text-xs text-stone-600 leading-relaxed">
                Verified across 14,280+ insulin and biologic pen dispatches over
                the past 12 months using calibrated phase-change gel packs.
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="font-mono text-2xl sm:text-3xl font-semibold text-stone-900 tabular-nums">
                16.4 min
              </p>
              <p className="text-sm font-semibold text-stone-900">
                Median Schedule H Pharmacist Review Turnaround
              </p>
              <p className="text-xs text-stone-600 leading-relaxed">
                Measured across 9,400+ outpatient prescriptions with automated
                contraindication and dosage cross-checks in Q3 2026.
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="font-mono text-2xl sm:text-3xl font-semibold text-stone-900 tabular-nums">
                100% FEFO
              </p>
              <p className="text-sm font-semibold text-stone-900">
                Batch &amp; NDC Lot Traceability on Every Invoice
              </p>
              <p className="text-xs text-stone-600 leading-relaxed">
                Zero unverified wholesale intermediaries; all stock is sourced
                directly from GMP-certified pharmaceutical manufacturers.
              </p>
            </div>
          </div>

          {/* Attributable Testimonials (Full Name, Role, Organization, Concrete Before/Change/Outcome) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <blockquote className="space-y-3 border-l-2 border-[#0F5338] pl-5">
              <p className="text-sm text-stone-700 leading-relaxed">
                “Before integrating our clinic’s outpatient scripts with Veritas
                Apothecary, nearly 18% of our geriatric endocrine patients
                experienced delayed basal insulin refills or unflagged statin
                interactions. Since transitioning to their FEFO batch-verified
                dispensary, refill adherence rose to 98.6% and every patient
                receives printed dosing schedules with cold-chain temperature
                confirmation.”
              </p>
              <footer className="text-xs text-stone-500">
                <strong className="text-stone-900 font-semibold">
                  Dr. Aris Thorne, MD
                </strong>{' '}
                · Chief of Outpatient Endocrinology · St. Jude Metabolic &amp;
                Vascular Institute
              </footer>
            </blockquote>

            <blockquote className="space-y-3 border-l-2 border-stone-300 pl-5">
              <p className="text-sm text-stone-700 leading-relaxed">
                “Managing my mother’s post-discharge hypertension and respiratory
                regimen used to mean visiting three separate pharmacies to find
                nebulizer ampoules and sustained-release tablets in stock.
                Veritas Apothecary verified her prescription in 14 minutes,
                flagged a Vitamin K2 interaction on our order, and delivered the
                complete batch-labeled kit to our door the same afternoon.”
              </p>
              <footer className="text-xs text-stone-500">
                <strong className="text-stone-900 font-semibold">
                  Marcus Sterling
                </strong>{' '}
                · Primary Caregiver &amp; Outpatient Client · Manhattan District
              </footer>
            </blockquote>
          </div>
        </div>
      </section>
    </div>
  );
};
