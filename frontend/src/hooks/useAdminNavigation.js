import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const useAdminAuthNavigation = () => {
  const navigate = useNavigate();
  const admin = useSelector(state => state.admin.data);

  useEffect(() => {
    if (!admin) {
      const adminInfo = localStorage.getItem('adminInfo');
      if (!adminInfo) {
        navigate('/admin/signin');
      }
    } else {
      navigate('/admin');
    }
  }, [admin, navigate]);

  return { navigate };
}; 