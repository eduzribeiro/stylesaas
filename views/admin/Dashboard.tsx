import React, { useEffect, useState } from 'react';
import { Building2, Users, CalendarCheck, TrendingUp, LayoutDashboard, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../src/context';
import { supabase } from '../../src/lib/supabase';
import { COLORS } from '../../constants';

interface DashboardStats {
  totalShops: number;
  totalUsers: number;
  totalAppointments: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'shops' | 'users'>('overview');

  const [stats, setStats] = useState<DashboardStats>({
    totalShops: 0,
    totalUsers: 0,
    totalAppointments: 0,
  });

  const [shopsList, setShopsList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Parallel queries
        const [shopsRes, usersRes, appsRes] = await Promise.all([
          supabase.from('shops').select('*', { count: 'exact' }),
          supabase.from('profiles').select('*', { count: 'exact' }),
          supabase.from('appointments').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          totalShops: shopsRes.count || 0,
          totalUsers: usersRes.count || 0,
          totalAppointments: appsRes.count || 0,
        });

        if (shopsRes.data) setShopsList(shopsRes.data);
        if (usersRes.data) setUsersList(usersRes.data);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-8 text-chrome space-y-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-chrome to-silver-400 bg-clip-text text-transparent">
            Gestão Master
          </h1>
          <p className="text-silver-400 mt-2">Controle total de Barbearias, Usuários e Plataforma.</p>
        </div>
        <div className="flex items-center gap-3 bg-space-800 p-3 rounded-xl border border-space-700">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${COLORS.primary} text-space-900 overflow-hidden`}>
            <img src="/logo.png" alt="StyleSaaS Logo" className="w-full h-full object-cover" />
          </div>
          <div className="text-sm">
            <p className="font-bold text-silver-200">{user?.profile.name}</p>
            <p className="text-mint-500 font-medium tracking-wide text-[10px] uppercase">Acesso Ilimitado</p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex space-x-2 border-b border-space-700 pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'overview' ? `border-${COLORS.primary} text-${COLORS.primary}` : 'border-transparent text-silver-400 hover:text-silver-200'}`}
        >
          <LayoutDashboard size={18} />
          Visão Geral
        </button>
        <button
          onClick={() => setActiveTab('shops')}
          className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'shops' ? `border-${COLORS.primary} text-${COLORS.primary}` : 'border-transparent text-silver-400 hover:text-silver-200'}`}
        >
          <Building2 size={18} />
          Barbearias
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'users' ? `border-${COLORS.primary} text-${COLORS.primary}` : 'border-transparent text-silver-400 hover:text-silver-200'}`}
        >
          <Users size={18} />
          Usuários Master
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
          <div className="h-32 bg-space-800 rounded-2xl" />
          <div className="h-32 bg-space-800 rounded-2xl" />
          <div className="h-32 bg-space-800 rounded-2xl" />
          <div className="h-32 bg-space-800 rounded-2xl" />
        </div>
      ) : (
        <>
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-space-800 rounded-2xl p-6 border border-space-700 shadow-xl relative overflow-hidden group hover:border-mint-500/30 transition-colors">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-mint-500/10 rounded-full blur-2xl group-hover:bg-mint-500/20 transition-all" />
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 bg-space-900 rounded-xl text-${COLORS.primary}`}>
                    <Building2 size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-silver-400 text-sm font-medium mb-1">Barbearias Ativas</p>
                  <h3 className="text-3xl font-bold text-chrome">{stats.totalShops}</h3>
                </div>
              </div>

              <div className="bg-space-800 rounded-2xl p-6 border border-space-700 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 bg-space-900 rounded-xl text-blue-400`}>
                    <Users size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-silver-400 text-sm font-medium mb-1">Total de Contas</p>
                  <h3 className="text-3xl font-bold text-chrome">{stats.totalUsers}</h3>
                </div>
              </div>

              <div className="bg-space-800 rounded-2xl p-6 border border-space-700 shadow-xl relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 bg-space-900 rounded-xl text-purple-400`}>
                    <CalendarCheck size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-silver-400 text-sm font-medium mb-1">Agendamentos Reais</p>
                  <h3 className="text-3xl font-bold text-chrome">{stats.totalAppointments}</h3>
                </div>
              </div>

              <div className="bg-space-800 rounded-2xl p-6 border border-space-700 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 bg-space-900 rounded-xl text-emerald-400`}>
                    <TrendingUp size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-silver-400 text-sm font-medium mb-1">SaaS Status Core</p>
                  <h3 className="text-xl font-bold text-chrome mt-2 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-emerald-500" /> Operacional
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SHOPS */}
          {activeTab === 'shops' && (
            <div className="bg-space-800 border border-space-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in">
              <div className="p-6 border-b border-space-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-chrome flex items-center gap-2">
                  <Building2 className={`text-${COLORS.primary}`} />
                  Barbearias Registradas
                </h2>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-space-500" />
                  <input type="text" placeholder="Buscar Barbearia..." className="bg-space-900 border border-space-700 text-sm text-silver-200 py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:border-mint-500" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-silver-300">
                  <thead className="text-xs uppercase bg-space-900/50 text-silver-400">
                    <tr>
                      <th className="px-6 py-4 font-medium">Nome (Linking Code)</th>
                      <th className="px-6 py-4 font-medium">Fidelidade</th>
                      <th className="px-6 py-4 font-medium text-right">Data de Cadastro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-space-700">
                    {shopsList.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-silver-500">Nenhuma barbearia gerada no sistema.</td>
                      </tr>
                    ) : shopsList.map((shop) => (
                      <tr key={shop.id} className="hover:bg-space-700/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-chrome">
                          {shop.name}
                          <span className="ml-2 px-2 py-0.5 rounded-md bg-space-900 border border-space-600 font-mono text-xs text-mint-400">
                            {shop.linking_code}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {shop.loyalty_enabled ? (
                            <span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded text-xs">Ativado ({shop.loyalty_goal} metas)</span>
                          ) : (
                            <span className="text-space-500 bg-space-900 px-2 py-1 rounded text-xs">Desativado</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right tabular-nums text-silver-500">
                          {new Date(shop.created_at).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: USERS */}
          {activeTab === 'users' && (
            <div className="bg-space-800 border border-space-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in">
              <div className="p-6 border-b border-space-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-chrome flex items-center gap-2">
                  <Users className={`text-${COLORS.primary}`} />
                  Contas Globais
                </h2>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-space-500" />
                  <input type="text" placeholder="Buscar por email..." className="bg-space-900 border border-space-700 text-sm text-silver-200 py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:border-mint-500" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-silver-300">
                  <thead className="text-xs uppercase bg-space-900/50 text-silver-400">
                    <tr>
                      <th className="px-6 py-4 font-medium">Conta / Nome</th>
                      <th className="px-6 py-4 font-medium">E-mail</th>
                      <th className="px-6 py-4 font-medium">Nível de Acesso (Role)</th>
                      <th className="px-6 py-4 font-medium text-right">Data Ingestão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-space-700">
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-silver-500">Sem acessos registrados.</td>
                      </tr>
                    ) : usersList.map((usr) => (
                      <tr key={usr.id} className="hover:bg-space-700/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-silver-200">{usr.name}</td>
                        <td className="px-6 py-4 text-silver-400">{usr.email}</td>
                        <td className="px-6 py-4">
                          {usr.role === 'admin' && <span className="text-purple-400 bg-purple-400/10 border border-purple-400/20 px-2 py-1 rounded text-xs font-bold uppercase">Master Admin</span>}
                          {usr.role === 'shop_owner' && <span className="text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded text-xs font-bold uppercase">Dono (Gestor)</span>}
                          {usr.role === 'staff' && <span className="text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-1 rounded text-xs font-bold uppercase">Staff Barbeiro</span>}
                          {usr.role === 'client' && <span className="text-space-400 bg-space-600/10 border border-space-600/20 px-2 py-1 rounded text-xs font-bold uppercase">Cliente Padrão</span>}
                        </td>
                        <td className="px-6 py-4 text-right tabular-nums text-silver-500">
                          {new Date(usr.created_at || new Date()).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
