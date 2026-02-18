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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sql-950 via-sql-900 to-sql-950 p-3 md:p-4 font-sans">
      <div className="w-full max-w-md space-y-4 md:space-y-8 rounded-xl md:rounded-2xl border border-sql-700 bg-sql-900/80 backdrop-blur-sm p-4 md:p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 md:h-16 w-14 md:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sql-accent to-sql-accent2 text-white shadow-lg shadow-sql-accent/30">
            <Database size={28} className="md:w-9 md:h-9" />
          </div>
          <h2 className="mt-4 md:mt-6 text-xl md:text-3xl font-extrabold text-white tracking-tight">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p className="mt-2 md:mt-3 text-xs md:text-base text-slate-400">
            {isLogin ? 'Access your SQL workspaces' : 'Create an account to begin'}
          </p>
        </div>

        <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3 md:space-y-4">
            <div>
              <label className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase block mb-1.5 md:mb-2 tracking-wide">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 flex-shrink-0" size={16} />
                <input 
                  type="email" required placeholder="you@example.com" 
                  className="w-full rounded-lg border border-sql-700 bg-sql-950 py-2 md:py-2.5 px-3 pl-9 md:pl-10 text-xs md:text-base text-white placeholder-slate-600 focus:border-sql-accent focus:ring-2 focus:ring-sql-accent/30 outline-none transition-all"
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase block mb-1.5 md:mb-2 tracking-wide">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 flex-shrink-0" size={16} />
                <input 
                  type="password" required placeholder="••••••••" 
                  className="w-full rounded-lg border border-sql-700 bg-sql-950 py-2 md:py-2.5 px-3 pl-9 md:pl-10 text-xs md:text-base text-white placeholder-slate-600 focus:border-sql-accent focus:ring-2 focus:ring-sql-accent/30 outline-none transition-all"
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="group w-full flex items-center justify-center gap-1.5 md:gap-2 rounded-lg bg-gradient-to-r from-sql-accent2 to-sql-accent3 py-2.5 md:py-3.5 font-semibold text-white hover:from-sql-accent2/90 hover:to-sql-accent3/90 active:scale-[0.98] transition-all disabled:from-sql-700 disabled:to-sql-700 shadow-lg hover:shadow-xl disabled:shadow-none text-xs md:text-base mt-4 md:mt-6"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            {!loading && <ArrowRight size={16} className="md:w-[18px] md:h-[18px] group-hover:translate-x-1 transition-transform hidden md:inline" />}
          </button>
        </form>

        <div className="pt-2 md:pt-4 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] md:text-sm text-slate-400 hover:text-sql-accent transition-colors flex items-center justify-center gap-1 md:gap-2 mx-auto font-medium"
          >
            {isLogin ? (
              <><UserPlus size={14} className="md:w-4 md:h-4" /> <span>Don't have an account? <span className="font-bold">Register</span></span></>
            ) : (
              <><span>Already have an account? <span className="font-bold">Login</span></span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};