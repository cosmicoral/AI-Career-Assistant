import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ApplicationAnswersPage } from "./pages/ApplicationAnswersPage";
import { CoverLetterPage } from "./pages/CoverLetterPage";
import { CvTailoringPage } from "./pages/CvTailoringPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InterviewKnowledgeBasePage } from "./pages/InterviewKnowledgeBasePage";
import { JobFitPage } from "./pages/JobFitPage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { TrackerPage } from "./pages/TrackerPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="job-fit" element={<JobFitPage />} />
        <Route path="cv-tailoring" element={<CvTailoringPage />} />
        <Route path="cover-letter" element={<CoverLetterPage />} />
        <Route path="application-answers" element={<ApplicationAnswersPage />} />
        <Route path="tracker" element={<TrackerPage />} />
        <Route path="interview-kb" element={<InterviewKnowledgeBasePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
