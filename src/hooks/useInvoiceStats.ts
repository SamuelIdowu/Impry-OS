import React from "react";
import { PaymentWithClient } from "@/lib/types/payment";

function getPaidAmount(inv: any) {
  return Number(inv.amountPaid) === 0 && inv.status === "paid"
    ? Number(inv.amount)
    : Number(inv.amountPaid);
}

function getValidDate(d: any) {
  return new Date(d || new Date());
}

export function useInvoiceStats(invoices: PaymentWithClient[]) {
  return React.useMemo(() => {
    const outstanding = invoices
      .filter((i) => i.status !== "paid")
      .reduce((acc, curr) => acc + (Number(curr.amount) - Number(curr.amountPaid)), 0);

    const totalPaid = invoices
      .filter((i) => i.status === "paid" || i.status === "partial")
      .reduce((acc, curr) => acc + getPaidAmount(curr), 0);

    const pendingAmount = invoices
      .filter((i) => i.status === "pending")
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const paidInvoices = invoices.filter(
      (i) => i.status === "paid" || i.status === "partial"
    );

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthPaid = paidInvoices
      .filter((i) => {
        const d = getValidDate(i.paidDate || i.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, curr) => acc + getPaidAmount(curr), 0);

    const prevMonthPaid = paidInvoices
      .filter((i) => {
        const d = getValidDate(i.paidDate || i.createdAt);
        return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear;
      })
      .reduce((acc, curr) => acc + getPaidAmount(curr), 0);

    let paidTrend: string;
    let paidDirection: "up" | "down" | "neutral";

    if (prevMonthPaid === 0) {
      paidTrend = currentMonthPaid > 0 ? "+100%" : "0%";
      paidDirection = currentMonthPaid >= prevMonthPaid ? "up" : "down";
    } else {
      const pct = Math.round(((currentMonthPaid - prevMonthPaid) / prevMonthPaid) * 100);
      paidTrend = pct > 0 ? `+${pct}%` : `${pct}%`;
      paidDirection = currentMonthPaid >= prevMonthPaid ? "up" : "down";
    }

    const pendingCount = invoices.filter((i) => i.status === "pending").length;
    const overdueCount = invoices.filter((i) => i.status === "overdue").length;
    const paidCount = invoices.filter((i) => i.status === "paid").length;

    return {
      outstanding,
      totalPaid,
      pendingAmount,
      paidTrend,
      paidDirection,
      pendingCount,
      overdueCount,
      paidCount,
    };
  }, [invoices]);
}
