import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { theme } from './theme/joyTheme';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Setup2FA from './pages/Setup2FA';
import TwoFA from './pages/TwoFA';
import Files from './pages/Files';
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <CssVarsProvider theme={theme} defaultMode="light">
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/setup-2fa" element={<Setup2FA />} />
        <Route 
          path="/2fa" 
          element={
            <ProtectedRoute require2FA>
              <TwoFA />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/app/files" 
          element={
            <ProtectedRoute>
              <Files />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </CssVarsProvider>
  </BrowserRouter>
);

export default App;
