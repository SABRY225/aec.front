import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { ToastContainer } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CategoryLookupProvider } from './context/CategoryLookupContext';
import './i18n';
import Header from './components/Header';
import Footer from './components/Footer';
import Navigation from './components/Navigation';
import Cart from './components/Cart';
// Import consolidated API services
import './services/new-api';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import BecomeATutor from './pages/BecomeATutor';
import Home from './pages/Home';
import Explore from './pages/Explore';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Categories from './pages/Categories';
import Category from './pages/Category';
import Subcategory from './pages/Subcategory';
import StudentLayout from './pages/student/StudentLayout';
import Dashboard from './pages/student/Dashboard';
import AccountSettings from './pages/student/AccountSettings';
import ProfileSettings from './pages/student/ProfileSettings';
import PaymentSettings from './pages/student/PaymentSettings';
import Help from './pages/student/Help';
import MyCourses from './pages/student/MyCourses';
import MyInstructorCourses from './pages/instructor/MyInstructorCourses';
import CourseStudy from './pages/CourseStudy';

// Admin imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import InstructorManagement from './pages/admin/InstructorManagement';
import ContactMessages from './pages/admin/ContactMessages';
import AdvertisementManagement from './pages/admin/AdvertisementManagement';
import CouponManagement from './pages/admin/CouponManagement';
import CategoriesManagement from './components/admin/CategoriesManagement';
import SubcategoriesManagement from './components/admin/SubcategoriesManagement';
import StudentManagement from './pages/admin/StudentManagement';
import Analytics from './pages/admin/Analytics';
import ActiveSessions from './pages/admin/ActiveSessions';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminReviews from './pages/admin/AdminReviews';
import StaffManagement from './pages/admin/StaffManagement';
import Payments from './pages/admin/Payments'; import Orders from './pages/admin/Orders';
import Backups from './pages/admin/Backups';
// Instructor imports
import InstructorLayout from './pages/instructor/InstructorLayout';
import InstructorDashboard from './pages/instructor/Dashboard';
import InstructorCourses from './pages/instructor/Courses';
import { CreateCourse } from './pages/instructor/course-creation';
import EditCourse from './pages/instructor/EditCourse';
import InstructorApplication from './pages/instructor/InstructorApplication';
import PendingApproval from './pages/instructor/PendingApproval';
import CourseApplications from './pages/admin/CourseApplications';
import CourseManagement from './pages/admin/CourseManagement';
import CourseDetail from './pages/admin/CourseDetail';
import CourseEdit from './pages/admin/CourseEdit';
import TranslatedComingSoon from './components/shared/TranslatedComingSoon';
import LoadingNew from './components/shared/LoadingNew/LoadingNew';
import AdminAccountSettings from './pages/admin/AdminAccountSettings';
import AdminProfileSettings from './pages/admin/ProfileSettings';
import ManualEnrollment from './pages/admin/ManualEnrollment';
import EnrollmentLogs from './pages/admin/EnrollmentLogs';
import SystemLogs from './pages/admin/SystemLogs';
import ManagedEnrollments from './pages/admin/ManagedEnrollments';
import InstructorAccountSettings from './pages/instructor/InstructorAccountSettings';
import InstructorProfileSettings from './pages/instructor/ProfileSettings';
import CoursePreview from './pages/CoursePreview';
import VerifyEnrollment from './pages/VerifyEnrollment';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import PaymentProcess from './pages/PaymentProcess';
import Checkout from './pages/Checkout';
import TabbySuccess from './pages/TabbySuccess';
import TabbyCancel from './pages/TabbyCancel';
import TabbyFailure from './pages/TabbyFailure';
import DocumentTitle from './components/DocumentTitle';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/layouts/ProtectedRoute';


const RouteTracker = () => {
  const location = useLocation();
  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
  }, [location]);
  return null;
};

const App = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');

  return (
    <Router>
      <ScrollToTop />
      <RouteTracker />
      <AuthProvider>
        <CartProvider>
          <CategoryLookupProvider>
            <DocumentTitle />
            <Cart />
            <div className="min-h-screen bg-white">
              <ToastContainer position="top-right" autoClose={5000} rtl={isRTL} />
              <Routes>
                {/* Auth Routes - without header */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                {/* Main Routes - with header and footer */}
                <Route
                  path="/*"
                  element={
                    <>
                      <Header />
                      <main>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />
                          <Route path="/forgot-password" element={<ForgotPassword />} />
                          <Route path="/explore" element={<Explore />} />
                          <Route path="/checkout" element={<Checkout />} />
                          <Route path="/checkout-success" element={<CheckoutSuccess />} />
                          <Route path="/payment-success" element={<PaymentSuccess />} />
                          <Route path="/payment-failed" element={<PaymentFailed />} />
                          <Route path="/payment-process" element={<PaymentProcess />} />
                          <Route path="/tabby/success" element={<TabbySuccess />} />
                          <Route path="/tabby/cancel" element={<TabbyCancel />} />
                          <Route path="/tabby/failure" element={<TabbyFailure />} />
                          <Route path="/loading" element={<LoadingNew />} />
                          <Route path="/categories" element={<Categories />} />
                          <Route path="/category/:slug" element={<Category />} />
                          <Route path="/subcategory/:slug" element={<Subcategory />} />
                          <Route path="/verify-enrollment/:serial" element={<VerifyEnrollment />} />
                          <Route path="/about" element={<AboutUs />} />
                          <Route path="/contact" element={<ContactUs />} />
                          <Route path="/faq" element={<FAQ />} />
                          <Route path="/terms" element={<Terms />} />
                          <Route path="/privacy" element={<Privacy />} />
                          <Route path="/course/:id" element={<CoursePreview />} />
                          <Route path="/become-tutor" element={<BecomeATutor />} />
                        </Routes>
                      </main>
                      <Footer />
                    </>
                  }
                />

                {/* Student Routes */}
                <Route
                  path="/student/*"
                  element={
                    <Routes>
                      <Route path="" element={<StudentLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="my-courses" element={<MyCourses />} />
                        <Route path="notifications" element={<TranslatedComingSoon titleKey="student.comingSoon.notifications.title" messageKey="student.comingSoon.notifications.message" />} />
                        <Route path="assignments" element={<TranslatedComingSoon titleKey="student.comingSoon.assignments.title" messageKey="student.comingSoon.assignments.message" />} />
                        <Route path="certificate" element={<TranslatedComingSoon titleKey="student.comingSoon.certificates.title" messageKey="student.comingSoon.certificates.message" />} />
                        <Route path="reviews" element={<TranslatedComingSoon titleKey="student.comingSoon.reviews.title" messageKey="student.comingSoon.reviews.message" />} />
                        <Route path="account-settings" element={<AccountSettings />} />
                        <Route path="profile-settings" element={<ProfileSettings />} />
                        <Route path="payment-settings" element={<PaymentSettings />} />
                        <Route path="help" element={<Help />} />
                        <Route path="course/:id/study" element={<CourseStudy />} />
                      </Route>
                    </Routes>
                  }
                />

                {/* Admin Routes - with header but without footer */}
                <Route
                  path="/admin/*"
                  element={
                    <>
                      <main>
                        <Routes>
                          <Route path="" element={<AdminLayout />}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="analytics" element={<Analytics />} />
                            <Route path="active-sessions" element={<ActiveSessions />} />
                            <Route path="notifications" element={<AdminNotifications />} />
                            <Route path="instructors" element={<InstructorManagement />} />
                            <Route path="courses" element={<CourseManagement />} />
                            <Route path="courses/:id" element={<CourseDetail />} />
                            <Route path="courses/:id/edit" element={<CourseEdit />} />
                            <Route path="categories" element={<CategoriesManagement />} />
                            <Route path="subcategories" element={<SubcategoriesManagement />} />
                            <Route path="reviews" element={<AdminReviews />} />
                            <Route path="staff" element={<StaffManagement />} />
                            <Route path="students" element={<StudentManagement />} />
                            <Route path="advertisements" element={<AdvertisementManagement />} />
                            <Route path="coupons" element={<CouponManagement />} />
                            <Route path="contact-messages" element={<ContactMessages />} />
                            <Route path="manual-enrollment" element={<ManualEnrollment />} />
                            <Route path="enrollment-logs" element={<EnrollmentLogs />} />
                            <Route path="system-logs" element={<SystemLogs />} />
                            <Route path="payments" element={<Payments />} /> <Route path="orders" element={<Orders />} />
                            <Route path="backups" element={<Backups />} />
                            <Route path="online-enrollments" element={<ManagedEnrollments />} />
                            <Route path="offline-enrollments" element={<ManagedEnrollments />} />
                            <Route path="account-settings" element={<AdminAccountSettings />} />
                            <Route path="profile-settings" element={<AdminProfileSettings />} />
                            <Route path="settings" element={<TranslatedComingSoon titleKey="admin.comingSoon.settings.title" messageKey="admin.comingSoon.settings.message" />} />
                          </Route>
                        </Routes>
                      </main>
                    </>
                  }
                />

                {/* Instructor Routes */}
                <Route
                  path="/instructor/*"
                  element={
                    <Routes>
                      <Route path="apply" element={<><Header /><main><InstructorApplication /></main></>} />
                      <Route path="pending-approval" element={<><Header /><main><PendingApproval /></main></>} />
                      <Route path="" element={<InstructorLayout />}>
                        <Route index element={<InstructorDashboard />} />
                        <Route path="dashboard" element={<InstructorDashboard />} />
                        <Route path="courses" element={<InstructorCourses />} />
                        <Route path="my-courses" element={<MyInstructorCourses />} />
                        <Route path="courses-create" element={<CreateCourse />} />
                        <Route path="courses/:id/edit" element={<EditCourse />} />
                        <Route path="courses/:id/analytics" element={<TranslatedComingSoon titleKey="instructor.comingSoon.analytics.title" messageKey="instructor.comingSoon.analytics.message" />} />
                        <Route path="account-settings" element={<InstructorAccountSettings />} />
                        <Route path="profile-settings" element={<InstructorProfileSettings />} />
                        <Route path="settings" element={<InstructorAccountSettings />} />
                      </Route>
                    </Routes>
                  }
                />
              </Routes>
            </div>
          </CategoryLookupProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
