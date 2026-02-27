import React, { useEffect, useState } from 'react';
import { X, Search, CheckCircle, Clock } from 'lucide-react';
import api from '../api';

const VillageSerialsModal = ({ onClose }) => {
  const [serials, setSerials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSerials = async () => {
      try {
        const res = await api.get('/village-serials');
        setSerials(res.data);
      } catch (err) {
        console.error("Failed to fetch serials", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSerials();
  }, []);

  const filtered = serials.filter(item => 
    item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.farmerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Village Serial Numbers</h2>
            <p className="text-sm text-gray-500 mt-1">Track paddy sales status for your village</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100">
            <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search by Serial Number or Farmer Name..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-4">
            {loading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-10 text-gray-400">No serial numbers found.</div>
            ) : (
                <div className="grid gap-3">
                    {filtered.map((item, idx) => {
                        const isSold = ['final_docs_uploaded', 'completed'].includes(item.status);
                        return (
                            <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${isSold ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${isSold ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <div className="font-mono font-bold text-gray-800 text-lg">{item.serialNumber}</div>
                                        <div className="text-sm text-gray-500 font-medium">{item.farmerName}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {isSold ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-bold uppercase tracking-wide">
                                            <CheckCircle size={14} /> Paddy Sold
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-wide">
                                            <Clock size={14} /> Pending Sale
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl text-center text-xs text-gray-400">
            Showing all approved requests for {serials.length > 0 ? serials[0].village : 'your village'}.
        </div>
      </div>
    </div>
  );
};

export default VillageSerialsModal;
