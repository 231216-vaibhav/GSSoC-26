import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(sessionStorage.getItem('sessionId') || null);

  // Helper to safely close an abandoned session
  const closeAbandonedSession = async (abandonedSessionId, uid) => {
    try {
      const sessionRef = doc(db, 'sessions', abandonedSessionId);
      await updateDoc(sessionRef, {
        logoutTime: serverTimestamp(),
        isActive: false,
        logoutReason: 'abandoned_or_new_login'
      });
      // Log the abandonment
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
        
        // Loophole fix: Check if we have an active session in this tab
        const currentTabSessionId = sessionStorage.getItem('sessionId');
        
        if (!currentTabSessionId) {
          // This means the user reopened the browser or opened a new tab while authenticated
          try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              const userData = userSnap.data();
              if (userData.currentSessionId) {
                // Close the old abandoned session
                await closeAbandonedSession(userData.currentSessionId, currentUser.uid);
              }
            }

            // Create a new session for this new window/tab
            const newSessionRef = await addDoc(collection(db, 'sessions'), {
              uid: currentUser.uid,
              loginTime: serverTimestamp(),
              isActive: true,
              type: 'auto_resume'
            });
            
            // Update user with new session
            await setDoc(userRef, { currentSessionId: newSessionRef.id }, { merge: true });
            
            // Log this resume action
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

  // Handle browser close/refresh for active session
  useEffect(() => {
    // We try beforeunload as a fallback to close the session cleanly
    const handleBeforeUnload = () => {
      if (user && sessionId) {
         // Fire and forget update
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
        oldSessionId = userSnap.data().currentSessionId;
      }

      if (oldSessionId) {
        await closeAbandonedSession(oldSessionId, loggedInUser.uid);
      }

      // 1. Create Session
      const sessionRef = await addDoc(collection(db, 'sessions'), {
        uid: loggedInUser.uid,
        loginTime: serverTimestamp(),
        isActive: true,
        type: 'manual_login'
      });
      
      setSessionId(sessionRef.id);
      sessionStorage.setItem('sessionId', sessionRef.id);

      // 2. Update/Create User Document
      await setDoc(userRef, {
        uid: loggedInUser.uid,
        name: loggedInUser.displayName,
        email: loggedInUser.email,
        profilePicture: loggedInUser.photoURL,
        lastLogin: serverTimestamp(),
        currentSessionId: sessionRef.id
      }, { merge: true });
      
      // If new user, set createdAt
      if (!userSnap.exists()) {
        await updateDoc(userRef, { createdAt: serverTimestamp() });
      }

      // 3. Log Auth Activity
      await addDoc(collection(db, 'auth_logs'), {
        uid: loggedInUser.uid,
        email: loggedInUser.email,
        action: 'login',
        timestamp: serverTimestamp()
      });

    } catch (error) {
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
        
        // Remove currentSessionId from user
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { currentSessionId: null });
      }
      
      sessionStorage.removeItem('sessionId');
      setSessionId(null);
      await signOut(auth);
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Failed to logout: " + error.message);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="app-container">
      <div className="card">
        <h1>Welcome</h1>
        {user ? (
          <div className="profile-section">
            <img src={user.photoURL} alt="Profile" className="profile-pic" />
            <h2>{user.displayName}</h2>
            <p>{user.email}</p>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="login-section">
            <p>Please sign in to continue</p>
            <button className="login-btn" onClick={handleLogin}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
