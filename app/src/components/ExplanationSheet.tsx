import React, { useEffect, useRef } from 'react';
import { ArrowRight, CornerDownRight } from 'lucide-react';
import { DecisionData, OptionData, scenarioData } from '../data/scenario';
import { Choice, Goal } from '../types';

interface ExplanationSheetProps {
  isOpen: boolean;
  decision: DecisionData;
  choice: Choice;
  k1Choice?: Choice;
  userGoal: Goal;
  timedOut: boolean;
  clock: string;
  elapsedMinutes: number;
  onContinue: () => void;
}

export const ExplanationSheet: React.FC<ExplanationSheetProps> = ({
  isOpen,
  decision,
  choice,
  k1Choice,
  userGoal,
  timedOut,
  clock,
  elapsedMinutes,
  onContinue,
}) => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (isOpen) {
      headingRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const option: OptionData = decision.options[choice];
  const isGoalMatch = decision.goal === userGoal;

  // Resolve what text
  let whatText = option.what || '';
  if (decision.id === 'k2' && option.whatByK1 && k1Choice) {
    whatText = option.whatByK1[k1Choice] || whatText;
  }

  // Resolve why text
  let whyText = option.why || '';
  if (decision.id === 'k2' && option.whyByK1 && k1Choice) {
    whyText = option.whyByK1[k1Choice] || whyText;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#14213D]/40 backdrop-blur-[2px] transition-opacity duration-240"
      role="dialog"
      aria-modal="true"
      aria-labelledby="analysis-heading"
    >
      <div className="w-full max-w-[480px] bg-[#FFFDF8] rounded-t-[20px] p-5 pb-6 shadow-sheet max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-240 border-t border-[#D9D3C7]">
        {/* Drag Handle */}
        <div className="w-10 h-1 bg-[#D9D3C7] rounded-full mx-auto mb-4" />

        {/* Timeout banner if decision was auto-made due to time expiry */}
        {timedOut && (
          <div
            data-cy="timeout-banner"
            className="w-full bg-[#FDEEE6] text-[#8A3A10] border border-[#FFDBC9] px-3.5 py-2.5 rounded-[10px] mb-3 text-[13px] font-sans font-medium flex items-center justify-between"
          >
            <span>{scenarioData.timeoutBanner}</span>
          </div>
        )}

        {/* Header line: KARAR ANALİZİ · Code.Choice + T+xx m */}
        <div className="flex items-center justify-between mb-3.5">
          <span className="font-mono text-[11px] font-medium tracking-[0.08em] text-[#A34E12] uppercase">
            KARAR ANALİZİ · {decision.code}.{choice}
          </span>
          <span className="font-mono text-[12px] font-medium text-[#5B6275]">
            T+{elapsedMinutes}m
          </span>
        </div>

        {/* Section: Ne oldu */}
        <div className="mb-4">
          <h2
            id="analysis-heading"
            ref={headingRef}
            tabIndex={-1}
            className="font-serif text-[20px] leading-[26px] font-medium text-[#14213D] mb-1.5 focus:outline-none"
          >
            Ne oldu
          </h2>
          <p
            data-cy="explain-what"
            className="font-mono text-[13px] leading-[20px] text-[#14213D] bg-[#F7F4EE] p-3 rounded-[8px] border border-[#D9D3C7]/60"
          >
            {clock} · {whatText}
          </p>
        </div>

        {/* Section: Neden oldu */}
        <div className="bg-[#F2EEE6] p-4 rounded-[12px] border border-[#D9D3C7]/80 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-serif text-[18px] leading-[24px] font-medium text-[#14213D]">
              Neden oldu
            </h3>
            {isGoalMatch && (
              <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded-[4px] bg-[#14213D]/10 text-[#14213D]">
                Senin hedefin
              </span>
            )}
          </div>

          <p data-cy="explain-why" className="font-sans text-[14px] leading-[22px] text-[#14213D]">
            {whyText}
          </p>

          {/* Goal note box if this decision matches user's goal */}
          {isGoalMatch && option.note && (
            <div
              data-cy="goal-note"
              className="mt-3.5 pt-3 border-t border-[#D9D3C7] flex items-start gap-2 text-[#14213D]"
            >
              <CornerDownRight className="w-4 h-4 text-[#A34E12] shrink-0 mt-0.5" />
              <p className="font-mono text-[12px] leading-[18px]">
                <strong className="font-medium">{decision.noteTitle}:</strong> {option.note}
              </p>
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          data-cy="continue"
          onClick={onContinue}
          className="w-full h-[52px] rounded-[12px] bg-[#14213D] text-[#FFFDF8] font-sans text-[16px] font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-[#14213D]/95 active:translate-y-[1px] transition-all shadow-subtle"
        >
          <span>Devam</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Footer */}
        <p className="font-mono text-[11px] text-[#5B6275] text-center mt-3 uppercase tracking-wider">
          SE PRIMER · POST-MORTEM DOSYASI
        </p>
      </div>
    </div>
  );
};
