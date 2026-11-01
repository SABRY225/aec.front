import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../hooks/useLanguage";
import { toast } from "react-toastify";
import {
  ArrowRight,
  ArrowLeft,
  Coins,
  User,
  Mail,
  Phone,
  Lock,
  Tag,
  Percent,
  Calendar,
  Building,
  CreditCard,
  FileText,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Key,
  Info,
  DollarSign
} from "lucide-react";
import { adminAffiliateService } from "../../services/affiliate.service";
const initialFormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  code: "",
  discountType: "percentage",
  discountValue: 15,
  commissionType: "fixed",
  commissionValue: 50,
  isForever: true,
  expiresAt: "",
  status: "active",
  notes: "",
  bankDetails: {
    bankName: "",
    accountHolderName: "",
    iban: "",
    accountNumber: ""
  }
};
const AffiliateForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const isEdit = Boolean(id);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [simAmount, setSimAmount] = useState(500);
  useEffect(() => {
    if (isEdit) {
      fetchAffiliateDetails();
    }
  }, [id]);
  const fetchAffiliateDetails = async () => {
    try {
      setLoading(true);
      const res = await adminAffiliateService.getAffiliateById(id);
      if (res.success && res.data?.affiliate) {
        const aff = res.data.affiliate;
        setFormData({
          firstName: aff.firstName || "",
          lastName: aff.lastName || "",
          email: aff.email || "",
          password: "",
          phone: aff.phone || "",
          code: aff.code || "",
          discountType: aff.discountType || "percentage",
          discountValue: aff.discountValue ?? "",
          commissionType: aff.commissionType || "fixed",
          commissionValue: aff.commissionValue ?? "",
          isForever: aff.isForever !== false,
          expiresAt: aff.expiresAt ? new Date(aff.expiresAt).toISOString().slice(0, 10) : "",
          status: aff.status || "active",
          notes: aff.notes || "",
          bankDetails: {
            bankName: aff.bankDetails?.bankName || "",
            accountHolderName: aff.bankDetails?.accountHolderName || "",
            iban: aff.bankDetails?.iban || "",
            accountNumber: aff.bankDetails?.accountNumber || ""
          }
        });
      } else {
        toast.error("\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u0648\u0642");
        navigate("/admin/affiliates");
      }
    } catch (err) {
      console.error("Error fetching affiliate:", err);
      toast.error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u0648\u0642");
      navigate("/admin/affiliates");
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("bank_")) {
      const field = name.replace("bank_", "");
      setFormData((prev) => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [field]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };
  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let result = "";
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: result }));
    setShowPassword(true);
    toast.info("\u062A\u0645 \u062A\u0648\u0644\u064A\u062F \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062C\u062F\u064A\u062F\u0629");
  };
  const generateSuggestedCode = () => {
    const namePart = (formData.firstName || "AFF").trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5) || "CODE";
    const randNum = Math.floor(10 + Math.random() * 90);
    setFormData((prev) => ({ ...prev, code: `${namePart}${randNum}` }));
  };
  const simulatedDiscount = formData.discountType === "percentage" ? Math.round(Number(simAmount) * Number(formData.discountValue || 0) / 100 * 100) / 100 : Math.min(Number(simAmount), Number(formData.discountValue || 0));
  const simulatedPaid = Math.max(0, Number(simAmount) - simulatedDiscount);
  const simulatedCommission = formData.commissionType === "percentage" ? Math.round(Number(simAmount) * Number(formData.commissionValue || 0) / 100 * 100) / 100 : Number(formData.commissionValue || 0);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.code.trim()) {
      toast.error("\u064A\u0631\u062C\u0649 \u0645\u0644\u0621 \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0644 \u0627\u0644\u0625\u0644\u0632\u0627\u0645\u064A\u0629");
      return;
    }
    if (!isEdit && !formData.password.trim()) {
      toast.error("\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0644\u0644\u0645\u0633\u0648\u0642");
      return;
    }
    if (formData.discountValue === "" || Number(formData.discountValue) < 0) {
      toast.error("\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0642\u064A\u0645\u0629 \u062E\u0635\u0645 \u0635\u0627\u0644\u062D\u0629 \u0644\u0644\u0645\u0634\u062A\u0631\u064A");
      return;
    }
    if (formData.commissionValue === "" || Number(formData.commissionValue) < 0) {
      toast.error("\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0639\u0645\u0648\u0644\u0629 \u0635\u0627\u0644\u062D\u0629 \u0644\u0644\u0645\u0633\u0648\u0642");
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discountValue: Number(formData.discountValue),
        commissionValue: Number(formData.commissionValue),
        expiresAt: formData.isForever ? null : formData.expiresAt || null
      };
      if (isEdit) {
        if (!payload.password) delete payload.password;
        await adminAffiliateService.updateAffiliate(id, payload);
        toast.success("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u0648\u0651\u0642 \u0628\u0646\u062C\u0627\u062D");
      } else {
        await adminAffiliateService.createAffiliate(payload);
        toast.success("\u062A\u0645\u062A \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0633\u0648\u0651\u0642 \u0627\u0644\u062C\u062F\u064A\u062F \u0628\u0646\u062C\u0627\u062D");
      }
      navigate("/admin/affiliates");
    } catch (err) {
      console.error("Error saving affiliate:", err);
      toast.error(err.response?.data?.message || "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062D\u0641\u0638 \u0627\u0644\u0645\u0633\u0648\u0642");
    } finally {
      setSubmitting(false);
    }
  };
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  if (loading) {
    return /* @__PURE__ */ React.createElement("div", { className: "p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3" }, /* @__PURE__ */ React.createElement(RefreshCw, { className: "w-8 h-8 animate-spin text-primary-600" }), /* @__PURE__ */ React.createElement("p", { className: "text-sm font-bold" }, "\u062C\u0627\u0631\u064A \u062A\u062D\u0645\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u0648\u0651\u0642..."));
  }
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-6 pb-16 font-arabic max-w-5xl mx-auto", dir: isRTL ? "rtl" : "ltr" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => navigate("/admin/affiliates"),
      className: "inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
    },
    /* @__PURE__ */ React.createElement(BackIcon, { className: "w-4 h-4 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" }),
    /* @__PURE__ */ React.createElement("span", null, "\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0633\u0648\u0642\u064A\u0646")
  ), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-semibold text-slate-400" }, "\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 / \u0646\u0638\u0627\u0645 \u0627\u0644\u0623\u0641\u0644\u064A\u064A\u062A / ", isEdit ? "\u062A\u0639\u062F\u064A\u0644 \u0645\u0633\u0648\u0642" : "\u0625\u0636\u0627\u0641\u0629 \u0645\u0633\u0648\u0642")), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3.5" }, /* @__PURE__ */ React.createElement("div", { className: "p-3.5 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/20" }, /* @__PURE__ */ React.createElement(Coins, { className: "w-7 h-7" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight" }, isEdit ? `\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u0633\u0648\u0651\u0642: ${formData.firstName} ${formData.lastName}` : "\u0625\u0636\u0627\u0641\u0629 \u0645\u0633\u0648\u0651\u0642 \u062C\u062F\u064A\u062F (Affiliate Marketer)"), /* @__PURE__ */ React.createElement("p", { className: "text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1" }, isEdit ? "\u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062D\u0633\u0627\u0628\u060C \u0643\u0648\u062F \u0627\u0644\u062A\u0631\u0648\u064A\u062C\u060C \u0646\u0633\u0628 \u0627\u0644\u062E\u0635\u0648\u0645\u0627\u062A \u0648\u0627\u0644\u0639\u0645\u0648\u0644\u0627\u062A \u0627\u0644\u0645\u0643\u062A\u0633\u0628\u0629" : "\u0623\u0646\u0634\u0626 \u062D\u0633\u0627\u0628\u0627\u064B \u0644\u0644\u0645\u0633\u0648\u0642\u060C \u0648\u062D\u062F\u062F \u0643\u0648\u062F \u0627\u0644\u062E\u0635\u0645 \u0627\u0644\u062A\u0631\u0648\u064A\u062C\u064A \u0648\u0642\u064A\u0645\u0629 \u0631\u0628\u062D\u0647 \u0645\u0646 \u0643\u0644 \u0639\u0645\u0644\u064A\u0629 \u0628\u064A\u0639"))), isEdit && /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "font-mono text-sm font-black px-3.5 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800" }, formData.code))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-slate-800 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-700/80" }, /* @__PURE__ */ React.createElement("div", { className: "p-2 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600" }, /* @__PURE__ */ React.createElement(User, { className: "w-5 h-5" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-base font-bold text-slate-900 dark:text-white" }, "1. \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0634\u062E\u0635\u064A\u0629 \u0648\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u0644\u0628\u0648\u0627\u0628\u0629"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "\u0633\u064A\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0645\u0633\u0648\u0642 \u0647\u0630\u0627 \u0627\u0644\u0628\u0631\u064A\u062F \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0644\u0644\u062F\u062E\u0648\u0644 \u0625\u0644\u0649 \u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0645\u0633\u0648\u0642\u064A\u0646 (/affiliate/login)"))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" }, "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0623\u0648\u0644 ", /* @__PURE__ */ React.createElement("span", { className: "text-rose-500" }, "*")), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      name: "firstName",
      required: true,
      value: formData.firstName,
      onChange: handleInputChange,
      placeholder: "\u0645\u062B\u0627\u0644: \u0623\u062D\u0645\u062F",
      className: "w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
    }
  ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" }, "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0623\u062E\u064A\u0631 (\u0627\u0644\u0639\u0627\u0626\u0644\u0629) ", /* @__PURE__ */ React.createElement("span", { className: "text-rose-500" }, "*")), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      name: "lastName",
      required: true,
      value: formData.lastName,
      onChange: handleInputChange,
      placeholder: "\u0645\u062B\u0627\u0644: \u0627\u0644\u063A\u0627\u0645\u062F\u064A",
      className: "w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
    }
  ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" }, "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A (\u0644\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644) ", /* @__PURE__ */ React.createElement("span", { className: "text-rose-500" }, "*")), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(Mail, { className: "w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "email",
      name: "email",
      required: true,
      value: formData.email,
      onChange: handleInputChange,
      placeholder: "affiliate@example.com",
      className: "w-full pr-10 pl-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
    }
  ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" }, "\u0631\u0642\u0645 \u0627\u0644\u062C\u0648\u0627\u0644 / \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628 ", /* @__PURE__ */ React.createElement("span", { className: "text-rose-500" }, "*")), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(Phone, { className: "w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      name: "phone",
      required: true,
      value: formData.phone,
      onChange: handleInputChange,
      placeholder: "05xxxxxxxx",
      className: "w-full pr-10 pl-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
    }
  ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-1.5" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-700 dark:text-slate-300" }, "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 ", isEdit ? "(\u0627\u062A\u0631\u0643\u0647\u0627 \u0641\u0627\u0631\u063A\u0629 \u0625\u0630\u0627 \u0644\u0645 \u062A\u0631\u063A\u0628 \u0628\u0627\u0644\u062A\u063A\u064A\u064A\u0631)" : /* @__PURE__ */ React.createElement("span", { className: "text-rose-500" }, "*")), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: generateRandomPassword,
      className: "inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline"
    },
    /* @__PURE__ */ React.createElement(Key, { className: "w-3 h-3" }),
    /* @__PURE__ */ React.createElement("span", null, "\u062A\u0648\u0644\u064A\u062F \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631")
  )), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(Lock, { className: "w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: showPassword ? "text" : "password",
      name: "password",
      required: !isEdit,
      value: formData.password,
      onChange: handleInputChange,
      placeholder: isEdit ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
      className: "w-full pr-10 pl-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono"
    }
  ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" }, "\u062D\u0627\u0644\u0629 \u0627\u0644\u062D\u0633\u0627\u0628"), /* @__PURE__ */ React.createElement(
    "select",
    {
      name: "status",
      value: formData.status,
      onChange: handleInputChange,
      className: "w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none font-bold"
    },
    /* @__PURE__ */ React.createElement("option", { value: "active" }, "\u0646\u0634\u0637 (Active) - \u0627\u0644\u0643\u0648\u062F \u064A\u0639\u0645\u0644 \u0648\u0627\u0644\u0645\u0633\u0648\u0642 \u064A\u0633\u062A\u0642\u0628\u0644 \u0639\u0645\u0648\u0644\u0627\u062A"),
    /* @__PURE__ */ React.createElement("option", { value: "inactive" }, "\u0645\u0639\u0637\u0644 \u0645\u0624\u0642\u062A\u0627\u064B (Inactive)"),
    /* @__PURE__ */ React.createElement("option", { value: "suspended" }, "\u0645\u0648\u0642\u0648\u0641 (Suspended)")
  )))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-slate-800 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-700/80" }, /* @__PURE__ */ React.createElement("div", { className: "p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600" }, /* @__PURE__ */ React.createElement(Tag, { className: "w-5 h-5" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-base font-bold text-slate-900 dark:text-white" }, "2. \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0643\u0648\u062F\u060C \u062E\u0635\u0645 \u0627\u0644\u0645\u0634\u062A\u0631\u064A\u060C \u0648\u0639\u0645\u0648\u0644\u0629 \u0627\u0644\u0645\u0633\u0648\u0651\u0642"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "\u062D\u062F\u062F \u0627\u0644\u0643\u0648\u062F \u0627\u0644\u062A\u0631\u0648\u064A\u062C\u064A\u060C \u0648\u0646\u0633\u0628\u0629 \u0623\u0648 \u0642\u064A\u0645\u0629 \u0627\u0644\u062E\u0635\u0645 \u0644\u0644\u0637\u0627\u0644\u0628\u060C \u0648\u0642\u064A\u0645\u0629 \u0627\u0644\u0631\u0628\u062D \u0627\u0644\u0645\u0627\u0644\u064A \u0644\u0644\u0645\u0633\u0648\u0642"))), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-1.5" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-700 dark:text-slate-300" }, "\u0643\u0648\u062F \u0627\u0644\u062E\u0635\u0645 \u0627\u0644\u062A\u0631\u0648\u064A\u062C\u064A (Promo Code) ", /* @__PURE__ */ React.createElement("span", { className: "text-rose-500" }, "*")), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: generateSuggestedCode,
      className: "text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline"
    },
    "\u0627\u0642\u062A\u0631\u0627\u062D \u0643\u0648\u062F \u062A\u0644\u0642\u0627\u0626\u064A"
  )), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(Tag, { className: "w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      name: "code",
      required: true,
      value: formData.code,
      onChange: (e) => setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() })),
      placeholder: "\u0645\u062B\u0627\u0644: AHMED20",
      className: "w-full pr-10 pl-4 py-3 rounded-xl text-base font-mono uppercase bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-primary-600 dark:text-primary-400 font-black tracking-wider focus:ring-2 focus:ring-primary-500 focus:outline-none"
    }
  )), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-400 mt-1" }, "\u0647\u0630\u0627 \u0647\u0648 \u0627\u0644\u0643\u0648\u062F \u0627\u0644\u0630\u064A \u064A\u062F\u062E\u0644\u0647 \u0627\u0644\u0637\u0627\u0644\u0628 \u0641\u064A \u0635\u0641\u062D\u0629 \u0627\u0644\u062F\u0641\u0639 (Checkout) \u0644\u064A\u062D\u0635\u0644 \u0639\u0644\u0649 \u0627\u0644\u062E\u0635\u0645")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-sm" }, /* @__PURE__ */ React.createElement(Percent, { className: "w-4 h-4" }), /* @__PURE__ */ React.createElement("span", null, "\u062E\u0635\u0645 \u0627\u0644\u0645\u0634\u062A\u0631\u064A (\u0627\u0644\u0639\u0645\u064A\u0644)")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400" }, "\u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u062A\u064A \u0633\u062A\u064F\u062E\u0635\u0645 \u0645\u0646 \u0625\u062C\u0645\u0627\u0644\u064A \u0641\u0627\u062A\u0648\u0631\u0629 \u0627\u0644\u0637\u0627\u0644\u0628 \u0639\u0646\u062F \u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0643\u0648\u062F"), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
    "select",
    {
      name: "discountType",
      value: formData.discountType,
      onChange: handleInputChange,
      className: "px-3 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
    },
    /* @__PURE__ */ React.createElement("option", { value: "percentage" }, "\u0646\u0633\u0628\u0629 \u0645\u0626\u0648\u064A\u0629 (%)"),
    /* @__PURE__ */ React.createElement("option", { value: "fixed" }, "\u0645\u0628\u0644\u063A \u062B\u0627\u0628\u062A (\u0631.\u0633)")
  ), /* @__PURE__ */ React.createElement("div", { className: "relative flex-1" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      name: "discountValue",
      required: true,
      min: "0",
      value: formData.discountValue,
      onChange: handleInputChange,
      placeholder: formData.discountType === "percentage" ? "\u0645\u062B\u0627\u0644: 15" : "\u0645\u062B\u0627\u0644: 50",
      className: "w-full px-4 py-2.5 rounded-xl text-sm font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400" }, formData.discountType === "percentage" ? "%" : "\u0631.\u0633")))), /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-bold text-sm" }, /* @__PURE__ */ React.createElement(DollarSign, { className: "w-4 h-4" }), /* @__PURE__ */ React.createElement("span", null, "\u0631\u0628\u062D / \u0639\u0645\u0648\u0644\u0629 \u0627\u0644\u0645\u0633\u0648\u0651\u0642 (\u0647\u064A\u0643\u0633\u0628 \u0643\u0627\u0645)")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400" }, "\u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0630\u064A \u0633\u064A\u064F\u0636\u0627\u0641 \u0644\u0631\u0635\u064A\u062F \u0627\u0644\u0645\u0633\u0648\u0651\u0642 \u0639\u0646\u062F \u0625\u062A\u0645\u0627\u0645 \u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u0634\u0631\u0627\u0621 \u0628\u0646\u062C\u0627\u062D"), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
    "select",
    {
      name: "commissionType",
      value: formData.commissionType,
      onChange: handleInputChange,
      className: "px-3 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
    },
    /* @__PURE__ */ React.createElement("option", { value: "fixed" }, "\u0645\u0628\u0644\u063A \u062B\u0627\u0628\u062A \u0628\u0627\u0644\u0631\u064A\u0627\u0644 (\u0631.\u0633)"),
    /* @__PURE__ */ React.createElement("option", { value: "percentage" }, "\u0646\u0633\u0628\u0629 \u0645\u0626\u0648\u064A\u0629 \u0645\u0646 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 (%)")
  ), /* @__PURE__ */ React.createElement("div", { className: "relative flex-1" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      name: "commissionValue",
      required: true,
      min: "0",
      value: formData.commissionValue,
      onChange: handleInputChange,
      placeholder: formData.commissionType === "fixed" ? "\u0645\u062B\u0627\u0644: 50" : "\u0645\u062B\u0627\u0644: 10",
      className: "w-full px-4 py-2.5 rounded-xl text-sm font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400" }, formData.commissionType === "fixed" ? "\u0631.\u0633" : "%"))))), /* @__PURE__ */ React.createElement("div", { className: "p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-indigo-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Info, { className: "w-4 h-4 text-emerald-600 shrink-0" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-slate-900 dark:text-white" }, "\u0645\u062D\u0627\u0643\u0627\u0629 \u0639\u0645\u0644\u064A\u0629 \u0634\u0631\u0627\u0621 \u0644\u062F\u0648\u0631\u0629 \u0628\u0642\u064A\u0645\u0629: "), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      value: simAmount,
      onChange: (e) => setSimAmount(e.target.value),
      className: "w-20 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-700 text-xs font-bold bg-white dark:bg-slate-800 mr-1"
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "font-bold text-slate-800 dark:text-slate-200" }, " \u0631.\u0633"))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4 text-xs font-bold" }, /* @__PURE__ */ React.createElement("span", { className: "text-emerald-700 dark:text-emerald-400" }, "\u062E\u0635\u0645 \u0627\u0644\u0637\u0627\u0644\u0628: ", simulatedDiscount, " \u0631.\u0633 (\u064A\u062F\u0641\u0639 ", simulatedPaid, " \u0631.\u0633)"), /* @__PURE__ */ React.createElement("span", { className: "text-indigo-700 dark:text-indigo-400" }, "\u0631\u0628\u062D \u0627\u0644\u0645\u0633\u0648\u0651\u0642: ", simulatedCommission, " \u0631.\u0633"))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2" }, /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      name: "isForever",
      checked: formData.isForever,
      onChange: handleInputChange,
      className: "w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
    }
  ), /* @__PURE__ */ React.createElement("span", null, "\u0643\u0648\u062F \u0627\u0644\u062E\u0635\u0645 \u0635\u0627\u0644\u062D \u0648\u0645\u0633\u062A\u0645\u0631 \u062F\u0627\u0626\u0645\u0627\u064B (Forever)")), !formData.isForever && /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-500" }, "\u062A\u0627\u0631\u064A\u062E \u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629:"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "date",
      name: "expiresAt",
      required: !formData.isForever,
      value: formData.expiresAt,
      onChange: handleInputChange,
      className: "px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
    }
  ))))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-slate-800 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-700/80" }, /* @__PURE__ */ React.createElement("div", { className: "p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600" }, /* @__PURE__ */ React.createElement(Building, { className: "w-5 h-5" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-base font-bold text-slate-900 dark:text-white" }, "3. \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0628\u0646\u0643\u064A \u0644\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0623\u0631\u0628\u0627\u062D (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "\u064A\u0645\u0643\u0646 \u0644\u0644\u0645\u0633\u0648\u0642 \u0625\u0636\u0627\u0641\u062A\u0647\u0627 \u0644\u0627\u062D\u0642\u0627\u064B \u0645\u0646 \u0628\u0648\u0627\u0628\u062A\u0647 \u0627\u0644\u062E\u0627\u0635\u0629 \u0639\u0646\u062F \u062A\u0642\u062F\u064A\u0645 \u0637\u0644\u0628 \u0633\u062D\u0628 \u0627\u0644\u0623\u0631\u0628\u0627\u062D"))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" }, "\u0627\u0633\u0645 \u0627\u0644\u0628\u0646\u0643"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      name: "bank_bankName",
      value: formData.bankDetails.bankName,
      onChange: handleInputChange,
      placeholder: "\u0645\u062B\u0627\u0644: \u0645\u0635\u0631\u0641 \u0627\u0644\u0631\u0627\u062C\u062D\u064A / \u0627\u0644\u0628\u0646\u0643 \u0627\u0644\u0623\u0647\u0644\u064A",
      className: "w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" }, "\u0627\u0633\u0645 \u0635\u0627\u062D\u0628 \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0628\u0646\u0643\u064A (\u0627\u0644\u0645\u0633\u062A\u0641\u064A\u062F)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      name: "bank_accountHolderName",
      value: formData.bankDetails.accountHolderName,
      onChange: handleInputChange,
      placeholder: "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0645\u0637\u0627\u0628\u0642 \u0644\u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u062D\u0633\u0627\u0628",
      className: "w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "sm:col-span-2" }, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" }, "\u0631\u0642\u0645 \u0627\u0644\u0622\u064A\u0628\u0627\u0646 \u0627\u0644\u062F\u0648\u0644\u064A (IBAN)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      name: "bank_iban",
      value: formData.bankDetails.iban,
      onChange: (e) => setFormData((p) => ({
        ...p,
        bankDetails: { ...p.bankDetails, iban: e.target.value.toUpperCase() }
      })),
      placeholder: "SA0000000000000000000000",
      className: "w-full px-4 py-2.5 rounded-xl text-sm font-mono uppercase bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-slate-800 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-700/80" }, /* @__PURE__ */ React.createElement("div", { className: "p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300" }, /* @__PURE__ */ React.createElement(FileText, { className: "w-5 h-5" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-base font-bold text-slate-900 dark:text-white" }, "4. \u0645\u0644\u0627\u062D\u0638\u0627\u062A \u062F\u0627\u062E\u0644\u064A\u0629 \u0644\u0644\u0625\u062F\u0627\u0631\u0629 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0645\u0631\u062C\u0639\u064A\u0629 \u062E\u0627\u0635\u0629 \u0628\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0646\u0635\u0629 \u0644\u0627 \u062A\u0638\u0647\u0631 \u0644\u0644\u0645\u0633\u0648\u0642"))), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      rows: 3,
      name: "notes",
      value: formData.notes,
      onChange: handleInputChange,
      placeholder: "\u0645\u062B\u0627\u0644: \u062A\u0645 \u0627\u0644\u0627\u062A\u0641\u0627\u0642 \u0645\u0639\u0647 \u0639\u0644\u0649 \u0627\u0644\u062A\u0631\u0648\u064A\u062C \u0644\u062F\u0648\u0631\u0627\u062A \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629 \u0648\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0639\u0628\u0631 \u062D\u0633\u0627\u0628\u0647 \u0641\u064A \u062A\u0648\u064A\u062A\u0631...",
      className: "w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-end gap-3 pt-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => navigate("/admin/affiliates"),
      className: "px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
    },
    "\u0625\u0644\u063A\u0627\u0621 \u0648\u0627\u0644\u0639\u0648\u062F\u0629"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      disabled: submitting,
      className: "px-8 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold shadow-lg shadow-primary-600/25 transition-all active:scale-95 disabled:opacity-50"
    },
    submitting ? "\u062C\u0627\u0631\u064A \u0627\u0644\u062D\u0641\u0638..." : isEdit ? "\u062D\u0641\u0638 \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A" : "\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0633\u0648\u0651\u0642 \u0648\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0643\u0648\u062F"
  ))));
};
export default AffiliateForm;
