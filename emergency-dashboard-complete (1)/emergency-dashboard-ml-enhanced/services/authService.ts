import { User, UserRole } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  contactNumber: string;
  role: UserRole;
}

class AuthService {
  private readonly STORAGE_KEY = 'dpi4_current_user';
  private readonly USERS_KEY = 'dpi4_users';

  constructor() {
    this.initializeDefaultUsers();
  }

  private initializeDefaultUsers() {
    const existingUsers = this.getAllUsers();
    if (existingUsers.length === 0) {
      const defaultUsers: User[] = [
        {
          id: 'user-citizen-1',
          name: 'Citizen User',
          email: 'citizen@example.com',
          contactNumber: '+91-9876543210',
          role: 'citizen',
          trustScore: 75,
          totalReports: 5,
          verifiedReports: 4,
          spamReports: 0,
          lastReportTime: Date.now() - 24 * 60 * 60 * 1000
        },
        {
          id: 'user-admin-1',
          name: 'Admin User',
          email: 'admin@emergency.gov',
          contactNumber: '+91-1234567890',
          role: 'authority',
          trustScore: 100,
          totalReports: 0,
          verifiedReports: 0,
          spamReports: 0,
          lastReportTime: 0
        },
        {
          id: 'user-responder-1',
          name: 'Responder User',
          email: 'responder@emergency.gov',
          contactNumber: '+91-9988776655',
          role: 'civil_servant',
          trustScore: 95,
          totalReports: 0,
          verifiedReports: 0,
          spamReports: 0,
          lastReportTime: 0
        }
      ];

      localStorage.setItem(this.USERS_KEY, JSON.stringify(defaultUsers));
    }
  }

  private getAllUsers(): User[] {
    const usersJson = localStorage.getItem(this.USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private saveUsers(users: User[]) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  login(credentials: LoginCredentials): User | null {
    const users = this.getAllUsers();
    const user = users.find(u => 
      u.email.toLowerCase() === credentials.email.toLowerCase()
    );

    if (user) {
      // Simple password check (in real app, use proper authentication)
      const validPasswords: { [key: string]: string } = {
        'citizen@example.com': 'citizen123',
        'admin@emergency.gov': 'admin123',
        'responder@emergency.gov': 'responder123'
      };

      if (validPasswords[user.email.toLowerCase()] === credentials.password) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        return user;
      }
    }

    return null;
  }

  signup(data: SignupData): User | null {
    const users = this.getAllUsers();
    
    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return null;
    }

    // Validate contact number
    if (!data.contactNumber || data.contactNumber.length < 10) {
      return null;
    }

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      email: data.email,
      contactNumber: data.contactNumber,
      role: data.role || 'citizen',
      trustScore: 50, // New users start with neutral score
      totalReports: 0,
      verifiedReports: 0,
      spamReports: 0,
      lastReportTime: 0
    };

    users.push(newUser);
    this.saveUsers(users);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newUser));

    return newUser;
  }

  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(this.STORAGE_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  updateUserTrustScore(userId: string, reportVerified: boolean, isSpam: boolean) {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return;

    const user = users[userIndex];
    user.totalReports += 1;
    
    if (reportVerified) {
      user.verifiedReports += 1;
    }
    
    if (isSpam) {
      user.spamReports += 1;
    }

    user.lastReportTime = Date.now();

    // Recalculate trust score
    let score = 50; // Base score
    const verificationRate = user.verifiedReports / user.totalReports;
    const spamRate = user.spamReports / user.totalReports;

    score += verificationRate * 40; // Up to +40 for verified reports
    score -= spamRate * 60; // Up to -60 for spam
    score += Math.min(user.totalReports * 2, 20); // Up to +20 for experience

    user.trustScore = Math.max(0, Math.min(100, Math.round(score)));

    users[userIndex] = user;
    this.saveUsers(users);

    // Update current user if it's the same
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    }
  }
}

export const authService = new AuthService();
