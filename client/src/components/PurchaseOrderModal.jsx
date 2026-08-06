import React from 'react';
import { X, Printer, Truck, AlertTriangle } from 'lucide-react';

const PurchaseOrderModal = ({ ordersData, data, onClose }) => {
  const activeData = ordersData || data;
  if (!activeData) return null;

  const handlePrint = () => {
    window.print();
  };

  const ordersList = activeData.purchase_orders || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 relative border border-blue-100 max-h-[90vh] flex flex-col font-sans">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center space-x-2.5">
              <Truck className="w-7 h-7 text-blue-600" />
              <span>Automated Purchase Orders</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Generated based on inventory stock levels at or below minimum threshold limits.
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PO PDF</span>
          </button>
        </div>

        <div id="printable-invoice" className="space-y-6 overflow-y-auto pr-1 flex-1">
          {ordersList.length === 0 ? (
            <div className="text-center py-16 text-slate-500 bg-blue-50/50 rounded-2xl border border-blue-100/60">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <p className="text-base font-extrabold text-slate-800">No Reorder Items Required</p>
              <p className="text-xs text-slate-500 mt-1">All medicine stock levels for this selection are currently healthy and above minimum thresholds.</p>
            </div>
          ) : (
            ordersList.map((order, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{order.supplier_name}</h3>
                    <p className="text-xs text-slate-500 font-medium">Contact Details: {order.contact}</p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Est. Order Total</span>
                    <p className="text-xl font-black text-blue-700">Rs. {(order.total_estimated_cost || 0).toFixed(2)}</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                        <th className="py-2 px-1">Medicine Name</th>
                        <th className="py-2 text-center">Current Stock</th>
                        <th className="py-2 text-center">Min Threshold</th>
                        <th className="py-2 text-center">Suggested Reorder</th>
                        <th className="py-2 text-right">Est. Unit Price</th>
                        <th className="py-2 text-right px-1">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 font-medium">
                      {order.items.map((item, itemIdx) => (
                        <tr key={itemIdx} className="hover:bg-white/60">
                          <td className="py-2.5 px-1 font-bold text-slate-800">
                            {item.product_name}
                            {item.generic_name && (
                              <span className="block text-[10px] text-slate-400 font-normal">{item.generic_name}</span>
                            )}
                          </td>
                          <td className="py-2.5 text-center text-rose-600 font-extrabold">{item.current_stock}</td>
                          <td className="py-2.5 text-center text-slate-500">{item.minimum_threshold}</td>
                          <td className="py-2.5 text-center font-black text-blue-700 bg-blue-100/70 px-2 rounded-lg">
                            +{item.suggested_reorder_qty}
                          </td>
                          <td className="py-2.5 text-right text-slate-600">Rs. {parseFloat(item.unit_purchase_price || 0).toFixed(2)}</td>
                          <td className="py-2.5 text-right font-black text-slate-900 px-1">Rs. {(item.estimated_subtotal || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderModal;
