import React, { useState, useMemo } from 'react';
import { Search, Plus, X, ArrowUpDown, Download } from 'lucide-react';
import {
  MedicineProduct,
  ProductCategory,
  DrugSchedule,
  StorageCondition,
} from '../types/pharmacy';
import {
  formatCurrency,
  getExpiryStatus,
  getDaysUntilExpiry,
} from '../utils/dateAndCurrency';

interface InventoryLedgerViewProps {
  products: MedicineProduct[];
  onRestockProduct: (productId: string, addedQty: number) => void;
  onAddNewBatchProduct: (newProduct: MedicineProduct) => void;
  onInspectProduct: (product: MedicineProduct) => void;
}

type InventoryFilter =
  | 'all'
  | 'low-stock'
  | 'expiring-soon'
  | 'cold-chain'
  | 'schedule-h';

export const InventoryLedgerView: React.FC<InventoryLedgerViewProps> = ({
  products,
  onRestockProduct,
  onAddNewBatchProduct,
  onInspectProduct,
}) => {
  const [filter, setFilter] = useState<InventoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'expiry' | 'stock' | 'price'>(
    'expiry'
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New batch form states
  const [name, setName] = useState('');
  const [genericSalt, setGenericSalt] = useState('');
  const [category, setCategory] = useState<ProductCategory>(
    'Prescription (Rx)'
  );
  const [schedule, setSchedule] = useState<DrugSchedule>(
    'Schedule H (Rx Required)'
  );
  const [sku, setSku] = useState('VR-RX-492');
  const [ndcCode, setNdcCode] = useState('50211-0492-15');
  const [batchNumber, setBatchNumber] = useState('AZM-2698D');
  const [expiryDate, setExpiryDate] = useState('2027-11-30');
  const [rackLocation, setRackLocation] = useState(
    'Vault R-03 · Antimicrobials'
  );
  const [storageCondition, setStorageCondition] =
    useState<StorageCondition>('Ambient (15°C–25°C)');
  const [packSize, setPackSize] = useState('Strip of 6 Film-Coated Tablets');
  const [manufacturer, setManufacturer] = useState('Pfizer Clinical Labs');
  const [unitCost, setUnitCost] = useState('140.00');
  const [price, setPrice] = useState('210.00');
  const [stock, setStock] = useState('40');
  const [reorderLevel, setReorderLevel] = useState('15');
  const [dosageGuidance, setDosageGuidance] = useState(
    'Take 1 tablet once daily for 3 to 5 days as directed by physician.'
  );

  // Summary metrics
  const totalSkus = products.length;
  const totalValuation = useMemo(
    () =>
      products.reduce((acc, p) => acc + p.stock * p.price, 0),
    [products]
  );
  const lowStockCount = useMemo(
    () => products.filter((p) => p.stock <= p.reorderLevel).length,
    [products]
  );
  const expiringSoonCount = useMemo(
    () =>
      products.filter((p) => getDaysUntilExpiry(p.expiryDate) <= 65).length,
    [products]
  );

  const filteredRows = useMemo(() => {
    return products
      .filter((p) => {
        if (filter === 'low-stock' && p.stock > p.reorderLevel) return false;
        if (
          filter === 'expiring-soon' &&
          getDaysUntilExpiry(p.expiryDate) > 65
        ) {
          return false;
        }
        if (
          filter === 'cold-chain' &&
          p.storageCondition !== 'Cold-Chain (2°C–8°C)'
        ) {
          return false;
        }
        if (filter === 'schedule-h' && p.schedule === 'OTC Direct') {
          return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.genericSalt.toLowerCase().includes(q) ||
            p.batchNumber.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.rackLocation.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortField === 'expiry') {
          return (
            new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
          );
        }
        if (sortField === 'stock') return a.stock - b.stock;
        return b.price - a.price;
      });
  }, [products, filter, searchQuery, sortField]);

  const handleExportCsv = () => {
    const headers = [
      'SKU',
      'Medicine Name',
      'Generic Salt',
      'Schedule',
      'Batch No',
      'Expiry Date',
      'Storage',
      'Rack Location',
      'Stock',
      'Reorder Level',
      'MRP',
    ];
    const rows = filteredRows.map((p) => [
      p.sku,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.genericSalt.replace(/"/g, '""')}"`,
      p.schedule,
      p.batchNumber,
      p.expiryDate,
      p.storageCondition,
      `"${p.rackLocation}"`,
      p.stock,
      p.reorderLevel,
      p.price.toFixed(2),
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'veritas_apothecary_fefo_inventory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !genericSalt.trim() || !batchNumber.trim()) return;

    const newItem: MedicineProduct = {
      id: `med-${Date.now()}`,
      name: name.trim(),
      genericSalt: genericSalt.trim(),
      category,
      schedule,
      sku: sku.trim() || 'VR-GEN-900',
      ndcCode: ndcCode.trim() || '50211-0900-01',
      batchNumber: batchNumber.trim(),
      expiryDate,
      rackLocation: rackLocation.trim() || 'Shelf B-05 · General Dispensary',
      storageCondition,
      packSize: packSize.trim() || 'Standard Clinical Pack',
      manufacturer: manufacturer.trim() || 'Veritas Pharmaceutical Partners',
      unitCost: Math.max(1, parseFloat(unitCost) || 140),
      price: Math.max(1, parseFloat(price) || 210),
      gstRate: 12,
      stock: Math.max(1, parseInt(stock, 10) || 25),
      reorderLevel: Math.max(5, parseInt(reorderLevel, 10) || 10),
      packagingTheme: {
        accentHex: '#0F5338',
        dosageForm: 'Tablet Blister',
        strengthLabel: 'Clinical Batch',
      },
      description: `Clinical formulation of ${genericSalt.trim()} manufactured by ${manufacturer.trim()}.`,
      dosageGuidance: dosageGuidance.trim(),
      contraindications:
        'Verify patient hypersensitivity history prior to dispensing.',
      interactions: [],
    };

    onAddNewBatchProduct(newItem);
    setName('');
    setGenericSalt('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-[1320px] mx-auto px-6 py-8 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>Vault &amp; Cold-Chain Ledger</span>
            <span aria-hidden="true">·</span>
            <span>First-Expiry First-Out (FEFO) Protocol</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">
            Batch Inventory &amp; Expiry Control
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            className="py-2 px-3.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-xs font-medium text-stone-800 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export FEFO CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="py-2 px-4 rounded-lg bg-[#0F5338] hover:bg-[#0A3D28] text-white text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Receive New Batch</span>
          </button>
        </div>
      </div>

      {/* Structured Single-Elevation Stat Grid with Hairline Dividers */}
      <div className="bg-white border border-stone-200 rounded-lg grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-200">
        <div className="p-5 space-y-1">
          <span className="text-xs text-stone-500 block">
            Active Formulary Batches
          </span>
          <span className="font-mono text-2xl font-semibold text-stone-900 tabular-nums">
            {totalSkus} SKUs
          </span>
          <p className="text-[11px] text-stone-500">
            100% NDC &amp; Lot Verified
          </p>
        </div>

        <div className="p-5 space-y-1">
          <span className="text-xs text-stone-500 block">
            Retail Stock Valuation
          </span>
          <span className="font-mono text-2xl font-semibold text-stone-900 tabular-nums">
            {formatCurrency(totalValuation)}
          </span>
          <p className="text-[11px] text-stone-500">
            Across Ambient &amp; Cold Vaults
          </p>
        </div>

        <div className="p-5 space-y-1">
          <span className="text-xs text-stone-500 block">
            Low-Stock Reorder Alerts
          </span>
          <span
            className={`font-mono text-2xl font-semibold tabular-nums ${
              lowStockCount > 0 ? 'text-amber-700' : 'text-[#0F5338]'
            }`}
          >
            {lowStockCount} Batches
          </span>
          <p className="text-[11px] text-stone-500">
            Below minimum safety threshold
          </p>
        </div>

        <div className="p-5 space-y-1">
          <span className="text-xs text-stone-500 block">
            Expiring Within 65 Days
          </span>
          <span
            className={`font-mono text-2xl font-semibold tabular-nums ${
              expiringSoonCount > 0 ? 'text-amber-700' : 'text-[#0F5338]'
            }`}
          >
            {expiringSoonCount} Batches
          </span>
          <p className="text-[11px] text-stone-500">
            Prioritized for FEFO counter dispatch
          </p>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-lg overflow-x-auto">
          {(
            [
              { id: 'all', label: `All Batches (${products.length})` },
              {
                id: 'low-stock',
                label: `Low Stock Reorder (${lowStockCount})`,
              },
              {
                id: 'expiring-soon',
                label: `Expiring Soon <65d (${expiringSoonCount})`,
              },
              { id: 'cold-chain', label: 'Cold-Chain (2°C–8°C)' },
              { id: 'schedule-h', label: 'Schedule H / H1 Rx' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === tab.id
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by batch, molecule, vault, or SKU..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-md focus:outline-none focus:border-[#0F5338]"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setSortField((prev) =>
                prev === 'expiry'
                  ? 'stock'
                  : prev === 'stock'
                  ? 'price'
                  : 'expiry'
              )
            }
            className="py-2 px-3 bg-white border border-stone-300 hover:bg-stone-100 rounded-md text-xs font-medium text-stone-700 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>
              Sort:{' '}
              {sortField === 'expiry'
                ? 'FEFO Expiry'
                : sortField === 'stock'
                ? 'Lowest Stock'
                : 'Unit MRP'}
            </span>
          </button>
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-[#FAF9F6] text-[11px] font-semibold text-stone-500">
                <th className="py-3 px-4">SKU / NDC</th>
                <th className="py-3 px-4">Formulation &amp; Generic Salt</th>
                <th className="py-3 px-3">Batch &amp; Storage Vault</th>
                <th className="py-3 px-3">FEFO Expiry Status</th>
                <th className="py-3 px-3 text-right">Stock / Min</th>
                <th className="py-3 px-3 text-right">Unit MRP</th>
                <th className="py-3 px-4 text-right">Replenish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-xs">
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-stone-500"
                  >
                    No inventory batches match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredRows.map((item) => {
                  const expiry = getExpiryStatus(item.expiryDate);
                  const isLowStock = item.stock <= item.reorderLevel;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-stone-50/90 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono tabular-nums align-top">
                        <p className="font-semibold text-stone-900">
                          {item.sku}
                        </p>
                        <p className="text-[11px] text-stone-500">
                          {item.ndcCode}
                        </p>
                      </td>

                      <td className="py-3 px-4 align-top">
                        <button
                          type="button"
                          onClick={() => onInspectProduct(item)}
                          className="font-semibold text-stone-900 hover:text-[#0F5338] text-left transition-colors cursor-pointer"
                        >
                          {item.name}
                        </button>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {item.genericSalt} · {item.schedule}
                        </p>
                      </td>

                      <td className="py-3 px-3 align-top">
                        <p className="font-mono font-medium text-stone-900 tabular-nums">
                          {item.batchNumber}
                        </p>
                        <p className="text-[11px] text-stone-500">
                          {item.rackLocation} · {item.storageCondition}
                        </p>
                      </td>

                      <td className="py-3 px-3 font-mono tabular-nums align-top">
                        <span
                          className={
                            expiry.tone === 'critical'
                              ? 'text-red-700 font-semibold'
                              : expiry.tone === 'warning'
                              ? 'text-amber-700 font-semibold'
                              : 'text-stone-800'
                          }
                        >
                          {expiry.label}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums align-top">
                        <span
                          className={
                            isLowStock
                              ? 'text-amber-700 font-semibold'
                              : 'text-stone-900 font-medium'
                          }
                        >
                          {item.stock}
                        </span>
                        <span className="text-stone-400">
                          {' '}
                          / {item.reorderLevel}
                        </span>
                        {isLowStock && (
                          <span className="block text-[10px] font-sans text-amber-700">
                            Reorder Needed
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-semibold text-stone-900 tabular-nums align-top">
                        {formatCurrency(item.price)}
                      </td>

                      <td className="py-3 px-4 text-right align-top">
                        <button
                          type="button"
                          onClick={() => onRestockProduct(item.id, 20)}
                          className="py-1.5 px-2.5 rounded border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 font-mono text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer"
                        >
                          +20 Units
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receive New Batch Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/55 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="receive-batch-title"
        >
          <div className="w-full max-w-2xl bg-[#FAF9F6] border border-stone-300 rounded-lg shadow-xl overflow-hidden my-auto">
            <div className="px-6 py-4 bg-white border-b border-stone-200 flex items-center justify-between">
              <div>
                <h2
                  id="receive-batch-title"
                  className="font-serif text-lg font-semibold text-stone-900"
                >
                  Receive New Pharmaceutical Batch into Ledger
                </h2>
                <p className="text-xs text-stone-500">
                  Register manufacturer lot, FEFO expiry date, and storage vault
                  coordinates
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-stone-500 hover:text-stone-900 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateBatch}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Brand / Formulation Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zithromax 500 mg Film-Coated Tablets"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Active Generic Salt Composition *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Azithromycin Dihydrate IP 500 mg"
                    value={genericSalt}
                    onChange={(e) => setGenericSalt(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as ProductCategory)
                    }
                    className="w-full px-2.5 py-2 text-xs bg-white border border-stone-300 rounded"
                  >
                    <option value="Prescription (Rx)">Prescription (Rx)</option>
                    <option value="Diagnostic Devices">
                      Diagnostic Devices
                    </option>
                    <option value="Respiratory & Care">
                      Respiratory &amp; Care
                    </option>
                    <option value="Clinical Supplements">
                      Clinical Supplements
                    </option>
                    <option value="First Aid & Surgical">
                      First Aid &amp; Surgical
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Regulatory Schedule
                  </label>
                  <select
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value as DrugSchedule)}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-stone-300 rounded"
                  >
                    <option value="OTC Direct">OTC Direct</option>
                    <option value="Schedule H (Rx Required)">
                      Schedule H (Rx Required)
                    </option>
                    <option value="Schedule H1 (Strict Registry)">
                      Schedule H1 (Strict Registry)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Storage Requirement
                  </label>
                  <select
                    value={storageCondition}
                    onChange={(e) =>
                      setStorageCondition(e.target.value as StorageCondition)
                    }
                    className="w-full px-2.5 py-2 text-xs bg-white border border-stone-300 rounded"
                  >
                    <option value="Ambient (15°C–25°C)">
                      Ambient (15°C–25°C)
                    </option>
                    <option value="Cold-Chain (2°C–8°C)">
                      Cold-Chain (2°C–8°C)
                    </option>
                    <option value="Dry & Light-Protected">
                      Dry &amp; Light-Protected
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-stone-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    NDC Code
                  </label>
                  <input
                    type="text"
                    value={ndcCode}
                    onChange={(e) => setNdcCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-stone-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-stone-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-stone-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Initial Qty
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-stone-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-stone-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Unit Cost (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-stone-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Retail MRP (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-stone-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Dispensary Vault / Rack Coordinates
                  </label>
                  <input
                    type="text"
                    value={rackLocation}
                    onChange={(e) => setRackLocation(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Manufacturer &amp; Pack Size
                  </label>
                  <input
                    type="text"
                    value={packSize}
                    onChange={(e) => setPackSize(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2 px-4 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-lg bg-[#0F5338] hover:bg-[#0A3D28] text-white text-xs font-medium cursor-pointer"
                >
                  Commit Batch to Vault Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
