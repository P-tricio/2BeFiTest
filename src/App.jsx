import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MobileLayout from './components/layout/MobileLayout';
import useStore from './store/useStore';
import ParQForm from './components/onboarding/ParQForm';
import ProtectedRoute from './components/common/ProtectedRoute';
import LevelSelector from './components/onboarding/LevelSelector';
import { AuthProvider } from './components/auth/AuthProvider';
import LoginScreen from './components/auth/LoginScreen';
import HistoryDashboard from './components/dashboard/HistoryDashboard';
import RequireAuth from './components/common/RequireAuth';

// Placeholder Components for lazy loading or direct import
import CardioSelection from './components/tests/CardioSelection';
import StrengthModule from './components/tests/StrengthModule';
import MobilityModule from './components/tests/MobilityModule';
import CoordinationModule from './components/tests/CoordinationModule';
import ResultsDashboard from './components/dashboard/ResultsDashboard';
import Home from './components/dashboard/Home';
import BodyCompositionForm from './components/tests/BodyCompositionForm';

const Placeholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-full text-slate-400">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <p>Próximamente</p>
  </div>
);

function App() {
  const parq = useStore((state) => state.parq);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />

          {/* Protected Area (Requires Login) */}
          <Route element={<RequireAuth />}>
            <Route path="/" element={<MobileLayout />}>
              <Route index element={<Home />} />
              <Route path="onboarding" element={<ParQForm />} />
              <Route path="level" element={<LevelSelector />} />

              {/* Physical Activity Guard (Requires Par-Q) */}
              <Route element={<ProtectedRoute />}>
                <Route path="cardio/*" element={<CardioSelection />} />
                <Route path="strength/*" element={<StrengthModule />} />
                <Route path="agility/*" element={<CoordinationModule />} />
                <Route path="mobility/*" element={<MobilityModule />} />
                <Route path="results" element={<ResultsDashboard />} />
                <Route path="history" element={<HistoryDashboard />} />
                <Route path="body-comp" element={<BodyCompositionForm />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
