import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Layout from './components/Layout.jsx';
import { Login, Forgot, Reset } from './pages/Auth.jsx';
import Tickets from './pages/Tickets.jsx';
import NovoTicket from './pages/NovoTicket.jsx';
import Dashboard from './pages/Dashboard.jsx';
const Private = () => {
  const { user } = useAuth();
  return user ? <Layout /> : <Navigate to="/login" replace />;
};
const Manual = () => (
  <>
    <div className="box">
      <div className="body">Documentação de uso do HelpDesk.</div>
    </div>
  </>
);
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/esqueci-senha" element={<Forgot />} />
      <Route path="/redefinir-senha" element={<Reset />} />
      <Route element={<Private />}>
        {['meus', 'ativos', 'todos'].map((s) => (
          <Route key={s} path={'/' + s} element={<Tickets scope={s} />} />
        ))}
        <Route path="/novo" element={<NovoTicket />} />
        <Route path="/manual" element={<Manual />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
