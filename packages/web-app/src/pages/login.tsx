import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, Shield, Waves, AlertTriangle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Redirect to dashboard if user is already logged in
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterClick = () => {
    router.push('/register');
  };

  const handleDemoLogin = (email: string, password: string) => {
    setFormData({ email, password });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="spinner-lg text-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1926&q=80")'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-primary-800/70 to-accent-900/80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          {/* Header */}
          <header className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-large border border-white/20">
                  <Waves className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent-400 rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">
              Welcome to OceanGuard
            </h1>
            <p className="text-white/90 text-lg">
              Protect our oceans, one report at a time
            </p>
          </header>

          {/* Login Card */}
          <main className="card-elevated bg-white/95 backdrop-blur-sm border-white/20">
            <div className="card-body">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-display font-semibold text-neutral-900 mb-2">
                  Sign In
                </h2>
                <p className="text-neutral-600">
                  Access your account to monitor and report hazards
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`form-input pl-10 ${error ? 'form-input-error' : ''}`}
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`form-input pl-10 pr-10 ${error ? 'form-input-error' : ''}`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="alert-danger">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-danger-500 mr-2" />
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn-primary btn-lg w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner-sm mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>

                {/* Register Link */}
                <div className="text-center">
                  <p className="text-neutral-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={handleRegisterClick}
                      className="font-medium text-primary-500 hover:text-primary-600 transition-colors"
                    >
                      Create one here
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </main>

          {/* Demo Credentials */}
          <section className="card bg-white/90 backdrop-blur-sm border-white/20">
            <div className="card-body">
              <h3 className="text-lg font-display font-semibold text-neutral-900 mb-4 text-center">
                Try Demo Accounts
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleDemoLogin('citizen@oceanguard.com', 'password')}
                  className="w-full p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-all duration-200 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-900">Citizen Account</p>
                      <p className="text-sm text-neutral-600">citizen@oceanguard.com</p>
                    </div>
                    <div className="badge badge-primary">Report Hazards</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleDemoLogin('admin@oceanguard.com', 'password')}
                  className="w-full p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-all duration-200 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-900">Official Account</p>
                      <p className="text-sm text-neutral-600">admin@oceanguard.com</p>
                    </div>
                    <div className="badge badge-accent">Verify Reports</div>
                  </div>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

