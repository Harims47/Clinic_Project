import React from 'react';
import { Edit2, AlertTriangle } from 'lucide-react';

export const ProductTable = ({ products = [], onEdit, highlightedRowId }) => {
  if (products.length === 0) {
    return (
      <div className="bg-surface p-12 text-center rounded-lg border border-border">
        <p className="text-textSub text-sm font-medium">No product inventory records found.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-dense">
          <thead>
            <tr className="border-b border-border select-none bg-slate-50/80">
              <th className="border-r border-border/55">Trade Name</th>
              <th className="border-r border-border/55">Generic active ingredient</th>
              <th className="border-r border-border/55">Manufacturer</th>
              <th className="border-r border-border/55 text-center">Pack / Unit</th>
              <th className="border-r border-border/55 text-center">Location</th>
              <th className="border-r border-border/55 text-right">MRP</th>
              <th className="border-r border-border/55 text-center">GST %</th>
              <th className="border-r border-border/55 text-center">Stock</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {products.map((product) => {
              const isHighlighted = product.productId === highlightedRowId;
              const isLowStock = product.stockQty <= product.lowStockLevel;
              
              return (
                <tr 
                  key={product.productId} 
                  className={`hover:bg-slate-50/50 transition duration-150 ${
                    isHighlighted ? 'row-flash-success font-semibold' : ''
                  }`}
                >
                  {/* Trade Name */}
                  <td className="border-r border-border/40 font-medium text-textMain">
                    {product.productName}
                  </td>
                  
                  {/* Generic Active Ingredient */}
                  <td className="border-r border-border/40 text-textSub text-xs">
                    {product.genericName}
                  </td>

                  {/* Manufacturer */}
                  <td className="border-r border-border/40 text-textSub text-xs">
                    {product.manufacturer?.mfrName || '-'}
                  </td>

                  {/* Pack / Unit */}
                  <td className="border-r border-border/40 text-center text-textMain text-xs font-mono">
                    {product.pack || '-'}{product.unit ? ` / ${product.unit}` : ''}
                  </td>

                  {/* Location */}
                  <td className="border-r border-border/40 text-center text-textSub text-xs font-mono">
                    {product.packNo || product.boxNo ? (
                      <span>
                        {product.packNo || '-'}{product.boxNo ? ` (Box ${product.boxNo})` : ''}
                      </span>
                    ) : '-'}
                  </td>

                  {/* MRP */}
                  <td className="border-r border-border/40 text-right text-textMain font-mono font-medium">
                    ₹{parseFloat(product.mrp || 0).toFixed(2)}
                  </td>

                  {/* GST */}
                  <td className="border-r border-border/40 text-center text-textSub font-mono">
                    {parseFloat(product.taxPercent || 0)}%
                  </td>

                  {/* Stock Quantity */}
                  <td className={`border-r border-border/40 text-center font-mono font-bold ${
                    isLowStock ? 'text-amber-600 bg-amber-50/30' : 'text-slate-700'
                  }`}>
                    <div className="flex items-center justify-center gap-1">
                      {isLowStock && <AlertTriangle size={12} className="text-amber-500" title="Low stock warning!" />}
                      {product.stockQty || 0}
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit && onEdit(product)}
                        className="p-1.5 text-textSub hover:text-primary rounded hover:bg-slate-100/50 transition min-w-[32px] min-h-[32px] flex items-center justify-center"
                        title="Edit Master File"
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
