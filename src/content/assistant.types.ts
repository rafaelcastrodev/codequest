export interface AssistantEntry {
  alternativeExplanations: string[];
  examples: string[];
  summaries: string[];
}

export interface AssistantModule {
  moduleId: string;
  lessons: Record<string, AssistantEntry>;
}
