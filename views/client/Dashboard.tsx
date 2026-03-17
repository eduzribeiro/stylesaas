import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/context';
import { supabase } from '../../src/lib/supabase';
import { Award, Calendar, Scissors, AlertTriangle, CheckCircle } from 'lucide-react';

const ClientDashboard: React.FC = () => {
    const { user } = useAuth();
    const [loyalty, setLoyalty] = useState<{ stamps_count: number } | null>(null);
    const [shop, setShop] = useState<any>(null);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [servicesList, setServicesList] = useState<any[]>([]);

    // Booking state
    const [selectedStaff, setSelectedStaff] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [isBooking, setIsBooking] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.shop_id || !user?.id) return;

            const { data: loyaltyData } = await supabase
                .from('loyalty_cards')
                .select('stamps_count')
                .eq('client_id', user.id)
                .single();

            setLoyalty(loyaltyData);

            const { data: shopData } = await supabase
                .from('shops')
                .select('*')
                .eq('id', user.shop_id)
                .single();

            setShop(shopData);

            const { data: sList } = await supabase
                .from('profiles')
                .select('id, name')
                .eq('shop_id', user.shop_id)
                .eq('role', 'staff');
            setStaffList(sList || []);

            const { data: servList } = await supabase
                .from('services')
                .select('id, name, price, duration_minutes')
                .eq('shop_id', user.shop_id)
                .eq('is_active', true);
            setServicesList(servList || []);
        };

        fetchData();
    }, [user]);

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault();
        setBookingError('');
        setBookingSuccess(false);

        if (!selectedStaff || !selectedService || !selectedDate || !selectedTime) {
            setBookingError('Por favor preencha todos os campos do agendamento.');
            return;
        }

        setIsBooking(true);

        try {
            const serviceObj = servicesList.find(s => s.id === selectedService);
            const appointmentDatetime = `${selectedDate}T${selectedTime}:00`;

            // Tentativa Robusta de Inserção c/ Verificação de Constraints do PG
            const { error } = await supabase.from('appointments').insert({
                shop_id: user?.shop_id,
                client_id: user?.id,
                professional_id: selectedStaff,
                service_id: selectedService,
                service_price: serviceObj?.price || 0,
                appointment_date: new Date(appointmentDatetime).toISOString(),
                status: 'pendente'
            });

            if (error) {
                // Tratar erro Padrão 23P01 (Exclusion Constraint Violation = Double Booking)
                if (error.code === '23P01') {
                    throw new Error('Este horário acabou de ser reservado por outra pessoa. Por favor, escolha outro slot.');
                } else {
                    throw new Error(`Erro ao agendar: ${error.message}`);
                }
            }

            setBookingSuccess(true);
            // Limpar formulário
            setSelectedDate('');
            setSelectedTime('');
            setSelectedService('');
            setSelectedStaff('');

        } catch (err: any) {
            setBookingError(err.message || 'Falha desconhecida.');
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-2xl mx-auto">
            <div className="text-mint-400center mb-8">
                <h1 className="text-mint-4002xl font-bold text-mint-400chrome">Olá, {user?.profile?.name}</h1>
                <p className="text-mint-400silver-400 mt-1">Bem-vindo(a) à {shop?.name || 'Barbearia'}</p>
            </div>

            {shop?.loyalty_enabled && (
                <div className="bg-mint-400space-800 p-8 rounded-[2rem] border-mint-4002 border-mint-400mint-500/20 shadow-[0_0_30px_rgba(93,208,143,0.1)] text-mint-400center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Award size={100} />
                    </div>
                    <h2 className="text-mint-400xl font-bold text-mint-400chrome mb-4 relative z-10">Seu Cartão Fidelidade</h2>
                    <div className="text-mint-4005xl font-black text-mint-400mint-500 mb-2 relative z-10 font-mono tracking-tighter">
                        {loyalty?.stamps_count || 0} <span className="text-mint-4002xl text-mint-400silver-500">/ {shop.loyalty_goal}</span>
                    </div>
                    <p className="text-mint-400silver-400 relative z-10 mt-4 text-mint-400sm font-medium">Recompensa: {shop.loyalty_reward}</p>

                    <div className="w-full bg-mint-400space-900 rounded-full h-3 mt-6 overflow-hidden border border-mint-400space-700 relative z-10">
                        <div
                            className="bg-mint-400gradient-to-r from-mint-600 to-mint-400 h-3 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(93,208,143,0.5)]"
                            style={{ width: `${Math.min(((loyalty?.stamps_count || 0) / shop.loyalty_goal) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Formulário de Agendamento */}
            <div className="bg-mint-400space-800 p-6 md:p-8 rounded-2xl border border-mint-400space-700">
                <h2 className="text-mint-400xl font-bold text-mint-400chrome mb-6 flex items-center gap-2">
                    <Calendar size={20} className="text-mint-400mint-500" />
                    Novo Agendamento
                </h2>

                {bookingSuccess && (
                    <div className="mb-6 p-4 bg-mint-400mint-500/10 text-mint-400mint-500 border border-mint-400mint-500/20 rounded-xl font-medium flex items-center gap-3">
                        <CheckCircle size={20} />
                        Seu horário foi agendado com sucesso!
                    </div>
                )}

                {bookingError && (
                    <div className="mb-6 p-4 bg-mint-400red-500/10 text-mint-400red-400 border border-mint-400red-500/20 rounded-xl font-medium flex gap-3 text-mint-400sm">
                        <AlertTriangle size={20} className="shrink-0" />
                        {bookingError}
                    </div>
                )}

                <form onSubmit={handleBook} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-mint-400sm font-medium text-mint-400silver-400 mb-1">Serviço</label>
                            <select
                                value={selectedService}
                                onChange={e => setSelectedService(e.target.value)}
                                className="w-full bg-mint-400space-900 border border-mint-400space-700 text-mint-400silver-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-mint-500/50"
                            >
                                <option value="">Escolha um serviço...</option>
                                {servicesList.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-mint-400sm font-medium text-mint-400silver-400 mb-1">Profissional</label>
                            <select
                                value={selectedStaff}
                                onChange={e => setSelectedStaff(e.target.value)}
                                className="w-full bg-mint-400space-900 border border-mint-400space-700 text-mint-400silver-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-mint-500/50"
                            >
                                <option value="">Escolha o barbeiro...</option>
                                {staffList.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-mint-400sm font-medium text-mint-400silver-400 mb-1">Data</label>
                            <input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                                className="w-full bg-mint-400space-900 border border-mint-400space-700 text-mint-400silver-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-mint-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-mint-400sm font-medium text-mint-400silver-400 mb-1">Horário</label>
                            <input
                                type="time"
                                value={selectedTime}
                                onChange={e => setSelectedTime(e.target.value)}
                                className="w-full bg-mint-400space-900 border border-mint-400space-700 text-mint-400silver-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-mint-500/50"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isBooking}
                        className="w-full pt-2 mt-4 bg-mint-400mint-600 hover:bg-mint-400mint-500 text-mint-400space-900 font-bold py-4 px-6 rounded-xl shadow-lg transition-all text-mint-400lg disabled:opacity-50"
                    >
                        {isBooking ? 'Reservando...' : 'Confirmar Agendamento'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ClientDashboard;
