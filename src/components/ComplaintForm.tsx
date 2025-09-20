import React, { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { ComplaintFormData, Complaint } from '../types';

interface ComplaintFormProps {
  onClose: () => void;
  onComplaintCreated: (complaint: Complaint) => void;
}

const initialFormData: ComplaintFormData = {
  title: '',
  description: '',
  claimNumber: '',
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
  statementResponse: '',
  reportDeadline: '',
  replacement: false,
  creditNote: false,
  remarks: '',
  errorPictures: [],
};

export default function ComplaintForm({ onClose, onComplaintCreated }: ComplaintFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ComplaintFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const uploadFiles = async (files: File[]) => {
    if (!files.length) return [];
    // In a real app, upload to Supabase Storage
    return files.map((file) => URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const imageUrls = await uploadFiles(formData.errorPictures);

      const payload = {
        title: formData.title,
        description: formData.description,
        client_id: user?.id,
        claimnumber: formData.claimNumber,
        articlenumber: formData.articleNumber,
        articledescription: formData.articleDescription,
        deliverynotenumber: formData.deliveryNoteNumber,
        supplier: formData.supplier,
        totalquantity: formData.totalQuantity,
        defectivequantity: formData.defectiveQuantity,
        contactperson: formData.contactPerson,
        contactname: formData.contactName,
        contactemail: formData.contactEmail,
        contactphone: formData.contactPhone,
        errordescription: formData.errorDescription,
        statementresponse: formData.statementResponse,
        reportdeadline: formData.reportDeadline,
        replacement: formData.replacement,
        creditnote: formData.creditNote,
        remarks: formData.remarks,
        errorpictures: imageUrls,
        status: 'pending'
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
        onComplaintCreated(data.data);
      } else {
        setError(data.message || 'Erreur lors de la création de la réclamation');
      }
    } catch (error) {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900">Nouvelle Réclamation</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Informations de base</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="Titre de la réclamation"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  placeholder="Description détaillée de la réclamation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de réclamation</label>
                <input
                  type="text"
                  value={formData.claimNumber}
                  onChange={(e) => setFormData({ ...formData, claimNumber: e.target.value })}
                  className="input-field"
                  placeholder="CLM-2024-001"
                />
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-blue-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Informations produit</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro d'article</label>
                <input
                  type="text"
                  value={formData.articleNumber}
                  onChange={(e) => setFormData({ ...formData, articleNumber: e.target.value })}
                  className="input-field"
                  placeholder="ART-12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description de l'article</label>
                <input
                  type="text"
                  value={formData.articleDescription}
                  onChange={(e) => setFormData({ ...formData, articleDescription: e.target.value })}
                  className="input-field"
                  placeholder="Description du produit"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de bon de livraison</label>
                <input
                  type="text"
                  value={formData.deliveryNoteNumber}
                  onChange={(e) => setFormData({ ...formData, deliveryNoteNumber: e.target.value })}
                  className="input-field"
                  placeholder="BL-2024-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fournisseur</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="input-field"
                  placeholder="Nom du fournisseur"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantité totale</label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalQuantity}
                  onChange={(e) => setFormData({ ...formData, totalQuantity: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantité défectueuse</label>
                <input
                  type="number"
                  min="0"
                  value={formData.defectiveQuantity}
                  onChange={(e) => setFormData({ ...formData, defectiveQuantity: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-green-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Informations de contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Personne de contact</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="input-field"
                  placeholder="Nom de la personne"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="input-field"
                  placeholder="Nom complet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="input-field"
                  placeholder="contact@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="input-field"
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
            </div>
          </div>

          {/* Error Description */}
          <div className="bg-orange-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Description de l'erreur</h4>
            <textarea
              rows={4}
              value={formData.errorDescription}
              onChange={(e) => setFormData({ ...formData, errorDescription: e.target.value })}
              className="input-field"
              placeholder="Décrivez en détail le problème rencontré..."
            />
          </div>

          {/* Request Actions */}
          <div className="bg-purple-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Demandes</h4>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.statementResponse === 'yes'}
                  onChange={(e) =>
                    setFormData({ ...formData, statementResponse: e.target.checked ? 'yes' : '' })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Stellungnahme (Prise de position)</span>
              </label>

              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={!!formData.reportDeadline}
                    onChange={(e) =>
                      setFormData({ ...formData, reportDeadline: e.target.checked ? '3D' : '' })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">8D-Report</span>
                </label>

                {formData.reportDeadline && (
                  <div className="ml-7 space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="reportDeadline"
                        checked={formData.reportDeadline === '3D'}
                        onChange={() => setFormData({ ...formData, reportDeadline: '3D' })}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">3D en 24h</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="reportDeadline"
                        checked={formData.reportDeadline === '5D'}
                        onChange={() => setFormData({ ...formData, reportDeadline: '5D' })}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">5D en 7 jours</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="reportDeadline"
                        checked={formData.reportDeadline === '8D'}
                        onChange={() => setFormData({ ...formData, reportDeadline: '8D' })}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">8D en 4 semaines</span>
                    </label>
                  </div>
                )}
              </div>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.replacement}
                  onChange={(e) => setFormData({ ...formData, replacement: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Ersatz (Remplacement)</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.creditNote}
                  onChange={(e) => setFormData({ ...formData, creditNote: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Gutschrift (Note de crédit)</span>
              </label>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Informations supplémentaires</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarques</label>
                <textarea
                  rows={3}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="input-field"
                  placeholder="Remarques ou informations supplémentaires..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photos d'erreur</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      setFormData({ ...formData, errorPictures: Array.from(e.target.files || []) })
                    }
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-sm text-gray-600">
                      Cliquez pour télécharger des images ou glissez-déposez
                    </span>
                  </label>
                  {formData.errorPictures.length > 0 && (
                    <p className="text-sm text-green-600 mt-2">
                      {formData.errorPictures.length} fichier(s) sélectionné(s)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Envoi...
                </div>
              ) : (
                'Soumettre la réclamation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}