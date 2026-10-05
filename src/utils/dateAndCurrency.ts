import { MedicineProduct, DrugInteraction } from '../types/pharmacy';

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getDaysUntilExpiry(expiryDateStr: string): number {
  const referenceNow = new Date('2026-10-05T09:00:00');
  const expiry = new Date(`${expiryDateStr}T23:59:59`);
  const diffMs = expiry.getTime() - referenceNow.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(expiryDateStr: string): {
  label: string;
  tone: 'critical' | 'warning' | 'nominal';
  daysLeft: number;
} {
  const daysLeft = getDaysUntilExpiry(expiryDateStr);
  if (daysLeft <= 0) {
    return {
      label: `Expired (${Math.abs(daysLeft)}d ago)`,
      tone: 'critical',
      daysLeft,
    };
  }
  if (daysLeft <= 65) {
    return {
      label: `Expiring in ${daysLeft}d (${expiryDateStr})`,
      tone: 'warning',
      daysLeft,
    };
  }
  return {
    label: `Exp ${expiryDateStr} (${daysLeft}d)`,
    tone: 'nominal',
    daysLeft,
  };
}

export interface DetectedInteractionPair {
  sourceProduct: MedicineProduct;
  targetProduct: MedicineProduct;
  interaction: DrugInteraction;
}

export function findActiveInteractions(
  productIds: string[],
  allProducts: MedicineProduct[]
): DetectedInteractionPair[] {
  const uniqueIds = Array.from(new Set(productIds));
  const selectedProducts = uniqueIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is MedicineProduct => Boolean(p));

  const results: DetectedInteractionPair[] = [];
  const seenKeys = new Set<string>();

  for (const source of selectedProducts) {
    for (const inter of source.interactions) {
      const target = selectedProducts.find(
        (p) => p.id === inter.targetProductId
      );
      if (target) {
        const pairKey = [source.id, target.id].sort().join('::');
        if (!seenKeys.has(pairKey)) {
          seenKeys.add(pairKey);
          results.push({
            sourceProduct: source,
            targetProduct: target,
            interaction: inter,
          });
        }
      }
    }
  }

  return results;
}
