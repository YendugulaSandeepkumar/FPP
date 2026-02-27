import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api';
import { Upload, FileText, CheckCircle, XCircle, Clock, Plus, Tag } from 'lucide-react';
import MSPTicker from '../components/MSPTicker';
import WeatherWidget from '../components/WeatherWidget';
import VillageSerialsModal from '../components/VillageSerialsModal';

const FarmerDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  
  // New Request Form State
  const [newRequest, setNewRequest] = useState({
    aadhaar: '',
    contact: '',
    harvestDate: '',
    proofFile: null
  });

  // Final Docs Form State
  const [finalDocs, setFinalDocs] = useState({
    landDoc: null,
    aadhaarDoc: null,
    bankDoc: null,
    truckSheet: null
  });
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [showSerialsModal, setShowSerialsModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/my-requests');
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewRequestSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('aadhaar', newRequest.aadhaar);
    formData.append('contact', newRequest.contact);
    formData.append('harvestDate', newRequest.harvestDate);
    formData.append('proofFile', newRequest.proofFile);

    try {
      await api.post('/requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowNewRequestForm(false);
      fetchRequests(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit request');
    }
  };

  const handleFinalDocsSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('landDoc', finalDocs.landDoc);
    formData.append('aadhaarDoc', finalDocs.aadhaarDoc);
    formData.append('bankDoc', finalDocs.bankDoc);
    formData.append('truckSheet', finalDocs.truckSheet);

    try {
      await api.post(`/requests/${selectedRequestId}/final-docs`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedRequestId(null);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload docs');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold gap-2 border border-yellow-200 shadow-sm animate-pulse-slow"><Clock size={14}/> Pending Review</span>;
      case 'approved': return <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-semibold gap-2 border border-primary-200 shadow-sm"><CheckCircle size={14}/> Approved - Sell Now</span>;
      case 'rejected': return <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold gap-2 border border-red-200 shadow-sm"><XCircle size={14}/> Rejected</span>;
      case 'final_docs_uploaded': return <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold gap-2 border border-blue-200 shadow-sm"><FileText size={14}/> Docs Submitted</span>;
      case 'completed': return <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold gap-2 border border-green-200 shadow-sm"><CheckCircle size={14}/> Bill Generated</span>;
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 pt-24">
      <Navbar role="Farmer" />
      
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Harvest Requests</h1>
            <p className="text-gray-500 mt-1">Manage your paddy sales and track status</p>
          </div>

          {!requests.some(r => ['pending', 'approved', 'final_docs_uploaded'].includes(r.status)) && (
             <button 
               onClick={() => setShowNewRequestForm(true)}
               className="btn-primary flex items-center gap-2 transform transition hover:scale-105 shadow-lg shadow-primary-500/20"
             >
               <Plus size={18} /> New Request
             </button>
          )}
          <button 
             onClick={() => setShowSerialsModal(true)}
             className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 flex items-center gap-2 transition"
          >
             <Tag size={18} /> View Village Serials
          </button>
        </div>

        {/* Widgets Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
            <div className="md:col-span-2">
                <MSPTicker />
            </div>
            <div>
                <WeatherWidget />
            </div>
        </div>

        {/* New Request Modal/Form Area */}
        {showNewRequestForm && (
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-8 animate-slide-up relative overflow-hidden">
             <div className="absolute top-0 left-0 w-2 h-full bg-primary-500"></div>   
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <span className="bg-primary-100 p-2 rounded-lg text-primary-600"><Upload size={20}/></span>
                Submit Harvest Details
            </h2>
            
            <form onSubmit={handleNewRequestSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Aadhaar Number</label>
                <input 
                    type="text" placeholder="12-digit Aadhaar" required
                    className="input-field"
                    value={newRequest.aadhaar} onChange={e => setNewRequest({...newRequest, aadhaar: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Contact Email</label>
                <input 
                    type="email" placeholder="john@example.com" required
                    className="input-field"
                    value={newRequest.contact} onChange={e => setNewRequest({...newRequest, contact: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Harvest Date</label>
                <input 
                    type="date" required
                    className="input-field"
                    value={newRequest.harvestDate} onChange={e => setNewRequest({...newRequest, harvestDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Proof of Harvest</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-400 transition-colors bg-gray-50 cursor-pointer relative">
                    <input 
                        type="file" required
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        onChange={e => setNewRequest({...newRequest, proofFile: e.target.files[0]})}
                    />
                    <div className="text-center pointer-events-none">
                        <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                        <span className="text-sm text-gray-500 block">{newRequest.proofFile ? newRequest.proofFile.name : "Click to upload file"}</span>
                    </div>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowNewRequestForm(false)} className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="btn-primary px-8">Submit Request</button>
              </div>
            </form>
          </div>
        )}

        {/* Requests List */}
        {loading ? (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        ) : requests.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
                <Upload size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium">No requests found.</p>
                <p className="text-gray-400 text-sm">Start by creating a new harvest request.</p>
            </div>
        ) : (
          <div className="grid gap-6">
            {requests.map(request => (
              <div key={request.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                
                {/* Card Header */}
                <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-xs font-bold text-gray-400 uppercase tracking-widest">REQ #{request.id}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> {new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <h3 className="text-lg font-bold text-gray-800">Paddy Harvest at {request.village}</h3>
                         {getStatusBadge(request.status)}
                      </div>
                   </div>
                   
                   {request.serialNumber && (
                      <div className="bg-primary-50 px-4 py-2 rounded-xl border border-primary-100 flex flex-col items-end">
                        <span className="text-xs text-primary-600 font-semibold uppercase tracking-wider">Serial Number</span>
                        <span className="text-xl font-mono font-bold text-primary-700 tracking-tight">{request.serialNumber}</span>
                      </div>
                   )}
                </div>

                {/* Card Body */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm text-gray-600 mb-6">
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span>Harvest Date</span>
                            <span className="font-medium text-gray-800">{request.harvestDate}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span>Contact</span>
                            <span className="font-medium text-gray-800">{request.contact}</span>
                        </div>
                        
                        {request.rejectionReason && (
                            <div className="md:col-span-2 bg-red-50 p-4 rounded-xl border border-red-100 text-red-700 flex items-start gap-3 mt-2">
                                <XCircle className="mt-0.5 flex-shrink-0" size={18} />
                                <div>
                                    <strong className="block font-semibold mb-1">Request Rejected</strong>
                                    <p>{request.rejectionReason}</p>
                                </div>
                            </div>
                        )}

                        {request.billGenerated && (
                            <div className="md:col-span-2 bg-green-50 p-4 rounded-xl border border-green-100 text-green-800 flex items-start gap-3 mt-2 animate-fade-in relative">
                                <CheckCircle className="mt-0.5 flex-shrink-0" size={18} />
                                <div className="flex-1">
                                    <strong className="block font-semibold mb-1">Final Bill Generated!</strong>
                                    <p>Total Paddy Bags Sold: <span className="font-bold text-lg">{request.paddyBags}</span></p>
                                    <p className="text-xs mt-2 text-green-700">You can download your digital bill below.</p>
                                    
                                    <button 
                                        onClick={async () => {
                                            try {
                                                const response = await api.get(`/requests/${request.id}/bill-pdf`, { responseType: 'blob' });
                                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.setAttribute('download', `bill-${request.serialNumber}.pdf`);
                                                document.body.appendChild(link);
                                                link.click();
                                            } catch (e) {
                                                alert("Failed to download bill");
                                            }
                                        }}
                                        className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-green-700 flex items-center gap-2"
                                    >
                                        <FileText size={16} /> Download Bill PDF
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Area: Upload Final Docs */}
                    {request.status === 'approved' && (
                       <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100 animate-fade-in relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
                         <div className="flex items-center gap-2 mb-4 text-blue-800">
                            <Tag size={20} /> 
                            <h3 className="font-bold text-lg">Action Required</h3>
                         </div>
                         <p className="text-sm text-blue-600 mb-6">You have been assigned a serial number. Please sell your paddy and upload the following documents to proceed with billing.</p>
                         
                         <form onSubmit={handleFinalDocsSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { lbl: 'Land Document', key: 'landDoc' }, 
                                { lbl: 'Aadhaar Card', key: 'aadhaarDoc' },
                                { lbl: 'Bank Details', key: 'bankDoc' },
                                { lbl: 'Truck Sheet', key: 'truckSheet' }
                            ].map((field) => (
                                <div key={field.key} className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{field.lbl}</label>
                                    <input type="file" required className="text-sm w-full file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                                    onChange={e => {
                                        setFinalDocs(prev => ({...prev, [field.key]: e.target.files[0]}));
                                        setSelectedRequestId(request.id);
                                    }} />
                                </div>
                            ))}
                            
                            <div className="sm:col-span-2 pt-2">
                                 <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/30 transition-transform transform active:scale-95">
                                    Confirm & Submit Documents
                                 </button>
                            </div>
                         </form>
                       </div>
                    )}
                    
                     {request.status === 'rejected' && (
                        <div className="mt-4 flex justify-end">
                            <button onClick={() => setShowNewRequestForm(true)} className="text-secondary-600 hover:text-secondary-700 font-medium underline text-sm flex items-center gap-1 transition-colors">
                                <Plus size={14}/> Submit New Request
                            </button>
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showSerialsModal && <VillageSerialsModal onClose={() => setShowSerialsModal(false)} />}
    </div>
  );
};

export default FarmerDashboard;
