export interface User {
  id: string;
  email: string;
  role: 'admin' | 'fournisseur' | 'client';
  first_login: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  requirePasswordChange?: boolean;
}

export interface PasswordChangeRequest {
  email: string;
  currentPassword: string;
  newPassword: string;
  role: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  client_id: string;
  fournisseur_id?: string;
  status: 'pending' | 'assigned' | 'resolved';
  created_at: string;
  updated_at: string;
  client?: {
    email: string;
  };
  fournisseur?: {
    email: string;
  };
}

export interface CreateComplaintRequest {
  title: string;
  description: string;
  client_id: string;
}

export interface UpdateComplaintRequest {
  id: string;
  status?: string;
  fournisseur_id?: string;
}

export interface UserManagement {
  id: string;
  email: string;
  role: 'client' | 'fournisseur';
  created_at: string;
}