import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Sparkles, Clock, Check, ChevronRight, Calendar as CalIcon, CreditCard, Upload } from "lucide-react";
import { serviceService, appointmentService, uploadService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { formatCurrency, glowPointsFromAmount } from "../../utils";
import { toast } from "sonner";

const STEPS = ["Select Services", "Schedule & Notes", "Payment", "Confirm"];
const TIME_SLOTS = ["09:00 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "01:00 PM", "02:00 PM", "02:30 PM", "03:00 PM", "04:00 PM", "05:00 PM", "05:30 PM", "06:00 PM"];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceIdParam = searchParams.get("service");
  
  const [step, setStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState([]);
  const [customServiceName, setCustomServiceName] = useState("");
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
    if (serviceIdParam && services.length > 0 && selectedServices.length === 0) {
      const matched = services.find(s => s._id === serviceIdParam);
      if (matched) {
        setSelectedServices([matched]);
      }
    }
  }, [services, serviceIdParam]);

  const { mutate: book, isPending } = useMutation({
    mutationFn: appointmentService.book,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_APPOINTMENTS });
      setBooked(res.data);
      setStep(STEPS.length);
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

  const addCustomService = () => {
    const name = customServiceName.trim();
    if (name.length < 2) {
      toast.error("Please enter the service you want");
      return;
    }

    const customId = `custom:${name.toLowerCase()}`;
    if (selectedServices.some(s => s._id === customId || s.name.toLowerCase() === name.toLowerCase())) {
      toast.error("This service is already selected");
      return;
    }

    setSelectedServices(prev => [...prev, {
      _id: customId,
      name,
      price: 0,
      duration: 0,
      isCustom: true,
    }]);
    setCustomServiceName("");
  };

  const totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  const canNext = [
    selectedServices.length > 0,
    !!date && !!time,
    paymentMethod === "Cash" || (paymentMethod === "Manual UPI" && transactionId.trim().length > 3),
    true,
  ];

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
      serviceIds: selectedServices.filter(s => !s.isCustom).map(s => s._id),
      customServices: selectedServices.filter(s => s.isCustom).map(s => s.name),
      appointmentDate: date,
      appointmentTime: time,
      notes,
      paymentMethod,
      transactionId: paymentMethod === "Manual UPI" ? transactionId : undefined,
      paymentScreenshot: paymentMethod === "Manual UPI" ? paymentScreenshot : undefined,
    });
  };

  if (step === STEPS.length && booked) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center py-12 space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold text-[var(--color-text-primary)]">Booking Requested!</h2>
          <p className="text-[var(--color-text-muted)] mt-2">We'll confirm your appointment shortly</p>
        </div>
        <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5 text-left space-y-3">
          <p className="text-sm text-[var(--color-text-muted)]">Services: <span className="text-[var(--color-text-primary)]">{booked.services?.map(s => s.serviceName).join(", ")}</span></p>
          <p className="text-sm text-[var(--color-text-muted)]">Date: <span className="text-[var(--color-text-primary)]">{booked.appointmentDate}</span></p>
          <p className="text-sm text-[var(--color-text-muted)]">Time: <span className="text-[var(--color-text-primary)]">{booked.appointmentTime}</span></p>
          <p className="text-sm text-[var(--color-text-muted)]">Total: <span className="text-[var(--color-rose-400)] font-bold">{formatCurrency(booked.totalAmount)}</span></p>
          <div className="flex items-center gap-1.5 text-yellow-400 text-sm font-medium">
            <Sparkles className="w-4 h-4" /> You'll earn {glowPointsFromAmount(booked.totalAmount)} Glow Points on completion
          </div>
        </div>
        <button onClick={() => navigate("/appointments")} className="w-full py-3.5 -white font-semibold rounded-xl transition-all">
          View My Appointments
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">Book Appointment</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">Fill in the details below to request your appointment</p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${i < step ? "bg-emerald-500 text-[var(--color-text-primary)]" : i === step ? "-white" : "bg-[var(--color-surface-3)] text-[var(--color-text-muted)]"}`}>
              {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 transition-all ${i < step ? "bg-emerald-500" : "bg-[var(--color-border)]"}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Select Services */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Select Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map(svc => {
                const sel = selectedServices.find(s => s._id === svc._id);
                return (
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    key={svc._id} 
                    onClick={() => toggleService(svc)}
                    className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${sel ? "border-[var(--color-rose-500)]/60 bg-[var(--color-rose-500)]/5" : "border-[var(--color-border)] bg-[var(--color-surface-card)] hover:border-[var(--color-rose-500)]/30"}`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${sel ? "bg-[var(--color-rose-600)] border-transparent" : "border-[var(--color-border)]"}`}>
                      {sel && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)] text-sm">{svc.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[var(--color-rose-400)] text-sm font-semibold">{formatCurrency(svc.price)}</span>
                        <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-0.5"><Clock className="w-3 h-3" />{svc.duration}min</span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
            <div className="mt-4 rounded-xl bg-[var(--color-surface-card)] border border-dashed border-[var(--color-rose-500)]/40 p-4 space-y-3">
              <div>
                <p className="font-medium text-[var(--color-text-primary)] text-sm">Can't find your service?</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Add a custom request. The owner will review it and decide whether to accept it.</p>
              </div>
              <div className="flex gap-2">
                <input
                  value={customServiceName}
                  onChange={e => setCustomServiceName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomService(); } }}
                  placeholder="e.g. Bridal bun with flowers"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-rose-500)] transition-all text-sm"
                />
                <button type="button" onClick={addCustomService} className="px-4 py-2.5 -white rounded-xl text-sm font-medium">Add</button>
              </div>
            </div>
            {selectedServices.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] flex justify-between items-center">
                <p className="text-sm text-[var(--color-text-muted)]">{selectedServices.length} service{selectedServices.length > 1 ? "s" : ""} · {totalDuration} min {selectedServices.some(s => s.isCustom) ? "· custom request included" : ""}</p>
                <p className="font-bold text-[var(--color-rose-400)]">{formatCurrency(totalAmount)}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 1: Schedule & Notes (Combined) */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div>
              <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Choose Date</h2>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-rose-500)] focus:ring-1 focus:ring-[var(--color-rose-500)]/30 transition-all"
              />
            </div>

            <div>
              <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Choose Time</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {TIME_SLOTS.map(slot => (
                  <button key={slot} onClick={() => setTime(slot)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${time === slot ? "-white" : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-rose-500)]/40"}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Special Instructions <span className="text-[var(--color-text-muted)] font-normal text-sm">(Optional)</span></h2>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Any specific requirements or notes for your appointment..."
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-rose-500)] focus:ring-1 focus:ring-[var(--color-rose-500)]/30 transition-all resize-none"
              />
            </div>
          </motion.div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Choose Payment Method</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {["Cash", "Manual UPI"].map(method => (
                <button key={method} onClick={() => setPaymentMethod(method)}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-2 ${paymentMethod === method ? "border-[var(--color-rose-500)] bg-[var(--color-rose-500)]/5" : "border-[var(--color-border)] bg-[var(--color-surface-card)] hover:border-[var(--color-rose-500)]/30"}`}
                >
                  <CreditCard className={`w-6 h-6 ${paymentMethod === method ? "text-[var(--color-rose-500)]" : "text-[var(--color-text-muted)]"}`} />
                  <span className="font-medium text-[var(--color-text-primary)] text-sm">{method}</span>
                </button>
              ))}
            </div>

            {paymentMethod === "Manual UPI" && (
              <div className="space-y-4 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5">
                <div className="text-center space-y-2 mb-4">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">Pay to Gayatri Beauty Studio</p>
                  <p className="text-xs text-[var(--color-text-muted)]">UPI ID: gayatribeautystudio@upi</p>
                  <div className="w-48 h-48 mx-auto bg-white p-2 rounded-xl border border-[var(--color-border)]">
                    {/* Placeholder QR Code - user can replace later */}
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=gayatribeautystudio@upi&pn=Gayatri%20Beauty%20Studio" alt="UPI QR" className="w-full h-full object-contain rounded-lg" />
                  </div>
                  <p className="text-lg font-bold text-[var(--color-rose-400)] pt-2">Amount: {formatCurrency(totalAmount)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">UTR / Transaction ID *</label>
                  <input
                    value={transactionId}
                    onChange={e => setTransactionId(e.target.value)}
                    placeholder="Enter 12-digit UTR number"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-rose-500)] transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Payment Screenshot (Optional)</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="screenshot-upload"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="screenshot-upload"
                      className="w-full px-4 py-3 rounded-xl border border-dashed border-[var(--color-border)] text-[var(--color-text-secondary)] flex items-center justify-center gap-2 cursor-pointer hover:border-[var(--color-rose-500)]/50 transition-colors"
                    >
                      {isUploading ? (
                        <span className="w-4 h-4 border-2 border-[var(--color-rose-500)]/30 border-t-[var(--color-rose-500)] rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {paymentScreenshot ? "Screenshot Uploaded" : "Upload Screenshot"}
                    </label>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Review & Confirm</h2>
            <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5 space-y-4">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-2">Services</p>
                {selectedServices.map(s => (
                  <div key={s._id} className="flex justify-between py-1.5 text-sm gap-4">
                    <span className="text-[var(--color-text-primary)]">{s.name}{s.isCustom ? " (custom request)" : ""}</span>
                    <span className="text-[var(--color-rose-400)] whitespace-nowrap">{s.isCustom ? "Owner will confirm" : formatCurrency(s.price)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[var(--color-border)] pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Date</span><span className="text-[var(--color-text-primary)]">{date}</span></div>
                <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Time</span><span className="text-[var(--color-text-primary)]">{time}</span></div>
                <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Duration</span><span className="text-[var(--color-text-primary)]">{totalDuration} min</span></div>
                {notes && <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Notes</span><span className="text-[var(--color-text-primary)] text-right max-w-xs">{notes}</span></div>}
              </div>
              <div className="border-t border-[var(--color-border)] pt-3 flex justify-between font-semibold">
                <span className="text-[var(--color-text-primary)]">Total</span>
                <span className="text-[var(--color-rose-400)] text-lg">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="border-t border-[var(--color-border)] pt-3 text-sm flex justify-between">
                <span className="text-[var(--color-text-muted)]">Payment Method</span>
                <span className="text-[var(--color-text-primary)] font-medium">{paymentMethod}</span>
              </div>
              {paymentMethod === "Manual UPI" && (
                <div className="text-sm flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Transaction ID</span>
                  <span className="text-[var(--color-text-primary)]">{transactionId}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-yellow-400 text-sm mt-2">
                <Sparkles className="w-4 h-4" /> You'll earn {glowPointsFromAmount(totalAmount)} Glow Points after completion
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-xl hover:border-[var(--color-rose-500)]/30 hover:text-[var(--color-text-primary)] transition-all">
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext[step]}
            className="flex-1 py-3 -white font-medium rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleBook}
            disabled={isPending}
            className="flex-1 py-3 -white font-semibold rounded-xl transition-all hover:shadow-[var(--shadow-glow-rose)] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? <span className="w-5 h-5 border-2 border-[var(--color-rose-500)]/30 border-t-white rounded-full animate-spin" /> : "Confirm Booking ✨"}
          </button>
        )}
      </div>
    </div>
  );
}
