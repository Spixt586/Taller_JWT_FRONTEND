import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Registrar from './pages/Registrar.jsx';
import Perfil from './pages/Perfil';
import ProtectedRoute from './components/ProtectedRoute';
import GestionItems from './pages/GestionItems.jsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/registrar' element={<Registrar />} />

        <Route element={<ProtectedRoute />}>
          <Route path='/perfil' element={<Perfil />} />
          <Route path='/gestion' element={<GestionItems />} />
        </Route>

        <Route path='*' element={<Navigate to='/login' replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;