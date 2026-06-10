import { type ReactNode, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { icons } from "@/components/ui/Icon";
import { useProgressStore, getLevelProgress, getLevelTitle } from "@/store/progress.store";
import type { ModuleMastery } from "@/store/progress.store";
import { MasteryBadge } from "@/components/ui/MasteryBadge";
import type { MotivationalPhrases, PerformanceTier, PerformanceTieredPhrases } from "@/content/curriculum.types";
import { loadMotivationalPhrases } from "@/content/loader";

export type CompletionContext = keyof MotivationalPhrases;

const DEFAULT_TIERED: PerformanceTieredPhrases = {
  excellent: ["Mandou bem!"],
  good: ["Bom trabalho!"],
  okay: ["Conseguiu!"],
};

const DEFAULT_PHRASES: MotivationalPhrases = {
  exercise: DEFAULT_TIERED,
  lesson: ["Teoria dominada!"],
  quiz: DEFAULT_TIERED,
};

let phrases: MotivationalPhrases = DEFAULT_PHRASES;

loadMotivationalPhrases().then((data) => { phrases = data; }).catch(() => {});

function starsToTier(stars: number | undefined): PerformanceTier {
  if (stars === undefined || stars >= 3) return "excellent";
  if (stars === 2) return "good";
  return "okay";
}

function pickPhrase(context: CompletionContext, stars: number | undefined): string {
  const pool = phrases[context];
  if (Array.isArray(pool)) {
    return pool[Math.floor(Math.random() * pool.length)];
  }
  const tier = starsToTier(stars);
  const tierPhrases = pool[tier];
  return tierPhrases[Math.floor(Math.random() * tierPhrases.length)];
}

/* ── StarsDisplay ── */

interface StarsDisplayProps {
  stars: number;
  maxStars?: number;
  size?: "md" | "lg";
}

export function StarsDisplay({ stars, maxStars = 3, size = "lg" }: StarsDisplayProps) {
  const textSize = size === "lg" ? "text-3xl" : "text-2xl";

  return (
    <div className="flex justify-center gap-1">
      {Array.from({ length: maxStars }, (_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: (i + 1) * 0.1,
            type: "spring",
            stiffness: 400,
          }}
          className={textSize}>
          {i < stars ? <icons.star /> : <icons.starEmpty />}
        </motion.span>
      ))}
    </div>
  );
}

/* ── XPRewardBadge ── */

interface XPRewardBadgeProps {
  xp: number;
  animated?: boolean;
}

export function XPRewardBadge({ xp, animated = false }: XPRewardBadgeProps) {
  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
        className="inline-block bg-secondary/20 border border-secondary/30 rounded-xl px-5 py-2">
        <motion.span
          className="font-heading font-bold text-secondary text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}>
          +{xp} XP
        </motion.span>
      </motion.div>
    );
  }

  return (
    <div className="inline-block bg-secondary/20 border border-secondary/30 rounded-xl px-5 py-2">
      <span className="font-heading font-bold text-secondary text-xl">
        +{xp} XP
      </span>
    </div>
  );
}

/* ── XPProgressBar ── */

interface XPProgressBarProps {
  xpReward: number;
}

function XPProgressBar({ xpReward }: XPProgressBarProps) {
  const { xp, level } = useProgressStore();
  const { current, next } = getLevelProgress(xp);
  const range = next - current;
  const prevXP = xp - xpReward;
  const prevInRange = Math.max(0, prevXP - current);
  const currentInRange = xp - current;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
      className="space-y-1.5"
    >
      <div className="flex justify-between text-xs font-body text-text-muted">
        <span>Nv. {level} — {getLevelTitle(level)}</span>
      </div>
      <ProgressBar
        value={currentInRange}
        max={range}
        initialValue={prevInRange}
        variant="secondary"
        size="lg"
        delay={0.9}
        overlayLabel={`${xp} / ${next} XP`}
      />
    </motion.div>
  );
}

/* ── CompletionActions ── */

interface CompletionActionsProps {
  onNext: () => void;
  onMap: () => void;
  nextLabel?: string;
  mapLabel?: string;
  mapIcon?: ReactNode;
  layout?: "row" | "row-equal";
}

export function CompletionActions({
  onNext,
  onMap,
  nextLabel = "Continuar",
  mapLabel = "Jornada",
  mapIcon,
  layout = "row",
}: CompletionActionsProps) {
  const equalClass = layout === "row-equal" ? "flex-1" : "";

  return (
    <div className="flex gap-3 justify-center">
      <Button variant="ghost" size="md" className={equalClass || "w-35"} onClick={onMap}>
        {mapIcon} {mapLabel}
      </Button>
      <Button variant="primary" size="md" className={equalClass || "w-40"} onClick={onNext}>
        {nextLabel}
      </Button>
    </div>
  );
}

/* ── CompletionCard (composto) ── */

interface CompletionCardProps {
  icon: ReactNode;
  context: CompletionContext;
  title: string;
  subtitle?: string;
  stars?: number;
  maxStars?: number;
  starSize?: "md" | "lg";
  xpReward: number;
  animatedXP?: boolean;
  onNext: () => void;
  onMap: () => void;
  nextLabel?: string;
  mapLabel?: string;
  mapIcon?: ReactNode;
  actionsLayout?: "row" | "row-equal";
  moduleMastery?: ModuleMastery;
  moduleTitle?: string;
  children?: ReactNode;
}

export function CompletionCard({
  icon,
  context,
  title,
  subtitle,
  stars,
  maxStars = 3,
  starSize = "lg",
  xpReward,
  animatedXP = true,
  onNext,
  onMap,
  nextLabel,
  mapLabel,
  mapIcon = <icons.map />,
  actionsLayout = "row-equal",
  moduleMastery,
  moduleTitle,
  children,
}: CompletionCardProps) {
  const phrase = useMemo(() => pickPhrase(context, stars), [context, stars]);

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-bg-surface border border-primary/40 rounded-2xl p-8 text-center max-w-sm w-full mx-auto shadow-[0_0_40px_rgba(0,212,170,0.2)]"
    >
      <div className="space-y-4">
        <div className="text-5xl">{icon}</div>
        <div>
          <h2 className="font-heading font-bold text-2xl text-primary mb-1">
            {phrase}
          </h2>
          <p className="text-text-muted font-body text-sm">{subtitle ?? title}</p>
        </div>
        {stars !== undefined && (
          <StarsDisplay stars={stars} maxStars={maxStars} size={starSize} />
        )}
        {children}
        <div className="pt-2">
          <XPRewardBadge xp={xpReward} animated={animatedXP} />
        </div>
        <XPProgressBar xpReward={xpReward} />
        {moduleMastery && moduleMastery.level > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="flex items-center justify-center gap-2"
          >
            <span className="text-xs text-text-muted font-body">{moduleTitle}</span>
            <MasteryBadge mastery={moduleMastery} />
            <span className="text-[10px] text-text-muted font-body">
              <icons.star /> {moduleMastery.earnedStars}/{moduleMastery.maxStars}
            </span>
          </motion.div>
        )}
        <CompletionActions
          onNext={onNext}
          onMap={onMap}
          nextLabel={nextLabel}
          mapLabel={mapLabel}
          mapIcon={mapIcon}
          layout={actionsLayout}
        />
      </div>
    </motion.div>
  );
}
