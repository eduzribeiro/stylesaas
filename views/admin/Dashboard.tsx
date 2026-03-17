import React, { useEffect, useState } from 'react';
import { Building2, Users, CalendarCheck, TrendingUp, Scissors } from 'lucide-react';
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
  const [stats, setStats] = useState<DashboardStats>({
    totalShops: 0,
    totalUsers: 0,
    totalAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);

        // Parallel queries to fetch overall platform stats
        const [shopsRes, usersRes, appsRes] = await Promise.all([
          supabase.from('shops').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('appointments').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          totalShops: shopsRes.count || 0,
          totalUsers: usersRes.count || 0,
          totalAppointments: appsRes.count || 0,
        });
      } catch (err) {
        console.error('Erro ao buscar estatísticas do Admin:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  return (
    <div className="p-4 md:p-8 text-chrome space-y-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-chrome to-silver-400 bg-clip-text text-transparent">
            Painel de Controle
          </h1>
          <p className="text-silver-400 mt-2">Visão geral do ecossistema StyleSaaS.</p>
        </div>
        <div className="flex items-center gap-3 bg-space-800 p-3 rounded-xl border border-space-700">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${COLORS.primary} text-space-900 overflow-hidden`}>
            <img src="/logo.png" alt="StyleSaaS Logo" className="w-full h-full object-cover" />
          </div>
          <div className="text-sm">
            <p className="font-bold text-silver-200">Admin Master</p>
            <p className="text-mint-500">Acesso Total</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-space-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
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

          {/* Card 2 */}
          <div className="bg-space-800 rounded-2xl p-6 border border-space-700 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-colors">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 bg-space-900 rounded-xl text-blue-400`}>
                <Users size={24} />
              </div>
            </div>
            <div>
              <p className="text-silver-400 text-sm font-medium mb-1">Usuários na Plataforma</p>
              <h3 className="text-3xl font-bold text-chrome">{stats.totalUsers}</h3>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-space-800 rounded-2xl p-6 border border-space-700 shadow-xl relative overflow-hidden group hover:border-purple-500/30 transition-colors">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 bg-space-900 rounded-xl text-purple-400`}>
                <CalendarCheck size={24} />
              </div>
            </div>
            <div>
              <p className="text-silver-400 text-sm font-medium mb-1">Agendamentos Totais</p>
              <h3 className="text-3xl font-bold text-chrome">{stats.totalAppointments}</h3>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-space-800 rounded-2xl p-6 border border-space-700 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 bg-space-900 rounded-xl text-emerald-400`}>
                <TrendingUp size={24} />
              </div>
            </div>
            <div>
              <p className="text-silver-400 text-sm font-medium mb-1">Status da Plataforma</p>
              <h3 className="text-2xl font-bold text-chrome mt-1">Operacional</h3>
            </div>
          </div>
        </div>
      )}

      {/* Decorative Infrastructure Map Placeholder */}
      <div className="mt-8 bg-space-800 border border-space-700 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4 py-8">
          <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl shadow-mint-500/20 mb-4 overflow-hidden border border-space-600`}>
            <img src="/logo.png" alt="StyleSaaS Core Engine" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-chrome">StyleSaaS Core Engine</h2>
          <p className="text-silver-400 max-w-2xl mx-auto">
            A infraestrutura inteligente de barbearias está ativa com controle transacional e de disponibilidade sendo geridos a nível de alta complexidade em Background.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
