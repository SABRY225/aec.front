import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { 
    Shield, 
    ShieldCheck, 
    ShieldAlert, 
    Plus, 
    Pencil, 
    Trash2, 
    Search, 
    Key, 
    Check, 
    X, 
    Power, 
    RefreshCw, 
    UserCheck, 
    UserX, 
    Users, 
    Mail, 
    Phone, 
    Briefcase, 
    Lock, 
    Unlock, 
    Eye, 
    EyeOff, 
    Sliders,
    Crown,
    Headphones,
    FileText,
    CreditCard,
    BookOpen,
    Megaphone,
    Ticket,
    Settings,
    Activity,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { adminService } from '../../services/new-api';

const PERMISSIONS_LIST = [
    { id: 'dashboard', label: 'لوحة التحكم', labelEn: 'Dashboard', desc: 'الاطلاع على الإحصائيات والتقارير العامة', icon: Activity },
    { id: 'courses', label: 'إدارة الدورات', labelEn: 'Courses', desc: 'إدارة الدورات ومراجعتها وتعديل الأسعار', icon: BookOpen },
    { id: 'enrollments', label: 'التسجيلات والاشتراكات', labelEn: 'Enrollments', desc: 'التسجيل اليدوي وسجلات تسجيل الطلاب', icon: FileText },
    { id: 'payments', label: 'المدفوعات والمالية', labelEn: 'Payments', desc: 'عرض وإدارة المعاملات المالية والفواتير', icon: CreditCard },
    { id: 'students', label: 'بيانات الطلاب', labelEn: 'Students', desc: 'عرض ملفات الطلاب وسجل مشترياتهم', icon: Users },
    { id: 'coupons', label: 'كوبونات الخصم', labelEn: 'Coupons', desc: 'إنشاء وإلغاء كوبونات وقسائم التخفيض', icon: Ticket },
    { id: 'advertisements', label: 'الإعلانات والبانرات', labelEn: 'Ads & Banners', desc: 'إدارة العروض الترويجية والبانرات', icon: Megaphone },
    { id: 'messages', label: 'رسائل التواصل', labelEn: 'Contact Messages', desc: 'متابعة رسائل واستفسارات العملاء والرد عليها', icon: Headphones },
    { id: 'staff', label: 'الموظفين والصلاحيات', labelEn: 'Staff & Roles', desc: 'إضافة وتعديل حسابات المديرين والموظفين', icon: Shield },
    { id: 'settings', label: 'إعدادات النظام', labelEn: 'System Settings', desc: 'النسخ الاحتياطي وسجلات النظام والأمان', icon: Settings },
];

const ROLE_PRESETS = {
    super_admin: {
        id: 'super_admin',
        title: 'مدير عام بالنظام (Super Admin)',
        titleEn: 'Super Admin',
        desc: 'صلاحيات كاملة وغير مقيدة لإدارة كافة جوانب المنصة',
        color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40',
        icon: Crown,
        permissions: PERMISSIONS_LIST.map(p => p.id)
    },
    manager: {
        id: 'manager',
        title: 'مدير تنفيذي (Operations Manager)',
        titleEn: 'Operations Manager',
        desc: 'إدارة الدورات، التسجيلات، الطلاب والرسائل',
        color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40',
        icon: ShieldCheck,
        permissions: ['dashboard', 'courses', 'enrollments', 'students', 'messages']
    },
    finance: {
        id: 'finance',
        title: 'مسؤول مالي (Finance)',
        titleEn: 'Finance Officer',
        desc: 'متابعة المدفوعات، الكوبونات وسجلات الاشتراكات',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40',
        icon: CreditCard,
        permissions: ['dashboard', 'payments', 'coupons', 'enrollments']
    },
    content_manager: {
        id: 'content_manager',
        title: 'مسؤول المحتوى (Content Manager)',
        titleEn: 'Content Manager',
        desc: 'مراجعة الدورات التدريبية وإدارة الإعلانات',
        color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40',
        icon: BookOpen,
        permissions: ['dashboard', 'courses', 'advertisements']
    },
    support: {
        id: 'support',
        title: 'خدمة العملاء والدعم (Customer Support)',
        titleEn: 'Customer Support',
        desc: 'الرد على رسائل التواصل واستفسارات الطلاب',
        color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/40',
        icon: Headphones,
        permissions: ['dashboard', 'messages', 'students']
    },
    custom: {
        id: 'custom',
        title: 'صلاحيات مخصصة (Custom)',
        titleEn: 'Custom Permissions',
        desc: 'تحديد صلاحيات خاصة يدويًا حسب رغبة الإدارة',
        color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800',
        icon: Sliders,
        permissions: ['dashboard']
    }
};

const emptyForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    password: '',
    staffRole: 'manager',
    permissions: ROLE_PRESETS.manager.permissions,
    isActive: true
};

const StaffManagement = () => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { user: currentUser } = useAuth();

    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    // Modals
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Password Reset Modal
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordTargetStaff, setPasswordTargetStaff] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const res = await adminService.getAllStaff();
            if (res?.success) {
                setStaffList(res.staff || []);
            }
        } catch (error) {
            console.error('Error fetching staff list:', error);
            toast.error(t('admin.staff.fetchError', 'فشل في تحميل قائمة الموظفين'));
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        const total = staffList.length;
        const active = staffList.filter(s => s.isActive !== false).length;
        const inactive = total - active;
        const superAdmins = staffList.filter(s => s.staffRole === 'super_admin' || !s.staffRole).length;
        return { total, active, inactive, superAdmins };
    }, [staffList]);

    const filteredStaff = useMemo(() => {
        return staffList.filter(staff => {
            const matchesRole = roleFilter === 'all' || staff.staffRole === roleFilter;
            const q = searchQuery.trim().toLowerCase();
            if (!q) return matchesRole;

            const name = `${staff.firstName || ''} ${staff.lastName || ''}`.toLowerCase();
            const email = (staff.email || '').toLowerCase();
            const phone = (staff.phone || '').toLowerCase();
            const job = (staff.jobTitle || '').toLowerCase();

            return matchesRole && (name.includes(q) || email.includes(q) || phone.includes(q) || job.includes(q));
        });
    }, [staffList, searchQuery, roleFilter]);

    // Handle Form Inputs
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Role Preset Change
    const handleRolePresetSelect = (presetKey) => {
        const preset = ROLE_PRESETS[presetKey];
        setFormData(prev => ({
            ...prev,
            staffRole: presetKey,
            permissions: presetKey === 'custom' ? prev.permissions : preset.permissions
        }));
    };

    // Permission Toggle
    const handlePermissionToggle = (permId) => {
        setFormData(prev => {
            const exists = prev.permissions.includes(permId);
            const updated = exists 
                ? prev.permissions.filter(p => p !== permId)
                : [...prev.permissions, permId];

            return {
                ...prev,
                permissions: updated,
                staffRole: 'custom'
            };
        });
    };

    // Open Create Modal
    const openCreateModal = () => {
        setEditingStaff(null);
        setFormData(emptyForm);
        setShowPassword(false);
        setShowFormModal(true);
    };

    // Open Edit Modal
    const openEditModal = (staff) => {
        setEditingStaff(staff);
        setFormData({
            firstName: staff.firstName || '',
            lastName: staff.lastName || '',
            email: staff.email || '',
            phone: staff.phone || '',
            jobTitle: staff.jobTitle || '',
            password: '',
            staffRole: staff.staffRole || 'manager',
            permissions: staff.permissions || [],
            isActive: staff.isActive !== false
        });
        setShowPassword(false);
        setShowFormModal(true);
    };

    // Save Staff (Create / Update)
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (!editingStaff && (!formData.password || formData.password.length < 6)) {
                toast.error(t('admin.staff.passwordMin', 'كلمة المرور يجب أن لا تقل عن 6 أحرف'));
                setSubmitting(false);
                return;
            }

            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                jobTitle: formData.jobTitle,
                staffRole: formData.staffRole,
                permissions: formData.permissions,
                isActive: formData.isActive
            };

            if (formData.password && formData.password.trim().length >= 6) {
                payload.password = formData.password.trim();
            }

            let res;
            if (editingStaff) {
                res = await adminService.updateStaff(editingStaff._id, payload);
            } else {
                res = await adminService.createStaff(payload);
            }

            if (res?.success) {
                toast.success(res.message || t('admin.staff.savedSuccess', 'تم حفظ بيانات الموظف بنجاح'));
                setShowFormModal(false);
                fetchStaff();
            } else {
                toast.error(res?.message || t('admin.staff.saveFailed', 'فشل في حفظ البيانات'));
            }
        } catch (error) {
            console.error('Error saving staff:', error);
            toast.error(error?.response?.data?.message || t('admin.staff.saveFailed', 'حدث خطأ أثناء الحفظ'));
        } finally {
            setSubmitting(false);
        }
    };

    // Toggle Active Status
    const handleToggleStatus = async (staff) => {
        const currentUserId = currentUser?._id || currentUser?.id;
        if (currentUserId && currentUserId === staff._id) {
            toast.warning(t('admin.staff.cannotSelfToggle', 'لا يمكنك تعطيل حسابك المسجل به حالياً'));
            return;
        }

        try {
            const res = await adminService.toggleStaffStatus(staff._id);
            if (res?.success) {
                toast.success(res.message);
                fetchStaff();
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || t('admin.staff.statusFailed', 'فشل تغيير حالة الموظف'));
        }
    };

    // Delete Staff
    const handleDeleteStaff = async (staff) => {
        const currentUserId = currentUser?._id || currentUser?.id;
        if (currentUserId && currentUserId === staff._id) {
            toast.warning(t('admin.staff.cannotSelfDelete', 'لا يمكنك حذف حسابك الشخصي'));
            return;
        }

        if (!window.confirm(t('admin.staff.confirmDelete', 'هل أنت متأكد من رغبتك في حذف هذا الموظف نهائياً من النظام؟'))) {
            return;
        }

        try {
            const res = await adminService.deleteStaff(staff._id);
            if (res?.success) {
                toast.success(res.message || t('admin.staff.deletedSuccess', 'تم حذف الموظف بنجاح'));
                fetchStaff();
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || t('admin.staff.deleteFailed', 'فشل في حذف الموظف'));
        }
    };

    // Open Password Reset Modal
    const openPasswordModal = (staff) => {
        setPasswordTargetStaff(staff);
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordModal(true);
    };

    // Submit Password Reset
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error(t('admin.staff.passwordMin', 'كلمة المرور يجب أن لا تقل عن 6 أحرف'));
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error(t('admin.staff.passwordMismatch', 'كلمتا المرور غير متطابقتين'));
            return;
        }

        try {
            setChangingPassword(true);
            const res = await adminService.updateStaff(passwordTargetStaff._id, {
                password: newPassword
            });

            if (res?.success) {
                toast.success(t('admin.staff.passwordUpdated', 'تم تغيير كلمة المرور بنجاح'));
                setShowPasswordModal(false);
                setPasswordTargetStaff(null);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || t('admin.staff.passwordFailed', 'فشل تغيير كلمة المرور'));
        } finally {
            setChangingPassword(false);
        }
    };

    const getRoleDetails = (roleKey) => {
        return ROLE_PRESETS[roleKey] || ROLE_PRESETS.custom;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl shadow-sm">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                            {t('admin.staff.title', 'إدارة الموظفين والصلاحيات')}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                            {t('admin.staff.subtitle', 'إدارة حسابات المديرين والموظفين وتعيين الصلاحيات والأدوار بدقة')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 self-stretch sm:self-auto">
                    <button
                        onClick={fetchStaff}
                        disabled={loading}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-sm disabled:opacity-50"
                        title={t('common.refresh', 'تحديث')}
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>

                    <button
                        onClick={openCreateModal}
                        className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all"
                    >
                        <Plus size={18} />
                        <span>{t('admin.staff.addNew', 'إضافة موظف جديد')}</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                        <Users size={22} />
                    </div>
                    <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {t('admin.staff.totalStaff', 'إجمالي الموظفين')}
                        </div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">
                            {stats.total}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                        <UserCheck size={22} />
                    </div>
                    <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {t('admin.staff.activeStaff', 'الحسابات النشطة')}
                        </div>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {stats.active}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                        <UserX size={22} />
                    </div>
                    <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {t('admin.staff.inactiveStaff', 'الحسابات المعطلة')}
                        </div>
                        <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                            {stats.inactive}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                        <Crown size={22} />
                    </div>
                    <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {t('admin.staff.superAdmins', 'المدراء العامون')}
                        </div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                            {stats.superAdmins}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                    <Search 
                        size={18} 
                        className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${isRTL ? 'right-3.5' : 'left-3.5'}`} 
                    />
                    <input
                        type="text"
                        placeholder={t('admin.staff.searchPlaceholder', 'ابحث بالاسم، البريد الإلكتروني، المسمى الوظيفي...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 text-sm transition-all ${
                            isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
                        }`}
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ${isRTL ? 'left-3' : 'right-3'}`}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 text-slate-800 dark:text-white text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
                    >
                        <option value="all">{t('admin.staff.allRoles', 'جميع الأدوار الوظيفية')}</option>
                        <option value="super_admin">{t('admin.staff.roles.super_admin', 'مدير عام (Super Admin)')}</option>
                        <option value="manager">{t('admin.staff.roles.manager', 'مدير تنفيذي (Manager)')}</option>
                        <option value="finance">{t('admin.staff.roles.finance', 'مسؤول مالي (Finance)')}</option>
                        <option value="content_manager">{t('admin.staff.roles.content_manager', 'مسؤول محتوى (Content)')}</option>
                        <option value="support">{t('admin.staff.roles.support', 'دعم فني وخدمة عملاء (Support)')}</option>
                        <option value="custom">{t('admin.staff.roles.custom', 'صلاحيات مخصصة (Custom)')}</option>
                    </select>

                    <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {t('admin.staff.count', 'المجموع:')} <span className="font-bold text-slate-800 dark:text-white">{filteredStaff.length}</span>
                    </div>
                </div>
            </div>

            {/* Staff List Table */}
            <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-start">
                        <thead className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-start">
                                    {t('admin.staff.table.user', 'الموظف / المسؤول')}
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-start">
                                    {t('admin.staff.table.role', 'الدور والصلاحية')}
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-start">
                                    {t('admin.staff.table.permissions', 'نطاق الصلاحيات')}
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-start">
                                    {t('admin.staff.table.status', 'الحالة')}
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                                    {t('admin.staff.table.actions', 'الإجراءات')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <RefreshCw className="animate-spin text-red-600 dark:text-red-400" size={32} />
                                            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                                {t('admin.staff.loading', 'جاري تحميل قائمة الموظفين...')}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 max-w-sm mx-auto">
                                            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-full mb-3">
                                                <Shield size={36} className="opacity-40 text-slate-500" />
                                            </div>
                                            <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-base mb-1">
                                                {t('admin.staff.noStaff', 'لم يتم العثور على أي موظف')}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                                                {searchQuery || roleFilter !== 'all'
                                                    ? t('admin.staff.noMatch', 'لا توجد نتائج مطابقة لخيارات البحث المحددة')
                                                    : t('admin.staff.addFirst', 'ابدأ بإضافة موظفين ومدراء إلى لوحة التحكم')}
                                            </p>
                                            <button
                                                onClick={openCreateModal}
                                                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-colors"
                                            >
                                                {t('admin.staff.addNew', 'إضافة موظف جديد')}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredStaff.map((staff) => {
                                    const roleDetails = getRoleDetails(staff.staffRole);
                                    const RoleIcon = roleDetails.icon;
                                    const isCurrentUser = (currentUser?._id || currentUser?.id) === staff._id;
                                    const initials = `${staff.firstName?.[0] || ''}${staff.lastName?.[0] || ''}`.toUpperCase() || 'U';

                                    return (
                                        <tr key={staff._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors group">
                                            {/* Staff Info */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                                                        {initials}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                            <span className="truncate">{staff.firstName} {staff.lastName}</span>
                                                            {isCurrentUser && (
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                                                                    {t('admin.staff.you', 'أنت')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                            <Mail size={12} className="text-slate-400" />
                                                            <span className="truncate max-w-[200px]">{staff.email}</span>
                                                        </div>
                                                        {staff.jobTitle && (
                                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                                                                <Briefcase size={11} className="text-slate-400" />
                                                                <span>{staff.jobTitle}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role */}
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xl border ${roleDetails.color}`}>
                                                    <RoleIcon size={14} />
                                                    <span>{isRTL ? roleDetails.title.split('(')[0].trim() : roleDetails.titleEn}</span>
                                                </div>
                                            </td>

                                            {/* Permissions Preview */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap items-center gap-1 max-w-xs">
                                                    {staff.staffRole === 'super_admin' ? (
                                                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400">
                                                            {t('admin.staff.allPermissions', 'كافة الصلاحيات (Full Access)')}
                                                        </span>
                                                    ) : staff.permissions && staff.permissions.length > 0 ? (
                                                        <>
                                                            {staff.permissions.slice(0, 3).map(pId => {
                                                                const p = PERMISSIONS_LIST.find(item => item.id === pId);
                                                                return (
                                                                    <span key={pId} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                                        {isRTL ? (p?.label || pId) : (p?.labelEn || pId)}
                                                                    </span>
                                                                );
                                                            })}
                                                            {staff.permissions.length > 3 && (
                                                                <span className="px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                                    +{staff.permissions.length - 3}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">
                                                            {t('admin.staff.noPermissions', 'لا توجد صلاحيات محددة')}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleStatus(staff)}
                                                    disabled={isCurrentUser}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                                                        staff.isActive !== false
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40 hover:bg-emerald-100'
                                                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 hover:bg-slate-200'
                                                    } ${isCurrentUser ? 'cursor-default opacity-80' : ''}`}
                                                    title={isCurrentUser ? t('admin.staff.currentSession', 'حسابك الحالي') : t('admin.staff.toggleStatusHint', 'تبديل التفعيل')}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${staff.isActive !== false ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                                    <span>{staff.isActive !== false ? t('common.active', 'نشط') : t('common.inactive', 'معطل')}</span>
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => openEditModal(staff)}
                                                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                                                        title={t('admin.staff.edit', 'تعديل الصلاحيات والبيانات')}
                                                    >
                                                        <Pencil size={15} />
                                                    </button>

                                                    <button
                                                        onClick={() => openPasswordModal(staff)}
                                                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                                                        title={t('admin.staff.resetPassword', 'تغيير كلمة المرور')}
                                                    >
                                                        <Key size={15} />
                                                    </button>

                                                    {!isCurrentUser && (
                                                        <button
                                                            onClick={() => handleDeleteStaff(staff)}
                                                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                                            title={t('admin.staff.delete', 'حذف الموظف')}
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create / Edit Staff Modal */}
            {showFormModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div 
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        dir={isRTL ? 'rtl' : 'ltr'}
                    >
                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                        <Shield size={20} />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                                        {editingStaff
                                            ? t('admin.staff.editModal', 'تعديل بيانات وصلاحيات الموظف')
                                            : t('admin.staff.addModal', 'إضافة موظف جديد وتعيين صلاحياته')}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setShowFormModal(false)}
                                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleFormSubmit} className="space-y-6 mt-6">
                                {/* Basic Info */}
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                        {t('admin.staff.basicInfo', 'المعلومات الشخصية والحساب')}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                                {t('admin.staff.firstName', 'الاسم الأول')} *
                                            </label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="مثال: أحمد"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                                {t('admin.staff.lastName', 'اسم العائلة')} *
                                            </label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="مثال: المنصوري"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                                {t('admin.staff.email', 'البريد الإلكتروني')} *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="admin@aec.edu.sa"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                                {t('admin.staff.phone', 'رقم الهاتف')}
                                            </label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="05XXXXXXXX"
                                                dir="ltr"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                                {t('admin.staff.jobTitle', 'المسمى الوظيفي')}
                                            </label>
                                            <input
                                                type="text"
                                                name="jobTitle"
                                                value={formData.jobTitle}
                                                onChange={handleInputChange}
                                                placeholder="مثال: مسؤول العمليات الأكاديمية"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
                                            />
                                        </div>

                                        {/* Password on Create */}
                                        {!editingStaff && (
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                                    {t('admin.staff.password', 'كلمة المرور للدخول')} *
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        required
                                                        placeholder="••••••••"
                                                        className={`w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all ${
                                                            isRTL ? 'pl-10 pr-4' : 'pr-10 pl-4'
                                                        }`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 ${
                                                            isRTL ? 'left-3' : 'right-3'
                                                        }`}
                                                    >
                                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Role Presets */}
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                        {t('admin.staff.rolePresets', 'الدور الوظيفي والنمط المعتمد')}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {Object.values(ROLE_PRESETS).map((preset) => {
                                            const PresetIcon = preset.icon;
                                            const isSelected = formData.staffRole === preset.id;
                                            return (
                                                <div
                                                    key={preset.id}
                                                    onClick={() => handleRolePresetSelect(preset.id)}
                                                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                                                        isSelected
                                                            ? 'border-red-500 bg-red-50/40 dark:bg-red-950/20 shadow-sm'
                                                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                                                    }`}
                                                >
                                                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                                        <PresetIcon size={16} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                                                                {isRTL ? preset.title.split('(')[0].trim() : preset.titleEn}
                                                            </span>
                                                            {isSelected && <CheckCircle2 size={16} className="text-red-600 flex-shrink-0" />}
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                                            {preset.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Permissions Matrix */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            {t('admin.staff.permissionsMatrix', 'مصفوفة الصلاحيات التفصيلية')}
                                        </h3>
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            {formData.permissions.length} / {PERMISSIONS_LIST.length}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                                        {PERMISSIONS_LIST.map((perm) => {
                                            const PermIcon = perm.icon;
                                            const isChecked = formData.permissions.includes(perm.id) || formData.staffRole === 'super_admin';
                                            return (
                                                <div
                                                    key={perm.id}
                                                    onClick={() => {
                                                        if (formData.staffRole !== 'super_admin') {
                                                            handlePermissionToggle(perm.id);
                                                        }
                                                    }}
                                                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all select-none ${
                                                        isChecked
                                                            ? 'border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20'
                                                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'
                                                    } ${formData.staffRole === 'super_admin' ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:border-slate-300'}`}
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <PermIcon size={14} className={isChecked ? 'text-red-600 dark:text-red-400' : 'text-slate-400'} />
                                                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                            {isRTL ? perm.label : perm.labelEn}
                                                        </span>
                                                    </div>

                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        readOnly
                                                        className="h-4 w-4 text-red-600 focus:ring-red-500 rounded border-slate-300 pointer-events-none"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Active Toggle */}
                                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-red-600 focus:ring-red-500 rounded border-slate-300"
                                        />
                                        <div>
                                            <span className="text-xs font-semibold text-slate-800 dark:text-white block">
                                                {t('admin.staff.accountActive', 'تفعيل الحساب (الحساب نشط ويستطيع الدخول)')}
                                            </span>
                                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                                {formData.isActive ? t('admin.staff.activeDesc', 'الموظف نشط ويمكنه تسجيل الدخول واستخدام النظام') : t('admin.staff.inactiveDesc', 'الحساب موقوف ولا يمكن تسجيل الدخول به')}
                                            </span>
                                        </div>
                                    </label>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowFormModal(false)}
                                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
                                    >
                                        {t('common.cancel', 'إلغاء')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-lg shadow-red-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <RefreshCw size={14} className="animate-spin" />
                                                <span>{t('common.saving', 'جاري الحفظ...')}</span>
                                            </>
                                        ) : (
                                            <span>{editingStaff ? t('admin.staff.updateStaff', 'تحديث بيانات الموظف') : t('admin.staff.createStaff', 'إضافة الموظف')}</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showPasswordModal && passwordTargetStaff && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div 
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
                        dir={isRTL ? 'rtl' : 'ltr'}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                        <Key size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-slate-800 dark:text-white">
                                            {t('admin.staff.changePassword', 'تغيير كلمة المرور')}
                                        </h2>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {passwordTargetStaff.firstName} {passwordTargetStaff.lastName} ({passwordTargetStaff.email})
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t('admin.staff.newPassword', 'كلمة المرور الجديدة')} *
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                                    />
                                    <span className="text-[11px] text-slate-400 mt-1 block">
                                        {t('admin.staff.passLengthNotice', '6 أحرف على الأقل')}
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t('admin.staff.confirmPassword', 'تأكيد كلمة المرور')} *
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordModal(false)}
                                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
                                    >
                                        {t('common.cancel', 'إلغاء')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={changingPassword}
                                        className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-lg shadow-amber-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
                                    >
                                        {changingPassword ? (
                                            <>
                                                <RefreshCw size={14} className="animate-spin" />
                                                <span>{t('common.saving', 'جاري الحفظ...')}</span>
                                            </>
                                        ) : (
                                            <span>{t('admin.staff.savePassword', 'تحديث كلمة المرور')}</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
