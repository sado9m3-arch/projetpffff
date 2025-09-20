import React from 'react';
import { LogOut, Shield, Truck, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ClientDashboard from './ClientDashboard';
import FournisseurDashboard from './FournisseurDashboard';
import AdminDashboard from './AdminDashboard';

export default function Dashboard() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const roleConfig = {
    admin: {
      icon: Shield,
      title: 'Administration',
      color: 'indigo',
      description: 'Gestion complète du système'
    },
    fournisseur: {
      icon: Truck,
      title: 'Fournisseur',
      color: 'green',
      description: 'Gestion des réclamations assignées'
    },
    client: {
      icon: User,
      title: 'Client',
      color: 'blue',
      description: 'Vos réclamations et demandes'
    }
  };

  const config = roleConfig[user.role];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className={`bg-${config.color}-100 p-3 rounded-xl shadow-sm`}>
                <Icon className={`w-6 h-6 text-${config.color}-600`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
                <p className="text-sm text-gray-600">{config.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-600 capitalize bg-gray-100 px-2 py-1 rounded-full">
                  {user.role}
                </p>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {user.role === 'client' && <ClientDashboard />}
        {user.role === 'fournisseur' && <FournisseurDashboard />}
        {user.role === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
}