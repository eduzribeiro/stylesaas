import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Scissors, Hash } from 'lucide-react';
import { useAuth } from '../src/context';
import { COLORS } from '../constants';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [linkingCode, setLinkingCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    // Client flow only for now via this endpoint
    try {
      await register(email, password, name, linkingCode);
      setSuccess(true);
      setTimeout(() => {
        navigate('/client');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar, verifique o código.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mint-400space-900 p-6">
        <div className="max-w-md w-full bg-mint-400space-800 p-8 rounded-2xl border border-mint-400space-700 shadow-2xl text-mint-400center">
          <div className="w-16 h-16 bg-mint-400mint-500/10 text-mint-400mint-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-mint-4002xl font-bold text-mint-400chrome mb-2">Conta Criada!</h2>
          <p className="text-mint-400silver-400 mb-6">Redirecionando para o seu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mint-400space-900 p-6">
      <div className="max-w-md w-full">
        <div className="text-mint-400center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl shadow-mint-500/20 mb-4 overflow-hidden`}>
              <img src="/logo.png" alt="StyleSaaS Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-mint-4003xl font-bold text-mint-400chrome mb-2">Novo Cadastro</h1>
          <p className="text-mint-400silver-400">Insira o código da barbearia para se vincular.</p>
        </div>

        <div className="bg-mint-400space-800 p-8 rounded-2xl border border-mint-400space-700 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-mint-400red-500/10 text-mint-400red-400 p-3 rounded-lg text-mint-400sm border border-mint-400red-500/20">
                {error}
              </div>
            )}

            <div>
              <label className="block text-mint-400sm font-medium text-mint-400silver-300 mb-1">Nome Completo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mint-400space-500">
                  <User size={20} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-mint-400space-900 border border-mint-400space-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mint-500/50 focus:border-mint-400mint-500 text-mint-400silver-200"
                  placeholder="Ex: Carlos Albuquerque"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-mint-400sm font-medium text-mint-400silver-300 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-mint-400space-900 border border-mint-400space-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mint-500/50 focus:border-mint-400mint-500 text-mint-400silver-200"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-mint-400sm font-medium text-mint-400silver-300 mb-1">Código da Barbearia</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mint-400space-500">
                  <Hash size={20} />
                </span>
                <input
                  type="text"
                  value={linkingCode}
                  onChange={(e) => setLinkingCode(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 bg-mint-400space-900 border border-mint-400space-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mint-500/50 focus:border-mint-400mint-500 text-mint-400silver-200"
                  placeholder="Ex: TRIBOROTEX"
                  required={email.toLowerCase().trim() !== 'eduzribeiro@gmail.com'}
                />
              </div>
            </div>

            <div>
              <label className="block text-mint-400sm font-medium text-mint-400silver-300 mb-1">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-mint-400space-900 border border-mint-400space-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mint-500/50 focus:border-mint-400mint-500 text-mint-400silver-200"
                  placeholder="Mínimo de 6 caracteres"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mint-400space-500 hover:text-mint-400mint-500"
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
              {loading ? 'Cadastrando...' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 text-mint-400center">
            <Link to="/login" className={`text-mint-400sm text-mint-400mint-500${COLORS.primary} font-medium hover:underline`}>
              Voltar para o Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
