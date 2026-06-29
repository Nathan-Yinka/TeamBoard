import { useQuery } from '@tanstack/react-query';
import { ReactNode, useEffect } from 'react';
import { authService } from '../../services/auth.service';
import { queryKeys } from '../../services/queryKeys';
import { clearAuth, markAnonymous, setUser } from '../../store/authSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

interface AuthBootstrapProps {
  children: ReactNode;
}

export function AuthBootstrap({ children }: AuthBootstrapProps): JSX.Element {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);
  const shouldFetchUser = token !== null && user === null;

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authService.me,
    enabled: shouldFetchUser,
    retry: false
  });

  useEffect(() => {
    if (!token) {
      dispatch(markAnonymous());
      return;
    }

    if (meQuery.data) {
      dispatch(setUser(meQuery.data));
    }

    if (meQuery.isError) {
      dispatch(clearAuth());
    }
  }, [dispatch, meQuery.data, meQuery.isError, token]);

  return <>{children}</>;
}
