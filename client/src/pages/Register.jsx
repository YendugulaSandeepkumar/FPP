import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Phone, MapPin, Key, Leaf, Heart } from 'lucide-react';
import api from '../api';

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: '', mobile: '', password: '', role: 'farmer', village: '', secretKey: '' 
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', formData);
      navigate('/login'); 
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-primary-100 items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg transform transition-all hover:shadow-2xl border border-gray-100 animate-slide-up relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Leaf size={64} className="text-primary-500" />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Create Account</h2>
          <p className="text-gray-500 mt-2 text-sm">Join the Farmer Paddy Portal Community</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-6 text-sm flex items-center shadow-sm animate-pulse">
            <span className="font-medium mr-1">Error:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Role Selection */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              type="button"
              className={`px-6 py-2 rounded-full border transition-all duration-300 transform active:scale-95 ${formData.role === 'farmer' ? 'bg-primary-500 text-white border-primary-500 shadow-lg scale-105' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
              onClick={() => setFormData({ ...formData, role: 'farmer' })}
            >
              For Farmers
            </button>
            <button
              type="button"
              className={`px-6 py-2 rounded-full border transition-all duration-300 transform active:scale-95 ${formData.role === 'vao' ? 'bg-primary-500 text-white border-primary-500 shadow-lg scale-105' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
              onClick={() => setFormData({ ...formData, role: 'vao' })}
            >
              For VAO
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group col-span-2 md:col-span-1">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                name="name"
                type="text"
                placeholder="Full Name"
                className="input-field pl-10 w-full"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative group col-span-2 md:col-span-1">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                name="mobile"
                type="text"
                placeholder="Mobile Number"
                className="input-field pl-10 w-full"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative group col-span-2">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                name="village"
                type="text"
                placeholder="Village Name"
                className="input-field pl-10 w-full"
                value={formData.village}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative group col-span-2">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                name="password"
                type="password"
                placeholder="Create Password"
                className="input-field pl-10 w-full"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            {formData.role === 'vao' && (
              <div className="relative group col-span-2 animate-fade-in">
                <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  name="secretKey"
                  type="text"
                  placeholder="Secret Key (Provided by Admin)"
                  className="input-field pl-10 w-full border-primary-200 bg-primary-50 focus:ring-primary-500"
                  value={formData.secretKey}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
          </div>

          <button type="submit" className="w-full btn-primary py-3 text-lg font-bold shadow-lg shadow-primary-500/30 mt-6 transform hover:scale-[1.01] transition-transform">
            Sign Up Now
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-all">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
