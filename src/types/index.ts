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

export interface Complaint {
  id: string;
  title: string;
  description: string;
  client_id: string;
  fournisseur_id?: string;
  status: 'pending' | 'assigned' | 'resolved';
  
  // Form fields
  claimnumber?: string;
  articlenumber?: string;
  articledescription?: string;
  deliverynotenumber?: string;
  supplier?: string;
  totalquantity?: number;
  defectivequantity?: number;
  contactperson?: string;
  contactname?: string;
  contactemail?: string;
  contactphone?: string;
  errordescription?: string;
  statementresponse?: string;
  reportdeadline?: string;
  replacement?: boolean;
  creditnote?: boolean;
  remarks?: string;
  errorpictures?: string[];
  
  created_at: string;
  updated_at: string;
  
  client?: { email: string };
  fournisseur?: { email: string };
}

export interface ComplaintFormData {
  title: string;
  description: string;
  claimNumber: string;
  articleNumber: string;
  articleDescription: string;
  deliveryNoteNumber: string;
  supplier: string;
  totalQuantity: number;
  defectiveQuantity: number;
  contactPerson: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  errorDescription: string;
  statementResponse: string;
  reportDeadline: string;
  replacement: boolean;
  creditNote: boolean;
  remarks: string;
  errorPictures: File[];
}

export interface UserManagement {
  id: string;
  email: string;
  role: 'client' | 'fournisseur';
  created_at: string;
}