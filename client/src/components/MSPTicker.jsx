import React, { useEffect, useState } from 'react';

const MSPTicker = () => {
    const list = [
        { grade: 'Common Paddy', price: '₹2,183 / Qtl' },
        { grade: 'Grade A Paddy', price: '₹2,203 / Qtl' },
        { grade: 'Hybrid Paddy', price: '₹2,300 / Qtl' }
    ];

    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex(prev => (prev + 1) % list.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-gradient-to-r from-emerald-600 to-green-500 rounded-xl p-4 shadow-lg text-white relative overflow-hidden flex items-center h-full">
            <div className="absolute inset-0 bg-white/10 opacity-20 transform -skew-x-12"></div>
            
            <div className="relative z-10 w-full">
                <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest mb-1">Government MSP Today</p>
                <div className="flex justify-between items-end animate-slide-up" key={index}>
                    <h3 className="text-xl font-bold">{list[index].grade}</h3>
                    <span className="text-2xl font-mono font-black text-white drop-shadow-md">{list[index].price}</span>
                </div>
            </div>
            
            <div className="absolute bottom-2 right-2 flex space-x-1">
                {list.map((_, i) => (
                    <div key={i} className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${i === index ? 'bg-white w-3' : 'bg-white/40'}`}></div>
                ))}
            </div>
        </div>
    );
};

export default MSPTicker;
