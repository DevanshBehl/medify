import React from 'react';
import { Receipt } from 'lucide-react';

const Billing: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Billing & Checkout</h1>
                    <p className="text-gray-500 mt-1">Generate invoices and export to PDF</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
                    <Receipt size={18} /> Generate New Bill
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex items-center justify-center p-20">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Receipt size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Billing Interface</h3>
                    <p className="text-gray-500 max-w-sm mt-2">
                        This module generates PDF invoices connecting Doctor Fees, Pharmacy Meds, and Bed Charges. Click "Generate New Bill" to start.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Billing;
