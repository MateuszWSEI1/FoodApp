import { Injectable, signal } from '@angular/core';
import { Address, UserAccount } from '../models/user.model';

type PublicUser = Omit<UserAccount, 'passwordHash'>;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'foodapp_users';

  readonly currentUser = signal<PublicUser | null>(
    this.getCurrentUser()
  );

  private getUsers(): UserAccount[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private saveUsers(users: UserAccount[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }

  private toPublicUser(user: UserAccount): PublicUser {
    const { passwordHash, ...publicUser } = user;
    return publicUser;
  }

  private async hashPassword(password: string): Promise<string> {
    const data = new TextEncoder().encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);

    return Array.from(new Uint8Array(hash))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  private getCurrentUser(): PublicUser | null {
    const id = localStorage.getItem('foodapp_current_user');

    if (!id) return null;

    const user = this.getUsers().find(item => item.id === id);

    return user ? this.toPublicUser(user) : null;
  }

  async register(
    name: string,
    email: string,
    password: string,
    deliveryAddress: Address
  ): Promise<void> {
    const users = this.getUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some(user => user.email.toLowerCase() === normalizedEmail)) {
      throw new Error('Ten adres e-mail jest już zajęty.');
    }

    const user: UserAccount = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await this.hashPassword(password),
      role: 'customer',
      deliveryAddress
    };

    this.saveUsers([...users, user]);
  }

  async login(email: string, password: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await this.hashPassword(password);

    const user = this.getUsers().find(
      item =>
        item.email.toLowerCase() === normalizedEmail &&
        item.passwordHash === passwordHash
    );

    if (!user) {
      throw new Error('Nieprawidłowy e-mail lub hasło.');
    }

    localStorage.setItem('foodapp_current_user', user.id);
    this.currentUser.set(this.toPublicUser(user));
  }

  logout(): void {
    localStorage.removeItem('foodapp_current_user');
    this.currentUser.set(null);
  }

  updateProfile(
    name: string,
    email: string,
    phone?: string,
    deliveryAddress?: Address
  ): void {
    const current = this.currentUser();

    if (!current) {
      throw new Error('Musisz się zalogować.');
    }

    const users = this.getUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some(
      user =>
        user.id !== current.id &&
        user.email.toLowerCase() === normalizedEmail
    )) {
      throw new Error('Ten adres e-mail jest już zajęty.');
    }

    const updated = users.map(user =>
      user.id === current.id
        ? {
            ...user,
            name: name.trim(),
            email: normalizedEmail,
            phone,
            ...(user.role === 'customer' && deliveryAddress
              ? { deliveryAddress }
              : {})
          }
        : user
    );

    this.saveUsers(updated);

    const user = updated.find(item => item.id === current.id);

    if (user) {
      this.currentUser.set(this.toPublicUser(user));
    }
  }

  getAllUsers(): PublicUser[] {
    if (this.currentUser()?.role !== 'admin') {
      throw new Error('Brak uprawnień administratora.');
    }

    return this.getUsers().map(user => this.toPublicUser(user));
  }

  async createAdmin(
    name: string,
    email: string,
    password: string
  ): Promise<void> {
    if (this.currentUser()?.role !== 'admin') {
      throw new Error('Tylko administrator może tworzyć konta adminów.');
    }

    const users = this.getUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some(user => user.email.toLowerCase() === normalizedEmail)) {
      throw new Error('Ten adres e-mail jest już zajęty.');
    }

    const admin: UserAccount = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await this.hashPassword(password),
      role: 'admin'
    };

    this.saveUsers([...users, admin]);
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    if (this.currentUser()?.role !== 'admin') {
      throw new Error('Brak uprawnień administratora.');
    }

    const users = this.getUsers();
    const target = users.find(user => user.id === id);

    if (!target) {
      throw new Error('Nie znaleziono użytkownika.');
    }

    target.passwordHash = await this.hashPassword(newPassword);
    this.saveUsers(users);
  }

  deleteUser(id: string): void {
    if (this.currentUser()?.role !== 'admin') {
      throw new Error('Brak uprawnień administratora.');
    }

    if (this.currentUser()?.id === id) {
      throw new Error('Nie możesz usunąć własnego konta.');
    }

    this.saveUsers(this.getUsers().filter(user => user.id !== id));
  }
  constructor() {
  void this.ensureInitialAdmin();
}

private async ensureInitialAdmin(): Promise<void> {
  if (this.getUsers().length > 0) return;

  const admin: UserAccount = {
    id: crypto.randomUUID(),
    name: 'Administrator',
    email: 'admin@foodapp.local',
    passwordHash: await this.hashPassword('Admin123!'),
    role: 'admin'
  };

  this.saveUsers([admin]);
}
}