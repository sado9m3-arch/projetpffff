import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, AlertCircle, FileText, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ComplaintForm from './ComplaintForm';
import type { Complaint } from '../types';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.error('Missing Supabase environment variables');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complaints?role=client&userId=${user?.id}`,
        { 
          headers: { 
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` 
          } 
        }
      );
      
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON');
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setComplaints(data.data);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplaintCreated = (newComplaint: Complaint) => {
    setComplaints([newComplaint, ...complaints]);
    setShowForm(false);
  };

  const handleDelete = async (complaintId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réclamation ?')) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complaints/${complaintId}`,
        { 
          method: 'DELETE', 
          headers: { 
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` 
          } 
        }
      );
      
      const data = await response.json();
      if (data.success) {
        setComplaints(complaints.filter((c) => c.id !== complaintId));
      }
    } catch (error) {
      console.error('Error deleting complaint:', error);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'assigned': return FileText;
      case 'resolved': return CheckCircle;
      default: return AlertCircle;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Mes Réclamations</h2>
          <p className="text-gray-600 mt-1">Gérez vos réclamations et suivez leur progression</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary inline-flex items-center shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle Réclamation
        </button>
      </div>

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
              <p className="text-sm text-blue-600">En traitement</p>
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

      {/* Form Modal */}
      {showForm && (
        <ComplaintForm
          onClose={() => setShowForm(false)}
          onComplaintCreated={handleComplaintCreated}
        />
      )}

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedComplaint.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedComplaint.status)}`}>
                      {getStatusText(selectedComplaint.status)}
                    </span>
                  </div>
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
              {selectedComplaint.articlenumber && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Article</h4>
                  <p className="text-gray-700">{selectedComplaint.articlenumber} - {selectedComplaint.articledescription}</p>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                Créée le {new Date(selectedComplaint.created_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complaint List */}
      <div className="space-y-4">
        {complaints.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune réclamation</h3>
            <p className="text-gray-600 mb-6">Vous n'avez pas encore soumis de réclamation.</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer ma première réclamation
            </button>
          </div>
        ) : (
          complaints.map((complaint) => {
            const StatusIcon = getStatusIcon(complaint.status);
            return (
              <div 
                key={complaint.id} 
                className="card hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedComplaint(complaint)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{complaint.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border inline-flex items-center ${getStatusColor(complaint.status)}`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {getStatusText(complaint.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{complaint.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(complaint.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      {complaint.claimnumber && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          #{complaint.claimnumber}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(complaint.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-4"
                    title="Supprimer la réclamation"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}