import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, ShieldCheck, User, Clock, Sparkles, Power } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function SupportChatWidget() {
  const { user, setShowAuthModal, setAuthModalMode } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  const handleEndChat = async () => {
    if (!window.confirm('Are you sure you want to end and clear this live chat session?')) return;
    try {
      await api.endChat();
      setMessages([]);
      setUnreadCount(0);
      toast.success('🎉 Chat session ended.');
    } catch (err) {
      toast.error('Failed to end chat session.');
    }
  };

  const fetchMessages = async () => {
    if (!user) return;
    try {
      const data = await api.getChatMessages();
      if (Array.isArray(data)) {
        setMessages(data);

        // Count unread staff messages when widget is closed
        if (!isOpen) {
          const unread = data.filter((m) => m.sender_role !== 'Customer' && !m.is_read).length;
          setUnreadCount(unread);
        }
      }
    } catch (err) {
      console.error('Failed to fetch support chat messages:', err);
    }
  };

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (user) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [user, isOpen]);

  // Scroll to bottom of chat window
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (unreadCount > 0) {
        api.markChatRead();
        setUnreadCount(0);
      }
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const token = localStorage.getItem('pharmacy_token');
    if (!user || !token) {
      toast.error('Please sign in to chat with a pharmacist!', { icon: '🔐' });
      setAuthModalMode('login');
      setShowAuthModal(true);
      return;
    }

    const textToSend = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      const newMsg = await api.sendChatMessage(textToSend);
      setMessages((prev) => [...prev, newMsg]);
    } catch (err) {
      if (err.message.includes('token') || err.message.includes('Unauthorized') || err.message.includes('401')) {
        toast.error('Session expired. Please sign in again.', { icon: '🔐' });
        setAuthModalMode('login');
        setShowAuthModal(true);
      } else {
        toast.error(err.message || 'Failed to send message');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickChip = (text) => {
    setInputText(text);
  };

  // Listen for global open-live-chat event
  useEffect(() => {
    const handleOpenEvent = () => setIsOpen(true);
    window.addEventListener('open-live-chat', handleOpenEvent);
    return () => window.removeEventListener('open-live-chat', handleOpenEvent);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* ── Widget Trigger Button ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => {
              if (!user) {
                toast('Sign in to chat with our online Pharmacist!', { icon: '💬' });
                setAuthModalMode('login');
                setShowAuthModal(true);
                return;
              }
              setIsOpen(true);
            }}
            className="bubble-glass-card p-4 rounded-full shadow-2xl flex items-center justify-center text-blue-700 hover:text-blue-800 cursor-pointer relative group border-2 border-white hover:scale-110 active:scale-95 transition-all bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700"
            title="Live Pharmacist Support"
          >
            <MessageCircle className="w-7 h-7 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -left-2 bg-rose-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                {unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Live Support Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-[360px] sm:w-[400px] h-[520px] bubble-glass-card rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/90"
          >
            {/* Window Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white border border-white/40">
                    <ShieldCheck className="w-5 h-5 text-blue-100" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-blue-600" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                    Fouad Pharmacist Live Support
                  </h3>
                  <p className="text-[10px] text-blue-100 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Online & Ready to Help
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {messages.length > 0 && (
                  <button
                    onClick={handleEndChat}
                    title="End & Clear Chat Session"
                    className="px-2 py-1 rounded-lg bg-rose-500/30 hover:bg-rose-500/50 text-white text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer border border-white/20"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">End Chat</span>
                  </button>
                )}

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gradient-to-b from-blue-50/40 via-sky-50/20 to-blue-50/40">
              {/* Intro Banner */}
              <div className="p-3 bg-white/80 backdrop-blur-md border border-blue-100 rounded-2xl text-center space-y-1 shadow-2xs">
                <div className="inline-flex items-center gap-1 text-[10px] font-black text-blue-700 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  <Sparkles className="w-3 h-3 text-blue-600" /> Instant Medical & Store Assistance
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Welcome to Fouad Pharmacies! How can our pharmacist team help you today?
                </p>
              </div>

              {messages.length === 0 && (
                <div className="text-center py-6 space-y-2 text-slate-400">
                  <MessageCircle className="w-8 h-8 mx-auto text-blue-300 stroke-1" />
                  <p className="text-xs font-semibold text-slate-500">No messages yet. Send a query below!</p>
                </div>
              )}

              {messages.map((msg) => {
                const isMe = msg.sender_role === 'Customer';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-1.5 px-1">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase">
                        {isMe ? 'You' : `${msg.sender_role || 'Staff'} (${msg.sender_name})`}
                      </span>
                      <span className="text-[8px] text-slate-400 font-medium">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs font-medium leading-relaxed shadow-2xs ${
                        isMe
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none'
                          : 'bg-white border border-blue-100 text-slate-900 rounded-bl-none shadow-xs'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Chips */}
            <div className="px-3 py-2 bg-white/70 backdrop-blur-md border-t border-blue-100/60 overflow-x-auto flex gap-1.5 custom-scrollbar">
              <button
                onClick={() => handleQuickChip('Can I consult a pharmacist for prescription advice?')}
                className="text-[9.5px] font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer"
              >
                💊 Prescription Help
              </button>
              <button
                onClick={() => handleQuickChip('How do I track my campus express delivery?')}
                className="text-[9.5px] font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer"
              >
                🚚 Track Delivery
              </button>
              <button
                onClick={() => handleQuickChip('What skincare products do you recommend?')}
                className="text-[9.5px] font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer"
              >
                ✨ Skincare Advice
              </button>
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-blue-100 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message to pharmacist..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-blue-50/60 border border-blue-200/80 rounded-full text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center shadow-md disabled:opacity-50 transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
