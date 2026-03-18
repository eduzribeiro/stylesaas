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

    // Lançamento Manual Avulso
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [manualProfessionalId, setManualProfessionalId] = useState('');
    const [manualAmount, setManualAmount] = useState('');

    const handleManualService = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Pick commission rate
            const st = staff.find(s => s.id === manualProfessionalId);
            const cmRate = st?.staff_details?.commission_rate || 0;
            const gross = parseFloat(manualAmount);
            const bComm = gross * (cmRate / 100);
            const income = gross - bComm;

            await supabase.from('transactions').insert([{
                shop_id: user?.shop_id,
                professional_id: manualProfessionalId,
                gross_amount: gross,
                barber_commission: bComm,
                shop_income: income,
                type: 'manual_entry'
            }]);

            setIsManualModalOpen(false);
            setManualProfessionalId('');
            setManualAmount('');
            alert('Lançamento avulso registrado com sucesso!');
        } catch (err) {
            alert('Falha ao lançar procedimendo manual.');
        }
    };

    const handlePrintPDF = () => {
        window.print();
    };

    return (
        <div className="space-y-6 print:m-0 print:p-0">
            {/* Ocultar navegação no Header durante o Print usando classe print:hidden globalmente, mas tratamos botões aqui */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-chrome">Visão Geral da Barbearia</h1>
                    <p className="text-silver-400">Bem-vindo(a) de volta, {user?.profile?.name}.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsManualModalOpen(true)} className="bg-gold-500 hover:bg-gold-400 text-space-900 font-bold px-4 py-2 rounded-xl transition-all shadow-lg text-sm flex items-center gap-2">
                        <DollarSign size={16} /> Lançar Serviço Avulso
                    </button>
                    <button onClick={handlePrintPDF} className="bg-space-800 hover:bg-space-700 border border-space-700 text-silver-200 font-bold px-4 py-2 rounded-xl transition-all shadow-lg text-sm flex items-center gap-2">
                        <FileText size={16} /> Exportar Fechamento (PDF)
                    </button>
                    {shop && (
                        <div className="bg-space-800 border border-space-700 rounded-lg px-4 py-2 flex items-center gap-3">
                            <span className="text-sm text-silver-400">Vínculo:</span>
                            <span className={`text-gold-500 font-bold tracking-widest`}>{shop.linking_code}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-4 animate-pulse print:hidden">
                <div className="text-red-400 mt-1">
                    <Award size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-red-400">Atenção ao Fechamento Mensal</h3>
                    <p className="text-sm text-silver-300">
                        Por motivos de performance da plataforma prime, os históricos financeiros e de agendamentos são armazenados <strong>apenas pelo mês atual e o mês anterior.</strong> Ao virar o mês, registros mais antigos são excluídos automaticamente. Exporte seu fechamento em PDF para seus arquivos.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-space-800 p-6 rounded-2xl border border-space-700 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-mint-500/10 text-mint-500 flex items-center justify-center mb-4">
                        <DollarSign size={24} />
                    </div>
                    <h3 className="text-sm font-medium text-silver-400 mb-1">Comissões Devidas</h3>
                    <p className="text-3xl font-bold text-chrome">R$ {commissions.reduce((acc, c) => acc + c.total, 0).toFixed(2)}</p>
                </div>

                <div className="bg-space-800 p-6 rounded-2xl border border-space-700 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-mint-500/10 text-mint-500 flex items-center justify-center mb-4">
                        <Users size={24} />
                    </div>
                    <h3 className="text-sm font-medium text-silver-400 mb-1">Equipe</h3>
                    <p className="text-3xl font-bold text-chrome">{staff.length} profissionais</p>
                </div>

                <div className="bg-space-800 p-6 rounded-2xl border border-space-700 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-mint-500/10 text-mint-500 flex items-center justify-center mb-4">
                        <Award size={24} />
                    </div>
                    <h3 className="text-sm font-medium text-silver-400 mb-1">Status Fidelidade</h3>
                    <p className="text-3xl font-bold text-chrome">{shop?.loyalty_enabled ? 'ATIVO' : 'DESATIVADO'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Tabela de Comissões */}
                <div className="bg-space-800 rounded-2xl border border-space-700 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-space-700 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-chrome flex items-center gap-2"><DollarSign size={20} /> Extrato da Equipe</h2>
                    </div>
                    <div className="p-6 flex-1">
                        {commissions.length > 0 ? (
                            <div className="space-y-4">
                                {commissions.map(c => (
                                    <div key={c.name} className="flex justify-between items-center p-4 bg-space-900 border border-space-700 rounded-xl">
                                        <span className="text-silver-200">{c.name}</span>
                                        <span className={`text-gold-500 font-bold`}>R$ {c.total.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-silver-400 text-center">Nenhum valor a ser pago (ou nenhum atendimento concluído).</p>
                        )}
                    </div>
                </div>

                {/* Auditoria de Fidelidade */}
                <div className="bg-space-800 rounded-2xl border border-space-700 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-space-700 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-chrome flex items-center gap-2"><FileText size={20} /> Auditoria de Fidelidade</h2>
                    </div>
                    <div className="p-6 flex-1 overflow-auto">
                        {auditLogs.length > 0 ? (
                            <div className="space-y-4">
                                {auditLogs.map(log => (
                                    <div key={log.id} className="p-4 bg-space-900 border border-space-700 rounded-xl space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-silver-200 font-medium text-sm">
                                                Barbeiro: {log.professional?.name}
                                            </span>
                                            <span className="text-space-500 text-xs">{new Date(log.created_at).toLocaleTimeString('pt-BR')}</span>
                                        </div>
                                        <div className="text-silver-400 text-sm">
                                            Cliente: <span className="text-mint-400 font-medium">{log.client?.name}</span>
                                        </div>
                                        <div className="text-xs uppercase font-bold tracking-wider text-space-400 mt-2 bg-space-800 inline-block px-2 py-1 rounded">
                                            {log.action.replace('_', ' ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-silver-400 text-center">Nenhuma ação de fidelidade recente registrada.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Lançamento Avulso */}
            {isManualModalOpen && (
                <div className="fixed inset-0 bg-space-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
                    <div className="bg-space-800 rounded-2xl border border-space-700 p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-chrome mb-1">Lançar Serviço Avulso</h3>
                        <p className="text-xs text-silver-400 mb-6">Insira manualmente serviços prestados para clientes não cadastrados (Walk-ins).</p>

                        <form onSubmit={handleManualService} className="space-y-4">
                            <div>
                                <label className="block text-sm text-silver-300 mb-1">Profissional Realizador</label>
                                <select
                                    required
                                    className="w-full bg-space-900 border border-space-700 rounded-xl py-2 px-3 text-silver-200 focus:outline-none focus:border-gold-500 appearance-none"
                                    value={manualProfessionalId}
                                    onChange={e => setManualProfessionalId(e.target.value)}
                                >
                                    <option value="" disabled>-- Selecione um Barbeiro --</option>
                                    {staff.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.staff_details?.commission_rate || 0}% de comissão)</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-silver-300 mb-1">Valor Bruto do Procedimento (R$)</label>
                                <input
                                    required
                                    type="number" step="0.01"
                                    className="w-full bg-space-900 border border-space-700 rounded-xl py-2 px-3 text-silver-200 focus:outline-none focus:border-gold-500"
                                    placeholder="Ex: 85.00"
                                    value={manualAmount}
                                    onChange={e => setManualAmount(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-space-700">
                                <button type="button" onClick={() => setIsManualModalOpen(false)} className="flex-1 py-2 px-4 rounded-xl border border-space-700 text-silver-300 hover:bg-space-700 transition-colors">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 px-4 rounded-xl bg-gold-500 text-space-900 font-bold hover:bg-gold-400 transition-all">Registrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerDashboard;
