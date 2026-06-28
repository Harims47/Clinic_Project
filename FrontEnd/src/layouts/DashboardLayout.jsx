import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  LogOut, 
  Menu, 
  ChevronRight, 
  ClipboardList, 
  ShoppingCart, 
  FileText,
  Receipt,
  Truck,
  History,
  User
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Patient Register', path: '/patients', icon: Users },
    { name: 'Product Inventory', path: '/products', icon: Package },
    { name: 'Token Queue', path: '/tokens', icon: ClipboardList },
    { name: 'Sales POS Billing', path: '/sales', icon: FileText },
    { name: 'Billing Ledger', path: '/invoices', icon: Receipt },
    { name: 'Purchase Inward', path: '/purchase', icon: ShoppingCart },
    { name: 'Purchase Ledger', path: '/purchase/history', icon: History },
    { name: 'Suppliers Directory', path: '/suppliers', icon: Truck }
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar Panel */}
      <aside className={`bg-surface border-r border-border flex flex-col justify-between transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        <div>
          {/* Brand Logo Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border">
            {!collapsed && (
              <span className="font-bold text-lg text-primary tracking-wide">Clinic ERP</span>
            )}
            <button 
              onClick={() => setCollapsed(!collapsed)} 
              className="p-1.5 rounded hover:bg-background text-textSub transition"
            >
              <Menu size={18} />
            </button>
          </div>

          {/* Navigation Links list */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.name}
                  to={item.disabled ? '#' : item.path}
                  onClick={(e) => item.disabled && e.preventDefault()}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition ${
                    item.disabled 
                      ? 'opacity-40 cursor-not-allowed text-textSub'
                      : isActive 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'text-textMain hover:bg-background'
                  }`}
                  title={item.name}
                >
                  <Icon size={18} />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout Action */}
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-red-50 hover:text-red-600 transition"
            title="Logout"
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        {/* Navbar Header */}
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-2">
            <span className="text-textSub font-medium text-sm">Welcome back,</span>
            <span className="font-semibold text-textMain text-sm">{user?.username}</span>
          </div>

          {/* User Session profile widget */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-primary uppercase bg-blue-50 px-2 py-0.5 rounded">
                {user?.role}
              </span>
            </div>
            <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-textSub border border-border">
              <User size={18} />
            </div>
          </div>
        </header>

        {/* Sub-page viewport context */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
