import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useAdminAuth() {
  const navigate = useNavigate();

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
    }
  }, []);

  return token;
}