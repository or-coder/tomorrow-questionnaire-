import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CoverPage        from './pages/CoverPage'
import QuestionnairePage from './pages/QuestionnairePage'
import LoadingPage      from './pages/LoadingPage'
import ReportPage       from './pages/ReportPage'
import DashboardPage    from './pages/DashboardPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"              element={<CoverPage />} />
        <Route path="/questionnaire" element={<QuestionnairePage />} />
        <Route path="/loading"       element={<LoadingPage />} />
        <Route path="/report/:id"    element={<ReportPage />} />
        <Route path="/dashboard"     element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  )
}
