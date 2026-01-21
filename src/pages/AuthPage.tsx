import { useState } from 'react';
import { loginUser, registerUser } from '../lib/auth';
import { useAuth } from '../context/AuthContext';
import { Database, Lock, Mail, UserPlus, ArrowRight } from 'lucide-react';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const data = await loginUser({ email, password });
        login(data.token, data.user);
      } else {
        await registerUser({ email, password });
        // After registration, automatically log them in or flip to login
        const data = await loginUser({ email, password });
        login(data.token, data.user);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sql-950 via-sql-900 to-sql-950 p-4 font-sans">
      <div className="w-full max-w-md space-y-6 md:space-y-8 rounded-2xl border border-sql-700 bg-sql-900/80 backdrop-blur-sm p-6 md:p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sql-accent to-sql-accent2 text-white shadow-lg shadow-sql-accent/30">
            <Database size={36} />
          </div>
          <h2 className="mt-6 text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p className="mt-3 text-sm md:text-base text-slate-400">
            {isLogin ? 'Access your SQL workspaces' : 'Create an account to begin'}
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <label className="text-xs font-semibold text-slate-400 uppercase ml-1 mb-2 block tracking-wide">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 flex-shrink-0" size={18} />
                <input 
                  type="email" required placeholder="you@example.com" 
                  className="w-full rounded-lg border border-sql-700 bg-sql-950 py-2.5 px-3 pl-10 text-sm md:text-base text-white placeholder-slate-600 focus:border-sql-accent focus:ring-2 focus:ring-sql-accent/30 outline-none transition-all"
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-xs font-semibold text-slate-400 uppercase ml-1 mb-2 block tracking-wide">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 flex-shrink-0" size={18} />
                <input 
                  type="password" required placeholder="••••••••" 
                  className="w-full rounded-lg border border-sql-700 bg-sql-950 py-2.5 px-3 pl-10 text-sm md:text-base text-white placeholder-slate-600 focus:border-sql-accent focus:ring-2 focus:ring-sql-accent/30 outline-none transition-all"
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="group w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sql-accent2 to-sql-accent3 py-3 md:py-3.5 font-semibold text-white hover:from-sql-accent2/90 hover:to-sql-accent3/90 active:scale-[0.98] transition-all disabled:from-sql-700 disabled:to-sql-700 shadow-lg hover:shadow-xl disabled:shadow-none text-sm md:text-base"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="pt-4 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs md:text-sm text-slate-400 hover:text-sql-accent transition-colors flex items-center justify-center gap-2 mx-auto font-medium"
          >
            {isLogin ? (
              <><UserPlus size={16} /> Don't have an account? <span className="font-bold">Register</span></>
            ) : (
              <>Already have an account? <span className="font-bold">Login</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};