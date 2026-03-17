import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../src/context';
import { COLORS } from '../constants';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);

      // Redirect based on role
      switch (user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'shop_owner':
          navigate('/owner');
          break;
        case 'staff':
          navigate('/staff');
          break;
        case 'client':
          navigate('/client');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mint-400space-900 p-6">
      <div className="max-w-md w-full">
        <div className="text-mint-400center mb-8">
          <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl shadow-mint-500/20 mb-4 overflow-hidden`}>
            <img src="/logo.png" alt="StyleSaaS Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-mint-4003xl font-bold text-mint-400chrome flex flex-col gap-1 items-center justify-center">
            StyleSaaS
          </h1>
          <p className="text-mint-400silver-400 mt-2">Gestão Estética Inteligente</p>
        </div>

        <div className="bg-mint-400space-800 p-8 rounded-2xl border border-mint-400space-700 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-mint-400red-500/10 text-mint-400red-400 p-3 rounded-lg text-mint-400sm border border-mint-400red-500/20">
                {error}
              </div>
            )}

            <div>
              <label className="block text-mint-400sm font-medium text-mint-400silver-300 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-mint-400space-900 border border-mint-400space-700 text-mint-400silver-200 focus:outline-none focus:ring-2 focus:ring-mint-500/50 focus:border-mint-400mint-500 transition-all"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-mint-400sm font-medium text-mint-400silver-300 mb-1">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-mint-400space-900 border border-mint-400space-700 text-mint-400silver-200 focus:outline-none focus:ring-2 focus:ring-mint-500/50 focus:border-mint-400mint-500 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mint-400space-500 hover:text-mint-400mint-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-mint-400mint-500${COLORS.primary} hover:bg-mint-400mint-500${COLORS.secondary} disabled:bg-mint-400mint-500/50 text-mint-400space-900 font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-mint-500/20`}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-mint-400mint-500t border-mint-400space-700 text-mint-400center">
            <p className="text-mint-400silver-400 text-mint-400sm">
              Novo cliente?{' '}
              <Link to="/register" className={`text-mint-400mint-500${COLORS.primary} font-bold hover:underline`}>
                Cadastre-se com código
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
