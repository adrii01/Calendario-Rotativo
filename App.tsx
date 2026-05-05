
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppState, UserConfig, ShiftType, UserInfo } from './types';
import RegistrationScreen from './screens/RegistrationScreen';
import ConfigScreen from './screens/ConfigScreen';
import DashboardScreen from './screens/DashboardScreen';
import MonthlyScreen from './screens/MonthlyScreen';
import WeeklyScreen from './screens/WeeklyScreen';
import ProfileScreen from './screens/ProfileScreen';
import BottomNav from './components/BottomNav';
import { auth, db, handleFirestoreError, OperationType } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=137fec&color=fff';

const DEFAULT_CONFIG: UserConfig = {
  startDate: new Date().toISOString().split('T')[0],
  rotation: [
    { id: '1', shiftType: ShiftType.MORNING },
    { id: '2', shiftType: ShiftType.AFTERNOON },
    { id: '3', shiftType: ShiftType.NIGHT },
  ]
};

const DEFAULT_USER: UserInfo = {
  name: 'Usuario',
  email: 'ejemplo@correo.com',
  avatarUrl: DEFAULT_AVATAR
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    isRegistered: false,
    config: DEFAULT_CONFIG,
    user: DEFAULT_USER
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user is using email/password and hasn't verified their email
        if (!firebaseUser.emailVerified && firebaseUser.providerData.some(p => p.providerId === 'password')) {
          setAppState({
            isRegistered: false,
            config: DEFAULT_CONFIG,
            user: DEFAULT_USER
          });
          setIsLoading(false);
          return;
        }

        // user is logged in
        let userDoc;
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        try {
          userDoc = await getDoc(userDocRef);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          setIsLoading(false);
          return;
        }
          
        if (userDoc.exists()) {
          const data = userDoc.data();
          setAppState({
            isRegistered: true,
            user: {
              name: data.name,
              email: data.email,
              avatarUrl: data.avatarUrl || DEFAULT_AVATAR
            },
            config: {
              startDate: data.startDate || DEFAULT_CONFIG.startDate,
              rotation: data.rotation || DEFAULT_CONFIG.rotation,
              exceptions: data.exceptions || {}
            }
          });
        } else {
          // Need to set up basic config for newly logged in user
          const newUserData = {
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
            email: firebaseUser.email || '',
            avatarUrl: firebaseUser.photoURL || DEFAULT_AVATAR,
            startDate: DEFAULT_CONFIG.startDate,
            rotation: DEFAULT_CONFIG.rotation,
            exceptions: {},
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          try {
            await setDoc(userDocRef, newUserData);
          } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, `users/${firebaseUser.uid}`);
            setIsLoading(false);
            return;
          }
          
          setAppState({
            isRegistered: true,
            user: {
              name: newUserData.name,
              email: newUserData.email,
              avatarUrl: newUserData.avatarUrl
            },
            config: {
              startDate: newUserData.startDate,
              rotation: newUserData.rotation,
              exceptions: newUserData.exceptions
            }
          });
        }
      } else {
        // logged out
        setAppState({
          isRegistered: false,
          config: DEFAULT_CONFIG,
          user: DEFAULT_USER
        });
      }
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'auth');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const syncToFirestore = async (updates: any) => {
    if (!auth.currentUser) return;
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    }
  };

  const handleRegister = (userInfo: UserInfo) => {
    // This is now primarily handled by the google popup in RegistrationScreen
    // Fallback if needed
  };

  const updateConfig = (newConfig: UserConfig) => {
    setAppState(prev => ({ ...prev, config: newConfig }));
    syncToFirestore({
      startDate: newConfig.startDate,
      rotation: newConfig.rotation,
      exceptions: newConfig.exceptions || {}
    });
  };

  const updateUserInfo = (userInfo: UserInfo) => {
    setAppState(prev => ({ ...prev, user: userInfo }));
    syncToFirestore({
      name: userInfo.name,
      avatarUrl: userInfo.avatarUrl || DEFAULT_AVATAR
    });
  };

  const handleLogout = () => {
    // auth.signOut() is called in ProfileScreen
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/" 
          element={!appState.isRegistered ? <RegistrationScreen onRegister={handleRegister} /> : <Navigate to="/dashboard" replace />} 
        />

        {appState.isRegistered ? (
          <>
            <Route path="/config" element={<ConfigScreen config={appState.config} onUpdate={updateConfig} />} />
            <Route path="/dashboard" element={<DashboardScreen config={appState.config} user={appState.user} onUpdate={updateConfig} />} />
            <Route path="/month" element={<MonthlyScreen config={appState.config} onUpdate={updateConfig} />} />
            <Route path="/week" element={<WeeklyScreen config={appState.config} onUpdate={updateConfig} />} />
            <Route path="/profile" element={<ProfileScreen user={appState.user} onUpdate={updateUserInfo} onLogout={handleLogout} isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
      {appState.isRegistered && <BottomNav />}
    </HashRouter>
  );
};

export default App;
