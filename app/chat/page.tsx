"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Sparkles, User, Settings, HelpCircle } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { sender: "assistant", text: "Hello Ali. I am JomLuah Assistant. Feel free to express whatever is on your mind. How are you holding up today?" },
    { sender: "user", text: "I'm having a hard time balancing PSM documentation and preparing for finals. Feeling very anxious." },
    { sender: "assistant", text: "It sounds like you're carrying a heavy load right now. Managing both graduation projects and exams at the same time is highly stressful. Have you tried breaking them down, or does the whole picture feel overwhelming?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");
    
    // Simulate simple response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        sender: "assistant",
        text: "[Placeholder AI response based on pgvector context retrieval and empathetic cognitive restructuring]"
      }]);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white text-black font-mono border-4 md:border-8 border-black p-4 md:p-6 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b-4 border-black pb-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="border-2 border-black p-2 hover:bg-neutral-100 transition flex items-center gap-1 text-xs font-bold uppercase">
            <ArrowLeft className="w-4 h-4" /> Hub
          </Link>
          <div>
            <h1 className="text-xl font-black uppercase">[ Empathetic Chat AI ]</h1>
            <p className="text-[10px] text-neutral-600">// Active session // LLM context via OpenRouter</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="border-2 border-black p-2 hover:bg-neutral-100 transition text-xs font-bold uppercase flex items-center gap-1">
            <Settings className="w-4 h-4" /> Options
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="my-6 flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Context / Past sessions */}
        <section className="border-4 border-black p-4 space-y-4 lg:col-span-1 hidden lg:block">
          <h2 className="text-xs font-bold uppercase tracking-wider">// RAG Memory Indexes</h2>
          <div className="space-y-2 text-xs">
            <div className="border border-black p-2 bg-neutral-100 font-bold uppercase">
              Current Session
            </div>
            <div className="border border-neutral-300 p-2 text-neutral-500 hover:border-black hover:text-black cursor-pointer transition">
              Session: 12 June 2026
            </div>
            <div className="border border-neutral-300 p-2 text-neutral-500 hover:border-black hover:text-black cursor-pointer transition">
              Session: 08 June 2026
            </div>
            <div className="border border-neutral-300 p-2 text-neutral-500 hover:border-black hover:text-black cursor-pointer transition text-center border-dashed">
              + New Session
            </div>
          </div>

          <div className="border-2 border-black p-3 bg-neutral-50 text-[10px] space-y-1.5">
            <div className="flex items-center gap-1 font-bold text-neutral-800">
              <Sparkles className="w-3.5 h-3.5" /> pgvector RAG Active
            </div>
            <p className="text-neutral-600">Past journal logs are embedded and automatically retrieved if semantically matched to your message query.</p>
          </div>
        </section>

        {/* Right Column: Active Chat Area */}
        <section className="lg:col-span-3 border-4 border-black p-4 flex flex-col justify-between bg-neutral-50">
          {/* Messages Wrapper */}
          <div className="space-y-4 flex-grow overflow-y-auto mb-4 p-2 max-h-[50vh]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[80%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div className={`w-8 h-8 border-2 border-black flex items-center justify-center font-bold text-xs shrink-0 ${
                  msg.sender === "user" ? "bg-black text-white" : "bg-white text-black"
                }`}>
                  {msg.sender === "user" ? "U" : "AI"}
                </div>
                <div className={`border-2 border-black p-3 text-xs leading-relaxed ${
                  msg.sender === "user" ? "bg-white text-black" : "bg-neutral-100 text-black"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Form Input */}
          <form onSubmit={handleSend} className="flex gap-2 border-t-2 border-black pt-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell JomLuah what's on your mind... (Malay/English)"
              className="flex-grow border-2 border-black p-3 outline-none focus:bg-white text-xs bg-white"
            />
            <button
              type="submit"
              className="border-4 border-black bg-black text-white px-6 hover:bg-white hover:text-black transition flex items-center justify-center font-bold uppercase text-xs"
            >
              Send <Send className="w-3.5 h-3.5 ml-2" />
            </button>
          </form>
        </section>
      </main>

      {/* Footer Info */}
      <footer className="text-xs text-neutral-500 flex justify-between border-t-2 border-black pt-2">
        <span>*Conversation is encrypted. Standard UTHM PCU protocols.</span>
        <span>LLM: llama-3.1-70b via OpenRouter</span>
      </footer>
    </div>
  );
}
