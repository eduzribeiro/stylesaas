import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/context';
import { supabase } from '../../src/lib/supabase';
import { Users, DollarSign, Award, FileText } from 'lucide-react';
import { COLORS } from '../../constants';

const OwnerDashboard: React.FC = () => {
    const { user } = useAuth();
    const [shop, setShop] = useState<any>(null);
    const [staff, setStaff] = useState<any[]>([]);
    const [commissions, setCommissions] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    useEffect(() => {
        const fetchShopData = async () => {
            if (!user?.shop_id) return;

            const { data: shopData } = await supabase
                .from('shops')
                .select('*')
                .eq('id', user.shop_id)
                .single();

            setShop(shopData);

            const { data: staffData } = await supabase
                .from('profiles')
                .select('*, staff_details(*)')
                .eq('shop_id', user.shop_id)
                .eq('role', 'staff');

            setStaff(staffData || []);

            // Usando a tabela de transações segura para o financeiro
            const { data: txData } = await supabase
                .from('transactions')
                .select('*, professional:profiles!transactions_professional_id_fkey(name)')
                .eq('shop_id', user.shop_id);

            // Group by professional to see what is owed
            const owed: Record<string, number> = {};
            txData?.forEach(tx => {
                const pName = tx.professional?.name || 'Unknown';
                owed[pName] = (owed[pName] || 0) + (tx.barber_commission || 0);
            });

            setCommissions(Object.entries(owed).map(([name, total]) => ({ name, total })));

            // Buscando logs de auditoria
            const { data: logsData } = await supabase
                .from('loyalty_audit_logs')
                .select('*, client:profiles!loyalty_audit_logs_client_id_fkey(name), professional:profiles!loyalty_audit_logs_professional_id_fkey(name)')
                .eq('shop_id', user.shop_id)
                .order('created_at', { ascending: false })
                .limit(10);

            setAuditLogs(logsData || []);
        };

        fetchShopData();
    }, [user]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-mint-4002xl font-bold text-mint-400chrome">Visão Geral da Barbearia</h1>
                    <p className="text-mint-400silver-400">Bem-vindo(a) de volta, {user?.profile?.name}.</p>
                </div>
                {shop && (
                    <div className="bg-mint-400space-800 border border-mint-400space-700 rounded-lg px-4 py-2 flex items-center gap-3">
                        <span className="text-mint-400sm text-mint-400silver-400">Vínculo:</span>
                        <span className={`text-mint-400mint-500${COLORS.primary} font-bold tracking-widest`}>{shop.linking_code}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-mint-400space-800 p-6 rounded-2xl border border-mint-400space-700 flex flex-col items-center justify-center text-mint-400center">
                    <div className="w-12 h-12 rounded-full bg-mint-400mint-500/10 text-mint-400mint-500 flex items-center justify-center mb-4">
                        <DollarSign size={24} />
                    </div>
                    <h3 className="text-mint-400sm font-medium text-mint-400silver-400 mb-1">Comissões Devidas</h3>
                    <p className="text-mint-4003xl font-bold text-mint-400chrome">R$ {commissions.reduce((acc, c) => acc + c.total, 0).toFixed(2)}</p>
                </div>

                <div className="bg-mint-400space-800 p-6 rounded-2xl border border-mint-400space-700 flex flex-col items-center justify-center text-mint-400center">
                    <div className="w-12 h-12 rounded-full bg-mint-400mint-500/10 text-mint-400mint-500 flex items-center justify-center mb-4">
                        <Users size={24} />
                    </div>
                    <h3 className="text-mint-400sm font-medium text-mint-400silver-400 mb-1">Equipe</h3>
                    <p className="text-mint-4003xl font-bold text-mint-400chrome">{staff.length} profissionais</p>
                </div>

                <div className="bg-mint-400space-800 p-6 rounded-2xl border border-mint-400space-700 flex flex-col items-center justify-center text-mint-400center">
                    <div className="w-12 h-12 rounded-full bg-mint-400mint-500/10 text-mint-400mint-500 flex items-center justify-center mb-4">
                        <Award size={24} />
                    </div>
                    <h3 className="text-mint-400sm font-medium text-mint-400silver-400 mb-1">Status Fidelidade</h3>
                    <p className="text-mint-4003xl font-bold text-mint-400chrome">{shop?.loyalty_enabled ? 'ATIVO' : 'DESATIVADO'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Tabela de Comissões */}
                <div className="bg-mint-400space-800 rounded-2xl border border-mint-400space-700 overflow-hidden flex flex-col">
                    <div className="p-6 border-mint-400b border-mint-400space-700 flex justify-between items-center">
                        <h2 className="text-mint-400lg font-bold text-mint-400chrome flex items-center gap-2"><DollarSign size={20} /> Extrato da Equipe</h2>
                    </div>
                    <div className="p-6 flex-1">
                        {commissions.length > 0 ? (
                            <div className="space-y-4">
                                {commissions.map(c => (
                                    <div key={c.name} className="flex justify-between items-center p-4 bg-mint-400space-900 border border-mint-400space-700 rounded-xl">
                                        <span className="text-mint-400silver-200">{c.name}</span>
                                        <span className={`text-mint-400mint-500${COLORS.primary} font-bold`}>R$ {c.total.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-mint-400silver-400 text-mint-400center">Nenhum valor a ser pago (ou nenhum atendimento concluído).</p>
                        )}
                    </div>
                </div>

                {/* Auditoria de Fidelidade */}
                <div className="bg-mint-400space-800 rounded-2xl border border-mint-400space-700 overflow-hidden flex flex-col">
                    <div className="p-6 border-mint-400b border-mint-400space-700 flex justify-between items-center">
                        <h2 className="text-mint-400lg font-bold text-mint-400chrome flex items-center gap-2"><FileText size={20} /> Auditoria de Fidelidade</h2>
                    </div>
                    <div className="p-6 flex-1 overflow-auto">
                        {auditLogs.length > 0 ? (
                            <div className="space-y-4">
                                {auditLogs.map(log => (
                                    <div key={log.id} className="p-4 bg-mint-400space-900 border border-mint-400space-700 rounded-xl space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-mint-400silver-200 font-medium text-mint-400sm">
                                                Barbeiro: {log.professional?.name}
                                            </span>
                                            <span className="text-mint-400space-500 text-mint-400xs">{new Date(log.created_at).toLocaleTimeString('pt-BR')}</span>
                                        </div>
                                        <div className="text-mint-400silver-400 text-mint-400sm">
                                            Cliente: <span className="text-mint-400mint-500 font-medium">{log.client?.name}</span>
                                        </div>
                                        <div className="text-mint-400xs uppercase font-bold tracking-wider text-mint-400space-400 mt-2 bg-mint-400space-800 inline-block px-2 py-1 rounded">
                                            {log.action.replace('_', ' ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-mint-400silver-400 text-mint-400center">Nenhuma ação de fidelidade recente registrada.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;
