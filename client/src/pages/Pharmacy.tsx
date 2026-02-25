import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pill, AlertTriangle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Pharmacy: React.FC = () => {
    const [medicines, setMedicines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/medicines`);
            setMedicines(data.medicines);
        } catch (error) {
            console.error('Failed to fetch medicines', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Pharmacy Inventory</h1>
                    <p className="text-gray-500 mt-1">Manage drug stocks and alerts</p>
                </div>
                <button className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition shadow-sm flex items-center gap-2">
                    <Pill size={18} /> Add Medicine
                </button>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 rounded w-full"></div>)}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold">Medicine Name</th>
                                <th className="p-4 font-semibold">Category</th>
                                <th className="p-4 font-semibold text-right">In Stock</th>
                                <th className="p-4 font-semibold text-right">Price/Unit</th>
                                <th className="p-4 font-semibold text-center">Status</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {medicines.map((med) => {
                                const isLowStock = med.quantityInStock <= med.reorderLevel;
                                return (
                                    <tr key={med._id} className={`hover:bg-gray-50/50 transition ${isLowStock ? 'bg-red-50/30' : ''}`}>
                                        <td className="p-4 font-medium text-gray-900">{med.name}</td>
                                        <td className="p-4 text-gray-600">{med.category}</td>
                                        <td className={`p-4 text-right font-bold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>{med.quantityInStock}</td>
                                        <td className="p-4 text-right text-gray-600">${med.pricePerUnit}</td>
                                        <td className="p-4 text-center">
                                            {isLowStock ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-100 rounded-md">
                                                    <AlertTriangle size={12} /> Low Stock
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-md">
                                                    Healthy
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="text-emerald-600 hover:text-emerald-900 text-sm font-medium">Update Stock</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Pharmacy;
