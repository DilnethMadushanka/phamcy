import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Send, User, Clock, ShieldCheck, CheckCheck, RefreshCw, Zap, Power } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function SupportAdmin() {
  const [conversations, setConversations] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const handleEndAdminChat = async () => {
    if (!selectedCustomerId) return;
    if (!window.confirm('Are you sure you want to end and clear this customer chat session?')) return;
    try {
      await api.endChat(selectedCustomerId);
      setMessages([]);
      setSelectedCustomerId(null);
      toast.success('🎉 Customer live chat session ended.');
      fetchConversations();
    } catch (err) {
      toast.error('Failed to end chat session.');
    }
  };

  // Fetch all active customer conversations
  const fetchConversations = async () => {
    try {
      const data = await api.getSupportConversations();
      if (Array.isArray(data)) {
        setConversations(data);
        // Auto-select first conversation if none selected
        if (!selectedCustomerId && data.length > 0) {
          setSelectedCustomerId(data[0].customer_id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch support conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected customer
  const fetchThreadMessages = async (custId) => {
    if (!custId) return;
    try {
      const data = await api.getChatMessages(custId);
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch thread messages:', err);
    }
  };

  // Poll conversations & active thread every 3s
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      fetchConversations();
      if (selectedCustomerId) {
        fetchThreadMessages(selectedCustomerId);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedCustomerId]);

  // When selected customer changes, load messages and mark thread read
  useEffect(() => {
    if (selectedCustomerId) {
      fetchThreadMessages(selectedCustomerId);
      api.markChatRead(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  // Auto scroll to bottom of chat window
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendReply = async (e) => {
    e?.preventDefault();
    if (!replyText.trim() || !selectedCustomerId) return;

    const textToSend = replyText.trim();
    setReplyText('');
    setSending(true);

    try {
      const newMsg = await api.sendChatMessage(textToSend, selectedCustomerId);
      setMessages((prev) => [...prev, newMsg]);
      fetchConversations();
    } catch (err) {
      toast.error(err.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleCannedTemplate = (text) => {
    setReplyText(text);
  };

  const selectedConv = conversations.find((c) => c.customer_id === selectedCustomerId);

  const filteredConversations = conversations.filter((c) =>
    (c.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.customer_email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 p-6 rounded-3xl text-white shadow-lg border border-blue-800">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <MessageSquare className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider text-white">Live Support &amp; Consultation Desk</h1>
            <p className="text-xs text-blue-200 font-semibold">Real-time Pharmacist &amp; Staff Chat Support Console</p>
          </div>
        </div>

        <button
          onClick={fetchConversations}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Threads
        </button>
      </div>

      {/* ── Main Workspace: Left List + Right Chat ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[640px]">
        {/* Left Panel: Conversation List */}
        <div className="lg:col-span-4 glassy-product-card p-4 flex flex-col h-full border border-blue-100">
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search customer threads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-blue-50/50 border border-blue-200/80 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
            {loading && conversations.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Loading customer threads...</p>
            ) : filteredConversations.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No chat conversations found.</p>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.customer_id === selectedCustomerId;
                return (
                  <div
                    key={conv.customer_id}
                    onClick={() => setSelectedCustomerId(conv.customer_id)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md'
                        : 'bg-white/80 hover:bg-blue-50/80 border-blue-100 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-extrabold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {conv.customer_name}
                      </span>
                      {conv.unread_count > 0 && (
                        <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
                          {conv.unread_count} NEW
                        </span>
                      )}
                    </div>
                    <p className={`text-[10.5px] truncate font-medium ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                      {conv.last_message || 'Started chat session'}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/20 text-[9px]">
                      <span className={isSelected ? 'text-blue-200 font-semibold' : 'text-slate-400'}>
                        {conv.customer_email}
                      </span>
                      <span className={isSelected ? 'text-blue-200' : 'text-slate-400'}>
                        {new Date(conv.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Chat Window */}
        <div className="lg:col-span-8 glassy-product-card p-0 flex flex-col h-full overflow-hidden border border-blue-100">
          {selectedCustomerId ? (
            <>
              {/* Chat Thread Header */}
              <div className="p-4 bg-gradient-to-r from-blue-50 via-sky-50 to-blue-50 border-b border-blue-200/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                    {selectedConv?.customer_name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{selectedConv?.customer_name}</h3>
                    <p className="text-[10px] text-blue-700 font-bold flex items-center gap-2">
                      <span>{selectedConv?.customer_email}</span>
                      <span>• Customer ID: #{selectedCustomerId}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active Live Session
                  </div>

                  <button
                    onClick={handleEndAdminChat}
                    title="End and clear chat thread for this customer"
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider cursor-pointer shadow-2xs transition-all flex items-center gap-1.5"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>End Chat Session</span>
                  </button>
                </div>
              </div>

              {/* Chat Thread Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar bg-gradient-to-b from-blue-50/20 via-sky-50/10 to-blue-50/20">
                {messages.map((msg) => {
                  const isCustomer = msg.sender_role === 'Customer';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'} space-y-1`}
                    >
                      <div className="flex items-center gap-1.5 px-1">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase">
                          {isCustomer ? `${msg.sender_name} (Customer)` : `Pharmacist / Staff (${msg.sender_name})`}
                        </span>
                        <span className="text-[8px] text-slate-400 font-medium">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed shadow-2xs ${
                          isCustomer
                            ? 'bg-white border border-blue-200 text-slate-900 rounded-bl-none shadow-xs'
                            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-br-none'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Canned Templates */}
              <div className="px-4 py-2 bg-blue-50/40 border-t border-blue-100 overflow-x-auto flex gap-2 custom-scrollbar">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase self-center shrink-0 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" /> Templates:
                </span>
                <button
                  onClick={() => handleCannedTemplate('Hello! Your prescription has been reviewed and verified by our pharmacist.')}
                  className="text-[9.5px] font-extrabold text-blue-700 bg-white hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer"
                >
                  ✅ Prescription Verified
                </button>
                <button
                  onClick={() => handleCannedTemplate('Your express campus order has been dispatched and is on the way!')}
                  className="text-[9.5px] font-extrabold text-blue-700 bg-white hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer"
                >
                  🚚 Order Dispatched
                </button>
                <button
                  onClick={() => handleCannedTemplate('Thank you for reaching out to Fouad Pharmacies! Is there anything else I can assist with?')}
                  className="text-[9.5px] font-extrabold text-blue-700 bg-white hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer"
                >
                  💬 Closing Thanks
                </button>
              </div>

              {/* Reply Input Box */}
              <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-blue-100 flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Type your reply to customer..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-blue-50/50 border border-blue-200/80 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md disabled:opacity-50 transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>Send Reply</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <MessageSquare className="w-12 h-12 text-blue-300 stroke-1" />
              <p className="text-sm font-extrabold text-slate-600">Select a customer thread from the left panel to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
