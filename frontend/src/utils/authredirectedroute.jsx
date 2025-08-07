import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/userAuthStore';

const AuthRedirectRoute = ({ children }) => {
  const { user } = useAuthStore(); // ✅ correct key
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return !user ? children : null;
};

export default AuthRedirectRoute;



