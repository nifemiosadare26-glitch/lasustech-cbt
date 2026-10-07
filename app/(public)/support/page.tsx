"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Bot } from "lucide-react";

export default function SupportChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, role: "agent", text: "Hello! You've reached LASUSTECH CBT Support. How can we help you today?", time: "09:00 AM" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const newMsg = { id: Date.now(), role: "user", text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, newMsg]);
    setInput("");

    // Simulate agent typing and replying
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "agent",
        text: "An invigilator or support staff will respond to your query shortly. Please keep this window open.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-[56px] bg-white border-b border-slate-200 flex items-center px-6 shrink-0">
        <span className="font-bold text-blue-900 tracking-tight">LASUSTECH CBT</span>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 flex flex-col h-[calc(100vh-56px)]">
        <div className="shrink-0 mb-4">
          <Link href="/student" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
            <ArrowLeft size={16} className="mr-2" />
            Back to dashboard
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Bot size={20} />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Live Support</h1>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Agents are online
              </p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "ml-auto items-end" : "items-start"}`}>
                <div className={`p-3 rounded-2xl ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"}`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 font-medium px-1">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400"
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} className="-ml-0.5" />
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}
