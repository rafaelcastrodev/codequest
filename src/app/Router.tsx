import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Shell } from '@/components/layout/Shell';
import { HomePage } from '@/pages/HomePage';
import { LessonPage } from '@/pages/LessonPage';
import { ExercisePage } from '@/pages/ExercisePage';
import { QuizPage } from '@/pages/QuizPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AboutPage } from '@/pages/AboutPage';
import { PlaygroundPage } from '@/pages/PlaygroundPage';
import { ChangelogPage } from '@/pages/ChangelogPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'lesson/:moduleId/:lessonId', element: <LessonPage /> },
      { path: 'exercise/:moduleId/:lessonId', element: <ExercisePage /> },
      { path: 'quiz/:moduleId/:lessonId', element: <QuizPage /> },
      { path: 'playground', element: <PlaygroundPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'changelog', element: <ChangelogPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
