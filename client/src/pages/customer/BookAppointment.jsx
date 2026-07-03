import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Sparkles, Clock, Check, ChevronRight, Calendar as CalIcon, CreditCard, Upload, Plus, X, ArrowLeft, CalendarDays } from "lucide-react";
import { serviceService, appointmentService, uploadService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { isPriceSet, glowPointsFromAmount } from "../../utils";
import { toast } from "sonner";
import { format, addDays, isToday, isTomorrow } from "date-fns";

const TIME_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState(1); // 1: Main booking, 2: Payment/Confirm, 3: Success
  const [selectedServices, setSelectedServices] = useState([]);
  
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [transactionId, setTransactionId] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [booked, setBooked] = useState(null);

  const queryClient = useQueryClient();

  const playNotificationSound = () => {
    const audio = new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=success-1-6297.mp3");
    audio.play().catch(e => console.log("Audio play failed:", e));
  };

  const { data } = useQuery({ queryKey: QUERY_KEYS.SERVICES, queryFn: serviceService.getAll });
  const services = data?.data || [];

  useEffect(() => {
    if (services.length > 0 && selectedServices.length === 0) {
      const serviceParam = searchParams.get("service") || searchParams.get("services");
      if (serviceParam) {
        const ids = serviceParam.split(",");
        const matched = services.filter(s => ids.includes(s._id));
        if (matched.length > 0) {
          setSelectedServices(matched);
        }
      }
    }
  }, [services, searchParams]);

  const { mutate: book, isPending } = useMutation({
    mutationFn: appointmentService.book,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_APPOINTMENTS });
      setBooked(res.data);
      setStep(3); // Success step
      toast.success("Appointment requested! ✨");
      playNotificationSound();
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleService = (svc) => {
    setSelectedServices(prev =>
      prev.find(s => s._id === svc._id)
        ? prev.filter(s => s._id !== svc._id)
        : [...prev, svc]
    );
  };

  const totalDuration = selectedServices.reduce((sum, s) => sum + (s.duration || 0), 0);
  const totalAmount = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);
  
  const canContinue = selectedServices.length > 0 && !!date && !!time;

  // Generate next 14 days
  const dateOptions = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const d = addDays(new Date(), i);
      let label = format(d, "EEE");
      if (isToday(d)) label = "Today";
      else if (isTomorrow(d)) label = "Tomorrow";
      
      dates.push({
        fullDate: format(d, "yyyy-MM-dd"),
        label,
        dayNumber: format(d, "dd"),
        month: format(d, "MMM")
      });
    }
    return dates;
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadService.uploadImage(file);
      setPaymentScreenshot(res.data.url);
      toast.success("Screenshot uploaded");
    } catch (err) {
      toast.error("Failed to upload screenshot");
    } finally {
      setIsUploading(false);
    }
  };

  const handleBook = () => {
    book({
      serviceIds: selectedServices.map(s => s._id),
      appointmentDate: date,
      appointmentTime: time,
      notes,
      paymentMethod,
      transactionId: paymentMethod === "Manual UPI" ? transactionId : undefined,
      paymentScreenshot: paymentMethod === "Manual UPI" ? paymentScreenshot : undefined,
    });
  };

  if (step === 3 && booked) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center py-12 space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold text-gray-900">Booking Requested!</h2>
          <p className="text-gray-500 mt-2">We'll confirm your appointment shortly</p>
        </div>
        <div className="rounded-3xl bg-white shadow-xl shadow-gray-200/40 border border-gray-100 p-6 text-left space-y-3">
          <p className="text-sm text-gray-500">Services: <span className="text-gray-900 font-medium">{booked.services?.map(s => s.serviceName).join(", ")}</span></p>
          <p className="text-sm text-gray-500">Date: <span className="text-gray-900 font-medium">{booked.appointmentDate}</span></p>
          <p className="text-sm text-gray-500">Time: <span className="text-gray-900 font-medium">{booked.appointmentTime}</span></p>
          <p className="text-sm text-gray-500">Status: <span className="text-amber-500 font-bold">Pending confirmation</span></p>
          
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-rose-500 bg-rose-50 p-3 rounded-2xl">
            <Sparkles className="w-5 h-5" /> 
            <span className="text-sm font-bold">You'll earn {glowPointsFromAmount(booked.totalAmount || totalAmount)} Glow Points</span>
          </div>
        </div>
        <button onClick={() => navigate("/appointments")} className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-rose-500/30">
          View My Appointments
        </button>
      </motion.div>
    );
  }

  // PAYMENT / CONFIRM STEP
  if (step === 2) {
    return (
      <div className="max-w-xl mx-auto pb-32">
        <div className="flex items-center justify-between mb-8 sticky top-0 bg-white/80 backdrop-blur-md py-4 z-10 px-4 mt-2">
          <button onClick={() => setStep(1)} className="w-12 h-12 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center hover:bg-gray-50">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-display font-black text-gray-900">Confirm Booking</h1>
            <p className="text-xs text-gray-500 text-center mt-1">Final step</p>
          </div>
          <div className="w-12 h-12" /> {/* Spacer */}
        </div>

        <div className="space-y-6 px-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
             <h3 className="font-bold text-gray-900 mb-4">Booking Summary</h3>
             <div className="space-y-3 mb-4">
                {selectedServices.map(s => (
                  <div key={s._id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 font-medium">{s.name}</span>
                    {/* Hiding price on the confirm screen too, or we can just leave totalAmount at the bottom */}
                    <span className="text-gray-900 font-bold"></span>
                  </div>
                ))}
             </div>
             <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm mb-2">
                <span className="text-gray-500">Date & Time</span>
                <span className="text-gray-900 font-bold">{format(new Date(date), "dd MMM yyyy")} at {time}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Total Duration</span>
                <span className="text-gray-900 font-bold">{totalDuration} min</span>
             </div>
          </div>

          <div>
             <h3 className="font-bold text-gray-900 mb-4 ml-1">Payment Method</h3>
             <div className="grid grid-cols-2 gap-3 mb-4">
              {["Cash", "Manual UPI"].map(method => (
                <button key={method} onClick={() => setPaymentMethod(method)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col gap-2 ${paymentMethod === method ? "border-rose-500 bg-rose-50" : "border-gray-100 bg-white hover:border-rose-200"}`}
                >
                  <CreditCard className={`w-6 h-6 ${paymentMethod === method ? "text-rose-500" : "text-gray-400"}`} />
                  <span className={`font-bold text-sm ${paymentMethod === method ? "text-rose-600" : "text-gray-700"}`}>{method}</span>
                </button>
              ))}
             </div>
          </div>

          {paymentMethod === "Manual UPI" && (
            <div className="space-y-4 rounded-3xl bg-white border border-gray-100 shadow-sm p-5">
              <div className="text-center space-y-2 mb-4">
                <p className="text-sm font-bold text-gray-900">Pay to Gayatri Beauty Studio</p>
                <p className="text-xs text-gray-500">UPI ID: gayatribeautystudio@upi</p>
                <div className="w-40 h-40 mx-auto bg-white p-2 rounded-2xl border border-gray-100 shadow-inner mt-4">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=gayatribeautystudio@upi&pn=Gayatri%20Beauty%20Studio" alt="UPI QR" className="w-full h-full object-contain rounded-xl" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">UTR / Transaction ID *</label>
                <input
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  placeholder="Enter 12-digit UTR number"
                  className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-none text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-rose-500 transition-all font-medium text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Payment Screenshot (Optional)</label>
                <div className="relative">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="screenshot-upload" disabled={isUploading} />
                  <label htmlFor="screenshot-upload" className="w-full px-4 py-3.5 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center gap-2 cursor-pointer hover:bg-rose-100 transition-colors font-bold text-sm">
                    {isUploading ? <span className="w-4 h-4 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
                    {paymentScreenshot ? "Screenshot Uploaded" : "Upload Screenshot"}
                  </label>
                </div>
              </div>
            </div>
          )}

          <div>
             <h3 className="font-bold text-gray-900 mb-2 ml-1">Notes (Optional)</h3>
             <textarea
               value={notes}
               onChange={e => setNotes(e.target.value)}
               rows={2}
               placeholder="Any specific requests?"
               className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-none text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-rose-500 transition-all text-sm font-medium resize-none"
             />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
             <div className="flex flex-col pl-2">
               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Amount</span>
               <div className="flex items-baseline gap-1">
                 <span className="text-xl font-black text-gray-900">₹{totalAmount}</span>
                 <span className="text-[9px] font-medium text-gray-400 ml-1">(Incl. all taxes)</span>
               </div>
             </div>
             <button
               onClick={handleBook}
               disabled={isPending || (paymentMethod === "Manual UPI" && transactionId.trim().length < 3)}
               className="flex-[1.5] py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-rose-500/30 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
             >
               {isPending ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Confirm Booking"} <ChevronRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 1: Main UI based on the design
  return (
    <div className="max-w-xl mx-auto bg-[#fafafa] min-h-screen pb-40">
      
      {/* Header */}
      <div className="bg-gradient-to-b from-rose-50 to-[#fafafa] px-4 pt-6 pb-2">
        <div className="flex items-center justify-between mb-8 sticky top-0 z-10">
          <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full border border-gray-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1 px-4 text-center">
            <h1 className="text-xl font-display font-black text-gray-900 tracking-tight">Book Appointment</h1>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">Choose your perfect time</p>
          </div>
          <button onClick={() => navigate("/appointments")} className="w-12 h-12 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center border border-rose-100 hover:bg-rose-50 transition-colors">
            <CalendarDays className="w-4 h-4 text-rose-500 mb-0.5" />
            <span className="text-[7px] font-bold text-rose-600 leading-none">Bookings</span>
          </button>
        </div>

        {/* Timeline Stepper */}
        <div className="flex items-center justify-between px-2 mb-6">
           <div className="flex flex-col items-center gap-1.5 z-10">
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-rose-500/30">1</div>
              <span className="text-[10px] font-bold text-rose-500">Service</span>
           </div>
           <div className="flex-1 h-[2px] bg-gray-200 mx-2" />
           <div className="flex flex-col items-center gap-1.5 z-10">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-400 flex items-center justify-center text-xs font-bold">2</div>
              <span className="text-[10px] font-bold text-gray-400">Date & Time</span>
           </div>
           <div className="flex-1 h-[2px] bg-gray-200 mx-2" />
           <div className="flex flex-col items-center gap-1.5 z-10">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-400 flex items-center justify-center text-xs font-bold">3</div>
              <span className="text-[10px] font-bold text-gray-400">Confirm</span>
           </div>
        </div>
      </div>

      <div className="px-4 space-y-8 mt-2">
        
        {/* Select Service Section */}
        <section>
           <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm text-gray-900">Select Service</h2>
              <button className="text-[11px] font-bold text-rose-500 flex items-center hover:text-rose-600">View All Services <ChevronRight className="w-3.5 h-3.5 ml-0.5" /></button>
           </div>
           <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
              {services.map(svc => {
                const isSelected = selectedServices.some(s => s._id === svc._id);
                return (
                  <button 
                    key={svc._id} 
                    onClick={() => toggleService(svc)}
                    className={`snap-center w-36 shrink-0 rounded-[1.5rem] p-1.5 transition-all text-left relative bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] border-2 ${isSelected ? 'border-rose-500' : 'border-transparent'}`}
                  >
                    <div className="w-full h-32 rounded-[1.2rem] bg-gray-100 overflow-hidden relative mb-2.5">
                      <img src={svc.image} className="w-full h-full object-cover" alt={svc.name} />
                      <div className="absolute bottom-2 left-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-rose-500">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center shadow-sm z-10">
                           <Check className="w-3 h-3 text-white stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="px-2 pb-2">
                      <h3 className="font-bold text-[13px] text-gray-900 leading-tight mb-1 truncate">{svc.name}</h3>
                      <p className="text-[10px] text-gray-500">{svc.duration} min</p>
                    </div>
                  </button>
                )
              })}
           </div>
        </section>

        {/* Select Date Section */}
        <section>
           <h2 className="font-bold text-sm text-gray-900 mb-4">Select Date</h2>
           <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              <div className="w-16 h-20 shrink-0 flex items-center justify-center rounded-2xl bg-white border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] text-gray-400">
                 <CalIcon className="w-6 h-6" />
              </div>
              {dateOptions.map((d) => {
                const isSelected = date === d.fullDate;
                return (
                  <button
                    key={d.fullDate}
                    onClick={() => setDate(d.fullDate)}
                    className={`w-16 h-20 shrink-0 rounded-2xl flex flex-col items-center justify-center transition-all border-2 ${isSelected ? 'bg-rose-50 border-rose-400' : 'bg-white border-transparent hover:border-gray-200'} shadow-[0_4px_15px_rgba(0,0,0,0.03)]`}
                  >
                     <span className={`text-[11px] font-bold ${isSelected ? 'text-rose-500' : 'text-gray-400'}`}>{d.label}</span>
                     <span className={`text-[22px] font-black leading-none my-1 ${isSelected ? 'text-rose-600' : 'text-gray-900'}`}>{d.dayNumber}</span>
                     <span className={`text-[10px] font-bold ${isSelected ? 'text-rose-500' : 'text-gray-400'}`}>{d.month}</span>
                  </button>
                )
              })}
           </div>
        </section>

        {/* Select Time Section */}
        <section>
           <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm text-gray-900">Select Time</h2>
           </div>
           <div className="grid grid-cols-3 gap-3">
              {TIME_SLOTS.map(slot => {
                const isSelected = time === slot;
                return (
                  <button 
                    key={slot}
                    onClick={() => setTime(slot)}
                    className={`py-3.5 rounded-2xl text-[12px] font-bold transition-all border-2 flex items-center justify-center gap-1.5 relative ${isSelected ? 'bg-rose-50 border-rose-400 text-rose-600' : 'bg-white border-transparent text-gray-700 hover:border-gray-200'} shadow-[0_2px_8px_rgba(0,0,0,0.03)]`}
                  >
                    {slot}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-[18px] h-[18px] rounded-full bg-rose-500 border-[2px] border-white flex items-center justify-center shadow-sm">
                         <Check className="w-2.5 h-2.5 text-white stroke-[4]" />
                      </div>
                    )}
                  </button>
                )
              })}
           </div>
        </section>

        {/* Summary Card */}
        <AnimatePresence>
          {selectedServices.length > 0 && date && time && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="pt-2"
            >
               <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-sm text-gray-900">Appointment Summary</h2>
               </div>
               <div className="bg-white rounded-[1.5rem] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        <img src={selectedServices[0]?.image} alt="Service" className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1">
                        <h3 className="text-[13px] font-bold text-gray-900 truncate">
                          {selectedServices.length > 1 ? `${selectedServices[0].name} +${selectedServices.length-1}` : selectedServices[0]?.name}
                        </h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">{totalDuration} min session</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[12px] font-bold text-gray-900">{format(new Date(date), "dd MMM, yyyy")}</p>
                        <p className="text-[10px] text-gray-500 font-medium">{format(new Date(date), "EEEE")} at {time}</p>
                     </div>
                  </div>
                  
                  <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100/50 flex items-center gap-2">
                     <div className="bg-white p-1.5 rounded-full shadow-sm text-rose-500"><Sparkles className="w-3.5 h-3.5" /></div>
                     <p className="text-[11px] text-gray-700 font-medium">You will earn <span className="text-rose-600 font-bold">{glowPointsFromAmount(totalAmount)} Glow Points</span> on this booking!</p>
                  </div>
               </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
           <div className="flex flex-col pl-2">
             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Amount</span>
             <div className="flex items-baseline gap-1">
               <span className="text-[22px] font-black text-gray-900">₹{totalAmount}</span>
               <span className="text-[10px] font-medium text-gray-400 ml-1">(Incl. all taxes)</span>
             </div>
           </div>
           <button
             onClick={() => setStep(2)}
             disabled={!canContinue}
             className="flex-[1.5] py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-[1.2rem] transition-all shadow-[0_8px_20px_rgba(244,63,94,0.3)] disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2 text-[14px]"
           >
             Continue to Confirm <ArrowLeft className="w-4 h-4 rotate-180" />
           </button>
        </div>
      </div>

    </div>
  );
}
