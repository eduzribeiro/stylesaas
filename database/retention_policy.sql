-- SQL MIGRATION FOR STYLESAAS RETENTION AND CASCADES
-- Instruções: Rodar este script na aba "SQL Editor" do Supabase

----------------------------------------------------------------------------------
-- 1. POLÍTICA DE RETENÇÃO ESTÉTICA INTELIGENTE: MANTER APENAS MES ATUAL E ANTERIOR
----------------------------------------------------------------------------------
-- Cria uma função para deletar automaticamente transações, auditorias e agendamentos velhos
CREATE OR REPLACE FUNCTION clean_old_saas_history()
RETURNS void AS $$
BEGIN
    -- Apaga dados com mais de 2 meses contábeis
    DELETE FROM transactions WHERE created_at < date_trunc('month', current_date) - interval '1 month';
    DELETE FROM loyalty_audit_logs WHERE created_at < date_trunc('month', current_date) - interval '1 month';
    DELETE FROM appointments WHERE created_at < date_trunc('month', current_date) - interval '1 month' AND status IN ('completed', 'cancelled');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- OBSERVAÇÃO IMPORTANTÍSSIMA SOBRE PG_CRON:
-- Para executar autonomamente o cron job no Supabase, a extensão pg_cron deve estar ativada.
-- Caso seja plano Grátis, o ideal é você rodar o seguinte schedule:
--
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('limpeza_mensal_saas', '0 0 1 * *', 'SELECT clean_old_saas_history()');
--
-- Isso fará com que no dia 01 a rotina seja validada e deixe a base extremamente leve e ágil.

----------------------------------------------------------------------------------
-- 2. SUPORTE TOTAL A DELETE EM CASCATA POR BARBEARIA (PARA O MASTER ADMIN)
----------------------------------------------------------------------------------
-- As deleções feitas pela interface Gestão Master via Admin já utilizam lógica de cascata no Frontend.
-- Você pode forçar o ON DELETE CASCADE nas chaves estrangeiras p/ limpeza automática
-- (Isto remove todos os usuários do Supabase Auth atrelados se combinarmos isso com as Triggers).

-- Por hoje, não alteramos restrições cruciais pra evitar downtime. O Admin Front-end já está processando o Delete em Massa (Limpando appointments, transactions, perfis e o shop).

----------------------------------------------------------------------------------
-- 3. CAMPO DE GEST�O PARA BLOQUEIO E LIBERA��O PELO MASTER ADMIN
----------------------------------------------------------------------------------
-- Execute isto para permitir que o Dashboard Master bloqueie e desbloqueie as franquias.
ALTER TABLE shops ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

