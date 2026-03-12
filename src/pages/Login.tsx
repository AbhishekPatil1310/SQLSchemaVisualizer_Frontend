import { useState } from 'react';
import { loginUser } from '../lib/auth';
import { useAuth } from '../context/AuthContext';
import { Database, Lock, Mail } from 'lucide-react';
import { AuthPage } from './AuthPage';
import { toast } from 'sonner';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await loginUser({ email, password });
      login(data.token, data.user);
    } catch (err) {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-950 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-brand-900 p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Database size={28} />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">Aiven Proxy</h2>
          <p className="mt-2 text-sm text-slate-400">Manage your managed databases</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
              <input type="email" required placeholder="Email address" 
                className="w-full rounded-lg border border-slate-700 bg-brand-950 py-2.5 pl-10 text-white focus:border-blue-500 outline-none transition"
                onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
              <input type="password" required placeholder="Password" 
                className="w-full rounded-lg border border-slate-700 bg-brand-950 py-2.5 pl-10 text-white focus:border-blue-500 outline-none transition"
                onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white hover:bg-blue-500 transition">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};