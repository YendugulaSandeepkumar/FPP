import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Phone, Sprout } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ mobile: '', password: '', role: 'farmer' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(formData);
    if (result.success) {
      if (formData.role === 'farmer') navigate('/farmer/dashboard');
      else navigate('/vao/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 items-center justify-center p-4">
      <div className="glass-effect p-8 rounded-2xl shadow-xl w-full max-w-md transform transition-all hover:shadow-2xl border border-white/50 animate-fade-in">
        
        <div className="text-center mb-8">
          <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 shadow-inner">
            <Sprout size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Welcome Back</h2>
          <p className="text-gray-500 mt-2 text-sm">Sign in to Farmer Paddy Portal</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-6 text-sm flex items-center shadow-sm animate-pulse">
            <span className="font-medium mr-1">Error:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl mb-6 shadow-inner">
            <button
              type="button"
              className={`py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${formData.role === 'farmer' ? 'bg-white text-primary-700 shadow-md transform scale-[1.02]' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setFormData({ ...formData, role: 'farmer' })}
            >
              Farmer
            </button>
            <button
              type="button"
              className={`py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${formData.role === 'vao' ? 'bg-white text-primary-700 shadow-md transform scale-[1.02]' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setFormData({ ...formData, role: 'vao' })}
            >
              VAO (Admin)
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                name="mobile"
                type="text"
                placeholder="Mobile Number"
                className="input-field pl-10"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="input-field pl-10"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full btn-primary py-3 text-lg shadow-lg shadow-primary-500/30">
            Login
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-all">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
