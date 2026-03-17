import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/context';
import { supabase } from '../../src/lib/supabase';
import { Users, Scissors, Plus, Trash2, Edit } from 'lucide-react';
import { COLORS } from '../../constants';

const TeamServices: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'services' | 'staff'>('services');

    const [services, setServices] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);

    // Modals
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [serviceForm, setServiceForm] = useState({ id: '', name: '', price: '', duration: '' });

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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-chrome flex items-center gap-2">
                    Gestão de Barbeiros & Serviços
                </h1>
                <p className="text-silver-400">Configure os serviços oferecidos e controle as comissões da sua equipe.</p>
            </div>

            <div className="flex space-x-2 border-b border-space-700 pb-px">
                <button
                    onClick={() => setActiveTab('services')}
                    className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'services' ? `border-${COLORS.primary} text-${COLORS.primary}` : 'border-transparent text-silver-400 hover:text-silver-200'}`}
                >
                    <Scissors size={18} /> Serviços Oferecidos
                </button>
                <button
                    onClick={() => setActiveTab('staff')}
                    className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'staff' ? `border-${COLORS.primary} text-${COLORS.primary}` : 'border-transparent text-silver-400 hover:text-silver-200'}`}
                >
                    <Users size={18} /> Controle da Equipe
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
                                    className={`bg-${COLORS.primary} text-space-900 font-bold px-4 py-2 rounded-xl text-sm hover:bg-opacity-90 transition-all`}
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
                            <div className="p-6 border-b border-space-700">
                                <h2 className="font-bold text-chrome">Profissionais Vinculados</h2>
                                <p className="text-xs text-silver-400 mt-1">
                                    Nota: Profissionais precisam criar uma conta usando o seu Picking/Linking Code para aparecerem aqui. Ou o Master Admin fará o binding manual.
                                </p>
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
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-emerald-400 dark:text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded inline-block">
                                                Comissão base: {st.staff_details?.commission_rate || 0}%
                                            </p>
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
                    <div className="bg-space-800 rounded-2xl border border-space-700 p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-xl font-bold text-chrome mb-4">{serviceForm.id ? 'Editar Serviço' : 'Novo Serviço'}</h3>
                        <form onSubmit={handleSaveService} className="space-y-4">
                            <div>
                                <label className="block text-sm text-silver-300">Nome do Serviço</label>
                                <input required type="text" value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} className="w-full bg-space-900 border border-space-700 rounded-xl py-2 px-3 text-silver-200" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-silver-300">Preço (R$)</label>
                                    <input required type="number" step="0.01" value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} className="w-full bg-space-900 border border-space-700 rounded-xl py-2 px-3 text-silver-200" />
                                </div>
                                <div>
                                    <label className="block text-sm text-silver-300">Tempo (Min)</label>
                                    <input required type="number" value={serviceForm.duration} onChange={e => setServiceForm({ ...serviceForm, duration: e.target.value })} className="w-full bg-space-900 border border-space-700 rounded-xl py-2 px-3 text-silver-200" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-space-700">
                                <button type="button" onClick={() => setIsServiceModalOpen(false)} className="flex-1 py-2 px-4 rounded-xl border border-space-700 text-silver-300">Cancelar</button>
                                <button type="submit" className={`flex-1 py-2 px-4 rounded-xl bg-${COLORS.primary} text-space-900 font-bold`}>Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamServices;
