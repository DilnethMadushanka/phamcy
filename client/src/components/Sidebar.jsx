import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Store,
  FileCheck2,
  PackageCheck,
  LayoutDashboard,
  ShoppingCart,
  Pill,
  FolderTree,
  Truck,
  BarChart3,
  Users,
  ShieldCheck,
  Sparkles,
  ClipboardList,
  MessageSquare
} from 'lucide-react';

const Sidebar = ({ onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'Customer';

  const customerNavItems = [
    {
      name: 'Pharmacy Store',
      path: '/store',
      icon: Store,
    },
    {
      name: 'Upload Prescription',
      path: '/upload-prescription',
      icon: FileCheck2,
    },
    {
      name: 'My Orders & Tracking',
      path: '/my-orders',
      icon: PackageCheck,
    },
  ];

  const staffNavItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Admin', 'Pharmacist', 'Cashier'],
    },
    {
      name: 'POS & Billing',
      path: '/pos',
      icon: ShoppingCart,
      roles: ['Admin', 'Pharmacist', 'Cashier'],
    },
    {
      name: 'Live Support Chat',
      path: '/support',
      icon: MessageSquare,
      roles: ['Admin', 'Pharmacist', 'Cashier'],
    },
    {
      name: 'Prescriptions & Orders',
      path: '/orders',
      icon: ClipboardList,
      roles: ['Admin', 'Pharmacist'],
    },
    {
      name: 'Medicines & Stock',
      path: '/inventory',
      icon: Pill,
      roles: ['Admin', 'Pharmacist'],
    },
    {
      name: 'Categories',
      path: '/categories',
      icon: FolderTree,
      roles: ['Admin', 'Pharmacist'],
    },
    {
      name: 'Suppliers & Orders',
      path: '/suppliers',
      icon: Truck,
      roles: ['Admin', 'Pharmacist'],
    },
    {
      name: 'Reports & Telemetry',
      path: '/reports',
      icon: BarChart3,
      roles: ['Admin', 'Pharmacist'],
    },
    {
      name: 'User Management (RBAC)',
      path: '/users',
      icon: Users,
      roles: ['Admin'],
    },
  ];

  const navItems = role === 'Customer' ? customerNavItems : staffNavItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-white/95 backdrop-blur-xl text-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4.5rem)] border-r border-blue-100/80 font-sans transition-all duration-300 shadow-sm shadow-blue-900/5">
      <div className="py-6 px-4 space-y-5">
        {/* Header */}
        <div className="px-3 pb-4 border-b border-blue-100/80 space-y-1">
          <div className="flex items-center gap-1.5 text-blue-600">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              FOUAD PORTAL
            </span>
          </div>
          <h2 className="text-xs font-extrabold tracking-wider bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent uppercase leading-tight pt-0.5">
            {role === 'Customer' ? 'PATIENT PORTAL & PHARMACY STORE' : 'STAFF MANAGEMENT & RX VERIFICATION'}
          </h2>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => { if (onClose) onClose(); }}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/80 border border-transparent'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" />
                <span className="truncate tracking-wide">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Info Box */}
      <div className="p-4 m-4 bg-gradient-to-br from-blue-50/90 via-sky-50/60 to-indigo-50/80 rounded-2xl border border-blue-100 text-xs text-slate-700 space-y-1.5 shadow-xs">
        <div className="font-extrabold text-blue-900 flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Pharmacy Verified</span>
        </div>
        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
          Authorized distributor for authentic skincare &amp; pharmaceutical products.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
