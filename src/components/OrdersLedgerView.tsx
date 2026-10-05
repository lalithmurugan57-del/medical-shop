import React, { useState, useMemo } from 'react';
import { Search, Printer, Download } from 'lucide-react';
import { DispensingOrder, OrderStatus } from '../types/pharmacy';
import { formatCurrency } from '../utils/dateAndCurrency';

interface OrdersLedgerViewProps {
  orders: DispensingOrder[];
  onAdvanceOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
}

export const OrdersLedgerView: React.FC<OrdersLedgerViewProps> = ({
  orders,
  onAdvanceOrderStatus,
}) => {
  const [channelFilter, setChannelFilter] = useState<
    'all' | 'Walk-In POS Counter' | 'Storefront Home Delivery'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<DispensingOrder | null>(
    orders[0] || null
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (channelFilter !== 'all' && ord.orderType !== channelFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          ord.id.toLowerCase().includes(q) ||
          ord.customerName.toLowerCase().includes(q) ||
          ord.customerPhone.toLowerCase().includes(q) ||
          ord.items.some(
            (i) =>
              i.name.toLowerCase().includes(q) ||
              i.batchNumber.toLowerCase().includes(q)
          )
        );
      }
      return true;
    });
  }, [orders, channelFilter, searchQuery]);

  const totalRevenue = useMemo(
    () => orders.reduce((acc, o) => acc + o.totalAmount, 0),
    [orders]
  );

  const totalTaxCollected = useMemo(
    () => orders.reduce((acc, o) => acc + o.taxAmount, 0),
    [orders]
  );

  const getNextDeliveryStatus = (
    current: OrderStatus
  ): OrderStatus | null => {
    if (current === 'Confirmed') return 'Packed';
    if (current === 'Packed') return 'Dispatched';
    if (current === 'Dispatched') return 'Delivered';
    return null;
  };

  const handleExportLedgerCsv = () => {
    const headers = [
      'Invoice/Order ID',
      'Channel',
      'Date',
      'Patient/Customer',
      'Phone',
      'Payment Method',
      'Status',
      'Subtotal',
      'Tax',
      'Total',
    ];
    const rows = filteredOrders.map((o) => [
      o.id,
      o.orderType,
      o.createdAt,
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      o.paymentMethod,
      o.status,
      o.subtotal.toFixed(2),
      o.taxAmount.toFixed(2),
      o.totalAmount.toFixed(2),
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'veritas_dispensing_ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-[1320px] mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>Audit &amp; Settlement Registry</span>
            <span aria-hidden="true">·</span>
            <span>Counter POS &amp; Cold-Chain Home Dispatch</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">
            Dispensing Orders &amp; Financial Ledger
          </h1>
        </div>

        <button
          type="button"
          onClick={handleExportLedgerCsv}
          className="py-2 px-4 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-xs font-medium text-stone-800 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Ledger CSV</span>
        </button>
      </div>

      {/* Stat Summary Bar */}
      <div className="bg-white border border-stone-200 rounded-lg grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-200">
        <div className="p-5 space-y-1">
          <span className="text-xs text-stone-500 block">
            Completed &amp; Active Invoices
          </span>
          <span className="font-mono text-2xl font-semibold text-stone-900 tabular-nums">
            {orders.length} Records
          </span>
          <p className="text-[11px] text-stone-500">
            POS Counter + Home Delivery
          </p>
        </div>

        <div className="p-5 space-y-1">
          <span className="text-xs text-stone-500 block">
            Gross Dispensing Revenue
          </span>
          <span className="font-mono text-2xl font-semibold text-[#0F5338] tabular-nums">
            {formatCurrency(totalRevenue)}
          </span>
          <p className="text-[11px] text-stone-500">
            Verified across all settlement modes
          </p>
        </div>

        <div className="p-5 space-y-1">
          <span className="text-xs text-stone-500 block">
            Clinical GST &amp; Tax Collected
          </span>
          <span className="font-mono text-2xl font-semibold text-stone-900 tabular-nums">
            {formatCurrency(totalTaxCollected)}
          </span>
          <p className="text-[11px] text-stone-500">
            CGST + SGST compliant invoices
          </p>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-lg overflow-x-auto">
          {(
            [
              { id: 'all', label: 'All Channels' },
              { id: 'Walk-In POS Counter', label: 'Walk-In POS Counter' },
              {
                id: 'Storefront Home Delivery',
                label: 'Storefront Home Delivery (COD/Courier)',
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setChannelFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                channelFilter === tab.id
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice ID, patient name, or batch..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-md focus:outline-none focus:border-[#0F5338]"
          />
        </div>
      </div>

      {/* Master-Detail Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Table (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-[#FAF9F6] text-[11px] font-semibold text-stone-500">
                  <th className="py-3 px-4">Invoice / Order</th>
                  <th className="py-3 px-3">Patient &amp; Channel</th>
                  <th className="py-3 px-3">Fulfillment Status</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-xs">
                {filteredOrders.map((ord) => {
                  const nextStatus = getNextDeliveryStatus(ord.status);
                  const isSelected = selectedOrder?.id === ord.id;

                  return (
                    <tr
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? 'bg-stone-100/90' : 'hover:bg-stone-50'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono tabular-nums">
                        <p className="font-semibold text-stone-900">{ord.id}</p>
                        <p className="text-[11px] text-stone-500">
                          {ord.createdAt}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-stone-900">
                          {ord.customerName}
                        </p>
                        <p className="text-[11px] text-stone-500">
                          {ord.orderType} · {ord.paymentMethod}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-medium ${
                            ord.status === 'Delivered' ||
                            ord.status === 'Dispensed at Counter'
                              ? 'text-[#0F5338]'
                              : 'text-amber-700'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-stone-900 tabular-nums">
                        {formatCurrency(ord.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {nextStatus ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAdvanceOrderStatus(ord.id, nextStatus);
                              setSelectedOrder({
                                ...ord,
                                status: nextStatus,
                              });
                            }}
                            className="py-1 px-2.5 rounded bg-[#0F5338] hover:bg-[#0A3D28] text-white text-[11px] font-medium whitespace-nowrap cursor-pointer"
                          >
                            Mark {nextStatus}
                          </button>
                        ) : (
                          <span className="text-[11px] text-stone-400">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Selected Invoice Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-lg p-6 space-y-4">
          {selectedOrder ? (
            <>
              <div className="flex items-start justify-between border-b border-stone-200 pb-4">
                <div>
                  <span className="text-xs text-stone-500 block">
                    {selectedOrder.orderType}
                  </span>
                  <h2 className="font-serif text-xl font-semibold text-stone-900">
                    Document #{selectedOrder.id}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-1.5 px-3 rounded border border-stone-300 hover:bg-stone-100 text-xs font-medium text-stone-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-b border-stone-200 pb-4">
                <div>
                  <span className="text-stone-500 block">
                    Patient / Customer
                  </span>
                  <span className="font-semibold text-stone-900">
                    {selectedOrder.customerName}
                  </span>
                  <span className="block font-mono text-[11px] text-stone-500">
                    {selectedOrder.customerPhone}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">
                    Destination / Counter
                  </span>
                  <span className="font-medium text-stone-900">
                    {selectedOrder.customerAddress} ({selectedOrder.postalCode})
                  </span>
                </div>
                {selectedOrder.doctorName && (
                  <div className="col-span-2 pt-1">
                    <span className="text-stone-500 block">
                      Attending Physician (Schedule H Registry)
                    </span>
                    <span className="font-medium text-stone-900">
                      {selectedOrder.doctorName} · Reg:{' '}
                      <span className="font-mono">
                        {selectedOrder.doctorRegNo}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2.5 border-b border-stone-200 pb-4">
                <h3 className="text-xs font-semibold text-stone-500">
                  Dispensed Batches ({selectedOrder.items.length})
                </h3>
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-start gap-2 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-stone-900">
                        {item.quantity} × {item.name}
                      </p>
                      <p className="font-mono text-[11px] text-stone-500">
                        Batch {item.batchNumber} · Exp {item.expiryDate} ·{' '}
                        {item.rackLocation}
                      </p>
                    </div>
                    <span className="font-mono font-semibold text-stone-900 tabular-nums">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-stone-600">
                  <span>Formulary Subtotal</span>
                  <span className="tabular-nums">
                    {formatCurrency(selectedOrder.subtotal)}
                  </span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-[#0F5338]">
                    <span>Concession ({selectedOrder.discountTier})</span>
                    <span className="tabular-nums">
                      −{formatCurrency(selectedOrder.discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Clinical GST &amp; Regulatory Tax</span>
                  <span className="tabular-nums">
                    {formatCurrency(selectedOrder.taxAmount)}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-semibold text-stone-900">
                  <span>Total ({selectedOrder.paymentMethod})</span>
                  <span className="tabular-nums">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="py-12 text-center text-xs text-stone-500">
              Select an invoice or order on the left to inspect batch and tax
              details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
