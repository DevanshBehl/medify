import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Plus, Activity, Phone } from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

const Patients: React.FC = () => {
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        fetchPatients();
    }, [keyword]);

    const fetchPatients = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/patients?keyword=${keyword}`);
            setPatients(data.patients);
        } catch (error) {
            console.error('Failed to fetch patients', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Patient Records</h1>
                    <p className="text-gray-500 mt-1">Manage and view patient demographics</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                        />
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2 whitespace-nowrap">
                        <Plus size={18} /> Add Patient
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-20 bg-gray-200 rounded-xl w-full"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {patients.map((patient, index) => (
                        <motion.div
                            key={patient._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                                        {patient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{patient.name}</h3>
                                        <p className="text-sm text-gray-500">{patient.age} yrs • {patient.gender}</p>
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-md">
                                    {patient.bloodGroup}
                                </span>
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone size={14} className="text-gray-400" />
                                    {patient.contact}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                                    <Activity size={14} className="text-gray-400" />
                                    {patient.medicalHistory || 'No history'}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button className="flex-1 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                                    View Profile
                                </button>
                                <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                                    Edit
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    {patients.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500">
                            No patients found matching your criteria.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Patients;
