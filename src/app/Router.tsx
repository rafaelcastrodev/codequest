import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from '@/components/layout/Shell';
import { HomePage } from '@/pages/HomePage';
import { LessonPage } from '@/pages/LessonPage';
import { ExercisePage } from '@/pages/ExercisePage';
import { QuizPage } from '@/pages/QuizPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AboutPage } from '@/pages/AboutPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<HomePage />} />
          <Route path="lesson/:moduleId/:lessonId" element={<LessonPage />} />
          <Route path="exercise/:moduleId/:lessonId" element={<ExercisePage />} />
          <Route path="quiz/:moduleId/:lessonId" element={<QuizPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
