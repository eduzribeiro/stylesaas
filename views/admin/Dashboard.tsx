import React, { useEffect, useState } from 'react';
import { Building2, Users, CalendarCheck, TrendingUp, LayoutDashboard, Search, ShieldCheck, Plus, Settings2, Trash2, X } from 'lucide-react';
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

  // Modals state
  const [isNewShopModalOpen, setIsNewShopModalOpen] = useState(false);
  const [newShopName, setNewShopName] = useState('');

  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editUserRole, setEditUserRole] = useState('');
  const [editUserShopId, setEditUserShopId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shopsRes, usersRes, appsRes] = await Promise.all([
        supabase.from('shops').select('*', { count: 'exact' }),
        supabase.from('profiles').select('*', { count: 'exact', head: false }), // we need the profiles
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

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName.trim()) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const linkingCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error } = await supabase.from('shops').insert([
        { name: newShopName.trim(), linking_code: linkingCode }
      ]);
      if (error) throw error;

      setIsNewShopModalOpen(false);
      setNewShopName('');
      fetchData(); // Refresh list
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao criar barbearia');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditUser = (u: any) => {
    setSelectedUser(u);
    setEditUserRole(u.role);
    setEditUserShopId(u.shop_id || '');
    setIsEditUserModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role: editUserRole,
          shop_id: editUserShopId ? editUserShopId : null
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      setIsEditUserModalOpen(false);
      fetchData(); // Refresh list
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao atualizar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteShop = async (shopId: string) => {
    if (!window.confirm("Atenção: Deletar a barbearia apagará serviços e possivelmente agendamentos. Deseja continuar?")) return;
    try {
      await supabase.from('shops').delete().eq('id', shopId);
      fetchData();
    } catch (err) {
      alert("Erro ao deletar. Remova as dependências primeiro.");
    }
  }

  return (
    <div className="p-4 md:p-8 text-mint-400chrome space-y-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-mint-4003xl font-bold bg-mint-400mint-500gradient-to-r from-chrome to-silver-400 bg-mint-400mint-500clip-text text-mint-400mint-500transparent">
            Gestão Master
          </h1>
          <p className="text-mint-400silver-400 mt-2">Controle total de Barbearias, Usuários e Plataforma.</p>
        </div>
        <div className="flex items-center gap-3 bg-mint-400space-800 p-3 rounded-xl border border-mint-400space-700 shadow-lg">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-mint-400mint-500${COLORS.primary} text-mint-400space-900 overflow-hidden`}>
            <img src="/logo.png" alt="StyleSaaS Logo" className="w-full h-full object-cover" />
          </div>
          <div className="text-mint-400sm">
            <p className="font-bold text-mint-400silver-200">{user?.profile.name}</p>
            <p className="text-mint-400mint-500 font-medium tracking-wide text-mint-400[10px] uppercase">Acesso Ilimitado</p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex space-x-2 border-mint-400b border-mint-400space-700 pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 border-mint-400b-2 font-medium text-mint-400sm transition-colors flex items-center gap-2 ${activeTab === 'overview' ? `border-mint-400mint-500 text-mint-400mint-500` : 'border-mint-400transparent text-mint-400silver-400 hover:text-mint-400silver-200'}`}
        >
          <LayoutDashboard size={18} />
          Visão Geral
        </button>
        <button
          onClick={() => setActiveTab('shops')}
          className={`px-4 py-2 border-mint-400b-2 font-medium text-mint-400sm transition-colors flex items-center gap-2 ${activeTab === 'shops' ? `border-mint-400mint-500 text-mint-400mint-500` : 'border-mint-400transparent text-mint-400silver-400 hover:text-mint-400silver-200'}`}
        >
          <Building2 size={18} />
          Barbearias
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 border-mint-400b-2 font-medium text-mint-400sm transition-colors flex items-center gap-2 ${activeTab === 'users' ? `border-mint-400mint-500 text-mint-400mint-500` : 'border-mint-400transparent text-mint-400silver-400 hover:text-mint-400silver-200'}`}
        >
          <Users size={18} />
          Controle de Acessos
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
          <div className="h-32 bg-mint-400space-800 rounded-2xl" />
          <div className="h-32 bg-mint-400space-800 rounded-2xl" />
          <div className="h-32 bg-mint-400space-800 rounded-2xl" />
          <div className="h-32 bg-mint-400space-800 rounded-2xl" />
        </div>
      ) : (
        <>
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-mint-400space-800 rounded-2xl p-6 border border-mint-400space-700 shadow-xl relative overflow-hidden group hover:border-mint-400mint-500/30 transition-colors">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-mint-400mint-500/10 rounded-full blur-2xl group-hover:bg-mint-400mint-500/20 transition-all" />
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 bg-mint-400space-900 rounded-xl text-mint-400mint-500${COLORS.primary}`}>
                    <Building2 size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-mint-400silver-400 text-mint-400sm font-medium mb-1">Barbearias Ativas</p>
                  <h3 className="text-mint-4003xl font-bold text-mint-400chrome">{stats.totalShops}</h3>
                </div>
              </div>

              <div className="bg-mint-400space-800 rounded-2xl p-6 border border-mint-400space-700 shadow-xl relative overflow-hidden group hover:border-mint-400blue-500/30 transition-colors">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-mint-400blue-500/10 rounded-full blur-2xl group-hover:bg-mint-400blue-500/20 transition-all" />
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 bg-mint-400space-900 rounded-xl text-mint-400blue-400`}>
                    <Users size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-mint-400silver-400 text-mint-400sm font-medium mb-1">Total de Contas</p>
                  <h3 className="text-mint-4003xl font-bold text-mint-400chrome">{stats.totalUsers}</h3>
                </div>
              </div>

              <div className="bg-mint-400space-800 rounded-2xl p-6 border border-mint-400space-700 shadow-xl relative overflow-hidden group hover:border-mint-400mint-500purple-500/30 transition-colors">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-mint-400mint-500purple-500/10 rounded-full blur-2xl group-hover:bg-mint-400mint-500purple-500/20 transition-all" />
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 bg-mint-400space-900 rounded-xl text-mint-400mint-500purple-400`}>
                    <CalendarCheck size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-mint-400silver-400 text-mint-400sm font-medium mb-1">Agendamentos Reais</p>
                  <h3 className="text-mint-4003xl font-bold text-mint-400chrome">{stats.totalAppointments}</h3>
                </div>
              </div>

              <div className="bg-mint-400space-800 rounded-2xl p-6 border border-mint-400space-700 shadow-xl relative overflow-hidden group hover:border-mint-400emerald-500/30 transition-colors">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-mint-400emerald-500/10 rounded-full blur-2xl group-hover:bg-mint-400emerald-500/20 transition-all" />
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 bg-mint-400space-900 rounded-xl text-mint-400emerald-400`}>
                    <TrendingUp size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-mint-400silver-400 text-mint-400sm font-medium mb-1">SaaS Status Core</p>
                  <h3 className="text-mint-400mint-500xl font-bold text-mint-400chrome mt-2 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-mint-400emerald-500" /> Operacional
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SHOPS */}
          {activeTab === 'shops' && (
            <div className="bg-mint-400space-800 border border-mint-400space-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in">
              <div className="p-6 border-mint-400b border-mint-400space-700 flex justify-between items-center bg-mint-400space-900/40">
                <h2 className="text-mint-400mint-500xl font-bold text-mint-400chrome flex items-center gap-2">
                  <Building2 className={`text-mint-400mint-500${COLORS.primary}`} />
                  Gerenciamento de Barbearias
                </h2>
                <div className="flex items-center gap-4">
                  <div className="relative hidden sm:block">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-mint-400space-500" />
                    <input type="text" placeholder="Pesquisar..." className="bg-mint-400space-900 border border-mint-400space-700 text-mint-400sm text-mint-400silver-200 py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:border-mint-400mint-500" />
                  </div>
                  <button
                    onClick={() => setIsNewShopModalOpen(true)}
                    className="flex items-center gap-2 bg-mint-400mint-600 hover:bg-mint-400mint-500 text-mint-400space-900 font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-mint-500/20"
                  >
                    <Plus size={18} /> Nova Barbearia
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-mint-400mint-500left text-mint-400sm text-mint-400silver-300">
                  <thead className="text-mint-400xs uppercase bg-mint-400space-900/50 text-mint-400silver-400 border-mint-400b border-mint-400space-700">
                    <tr>
                      <th className="px-6 py-4 font-medium">Nome (Linking Code)</th>
                      <th className="px-6 py-4 font-medium">Fidelidade</th>
                      <th className="px-6 py-4 font-medium text-mint-400mint-500right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-space-700">
                    {shopsList.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-mint-400center text-mint-400silver-500">Nenhuma barbearia gerada no sistema.</td>
                      </tr>
                    ) : shopsList.map((shop) => (
                      <tr key={shop.id} className="hover:bg-mint-400space-700/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-mint-400chrome">
                          {shop.name}
                          <span className="ml-2 px-2 py-0.5 rounded-md bg-mint-400space-900 border border-mint-400space-600 font-mono text-mint-400xs text-mint-400mint-500">
                            {shop.linking_code}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {shop.loyalty_enabled ? (
                            <span className="text-mint-400emerald-400 bg-mint-400emerald-400/10 border border-mint-400emerald-400/20 px-2 py-1 rounded text-mint-400xs">Ativado ({shop.loyalty_goal} pt)</span>
                          ) : (
                            <span className="text-mint-400space-500 bg-mint-400space-900 border border-mint-400space-700 px-2 py-1 rounded text-mint-400xs">Desativado</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-mint-400mint-500right">
                          <button onClick={() => handleDeleteShop(shop.id)} className="p-2 text-mint-400red-400/70 hover:text-mint-400red-400 hover:bg-mint-400red-400/10 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
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
            <div className="bg-mint-400space-800 border border-mint-400space-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in">
              <div className="p-6 border-mint-400b border-mint-400space-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-mint-400space-900/40">
                <h2 className="text-mint-400mint-500xl font-bold text-mint-400chrome flex items-center gap-2">
                  <Settings2 className={`text-mint-400mint-500${COLORS.primary}`} />
                  Controle de Acessos Dinâmico
                </h2>
                <div className="relative w-full sm:w-auto">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-mint-400space-500" />
                  <input type="text" placeholder="Buscar por email..." className="w-full sm:w-auto bg-mint-400space-900 border border-mint-400space-700 text-mint-400sm text-mint-400silver-200 py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:border-mint-400mint-500" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-mint-400mint-500left text-mint-400sm text-mint-400silver-300">
                  <thead className="text-mint-400xs uppercase bg-mint-400space-900/50 text-mint-400silver-400 border-mint-400b border-mint-400space-700">
                    <tr>
                      <th className="px-6 py-4 font-medium">Nome</th>
                      <th className="px-6 py-4 font-medium">E-mail</th>
                      <th className="px-6 py-4 font-medium">Barbearia Vinculada</th>
                      <th className="px-6 py-4 font-medium">Hierarquia</th>
                      <th className="px-6 py-4 font-medium text-mint-400mint-500right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-space-700">
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-mint-400center text-mint-400silver-500">Sem acessos registrados.</td>
                      </tr>
                    ) : usersList.map((usr) => {
                      const shopBinding = shopsList.find(s => s.id === usr.shop_id);
                      return (
                        <tr key={usr.id} className="hover:bg-mint-400space-700/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-mint-400silver-200">{usr.name}</td>
                          <td className="px-6 py-4 text-mint-400silver-400">{usr.email}</td>
                          <td className="px-6 py-4">
                            {shopBinding ? (
                              <span className="text-mint-400blue-300 font-medium bg-mint-400blue-500/10 px-2 py-1 rounded text-mint-400xs border border-mint-400blue-500/20">{shopBinding.name}</span>
                            ) : (
                              <span className="text-mint-400space-500">— Global / Solto —</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {usr.role === 'admin' && <span className="text-mint-400mint-500purple-400 bg-mint-400mint-500purple-400/10 border border-mint-400mint-500purple-400/20 px-2 py-1 rounded text-mint-400xs font-bold uppercase">Master Admin</span>}
                            {usr.role === 'shop_owner' && <span className="text-mint-400emerald-400 bg-mint-400emerald-400/10 border border-mint-400emerald-400/20 px-2 py-1 rounded text-mint-400xs font-bold uppercase">Dono (Gestor)</span>}
                            {usr.role === 'staff' && <span className="text-mint-400blue-400 bg-mint-400blue-400/10 border border-mint-400blue-400/20 px-2 py-1 rounded text-mint-400xs font-bold uppercase">Staff Barbeiro</span>}
                            {usr.role === 'client' && <span className="text-mint-400space-400 bg-mint-400space-600/10 border border-mint-400space-600/20 px-2 py-1 rounded text-mint-400xs font-bold uppercase">Cliente Padrão</span>}
                          </td>
                          <td className="px-6 py-4 text-mint-400mint-500right">
                            <button
                              onClick={() => handleOpenEditUser(usr)}
                              className="bg-mint-400space-700 hover:bg-mint-400space-600 text-mint-400silver-200 px-3 py-1.5 rounded-lg text-mint-400xs font-medium transition-colors border border-mint-400space-600"
                            >
                              Alterar Permissão
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL: Nova Barbearia */}
      {isNewShopModalOpen && (
        <div className="fixed inset-0 bg-mint-400space-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-mint-400space-800 rounded-2xl border border-mint-400space-700 p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-mint-400mint-500xl font-bold text-mint-400chrome">Criar Nova Barbearia</h3>
              <button onClick={() => setIsNewShopModalOpen(false)} className="text-mint-400space-500 hover:text-mint-400silver-200">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateShop} className="space-y-4">
              {errorMsg && <div className="p-3 bg-mint-400red-500/10 border border-mint-400red-500/20 rounded-xl text-mint-400red-400 text-mint-400sm">{errorMsg}</div>}
              <div>
                <label className="block text-mint-400sm font-medium text-mint-400silver-300 mb-1">Nome do Estabelecimento *</label>
                <input
                  type="text"
                  value={newShopName}
                  onChange={e => setNewShopName(e.target.value)}
                  className="w-full bg-mint-400space-900 border border-mint-400space-700 rounded-xl py-3 px-4 focus:outline-none focus:border-mint-400mint-500 text-mint-400silver-200"
                  placeholder="Ex: Barber Shop Vintage"
                  required
                />
              </div>
              <p className="text-mint-400xs text-mint-400space-500">O código VIP (Linking Code) será gerado automaticamente para que clientes se vinculem no cadastro.</p>

              <div className="flex gap-3 pt-4 border-mint-400mint-500t border-mint-400space-700">
                <button
                  type="button"
                  onClick={() => setIsNewShopModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-mint-400space-700 text-mint-400silver-300 hover:bg-mint-400space-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-mint-400mint-600 hover:bg-mint-400mint-500 text-mint-400space-900 font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Gerando...' : 'Salvar SaaS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit User Permissions */}
      {isEditUserModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-mint-400space-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-mint-400space-800 rounded-2xl border border-mint-400space-700 p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-mint-400mint-500xl font-bold text-mint-400chrome text-mint-400mint-500left">
                Editar Permissões <br />
                <span className="text-mint-400sm font-normal text-mint-400silver-500 block mt-1">{selectedUser.email}</span>
              </h3>
              <button onClick={() => setIsEditUserModalOpen(false)} className="text-mint-400space-500 hover:text-mint-400silver-200">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              {errorMsg && <div className="p-3 bg-mint-400red-500/10 border border-mint-400red-500/20 rounded-xl text-mint-400red-400 text-mint-400sm">{errorMsg}</div>}

              <div>
                <label className="block text-mint-400sm font-medium text-mint-400silver-300 mb-1">Hierarquia (Role) *</label>
                <select
                  value={editUserRole}
                  onChange={e => setEditUserRole(e.target.value)}
                  className="w-full bg-mint-400space-900 border border-mint-400space-700 rounded-xl py-3 px-4 focus:outline-none focus:border-mint-400mint-500 text-mint-400silver-200 appearance-none"
                  required
                >
                  <option value="client">Cliente Padrão</option>
                  <option value="staff">Staff Barbeiro</option>
                  <option value="shop_owner">Dono (Gestor Master da Barbearia)</option>
                  <option value="admin">Administrador Master do SaaS</option>
                </select>
              </div>

              {(editUserRole === 'shop_owner' || editUserRole === 'staff') && (
                <div>
                  <label className="block text-mint-400sm font-medium text-mint-400silver-300 mb-1">Vincular a qual Barbearia?</label>
                  <select
                    value={editUserShopId}
                    onChange={e => setEditUserShopId(e.target.value)}
                    className="w-full bg-mint-400space-900 border border-mint-400space-700 rounded-xl py-3 px-4 focus:outline-none focus:border-mint-400mint-500 text-mint-400silver-200 appearance-none"
                    required
                  >
                    <option value="">-- Selecione uma Barbearia --</option>
                    {shopsList.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.linking_code})</option>
                    ))}
                  </select>
                  <p className="text-mint-400xs text-mint-400blue-400/70 mt-2">DICA: Defina para &quot;Dono&quot; e ele poderá controlar tudo dentro desta barbearia selecionada.</p>
                </div>
              )}

              <div className="flex gap-3 pt-6 border-mint-400mint-500t border-mint-400space-700">
                <button
                  type="button"
                  onClick={() => setIsEditUserModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-mint-400space-700 text-mint-400silver-300 hover:bg-mint-400space-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-mint-400mint-500purple-600 hover:bg-mint-400mint-500purple-500 text-mint-400mint-500white font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Atualizar Permissões'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
