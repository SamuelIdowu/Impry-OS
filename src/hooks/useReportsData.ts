import React from "react";
import {
  subDays,
  isAfter,
  format,
  isSameYear,
  startOfYear,
} from "date-fns";
import { Payment } from "@/lib/types/payment";

type DateRange = "7days" | "30days" | "90days" | "year" | "all" | "creation";

export function getStartDate(range: DateRange, userCreatedAt: string) {
  const today = new Date();
  switch (range) {
    case "7days": return subDays(today, 7);
    case "30days": return subDays(today, 30);
    case "90days": return subDays(today, 90);
    case "year": return startOfYear(today);
    case "creation": return new Date(userCreatedAt);
    case "all": return new Date(0);
    default: return subDays(today, 30);
  }
}

function paidAmount(inv: Payment) {
  if (inv.status !== "paid") return 0;
  return Number(inv.amountPaid) === 0 ? Number(inv.amount) : Number(inv.amountPaid);
}

export function useReportsData(
  projects: any[],
  invoices: Payment[],
  userCreatedAt: string,
  dateRange: DateRange
) {
  const startDateLimit = React.useMemo(
    () => getStartDate(dateRange, userCreatedAt),
    [dateRange, userCreatedAt]
  );

  const filteredProjects = React.useMemo(() => {
    return projects.filter((project) => {
      const projectDate = new Date(project.createdAt);
      return isAfter(projectDate, startDateLimit);
    });
  }, [startDateLimit, projects]);

  const stats = React.useMemo(() => {
    const filteredInvoices = invoices.filter((inv) => {
      if (!inv.createdAt) return false;
      return isAfter(new Date(inv.createdAt), startDateLimit);
    });

    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + paidAmount(inv), 0);
    const outstandingAmount = filteredInvoices.reduce(
      (sum, inv) => sum + (inv.status !== "paid" ? Number(inv.amount) - Number(inv.amountPaid) : 0),
      0
    );
    const outstandingClients = new Set(
      filteredInvoices.filter((inv) => inv.status !== "paid").map((inv) => inv.clientId)
    ).size;

    const completedProjects = filteredProjects.filter((p) => p.status === "completed").length;
    const successRate =
      filteredProjects.length > 0
        ? Math.round((completedProjects / filteredProjects.length) * 100)
        : 0;

    return { totalRevenue, outstandingAmount, outstandingClients, successRate };
  }, [startDateLimit, invoices, filteredProjects]);

  const revenueChartData = React.useMemo(() => {
    if (dateRange === "7days") {
      const data: { month: string; revenue: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayStr = format(date, "MMM dd");
        const dayRevenue = invoices
          .filter((inv) => inv.status === "paid")
          .filter((inv) => {
            if (!inv.createdAt) return false;
            const invDate = new Date(inv.createdAt);
            return format(invDate, "MMM dd") === dayStr && isSameYear(invDate, date);
          })
          .reduce((sum, inv) => sum + paidAmount(inv), 0);
        data.push({ month: dayStr, revenue: dayRevenue });
      }
      return data;
    }

    if (dateRange === "30days") {
      const data: { month: string; revenue: number }[] = [];
      const today = new Date();
      for (let weekStart = 29; weekStart >= 0; weekStart -= 7) {
        const endDate = subDays(today, weekStart);
        const startDate = subDays(today, Math.min(weekStart + 6, 29));
        const weekLabel = `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd")}`;
        const weekRevenue = invoices
          .filter((inv) => inv.status === "paid")
          .filter((inv) => {
            if (!inv.createdAt) return false;
            const invDate = new Date(inv.createdAt);
            return isAfter(invDate, subDays(startDate, 1)) && !isAfter(invDate, endDate);
          })
          .reduce((sum, inv) => sum + paidAmount(inv), 0);
        data.push({ month: weekLabel, revenue: weekRevenue });
      }
      return data;
    }

    if (dateRange === "creation" || dateRange === "all") {
      const start =
        dateRange === "creation"
          ? new Date(userCreatedAt)
          : new Date(
              invoices.length > 0
                ? Math.min(...invoices.map((i) => new Date(i.createdAt!).getTime()))
                : Date.now()
            );
      const end = new Date();
      const data: { month: string; revenue: number }[] = [];
      const current = new Date(start);
      current.setDate(1);

      while (current <= end || format(current, "MMM yyyy") === format(end, "MMM yyyy")) {
        const monthStr = format(current, "MMM yyyy");
        const monthRevenue = invoices
          .filter((inv) => inv.status === "paid")
          .filter((inv) => {
            if (!inv.createdAt) return false;
            return format(new Date(inv.createdAt), "MMM yyyy") === monthStr;
          })
          .reduce((sum, inv) => sum + paidAmount(inv), 0);
        data.push({ month: format(current, "MMM ''yy"), revenue: monthRevenue });
        current.setMonth(current.getMonth() + 1);
      }
      return data;
    }

    // Default: "year" or "90days" — monthly for current year
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    return months.map((month) => {
      const monthRevenue = invoices
        .filter((inv) => inv.status === "paid")
        .filter((inv) => {
          if (!inv.createdAt) return false;
          const invDate = new Date(inv.createdAt);
          return format(invDate, "MMM") === month && invDate.getFullYear() === currentYear;
        })
        .reduce((sum, inv) => sum + paidAmount(inv), 0);
      return { month, revenue: monthRevenue };
    });
  }, [dateRange, invoices, userCreatedAt]);

  return { filteredProjects, stats, revenueChartData };
}
