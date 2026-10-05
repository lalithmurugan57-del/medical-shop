import React, { useState } from 'react';
import { MedicineProduct } from '../types/pharmacy';

interface ClinicalProductVisualProps {
  product: MedicineProduct;
  className?: string;
}

export const ClinicalProductVisual: React.FC<ClinicalProductVisualProps> = ({
  product,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  if (product.image && !imageError) {
    return (
      <div
        className={`relative overflow-hidden bg-[#F4F3EF] select-none ${className}`}
      >
        <img
          src={product.image}
          alt={`${product.name} — ${product.genericSalt}`}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover object-center transition-transform duration-200 ease-out group-hover:scale-[1.02]"
        />
      </div>
    );
  }

  // Bespoke Swiss-pharmaceutical clinical packaging rendering for Rx blister boxes, biologic pens & sterile kits
  const { accentHex, dosageForm, strengthLabel } = product.packagingTheme;

  return (
    <div
      className={`relative overflow-hidden bg-[#F4F3EF] flex items-center justify-center p-6 select-none ${className}`}
    >
      {/* Subtle architectural grid background */}
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            'radial-gradient(#D6D3CD 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* Studio 3D-feel Swiss Pharmaceutical Box / Vial Specimen */}
      <div className="relative z-10 w-full max-w-[240px] bg-[#FAF9F6] border border-stone-300/90 shadow-sm rounded-md overflow-hidden transition-transform duration-200 ease-out group-hover:translate-y-[-2px]">
        {/* Top clinical color band */}
        <div
          className="h-3 w-full"
          style={{ backgroundColor: accentHex }}
        />

        <div className="p-4 flex flex-col justify-between min-h-[156px]">
          {/* NDC & Dosage Form Header */}
          <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 border-b border-stone-200 pb-1.5">
            <span>NDC {product.ndcCode}</span>
            <span>{dosageForm}</span>
          </div>

          {/* Molecule & Brand Lockup */}
          <div className="my-2.5">
            <p className="text-[11px] text-stone-500 line-clamp-1 font-medium">
              {product.manufacturer}
            </p>
            <p className="font-serif text-sm font-semibold text-stone-900 leading-snug line-clamp-1 mt-0.5">
              {product.name}
            </p>
            <p className="text-[11px] text-stone-600 line-clamp-1 mt-0.5">
              {product.genericSalt}
            </p>
          </div>

          {/* Bottom Strength & Storage Bar */}
          <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[11px]">
            <span
              className="font-mono font-semibold"
              style={{ color: accentHex }}
            >
              {strengthLabel}
            </span>
            <span className="font-mono text-[10px] text-stone-500">
              {product.batchNumber}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
