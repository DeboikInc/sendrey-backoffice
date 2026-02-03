// components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = () => {
  const { user, token } = useSelector((state) => state.auth);
  
  const isAuthenticated = !!token;
  const isAdmin = user && (user.role === 'admin' || user.role === 'super-admin');
  
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />; // This renders child routes
};

export default ProtectedRoute;