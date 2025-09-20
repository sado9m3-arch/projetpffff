import React, { useState, useEffect } from 'react';
import { Users, FileText, Plus, Trash2, Calendar, UserPlus, Settings, Clock, CheckCircle, AlertCircle, Upload, Download, Edit3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ComplaintForm from './ComplaintForm';
import type { Complaint, UserManagement } from '../types';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'complaints' | 'users' | 'reports'>('complaints');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [fournisseurs, setFournisseurs] = useState<{ id: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userFormData, setUserFormData] = useState({
    email: '',
    role: 'client' as 'client' | 'fournisseur'
  });
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [statusInput, setStatusInput] = useState('');
  const [uploadingReport, setUploadingReport] = useState<string | null>(null);

  useEffect(() => {
    fetchComplaints();
    fetchUsers();
    fetchFournisseurs();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complaints?role=admin&userId=${user?.id}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setComplaints(data.data);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/users`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFournisseurs = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fournisseurs`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setFournisseurs(data.data);
      }
    } catch (error) {
      console.error('Error fetching fournisseurs:', error);
    }
  };

  const assignComplaint = async (complaintId: string, fournisseurId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complaints`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            id: complaintId,
            fournisseur_id: fournisseurId,
            status: 'assigned'
          })
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchComplaints();
      }
    } catch (error) {
      console.error('Error assigning complaint:', error);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(userFormData)
        }
      );

      const data = await response.json();
      if (data.success) {
        setUsers([...users, data.data]);
        setUserFormData({ email: '', role: 'client' });
        setShowUserForm(false);
        if (userFormData.role === 'fournisseur') {
          fetchFournisseurs();
        }
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const deleteUser = async (userId: string, role: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/users/${userId}/${role}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setUsers(users.filter(u => u.id !== userId));
        if (role === 'fournisseur') {
          fetchFournisseurs();
        }
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleComplaintCreated = (newComplaint: Complaint) => {
    setComplaints([newComplaint, ...complaints]);
    setShowComplaintForm(false);
  };

  const updateComplaintStatus = async (complaintId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complaints`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            id: complaintId,
            status: newStatus
          })
        }
      );

      const data = await response.json();
      if (data.success) {
        setComplaints(complaints.map(c => 
          c.id === complaintId ? { ...c, status: newStatus as any } : c
        ));
        setEditingStatus(null);
        setStatusInput('');
      }
    } catch (error) {
      console.error('Error updating complaint status:', error);
    }
  };

  const upload8DReport = async (complaintId: string, file: File) => {
    setUploadingReport(complaintId);
    try {
      // In a real implementation, upload to Supabase Storage
      const formData = new FormData();
      formData.append('file', file);
      formData.append('complaint_id', complaintId);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-8d-report`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: formData
        }
      );

      const data = await response.json();
      if (data.success) {
        // Refresh complaints to show the uploaded report
        fetchComplaints();
      }
    } catch (error) {
      console.error('Error uploading 8D report:', error);
    } finally {
      setUploadingReport(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'assigned': return 'Assignée';
      case 'resolved': return 'Résolue';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Administration</h2>
        <p className="text-gray-600 mt-1">Gestion des réclamations et des utilisateurs</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('complaints')}
            className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
              activeTab === 'complaints'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-5 h-5 inline mr-2" />
            Réclamations ({complaints.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
              activeTab === 'reports'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-5 h-5 inline mr-2" />
            Rapports 8D
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Utilisateurs ({users.length})
          </button>
        </nav>
      </div>

      {activeTab === 'complaints' && (
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900">Gestion des Réclamations</h3>
            <button
              onClick={() => setShowComplaintForm(true)}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle Réclamation
            </button>
          </div>

          {/* Complaint Form Modal */}
          {showComplaintForm && (
            <ComplaintForm
              onClose={() => setShowComplaintForm(false)}
              onComplaintCreated={handleComplaintCreated}
              isAdmin={true}
            />
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-yellow-700">
                    {complaints.filter(c => c.status === 'pending').length}
                  </p>
                  <p className="text-sm text-yellow-600">En attente</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-blue-700">
                    {complaints.filter(c => c.status === 'assigned').length}
                  </p>
                  <p className="text-sm text-blue-600">Assignées</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-green-700">
                    {complaints.filter(c => c.status === 'resolved').length}
                  </p>
                  <p className="text-sm text-green-600">Résolues</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
              <div className="flex items-center">
                <AlertCircle className="w-8 h-8 text-gray-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-700">{complaints.length}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Complaints List */}
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="card hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedComplaint(complaint)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{complaint.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(complaint.status)}`}>
                        {getStatusText(complaint.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{complaint.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(complaint.created_at).toLocaleDateString('fr-FR')}
                      </div>
                      {complaint.client && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Client: {complaint.client.email}
                        </span>
                      )}
                    </div>
                  </div>
                  {complaint.status === 'pending' && (
                    <div className="ml-4 space-y-2">
                      <select
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => assignComplaint(complaint.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        defaultValue=""
                      >
                        <option value="" disabled>Assigner à...</option>
                        {fournisseurs.map((f) => (
                          <option key={f.id} value={f.id}>{f.email}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="ml-4 space-y-2">
                    {editingStatus === complaint.id ? (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={statusInput}
                          onChange={(e) => setStatusInput(e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          placeholder="Nouveau statut..."
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateComplaintStatus(complaint.id, statusInput);
                          }}
                          className="text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                        >
                          ✓
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingStatus(null);
                            setStatusInput('');
                          }}
                          className="text-sm bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingStatus(complaint.id);
                          setStatusInput(complaint.status);
                        }}
                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 inline-flex items-center"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Modifier statut
                      </button>
                    )}
                    
                    {complaint.status === 'resolved' && (
                      <div>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) upload8DReport(complaint.id, file);
                          }}
                          className="hidden"
                          id={`upload-${complaint.id}`}
                        />
                        <label
                          htmlFor={`upload-${complaint.id}`}
                          className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 cursor-pointer inline-flex items-center"
                        >
                          {uploadingReport === complaint.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Upload...
                            </>
                          ) : (
                            <>
                              <Upload className="w-3 h-3 mr-1" />
                              Rapport 8D
                            </>
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">Rapports 8D</h3>
          
          <div className="space-y-4">
            {complaints.filter(c => c.status === 'resolved').map((complaint) => (
              <div key={complaint.id} className="card">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{complaint.title}</h4>
                    <p className="text-sm text-gray-600">Client: {complaint.client?.email}</p>
                    <p className="text-sm text-gray-500">
                      Résolu le {new Date(complaint.updated_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) upload8DReport(complaint.id, file);
                      }}
                      className="hidden"
                      id={`report-upload-${complaint.id}`}
                    />
                    <label
                      htmlFor={`report-upload-${complaint.id}`}
                      className="btn-primary cursor-pointer inline-flex items-center"
                    >
                      {uploadingReport === complaint.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Upload...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Télécharger Rapport 8D
                        </>
                      )}
                    </label>
                    <button className="btn-secondary inline-flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      Voir Rapport
                    </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedComplaint.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedComplaint.status)}`}>
                    {getStatusText(selectedComplaint.status)}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{selectedComplaint.description}</p>
              </div>
              {selectedComplaint.claimnumber && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Numéro de réclamation</h4>
                  <p className="text-gray-700">{selectedComplaint.claimnumber}</p>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(selectedComplaint.created_at).toLocaleDateString('fr-FR')}
              </div>
              {selectedComplaint.client && (
                <p className="text-sm text-gray-500">Client: {selectedComplaint.client.email}</p>
              )}
              {selectedComplaint.fournisseur && (
                <p className="text-sm text-gray-500">Fournisseur: {selectedComplaint.fournisseur.email}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h3>
            <button
              onClick={() => setShowUserForm(true)}
              className="btn-primary inline-flex items-center"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Nouvel Utilisateur
            </button>
          </div>

          {showUserForm && (
            <div className="card">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Créer un Utilisateur</h4>
              <form onSubmit={createUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="input-field"
                    placeholder="utilisateur@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="client">Client</option>
                    <option value="fournisseur">Fournisseur</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="btn-primary">
                    Créer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUserForm(false)}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="card overflow-hidden p-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de création
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        user.role === 'client' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'client' ? 'Client' : 'Fournisseur'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deleteUser(user.id, user.role)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}