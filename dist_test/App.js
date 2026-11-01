import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import ReactGA from "react-ga4";
import { ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { CategoryLookupProvider } from "./context/CategoryLookupContext";
import "./i18n";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Navigation from "./components/Navigation";
import Cart from "./components/Cart";
import "./services/new-api";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import BecomeATutor from "./pages/BecomeATutor";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Categories from "./pages/Categories";
import Category from "./pages/Category";
import Subcategory from "./pages/Subcategory";
import StudentLayout from "./pages/student/StudentLayout";
import Dashboard from "./pages/student/Dashboard";
import AccountSettings from "./pages/student/AccountSettings";
import ProfileSettings from "./pages/student/ProfileSettings";
import PaymentSettings from "./pages/student/PaymentSettings";
import Help from "./pages/student/Help";
import MyCourses from "./pages/student/MyCourses";
import MyInstructorCourses from "./pages/instructor/MyInstructorCourses";
import CourseStudy from "./pages/CourseStudy";
import NotificationsPage from "./pages/NotificationsPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import InstructorManagement from "./pages/admin/InstructorManagement";
import ContactMessages from "./pages/admin/ContactMessages";
import AdvertisementManagement from "./pages/admin/AdvertisementManagement";
import CouponManagement from "./pages/admin/CouponManagement";
import CategoriesManagement from "./components/admin/CategoriesManagement";
import SubcategoriesManagement from "./components/admin/SubcategoriesManagement";
import StudentManagement from "./pages/admin/StudentManagement";
import Analytics from "./pages/admin/Analytics";
import PageAnalytics from "./pages/admin/PageAnalytics";
import ActiveSessions from "./pages/admin/ActiveSessions";
import AdminReviews from "./pages/admin/AdminReviews";
import PageTracker from "./components/common/PageTracker";
import StaffManagement from "./pages/admin/StaffManagement";
import Payments from "./pages/admin/Payments";
import Orders from "./pages/admin/Orders";
import AbandonedCarts from "./pages/admin/AbandonedCarts";
import Backups from "./pages/admin/Backups";
import AffiliateManagement from "./pages/admin/AffiliateManagement";
import AffiliateForm from "./pages/admin/AffiliateForm";
import AffiliateLogin from "./pages/affiliate/AffiliateLogin";
import AffiliateLayout from "./pages/affiliate/AffiliateLayout";
import AffiliateDashboard from "./pages/affiliate/AffiliateDashboard";
import AffiliateConversions from "./pages/affiliate/AffiliateConversions";
import AffiliatePayouts from "./pages/affiliate/AffiliatePayouts";
import InstructorLayout from "./pages/instructor/InstructorLayout";
import InstructorDashboard from "./pages/instructor/Dashboard";
import InstructorCourses from "./pages/instructor/Courses";
import { CreateCourse } from "./pages/instructor/course-creation";
import EditCourse from "./pages/instructor/EditCourse";
import InstructorApplication from "./pages/instructor/InstructorApplication";
import PendingApproval from "./pages/instructor/PendingApproval";
import CourseApplications from "./pages/admin/CourseApplications";
import CourseManagement from "./pages/admin/CourseManagement";
import CourseDetail from "./pages/admin/CourseDetail";
import CourseEdit from "./pages/admin/CourseEdit";
import TranslatedComingSoon from "./components/shared/TranslatedComingSoon";
import LoadingNew from "./components/shared/LoadingNew/LoadingNew";
import AdminAccountSettings from "./pages/admin/AdminAccountSettings";
import AdminProfileSettings from "./pages/admin/ProfileSettings";
import ManualEnrollment from "./pages/admin/ManualEnrollment";
import EnrollmentLogs from "./pages/admin/EnrollmentLogs";
import SystemLogs from "./pages/admin/SystemLogs";
import ManagedEnrollments from "./pages/admin/ManagedEnrollments";
import InstructorAccountSettings from "./pages/instructor/InstructorAccountSettings";
import InstructorProfileSettings from "./pages/instructor/ProfileSettings";
import CoursePreview from "./pages/CoursePreview";
import VerifyEnrollment from "./pages/VerifyEnrollment";
import VerifyCertificate from "./pages/VerifyCertificate";
import StudentCertificates from "./pages/student/StudentCertificates";
import CertificatesManagement from "./pages/admin/CertificatesManagement";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import PaymentProcess from "./pages/PaymentProcess";
import Checkout from "./pages/Checkout";
import TabbySuccess from "./pages/TabbySuccess";
import TabbyCancel from "./pages/TabbyCancel";
import TabbyFailure from "./pages/TabbyFailure";
import TamaraSuccess from "./pages/TamaraSuccess";
import TamaraCancel from "./pages/TamaraCancel";
import TamaraFailure from "./pages/TamaraFailure";
import DocumentTitle from "./components/DocumentTitle";
import ScrollToTop from "./components/ScrollToTop";
import InstructorProfile from "./pages/InstructorProfile";
import AdminNotificationsSettings from "./pages/admin/AdminNotificationsSettings";
import AdminNotifications from "./pages/admin/AdminNotifications";
const RouteTracker = () => {
  const location = useLocation();
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
    try {
      const params = new URLSearchParams(location.search);
      const ref = params.get("ref") || params.get("affiliate") || params.get("coupon");
      if (ref) {
        localStorage.setItem("referralCode", ref.trim().toUpperCase());
      }
    } catch {
    }
  }, [location]);
  return null;
};
const App = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith("ar");
  return /* @__PURE__ */ React.createElement(Router, null, /* @__PURE__ */ React.createElement(ScrollToTop, null), /* @__PURE__ */ React.createElement(RouteTracker, null), /* @__PURE__ */ React.createElement(AuthProvider, null, /* @__PURE__ */ React.createElement(CartProvider, null, /* @__PURE__ */ React.createElement(CategoryLookupProvider, null, /* @__PURE__ */ React.createElement(DocumentTitle, null), /* @__PURE__ */ React.createElement(PageTracker, null), /* @__PURE__ */ React.createElement(Cart, null), /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-white" }, /* @__PURE__ */ React.createElement(ToastContainer, { position: "top-right", autoClose: 5e3, rtl: isRTL }), /* @__PURE__ */ React.createElement(Routes, null, /* @__PURE__ */ React.createElement(Route, { path: "/login", element: /* @__PURE__ */ React.createElement(Login, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/signup", element: /* @__PURE__ */ React.createElement(Register, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/forgot-password", element: /* @__PURE__ */ React.createElement(ForgotPassword, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/affiliate/login", element: /* @__PURE__ */ React.createElement(AffiliateLogin, null) }), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/*",
      element: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Header, null), /* @__PURE__ */ React.createElement("main", null, /* @__PURE__ */ React.createElement(Routes, null, /* @__PURE__ */ React.createElement(Route, { path: "/", element: /* @__PURE__ */ React.createElement(Home, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/login", element: /* @__PURE__ */ React.createElement(Login, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/register", element: /* @__PURE__ */ React.createElement(Register, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/forgot-password", element: /* @__PURE__ */ React.createElement(ForgotPassword, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/explore", element: /* @__PURE__ */ React.createElement(Explore, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/checkout", element: /* @__PURE__ */ React.createElement(Checkout, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/checkout-success", element: /* @__PURE__ */ React.createElement(CheckoutSuccess, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/payment-success", element: /* @__PURE__ */ React.createElement(PaymentSuccess, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/payment-failed", element: /* @__PURE__ */ React.createElement(PaymentFailed, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/payment-process", element: /* @__PURE__ */ React.createElement(PaymentProcess, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/tabby/success", element: /* @__PURE__ */ React.createElement(TabbySuccess, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/tabby/cancel", element: /* @__PURE__ */ React.createElement(TabbyCancel, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/tabby/failure", element: /* @__PURE__ */ React.createElement(TabbyFailure, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/tamara/success", element: /* @__PURE__ */ React.createElement(TamaraSuccess, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/tamara/cancel", element: /* @__PURE__ */ React.createElement(TamaraCancel, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/tamara/failure", element: /* @__PURE__ */ React.createElement(TamaraFailure, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/loading", element: /* @__PURE__ */ React.createElement(LoadingNew, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/categories", element: /* @__PURE__ */ React.createElement(Categories, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/category/:slug", element: /* @__PURE__ */ React.createElement(Category, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/subcategory/:slug", element: /* @__PURE__ */ React.createElement(Subcategory, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/verify-enrollment/:serial", element: /* @__PURE__ */ React.createElement(VerifyEnrollment, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/verify-certificate/:certNumber", element: /* @__PURE__ */ React.createElement(VerifyCertificate, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/verify-certificate", element: /* @__PURE__ */ React.createElement(VerifyCertificate, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/about", element: /* @__PURE__ */ React.createElement(AboutUs, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/contact", element: /* @__PURE__ */ React.createElement(ContactUs, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/faq", element: /* @__PURE__ */ React.createElement(FAQ, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/terms", element: /* @__PURE__ */ React.createElement(Terms, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/privacy", element: /* @__PURE__ */ React.createElement(Privacy, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/course/:id", element: /* @__PURE__ */ React.createElement(CoursePreview, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/profile/:id", element: /* @__PURE__ */ React.createElement(InstructorProfile, null) }))), /* @__PURE__ */ React.createElement(Footer, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/student/*",
      element: /* @__PURE__ */ React.createElement(Routes, null, /* @__PURE__ */ React.createElement(Route, { path: "", element: /* @__PURE__ */ React.createElement(StudentLayout, null) }, /* @__PURE__ */ React.createElement(Route, { index: true, element: /* @__PURE__ */ React.createElement(Dashboard, null) }), /* @__PURE__ */ React.createElement(Route, { path: "dashboard", element: /* @__PURE__ */ React.createElement(Dashboard, null) }), /* @__PURE__ */ React.createElement(Route, { path: "my-courses", element: /* @__PURE__ */ React.createElement(MyCourses, null) }), /* @__PURE__ */ React.createElement(Route, { path: "notifications", element: /* @__PURE__ */ React.createElement(NotificationsPage, null) }), /* @__PURE__ */ React.createElement(Route, { path: "assignments", element: /* @__PURE__ */ React.createElement(TranslatedComingSoon, { titleKey: "student.comingSoon.assignments.title", messageKey: "student.comingSoon.assignments.message" }) }), /* @__PURE__ */ React.createElement(Route, { path: "certificate", element: /* @__PURE__ */ React.createElement(StudentCertificates, null) }), /* @__PURE__ */ React.createElement(Route, { path: "reviews", element: /* @__PURE__ */ React.createElement(TranslatedComingSoon, { titleKey: "student.comingSoon.reviews.title", messageKey: "student.comingSoon.reviews.message" }) }), /* @__PURE__ */ React.createElement(Route, { path: "account-settings", element: /* @__PURE__ */ React.createElement(AccountSettings, null) }), /* @__PURE__ */ React.createElement(Route, { path: "profile-settings", element: /* @__PURE__ */ React.createElement(ProfileSettings, null) }), /* @__PURE__ */ React.createElement(Route, { path: "payment-settings", element: /* @__PURE__ */ React.createElement(PaymentSettings, null) }), /* @__PURE__ */ React.createElement(Route, { path: "help", element: /* @__PURE__ */ React.createElement(Help, null) }), /* @__PURE__ */ React.createElement(Route, { path: "course/:id/study", element: /* @__PURE__ */ React.createElement(CourseStudy, null) })))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/admin/*",
      element: /* @__PURE__ */ React.createElement(Routes, null, /* @__PURE__ */ React.createElement(Route, { path: "", element: /* @__PURE__ */ React.createElement(AdminLayout, null) }, /* @__PURE__ */ React.createElement(Route, { index: true, element: /* @__PURE__ */ React.createElement(AdminDashboard, null) }), /* @__PURE__ */ React.createElement(Route, { path: "dashboard", element: /* @__PURE__ */ React.createElement(AdminDashboard, null) }), /* @__PURE__ */ React.createElement(Route, { path: "user-tracking", element: /* @__PURE__ */ React.createElement(PageAnalytics, null) }), /* @__PURE__ */ React.createElement(Route, { path: "analytics", element: /* @__PURE__ */ React.createElement(Analytics, null) }), /* @__PURE__ */ React.createElement(Route, { path: "active-sessions", element: /* @__PURE__ */ React.createElement(ActiveSessions, null) }), /* @__PURE__ */ React.createElement(Route, { path: "notifications", element: /* @__PURE__ */ React.createElement(AdminNotifications, null) }), /* @__PURE__ */ React.createElement(Route, { path: "notifications-setting", element: /* @__PURE__ */ React.createElement(AdminNotificationsSettings, null) }), /* @__PURE__ */ React.createElement(Route, { path: "instructors", element: /* @__PURE__ */ React.createElement(InstructorManagement, null) }), /* @__PURE__ */ React.createElement(Route, { path: "courses", element: /* @__PURE__ */ React.createElement(CourseManagement, null) }), /* @__PURE__ */ React.createElement(Route, { path: "courses/:id", element: /* @__PURE__ */ React.createElement(CourseDetail, null) }), /* @__PURE__ */ React.createElement(Route, { path: "courses/:id/edit", element: /* @__PURE__ */ React.createElement(CourseEdit, null) }), /* @__PURE__ */ React.createElement(Route, { path: "certificates", element: /* @__PURE__ */ React.createElement(CertificatesManagement, null) }), /* @__PURE__ */ React.createElement(Route, { path: "categories", element: /* @__PURE__ */ React.createElement(CategoriesManagement, null) }), /* @__PURE__ */ React.createElement(Route, { path: "subcategories", element: /* @__PURE__ */ React.createElement(SubcategoriesManagement, null) }), /* @__PURE__ */ React.createElement(Route, { path: "reviews", element: /* @__PURE__ */ React.createElement(AdminReviews, null) }), /* @__PURE__ */ React.createElement(Route, { path: "staff", element: /* @__PURE__ */ React.createElement(StaffManagement, null) }), /* @__PURE__ */ React.createElement(Route, { path: "students", element: /* @__PURE__ */ React.createElement(StudentManagement, null) }), /* @__PURE__ */ React.createElement(Route, { path: "advertisements", element: /* @__PURE__ */ React.createElement(AdvertisementManagement, null) }), /* @__PURE__ */ React.createElement(Route, { path: "coupons", element: /* @__PURE__ */ React.createElement(CouponManagement, null) }), /* @__PURE__ */ React.createElement(Route, { path: "affiliates", element: /* @__PURE__ */ React.createElement(AffiliateManagement, null) }), /* @__PURE__ */ React.createElement(Route, { path: "affiliates/create", element: /* @__PURE__ */ React.createElement(AffiliateForm, null) }), /* @__PURE__ */ React.createElement(Route, { path: "affiliates/:id/edit", element: /* @__PURE__ */ React.createElement(AffiliateForm, null) }), /* @__PURE__ */ React.createElement(Route, { path: "contact-messages", element: /* @__PURE__ */ React.createElement(ContactMessages, null) }), /* @__PURE__ */ React.createElement(Route, { path: "manual-enrollment", element: /* @__PURE__ */ React.createElement(ManualEnrollment, null) }), /* @__PURE__ */ React.createElement(Route, { path: "enrollment-logs", element: /* @__PURE__ */ React.createElement(EnrollmentLogs, null) }), /* @__PURE__ */ React.createElement(Route, { path: "system-logs", element: /* @__PURE__ */ React.createElement(SystemLogs, null) }), /* @__PURE__ */ React.createElement(Route, { path: "payments", element: /* @__PURE__ */ React.createElement(Payments, null) }), " ", /* @__PURE__ */ React.createElement(Route, { path: "orders", element: /* @__PURE__ */ React.createElement(Orders, null) }), /* @__PURE__ */ React.createElement(Route, { path: "abandoned-carts", element: /* @__PURE__ */ React.createElement(AbandonedCarts, null) }), /* @__PURE__ */ React.createElement(Route, { path: "backups", element: /* @__PURE__ */ React.createElement(Backups, null) }), /* @__PURE__ */ React.createElement(Route, { path: "online-enrollments", element: /* @__PURE__ */ React.createElement(ManagedEnrollments, null) }), /* @__PURE__ */ React.createElement(Route, { path: "offline-enrollments", element: /* @__PURE__ */ React.createElement(ManagedEnrollments, null) }), /* @__PURE__ */ React.createElement(Route, { path: "account-settings", element: /* @__PURE__ */ React.createElement(AdminAccountSettings, null) }), /* @__PURE__ */ React.createElement(Route, { path: "profile-settings", element: /* @__PURE__ */ React.createElement(AdminProfileSettings, null) }), /* @__PURE__ */ React.createElement(Route, { path: "settings", element: /* @__PURE__ */ React.createElement(TranslatedComingSoon, { titleKey: "admin.comingSoon.settings.title", messageKey: "admin.comingSoon.settings.message" }) })))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/instructor/*",
      element: /* @__PURE__ */ React.createElement(Routes, null, /* @__PURE__ */ React.createElement(Route, { path: "apply", element: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Header, null), /* @__PURE__ */ React.createElement("main", null, /* @__PURE__ */ React.createElement(InstructorApplication, null))) }), /* @__PURE__ */ React.createElement(Route, { path: "pending-approval", element: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Header, null), /* @__PURE__ */ React.createElement("main", null, /* @__PURE__ */ React.createElement(PendingApproval, null))) }), /* @__PURE__ */ React.createElement(Route, { path: "", element: /* @__PURE__ */ React.createElement(InstructorLayout, null) }, /* @__PURE__ */ React.createElement(Route, { index: true, element: /* @__PURE__ */ React.createElement(InstructorDashboard, null) }), /* @__PURE__ */ React.createElement(Route, { path: "dashboard", element: /* @__PURE__ */ React.createElement(InstructorDashboard, null) }), /* @__PURE__ */ React.createElement(Route, { path: "courses", element: /* @__PURE__ */ React.createElement(InstructorCourses, null) }), /* @__PURE__ */ React.createElement(Route, { path: "my-courses", element: /* @__PURE__ */ React.createElement(MyInstructorCourses, null) }), /* @__PURE__ */ React.createElement(Route, { path: "courses-create", element: /* @__PURE__ */ React.createElement(CreateCourse, null) }), /* @__PURE__ */ React.createElement(Route, { path: "courses/:id/edit", element: /* @__PURE__ */ React.createElement(EditCourse, null) }), /* @__PURE__ */ React.createElement(Route, { path: "account-settings", element: /* @__PURE__ */ React.createElement(InstructorAccountSettings, null) }), /* @__PURE__ */ React.createElement(Route, { path: "profile-settings", element: /* @__PURE__ */ React.createElement(InstructorProfileSettings, null) }), /* @__PURE__ */ React.createElement(Route, { path: "notifications", element: /* @__PURE__ */ React.createElement(NotificationsPage, null) }), /* @__PURE__ */ React.createElement(Route, { path: "settings", element: /* @__PURE__ */ React.createElement(InstructorAccountSettings, null) })))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/affiliate/*",
      element: /* @__PURE__ */ React.createElement(Routes, null, /* @__PURE__ */ React.createElement(Route, { path: "login", element: /* @__PURE__ */ React.createElement(AffiliateLogin, null) }), /* @__PURE__ */ React.createElement(Route, { path: "", element: /* @__PURE__ */ React.createElement(AffiliateLayout, null) }, /* @__PURE__ */ React.createElement(Route, { index: true, element: /* @__PURE__ */ React.createElement(AffiliateDashboard, null) }), /* @__PURE__ */ React.createElement(Route, { path: "dashboard", element: /* @__PURE__ */ React.createElement(AffiliateDashboard, null) }), /* @__PURE__ */ React.createElement(Route, { path: "conversions", element: /* @__PURE__ */ React.createElement(AffiliateConversions, null) }), /* @__PURE__ */ React.createElement(Route, { path: "payouts", element: /* @__PURE__ */ React.createElement(AffiliatePayouts, null) })))
    }
  )))))));
};
export default App;
