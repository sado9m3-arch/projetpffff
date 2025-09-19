import React from 'react';
import { LogOut, Shield, Truck, User } from 'lucide-react';
import type { User as AuthUser } from '../types/auth';
import ClientDashboard from './ClientDashboard';
import FournisseurDashboard from './FournisseurDashboard';
import AdminDashboard from './AdminDashboard';

interface DashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const roleConfig = {
    admin: {
      icon: Shield,
      title: 'Tableau de bord Administrateur',
      color: 'indigo',
      description: 'Gestion complète du système'
    },
    fournisseur: {
      icon: Truck,
      title: 'Tableau de bord Fournisseur',
      color: 'green',
      description: 'Gestion des commandes et livraisons'
    },
    client: {
      icon: User,
      title: 'Tableau de bord Client',
      color: 'blue',
      description: 'Vos commandes et réclamations'
    }
  };

  const config = roleConfig[user.role];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className={`bg-${config.color}-100 p-2 rounded-lg`}>
                <Icon className={`w-6 h-6 text-${config.color}-600`} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{config.title}</h1>
                <p className="text-sm text-gray-600">{config.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-600 capitalize">{user.role}</p>
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {user.role === 'client' && <ClientDashboard user={user} />}
          {user.role === 'fournisseur' && <FournisseurDashboard user={user} />}
          {user.role === 'admin' && <AdminDashboard user={user} />}
        </div>
      </main>
    </div>
  );
}