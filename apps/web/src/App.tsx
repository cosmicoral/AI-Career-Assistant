import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ApplicationAnswersPage } from "./pages/ApplicationAnswersPage";
import { ApplicationWorkspacePage } from "./pages/ApplicationWorkspacePage";
import { AssessmentCentrePage } from "./pages/AssessmentCentrePage";
import { CoverLetterPage } from "./pages/CoverLetterPage";
import { CvTailoringPage } from "./pages/CvTailoringPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InterviewKnowledgeBasePage } from "./pages/InterviewKnowledgeBasePage";
import { JobFitPage } from "./pages/JobFitPage";
import { LoginPage } from "./pages/LoginPage";
import { NetworkingPage } from "./pages/NetworkingPage";
import { OnlineTestsPage } from "./pages/OnlineTestsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { TrackerPage } from "./pages/TrackerPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
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
        <Route path="applications/:id" element={<ApplicationWorkspacePage />} />
        <Route path="networking" element={<NetworkingPage />} />
        <Route path="assessment-centre" element={<AssessmentCentrePage />} />
        <Route path="online-tests" element={<OnlineTestsPage />} />
        <Route path="interview-kb" element={<InterviewKnowledgeBasePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
