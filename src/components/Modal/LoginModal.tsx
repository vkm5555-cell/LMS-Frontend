import React from "react";
import { useNavigate } from 'react-router-dom';
import SignupModal from "./SignupModal";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-80">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✖
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Log In</h2>
        {/* Login form with OTP */}
        <LoginFormWithOtp />
      </div>
    </div>
  );
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const LoginFormWithOtp: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = React.useState<'login' | 'otp'>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  //const [isOpen, setIsOpen] = React.useState(false);
  const [isSignupOpen, setIsSignupOpen] = React.useState(false);

  React.useEffect(() => {
    function handleOpenSignupModal() {
      setIsSignupOpen(true);
      console.log('Signup modal opened via event');
    }
    window.addEventListener('openSignupModal', handleOpenSignupModal);
    return () => {
      window.removeEventListener('openSignupModal', handleOpenSignupModal);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => 'Invalid credentials');
        throw new Error(errText || 'Invalid credentials');
      }
      const data = await res.json();
      // decode user.id if it's a JWT (same logic as SignInForm)
      let decodedUserId = data.user?.id;
      try {
        if (typeof data.user?.id === 'string' && data.user.id.includes('.')) {
          const base64Url = data.user.id.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          decodedUserId = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
        }
      } catch (err) {
        // ignore decode errors
      }
      if (data.access_token) localStorage.setItem('token', data.access_token);
      if (decodedUserId) localStorage.setItem('user_id', decodedUserId);
      // store role as-is but we'll compare case-insensitively
      if (data.user?.role) localStorage.setItem('role', String(data.user.role));

      // if API indicates OTP required, proceed to otp step; otherwise check role
      if (data?.requires_otp) {
        setStep('otp');
      } else {
        // enforce student-only login (case-insensitive; accept alternate fields)
        const rawRole = (data.user?.role ?? data.role ?? '').toString();
        const role = rawRole.toLowerCase();
        if (role !== 'student') {
          // logout/clear auth
          localStorage.removeItem('token');
          localStorage.removeItem('user_id');
          localStorage.removeItem('role');
          setError('Only students can log in here');
        } else {
          navigate('/Student-Dashboard');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Simulate OTP check
    if (otp.length === 6) {
      // In a real flow we'd verify OTP with server; here check role and redirect
      const storedRole = (localStorage.getItem('role') ?? '').toString().toLowerCase();
      if (storedRole !== 'student') {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('role');
        setError('Only students can log in here');
        return;
      }
      // Redirect to /Student-Dashboard
      window.location.href = '/Student-Dashboard';
    } else {
      setError('Please enter a valid 6-digit OTP');
    }
  };

  return (
    <div>
      {step === 'login' && (
        <>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded px-3 py-2 font-semibold hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Logging in…' : 'Log In'}
            </button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <button
              type="button"
              className="text-blue-600 hover:underline font-semibold"
              onClick={() => {
                if (typeof window !== 'undefined' && window.dispatchEvent) {
                  window.dispatchEvent(new CustomEvent("openSignupModal"));
                  console.log('CustomEvent openSignupModal dispatched');
                } else {
                  console.log('CustomEvent not dispatched: window or dispatchEvent not available');
                }
              }}
            >
              Register here
            </button>
          </div>
        </>
      )}
      {step === 'otp' && (
          <form className="space-y-4" onSubmit={handleOtp}>
          <div>
            <label className="block text-sm font-medium mb-1">Enter OTP</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
              placeholder="6-digit OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              maxLength={6}
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-green-600 text-white rounded px-3 py-2 font-semibold hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Verifying…' : 'Verify OTP'}
          </button>
        </form>
      )}
      <SignupModal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} />
    </div>
  );
};

export default LoginModal;
