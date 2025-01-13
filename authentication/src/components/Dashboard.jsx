import React from 'react';
import { useSelector } from 'react-redux';

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Welcome {user?.email}</h1>
      <p>This is your dashboard</p>
    </div>
  );
};

export default Dashboard;