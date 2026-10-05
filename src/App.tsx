/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  INITIAL_PRODUCTS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_ORDERS,
} from './data/initialPharmacyData';
import {
  MedicineProduct,
  CartItem,
  PrescriptionRecord,
  PrescriptionStatus,
  DispensingOrder,
  OrderStatus,
} from './types/pharmacy';
import { StorefrontView } from './components/StorefrontView';
import { PointOfSaleView } from './components/PointOfSaleView';
import { InventoryLedgerView } from './components/InventoryLedgerView';
import { PrescriptionsQueueView } from './components/PrescriptionsQueueView';
import { OrdersLedgerView } from './components/OrdersLedgerView';
import { ProductMonographModal } from './components/ProductMonographModal';
import { CartCheckoutDrawer } from './components/CartCheckoutDrawer';
import { UploadPrescriptionModal } from './components/UploadPrescriptionModal';

type ActiveTab =
  | 'storefront'
  | 'pos'
  | 'inventory'
  | 'prescriptions'
  | 'orders';

const STORAGE_KEYS = {
  PRODUCTS: 'veritas_apothecary_products_v2',
  PRESCRIPTIONS: 'veritas_apothecary_rx_v2',
  ORDERS: 'veritas_apothecary_orders_v2',
  CART: 'veritas_apothecary_cart_v2',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('storefront');

  const [products, setProducts] = useState<MedicineProduct[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved) as MedicineProduct[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure bundled asset image URLs stay synced with current build
          return parsed.map((item) => {
            const initialMatch = INITIAL_PRODUCTS.find((p) => p.id === item.id);
            return initialMatch?.image
              ? { ...item, image: initialMatch.image }
              : item;
          });
        }
      }
    } catch {
      // Fallback to initial data
    }
    return INITIAL_PRODUCTS;
  });

  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>(
    () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
        if (saved) return JSON.parse(saved);
      } catch {
        // Fallback
      }
      return INITIAL_PRESCRIPTIONS;
    }
  );

  const [orders, setOrders] = useState<DispensingOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_ORDERS;
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [{ productId: 'med-01', quantity: 1, packVariant: 'Single Unit' }];
  });

  const [inspectedProduct, setInspectedProduct] =
    useState<MedicineProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUploadRxOpen, setIsUploadRxOpen] = useState(false);

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch {
      // Ignore storage quota errors
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.PRESCRIPTIONS,
        JSON.stringify(prescriptions)
      );
    } catch {
      // Ignore
    }
  }, [prescriptions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {
      // Ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartItems));
    } catch {
      // Ignore
    }
  }, [cartItems]);

  const totalBagCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Handlers
  const handleAddToCart = (
    product: MedicineProduct,
    quantity: number,
    packVariant: CartItem['packVariant']
  ) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (c) => c.productId === product.id && c.packVariant === packVariant
      );
      if (existing) {
        return prev.map((c) =>
          c.productId === product.id && c.packVariant === packVariant
            ? { ...c, quantity: c.quantity + quantity }
            : c
        );
      }
      return [...prev, { productId: product.id, quantity, packVariant }];
    });
  };

  const handleUpdateCartQuantity = (
    productId: string,
    packVariant: CartItem['packVariant'],
    delta: number
  ) => {
    setCartItems((prev) =>
      prev
        .map((c) =>
          c.productId === productId && c.packVariant === packVariant
            ? { ...c, quantity: c.quantity + delta }
            : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  const handleRemoveCartItem = (
    productId: string,
    packVariant: CartItem['packVariant']
  ) => {
    setCartItems((prev) =>
      prev.filter(
        (c) => !(c.productId === productId && c.packVariant === packVariant)
      )
    );
  };

  const handleCompleteStorefrontOrder = (newOrder: DispensingOrder) => {
    // Deduct stock from products
    setProducts((prev) =>
      prev.map((prod) => {
        const orderedQty = newOrder.items
          .filter((i) => i.productId === prod.id)
          .reduce((sum, i) => sum + i.quantity, 0);
        if (orderedQty > 0) {
          return { ...prod, stock: Math.max(0, prod.stock - orderedQty) };
        }
        return prod;
      })
    );
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
  };

  const handleCompleteCounterSale = (
    newInvoice: DispensingOrder,
    linkedPrescriptionId?: string
  ) => {
    // Deduct stock
    setProducts((prev) =>
      prev.map((prod) => {
        const billedQty = newInvoice.items
          .filter((i) => i.productId === prod.id)
          .reduce((sum, i) => sum + i.quantity, 0);
        if (billedQty > 0) {
          return { ...prod, stock: Math.max(0, prod.stock - billedQty) };
        }
        return prod;
      })
    );

    if (linkedPrescriptionId) {
      setPrescriptions((prev) =>
        prev.map((rx) =>
          rx.id === linkedPrescriptionId
            ? {
                ...rx,
                status: 'Dispensed',
                pharmacistNotes: `${rx.pharmacistNotes} · Dispensed via Counter Invoice #${newInvoice.id}`,
              }
            : rx
        )
      );
    }

    setOrders((prev) => [newInvoice, ...prev]);
  };

  const handleRestockProduct = (productId: string, addedQty: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stock: p.stock + addedQty } : p
      )
    );
  };

  const handleAddNewBatchProduct = (newProduct: MedicineProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdatePrescriptionStatus = (
    rxId: string,
    newStatus: PrescriptionStatus,
    updatedNotes?: string
  ) => {
    setPrescriptions((prev) =>
      prev.map((rx) =>
        rx.id === rxId
          ? {
              ...rx,
              status: newStatus,
              pharmacistNotes:
                updatedNotes !== undefined ? updatedNotes : rx.pharmacistNotes,
            }
          : rx
      )
    );
  };

  const handleLoadRxIntoBag = (rx: PrescriptionRecord) => {
    const newItems: CartItem[] = rx.prescribedItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      packVariant: 'Single Unit',
    }));
    setCartItems(newItems);
    setIsCartOpen(true);
  };

  const handleSubmitNewPrescription = (newRx: PrescriptionRecord) => {
    setPrescriptions((prev) => [newRx, ...prev]);
    setActiveTab('prescriptions');
  };

  const handleAdvanceOrderStatus = (
    orderId: string,
    nextStatus: OrderStatus
  ) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId ? { ...ord, status: nextStatus } : ord
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-stone-900">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-xs border-b border-stone-200 no-print">
        <div className="max-w-[1320px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#storefront"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('storefront');
            }}
            className="font-serif text-xl font-semibold tracking-tight text-stone-900 whitespace-nowrap shrink-0"
          >
            Veritas Apothecary
          </a>

          {/* Zone 2: 5 clean text navigation links, 1-2 word labels, single-line */}
          <nav
            aria-label="Primary pharmacy navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600"
          >
            {(
              [
                { id: 'storefront', label: 'Storefront' },
                { id: 'pos', label: 'Point of Sale' },
                { id: 'inventory', label: 'Inventory' },
                { id: 'prescriptions', label: 'Prescriptions' },
                { id: 'orders', label: 'Orders & Ledger' },
              ] as const
            ).map((navItem) => (
              <a
                key={navItem.id}
                href={`#${navItem.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(navItem.id);
                }}
                className={`whitespace-nowrap transition-colors py-1 ${
                  activeTab === navItem.id
                    ? 'text-stone-900 font-semibold underline underline-offset-8 decoration-2 decoration-[#0F5338]'
                    : 'hover:text-stone-900 hover:underline underline-offset-8'
                }`}
              >
                {navItem.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: 2 primary actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsUploadRxOpen(true)}
              className="py-2 px-3.5 text-xs font-medium text-stone-800 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors whitespace-nowrap cursor-pointer"
            >
              Upload Rx
            </button>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="py-2 px-4 text-xs font-medium text-white bg-[#0F5338] rounded-lg hover:bg-[#0A3D28] transition-colors whitespace-nowrap font-sans cursor-pointer"
            >
              Dispensing Bag ({totalBagCount})
            </button>
          </div>
        </div>

        {/* Mobile Secondary Horizontal Nav Strip (Only visible on < md screens) */}
        <div className="flex md:hidden items-center gap-5 px-6 py-2 border-t border-stone-200 overflow-x-auto text-xs font-medium text-stone-600 bg-white">
          {(
            [
              { id: 'storefront', label: 'Storefront' },
              { id: 'pos', label: 'Point of Sale' },
              { id: 'inventory', label: 'Inventory' },
              { id: 'prescriptions', label: 'Prescriptions' },
              { id: 'orders', label: 'Orders & Ledger' },
            ] as const
          ).map((navItem) => (
            <button
              key={navItem.id}
              type="button"
              onClick={() => setActiveTab(navItem.id)}
              className={`whitespace-nowrap shrink-0 py-0.5 ${
                activeTab === navItem.id
                  ? 'text-[#0F5338] font-semibold underline underline-offset-4'
                  : 'text-stone-600'
              }`}
            >
              {navItem.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1">
        {activeTab === 'storefront' && (
          <StorefrontView
            products={products}
            onInspectProduct={(prod) => setInspectedProduct(prod)}
            onAddToCart={handleAddToCart}
            onOpenUploadRx={() => setIsUploadRxOpen(true)}
            onSwitchToPOS={() => setActiveTab('pos')}
          />
        )}

        {activeTab === 'pos' && (
          <PointOfSaleView
            products={products}
            prescriptions={prescriptions}
            onCompleteCounterSale={handleCompleteCounterSale}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryLedgerView
            products={products}
            onRestockProduct={handleRestockProduct}
            onAddNewBatchProduct={handleAddNewBatchProduct}
            onInspectProduct={(prod) => setInspectedProduct(prod)}
          />
        )}

        {activeTab === 'prescriptions' && (
          <PrescriptionsQueueView
            prescriptions={prescriptions}
            products={products}
            onUpdateStatus={handleUpdatePrescriptionStatus}
            onLoadRxIntoBag={handleLoadRxIntoBag}
            onOpenUploadRx={() => setIsUploadRxOpen(true)}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersLedgerView
            orders={orders}
            onAdvanceOrderStatus={handleAdvanceOrderStatus}
          />
        )}
      </main>

      {/* Quiet Clinical Footer */}
      <footer className="bg-white border-t border-stone-200 py-8 px-6 text-xs text-stone-500 no-print">
        <div className="max-w-[1320px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-semibold text-stone-800">
              Veritas Apothecary &amp; Clinical Medical Supply
            </p>
            <p>
              State Pharmacy License #DL-NY-2026-8841 · Supervising Pharmacist:
              Dr. Alistair Finch, PharmD, RPh · 24/7 Clinical Helpline: +1 (800)
              555-0199
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('storefront')}
              className="hover:text-stone-900 transition-colors cursor-pointer"
            >
              Formulary Catalog
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveTab('pos')}
              className="hover:text-stone-900 transition-colors cursor-pointer"
            >
              Counter POS
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className="hover:text-stone-900 transition-colors cursor-pointer"
            >
              FEFO Ledger
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
                localStorage.removeItem(STORAGE_KEYS.PRESCRIPTIONS);
                localStorage.removeItem(STORAGE_KEYS.ORDERS);
                localStorage.removeItem(STORAGE_KEYS.CART);
                setProducts(INITIAL_PRODUCTS);
                setPrescriptions(INITIAL_PRESCRIPTIONS);
                setOrders(INITIAL_ORDERS);
                setCartItems([
                  {
                    productId: 'med-01',
                    quantity: 1,
                    packVariant: 'Single Unit',
                  },
                ]);
              }}
              className="text-stone-600 hover:text-stone-900 underline underline-offset-4 cursor-pointer"
            >
              Reset Demo Dispensary Data
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ProductMonographModal
        product={inspectedProduct}
        onClose={() => setInspectedProduct(null)}
        onAddToCart={handleAddToCart}
        cartItems={cartItems}
        allProducts={products}
      />

      <CartCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        products={products}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCompleteStorefrontOrder={handleCompleteStorefrontOrder}
        onViewOrdersLedger={() => setActiveTab('orders')}
      />

      <UploadPrescriptionModal
        isOpen={isUploadRxOpen}
        onClose={() => setIsUploadRxOpen(false)}
        products={products}
        onSubmitPrescription={handleSubmitNewPrescription}
      />
    </div>
  );
}
