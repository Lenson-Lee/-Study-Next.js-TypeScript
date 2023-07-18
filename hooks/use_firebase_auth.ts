import { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, User, signInWithEmailAndPassword } from 'firebase/auth';
import { InAuthUser } from '@/models/in_auth_user';
import FirebaseClient from '@/models/firebase_client'; //Auth

export default function useFirebaseAuth() {
  //Auth User 값을 반환
  const [authUser, setAuthUser] = useState<InAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
      const signInResult = await signInWithPopup(FirebaseClient.getInstance().Auth, provider);

      if (signInResult.user) {
        console.info('👀 signInWith Google : ', signInResult.user);
        const resp = await fetch('/api/members.add', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: signInResult.user.uid,
            email: signInResult.user.email,
            displayName: signInResult.user.displayName,
            photoURL: signInResult.user.photoURL,
          }),
        });
        console.info({ status: resp.status });
        const respData = await resp.json();
        console.info(respData);
      }
    } catch (err) {
      console.error(err);
    }
  }

  //___________________________________________________

  /** 체험용 계정 로그인 로직 */
  async function signInTestAdmin(email: string, password: string) {
    signInWithEmailAndPassword(FirebaseClient.getInstance().Auth, email, password)
      .then((userCredential) => {
        // Signed in
        const { user } = userCredential;

        return user;
        // ...
      })
      .catch((error) => {
        if (email === '' || password === '') {
          console.info('🤔 비밀번호가 비어있어요');
        }
        console.info('🤔 error code & message : ', error.code, error.message);
      });
  }

  //___________________________________________________
  /** 모든걸 초기화 */
  const clear = () => {
    setAuthUser(null);
    setLoading(true);
  };

  const signOut = () => FirebaseClient.getInstance().Auth.signOut().then(clear);

  const AuthStateChanged = async (authState: User | null) => {
    if (authState === null) {
      setAuthUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setAuthUser({
      uid: authState.uid,
      email: authState.email,
      photoURL: authState.photoURL,
      displayName: authState.displayName,
    });

    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = FirebaseClient.getInstance().Auth.onAuthStateChanged(AuthStateChanged);
    return () => unsubscribe();
  }, []);
  return {
    authUser,
    loading,
    signInWithGoogle,
    signInTestAdmin,
    signOut,
  };
}
