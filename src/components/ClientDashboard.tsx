import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import type { Complaint, AuthUser } from '../types/auth';

interface ClientDashboardProps {
  user: AuthUser;
}

const initialFormData = {
  title: '',
  description: '',
  claimNumber: '',
  creationDate: new Date().toISOString(), // auto-set
  articleNumber: '',
  articleDescription: '',
  deliveryNoteNumber: '',
  supplier: '',
  totalQuantity: 0,
  defectiveQuantity: 0,
  contactPerson: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  errorDescription: '',
  statementResponse: '', // checkbox
  reportDeadline: '', // 3D, 5D, 8D
  replacement: false,
  creditNote: false,
  remarks: '',
  errorPictures: [] as File[],
};

export default function ClientDashboard({ user }: ClientDashboardProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complaints?role=client&userId=${user.id}`,
        { headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` } }
      );
      const data = await response.json();
      if (data.success) setComplaints(data.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  // TODO: Replace with Supabase Storage upload
  const uploadFiles = async (files: File[]) => {
    if (!files.length) return [];
    return files.map((file) => URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const imageUrls = await uploadFiles(formData.errorPictures);

      const payload = {
        ...formData,
        client_id: user.id,
        creationDate: new Date().toISOString(), // overwrite each submit
        errorPictures: imageUrls,
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complaints`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (data.success) {
        setComplaints([data.data, ...complaints]);
        setFormData(initialFormData);
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating complaint:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (complaintId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réclamation ?')) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complaints/${complaintId}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` } }
      );
      const data = await response.json();
      if (data.success) setComplaints(complaints.filter((c) => c.id !== complaintId));
    } catch (error) {
      console.error('Error deleting complaint:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'assigned':
        return 'Assignée';
      case 'resolved':
        return 'Résolue';
      default:
        return status;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mes Réclamations</h2>
          <p className="text-gray-600">Gérez vos réclamations et suivez leur statut</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Réclamation
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouvelle Réclamation</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Base fields */}
            <div>
              <label>Titre</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label>Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label>Claim Number</label>
              <input
                type="text"
                value={formData.claimNumber}
                onChange={(e) => setFormData({ ...formData, claimNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label>Article Number</label>
              <input
                type="text"
                value={formData.articleNumber}
                onChange={(e) => setFormData({ ...formData, articleNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label>Article Description</label>
              <input
                type="text"
                value={formData.articleDescription}
                onChange={(e) => setFormData({ ...formData, articleDescription: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label>Delivery Note Number</label>
              <input
                type="text"
                value={formData.deliveryNoteNumber}
                onChange={(e) => setFormData({ ...formData, deliveryNoteNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label>Supplier</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex space-x-2">
              <div className="flex-1">
                <label>Total Quantity</label>
                <input
                  type="number"
                  value={formData.totalQuantity}
                  onChange={(e) => setFormData({ ...formData, totalQuantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex-1">
                <label>Defective Quantity</label>
                <input
                  type="number"
                  value={formData.defectiveQuantity}
                  onChange={(e) => setFormData({ ...formData, defectiveQuantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Contact */}
            <div>
              <label>Contact Person</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label>Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label>Phone</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Error Description */}
            <div>
              <label>Error Description</label>
              <textarea
                value={formData.errorDescription}
                onChange={(e) => setFormData({ ...formData, errorDescription: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Four checkboxes section */}
            <div>
              <h3 className="font-semibold mb-2">Wir bitten um:</h3>
              <div className="space-y-2">
                {/* Stellungnahme */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.statementResponse === 'yes'}
                    onChange={(e) =>
                      setFormData({ ...formData, statementResponse: e.target.checked ? 'yes' : '' })
                    }
                  />
                  <span>Stellungnahme</span>
                </label>

                {/* 8D Report */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!!formData.reportDeadline}
                    onChange={(e) =>
                      setFormData({ ...formData, reportDeadline: e.target.checked ? '3D' : '' })
                    }
                  />
                  <span>8D-Report</span>
                </label>

                {formData.reportDeadline && (
                  <div className="ml-6 space-x-4">
                    <label>
                      <input
                        type="radio"
                        checked={formData.reportDeadline === '3D'}
                        onChange={() => setFormData({ ...formData, reportDeadline: '3D' })}
                      />{' '}
                      3D in 24h
                    </label>
                    <label>
                      <input
                        type="radio"
                        checked={formData.reportDeadline === '5D'}
                        onChange={() => setFormData({ ...formData, reportDeadline: '5D' })}
                      />{' '}
                      5D in 7 days
                    </label>
                    <label>
                      <input
                        type="radio"
                        checked={formData.reportDeadline === '8D'}
                        onChange={() => setFormData({ ...formData, reportDeadline: '8D' })}
                      />{' '}
                      8D in 4 weeks
                    </label>
                  </div>
                )}

                {/* Ersatz */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.replacement}
                    onChange={(e) => setFormData({ ...formData, replacement: e.target.checked })}
                  />
                  <span>Ersatz (Remplacement)</span>
                </label>

                {/* Gutschrift */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.creditNote}
                    onChange={(e) => setFormData({ ...formData, creditNote: e.target.checked })}
                  />
                  <span>Gutschrift (Credit Note)</span>
                </label>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label>Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Error pictures */}
            <div>
              <label>Error Picture(s)</label>
              <input
                type="file"
                multiple
                onChange={(e) =>
                  setFormData({ ...formData, errorPictures: Array.from(e.target.files || []) })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Submit / Cancel */}
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Envoi...' : 'Soumettre'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Complaint List */}
      <div className="space-y-4">
        {complaints.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réclamation</h3>
            <p className="text-gray-600">Vous n'avez pas encore soumis de réclamation.</p>
          </div>
        ) : (
          complaints.map((complaint) => (
            <div key={complaint.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        complaint.status
                      )}`}
                    >
                      {getStatusText(complaint.status)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{complaint.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(complaint.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(complaint.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer la réclamation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
