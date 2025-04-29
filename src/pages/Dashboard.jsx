import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom'; // For redirection

function Dashboard() {
  const isAuthenticated = localStorage.getItem('token') ? true : false;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('token'); 
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className="ml-[20%] w-[80%] min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      <div className="bg-white p-6 rounded-lg shadow-md w-full">
        Welcome to the PharmaTrack Dashboard!
      </div>
    </div>
  );
}

export default Dashboard;
