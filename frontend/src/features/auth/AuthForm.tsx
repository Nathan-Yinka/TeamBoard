import { Button, Card, Flex, Heading, Text, TextField } from '@radix-ui/themes';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { FormEvent, ReactNode, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { authService, LoginRequest, SignupRequest } from '../../services/auth.service';
import { setCredentials } from '../../store/authSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps): JSX.Element {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.status === 'authenticated');
  const navigate = useNavigate();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const loginMutation = useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: (response) => {
      dispatch(setCredentials(response));
      navigate('/app');
    },
    onError: () => {
      setError('Unable to complete the request. Check your details and try again.');
    }
  });
  const signupMutation = useMutation({
    mutationFn: (payload: SignupRequest) => authService.signup(payload),
    onSuccess: (response) => {
      dispatch(setCredentials(response));
      navigate('/app');
    },
    onError: () => {
      setError('Unable to complete the request. Check your details and try again.');
    }
  });
  const isSubmitting = loginMutation.isPending || signupMutation.isPending;

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError('');
    if (mode === 'signup') {
      signupMutation.mutate({ name, email, password });
      return;
    }

    loginMutation.mutate({ email, password });
  }

  return (
    <main className="min-h-screen grid place-items-center p-6 bg-slate-50 font-sans">
      <Card size="4" className="w-full max-w-[420px] p-8 shadow-xl bg-white border border-slate-200">
        <Flex direction="column" gap="2" mb="6">
          <Text className="text-teal-600 text-xs font-bold uppercase tracking-wider">TeamBoard</Text>
          <Heading size="7" className="text-slate-900">{mode === 'signup' ? 'Create workspace access' : 'Sign in to TeamBoard'}</Heading>
        </Flex>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'signup' ? (
            <label className="flex flex-col gap-1.5 text-slate-700 text-sm font-semibold">
              <span>Name</span>
              <TextField.Root name="name" value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
          ) : null}
          <label className="flex flex-col gap-1.5 text-slate-700 text-sm font-semibold">
            <span>Email</span>
            <TextField.Root
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1.5 text-slate-700 text-sm font-semibold">
            <span>Password</span>
            <TextField.Root
              name="password"
              type={showPassword ? 'text' : 'password'}
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            >
              <TextField.Slot side="right">
                <button
                  type="button"
                  className="cursor-pointer text-slate-400 hover:text-slate-600 outline-none px-2"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </TextField.Slot>
            </TextField.Root>
          </label>

          {error ? <p className="text-red-600 font-bold text-sm mt-1">{error}</p> : null}

          <Button type="submit" disabled={isSubmitting} size="3" className="mt-2 w-full cursor-pointer">
            {buttonLabel(mode, isSubmitting)}
          </Button>
        </form>

        <p className="text-slate-500 text-sm mt-6 text-center">{footerCopy(mode)}</p>
      </Card>
    </main>
  );
}

function buttonLabel(mode: 'login' | 'signup', isSubmitting: boolean): string {
  if (isSubmitting) {
    return mode === 'signup' ? 'Creating account...' : 'Signing in...';
  }

  return mode === 'signup' ? 'Create account' : 'Sign in';
}

function footerCopy(mode: 'login' | 'signup'): ReactNode {
  if (mode === 'signup') {
    return (
      <>
        Already have an account? <Link to="/login" className="text-teal-600 font-semibold hover:underline">Sign in</Link>
      </>
    );
  }

  return (
    <>
      Need access? <Link to="/signup" className="text-teal-600 font-semibold hover:underline">Create an account</Link>
    </>
  );
}
