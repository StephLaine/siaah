import React, { useState } from 'react';
import { 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  UserPlus,
  Filter,
  MoreVertical
} from 'lucide-react';

const UserList = ({ users, onShowProfile, onEdit, onDelete, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => 
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.nif?.includes(searchTerm)
  );

  return (
    <div className="user-list-module">
      <div className="flex-header mb-6">
        <h2 className="title-section">Liste des Usagers</h2>
        <div className="flex gap-4">
          <div className="search-filter no-margin">
            <input 
              type="text" 
              placeholder="Rechercher par nom, email, NIF..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon"><Search size={18} /></span>
          </div>
        </div>
      </div>

      <div className="table-container shadow-sm bg-white rounded-xl overflow-hidden border border-slate-200">
        <table className="data-table">
          <thead>
            <tr>
              <th>Usager</th>
              <th>Contact / ID</th>
              <th>Profession</th>
              <th>Localisation</th>
              <th>Inscrit le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400">Chargement des usagers...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400 italic">Aucun usager trouvé</td></tr>
            ) : filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div 
                      className="avatar-small"
                      style={{ background: 'linear-gradient(135deg, #1a367c, #3b82f6)', color: 'white' }}
                    >
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{user.first_name} {user.last_name}</div>
                      <div className="text-xs text-slate-500">ID: #{user.id}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="text-sm font-medium">{user.email}</div>
                  <div className="text-xs text-slate-400">NIF: {user.nif || '-'}</div>
                </td>
                <td>
                  <span className="text-sm text-slate-600">{user.job_title || 'Non spécifié'}</span>
                </td>
                <td>
                  <span className="text-sm text-slate-600">{user.location || user.address || '-'}</span>
                </td>
                <td>
                   <div className="text-sm text-slate-600">{new Date(user.created_at).toLocaleDateString()}</div>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button 
                      className="emp-action-icon view" 
                      onClick={() => onShowProfile(user.id)}
                      title="Voir Profil"
                      style={{ background: '#f1f5f9', color: '#1e293b' }}
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="emp-action-icon edit" 
                      onClick={() => onEdit(user)}
                      title="Modifier"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="emp-action-icon delete" 
                      onClick={() => onDelete(user.id)}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
