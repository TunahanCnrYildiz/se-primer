import { useState, useTransition } from 'react';
import { Screen, Level, Role, Goal, Choice, GameChoices, ChatMessage } from './types';
import { scenarioData } from './data/scenario';
import { calculateClock, calculateTotalElapsedMinutes, getDecisionMinutes, BASE_START_MINUTES, formatTime } from './utils/time';
import { OnboardingScreen } from './components/OnboardingScreen';
import { SceneScreen } from './components/SceneScreen';
import { ExplanationSheet } from './components/ExplanationSheet';
import { TutorSheet } from './components/TutorSheet';
import { EndingScreen } from './components/EndingScreen';
import { askTutor } from './services/tutor';

export default function App() {
  const [, startTransition] = useTransition();

  // Navigation State
  const [screen, setScreen] = useState<Screen>('onboarding');

  // Player Profile State (retained across replay)
  const [level, setLevel] = useState<Level | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);

  // Gameplay State
  const [decisionIndex, setDecisionIndex] = useState<number>(0);
  const [choices, setChoices] = useState<GameChoices>({});
  const [violation, setViolation] = useState<boolean>(false);

  // Explanation sheet state
  const [isExplanationOpen, setIsExplanationOpen] = useState<boolean>(false);
  const [currentChoice, setCurrentChoice] = useState<Choice | null>(null);
  const [timedOut, setTimedOut] = useState<boolean>(false);

  // AI Tutor state
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);
  const [tutorMessages, setTutorMessages] = useState<ChatMessage[]>([]);
  const [hintCounters, setHintCounters] = useState<Record<string, number>>({
    k1: 0,
    k2: 0,
    k3: 0,
  });
  const [isTutorLoading, setIsTutorLoading] = useState<boolean>(false);

  const currentDecision = scenarioData.decisions[decisionIndex];

  // Current clock before this decision was finalized
  const currentSceneClock = calculateClock(choices);

  // Clock including current decision (used inside explanation sheet)
  const previewChoices: GameChoices = {
    ...choices,
    ...(currentDecision.id === 'k1' ? { k1: currentChoice || 'A' } : {}),
    ...(currentDecision.id === 'k2' ? { k2: currentChoice || 'A' } : {}),
    ...(currentDecision.id === 'k3' ? { k3: currentChoice || 'A' } : {}),
  };
  const explanationClock = calculateClock(previewChoices);
  const explanationElapsed = calculateTotalElapsedMinutes(previewChoices);

  // Start game from Onboarding
  const handleStartGame = () => {
    if (!level || !role || !goal) return;
    setChoices({});
    setViolation(false);
    setDecisionIndex(0);
    setCurrentChoice(null);
    setTimedOut(false);
    setIsExplanationOpen(false);
    setIsTutorOpen(false);
    setTutorMessages([]);
    setHintCounters({ k1: 0, k2: 0, k3: 0 });
    startTransition(() => {
      setScreen('scene');
    });
  };

  // Called when player selects option A or B (or 60s timeout fires option B)
  const handleSelectChoice = (choice: Choice, isTimeout: boolean) => {
    setCurrentChoice(choice);
    setTimedOut(isTimeout);

    // Record choice
    const updatedChoices: GameChoices = {
      ...choices,
      [currentDecision.id]: choice,
    };
    setChoices(updatedChoices);

    if (currentDecision.id === 'k3' && choice === 'B') {
      setViolation(true);
    }

    setIsExplanationOpen(true);
  };

  // Called when player clicks "Devam →" in ExplanationSheet
  const handleContinueFromExplanation = () => {
    setIsExplanationOpen(false);
    setCurrentChoice(null);
    setTimedOut(false);

    if (decisionIndex < scenarioData.decisions.length - 1) {
      // Advance to next decision
      setDecisionIndex((prev) => prev + 1);
    } else {
      // Finished all 3 decisions, advance to ending screen
      startTransition(() => {
        setScreen('ending');
      });
    }
  };

  // Tutor handlers
  const handleRequestTutorHint = async () => {
    if (isTutorLoading || !level || !role) return;

    setIsTutorLoading(true);
    const currentCounter = hintCounters[currentDecision.id] || 0;

    const result = await askTutor({
      decision: currentDecision,
      decisionId: currentDecision.id,
      k1Choice: choices.k1 ?? null,
      level,
      role,
      isHintRequest: true,
      hintIndex: currentCounter,
    });

    setHintCounters((prev) => ({
      ...prev,
      [currentDecision.id]: currentCounter + 1,
    }));
    setIsTutorLoading(false);

    const nowMinutes = BASE_START_MINUTES + calculateTotalElapsedMinutes(choices);
    const timeFormatted = formatTime(nowMinutes);

    setTutorMessages((prev) => [
      ...prev,
      {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: result.text,
        time: timeFormatted,
      },
    ]);
  };

  const handleSendTutorMessage = async (userText: string) => {
    if (isTutorLoading || !level || !role) return;

    const nowMinutes = BASE_START_MINUTES + calculateTotalElapsedMinutes(choices);
    const timeFormatted = formatTime(nowMinutes);

    // Append user message immediately
    setTutorMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: userText,
        time: timeFormatted,
      },
    ]);

    setIsTutorLoading(true);
    const currentCounter = hintCounters[currentDecision.id] || 0;

    const result = await askTutor({
      decision: currentDecision,
      decisionId: currentDecision.id,
      k1Choice: choices.k1 ?? null,
      level,
      role,
      userQuestion: userText,
      isHintRequest: false,
      hintIndex: currentCounter,
    });

    if (result.isFallback) {
      setHintCounters((prev) => ({
        ...prev,
        [currentDecision.id]: currentCounter + 1,
      }));
    }

    setIsTutorLoading(false);

    setTutorMessages((prev) => [
      ...prev,
      {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: result.text,
        time: timeFormatted,
      },
    ]);
  };

  // Replay handler (KÖ-6):
  // Resets choices, clock and violation, but keeps level, role and goal pre-selected!
  const handleReplay = () => {
    setChoices({});
    setViolation(false);
    setDecisionIndex(0);
    setCurrentChoice(null);
    setTimedOut(false);
    setIsExplanationOpen(false);
    setIsTutorOpen(false);
    setTutorMessages([]);
    setHintCounters({ k1: 0, k2: 0, k3: 0 });
    startTransition(() => {
      setScreen('onboarding');
    });
  };

  const finalClock = calculateClock(choices);
  const finalMttr = calculateTotalElapsedMinutes(choices);

  return (
    <main className="min-h-screen w-full bg-[#F7F4EE] flex justify-center text-[#14213D] selection:bg-[#F0A35A]/30">
      <div className="w-full max-w-[480px] min-h-screen bg-[#F7F4EE] relative flex flex-col">
        {screen === 'onboarding' && (
          <OnboardingScreen
            level={level}
            role={role}
            goal={goal}
            onSelectLevel={setLevel}
            onSelectRole={setRole}
            onSelectGoal={setGoal}
            onStart={handleStartGame}
          />
        )}

        {screen === 'scene' && level && role && goal && (
          <>
            <SceneScreen
              decisionIndex={decisionIndex}
              decision={currentDecision}
              k1Choice={choices.k1}
              profile={{ level, role, goal }}
              clock={currentSceneClock}
              onSelectChoice={handleSelectChoice}
              onOpenTutor={() => setIsTutorOpen(true)}
            />

            {/* Explanation Sheet (overlaying current scene) */}
            {currentChoice && (
              <ExplanationSheet
                isOpen={isExplanationOpen}
                decision={currentDecision}
                choice={currentChoice}
                k1Choice={choices.k1}
                userGoal={goal}
                timedOut={timedOut}
                clock={explanationClock}
                elapsedMinutes={explanationElapsed}
                onContinue={handleContinueFromExplanation}
              />
            )}

            {/* Tutor Sheet (overlaying current scene) */}
            <TutorSheet
              isOpen={isTutorOpen}
              clock={currentSceneClock}
              messages={tutorMessages}
              isLoading={isTutorLoading}
              onClose={() => setIsTutorOpen(false)}
              onRequestHint={handleRequestTutorHint}
              onSendMessage={handleSendTutorMessage}
            />
          </>
        )}

        {screen === 'ending' && goal && (
          <EndingScreen
            choices={choices}
            violation={violation}
            clock={finalClock}
            mttr={finalMttr}
            userGoal={goal}
            onReplay={handleReplay}
          />
        )}
      </div>
    </main>
  );
}
