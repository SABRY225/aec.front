import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
  Award,
  Coins,
  Gift,
  Share2,
  Copy,
  Check,
  TrendingUp,
  History,
  Sparkles,
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  CheckCircle2,
  CreditCard,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { userRewardsService } from '../../services/rewards.service';

const InstructorRewards = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [rewardsData, setRewardsData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchRewards();
    fetchTransactions();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const res = await userRewardsService.getMyRewards();
      if (res?.data) {
        setRewardsData(res.data);
      }
    } catch (err) {
      console.error('Error fetching instructor rewards:', err);
      toast.error('فشل تحميل بيانات نقاط المكافأة');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setTxLoading(true);
    try {
      const res = await userRewardsService.getMyTransactions(1, 20);
      if (res?.data) {
        setTransactions(res.data.transactions || []);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setTxLoading(false);
    }
  };

  const referralCode = rewardsData?.referralCode || '';
  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/register?ref=${referralCode}`
    : `https://aectraining.com.sa/register?ref=${referralCode}`;

  const handleCopyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    toast.success('تم نسخ كود الإحالة بنجاح!');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast.success('تم نسخ رابط الدعوة بنجاح!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `انضم إلي كمدرب أو متدرب في أكاديمية إيس (AEC) واستفد من أحدث الدورات التدريبية المعتمدة ونقاط المكافآت 🎓✨:\n${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(
      `انضم لمنصة أكاديمية إيس (AEC) للتعليم والتدريب المعتمد 🎓✨:\n${referralLink}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const currentPoints = rewardsData?.rewardPoints || 0;
  const rules = rewardsData?.rules || {};

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-amber-400 text-white rounded-xl shadow-md shadow-amber-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                برنامج مكافآت ونقاط المحاضرين
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                اكسب نقاط ولاء مع كل دورة جديدة تنشرها، وكل طالب جديد ينضم إلى دوراتك
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            fetchRewards();
            fetchTransactions();
          }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 transition shadow-sm w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث الرصيد
        </button>
      </div>

      {/* Hero Cards: Balance & Referral */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Balance Card (5 cols) */}
        <div className="lg:col-span-5 relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-indigo-800 to-slate-900 text-white p-7 shadow-xl shadow-purple-900/20 flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-purple-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                رصيد مكافآت المحاضر
              </span>
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>

            <div className="mt-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tight font-mono text-white">
                  {loading ? '...' : currentPoints.toLocaleString()}
                </span>
                <span className="text-xl font-bold text-purple-200">نقطة</span>
              </div>
              <div className="mt-2 text-base font-semibold text-purple-200 flex items-center gap-2">
                <span>القيمة النقدية التقديرية:</span>
                <span className="text-amber-300 text-lg font-bold font-mono">
                  {loading ? '...' : `${(rewardsData?.sarValue || 0).toFixed(2)} ر.س`}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/15">
            <div className="flex items-center justify-between text-xs text-purple-200 mb-1">
              <span>برنامج التميز والتحفيز الأكاديمي</span>
              <span className="font-bold text-amber-300">AEC Rewards</span>
            </div>
            <p className="text-xs text-purple-200/80 leading-relaxed mt-1">
              تُمنح هذه النقاط تقديراً لجهودك التدريبية واستقطاب الطلاب والمحاضرين، ويمكنك استخدامها في ميزات ترويجية خاصة لدوراتك.
            </p>
          </div>
        </div>

        {/* Instructor Referral Card (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    كود الإحالة والترويج الخاص بك
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ادعُ زملاءك المحاضرين وشجع المتدربين على التسجيل
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                كود المحاضر المعتمد
              </span>
            </div>

            {/* Code Box */}
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  كود الإحالة:
                </span>
                <span className="text-2xl font-black font-mono tracking-widest text-purple-600 dark:text-purple-400">
                  {referralCode || 'جاري التوليد...'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copiedCode ? 'تم النسخ' : 'نسخ الكود'}
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm transition"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {copiedLink ? 'تم نسخ الرابط' : 'نسخ رابط الإحالة'}
                </button>
              </div>
            </div>

            {/* Referral Perks Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                  دعوة محاضر زميل
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  +{rules.peerInstructorReferral?.points || 150} نقطة
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  عند تسجيل زميلك واعتماد ملفه بالمنصة
                </p>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  تسويق دورة أخرى
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  +{rules.crossCourseReferral?.points || 40} نقطة
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  عند شراء طالب دورة أخرى عبر كودك
                </p>
              </div>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              مشاركة سريعة:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={shareOnWhatsApp}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition"
              >
                واتساب
              </button>
              <button
                onClick={shareOnTwitter}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
              >
                تويتر / X
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* How Instructors Earn Points Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            فرص كسب النقاط للمحاضرين
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Publish Course */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              اعتماد ونشر دورة جديدة
            </h3>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
              +{rules.coursePublished?.points || 100} نقطة
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              تمنح فور موافقة الإدارة على نشر واعتماد دورتك التدريبية الجديدة.
            </p>
          </div>

          {/* Card 2: Student Enrolled */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mb-3">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              تسجيل طالب في دورتك
            </h3>
            <div className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1">
              +{rules.studentEnrolled?.points || 15} نقطة / طالب
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              نقاط إضافية تلقائية لكل طالب جديد يشترك في إحدى دوراتك.
            </p>
          </div>

          {/* Card 3: Peer Instructor Referral */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center mb-3">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              دعوة محاضر زميل
            </h3>
            <div className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1">
              +{rules.peerInstructorReferral?.points || 150} نقطة
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              عند انضمام محاضر زميل معتمد للمنصة عبر كود الإحالة الخاص بك.
            </p>
          </div>

          {/* Card 4: Cross-course Referral */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              تسويق دورة أخرى
            </h3>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
              +{rules.crossCourseReferral?.points || 40} نقطة
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              اكسب نقاطاً عندما يشترك طالب في أي دورة تدريبية عبر كودك.
            </p>
          </div>
        </div>
      </div>

      {/* Transactions History */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              سجل حركات ونقاط المحاضر
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            أحدث 20 حركة مسجلة
          </span>
        </div>

        {txLoading ? (
          <div className="text-center py-12 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-500" />
            جارٍ تحميل سجل الحركات...
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Award className="w-10 h-10 mx-auto mb-3 opacity-30 text-purple-500" />
            <p className="font-medium text-slate-600 dark:text-slate-300">
              لا توجد حركات نقاط مسجلة حتى الآن
            </p>
            <p className="text-xs text-slate-400 mt-1">
              قم بنشر دورات جديدة أو مشاركة كودك مع زملائك لبدء تجميع النقاط!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.map((tx) => {
              const isCredit = tx.type === 'credit';
              return (
                <div
                  key={tx._id}
                  className="py-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 rounded-xl px-2 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                        {tx.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {tx.description}
                      </p>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 inline-block">
                        {new Date(tx.createdAt).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-left rtl:text-right shrink-0">
                    <span
                      className={`text-base font-bold font-mono ${
                        isCredit
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isCredit ? '+' : ''}
                      {tx.points} نقطة
                    </span>
                    <div className="text-xs text-slate-400 mt-0.5">
                      الرصيد: {tx.balanceAfter} نقطة
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorRewards;
