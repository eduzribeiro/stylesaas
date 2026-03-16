import React from 'react';
import { useAuth } from '../../src/context';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="p-8 text-chrome">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-silver-400 mt-2">Controle Geral das barbearias e usuários.</p>
    </div>
  );
};

export default AdminDashboard;
