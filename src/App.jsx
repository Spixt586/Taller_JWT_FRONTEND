import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvaider } from './context/AuthContext';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import ProtectedRoute from './Components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvaider>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path='/perfil' element={<Perfil />} />
        </Route>
        <Route path='*' element={<Navigate to='/login' replace />} />
      </Routes>
    </AuthProvaider>
  );
}

export default App;