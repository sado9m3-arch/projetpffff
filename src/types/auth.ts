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
  client_id: string;
  fournisseur_id?: string;

  // Nouveaux champs formulaire
  claimNumber: string;
  creationDate: string;
  articleNumber: string;
  articleDescription: string;
  deliveryNoteNumber: string;
  supplier: string;
  totalQuantity: number;
  defectiveQuantity: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  errorDescription: string;
  remarks: string;

  // Cases à cocher
  replacement: boolean;
  creditNote: boolean;
  repair: boolean;
  resend: boolean;

  // Images (peuvent être des URL ou des fichiers base64 côté API)
  errorPictures?: string[];

  // Statut et métadonnées
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
  client_id: string;

  // Champs obligatoires
  claimNumber: string;
  articleNumber: string;
  articleDescription: string;
  deliveryNoteNumber: string;
  supplier: string;
  totalQuantity: number;
  defectiveQuantity: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  errorDescription: string;

  // Champs optionnels
  remarks?: string;
  replacement?: boolean;
  creditNote?: boolean;
  repair?: boolean;
  resend?: boolean;
  errorPictures?: string[];
}

export interface UpdateComplaintRequest {
  id: string;
  status?: string;
  fournisseur_id?: string;
  remarks?: string;
  replacement?: boolean;
  creditNote?: boolean;
  repair?: boolean;
  resend?: boolean;
}

export interface UserManagement {
  id: string;
  email: string;
  role: 'client' | 'fournisseur';
  created_at: string;
}
