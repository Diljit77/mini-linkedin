import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/userAuthStore';

const PrivateRoute = ({ children }) => {
  const { user } = useAuthStore(); // ✅ correct key from Zustand
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }else if (user && !user.isOnboarded) {
      navigate('/onboarding');
    }
  }, [user, navigate]);

  return user ? children : null;
};

export default PrivateRoute;

