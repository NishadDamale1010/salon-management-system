import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Users, Calendar, DollarSign, Package, Gift, Activity, Star, Scissors, ShoppingBag, Send, Tag, Image, BarChart2, Plus, Phone } from "lucide-react";
import { adminService, activityService, appointmentService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { formatCurrency, timeAgo } from "../../utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import BroadcastAlertModal from "../../components/admin/BroadcastAlertModal";
import LandingChampionBoard from "../../components/home/LandingChampionBoard";
import { useAuthStore } from "../../store/authStore";

export default function AdminDashboard() {
  const { data: dashData, isLoading } = useQuery({ queryKey: QUERY_KEYS.DASHBOARD_STATS, queryFn: adminService.getDashboard });
  const { data: apptData } = useQuery({ queryKey: ["ADMIN_APPOINTMENTS"], queryFn: appointmentService.getAll });
  const user = useAuthStore(s => s.user);

  const stats = dashData?.data;
  const appointments = apptData?.data?.slice(0, 3) || []; // Just top 3 for dashboard
  
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  // Quick actions array mapped to real routes
  const quickActions = [
    { icon: Calendar, label: "New Appointment", color: "text-rose-500", bg: "bg-rose-50", to: "/admin/appointments" },
    { icon: Users, label: "Add Customer", color: "text-rose-500", bg: "bg-rose-50", to: "/admin/customers" },
    { icon: Scissors, label: "Add Service", color: "text-rose-500", bg: "bg-rose-50", to: "/admin/services" },
    { icon: Package, label: "Add Product", color: "text-rose-500", bg: "bg-rose-50", to: "/admin/inventory" },
    { icon: ShoppingBag, label: "Orders", color: "text-rose-500", bg: "bg-rose-50", to: "/admin/orders" },
    { icon: Gift, label: "Rewards", color: "text-rose-500", bg: "bg-rose-50", to: "/admin/rewards" },
    { icon: Send, label: "Send Notification", color: "text-rose-500", bg: "bg-rose-50", onClick: () => setIsBroadcastModalOpen(true) },
    { icon: Tag, label: "Offers", color: "text-rose-500", bg: "bg-rose-50", to: "/admin/cms" },
    { icon: Image, label: "Gallery", color: "text-rose-500", bg: "bg-rose-50", to: "/admin/cms" },
    { icon: BarChart2, label: "Reports", color: "text-rose-500", bg: "bg-rose-50", to: "/admin/analytics" },
  ];

  if (isLoading) {
    return <div className="p-4">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 pb-6 max-w-md mx-auto md:max-w-none md:p-6 bg-gray-50 md:bg-transparent min-h-screen">
      
      {/* 1. WELCOME BANNER */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-100 rounded-3xl p-5 relative overflow-hidden shadow-sm border border-rose-100">
         <div className="relative z-10 w-2/3">
           <h2 className="text-xl font-display font-black text-gray-900 leading-tight">
             Good Morning, {user?.firstName} 👋
           </h2>
           <p className="text-[10px] text-gray-600 mt-1 max-w-[140px]">
             Here's what's happening with your studio today.
           </p>
         </div>
         {/* Decorative Image */}
         <div className="absolute right-0 top-0 bottom-0 w-1/3 md:w-1/4">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-pink-100/80 md:hidden z-10" />
            <img 
               src="/hero-girl.png" 
               alt="Decorative" 
               className="h-full w-full object-cover object-left opacity-90 mix-blend-multiply" 
            />
         </div>
      </div>

      <BroadcastAlertModal isOpen={isBroadcastModalOpen} onClose={() => setIsBroadcastModalOpen(false)} />

      {/* 2. STATS GRID (2x2) */}
      <div className="grid grid-cols-2 gap-3">
         {/* Revenue */}
         <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-start">
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
               <DollarSign className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-bold text-gray-500">Today's Revenue</p>
            <h3 className="text-lg font-black text-gray-900 leading-tight my-0.5">{formatCurrency(stats?.todayRevenue || 0)}</h3>
            <p className="text-[9px] font-bold text-emerald-500">↗ 12.5% <span className="text-gray-400 font-medium">vs yesterday</span></p>
         </div>
         
         {/* Appointments */}
         <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-start">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mb-2">
               <Calendar className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-bold text-gray-500">Appointments</p>
            <h3 className="text-lg font-black text-gray-900 leading-tight my-0.5">{stats?.totalAppointments || 0}</h3>
            <p className="text-[9px] font-bold text-emerald-500">↗ 8.2% <span className="text-gray-400 font-medium">vs yesterday</span></p>
         </div>

         {/* Total Customers */}
         <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-start">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-2">
               <Users className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-bold text-gray-500">Total Customers</p>
            <h3 className="text-lg font-black text-gray-900 leading-tight my-0.5">{stats?.totalCustomers || 0}</h3>
            <p className="text-[9px] font-bold text-emerald-500">↗ 11.3% <span className="text-gray-400 font-medium">vs yesterday</span></p>
         </div>

         {/* Glow Points Issued */}
         <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-start">
            <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 mb-2">
               <Star className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-bold text-gray-500">Glow Points Issued</p>
            <h3 className="text-lg font-black text-gray-900 leading-tight my-0.5">
               {stats?.totalGlowPointsIssued?.toLocaleString() || "0"}
            </h3>
            <p className="text-[9px] font-bold text-emerald-500">↗ 9.4% <span className="text-gray-400 font-medium">vs yesterday</span></p>
         </div>
      </div>

      {/* 3. CHAMPION BOARD WIDGET */}
      <div className="-mx-2 scale-95 origin-center sm:mx-0 sm:scale-100">
         {/* We reuse the LandingChampionBoard which already has the beautiful desktop/full layout. */}
         <LandingChampionBoard />
      </div>

      {/* 4. QUICK ACTIONS */}
      <div className="bg-white rounded-3xl p-4 pb-6 shadow-sm border border-gray-100 relative">
         <div className="inline-block bg-rose-50 text-rose-500 text-[9px] font-bold px-2 py-0.5 rounded-full mb-3 absolute -top-2 left-4">
            ⚙️ Quick Actions
         </div>
         <div className="grid grid-cols-5 gap-y-4 pt-2">
            {quickActions.map((action, i) => {
               if (action.to) {
                  return (
                     <Link 
                        key={i} 
                        to={action.to}
                        className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                     >
                        <div className={`w-10 h-10 rounded-2xl ${action.bg} flex items-center justify-center shadow-sm`}>
                           <action.icon className={`w-4 h-4 ${action.color}`} />
                        </div>
                        <span className="text-[8px] font-bold text-gray-600 text-center leading-tight px-0.5">{action.label}</span>
                     </Link>
                  );
               }
               return (
                  <button 
                     key={i} 
                     onClick={action.onClick}
                     className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                  >
                     <div className={`w-10 h-10 rounded-2xl ${action.bg} flex items-center justify-center shadow-sm`}>
                        <action.icon className={`w-4 h-4 ${action.color}`} />
                     </div>
                     <span className="text-[8px] font-bold text-gray-600 text-center leading-tight px-0.5">{action.label}</span>
                  </button>
               );
            })}
         </div>
      </div>

      {/* 5. BUSINESS INSIGHTS */}
      <div>
         <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-display font-bold text-gray-900 text-sm">Business Insights</h3>
            <button className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded flex items-center gap-1">
               This Month <span>▼</span>
            </button>
         </div>

         <div className="flex flex-col md:flex-row gap-3">
            {/* Revenue Area Chart */}
            <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-[160px] flex flex-col relative overflow-hidden">
               <h4 className="text-[10px] font-bold text-gray-800">Revenue Overview</h4>
               <p className="text-lg font-black text-gray-900 leading-tight">{formatCurrency(stats?.monthlyRevenue || 0)}</p>
               <p className="text-[9px] font-bold text-emerald-500">↗ 18.6% <span className="text-gray-400 font-medium">vs last month</span></p>
               
               <div className="absolute -bottom-2 -left-4 -right-4 h-[90px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={stats?.revenueChart?.length ? stats.revenueChart : [
                        { _id: '1 Jul', totalRevenue: 4000 },
                        { _id: '10 Jul', totalRevenue: 3000 },
                        { _id: '20 Jul', totalRevenue: 7000 },
                        { _id: '31 Jul', totalRevenue: 6000 }
                     ]}>
                     <defs>
                        <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                           <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                     </defs>
                     <Tooltip contentStyle={{ fontSize: '10px' }} />
                     <Area type="monotone" dataKey="totalRevenue" stroke="#f43f5e" strokeWidth={2} fill="url(#roseGrad)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Right Side Stats */}
            <div className="flex flex-col gap-3 flex-1">
               {/* Popular Service */}
               <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                     <p className="text-[9px] font-bold text-gray-500">Popular Service</p>
                     <p className="font-black text-gray-900 text-sm leading-tight mt-0.5">
                        {stats?.popularServices?.[0]?.serviceName || "Bridal Makeup"}
                     </p>
                     <p className="text-[9px] text-gray-500 mt-0.5">
                        {stats?.popularServices?.[0]?.count || stats?.popularServices?.[0]?.timesBooked || 48} Appointments
                     </p>
                  </div>
                  <div className="relative w-12 h-12">
                     {/* Fake circular progress */}
                     <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        <path className="text-rose-500" strokeDasharray="40, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                     </svg>
                     <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-rose-500">40%</div>
                  </div>
               </div>

               {/* Top Beautician */}
               <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" alt="Beautician" className="w-10 h-10 rounded-full object-cover" />
                     <div>
                        <p className="text-[9px] font-bold text-gray-500">Top Beautician</p>
                        <p className="font-bold text-gray-900 text-xs">Bharti Damale</p>
                        <p className="text-[9px] text-gray-500">32 Appointments</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2 py-1 rounded-full text-[9px] font-bold">
                     <Star className="w-3 h-3 fill-yellow-500" /> 4.9
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* 6. TODAY'S APPOINTMENTS */}
      <div>
         <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-display font-bold text-gray-900 text-sm">Today's Appointments</h3>
            <button className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
               View All <span>›</span>
            </button>
         </div>
         
         <div className="space-y-3">
            {appointments.length > 0 ? appointments.map((appt, i) => {
               const timeString = appt.appointmentTime || "10:00 AM";
               const timeParts = timeString.split(" ");
               const serviceName = appt.services && appt.services.length > 0 ? appt.services[0].serviceName : "Service";
               
               return (
               <div key={appt._id || i} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center gap-3">
                  {/* Time */}
                  <div className="flex flex-col items-center justify-center min-w-[50px] border-r border-gray-100 pr-2">
                     <span className="font-bold text-gray-900 text-xs">
                        {timeParts[0] || timeString}
                     </span>
                     <span className="text-[9px] font-bold text-gray-400">
                        {timeParts[1] || ""}
                     </span>
                  </div>
                  
                  {/* User details */}
                  <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                     <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${appt.customer?.firstName || 'User'}`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                     <p className="font-bold text-gray-900 text-xs truncate">
                        {appt.customer?.firstName} {appt.customer?.lastName}
                     </p>
                     <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-500 truncate max-w-[100px] sm:max-w-none">{serviceName}</span>
                        <span className="bg-rose-50 text-rose-500 text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                           {appt.status}
                        </span>
                     </div>
                  </div>
                  
                  {/* Price & Action */}
                  <div className="flex items-center gap-3 shrink-0">
                     <span className="font-black text-gray-900 text-xs">{formatCurrency(appt.totalAmount || 0)}</span>
                     <button className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100">
                        <Phone className="w-3 h-3 fill-rose-500" />
                     </button>
                  </div>
               </div>
            )}) : (
               <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                 <p className="text-gray-500 text-sm">No appointments scheduled for today.</p>
               </div>
            )}
         </div>
      </div>

    </div>
  );
}
