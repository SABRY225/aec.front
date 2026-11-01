import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../hooks/useLanguage";
import { toast } from "react-toastify";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  Copy,
  Check,
  Percent,
  Coins,
  Power,
  RefreshCw,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  CreditCard,
  Building,
  ArrowUpRight,
  Filter,
  DollarSign,
  AlertCircle,
  ExternalLink,
  Shield,
  Eye,
  Key
} from "lucide-react";
import { adminAffiliateService } from "../../services/affiliate.service";
const AffiliateManagement = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState("affiliates");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [affiliates, setAffiliates] = useState([]);
  const [affiliatesSearch, setAffiliatesSearch] = useState("");
  const [affiliatesStatusFilter, setAffiliatesStatusFilter] = useState("");
  const [conversions, setConversions] = useState([]);
  const [conversionsLoading, setConversionsLoading] = useState(false);
  const [conversionsSearch, setConversionsSearch] = useState("");
  const [payouts, setPayouts] = useState([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [payoutsStatusFilter, setPayoutsStatusFilter] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);
  const [payoutModal, setPayoutModal] = useState({
    isOpen: false,
    payout: null,
    action: "approve",
    // 'approve' | 'reject'
    adminNotes: "",
    transactionRef: "",
    isSubmitting: false
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    affiliate: null,
    isDeleting: false
  });
  useEffect(() => {
    fetchStats();
    fetchAffiliates();
  }, []);
  useEffect(() => {
    if (activeTab === "conversions") {
      fetchConversions();
    } else if (activeTab === "payouts") {
      fetchPayouts();
    }
  }, [activeTab]);
  const fetchStats = async () => {
    try {
      const res = await adminAffiliateService.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Error fetching affiliate stats:", err);
    }
  };
  const fetchAffiliates = async () => {
    try {
      setLoading(true);
      const res = await adminAffiliateService.getAllAffiliates({
        search: affiliatesSearch,
        status: affiliatesStatusFilter
      });
      if (res.success) {
        setAffiliates(res.data.affiliates || []);
      }
    } catch (err) {
      console.error("Error fetching affiliates:", err);
      toast.error("\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u0645\u064A\u0644 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0633\u0648\u0642\u064A\u0646");
    } finally {
      setLoading(false);
    }
  };
  const fetchConversions = async () => {
    try {
      setConversionsLoading(true);
      const res = await adminAffiliateService.getAllConversions({
        search: conversionsSearch
      });
      if (res.success) {
        setConversions(res.data.conversions || []);
      }
    } catch (err) {
      console.error("Error fetching conversions:", err);
      toast.error("\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u0645\u064A\u0644 \u0633\u062C\u0644 \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A");
    } finally {
      setConversionsLoading(false);
    }
  };
  const fetchPayouts = async () => {
    try {
      setPayoutsLoading(true);
      const res = await adminAffiliateService.getAllPayouts({
        status: payoutsStatusFilter
      });
      if (res.success) {
        setPayouts(res.data.payouts || []);
      }
    } catch (err) {
      console.error("Error fetching payouts:", err);
      toast.error("\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u0645\u064A\u0644 \u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0633\u062D\u0628");
    } finally {
      setPayoutsLoading(false);
    }
  };
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    toast.success("\u062A\u0645 \u0646\u0633\u062E \u0627\u0644\u0643\u0648\u062F \u0644\u0644\u062D\u0627\u0641\u0638\u0629");
    setTimeout(() => setCopiedCode(null), 2e3);
  };
  const handleToggleStatus = async (affiliate) => {
    try {
      const newStatus = affiliate.status === "active" ? "inactive" : "active";
      await adminAffiliateService.updateAffiliate(affiliate._id, { status: newStatus });
      toast.success(newStatus === "active" ? "\u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0633\u0648\u0642" : "\u062A\u0645 \u062A\u0639\u0637\u064A\u0644 \u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0633\u0648\u0642");
      fetchAffiliates();
      fetchStats();
    } catch (err) {
      toast.error("\u0641\u0634\u0644 \u0641\u064A \u062A\u063A\u064A\u064A\u0631 \u062D\u0627\u0644\u0629 \u0627\u0644\u0645\u0633\u0648\u0642");
    }
  };
  const handleDelete = async () => {
    if (!deleteModal.affiliate) return;
    try {
      setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
      await adminAffiliateService.deleteAffiliate(deleteModal.affiliate._id);
      toast.success("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0633\u0648\u0642 \u0628\u0646\u062C\u0627\u062D");
      setDeleteModal({ isOpen: false, affiliate: null, isDeleting: false });
      fetchAffiliates();
      fetchStats();
    } catch (err) {
      toast.error("\u0641\u0634\u0644 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0645\u0633\u0648\u0642");
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };
  const handleProcessPayout = async () => {
    const { payout, action, adminNotes, transactionRef } = payoutModal;
    if (!payout) return;
    try {
      setPayoutModal((prev) => ({ ...prev, isSubmitting: true }));
      await adminAffiliateService.processPayout(payout._id, {
        action,
        adminNotes,
        transactionRef
      });
      toast.success(action === "approve" ? "\u062A\u0645\u062A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0637\u0644\u0628 \u0627\u0644\u0633\u062D\u0628 \u0648\u0627\u0639\u062A\u0645\u0627\u062F\u0647" : "\u062A\u0645 \u0631\u0641\u0636 \u0637\u0644\u0628 \u0627\u0644\u0633\u062D\u0628 \u0648\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0627\u0644\u0631\u0635\u064A\u062F \u0644\u0644\u0645\u0633\u0648\u0642");
      setPayoutModal({
        isOpen: false,
        payout: null,
        action: "approve",
        adminNotes: "",
        transactionRef: "",
        isSubmitting: false
      });
      fetchPayouts();
      fetchStats();
      fetchAffiliates();
    } catch (err) {
      toast.error(err.response?.data?.message || "\u0641\u0634\u0644 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 \u0637\u0644\u0628 \u0627\u0644\u0633\u062D\u0628");
      setPayoutModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-6 pb-12 font-arabic", dir: isRTL ? "rtl" : "ltr" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement("div", { className: "p-2.5 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white shadow-md shadow-primary-500/20" }, /* @__PURE__ */ React.createElement(Coins, { className: "w-6 h-6" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight" }, "\u0646\u0638\u0627\u0645 \u0627\u0644\u062A\u0633\u0648\u064A\u0642 \u0628\u0627\u0644\u0639\u0645\u0648\u0644\u0629 (Affiliate Marketing)"), /* @__PURE__ */ React.createElement("p", { className: "text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5" }, "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0633\u0648\u0642\u064A\u0646\u060C \u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0639\u0645\u0648\u0644\u0627\u062A \u0648\u0627\u0644\u062E\u0635\u0648\u0645\u0627\u062A\u060C \u0648\u0645\u062A\u0627\u0628\u0639\u0629 \u0633\u062C\u0644 \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A \u0648\u0637\u0644\u0628\u0627\u062A \u0633\u062D\u0628 \u0627\u0644\u0623\u0631\u0628\u0627\u062D")))), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => navigate("/admin/affiliates/create"),
      className: "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold shadow-lg shadow-primary-600/25 transition-all duration-200 active:scale-95"
    },
    /* @__PURE__ */ React.createElement(Plus, { className: "w-4 h-4" }),
    /* @__PURE__ */ React.createElement("span", null, "\u0625\u0636\u0627\u0641\u0629 \u0645\u0633\u0648\u0651\u0642 \u062C\u062F\u064A\u062F")
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-semibold text-slate-500 dark:text-slate-400" }, "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0633\u0648\u0642\u064A\u0646"), /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-black text-slate-900 dark:text-white mt-1" }, stats?.totalAffiliates || 0), /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1" }, /* @__PURE__ */ React.createElement(CheckCircle2, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ React.createElement("span", null, stats?.activeAffiliates || 0, " \u0646\u0634\u0637 \u062D\u0627\u0644\u064A\u0627\u064B"))), /* @__PURE__ */ React.createElement("div", { className: "p-3 rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400" }, /* @__PURE__ */ React.createElement(Users, { className: "w-6 h-6" }))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-semibold text-slate-500 dark:text-slate-400" }, "\u0645\u0628\u064A\u0639\u0627\u062A \u062A\u0645 \u062C\u0644\u0628\u0647\u0627"), /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-black text-slate-900 dark:text-white mt-1" }, (stats?.totalSales || 0).toLocaleString(), " ", /* @__PURE__ */ React.createElement("span", { className: "text-sm font-bold text-slate-500" }, "\u0631.\u0633")), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-medium text-slate-400" }, "\u0639\u0628\u0631 ", stats?.totalConversions || 0, " \u0637\u0644\u0628 \u0634\u0631\u0627\u0621")), /* @__PURE__ */ React.createElement("div", { className: "p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400" }, /* @__PURE__ */ React.createElement(TrendingUp, { className: "w-6 h-6" }))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-semibold text-slate-500 dark:text-slate-400" }, "\u0639\u0645\u0648\u0644\u0627\u062A \u0645\u0633\u062A\u062D\u0642\u0629 / \u0645\u062F\u0641\u0648\u0639\u0629"), /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-black text-slate-900 dark:text-white mt-1" }, (stats?.totalCommissions || 0).toLocaleString(), " ", /* @__PURE__ */ React.createElement("span", { className: "text-sm font-bold text-slate-500" }, "\u0631.\u0633")), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-semibold text-indigo-600 dark:text-indigo-400" }, "\u062A\u0645 \u0635\u0631\u0641 ", (stats?.totalPaidOut || 0).toLocaleString(), " \u0631.\u0633")), /* @__PURE__ */ React.createElement("div", { className: "p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400" }, /* @__PURE__ */ React.createElement(DollarSign, { className: "w-6 h-6" }))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-semibold text-slate-500 dark:text-slate-400" }, "\u0633\u062D\u0648\u0628\u0627\u062A \u0645\u0639\u0644\u0642\u0629 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629"), /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-black text-amber-600 dark:text-amber-400 mt-1" }, (stats?.pendingPayoutsAmount || 0).toLocaleString(), " ", /* @__PURE__ */ React.createElement("span", { className: "text-sm font-bold text-slate-500" }, "\u0631.\u0633")), /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400" }, /* @__PURE__ */ React.createElement(Clock, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ React.createElement("span", null, stats?.pendingPayoutsCount || 0, " \u0637\u0644\u0628\u0627\u062A \u0645\u0639\u0644\u0642\u0629"))), /* @__PURE__ */ React.createElement("div", { className: "p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400" }, /* @__PURE__ */ React.createElement(CreditCard, { className: "w-6 h-6" })))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("affiliates"),
      className: `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "affiliates" ? "bg-primary-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`
    },
    /* @__PURE__ */ React.createElement(Users, { className: "w-4 h-4" }),
    /* @__PURE__ */ React.createElement("span", null, "\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0633\u0648\u0642\u064A\u0646"),
    /* @__PURE__ */ React.createElement("span", { className: `text-xs px-2 py-0.5 rounded-full ${activeTab === "affiliates" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"}` }, affiliates.length)
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("conversions"),
      className: `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "conversions" ? "bg-primary-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`
    },
    /* @__PURE__ */ React.createElement(TrendingUp, { className: "w-4 h-4" }),
    /* @__PURE__ */ React.createElement("span", null, "\u0633\u062C\u0644 \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A \u0648\u0627\u0644\u062A\u062D\u0648\u064A\u0644\u0627\u062A"),
    /* @__PURE__ */ React.createElement("span", { className: `text-xs px-2 py-0.5 rounded-full ${activeTab === "conversions" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"}` }, conversions.length)
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("payouts"),
      className: `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all relative ${activeTab === "payouts" ? "bg-primary-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`
    },
    /* @__PURE__ */ React.createElement(CreditCard, { className: "w-4 h-4" }),
    /* @__PURE__ */ React.createElement("span", null, "\u0637\u0644\u0628\u0627\u062A \u0633\u062D\u0628 \u0627\u0644\u0623\u0631\u0628\u0627\u062D"),
    stats?.pendingPayoutsCount > 0 && /* @__PURE__ */ React.createElement("span", { className: "w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping absolute top-2 right-2" }),
    /* @__PURE__ */ React.createElement("span", { className: `text-xs px-2 py-0.5 rounded-full ${activeTab === "payouts" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"}` }, payouts.length)
  )), activeTab === "affiliates" && /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "relative w-full sm:w-80" }, /* @__PURE__ */ React.createElement(Search, { className: "w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "\u0627\u0644\u0628\u062D\u062B \u0628\u0627\u0644\u0627\u0633\u0645\u060C \u0627\u0644\u0643\u0648\u062F\u060C \u0627\u0644\u0625\u064A\u0645\u064A\u0644 \u0623\u0648 \u0627\u0644\u062C\u0648\u0627\u0644...",
      value: affiliatesSearch,
      onChange: (e) => setAffiliatesSearch(e.target.value),
      onKeyDown: (e) => e.key === "Enter" && fetchAffiliates(),
      className: "w-full pr-9 pl-4 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 w-full sm:w-auto" }, /* @__PURE__ */ React.createElement(
    "select",
    {
      value: affiliatesStatusFilter,
      onChange: (e) => {
        setAffiliatesStatusFilter(e.target.value);
      },
      className: "px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0627\u0644\u0627\u062A"),
    /* @__PURE__ */ React.createElement("option", { value: "active" }, "\u0646\u0634\u0637 \u0641\u0642\u0637"),
    /* @__PURE__ */ React.createElement("option", { value: "inactive" }, "\u0645\u0639\u0637\u0644"),
    /* @__PURE__ */ React.createElement("option", { value: "suspended" }, "\u0645\u0648\u0642\u0648\u0641")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: fetchAffiliates,
      className: "p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors",
      title: "\u062A\u062D\u062F\u064A\u062B"
    },
    /* @__PURE__ */ React.createElement(RefreshCw, { className: `w-4 h-4 ${loading ? "animate-spin" : ""}` })
  ))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden" }, loading ? /* @__PURE__ */ React.createElement("div", { className: "p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement(RefreshCw, { className: "w-8 h-8 animate-spin text-primary-600" }), /* @__PURE__ */ React.createElement("p", null, "\u062C\u0627\u0631\u064A \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u0633\u0648\u0642\u064A\u0646...")) : affiliates.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement(Users, { className: "w-12 h-12 text-slate-300 dark:text-slate-600" }), /* @__PURE__ */ React.createElement("p", { className: "text-base font-bold text-slate-700 dark:text-slate-300" }, "\u0644\u0627 \u064A\u0648\u062C\u062F \u0645\u0633\u0648\u0642\u064A\u0646 \u0645\u0633\u062C\u0644\u064A\u0646"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, '\u0627\u0646\u0642\u0631 \u0639\u0644\u0649 "\u0625\u0636\u0627\u0641\u0629 \u0645\u0633\u0648\u0651\u0642 \u062C\u062F\u064A\u062F" \u0644\u0625\u0646\u0634\u0627\u0621 \u0623\u0648\u0644 \u062D\u0633\u0627\u0628 \u0645\u0633\u0648\u0642 \u0628\u0627\u0644\u0639\u0645\u0648\u0644\u0629')) : /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-right text-sm" }, /* @__PURE__ */ React.createElement("thead", { className: "bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "py-3.5 px-4" }, "\u0627\u0644\u0645\u0633\u0648\u0651\u0642"), /* @__PURE__ */ React.createElement("th", { className: "py-3.5 px-4" }, "\u0643\u0648\u062F \u0627\u0644\u062A\u0631\u0648\u064A\u062C"), /* @__PURE__ */ React.createElement("th", { className: "py-3.5 px-4" }, "\u062E\u0635\u0645 \u0627\u0644\u0645\u0634\u062A\u0631\u064A"), /* @__PURE__ */ React.createElement("th", { className: "py-3.5 px-4" }, "\u0639\u0645\u0648\u0644\u0629 \u0627\u0644\u0645\u0633\u0648\u0651\u0642"), /* @__PURE__ */ React.createElement("th", { className: "py-3.5 px-4" }, "\u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A \u0627\u0644\u0645\u062D\u0642\u0642\u0629"), /* @__PURE__ */ React.createElement("th", { className: "py-3.5 px-4" }, "\u0627\u0644\u0623\u0631\u0628\u0627\u062D \u0648\u0627\u0644\u0631\u0635\u064A\u062F"), /* @__PURE__ */ React.createElement("th", { className: "py-3.5 px-4" }, "\u0627\u0644\u062D\u0627\u0644\u0629"), /* @__PURE__ */ React.createElement("th", { className: "py-3.5 px-4 text-center" }, "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-100 dark:divide-slate-700/60" }, affiliates.map((affiliate) => /* @__PURE__ */ React.createElement("tr", { key: affiliate._id, className: "hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors" }, /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-slate-900 dark:text-white" }, affiliate.firstName, " ", affiliate.lastName), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-slate-400 mt-0.5" }, affiliate.email), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-slate-400 font-mono" }, affiliate.phone))), /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4" }, /* @__PURE__ */ React.createElement("div", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 font-mono font-bold text-primary-600 dark:text-primary-400 text-xs" }, /* @__PURE__ */ React.createElement("span", null, affiliate.code), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleCopy(affiliate.code, affiliate._id),
      className: "text-slate-400 hover:text-primary-600 transition-colors",
      title: "\u0646\u0633\u062E \u0627\u0644\u0643\u0648\u062F"
    },
    copiedCode === affiliate._id ? /* @__PURE__ */ React.createElement(Check, { className: "w-3.5 h-3.5 text-emerald-500" }) : /* @__PURE__ */ React.createElement(Copy, { className: "w-3.5 h-3.5" })
  ))), /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4" }, /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/40" }, affiliate.discountType === "percentage" ? `${affiliate.discountValue}%` : `${affiliate.discountValue} \u0631.\u0633`)), /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4" }, /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/40" }, affiliate.commissionType === "percentage" ? `${affiliate.commissionValue}% \u0645\u0646 \u0627\u0644\u0637\u0644\u0628` : `${affiliate.commissionValue} \u0631.\u0633 \u0644\u0643\u0644 \u0637\u0644\u0628`)), /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-slate-900 dark:text-white" }, (affiliate.totalSalesAmount || 0).toLocaleString(), " \u0631.\u0633"), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-slate-400 mt-0.5" }, affiliate.totalSalesCount || 0, " \u0637\u0644\u0628 \u0634\u0631\u0627\u0621"))), /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-emerald-600 dark:text-emerald-400" }, (affiliate.totalEarned || 0).toLocaleString(), " \u0631.\u0633 \u0645\u0643\u062A\u0633\u0628"), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium" }, "\u0627\u0644\u0645\u062A\u0627\u062D: ", /* @__PURE__ */ React.createElement("span", { className: "font-bold text-slate-800 dark:text-slate-200" }, (affiliate.availableBalance || 0).toLocaleString(), " \u0631.\u0633")))), /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4" }, /* @__PURE__ */ React.createElement(
    "span",
    {
      className: `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${affiliate.status === "active" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`
    },
    /* @__PURE__ */ React.createElement("span", { className: `w-1.5 h-1.5 rounded-full ${affiliate.status === "active" ? "bg-emerald-500" : "bg-slate-400"}` }),
    /* @__PURE__ */ React.createElement("span", null, affiliate.status === "active" ? "\u0646\u0634\u0637" : "\u0645\u0639\u0637\u0644")
  )), /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-1.5" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleToggleStatus(affiliate),
      title: affiliate.status === "active" ? "\u062A\u0639\u0637\u064A\u0644 \u0627\u0644\u062D\u0633\u0627\u0628" : "\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u062D\u0633\u0627\u0628",
      className: `p-1.5 rounded-lg border transition-colors ${affiliate.status === "active" ? "border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-amber-600 dark:border-slate-700 dark:hover:bg-slate-700" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950"}`
    },
    /* @__PURE__ */ React.createElement(Power, { className: "w-4 h-4" })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => navigate(`/admin/affiliates/${affiliate._id}/edit`),
      title: "\u062A\u0639\u062F\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u0648\u0651\u0642",
      className: "p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-primary-600 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:text-primary-400 transition-colors"
    },
    /* @__PURE__ */ React.createElement(Pencil, { className: "w-4 h-4" })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setDeleteModal({ isOpen: true, affiliate, isDeleting: false }),
      title: "\u062D\u0630\u0641 \u0627\u0644\u0645\u0633\u0648\u0651\u0642",
      className: "p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors"
    },
    /* @__PURE__ */ React.createElement(Trash2, { className: "w-4 h-4" })
  )))))))))), activeTab === "conversions" && /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "relative w-full sm:w-80" }, /* @__PURE__ */ React.createElement(Search, { className: "w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "\u0627\u0644\u0628\u062D\u062B \u0628\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628 \u0623\u0648 \u0643\u0648\u062F \u0627\u0644\u0623\u0641\u0644\u064A\u064A\u062A...",
      value: conversionsSearch,
      onChange: (e) => setConversionsSearch(e.target.value),
      onKeyDown: (e) => e.key === "Enter" && fetchConversions(),
      className: "w-full pr-9 pl-4 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
    }
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: fetchConversions,
      className: "p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
    },
    /* @__PURE__ */ React.createElement(RefreshCw, { className: `w-4 h-4 ${conversionsLoading ? "animate-spin" : ""}` })
  )), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden" }, conversionsLoading ? /* @__PURE__ */ React.createElement("div", { className: "p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement(RefreshCw, { className: "w-8 h-8 animate-spin text-primary-600" }), /* @__PURE__ */ React.createElement("p", null, "\u062C\u0627\u0631\u064A \u062A\u062D\u0645\u064A\u0644 \u0633\u062C\u0644 \u0627\u0644\u062A\u062D\u0648\u064A\u0644\u0627\u062A...")) : conversions.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement(TrendingUp, { className: "w-12 h-12 text-slate-300 dark:text-slate-600" }), /* @__PURE__ */ React.createElement("p", { className: "text-base font-bold text-slate-700 dark:text-slate-300" }, "\u0644\u0627 \u062A\u0648\u062C\u062F \u0639\u0645\u0644\u064A\u0627\u062A \u0628\u064A\u0639 \u0645\u0633\u062C\u0644\u0629 \u0639\u0628\u0631 \u0627\u0644\u0623\u0641\u0644\u064A\u064A\u062A \u0628\u0639\u062F"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "\u0639\u0646\u062F\u0645\u0627 \u064A\u0642\u0648\u0645 \u0627\u0644\u0637\u0644\u0627\u0628 \u0628\u0634\u0631\u0627\u0621 \u062F\u0648\u0631\u0627\u062A \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0643\u0648\u062F \u0627\u0644\u0645\u0633\u0648\u0642\u060C \u0633\u062A\u0638\u0647\u0631 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0647\u0646\u0627 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B")) : /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-right text-sm" }, /* @__PURE__ */ React.createElement("thead", { className: "bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "py-3.5 px-4" }, "\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628 / \u0627\u0644\u062A\u0627\u0631\u064A\u062E"), /* @__PURE__ */ React.createElement("th", { className: "py-3.5 px-4" }, "\u0627\u0644\u0645\u0633\u0648\u0651\u0642 \u0648\u0627\u0644\u0643\u0648\u062F"), /* @__PURE__ */ React.createElement("th", { className: "py-3.5 px-4" }, "\u0627\u0644\u0637\u0627\u0644\u0628 \u0627\u0644\u0645\u0634\u062A\u0631\u064A"), /* @__PURE__ */ React.createElement("th", { className: "py-3.5 px-4" }, "\u0627\u0644\u062F\u0648\u0631\u0627\u062A"), /* @__PURE__ */ React.createElement("th", { className: "py-3.5 px-4" }, "\u0642\u064A\u0645\u0629 \u0627\u0644\u0637\u0644\u0628"), /* @__PURE__ */ React.createElement("th", { className: "py-3.5 px-4" }, "\u0627\u0644\u062E\u0635\u0645 \u0627\u0644\u0645\u0645\u0646\u0648\u062D"), /* @__PURE__ */ React.createElement("th", { className: "py-3.5 px-4" }, "\u0639\u0645\u0648\u0644\u0629 \u0627\u0644\u0645\u0633\u0648\u0651\u0642"), /* @__PURE__ */ React.createElement("th", { className: "py-3.5 px-4" }, "\u0627\u0644\u062D\u0627\u0644\u0629"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-100 dark:divide-slate-700/60" }, conversions.map((conv) => /* @__PURE__ */ React.createElement("tr", { key: conv._id, className: "hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors" }, /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4" }, /* @__PURE__ */ React.createElement("div", { className: "font-mono font-bold text-slate-900 dark:text-white text-xs" }, "#", conv.orderId), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-400 mt-0.5" }, new Date(conv.createdAt).toLocaleDateString("ar-SA"), " - ", new Date(conv.createdAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }))), /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-slate-900 dark:text-white" }, conv.affiliateId ? `${conv.affiliateId.firstName} ${conv.affiliateId.lastName}` : "\u0645\u0633\u0648\u0642 \u0645\u062D\u0630\u0648\u0641"), /* @__PURE__ */ React.createElement("span", { className: "inline-block mt-0.5 font-mono text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded border border-primary-200/60 dark:border-primary-800/60" }, conv.affiliateCode)), /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4" }, /* @__PURE__ */ React.createElement("div", { className: "font-medium text-slate-800 dark:text-slate-200" }, conv.userId ? `${conv.userId.firstName} ${conv.userId.lastName}` : "\u0645\u0633\u062A\u062E\u062F\u0645"), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-slate-400" }, conv.userId?.email)), /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[200px] truncate" }, conv.courseIds?.map((c) => c.title).join(", ") || "\u062F\u0648\u0631\u0629 \u062A\u062F\u0631\u064A\u0628\u064A\u0629")), /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4 font-bold text-slate-900 dark:text-white" }, (conv.orderAmount || 0).toLocaleString(), " \u0631.\u0633"), /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4 text-xs font-bold text-rose-600 dark:text-rose-400" }, "-", (conv.discountAmount || 0).toLocaleString(), " \u0631.\u0633"), /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4" }, /* @__PURE__ */ React.createElement("span", { className: "font-black text-emerald-600 dark:text-emerald-400 text-sm" }, "+", (conv.commissionAmount || 0).toLocaleString(), " \u0631.\u0633")), /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4" }, /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60" }, /* @__PURE__ */ React.createElement(CheckCircle2, { className: "w-3 h-3" }), /* @__PURE__ */ React.createElement("span", null, "\u0645\u0643\u062A\u0645\u0644 \u0648\u0645\u062D\u062A\u0633\u0628")))))))))), activeTab === "payouts" && /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "select",
    {
      value: payoutsStatusFilter,
      onChange: (e) => setPayoutsStatusFilter(e.target.value),
      className: "px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0627\u0644\u0627\u062A"),
    /* @__PURE__ */ React.createElement("option", { value: "pending" }, "\u0627\u0644\u0645\u0639\u0644\u0642\u0629 \u0641\u0642\u0637 (\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u062A\u062D\u0648\u064A\u0644)"),
    /* @__PURE__ */ React.createElement("option", { value: "approved" }, "\u0627\u0644\u0645\u0643\u062A\u0645\u0644\u0629 \u0648\u0627\u0644\u0645\u062D\u0648\u0644\u0629"),
    /* @__PURE__ */ React.createElement("option", { value: "rejected" }, "\u0627\u0644\u0645\u0631\u0641\u0648\u0636\u0629")
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: fetchPayouts,
      className: "p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
    },
    /* @__PURE__ */ React.createElement(RefreshCw, { className: `w-4 h-4 ${payoutsLoading ? "animate-spin" : ""}` })
  )), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden" }, payoutsLoading ? /* @__PURE__ */ React.createElement("div", { className: "p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement(RefreshCw, { className: "w-8 h-8 animate-spin text-primary-600" }), /* @__PURE__ */ React.createElement("p", null, "\u062C\u0627\u0631\u064A \u062A\u062D\u0645\u064A\u0644 \u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0633\u062D\u0628...")) : payouts.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement(CreditCard, { className: "w-12 h-12 text-slate-300 dark:text-slate-600" }), /* @__PURE__ */ React.createElement("p", { className: "text-base font-bold text-slate-700 dark:text-slate-300" }, "\u0644\u0627 \u062A\u0648\u062C\u062F \u0637\u0644\u0628\u0627\u062A \u0633\u062D\u0628 \u0623\u0631\u0628\u0627\u062D"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "\u0633\u062A\u0638\u0647\u0631 \u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0633\u062D\u0628 \u0627\u0644\u0645\u0631\u0633\u0644\u0629 \u0645\u0646 \u0642\u0628\u0644 \u0627\u0644\u0645\u0633\u0648\u0642\u064A\u0646 \u0647\u0646\u0627 \u0644\u0645\u0631\u0627\u062C\u0639\u062A\u0647\u0627 \u0648\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u062A\u062D\u0648\u064A\u0644")) : /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-right text-sm" }, /* @__PURE__ */ React.createElement("thead", { className: "bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "py-3.5 px-4" }, "\u0627\u0644\u0645\u0633\u0648\u0651\u0642"), /* @__PURE__ */ React.createElement("th", { className: "py-3.5 px-4" }, "\u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0645\u0637\u0644\u0648\u0628"), /* @__PURE__ */ React.createElement("th", { className: "py-3.5 px-4" }, "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0628\u0646\u0643\u064A (IBAN)"), /* @__PURE__ */ React.createElement("th", { className: "py-3.5 px-4" }, "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0637\u0644\u0628"), /* @__PURE__ */ React.createElement("th", { className: "py-3.5 px-4" }, "\u0627\u0644\u062D\u0627\u0644\u0629"), /* @__PURE__ */ React.createElement("th", { className: "py-3.5 px-4 text-center" }, "\u0627\u0644\u0625\u062C\u0631\u0627\u0621"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-100 dark:divide-slate-700/60" }, payouts.map((payout) => /* @__PURE__ */ React.createElement("tr", { key: payout._id, className: "hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors" }, /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-slate-900 dark:text-white" }, payout.affiliateId ? `${payout.affiliateId.firstName} ${payout.affiliateId.lastName}` : "\u0645\u0633\u0648\u0642 \u0645\u062D\u0630\u0648\u0641"), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-slate-400" }, payout.affiliateId?.email), /* @__PURE__ */ React.createElement("span", { className: "font-mono text-[11px] text-primary-600 dark:text-primary-400 font-bold" }, payout.affiliateId?.code)), /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4 font-black text-lg text-slate-900 dark:text-white" }, payout.amount?.toLocaleString(), " ", /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-slate-500" }, "\u0631.\u0633")), /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-0.5 text-xs" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-slate-800 dark:text-slate-200" }, payout.bankDetails?.bankName || "\u0627\u0633\u0645 \u0627\u0644\u0628\u0646\u0643 \u063A\u064A\u0631 \u0645\u062D\u062F\u062F"), /* @__PURE__ */ React.createElement("div", { className: "text-slate-500 dark:text-slate-400" }, "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u0641\u064A\u062F: ", payout.bankDetails?.accountHolderName || "-"), /* @__PURE__ */ React.createElement("div", { className: "font-mono font-bold text-primary-700 dark:text-primary-300 flex items-center gap-1" }, /* @__PURE__ */ React.createElement("span", null, payout.bankDetails?.iban || "-"), payout.bankDetails?.iban && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleCopy(payout.bankDetails.iban, payout._id),
      className: "text-slate-400 hover:text-primary-600",
      title: "\u0646\u0633\u062E \u0627\u0644\u0622\u064A\u0628\u0627\u0646"
    },
    copiedCode === payout._id ? /* @__PURE__ */ React.createElement(Check, { className: "w-3 h-3 text-emerald-500" }) : /* @__PURE__ */ React.createElement(Copy, { className: "w-3 h-3" })
  )))), /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4 text-xs text-slate-500" }, new Date(payout.createdAt).toLocaleDateString("ar-SA")), /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4" }, /* @__PURE__ */ React.createElement(
    "span",
    {
      className: `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${payout.status === "approved" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" : payout.status === "rejected" ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800" : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800"}`
    },
    payout.status === "approved" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(CheckCircle2, { className: "w-3 h-3" }), /* @__PURE__ */ React.createElement("span", null, "\u062A\u0645 \u0627\u0644\u062A\u062D\u0648\u064A\u0644")) : payout.status === "rejected" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(XCircle, { className: "w-3 h-3" }), /* @__PURE__ */ React.createElement("span", null, "\u0645\u0631\u0641\u0648\u0636")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Clock, { className: "w-3 h-3" }), /* @__PURE__ */ React.createElement("span", null, "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u062A\u062D\u0648\u064A\u0644"))
  )), /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4 text-center" }, payout.status === "pending" ? /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setPayoutModal({
        isOpen: true,
        payout,
        action: "approve",
        adminNotes: "",
        transactionRef: "",
        isSubmitting: false
      }),
      className: "px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
    },
    "\u062A\u062D\u0648\u064A\u0644 \u0648\u0627\u0639\u062A\u0645\u0627\u062F"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setPayoutModal({
        isOpen: true,
        payout,
        action: "reject",
        adminNotes: "",
        transactionRef: "",
        isSubmitting: false
      }),
      className: "px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:hover:bg-rose-900 text-xs font-bold transition-colors"
    },
    "\u0631\u0641\u0636"
  )) : /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-400" }, payout.transactionRef ? `\u0645\u0631\u062C\u0639: ${payout.transactionRef}` : "\u062A\u0645\u062A \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629"))))))))), payoutModal.isOpen && payoutModal.payout && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "p-6 space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `p-3 rounded-2xl ${payoutModal.action === "approve" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"}`
    },
    payoutModal.action === "approve" ? /* @__PURE__ */ React.createElement(CheckCircle2, { className: "w-6 h-6" }) : /* @__PURE__ */ React.createElement(XCircle, { className: "w-6 h-6" })
  ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-bold text-slate-900 dark:text-white" }, payoutModal.action === "approve" ? "\u0627\u0639\u062A\u0645\u0627\u062F \u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0623\u0631\u0628\u0627\u062D \u0644\u0644\u0645\u0633\u0648\u0651\u0642" : "\u0631\u0641\u0636 \u0637\u0644\u0628 \u0633\u062D\u0628 \u0627\u0644\u0623\u0631\u0628\u0627\u062D"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "\u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0645\u0637\u0644\u0648\u0628: ", /* @__PURE__ */ React.createElement("span", { className: "font-bold text-slate-900 dark:text-white" }, payoutModal.payout.amount, " \u0631.\u0633")))), payoutModal.action === "approve" ? /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1" }, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-slate-800 dark:text-slate-200" }, "\u0627\u0644\u0628\u0646\u0643: ", payoutModal.payout.bankDetails?.bankName || "-"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-500" }, "\u0627\u0644\u0645\u0633\u062A\u0641\u064A\u062F: ", payoutModal.payout.bankDetails?.accountHolderName || "-"), /* @__PURE__ */ React.createElement("p", { className: "font-mono font-bold text-primary-600" }, payoutModal.payout.bankDetails?.iban || "-")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" }, "\u0631\u0642\u0645 \u0645\u0631\u062C\u0639 \u0627\u0644\u062D\u0648\u0627\u0644\u0629 \u0627\u0644\u0628\u0646\u0643\u064A\u0629 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "\u0645\u062B\u0627\u0644: REF-98432",
      value: payoutModal.transactionRef,
      onChange: (e) => setPayoutModal((p) => ({ ...p, transactionRef: e.target.value })),
      className: "w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" }, "\u0645\u0644\u0627\u062D\u0638\u0629 \u0644\u0644\u0645\u0633\u0648\u0651\u0642 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "\u062A\u0645 \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0628\u0646\u062C\u0627\u062D \u0644\u062D\u0633\u0627\u0628\u0643 \u0627\u0644\u0631\u0627\u062C\u062D\u064A",
      value: payoutModal.adminNotes,
      onChange: (e) => setPayoutModal((p) => ({ ...p, adminNotes: e.target.value })),
      className: "w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
    }
  ))) : /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" }, "\u0633\u0628\u0628 \u0627\u0644\u0631\u0641\u0636 (\u0633\u064A\u062A\u0645 \u0625\u0639\u0627\u062F\u062A\u0647 \u0644\u0631\u0635\u064A\u062F \u0627\u0644\u0645\u0633\u0648\u0651\u0642 \u0627\u0644\u0645\u062A\u0627\u062D) ", /* @__PURE__ */ React.createElement("span", { className: "text-rose-500" }, "*")), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      rows: 3,
      placeholder: "\u0645\u062B\u0627\u0644: \u0631\u0642\u0645 \u0627\u0644\u0622\u064A\u0628\u0627\u0646 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u060C \u064A\u0631\u062C\u0649 \u062A\u062D\u062F\u064A\u062B\u0647 \u0648\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0637\u0644\u0628...",
      value: payoutModal.adminNotes,
      onChange: (e) => setPayoutModal((p) => ({ ...p, adminNotes: e.target.value })),
      className: "w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setPayoutModal({
        isOpen: false,
        payout: null,
        action: "approve",
        adminNotes: "",
        transactionRef: "",
        isSubmitting: false
      }),
      className: "px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
    },
    "\u0625\u0644\u063A\u0627\u0621"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      disabled: payoutModal.isSubmitting,
      onClick: handleProcessPayout,
      className: `px-5 py-2 rounded-xl text-white text-xs font-bold transition-all ${payoutModal.action === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`
    },
    payoutModal.isSubmitting ? "\u062C\u0627\u0631\u064A \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629..." : payoutModal.action === "approve" ? "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062A\u062D\u0648\u064A\u0644" : "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0631\u0641\u0636"
  ))))), deleteModal.isOpen && deleteModal.affiliate && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 text-center space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto" }, /* @__PURE__ */ React.createElement(Trash2, { className: "w-6 h-6" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-base font-bold text-slate-900 dark:text-white" }, "\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u062D\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u0648\u0651\u0642\u061F"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mt-1" }, "\u0633\u064A\u062A\u0645 \u062D\u0630\u0641 \u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0633\u0648\u0651\u0642 (", deleteModal.affiliate.firstName, " ", deleteModal.affiliate.lastName, ") \u0648\u062A\u0639\u0637\u064A\u0644 \u0643\u0648\u062F \u0627\u0644\u062E\u0635\u0645 (", deleteModal.affiliate.code, ")")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-2 pt-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setDeleteModal({ isOpen: false, affiliate: null, isDeleting: false }),
      className: "px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
    },
    "\u0625\u0644\u063A\u0627\u0621"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      disabled: deleteModal.isDeleting,
      onClick: handleDelete,
      className: "px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
    },
    deleteModal.isDeleting ? "\u062C\u0627\u0631\u064A \u0627\u0644\u062D\u0630\u0641..." : "\u0646\u0639\u0645\u060C \u062D\u0630\u0641"
  )))));
};
export default AffiliateManagement;
