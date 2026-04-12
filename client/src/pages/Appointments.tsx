import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5001/api';

const Appointments: React.FC = () => {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/appointments`);
            setAppointments(data);
        } catch (error) {
            console.error('Failed to fetch appointments', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-700';
            case 'confirmed': return 'bg-green-100 text-green-700';
            case 'completed': return 'bg-gray-100 text-gray-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                    <p className="text-gray-500 mt-1">Manage schedules and patient flow</p>
                </div>
                {user?.role !== 'doctor' && (
                    <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm flex items-center gap-2">
                        <Calendar size={18} /> New Appointment
                    </button>
                )}
            </div>

            {loading ? (
                <div className="p-8 text-center text-gray-500 animate-pulse">Loading appointments...</div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold">Date & Time</th>
                                <th className="p-4 font-semibold">Patient</th>
                                <th className="p-4 font-semibold">Doctor</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {appointments.map((appt) => (
                                <tr key={appt._id} className="hover:bg-gray-50/50 transition">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 font-medium text-gray-900">
                                            <Calendar size={16} className="text-gray-400" />
                                            {new Date(appt.appointmentDate).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <Clock size={16} className="text-gray-400" />
                                            {appt.timeSlot}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">{appt.patientId?.name || 'Unknown'}</div>
                                        <div className="text-sm text-gray-500">{appt.patientId?.contact}</div>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        <div className="font-medium">Dr. {appt.doctorId?.name || 'Unknown'}</div>
                                        <div className="text-sm text-gray-400">{appt.doctorId?.specialization}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-md tracking-wide ${getStatusColor(appt.status)}`}>
                                            {appt.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium mr-3">Edit</button>
                                        <button className="text-gray-500 hover:text-gray-900 text-sm font-medium">Details</button>
                                    </td>
                                </tr>
                            ))}
                            {appointments.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">No appointments scheduled</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Appointments;
