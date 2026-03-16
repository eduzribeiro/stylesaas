import React from 'react';
import { LayoutDashboard, Users, Scissors, Award, Calendar, DollarSign, Settings, UserCircle } from 'lucide-react';

export const COLORS = {
  primary: 'mint-600',
  secondary: 'mint-500',
  accent: 'mint-50',
  text: 'silver-200',
  lightText: 'silver-400',
};

// Map each role to an array of objects to show in the sidebar
export const MENU_ITEMS: Record<string, Array<{ label: string; icon: React.ReactNode; path: string }>> = {
  admin: [
    { label: 'Admin Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
  ],
  shop_owner: [
    { label: 'Visão Geral', icon: <LayoutDashboard size={20} />, path: '/owner' },
    { label: 'Equipe e Serviços', icon: <Users size={20} />, path: '/owner/equipe' },
    { label: 'Fidelidade', icon: <Award size={20} />, path: '/owner/fidelidade' },
    { label: 'Financeiro', icon: <DollarSign size={20} />, path: '/owner/financeiro' },
  ],
  staff: [
    { label: 'Minha Agenda', icon: <Calendar size={20} />, path: '/staff' },
    { label: 'Perfil', icon: <UserCircle size={20} />, path: '/staff/perfil' },
  ],
  client: [
    { label: 'Novo Agendamento', icon: <Calendar size={20} />, path: '/client' },
    { label: 'Meu Cartão Fidelidade', icon: <Award size={20} />, path: '/client/fidelidade' },
    { label: 'Perfil', icon: <UserCircle size={20} />, path: '/client/perfil' },
  ],
};
