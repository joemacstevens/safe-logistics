'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

export default function CopilotView() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/copilot/chat',
    }),
  });
  const isGenerating = status === 'submitted' || status === 'streaming';

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage({
      parts: [{ type: 'text', text: input.trim() }],
    });
    setInput('');
  };

  const getMessageText = (message: (typeof messages)[number]) =>
    message.parts
      .map((part) => (part.type === 'text' ? part.text : ''))
      .join('');

  const backgroundImage =
    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCnarRMf_SMUgw_k2g0cNhoR8XI0b762WMRqnuh4ToQp3mKTtf2TaLVf-K4dESGiqJgV_n3wZFEW5RYIDCwOsOUtZ10zy8cUQcDO4fSDZ4nIX3hDAw0Ujq5iapMDYIewa3dXQowE0rkDaRkltQG5V4fn_U5bPypNUpS1xWp1BMDCsR2Stji1SMkjaVv2_T707XxWvp1tNn00WSoemlJJKF8osWJwIrjZwW0FC7LpIukIxlToHuPNY7SmY9mFGxPbPzBUhFAQnzbioo')";

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#050b14] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage }}
      >
        <div className="absolute inset-0 bg-[#050b14]/85 backdrop-blur-lg" />
      </div>

      <div className="relative flex h-full w-full flex-col justify-end">
        <div className="mx-auto flex h-[85vh] max-h-[800px] w-full max-w-3xl flex-col rounded-t-[32px] border border-white/10 bg-white/5 shadow-[0_-20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="flex h-5 items-center justify-center pt-3">
            <div className="h-1 w-10 rounded-full bg-white/30" />
          </div>

          <div className="flex items-center justify-between px-5 pb-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-white/10 text-primary">
              <span className="material-symbols-outlined text-2xl">smart_toy</span>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">SafeLogistics</p>
              <h2 className="text-lg font-bold text-white">✨ Copilot</h2>
            </div>
            <button
              onClick={() => router.back()}
              className="flex size-12 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto px-5 pb-6">
            {messages.length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-slate-300">
                Ask me anything about shows, vendors, or safes.
              </div>
            )}
            {messages.map((message) => {
              const isUser = message.role === 'user';
              const text = getMessageText(message);
              return (
                <div
                  key={message.id}
                  className={`flex w-full gap-3 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isUser && (
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <span className="material-symbols-outlined text-xl">
                        smart_toy
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex max-w-[420px] flex-col gap-2 ${
                      isUser ? 'items-end' : 'items-start'
                    }`}
                  >
                    <span className="text-xs uppercase tracking-widest text-slate-400">
                      {isUser ? 'You' : 'Copilot'}
                    </span>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ring-1 ring-white/10 ${
                        isUser
                          ? 'bg-gradient-to-r from-primary to-[#3ba7ff] text-white'
                          : 'bg-white/5 text-slate-100'
                      }`}
                    >
                      {text}
                    </div>
                  </div>
                  {isUser && (
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-white">
                      <span className="material-symbols-outlined text-lg">person</span>
                    </div>
                  )}
                </div>
              );
            })}
            {isGenerating && (
              <div className="flex gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <span className="material-symbols-outlined text-xl">smart_toy</span>
                </div>
                <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
            className="shrink-0 border-t border-white/10 px-5 py-4"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-3 py-2 backdrop-blur">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="✨ Ask about shows, vendors, or safes…"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                disabled={isGenerating}
              />
              <button
                type="submit"
                disabled={!input.trim() || isGenerating}
                className="flex size-12 items-center justify-center rounded-xl bg-primary text-white shadow-[0_10px_25px_rgba(19,126,236,0.5)] transition hover:bg-primary/90 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
