import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';
import api from '../api';

const AnalyticsPanel = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/analytics/dashboard');
                setData(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const handleExport = async () => {
        try {
            const response = await api.get('/analytics/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'village-report.csv');
            document.body.appendChild(link);
            link.click();
        } catch (e) {
            alert("Export failed");
        }
    };

    if (loading) return <div className="h-40 flex items-center justify-center">Loading Analytics...</div>;
    if (!data) return null;

    const statusData = [
        { name: 'Pending', value: data.pending, color: '#facc15' },
        { name: 'Approved', value: data.approved, color: '#10b981' },
        { name: 'Completed', value: data.completed, color: '#047857' },
    ];

    const procurementData = [
       { name: 'Procured', bags: data.totalBags },
       { name: 'Target', bags: data.target }
    ];

    return (
        <div className="space-y-6 mb-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Analytics & Reports</h2>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors"
                >
                    <Download size={16} /> Export CSV
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stats Cards */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                     <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Request Status Distribution</h3>
                     <div style={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center' }}>
                        <PieChart width={350} height={300}>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                     </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Procurement vs Target</h3>
                     <div style={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center' }}>
                        <BarChart width={400} height={300} data={procurementData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="bags" fill="#059669" barSize={50} radius={[4, 4, 0, 0]} />
                        </BarChart>
                     </div>
                     <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">Total Procured: <span className="font-bold text-gray-800">{data.totalBags} Bags</span></p>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPanel;
