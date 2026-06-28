import React, { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from "./ProtectedRoute";
import GlobalError from "../components/ui/GlobalError";

// Layouts
const PublicLayout = lazy(() => import("../components/layout/PublicLayout"));
const CustomerLayout = lazy(() => import("../components/layout/CustomerLayout"));
const AdminLayout = lazy(() => import("../components/layout/AdminLayout"));

// Public Pages
const Home = lazy(() => import("../pages/public/Home"));
const Services = lazy(() => import("../pages/public/Services"));
const Gallery = lazy(() => import("../pages/public/Gallery"));
const Offers = lazy(() => import("../pages/public/Offers"));
const About = lazy(() => import("../pages/public/About"));
const Contact = lazy(() => import("../pages/public/Contact"));
const Login = lazy(() => import("../pages/public/Login"));
const Register = lazy(() => import("../pages/public/Register"));

const Products = lazy(() => import("../pages/public/Products"));

// Customer Pages
const CustomerDashboard = lazy(() => import("../pages/customer/Dashboard"));
const BookAppointment = lazy(() => import("../pages/customer/BookAppointment"));
const MyAppointments = lazy(() => import("../pages/customer/MyAppointments"));
const AppointmentDetails = lazy(() => import("../pages/customer/AppointmentDetails"));
const RewardsPage = lazy(() => import("../pages/customer/Rewards"));
const RedeemHistory = lazy(() => import("../pages/customer/RedeemHistory"));
const Leaderboard = lazy(() => import("../pages/customer/Leaderboard"));
const NotificationsPage = lazy(() => import("../pages/customer/Notifications"));
const CustomerProfile = lazy(() => import("../pages/customer/Profile"));
const CustomerShop = lazy(() => import("../pages/customer/Shop"));

// Admin Pages
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard"));
const AdminCustomers = lazy(() => import("../pages/admin/Customers"));
const AdminCustomerDetails = lazy(() => import("../pages/admin/CustomerDetails"));
const AdminAppointments = lazy(() => import("../pages/admin/Appointments"));
const AdminServices = lazy(() => import("../pages/admin/Services"));
const AdminRewards = lazy(() => import("../pages/admin/Rewards"));
const AdminInventory = lazy(() => import("../pages/admin/Inventory"));
const AdminAnalytics = lazy(() => import("../pages/admin/Analytics"));
const AdminLeaderboard = lazy(() => import("../pages/admin/Leaderboard"));
const AdminCMS = lazy(() => import("../pages/admin/CMS"));
const AdminActivity = lazy(() => import("../pages/admin/ActivityLog"));
const AdminNotifications = lazy(() => import("../pages/admin/Notifications"));
const AdminSettings = lazy(() => import("../pages/admin/Settings"));
const AdminOrders = lazy(() => import("../pages/admin/Orders"));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
    <div className="w-10 h-10 rounded-full border-2 border-[var(--color-rose-500)] border-t-transparent animate-spin" />
  </div>
);

const router = createBrowserRouter([
  // Public Routes
  {
    element: <Suspense fallback={<PageLoader />}><PublicLayout /></Suspense>,
    errorElement: <GlobalError />,
    children: [
      { path: "/", element: <Suspense fallback={<PageLoader />}><Home /></Suspense> },
      { path: "/services", element: <Suspense fallback={<PageLoader />}><Services /></Suspense> },
      { path: "/products", element: <Suspense fallback={<PageLoader />}><Products /></Suspense> },
      { path: "/gallery", element: <Suspense fallback={<PageLoader />}><Gallery /></Suspense> },
      { path: "/offers", element: <Suspense fallback={<PageLoader />}><Offers /></Suspense> },
      { path: "/about", element: <Suspense fallback={<PageLoader />}><About /></Suspense> },
      { path: "/contact", element: <Suspense fallback={<PageLoader />}><Contact /></Suspense> },
    ],
  },
  // Public Only (redirect to dashboard if logged in)
  {
    element: <Suspense fallback={<PageLoader />}><PublicOnlyRoute /></Suspense>,
    errorElement: <GlobalError />,
    children: [
      { path: "/login", element: <Suspense fallback={<PageLoader />}><Login /></Suspense> },
      { path: "/register", element: <Suspense fallback={<PageLoader />}><Register /></Suspense> },
    ],
  },
  // Customer Protected
  {
    element: <Suspense fallback={<PageLoader />}><ProtectedRoute /></Suspense>,
    errorElement: <GlobalError />,
    children: [
      {
        element: <Suspense fallback={<PageLoader />}><CustomerLayout /></Suspense>,
        children: [
          { path: "/dashboard", element: <Suspense fallback={<PageLoader />}><CustomerDashboard /></Suspense> },
          { path: "/book", element: <Suspense fallback={<PageLoader />}><BookAppointment /></Suspense> },
          { path: "/appointments", element: <Suspense fallback={<PageLoader />}><MyAppointments /></Suspense> },
          { path: "/appointments/:id", element: <Suspense fallback={<PageLoader />}><AppointmentDetails /></Suspense> },
          { path: "/rewards", element: <Suspense fallback={<PageLoader />}><RewardsPage /></Suspense> },
          { path: "/redemptions", element: <Suspense fallback={<PageLoader />}><RedeemHistory /></Suspense> },
          { path: "/leaderboard", element: <Suspense fallback={<PageLoader />}><Leaderboard /></Suspense> },
          { path: "/notifications", element: <Suspense fallback={<PageLoader />}><NotificationsPage /></Suspense> },
          { path: "/profile", element: <Suspense fallback={<PageLoader />}><CustomerProfile /></Suspense> },
          { path: "/products", element: <Suspense fallback={<PageLoader />}><CustomerShop /></Suspense> },
          { path: "/cart", element: <Navigate to="/products" replace /> },
        ],
      },
    ],
  },
  // Admin Protected
  {
    element: <Suspense fallback={<PageLoader />}><AdminRoute /></Suspense>,
    errorElement: <GlobalError />,
    children: [
      {
        element: <Suspense fallback={<PageLoader />}><AdminLayout /></Suspense>,
        children: [
          { path: "/admin", element: <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense> },
          { path: "/admin/customers", element: <Suspense fallback={<PageLoader />}><AdminCustomers /></Suspense> },
          { path: "/admin/customers/:id", element: <Suspense fallback={<PageLoader />}><AdminCustomerDetails /></Suspense> },
          { path: "/admin/appointments", element: <Suspense fallback={<PageLoader />}><AdminAppointments /></Suspense> },
          { path: "/admin/services", element: <Suspense fallback={<PageLoader />}><AdminServices /></Suspense> },
          { path: "/admin/rewards", element: <Suspense fallback={<PageLoader />}><AdminRewards /></Suspense> },
          { path: "/admin/inventory", element: <Suspense fallback={<PageLoader />}><AdminInventory /></Suspense> },
          { path: "/admin/orders", element: <Suspense fallback={<PageLoader />}><AdminOrders /></Suspense> },
          { path: "/admin/analytics", element: <Suspense fallback={<PageLoader />}><AdminAnalytics /></Suspense> },
          { path: "/admin/leaderboard", element: <Suspense fallback={<PageLoader />}><AdminLeaderboard /></Suspense> },
          { path: "/admin/cms", element: <Suspense fallback={<PageLoader />}><AdminCMS /></Suspense> },
          { path: "/admin/activity", element: <Suspense fallback={<PageLoader />}><AdminActivity /></Suspense> },
          { path: "/admin/notifications", element: <Suspense fallback={<PageLoader />}><AdminNotifications /></Suspense> },
          { path: "/admin/settings", element: <Suspense fallback={<PageLoader />}><AdminSettings /></Suspense> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
