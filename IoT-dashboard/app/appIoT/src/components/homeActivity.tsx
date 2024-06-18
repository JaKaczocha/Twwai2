import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

import home from './hoome.png'

interface HomeActivityProps {
  username: string;
}

const HomeActivity = () => {
  const [userData, setUserData] = useState<{ name: string; userId: string; exp: number; role: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const { name, userId, exp, role } = decodedToken;
        setUserData({ name, userId, exp, role });
      } catch (error) {
        console.error('Error decoding token:', error);
        // Handle decoding error, e.g., invalid token format
      }
    }
  }, []);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  return (
    <div style={{ height: '94vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {/* Dodaj obrazek */}
      <img src={home} alt="Home" style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }} />
    </div>
  );
};

export default HomeActivity;