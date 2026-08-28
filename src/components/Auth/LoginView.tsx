import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  Mail,
  Shield,
  BookOpen,
  User,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { Input } from '../UI/Input.tsx';
import { Button } from '../UI/Button.tsx';
import { Modal } from '../UI/Modal.tsx';

export const LoginView: React.FC = () => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password Recovery Modal
  const [isRecoverOpen, setIsRecoverOpen] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoverLoading, setRecoverLoading] = useState(false);
  const [recoverSuccess, setRecoverSuccess] = useState('');
  const [recoverError, setRecoverError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !senha) {
      setErrorMessage('Por favor, informe seu e-mail e sua senha.');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), senha);
    } catch (err: any) {
      setErrorMessage(err.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setSenha(userPass);
    setErrorMessage('');
    try {
      setLoading(true);
      await login(userEmail, userPass);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao realizar login rápido.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverError('');
    setRecoverSuccess('');

    if (!recoverEmail.trim()) {
      setRecoverError('Informe seu e-mail cadastrado.');
      return;
    }

    try {
      setRecoverLoading(true);
      const res = await api.auth.recoverPassword(recoverEmail.trim());
      setRecoverSuccess(res.message);
    } catch (err: any) {
      setRecoverError(err.message || 'Erro ao processar recuperação de senha.');
    } finally {
      setRecoverLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans">
      {/* Background ambient elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.25),rgba(255,255,255,0))] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Institutional Branding */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-2 shadow-inner">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Sistema de Controle de Empréstimos
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Portal Acadêmico & Gestão Patrimonial de Equipamentos
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Acesse sua conta</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Informe seu e-mail institucional e senha para entrar
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail Institucional"
              type="email"
              placeholder="ex: seu.nome@universidade.edu.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
              autoFocus
            />

            <div className="space-y-1">
              <Input
                label="Senha de Acesso"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setRecoverEmail(email);
                    setRecoverError('');
                    setRecoverSuccess('');
                    setIsRecoverOpen(true);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  Esqueci minha senha
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl shadow-md shadow-blue-600/20"
            >
              Entrar no Sistema
            </Button>
          </form>

          {/* Divisor */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold tracking-wider">
                Acesso Rápido para Demonstração
              </span>
            </div>
          </div>

          {/* Quick Login Test Accounts */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@universidade.edu.br', 'admin123')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-all text-xs group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 group-hover:text-blue-700">Administrador</p>
                  <p className="text-[10px] text-slate-500">admin@universidade.edu.br</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('carlos.souza@universidade.edu.br', '123456')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-left transition-all text-xs group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 group-hover:text-amber-700">Docente (Prof. Carlos)</p>
                  <p className="text-[10px] text-slate-500">carlos.souza@universidade.edu.br</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('lucas.martins@aluno.universidade.edu.br', '123456')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-all text-xs group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 group-hover:text-blue-700">Aluno (Lucas Oliveira)</p>
                  <p className="text-[10px] text-slate-500">lucas.martins@aluno.universidade.edu.br</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-slate-400 text-xs">
          Universidade Federal Institucional • Diretoria de TI
        </div>
      </div>

      {/* Recover Password Modal */}
      <Modal
        isOpen={isRecoverOpen}
        onClose={() => setIsRecoverOpen(false)}
        title="Recuperação de Senha"
        subtitle="Informe seu e-mail para receber as instruções de acesso"
        maxWidth="sm"
      >
        <form onSubmit={handleRecover} className="space-y-4">
          {recoverSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{recoverSuccess}</span>
            </div>
          )}

          {recoverError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{recoverError}</span>
            </div>
          )}

          <Input
            label="E-mail Institucional"
            type="email"
            placeholder="seu.email@universidade.edu.br"
            value={recoverEmail}
            onChange={(e) => setRecoverEmail(e.target.value)}
            required
            autoFocus
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRecoverOpen(false)}
            >
              Fechar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={recoverLoading}
            >
              Enviar Instruções
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
