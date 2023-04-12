import React, { createContext, useContext } from 'react';
import useFirebaseAuth from '@/hooks/use_firebase_auth';
import { InAuthUser } from '@/models/in_auth_user';

interface InAuthUserContext {
  authUser: InAuthUser | null;

  /** 로그인 여부가 진행중인지 체크 */
  loading: boolean;
  signInWithGoogle: () => void;
  signOut: () => void;
}

const AuthUserContext = createContext<InAuthUserContext>({
  authUser: null,
  loading: true,
  signInWithGoogle: async () => ({ user: null, creadential: null }),
  signOut: () => {},
});

// Provider : context 속에 매번 변경되는 children만 뽑아서 쓸 수 있다?
export const AuthUserProvider = function ({ children }: { children: React.ReactNode }) {
  const auth = useFirebaseAuth();
  return <AuthUserContext.Provider value={auth}>{children}</AuthUserContext.Provider>;
};

export const UseAuth = () => useContext(AuthUserContext);
