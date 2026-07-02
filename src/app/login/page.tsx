'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Lock, Mail, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error('Correo o contraseña incorrectos');
      setLoading(false);
      return;
    }

    toast.success('¡Bienvenido de nuevo!');
    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-navy-gradient px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-card-hover">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-gradient">
            <BookOpen className="h-6 w-6 text-gold-400" />
          </span>
          <h1 className="font-serif text-xl font-bold text-navy-900">Panel Administrativo</h1>
          <p className="mt-1 text-xs text-navy-400">Inicia sesión para gestionar el himnario</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-navy-600">Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@iglesia.org"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-navy-600">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10"
              />
            </div>
          </div>

          <Button type="submit" variant="gold" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Iniciar sesión'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-navy-400">
          <Link href="/" className="hover:text-navy-700">
            ← Volver al himnario
          </Link>
        </p>
      </div>
    </div>
  );
}
