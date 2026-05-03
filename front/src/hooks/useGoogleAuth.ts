import { useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export function useGoogleAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(sessionStorage.getItem('sessionId') || null);

  const closeAbandonedSession = async (abandonedSessionId: string, uid: string) => {
    try {
      const sessionRef = doc(db, 'sessions', abandonedSessionId);
      await updateDoc(sessionRef, {
        logoutTime: serverTimestamp(),
        isActive: false,
        logoutReason: 'abandoned_or_new_login'
      });
      await addDoc(collection(db, 'auth_logs'), {
        uid: uid,
        action: 'session_abandoned',
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.log('Error closing abandoned session:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const currentTabSessionId = sessionStorage.getItem('sessionId');
        
        if (!currentTabSessionId) {
          try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              const userData = userSnap.data();
              if (userData.currentSessionId) {
                await closeAbandonedSession(userData.currentSessionId, currentUser.uid);
              }
            }

            const newSessionRef = await addDoc(collection(db, 'sessions'), {
              uid: currentUser.uid,
              loginTime: serverTimestamp(),
              isActive: true,
              type: 'auto_resume'
            });
            
            await setDoc(userRef, { currentSessionId: newSessionRef.id }, { merge: true });
            
            await addDoc(collection(db, 'auth_logs'), {
              uid: currentUser.uid,
              email: currentUser.email,
              action: 'session_auto_resume',
              timestamp: serverTimestamp()
            });

            setSessionId(newSessionRef.id);
            sessionStorage.setItem('sessionId', newSessionRef.id);
          } catch (err) {
            console.error("Error handling session resume:", err);
          }
        }
      } else {
        setUser(null);
        setSessionId(null);
        sessionStorage.removeItem('sessionId');
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user && sessionId) {
         const sessionRef = doc(db, 'sessions', sessionId);
         updateDoc(sessionRef, {
           logoutTime: serverTimestamp(),
           isActive: false,
           logoutReason: 'browser_closed'
         }).catch(() => {});
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, sessionId]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedInUser = result.user;
      
      const userRef = doc(db, 'users', loggedInUser.uid);
      const userSnap = await getDoc(userRef);
      
      let oldSessionId = null;
      if (userSnap.exists()) {
        oldSessionId = userSnap.data()?.currentSessionId;
      }

      if (oldSessionId) {
        await closeAbandonedSession(oldSessionId, loggedInUser.uid);
      }

      const sessionRef = await addDoc(collection(db, 'sessions'), {
        uid: loggedInUser.uid,
        loginTime: serverTimestamp(),
        isActive: true,
        type: 'manual_login'
      });
      
      setSessionId(sessionRef.id);
      sessionStorage.setItem('sessionId', sessionRef.id);

      await setDoc(userRef, {
        uid: loggedInUser.uid,
        name: loggedInUser.displayName,
        email: loggedInUser.email,
        profilePicture: loggedInUser.photoURL,
        lastLogin: serverTimestamp(),
        currentSessionId: sessionRef.id
      }, { merge: true });
      
      if (!userSnap.exists()) {
        await updateDoc(userRef, { createdAt: serverTimestamp() });
      }

      await addDoc(collection(db, 'auth_logs'), {
        uid: loggedInUser.uid,
        email: loggedInUser.email,
        action: 'login',
        timestamp: serverTimestamp()
      });

    } catch (error: any) {
      console.error("Error during login:", error);
      alert("Failed to login: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      if (user) {
        if (sessionId) {
          const sessionRef = doc(db, 'sessions', sessionId);
          await updateDoc(sessionRef, {
            logoutTime: serverTimestamp(),
            isActive: false,
            logoutReason: 'manual_logout'
          });
        }

        await addDoc(collection(db, 'auth_logs'), {
          uid: user.uid,
          email: user.email,
          action: 'logout',
          timestamp: serverTimestamp()
        });
        
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { currentSessionId: null });
      }
      
      sessionStorage.removeItem('sessionId');
      setSessionId(null);
      await signOut(auth);
    } catch (error: any) {
      console.error("Error during logout:", error);
      alert("Failed to logout: " + error.message);
    }
  };

  return { user, loading, handleLogin, handleLogout };
}
