import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Phone, Stethoscope } from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

const Doctors: React.FC = () => {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/doctors`);
                setDoctors(data);
            } catch (error) {
                console.error('Failed to fetch doctors', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Doctor Schedules</h1>
                    <p className="text-gray-500 mt-1">Directory of hospital physicians and their timings</p>
                </div>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-200 rounded-xl w-full"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {doctors.map((doc, index) => (
                        <motion.div
                            key={doc._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex flex-col sm:flex-row bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
                        >
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 sm:w-1/3 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
                                    <Stethoscope className="text-white" size={28} />
                                </div>
                                <h3 className="font-bold text-white text-lg">{doc.name}</h3>
                                <p className="text-indigo-100 text-sm">{doc.specialization}</p>
                            </div>

                            <div className="p-6 sm:w-2/3 flex flex-col justify-between">
                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Clock size={16} className="text-indigo-500" />
                                        <span className="font-medium">Shift:</span> {doc.shiftStart} - {doc.shiftEnd}
                                    </div>
                                    <div className="flex items-start gap-3 text-sm text-gray-600">
                                        <CalendarIcon size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-medium block">Available Days:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {doc.availableDays.map((day: string) => (
                                                    <span key={day} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">{day.substring(0, 3)}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Phone size={16} className="text-indigo-500" />
                                        <span>{doc.contact}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t pt-4">
                                    <span className="text-sm font-semibold text-gray-900">Fee: ${doc.consultationFee}</span>
                                    <button className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition">
                                        View Schedule
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Doctors;
