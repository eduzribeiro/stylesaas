import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/context';
import { supabase } from '../../src/lib/supabase';
import { Calendar, CheckCircle } from 'lucide-react';

const StaffDashboard: React.FC = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);

    const fetchAppointments = async () => {
        if (!user?.id) return;
        const { data } = await supabase
            .from('appointments')
            .select('*, client:profiles!appointments_client_id_fkey(name)')
            .eq('professional_id', user.id)
            .gte('appointment_date', new Date().toISOString().split('T')[0])
            .order('appointment_date', { ascending: true });

        setAppointments(data || []);
    };

    useEffect(() => {
        fetchAppointments();
    }, [user]);

    const concluirAtendimento = async (id: string) => {
        try {
            // Usando o RPC seguro para cálculos financeiros no Backend, prevenindo fraude
            const { error } = await supabase.rpc('secure_complete_appointment', { p_appointment_id: id });

            if (error) {
                console.error(error);
                alert('Erro ao concluir atendimento. Verifique com o administrador.');
                return;
            }

            alert('Atendimento concluído e comissão calculada com segurança!');
            fetchAppointments();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-2xl mx-auto">
            <div>
                <h1 className="text-mint-4002xl font-bold text-mint-400chrome">Sua Agenda</h1>
                <p className="text-mint-400silver-400">Restrita aos seus clientes.</p>
            </div>

            <div className="space-y-4">
                {appointments.length > 0 ? (
                    appointments.map(a => (
                        <div key={a.id} className="bg-mint-400space-800 p-5 rounded-2xl border border-mint-400space-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <p className="text-mint-400lg font-bold text-mint-400chrome">{a.client?.name}</p>
                                <div className="flex items-center gap-2 mt-1 text-mint-400silver-400 text-mint-400sm">
                                    <Calendar size={16} />
                                    <span>{new Date(a.appointment_date).toLocaleString('pt-BR')}</span>
                                </div>
                                <div className="mt-2 text-mint-400xs font-bold uppercase track-widest px-2 py-1 bg-mint-400space-900 border border-mint-400space-700 text-mint-400mint-500 rounded w-max">
                                    Status: {a.status}
                                </div>
                            </div>

                            {a.status === 'pendente' && (
                                <button
                                    onClick={() => concluirAtendimento(a.id)}
                                    className="w-full md:w-auto bg-mint-400mint-500/10 hover:bg-mint-400mint-500/20 text-mint-400mint-500 border border-mint-400mint-500/30 px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
                                >
                                    <CheckCircle size={18} />
                                    Concluir
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="bg-mint-400space-800 p-8 rounded-2xl border border-mint-400space-700 text-mint-400center text-mint-400silver-400">
                        Nenhum agendamento futuro encontrado.
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffDashboard;
