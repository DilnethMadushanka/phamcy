import React from 'react';
import { Printer, X, CheckCircle2, Pill } from 'lucide-react';

const InvoiceModal = ({ sale, onClose }) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-emerald-600 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Transaction Completed</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-pharmacy-500 hover:bg-pharmacy-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-pharmacy-500/20 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-invoice" className="bg-white p-4">
          <div className="text-center pb-4 mb-4 border-b border-dashed border-slate-300">
            <div className="flex items-center justify-center space-x-2 text-pharmacy-600 mb-1">
              <Pill className="w-6 h-6" />
              <span className="font-bold text-xl text-slate-800">Campus PharmaCare</span>
            </div>
            <p className="text-xs text-slate-500">Medical Center Building, Campus Drive</p>
            <p className="text-xs text-slate-500">Phone: (555) 019-2834 • License #: PH-2026-992</p>
          </div>

          <div className="flex justify-between text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div>
              <p><span className="font-semibold">Invoice #:</span> #{sale.id ? String(sale.id).padStart(6, '0') : 'N/A'}</p>
              <p><span className="font-semibold">Cashier:</span> {sale.cashier?.name || 'N/A'}</p>
            </div>
            <div className="text-right">
              <p><span className="font-semibold">Date:</span> {new Date(sale.createdAt || Date.now()).toLocaleString()}</p>
              <p><span className="font-semibold">Payment:</span> <span className="uppercase font-bold text-pharmacy-600">{sale.payment_method}</span></p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-xs text-left text-slate-700 border-collapse mb-4">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-medium">
                <th className="py-2">Item</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sale.items && sale.items.map((item, idx) => (
                <tr key={idx} className="py-2">
                  <td className="py-2 font-medium text-slate-800">
                    {item.product?.product_name || `Product #${item.product_id}`}
                    {item.product?.batch_number && (
                      <span className="block text-[10px] text-slate-400">Batch: {item.product.batch_number}</span>
                    )}
                  </td>
                  <td className="py-2 text-center font-semibold">{item.quantity}</td>
                  <td className="py-2 text-right">${parseFloat(item.unit_price).toFixed(2)}</td>
                  <td className="py-2 text-right font-semibold text-slate-900">${parseFloat(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="border-t border-dashed border-slate-300 pt-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${(parseFloat(sale.total_amount) + parseFloat(sale.discount || 0)).toFixed(2)}</span>
            </div>
            {parseFloat(sale.discount) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount Applied</span>
                <span>-${parseFloat(sale.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Paid</span>
              <span className="text-pharmacy-600">${parseFloat(sale.total_amount).toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 mt-6 pt-4 border-t border-slate-100">
            Thank you for visiting Campus PharmaCare! Keep your receipt for returns within 7 days.
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
