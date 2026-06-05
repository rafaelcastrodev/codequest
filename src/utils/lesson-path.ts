export function lessonPath(moduleId: string, lesson: { id: string; type: string }): string {
  if (lesson.type === 'exercise' || lesson.type === 'challenge') {
    return `/exercise/${moduleId}/${lesson.id}`;
  }
  if (lesson.type === 'quiz') {
    return `/quiz/${moduleId}/${lesson.id}`;
  }
  return `/lesson/${moduleId}/${lesson.id}`;
}
