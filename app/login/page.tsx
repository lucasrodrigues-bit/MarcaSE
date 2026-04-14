'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Usuário de teste
const TEST_USER = {
  email: 'teste@email.com',
  password: '123456',
};

export default function LoginPage() {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simula delay de validação
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (email === TEST_USER.email && password === TEST_USER.password) {
      // Salva token de autenticação no cookie
      document.cookie = 'authToken=test-token; path=/; max-age=86400'; // 24 horas
      
      // Login bem-sucedido - redireciona para home
      window.location.href = '/';
    } else {
      // Erro de autenticação
      setError('Email ou senha incorretos. Tente novamente.');
    }

    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-secondary)] to-black">
      <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
      <Card className="w-full max-w-md mx-4 backdrop-blur-md bg-white/95 shadow-2xl border-white/20">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg transform -rotate-6">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">MediConnect</CardTitle>
          <CardDescription className="text-gray-600">
            {isForgotPassword 
              ? 'Informe seu e-mail para receber as instruções de recuperação.'
              : 'Gestão clínica inteligente com o toque da IA.'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="teste@email.com"
                className="bg-gray-50/50"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                disabled={isLoading}
              />
            </div>
            {!isForgotPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError('');
                    }}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-gray-50/50"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Mensagem de erro */}
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600 ml-2">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`w-full h-11 text-white shadow-md transition-colors ${
                isFormValid && !isLoading
                  ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Entrando...' : isForgotPassword ? 'Enviar Link de Recuperação' : 'Entrar na Plataforma'}
            </Button>
            
            <div className="text-center">
              {isForgotPassword ? (
                <button 
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError('');
                  }}
                  className="text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  Voltar para o Login
                </button>
              ) : (
                <p className="text-xs text-gray-500">
                  Ao entrar, você concorda com nossos <a href="#" className="underline">Termos e Privacidade</a>.
                </p>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
