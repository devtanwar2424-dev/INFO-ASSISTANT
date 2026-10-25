'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am Info Assistant. How can I help you with our available courses, fee details, or admission guidelines today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply, sources: data.sources }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'An error occurred while connecting. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 md:p-6 bg-[#fbfbfa] text-[#2c2c2c]">
      {/* Warm & Professional Header */}
      <header className="mb-4 flex items-center justify-between py-3 px-6 bg-[#f5f2eb] shadow-sm rounded-2xl border border-[#e6e1d6]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#5c6b73] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            IA
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#3c3836] leading-tight">Info Assistant</h1>
            <p className="text-xs text-[#7c7368] font-medium">Knowledge Base Support System</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-[#eef3ed] border border-[#d8e5d5] px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-emerald-700">Online</span>
        </div>
      </header>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 md:p-6 bg-[#f7f5ef] rounded-2xl shadow-sm border border-[#e6e1d6]">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                msg.role === 'user'
                  ? 'bg-[#5c6b73] text-white rounded-br-none font-medium'
                  : 'bg-white text-[#2d3748] rounded-bl-none border border-[#e2dcd0]'
              }`}
            >
              {msg.content}
            </div>
            {msg.sources && msg.sources.length > 0 && (
              <span className="text-[10px] text-[#9c9388] mt-1 px-1 tracking-wider">
                Source: {msg.sources.join(', ')}
              </span>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="text-xs text-[#8c8275] italic px-2 animate-pulse">
            Info Assistant is retrieving your data...
          </div>
        )}
      </div>

      {/* Natural & Muted Action Buttons Matching Existing KB Files */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <button
          onClick={() => handleSend('Which courses are available?')}
          className="p-3 text-xs md:text-sm font-semibold bg-[#f5f0eb] text-[#4a4039] rounded-xl shadow-sm hover:bg-[#eae2d8] transition-all duration-200 text-center border border-[#dfd6cb] active:scale-95"
        >
          📚 View Available Courses
        </button>
        <button
          onClick={() => handleSend('Can you tell me about the fees structure?')}
          className="p-3 text-xs md:text-sm font-semibold bg-[#f5f0eb] text-[#4a4039] rounded-xl shadow-sm hover:bg-[#eae2d8] transition-all duration-200 text-center border border-[#dfd6cb] active:scale-95"
        >
          💳 Check Fee Details
        </button>
        <button
          onClick={() => handleSend('What are the admission requirements?')}
          className="p-3 text-xs md:text-sm font-semibold bg-[#f5f0eb] text-[#4a4039] rounded-xl shadow-sm hover:bg-[#eae2d8] transition-all duration-200 text-center border border-[#dfd6cb] active:scale-95"
        >
          📋 Admission Guidelines
        </button>
      </div>

      {/* Sleek Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2 bg-[#f5f2eb] p-2 rounded-2xl border border-[#e6e1d6] shadow-sm"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a specific question (e.g., fee or duration)..."
          className="flex-1 px-4 py-3 text-sm focus:outline-none text-[#2c2c2c] placeholder-[#9c9388] bg-transparent rounded-xl"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-[#5c6b73] text-white text-sm font-semibold rounded-xl hover:bg-[#4a555c] transition shadow-md disabled:opacity-50 active:scale-95"
        >
          Send
        </button>
      </form>
    </div>
  );
}