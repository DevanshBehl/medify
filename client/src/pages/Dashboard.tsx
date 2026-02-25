import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Calendar, Pill, DollarSign, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/dashboard`);
                setStats(data);
            } catch (error) {
                console.error('Error fetching dashboard stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading dashboard...</div>;

    const bedData = [
        { name: 'Available', value: stats?.beds?.available || 0 },
        { name: 'Occupied', value: stats?.beds?.occupied || 0 },
        { name: 'Maintenance', value: stats?.beds?.maintenance || 0 },
    ];
    const COLORS = ['#10B981', '#EF4444', '#F59E0B']; // Green, Red, Yellow

    const cards = [
        { title: "Patients (Today / Month)", value: `${stats?.patients?.today} / ${stats?.patients?.thisMonth}`, icon: <Users size={24} className="text-blue-600" />, bg: "bg-blue-100" },
        { title: "Today's Appointments", value: stats?.appointmentsToday || 0, icon: <Calendar size={24} className="text-purple-600" />, bg: "bg-purple-100" },
        { title: "Low Stock Medicines", value: stats?.lowStockCount || 0, icon: <Pill size={24} className="text-red-600" />, bg: "bg-red-100", onClick: () => navigate('/pharmacy') },
        { title: "Pending Bills Total", value: `$${stats?.pendingBillsTotal || 0}`, icon: <DollarSign size={24} className="text-green-600" />, bg: "bg-green-100", onClick: () => navigate('/billing') },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Overview of hospital metrics and activities</p>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => navigate('/patients')} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
                        <Users size={16} /> New Patient
                    </button>
                    <button onClick={() => navigate('/appointments')} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm flex items-center gap-2">
                        <Calendar size={16} /> Book Appt
                    </button>
                    <button onClick={() => navigate('/beds')} className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition shadow-sm flex items-center gap-2">
                        <Activity size={16} /> Allocate Bed
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={card.onClick}
                        className={`p-6 bg-white rounded-2xl shadow-sm border border-gray-100 ${card.onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${card.bg}`}>
                                {card.icon}
                            </div>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">{card.title}</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Bed Availability</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={bedData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {bedData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Placeholder for recent activities or other stats */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Hospital Status</h3>
                    <div className="bg-gray-50 rounded-xl p-4 h-64 flex items-center justify-center text-gray-400">
                        Widgets space for Recent Admissions / Activity Feed
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
