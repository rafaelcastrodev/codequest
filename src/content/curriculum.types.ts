export type LessonType = 'theory' | 'exercise' | 'challenge' | 'quiz';
export type ValidationStrategy = 'output-match' | 'variable-check' | 'function-test' | 'ast-match' | 'custom';
export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface ExplanationStep {
  type: 'explanation';
  content: string;
  illustration?: string;
}

export interface PredictConfig {
  question?: string;
  choices: string[];
  correctIndex: number;
}

export interface HighlightStep {
  lines: number[];
  note: string;
}

export interface AnatomySegment {
  text: string;
  label: string;
}

export interface InteractiveExampleStep {
  type: 'interactive-example';
  code: string;
  highlightLines?: number[];
  explanation: string;
  predict?: PredictConfig;
  highlightSteps?: HighlightStep[];
  inspectVars?: string[];
  anatomy?: AnatomySegment[];
  autoplay?: boolean;
  stepDelay?: number;
}

export type MicroChallengeVariant = 'fill-blank' | 'order-steps' | 'match-pairs';

export interface FillBlankData {
  code: string;
  blanks: Array<{
    id: string;
    answer: string;
    alternatives?: string[];
  }>;
}

export interface OrderStepsData {
  items: string[];
}

export interface MatchPairsData {
  pairs: Array<{ left: string; right: string }>;
}

export interface MicroChallengeStep {
  type: 'micro-challenge';
  variant: MicroChallengeVariant;
  prompt: string;
  explanation: string;
  fillBlank?: FillBlankData;
  orderSteps?: OrderStepsData;
  matchPairs?: MatchPairsData;
}

export type LessonStep = ExplanationStep | InteractiveExampleStep | MicroChallengeStep;

export interface TestCase {
  setupCode?: string;
  testCode?: string;
  expectedOutput?: string | number | boolean;
  input?: unknown[];
}

export interface CommonMistake {
  pattern: string;
  message: string;
}

export interface Validation {
  strategy: ValidationStrategy;
  testCases?: TestCase[];
  functionName?: string;
  requiredConstructs?: string[];
  forbiddenConstructs?: string[];
  additionalTests?: TestCase[];
}

export interface TheoryLesson {
  id: string;
  title: string;
  type: 'theory';
  xpReward: number;
  steps: LessonStep[];
  narrativeIntro?: string;
}

export interface ExerciseLesson {
  id: string;
  title: string;
  type: 'exercise' | 'challenge';
  difficulty: number;
  xpReward: number;
  instructions: string;
  starterCode: string;
  solution: string;
  validation: Validation;
  hints: string[];
  commonMistakes: CommonMistake[];
  inspectVars?: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizLesson {
  id: string;
  title: string;
  type: 'quiz';
  xpReward: number;
  questions: QuizQuestion[];
}

export type Lesson = TheoryLesson | ExerciseLesson | QuizLesson;

export interface ModuleNarrative {
  intro: string;
  theme?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  narrative?: ModuleNarrative;
}

export interface CurriculumModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  file: string;
  prerequisites: string[];
  estimatedMinutes: number;
}

export interface Curriculum {
  version: string;
  language: string;
  title: string;
  description: string;
  modules: CurriculumModule[];
}

export interface AchievementCondition {
  type:
    | 'exercise-complete'
    | 'module-complete'
    | 'exercises-no-hints'
    | 'module-perfect'
    | 'streak'
    | 'xp-total'
    | 'exercise-first-attempt'
    | 'all-quizzes-complete';
  exerciseId?: string;
  moduleId?: string;
  days?: number;
  amount?: number;
  minStars?: number;
  count?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  condition: AchievementCondition;
}

export interface AchievementsFile {
  achievements: Achievement[];
}

export interface MasteryLevel {
  minPercent: number;
  title: string;
  color: string;
  icon: string;
}

export interface PerformanceTieredPhrases {
  excellent: string[];
  good: string[];
  okay: string[];
}

export type PerformanceTier = keyof PerformanceTieredPhrases;

export interface MotivationalPhrases {
  exercise: PerformanceTieredPhrases;
  lesson: string[];
  quiz: PerformanceTieredPhrases;
}
