import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, User, ShieldAlert, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function AIConsultant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello gorgeous! 👑 I am your personal Gayatri Beauty AI Consultant. Ask me anything about skincare, haircare, makeup, or find the perfect treatment for your next booking!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const playChime = (type) => {
    // Soft, premium notification chimes
    const url = type === "send"
      ? "https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav"
      : "https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav";
    const audio = new Audio(url);
    audio.volume = 0.2;
    audio.play().catch(() => {});
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    playChime("send");

    try {
      // Send message history to the backend
      const res = await api.post("/ai/chat", {
        messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
      });

      if (res.success) {
        setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }]);
        playChime("receive");
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      console.error("AI Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, Queen. My beauty connection is currently fluctuating. Please try asking again shortly! 💖",
          isError: true
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to parse message text and extract recommended service links
  const renderMessageContent = (msg) => {
    const text = msg.content;
    const regex = /\[([^\]]+)\]\(service-id:([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    // Find all matches for service recommendations
    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      // Add text leading up to the match
      if (matchIndex > lastIndex) {
        parts.push(<span key={lastIndex}>{text.substring(lastIndex, matchIndex)}</span>);
      }

      const serviceName = match[1];
      const serviceId = match[2];

      // Add clickable service button card
      parts.push(
        <span key={matchIndex} className="block my-3">
          <span className="inline-flex flex-col p-4 bg-gradient-to-br from-amber-950/60 to-purple-950/60 border border-yellow-500/30 rounded-2xl shadow-lg relative overflow-hidden w-full backdrop-blur-md">
            <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Recommended Treatment
            </span>
            <span className="font-display font-bold text-white text-sm mb-3">
              {serviceName}
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate(`/book?service=${serviceId}`);
              }}
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-amber-950 font-bold rounded-xl text-xs transition-all hover:scale-[1.02] cursor-pointer shadow-md"
            >
              <Calendar className="w-3.5 h-3.5" />
              Book This Service
            </button>
          </span>
        </span>
      );

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(<span key={lastIndex}>{text.substring(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <>
      {/* Floating launcher button */}
      <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-2 pointer-events-none">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-[var(--color-rose-500)] to-purple-600 text-white flex items-center justify-center shadow-[0_0_25px_rgba(244,63,94,0.5)] hover:shadow-[0_0_35px_rgba(244,63,94,0.7)] transition-all pointer-events-auto cursor-pointer hover:scale-105 active:scale-95 relative group border border-white/20"
              aria-label="Chat with AI Consultant"
            >
              <Sparkles className="w-6 h-6 animate-pulse group-hover:scale-110 transition-transform" />
              <span className="absolute right-16 bg-black/80 text-white text-xs px-3 py-1.5 rounded-xl font-bold border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">
                AI Beauty Consultant 👑
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-6 right-6 w-[360px] sm:w-[400px] h-[550px] z-[99] rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-yellow-500/30 flex flex-col bg-slate-950/95 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[var(--color-rose-500)] via-purple-600 to-purple-800 text-white flex items-center justify-between border-b border-white/10 relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm tracking-wide">
                    Gayatri AI Consultant
                  </h3>
                  <span className="text-[10px] text-rose-200 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                    Always Online 👑
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role !== "user" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-amber-950 shrink-0 text-xs font-bold shadow-md">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-[var(--color-rose-500)] to-purple-600 text-white rounded-tr-none shadow-md font-medium"
                        : msg.isError
                        ? "bg-red-500/10 border border-red-500/30 text-red-200 rounded-tl-none"
                        : "bg-white/5 border border-white/10 text-gray-100 rounded-tl-none"
                    }`}
                  >
                    {renderMessageContent(msg)}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 text-xs">
                      <User className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-amber-950 shrink-0 text-xs font-bold shadow-md">
                    AI
                  </div>
                  <div className="bg-white/5 border border-white/10 text-gray-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-black/40 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask skincare/haircare advice..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400/50 transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-amber-950 flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
