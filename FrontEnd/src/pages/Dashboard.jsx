import React from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ClipboardList, Users, Package, ShoppingCart } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();

  const cards = [
    { name: "Today's Tokens", count: '0', icon: ClipboardList, color: 'text-blue-600 bg-blue-50' },
    { name: "Today's Patients", count: '0', icon: Users, color: 'text-green-600 bg-green-50' },
    { name: "Low Stock Items", count: '0', icon: Package, color: 'text-amber-600 bg-amber-50' },
    { name: "Today's Purchases", count: '0', icon: ShoppingCart, color: 'text-indigo-600 bg-indigo-50' }
  ];

  return (
    <div className="space-y-6">
      {/* Title Heading */}
      <div>
        <h1 className="text-2xl font-bold text-textMain">Dashboard Overview</h1>
        <p className="text-textSub text-sm mt-1">Operational summaries for the day</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="bg-surface p-6 rounded-lg shadow-sm border border-border flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-textSub uppercase tracking-wider">{card.name}</span>
                <h3 className="text-3xl font-bold text-textMain mt-1">{card.count}</h3>
              </div>
              <div className={`p-3 rounded-full ${card.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
