import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogOut, Home, Users, Calendar, BedDouble, Pill, Receipt } from 'lucide-react';

const MainLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <Home size={20} />, roles: ['admin'] },
        { path: '/patients', label: 'Patients', icon: <Users size={20} />, roles: ['admin', 'receptionist', 'doctor'] },
        { path: '/doctors', label: 'Doctors', icon: <Calendar size={20} />, roles: ['admin', 'receptionist', 'doctor'] },
        { path: '/appointments', label: 'Appointments', icon: <Calendar size={20} />, roles: ['admin', 'receptionist', 'doctor'] },
        { path: '/beds', label: 'Bed Allocation', icon: <BedDouble size={20} />, roles: ['admin', 'receptionist'] },
        { path: '/pharmacy', label: 'Pharmacy', icon: <Pill size={20} />, roles: ['admin', 'pharmacist'] },
        { path: '/billing', label: 'Billing', icon: <Receipt size={20} />, roles: ['admin', 'receptionist'] }
    ];

    const visibleMenu = menuItems.filter(item => user && item.roles.includes(user.role));

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Sidebar */}
            <motion.aside
                initial={{ x: -250 }}
                animate={{ x: 0 }}
                className="w-64 bg-white shadow-xl hidden md:flex flex-col z-20"
            >
                <div className="p-6 flex items-center gap-3 border-b">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                        M
                    </div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-500">
                        Medify
                    </h2>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {visibleMenu.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                }`
                            }
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold uppercase">
                            {user?.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative z-0 overflow-hidden">
                <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 md:hidden">
                    <h2 className="text-xl font-bold text-blue-600">Medify</h2>
                    {/* Mobile menu toggle would go here */}
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
