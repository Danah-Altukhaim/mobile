'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface AdminUser {
  id: string;
  email: string;
  name_en: string;
  name_ar: string;
  role: string;
}

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const MOCK_CREDENTIALS: Record<string, { password: string; user: AdminUser }> = {
  'dean@cck.edu.kw': {
    password: 'admin123',
    user: { id: 'admin_001', email: 'dean@cck.edu.kw', name_en: 'Dr. Abdullah Al-Faisal', name_ar: 'د. عبدالله الفيصل', role: 'super_admin' },
  },
  'registrar@cck.edu.kw': {
    password: 'admin123',
    user: { id: 'admin_002', email: 'registrar@cck.edu.kw', name_en: 'Noura Al-Shahri', name_ar: 'نورة الشهري', role: 'registration_staff' },
  },
  'admission@cck.edu.kw': {
    password: 'admin123',
    user: { id: 'admin_003', email: 'admission@cck.edu.kw', name_en: 'Ahmed Al-Ghamdi', name_ar: 'أحمد الغامدي', role: 'admission_staff' },
  },
  'vp@cck.edu.kw': {
    password: 'admin123',
    user: { id: 'admin_004', email: 'vp@cck.edu.kw', name_en: 'Dr. Yousef Al-Mutairi', name_ar: 'د. يوسف المطيري', role: 'vp' },
  },
  'professor@cck.edu.kw': {
    password: 'admin123',
    user: { id: 'admin_005', email: 'professor@cck.edu.kw', name_en: 'Dr. Fatima Al-Kandari', name_ar: 'د. فاطمة الكندري', role: 'faculty' },
  },
  'facilities@cck.edu.kw': {
    password: 'admin123',
    user: { id: 'admin_006', email: 'facilities@cck.edu.kw', name_en: 'Khaled Al-Enezi', name_ar: 'خالد العنزي', role: 'facilities_staff' },
  },
  'marketing@cck.edu.kw': {
    password: 'admin123',
    user: { id: 'admin_007', email: 'marketing@cck.edu.kw', name_en: 'Sara Al-Ajmi', name_ar: 'سارة العجمي', role: 'marketing_staff' },
  },
  'studentlife@cck.edu.kw': {
    password: 'admin123',
    user: { id: 'admin_008', email: 'studentlife@cck.edu.kw', name_en: 'Mona Al-Rashidi', name_ar: 'منى الرشيدي', role: 'student_life_staff' },
  },
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('cck-admin-session');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('cck-admin-session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 500));
    const cred = MOCK_CREDENTIALS[email];
    if (cred && cred.password === password) {
      setUser(cred.user);
      localStorage.setItem('cck-admin-session', JSON.stringify(cred.user));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('cck-admin-session');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
