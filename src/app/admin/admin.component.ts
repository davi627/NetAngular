import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

currentPage: number = 1;
itemsPerPage: number = 5;
searchTerm: string = '';


  userForm = {
    username: '',
    email: '',
    passwordHash: '',
    role: 'User'
  };

  users: User[] = [];
  editingUser: User | null = null;
  selectedSection: string = 'manageUsers';

  constructor(private authService: AuthService) {}


  get filteredUsers(): User[] {
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(user =>
      user.username.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  }

  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsers.slice(start, end);
  }
  
  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }
  ngOnInit(): void {
    console.log('AdminComponent initialized');
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.authService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.users = users;
        console.log('Users loaded:', users);
      },
      error: (err) => {
        console.error('Failed to fetch users:', err);
      }
    });
  }

  saveUser(): void {
    if (this.editingUser) {
      this.authService.updateUser(this.editingUser.id, this.userForm).subscribe({
        next: () => {
          this.fetchUsers();
          this.resetForm();
          alert('User updated successfully!');
        },
        error: (err) => console.error('Update error', err)
      });
    } else {
      this.authService.register(this.userForm).subscribe({
        next: () => {
          this.fetchUsers();
          this.resetForm();
          alert('User created successfully!');
        },
        error: (err) => console.error('Create error', err)
      });
    }
  }

  editUser(user: User): void {
    this.editingUser = { ...user };
    this.userForm = {
      username: user.username,
      email: user.email,
      passwordHash: '', // don't fill password for editing
      role: user.role
    };
    this.selectedSection = 'editUser';
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.authService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== userId);
          alert('User deleted successfully.');
        },
        error: (err) => console.error('Delete failed', err)
      });
    }
  }

  resetForm(): void {
    this.userForm = {
      username: '',
      email: '',
      passwordHash: '',
      role: 'User'
    };
    this.editingUser = null;
    this.selectedSection = 'manageUsers';
  }

  cancelEdit(): void {
    this.resetForm();
  }

  selectSection(section: string): void {
    this.selectedSection = section;
  }

  logout(): void {
    this.authService.logout();
  }
}