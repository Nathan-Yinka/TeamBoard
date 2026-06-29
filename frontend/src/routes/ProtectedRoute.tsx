import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { LayoutDashboard, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: JSX.Element;
}

export function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const { status } = useAppSelector((state) => state.auth);

  if (status === 'loading') {
    return (
      <main className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-teal-100 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-teal-600 p-4 rounded-full text-white shadow-lg">
            <LayoutDashboard size={32} className="stroke-[2px]" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <Loader2 size={16} className="animate-spin text-teal-600" />
          Loading workspace...
        </div>
      </main>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  return children;
}
