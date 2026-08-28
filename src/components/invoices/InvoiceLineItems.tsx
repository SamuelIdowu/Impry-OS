"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/types/payment";

interface LineItem {
  description: string;
  quantity: number | string;
  rate: number | string;
  amount: number;
  details: string;
}

interface InvoiceLineItemsProps {
  items: LineItem[];
  currency: string;
  onChange: (items: LineItem[]) => void;
}

export function InvoiceLineItems({ items, currency, onChange }: InvoiceLineItemsProps) {
  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    if (field === "quantity" || field === "rate") {
      const qty = parseFloat(field === "quantity" ? value : item.quantity) || 0;
      const rate = parseFloat(field === "rate" ? value : item.rate) || 0;
      item.amount = qty * rate;
    }

    newItems[index] = item;
    onChange(newItems);
  };

  const addItem = () => {
    onChange([...items, { description: "", quantity: 1, rate: 0, amount: 0, details: "" }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Line Items</h2>
        <span className="text-xs text-zinc-400 font-medium">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-4">
        <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-semibold text-zinc-500 uppercase px-2">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Item</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-2 text-right">Rate</div>
          <div className="col-span-2 text-right">Total</div>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start p-2 hover:bg-zinc-50 rounded-lg group transition-colors border border-transparent hover:border-zinc-100"
            >
              <div className="col-span-1 flex items-center justify-center">
                <span className="text-xs font-bold text-zinc-300 group-hover:text-zinc-500 transition-colors">
                  {index + 1}
                </span>
              </div>
              <div className="col-span-5 space-y-2">
                <Input
                  placeholder="Item name"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, "description", e.target.value)}
                />
                <Input
                  className="text-xs text-zinc-500 h-8"
                  placeholder="Description (optional)"
                  value={item.details}
                  onChange={(e) => handleItemChange(index, "details", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  className="text-right"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  className="text-right"
                  value={item.rate}
                  onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <div className="flex-1 text-right font-medium py-2">
                  {formatCurrency(item.amount, currency)}
                </div>
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(index)}
                    className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addItem}
          className="w-full mt-4 py-3 border-2 border-dashed border-zinc-200 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Line Item
        </button>
      </div>
    </div>
  );
}
