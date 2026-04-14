'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail } from 'lucide-react';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-secondary)] to-black">
      <Card className="w-full max-w-md mx-4 backdrop-blur-md bg-white/95 shadow-2xl border-white/20">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg transform -rotate-6">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Recuperar Senha</CardTitle>
          <CardDescription className="text-gray-600">
            Informe seu e-mail para receber o link de recuperação.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="teste@email.com"
                className="bg-gray-50/50"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            {submitted && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                Enviamos um link de recuperação para o e-mail informado.
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full h-11 bg-[var(--color-primary)] text-white shadow-md">
              Enviar instruções
            </Button>
            <Link href="/login" className="text-center text-sm text-gray-500 hover:text-primary">
              Voltar para o login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
