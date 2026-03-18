import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/context';
import { supabase } from '../../src/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { Users, Scissors, Plus, Trash2, Edit, X } from 'lucide-react';
import { COLORS } from '../../constants';

const TeamServices: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'services' | 'staff' | 'clients'>('services');

    const [services, setServices] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);

    // Modals
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [serviceForm, setServiceForm] = useState({ id: '', name: '', price: '', duration: '' });

    // Add Staff Modal State
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', commission_rate: '50' });
    const [staffLoading, setStaffLoading] = useState(false);

    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!user?.shop_id) return;
        setLoading(true);

        try {
            const { data: srvData } = await supabase
                .from('services')
                .select('*')
                .eq('shop_id', user.shop_id)
                .order('name');
            setServices(srvData || []);

            const { data: stfData } = await supabase
                .from('profiles')
                .select('*, staff_details(*)')
                .eq('shop_id', user.shop_id)
                .eq('role', 'staff');
            setStaff(stfData || []);

            const { data: clientData } = await supabase
                .from('profiles')
                .select('*')
                .eq('shop_id', user.shop_id)
                .eq('role', 'client');
            setClients(clientData || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleSaveService = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.shop_id) return;

        try {
            if (serviceForm.id) {
                await supabase.from('services').update({
                    name: serviceForm.name,
                    price: parseFloat(serviceForm.price),
                    duration_minutes: parseInt(serviceForm.duration),
                }).eq('id', serviceForm.id);
            } else {
                await supabase.from('services').insert([{
                    shop_id: user.shop_id,
                    name: serviceForm.name,
                    price: parseFloat(serviceForm.price),
                    duration_minutes: parseInt(serviceForm.duration),
                }]);
            }
            setIsServiceModalOpen(false);
            fetchData();
        } catch (err) {
            alert('Erro ao salvar serviço');
        }
    };

    const handleDeleteService = async (id: string) => {
        if (!window.confirm('Excluir este serviço?')) return;
        await supabase.from('services').delete().eq('id', id);
        fetchData();
    };

    const handleDeleteClient = async (id: string) => {
        if (!window.confirm('Atenção: A conta do cliente e agendamentos futuros não concluídos poderão ser afetados. Deseja realmente excluir o vínculo deste cliente?')) return;
        await supabase.from('profiles').delete().eq('id', id);
        fetchData();
    };

    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.shop_id) return;
        setStaffLoading(true);

        try {
            // 1. Criar Auth Supabase Client Temporário para não bugar a sessão do Dono (desloga sozinho)
            const tempClient = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY,
                { auth: { persistSession: false, autoRefreshToken: false } }
            );

            // 2. Cria a conta no Auth (aciona a trigger do banco)
            const { data: authData, error: authError } = await tempClient.auth.signUp({
                email: staffForm.email,
                password: staffForm.password,
            });

            if (authError) throw authError;

            const newUserId = authData.user?.id;
            if (!newUserId) throw new Error('Não foi possível resgatar o ID do usuário criado.');

            // 3. Atualizar o Profile criado pela trigger garantindo permissões do Dono ou aguardando RLS.
            // E inserir os Detalhes da comissão.
            // DICA P/ O USUARIO: Ele pode precisar habilitar "Owner can update profiles" no painel SQL
            const profileRes = await supabase.from('profiles').update({
                role: 'staff',
                shop_id: user.shop_id,
                name: staffForm.name
            }).eq('id', newUserId);
            if (profileRes.error) console.warn("Aviso RLS: ", profileRes.error); // Continua p/ ignorar RLS fraco em Dev

            await supabase.from('staff_details').insert([{
                id: newUserId,
                shop_id: user.shop_id,
                commission_rate: parseFloat(staffForm.commission_rate),
                is_active: true
            }]);

            alert('Barbeiro cadastrado com sucesso!');
            setIsStaffModalOpen(false);
            setStaffForm({ name: '', email: '', password: '', commission_rate: '50' });
            fetchData();
        } catch (err: any) {
            alert(`Falha ao registrar barbeiro: ${err.message}`);
        } finally {
            setStaffLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-chrome flex items-center gap-2">
                    Gestão de Barbeiros & Serviços
                </h1>
                <p className="text-silver-400">Configure os serviços oferecidos e controle as comissões da sua equipe.</p>
            </div>

            <div className="flex space-x-2 border-b border-space-700 pb-px overflow-x-auto">
                <button
                    onClick={() => setActiveTab('services')}
                    className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'services' ? `border-gold-500 text-gold-500` : 'border-transparent text-silver-400 hover:text-silver-200'}`}
                >
                    <Scissors size={18} /> Serviços Oferecidos
                </button>
                <button
                    onClick={() => setActiveTab('staff')}
                    className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'staff' ? `border-gold-500 text-gold-500` : 'border-transparent text-silver-400 hover:text-silver-200'}`}
                >
                    <Users size={18} /> Equipe
                </button>
                <button
                    onClick={() => setActiveTab('clients')}
                    className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'clients' ? `border-gold-500 text-gold-500` : 'border-transparent text-silver-400 hover:text-silver-200'}`}
                >
                    <Users size={18} /> Clientes Base
                </button>
            </div>

            {loading ? (
                <div className="text-silver-400">Carregando módulos...</div>
            ) : (
                <>
                    {activeTab === 'services' && (
                        <div className="bg-space-800 rounded-2xl border border-space-700 shadow-xl overflow-hidden">
                            <div className="p-6 border-b border-space-700 flex justify-between items-center">
                                <h2 className="font-bold text-chrome">Catálogo de Serviços</h2>
                                <button
                                    onClick={() => {
                                        setServiceForm({ id: '', name: '', price: '', duration: '' });
                                        setIsServiceModalOpen(true);
                                    }}
                                    className={`bg-gold-500 text-space-900 font-bold px-4 py-2 rounded-xl text-sm hover:bg-opacity-90 transition-all`}
                                >
                                    <Plus size={16} className="inline mr-1" /> Novo Serviço
                                </button>
                            </div>
                            <div className="divide-y divide-space-700">
                                {services.length === 0 ? (
                                    <div className="p-6 text-center text-silver-500">Nenhum serviço cadastrado. Base limpa.</div>
                                ) : services.map(srv => (
                                    <div key={srv.id} className="p-4 flex justify-between items-center hover:bg-space-900/50">
                                        <div>
                                            <h3 className="font-bold text-silver-200">{srv.name}</h3>
                                            <p className="text-sm text-silver-400">{srv.duration_minutes} min</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono text-mint-400 text-lg">R$ {srv.price.toFixed(2)}</span>
                                            <button onClick={() => {
                                                setServiceForm({ id: srv.id, name: srv.name, price: String(srv.price), duration: String(srv.duration_minutes) });
                                                setIsServiceModalOpen(true);
                                            }} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDeleteService(srv.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'staff' && (
                        <div className="bg-space-800 rounded-2xl border border-space-700 shadow-xl overflow-hidden">
                            <div className="p-6 border-b border-space-700 flex justify-between items-center">
                                <div>
                                    <h2 className="font-bold text-chrome">Profissionais Vinculados</h2>
                                    <p className="text-xs text-silver-400 mt-1">
                                        Crie contas diretamente para a sua equipe atuar sob as suas diretrizes e comissões.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsStaffModalOpen(true)}
                                    className={`bg-gold-500 text-space-900 font-bold px-4 py-2 rounded-xl text-sm hover:bg-opacity-90 transition-all shadow-lg flex items-center shadow-mint-500/20`}
                                >
                                    <Plus size={16} className="mr-1" /> Novo Barbeiro
                                </button>
                            </div>
                            <div className="divide-y divide-space-700">
                                {staff.length === 0 ? (
                                    <div className="p-6 text-center text-silver-500">A equipe está aguardando cadastro no sistema vinculando ao seu código.</div>
                                ) : staff.map(st => (
                                    <div key={st.id} className="p-4 flex justify-between items-center hover:bg-space-900/50">
                                        <div>
                                            <h3 className="font-bold text-silver-200">{st.name}</h3>
                                            <p className="text-sm text-silver-400">{st.email}</p>
                                        </div>
                                        <div className="text-right flex items-center gap-3">
                                            <p className="text-sm font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded inline-block border border-emerald-400/20">
                                                Comissão: {st.staff_details?.commission_rate || 0}%
                                            </p>
                                            <button onClick={() => {
                                                // Quick delete team member
                                                if (window.confirm("Excluir este barbeiro?")) {
                                                    supabase.from('profiles').delete().eq('id', st.id).then(() => fetchData())
                                                }
                                            }} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'clients' && (
                        <div className="bg-space-800 rounded-2xl border border-space-700 shadow-xl overflow-hidden animate-in fade-in">
                            <div className="p-6 border-b border-space-700 flex justify-between items-center">
                                <div>
                                    <h2 className="font-bold text-chrome">Base de Clientes</h2>
                                    <p className="text-xs text-silver-400 mt-1">
                                        Clientes que se vincularam usando o seu código da barbearia.
                                    </p>
                                </div>
                            </div>
                            <div className="divide-y divide-space-700">
                                {clients.length === 0 ? (
                                    <div className="p-6 text-center text-silver-500">Ainda não há clientes fixos conectados ao seu SaaS.</div>
                                ) : clients.map(client => (
                                    <div key={client.id} className="p-4 flex justify-between items-center hover:bg-space-900/50 transition-colors">
                                        <div>
                                            <h3 className="font-bold text-silver-200">{client.name}</h3>
                                            <p className="text-sm text-silver-400">{client.email} {client.phone && `• ${client.phone}`}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => handleDeleteClient(client.id)} className="p-2 text-red-400/70 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* MODAL: Service */}
            {isServiceModalOpen && (
                <div className="fixed inset-0 bg-space-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-space-800 rounded-2xl border border-space-700 p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-chrome mb-4">{serviceForm.id ? 'Editar Serviço' : 'Novo Serviço'}</h3>
                        <form onSubmit={handleSaveService} className="space-y-4">
                            <div>
                                <label className="block text-sm text-silver-300">Nome do Serviço</label>
                                <input required type="text" value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} className="w-full bg-space-900 border border-space-700 rounded-xl py-2 px-3 text-silver-200 focus:outline-none focus:border-mint-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-silver-300">Preço (R$)</label>
                                    <input required type="number" step="0.01" value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} className="w-full bg-space-900 border border-space-700 rounded-xl py-2 px-3 text-silver-200 focus:outline-none focus:border-mint-500" />
                                </div>
                                <div>
                                    <label className="block text-sm text-silver-300">Tempo (Min)</label>
                                    <input required type="number" value={serviceForm.duration} onChange={e => setServiceForm({ ...serviceForm, duration: e.target.value })} className="w-full bg-space-900 border border-space-700 rounded-xl py-2 px-3 text-silver-200 focus:outline-none focus:border-mint-500" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-space-700">
                                <button type="button" onClick={() => setIsServiceModalOpen(false)} className="flex-1 py-2 px-4 rounded-xl border border-space-700 text-silver-300 hover:bg-space-700 transition-colors">Cancelar</button>
                                <button type="submit" className={`flex-1 py-2 px-4 rounded-xl bg-gold-500 text-space-900 font-bold hover:bg-gold-400 transition-all`}>Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: Contratar Staff */}
            {isStaffModalOpen && (
                <div className="fixed inset-0 bg-space-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-space-800 rounded-2xl border border-space-700 p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-chrome">Cadastrar Barbeiro</h3>
                            <button onClick={() => setIsStaffModalOpen(false)} className="text-silver-500 hover:text-silver-200"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateStaff} className="space-y-4">
                            <div>
                                <label className="block text-sm text-silver-300 mb-1">Nome Completo</label>
                                <input required type="text" value={staffForm.name} onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} className="w-full bg-space-900 border border-space-700 rounded-xl py-2 px-3 text-silver-200 focus:outline-none focus:border-mint-500" placeholder="Ex: Lucas Barber" />
                            </div>
                            <div>
                                <label className="block text-sm text-silver-300 mb-1">E-mail Profissional</label>
                                <input required type="email" value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} className="w-full bg-space-900 border border-space-700 rounded-xl py-2 px-3 text-silver-200 focus:outline-none focus:border-mint-500" placeholder="lucas@barbearia.com" />
                            </div>
                            <div>
                                <label className="block text-sm text-silver-300 mb-1">Senha de Acesso Temporária</label>
                                <input required type="text" value={staffForm.password} onChange={e => setStaffForm({ ...staffForm, password: e.target.value })} className="w-full bg-space-900 border border-space-700 rounded-xl py-2 px-3 text-silver-200 focus:outline-none focus:border-mint-500" placeholder="Ex: staff12345" minLength={6} />
                                <p className="text-[10px] text-silver-500 mt-1">Avise o profissional para mudar a senha depois em seu App.</p>
                            </div>
                            <div>
                                <label className="block text-sm text-silver-300 mb-1">Comissão Padrão (%)</label>
                                <input required type="number" step="0.5" value={staffForm.commission_rate} onChange={e => setStaffForm({ ...staffForm, commission_rate: e.target.value })} className="w-full bg-space-900 border border-space-700 rounded-xl py-2 px-3 text-silver-200 focus:outline-none focus:border-mint-500" placeholder="Ex: 50" />
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-space-700">
                                <button type="submit" disabled={staffLoading} className={`w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all disabled:opacity-50`}>
                                    {staffLoading ? 'Gerando Conta...' : 'Ativar Barbeiro'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamServices;
