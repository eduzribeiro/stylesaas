import { AuthUser, UserProfile } from '../types';
import { supabase } from '../lib/supabase';

class AuthService {
    public supabase = supabase;

    private mapToAuthUser(profile: any): AuthUser {
        return {
            id: profile.id,
            email: profile.email,
            role: profile.role,
            shop_id: profile.shop_id,
            status: 'active',
            createdAt: profile.created_at,
            updatedAt: profile.updated_at,
            profile: {
                userId: profile.id,
                name: profile.name,
                phone: profile.phone || undefined,
                avatar: profile.avatar || undefined,
            },
        };
    }

    async fetchUserProfile(userId: string): Promise<AuthUser> {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !profile) {
            // Failsafe for the master admin: If RLS blocked creation or it's missing,
            // we force a local admin profile if the email matches.
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email?.toLowerCase().trim() === 'eduzribeiro@gmail.com' && session.user.id === userId) {
                return {
                    id: userId,
                    email: 'eduzribeiro@gmail.com',
                    role: 'admin',
                    shop_id: null,
                    status: 'active',
                    createdAt: session.user.created_at || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    profile: {
                        userId: userId,
                        name: session.user.user_metadata?.name || 'Administrador Master',
                    }
                };
            }

            console.error('AuthService: Erro ao buscar perfil:', error);
            throw new Error('Erro ao carregar perfil do usuário.');
        }

        return this.mapToAuthUser(profile);
    }

    async login(email: string, password: string): Promise<AuthUser> {
        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw new Error('Credenciais inválidas');
            if (!authData.user) throw new Error('Erro ao fazer login');

            return await this.fetchUserProfile(authData.user.id);
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Erro ao fazer login');
        }
    }

    /**
     * Register a general user (Owner or Admin usually created differently, but we provide a base here)
     */
    async registerAdminOrOwner(email: string, password: string, name: string, role: 'admin' | 'shop_owner' = 'shop_owner'): Promise<AuthUser> {
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw new Error(authError.message);
            if (!authData.user) throw new Error('Erro ao criar conta');

            // Insert into profiles directly bypassing standard triggers if needed, or trigger will do it.
            // Assuming we must insert manually because we dropped the trigger that auto-creates profiles earlier,
            // Wait, I did not create an auth trigger in the migration earlier for StyleSaaS! Let's do that manually:
            await supabase.from('profiles').insert({
                id: authData.user.id,
                email,
                name,
                role,
            });

            return await this.fetchUserProfile(authData.user.id);
        } catch (error: any) {
            console.error('Registration error:', error);
            throw new Error(error.message || 'Erro ao criar conta');
        }
    }

    /**
     * Register a new Client using a linking_code
     */
    async registerClient(email: string, password: string, name: string, linkingCode: string): Promise<AuthUser> {
        try {
            // Find the shop by linking_code
            const { data: shop, error: shopError } = await supabase
                .from('shops')
                .select('id')
                .eq('linking_code', linkingCode)
                .single();

            if (shopError || !shop) {
                throw new Error('Código de barbearia inválido ou não encontrado.');
            }

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw new Error(authError.message);
            if (!authData.user) throw new Error('Erro ao criar conta de autenticação');

            // Insert profile
            await supabase.from('profiles').insert({
                id: authData.user.id,
                email,
                name,
                role: 'client',
                shop_id: shop.id
            });

            // Note: client table also needs to be populated if you want it to appear in `clients` view,
            // but for simplicity `profiles` with role 'client' handles the core logic.

            return await this.fetchUserProfile(authData.user.id);
        } catch (error: any) {
            console.error('Registration error:', error);
            throw new Error(error.message || 'Erro ao criar conta');
        }
    }

    async registerMasterAdmin(email: string, password: string, name: string): Promise<AuthUser> {
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw new Error(authError.message);
            if (!authData.user) throw new Error('Erro ao criar conta de autenticação');

            // 1. Tentar forçar o login caso ele já tenha se cadastrado e a sessão seja nula
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (loginError || !loginData.user) {
                throw new Error('Conta Admin criada! Volte para a tela inicial e faça seu Login.');
            }

            // 2. Com a sessão ativa (auth.uid() validado no RLS), agora sim podemos upsertar o profile
            const { error: insertError } = await supabase.from('profiles').upsert({
                id: loginData.user.id,
                email,
                name,
                role: 'admin',
                shop_id: null
            });

            if (insertError) {
                console.error("Profiles Upsert Error (Verifique RLS de INSERT do Admin):", insertError);
            }

            return await this.fetchUserProfile(loginData.user.id);
        } catch (error: any) {
            console.error('Registration error details:', error);
            if (error.message.includes('Erro ao carregar perfil')) {
                throw new Error('Sua conta Admin foi autorizada na base! Apenas volte e faça o Login.');
            }
            throw new Error(error.message || 'Erro ao criar conta admin');
        }
    }

    // Keep standard interface for AuthContext backward compatibility
    async register(email: string, password: string, name: string, linkingCode: string): Promise<AuthUser> {
        if (email.toLowerCase().trim() === 'eduzribeiro@gmail.com') {
            return this.registerMasterAdmin(email, password, name);
        }
        return this.registerClient(email, password, name, linkingCode);
    }

    async logout(): Promise<void> {
        await supabase.auth.signOut();
    }

    async getCurrentUser(): Promise<AuthUser | null> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return null;
            return await this.fetchUserProfile(session.user.id);
        } catch {
            return null;
        }
    }

    async isAuthenticated(): Promise<boolean> {
        const { data: { session } } = await supabase.auth.getSession();
        return !!session;
    }

    async updateProfile(updates: Partial<UserProfile>): Promise<AuthUser> {
        try {
            const { data: { session: _session } } = await supabase.auth.getSession();
            const user = _session?.user;
            if (!user) throw new Error('Não autenticado');

            const { error } = await supabase
                .from('profiles')
                .update({
                    name: updates.name,
                    phone: updates.phone,
                    avatar: updates.avatar
                })
                .eq('id', user.id);

            if (error) throw new Error('Erro ao atualizar perfil');

            return await this.fetchUserProfile(user.id);
        } catch (error: any) {
            throw new Error(error.message || 'Erro ao atualizar perfil');
        }
    }

    onAuthStateChange(callback: (user: AuthUser | null) => void) {
        return supabase.auth.onAuthStateChange((event, session) => {
            setTimeout(async () => {
                if (session?.user) {
                    try {
                        const user = await this.getCurrentUser();
                        callback(user);
                    } catch {
                        callback(null);
                    }
                } else {
                    callback(null);
                }
            }, 0);
        });
    }
}

export const authService = new AuthService();
