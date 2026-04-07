import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  AlertCircle 
} from 'lucide-react';

const GestionPermisConfig = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  const token = localStorage.getItem('token');
  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/refs/categories', { headers: authHeader });
      if (res.data.status === 'success') {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      showMessage('error', 'Le code et le nom sont requis.');
      return;
    }

    try {
      if (isEditing) {
        await axios.put(`/api/admin/categories/${currentId}`, formData, { headers: authHeader });
        showMessage('success', 'Catégorie mise à jour avec succès');
      } else {
        await axios.post('/api/admin/categories', formData, { headers: authHeader });
        showMessage('success', 'Catégorie ajoutée avec succès');
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      showMessage('error', err.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (category) => {
    setIsEditing(true);
    setCurrentId(category.id);
    setFormData({
      code: category.code,
      name: category.name,
      description: category.description || ''
    });
    // Scroll to form or message logic if needed
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;
    
    try {
      await axios.delete(`/api/admin/categories/${id}`, { headers: authHeader });
      showMessage('success', 'Catégorie supprimée avec succès');
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      showMessage('error', 'Impossible de supprimer cette catégorie car elle est probablement utilisée.');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ code: '', name: '', description: '' });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>Gestion des Catégories de Permis</h2>
        <p style={{ color: '#64748b' }}>Super Administrateur • Configuration globale des types de permis</p>
      </div>

      {message.text && (
        <div style={{ 
          padding: '12px 20px', 
          marginBottom: '20px', 
          borderRadius: '8px', 
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: message.type === 'error' ? '#ef4444' : '#16a34a',
          border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`
        }}>
          {message.type === 'error' ? <AlertCircle size={20} /> : <Save size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Formulaire */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing ? <Edit size={20} color="#3b82f6" /> : <Plus size={20} color="#3b82f6" />}
          {isEditing ? 'Modifier la catégorie' : 'Ajouter une nouvelle catégorie'}
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
            <div className="pro-field-group">
              <label>Code (ex: A, B1, C) <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text" 
                name="code" 
                value={formData.code} 
                onChange={handleInputChange} 
                className="pro-input" 
                placeholder="Code"
                required
              />
            </div>
            <div className="pro-field-group">
              <label>Titre (ex: Catégorie A : Motocyclette) <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                className="pro-input" 
                placeholder="Nom complet"
                required
              />
            </div>
          </div>
          <div className="pro-field-group">
            <label>Description (types de véhicules autorisés)</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange} 
              className="pro-input" 
              rows="3"
              placeholder="Description détaillée de la catégorie..."
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" style={{
              display: 'flex', alignItems: 'center', gap: '8px', 
              padding: '10px 20px', background: '#3b82f6', color: 'white', 
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
            }}>
              <Save size={18} />
              {isEditing ? 'Mettre à jour' : 'Enregistrer'}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} style={{
                display: 'flex', alignItems: 'center', gap: '8px', 
                padding: '10px 20px', background: '#f1f5f9', color: '#64748b', 
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
              }}>
                <X size={18} />
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Liste des catégories */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '15px 20px', color: '#475569', fontWeight: '600' }}>Code</th>
              <th style={{ padding: '15px 20px', color: '#475569', fontWeight: '600' }}>Type de Permis</th>
              <th style={{ padding: '15px 20px', color: '#475569', fontWeight: '600' }}>Description</th>
              <th style={{ padding: '15px 20px', color: '#475569', fontWeight: '600', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Chargement des catégories...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontStyle: 'italic' }}>Aucune catégorie trouvée</td></tr>
            ) : (
              categories.map(cat => (
                <tr key={cat.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>{cat.code}</td>
                  <td style={{ padding: '15px 20px', fontWeight: '500' }}>{cat.name}</td>
                  <td style={{ padding: '15px 20px', color: '#64748b', fontSize: '14px' }}>{cat.description || '-'}</td>
                  <td style={{ padding: '15px 20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button 
                      onClick={() => handleEdit(cat)}
                      title="Modifier"
                      style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      title="Supprimer"
                      style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionPermisConfig;
