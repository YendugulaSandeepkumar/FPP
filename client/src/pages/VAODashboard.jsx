import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api';
import AnalyticsPanel from '../components/AnalyticsPanel';
import VillageSerialsModal from '../components/VillageSerialsModal';
import { Check, X, FileText, Banknote, Eye, Filter, ArrowUpRight, AlertCircle } from 'lucide-react';

const VAODashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  // Modals state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [billModalOpen, setBillModalOpen] = useState(false);
  const [billData, setBillData] = useState({ paddyBags: '', billAmount: '' });
  const [showSerialsModal, setShowSerialsModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests/all');
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this request? This will assign a serial number.")) return;
    try {
      await api.post(`/requests/${id}/approve`);
      fetchRequests();
    } catch (err) {
      alert("Failed to approve");
    }
  };

  const handleReject = async () => {
    try {
      await api.post(`/requests/${selectedRequest.id}/reject`, { rejectionReason });
      setRejectModalOpen(false);
      setRejectionReason('');
      fetchRequests();
    } catch (err) {
      alert("Failed to reject");
    }
  };

  const handleGenerateBill = async () => {
    try {
      await api.post(`/requests/${selectedRequest.id}/bill`, { 
        paddyBags: billData.paddyBags,
      });
      setBillModalOpen(false);
      setBillData({ paddyBags: '', billAmount: '' });
      fetchRequests();
    } catch (err) {
      alert("Failed to generate bill");
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'approved': return 'bg-primary-100 text-primary-800 border-primary-200';
        case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
        case 'final_docs_uploaded': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'completed': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24 font-sans text-gray-900">
      <Navbar role="VAO (Admin)" />
      
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Village Request Management</h1>
                <p className="text-gray-500 mt-1">Oversee farmer requests, verify documents, and generate bills.</p>
            </div>

            <div className="flex items-center space-x-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200 overflow-x-auto max-w-full">
                {['all', 'pending', 'approved', 'final_docs_uploaded', 'completed', 'rejected'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-all duration-200 
                            ${filter === status ? 'bg-primary-600 text-white shadow-md transform scale-[1.02]' : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'}
                        `}
                    >
                        {status.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>
            <button 
                onClick={() => setShowSerialsModal(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm"
            >
                <FileText size={16}/> View Serial List
            </button>
        </div>
        
        {/* Analytics Section */}
        <div className="animate-slide-up mb-8">
            <AnalyticsPanel />
        </div>

        {/* Requests Table/List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-slide-up">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Farmer Details</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Harvest Info</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Current Status</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {filteredRequests.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-10 text-gray-400 font-medium">No requests found matching this filter.</td>
                            </tr>
                        ) : filteredRequests.map(req => (
                            <tr key={req.id} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm mr-3 uppercase">
                                            {req.User?.name?.slice(0, 2)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{req.User?.name || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1"><span className="text-gray-400">Mobile:</span> {req.User?.mobile}</div>
                                            <div className="text-xs text-gray-500 bg-gray-100 inline-block px-1.5 py-0.5 rounded mt-1 border border-gray-200">ID: {req.aadhaar}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 font-medium">{req.harvestDate}</div>
                                    {req.serialNumber ? (
                                        <div className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded inline-block mt-1 border border-primary-100">SN: {req.serialNumber}</div>
                                    ) : <div className="text-xs text-gray-400 italic mt-1">Pending Assignment</div>}
                                    <div className="mt-2">
                                        <a href={`http://localhost:5000/${req.proofFile}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs font-medium hover:text-blue-800 flex items-center gap-1 group-hover:underline">
                                            <FileText size={12}/> View Proof
                                        </a>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusColor(req.status)}`}>
                                        {req.status === 'final_docs_uploaded' ? 'Docs Uploaded' : req.status.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {req.status === 'pending' && (
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => handleApprove(req.id)} className="bg-green-50 text-green-600 hover:bg-green-100 p-2 rounded-lg transition-colors border border-green-200 hover:border-green-300" title="Approve Request">
                                                <Check size={18} />
                                            </button>
                                            <button onClick={() => { setSelectedRequest(req); setRejectModalOpen(true); }} className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors border border-red-200 hover:border-red-300" title="Reject Request">
                                                <X size={18} />
                                            </button>
                                        </div>
                                    )}
                                    {req.status === 'final_docs_uploaded' && (
                                        <div className="flex flex-col items-end space-y-2">
                                            <div className="flex gap-1">
                                                {req.finalDocs && Object.entries(typeof req.finalDocs === 'string' ? JSON.parse(req.finalDocs) : req.finalDocs).map(([key, val]) => (
                                                    val && <a href={`http://localhost:5000/${val}`} target="_blank" key={key} className="text-gray-400 hover:text-blue-600 transition-colors" title={`View ${key}`}>
                                                        <FileText size={16}/>
                                                    </a>
                                                ))}
                                            </div>
                                            <button 
                                                onClick={() => { setSelectedRequest(req); setBillModalOpen(true); }}
                                                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                                            >
                                                <Banknote size={14}/> Generate Bill
                                            </button>
                                        </div>
                                    )}
                                    {req.status === 'completed' && (
                                        <span className="text-green-600 font-bold text-xs flex items-center justify-end gap-1 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                            <Check size={12}/> Completed
                                        </span>
                                    )}
                                     {req.status === 'rejected' && (
                                        <span className="text-red-500 font-medium text-xs flex items-center justify-end gap-1">
                                            <AlertCircle size={12}/> Reviewed
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all scale-100 border border-gray-100">
            <h3 className="text-xl font-bold mb-2 text-gray-800 flex items-center gap-2">
                <span className="bg-red-100 p-2 rounded text-red-600"><AlertCircle size={20}/></span> Reject Request
            </h3>
            <p className="text-gray-500 text-sm mb-6">Please provide a reason for rejecting this request. The farmer will be notified.</p>
            
            <textarea
              className="w-full border border-gray-300 p-3 rounded-xl mb-6 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition h-32 resize-none bg-gray-50"
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              autoFocus
            />
            
            <div className="flex justify-end space-x-3">
              <button onClick={() => setRejectModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleReject} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-lg shadow-red-500/30">Reject Request</button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Modal */}
      {billModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all scale-100 border border-gray-100">
            <h3 className="text-xl font-bold mb-2 text-gray-800 flex items-center gap-2">
                <span className="bg-green-100 p-2 rounded text-green-600"><Banknote size={20}/></span> Generate Bill
            </h3>
            <p className="text-gray-500 text-sm mb-6">Verify physical documents before proceeding. Enter final sale details.</p>
            
            <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Number of Paddy Bags Sold</label>
                <div className="relative">
                    <input
                        type="number"
                        className="w-full border border-gray-300 p-3 pl-4 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-gray-50 text-lg font-bold"
                        value={billData.paddyBags}
                        placeholder="0"
                        onChange={(e) => setBillData({ ...billData, paddyBags: e.target.value })}
                        autoFocus
                    />
                    <span className="absolute right-4 top-3.5 text-gray-400 text-sm font-medium">Bags</span>
                </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button onClick={() => setBillModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleGenerateBill} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-lg shadow-green-500/30 w-full md:w-auto">Generate & Finish</button>
            </div>
          </div>
        </div>
      )}

      {showSerialsModal && <VillageSerialsModal onClose={() => setShowSerialsModal(false)} />}
    </div>
  );
};

export default VAODashboard;
