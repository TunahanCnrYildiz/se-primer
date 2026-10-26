import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowUp, HelpCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import { scenarioData } from '../data/scenario';

interface TutorSheetProps {
  isOpen: boolean;
  clock: string;
  messages: ChatMessage[];
  isLoading: boolean;
  onClose: () => void;
  onRequestHint: () => void;
  onSendMessage: (text: string) => void;
}

export const TutorSheet: React.FC<TutorSheetProps> = ({
  isOpen,
  clock,
  messages,
  isLoading,
  onClose,
  onRequestHint,
  onSendMessage,
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (isOpen) {
      headingRef.current?.focus();
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, isLoading]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInputValue('');
  };

  const dividerText = scenarioData.tutor.divider.replace('{time}', clock);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#14213D]/40 backdrop-blur-[2px] transition-opacity duration-240"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutor-heading"
    >
      <div className="w-full max-w-[480px] h-[72vh] bg-[#FFFDF8] rounded-t-[20px] shadow-sheet flex flex-col border-t border-[#D9D3C7] animate-in slide-in-from-bottom duration-240">
        {/* Drag Handle */}
        <div className="w-10 h-1 bg-[#D9D3C7] rounded-full mx-auto mt-3 mb-2 shrink-0" />

        {/* Top Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-[#D9D3C7]/60 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#A34E12] inline-block" />
            <h2
              id="tutor-heading"
              ref={headingRef}
              tabIndex={-1}
              className="font-mono text-[11px] font-medium tracking-[0.08em] text-[#14213D] uppercase focus:outline-none"
            >
              {scenarioData.tutor.header}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5B6275] hover:bg-[#F2EEE6] active:bg-[#E8E2D5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* System Protocol Divider */}
          <div className="flex justify-center">
            <span className="font-mono text-[11px] font-medium px-3 py-1 rounded-full bg-[#F2EEE6] text-[#5B6275] shadow-subtle border border-[#D9D3C7]/40">
              {dividerText}
            </span>
          </div>

          {/* Messages */}
          {messages.map((msg) => {
            if (msg.sender === 'user') {
              return (
                <div key={msg.id} className="flex flex-col items-end">
                  <div className="bg-[#14213D] text-[#FFFDF8] px-4 py-2.5 rounded-[14px] rounded-tr-sm max-w-[85%] text-[14px] leading-[22px] font-sans shadow-subtle break-words">
                    {msg.text}
                  </div>
                  <span className="font-mono text-[11px] text-[#5B6275] mt-1 pr-1">
                    {msg.time} · Sen
                  </span>
                </div>
              );
            }

            return (
              <div key={msg.id} className="flex flex-col items-start">
                <div
                  data-cy="tutor-msg"
                  className="bg-[#FFFDF8] border border-[#D9D3C7] text-[#14213D] px-4 py-2.5 rounded-[14px] rounded-tl-sm max-w-[88%] text-[14px] leading-[22px] font-sans shadow-subtle break-words"
                >
                  {msg.text}
                </div>
                <span className="font-mono text-[11px] text-[#A34E12] mt-1 pl-1 font-medium">
                  {msg.time} · Tutor
                </span>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex flex-col items-start">
              <div className="bg-[#FFFDF8] border border-[#D9D3C7] text-[#14213D] px-4 py-3 rounded-[14px] rounded-tl-sm shadow-subtle flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5B6275] animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#5B6275] animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#5B6275] animate-bounce" />
              </div>
              <span className="font-mono text-[11px] text-[#A34E12] mt-1 pl-1 font-medium">
                {clock} · Tutor
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 bg-[#FFFDF8] border-t border-[#D9D3C7]/80 shrink-0 space-y-2.5">
          {/* Quick Action Pill & Status */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              data-cy="tutor-hint"
              onClick={onRequestHint}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-full bg-[#F2EEE6] hover:bg-[#E8E2D5] active:bg-[#DFD8C9] border border-[#D9D3C7] text-[#14213D] font-mono text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-subtle"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#A34E12]" />
              <span>{scenarioData.tutor.hintButton}</span>
            </button>
            <span className="font-mono text-[11px] text-[#5B6275] font-medium">
              {scenarioData.tutor.status}
            </span>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              data-cy="tutor-input"
              maxLength={500}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={scenarioData.tutor.placeholder}
              disabled={isLoading}
              className="flex-1 h-[44px] px-3.5 rounded-[12px] bg-[#F7F4EE] border border-[#D9D3C7] font-sans text-[14px] text-[#14213D] placeholder-[#5B6275] focus:outline-none focus:border-[#14213D] focus:bg-[#FFFDF8] transition-colors"
            />
            <button
              type="submit"
              data-cy="tutor-send"
              disabled={!inputValue.trim() || isLoading}
              className="w-[44px] h-[44px] rounded-[12px] bg-[#14213D] text-[#FFFDF8] flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40 hover:bg-[#14213D]/90 active:translate-y-[1px] transition-all shadow-subtle"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
