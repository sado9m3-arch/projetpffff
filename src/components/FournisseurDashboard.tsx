import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle, FileText, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { Complaint } from '../types';

export default function FournisseurDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complaints?role=fournisseur&userId=${user?.id}`,
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
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId: string, status: string) => {
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
            status: status
          })
        }
      );

      const data = await response.json();
      if (data.success) {
        setComplaints(complaints.map(c => 
          c.id === complaintId ? { ...c, status: status as any } : c
        ));
      }
    } catch (error) {
      console.error('Error updating complaint status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'assigned': return 'En cours';
      case 'resolved': return 'Résolue';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Réclamations Assignées</h2>
        <p className="text-gray-600 mt-1">Gérez les réclamations qui vous ont été assignées</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-blue-700">
                {complaints.filter(c => c.status === 'assigned').length}
              </p>
              <p className="text-sm text-blue-600">En cours</p>
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
              {selectedComplaint.errordescription && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description de l'erreur</h4>
                  <p className="text-gray-700">{selectedComplaint.errordescription}</p>
                </div>
              )}
              {selectedComplaint.client && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Client</h4>
                  <p className="text-gray-700">{selectedComplaint.client.email}</p>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                Reçue le {new Date(selectedComplaint.created_at).toLocaleDateString('fr-FR', {
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune réclamation assignée</h3>
            <p className="text-gray-600">Aucune réclamation ne vous a été assignée pour le moment.</p>
          </div>
        ) : (
          complaints.map((complaint) => (
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      Reçue le {new Date(complaint.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    {complaint.client && (
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="w-4 h-4 mr-1" />
                        {complaint.client.email}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  {complaint.status === 'assigned' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateComplaintStatus(complaint.id, 'resolved');
                      }}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Marquer comme résolue
                    </button>
                  )}
                  {complaint.status === 'resolved' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateComplaintStatus(complaint.id, 'assigned');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Rouvrir
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}