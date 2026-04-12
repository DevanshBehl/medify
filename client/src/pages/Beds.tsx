import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BedDouble } from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

const Beds: React.FC = () => {
    const [beds, setBeds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBeds();
    }, []);

    const fetchBeds = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/beds`);
            setBeds(data);
        } catch (error) {
            console.error('Failed to fetch beds', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-100 border-green-200 text-green-700';
            case 'occupied': return 'bg-red-100 border-red-200 text-red-700';
            case 'maintenance': return 'bg-yellow-100 border-yellow-200 text-yellow-700';
            default: return 'bg-gray-100 border-gray-200 text-gray-700';
        }
    };

    const getStatusIconColor = (status: string) => {
        switch (status) {
            case 'available': return 'text-green-500';
            case 'occupied': return 'text-red-500';
            case 'maintenance': return 'text-yellow-500';
            default: return 'text-gray-500';
        }
    };

    // Group by Ward
    const wards = Array.from(new Set(beds.map(b => b.wardName)));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Bed Allocation</h1>
                    <p className="text-gray-500 mt-1">Real-time ward capacity tracking</p>
                </div>
            </div>

            {loading ? (
                <div className="p-8 text-center text-gray-500 animate-pulse">Loading beds...</div>
            ) : (
                wards.map((wardName) => (
                    <div key={wardName} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">{wardName} Ward</h2>
                        </div>
                        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                            {beds.filter(b => b.wardName === wardName).map((bed, i) => (
                                <motion.div
                                    key={bed._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.02 }}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center text-center cursor-pointer transition-transform hover:scale-105 ${getStatusColor(bed.status)}`}
                                >
                                    <BedDouble size={28} className={`mb-2 ${getStatusIconColor(bed.status)}`} />
                                    <span className="font-bold text-sm mb-1">{bed.bedNumber}</span>
                                    <span className="text-xs uppercase tracking-wider font-semibold opacity-80">{bed.status}</span>
                                    {bed.status === 'occupied' && (
                                        <span className="text-xs mt-2 truncate w-full px-1 bg-white/50 rounded">
                                            {bed.currentPatient?.name || 'Patient'}
                                        </span>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Beds;
