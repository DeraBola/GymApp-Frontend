'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import api from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phoneNumber: '', password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.post('/users/register', form);
      toast.success('Account created successfully! ✨');
      router.push('/login?registered=true');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const errorMessage = axiosErr.response?.data?.detail || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { name: 'firstName', label: 'First Name', type: 'text', placeholder: 'Jane' },
    { name: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Doe' },
    { name: 'email', label: 'Email address', type: 'email', placeholder: 'jane@example.com' },
    { name: 'phoneNumber', label: 'Phone Number', type: 'tel', placeholder: '+2348012345678' },
    { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
  ] as const;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[550px] h-[550px] rounded-full bg-pink-500/20 blur-[110px] animate-float" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[450px] h-[450px] rounded-full bg-purple-600/20 blur-[100px] animate-float-slow" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-fuchsia-400/10 blur-[90px]" />
      </div>

      {/* Sparkles */}
      <div className="absolute top-16 left-24 text-pink-300/30 text-2xl select-none">✦</div>
      <div className="absolute top-32 right-40 text-purple-300/30 text-lg select-none">✦</div>
      <div className="absolute bottom-28 left-36 text-fuchsia-300/30 text-xl select-none">✦</div>
      <div className="absolute bottom-16 right-24 text-pink-300/20 text-3xl select-none">✦</div>

      <div className="relative w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 glass-strong glow-pink">
            <span className="text-3xl">🌸</span>
          </div>
          <h1
            className="text-4xl font-bold text-gradient"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            GymArch
          </h1>
          <p className="text-white/50 mt-1 text-sm tracking-wide">Management Dashboard</p>
        </div>

        {/* Glass Card */}
        <div className="glass-strong rounded-3xl p-8 shadow-2xl glow-purple">
          <h2 className="text-xl font-semibold text-white mb-1">Create your account ✨</h2>
          <p className="text-white/50 text-sm mb-6">Get started with GymArch today</p>

          {error && (
            <div className="bg-rose-500/10 border border-rose-400/30 text-rose-300 rounded-2xl px-4 py-3 text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {fields.slice(0, 2).map((field) => (
                <div key={field.name}>
                  <label className="block text-white/70 text-sm font-medium mb-2">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    required
                    placeholder={field.placeholder}
                    className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-400/50 transition-all"
                  />
                </div>
              ))}
            </div>

            {fields.slice(2, -1).map((field) => (
              <div key={field.name}>
                <label className="block text-white/70 text-sm font-medium mb-2">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  required
                  placeholder={field.placeholder}
                  className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-400/50 transition-all"
                />
              </div>
            ))}

            {/* Password field with eye toggle */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full glass rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-400/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-pink-400 transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7a9.77 9.77 0 012.168-4.332M6.53 6.53A9.77 9.77 0 0112 5c5 0 9 4 9 7a9.77 9.77 0 01-1.357 2.643M6.53 6.53L3 3m3.53 3.53 11.94 11.94M16.47 16.47 21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 mt-2"
              style={{
                background: 'linear-gradient(135deg, #ec4899, #a855f7)',
                boxShadow: '0 8px 32px rgba(236, 72, 153, 0.35)',
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : 'Create account'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-pink-400 hover:text-pink-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
