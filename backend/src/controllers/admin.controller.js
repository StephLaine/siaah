const { pool } = require('../config/db');
const requestCtrl = require('./request.controller');

// ─── Dashboard Statistics ────────────────────────────────────────────────────────
// Returns complete, real metrics and chart statistics for the Super Admin dashboard.
const getStats = async (req, res) => {
  const period = req.query.period || 'month';
  try {
    // 1. Basic Counts
    const countsRes = await pool.query(`
      SELECT 
        (SELECT COUNT(*)::int FROM entities) AS total_entities,
        (SELECT COUNT(*)::int FROM users) AS total_users,
        (SELECT COUNT(*)::int FROM users WHERE role_id IN (2, 3, 4, 5, 6, 7)) AS total_employees,
        (SELECT COUNT(*)::int FROM offices) AS total_offices
    `);
    const counts = countsRes.rows[0];

    // 2. Offices by Department (Bureaux par Département)
    const officePieRes = await pool.query(`
      SELECT COALESCE(departement, 'Non défini') as name, COUNT(*)::int as value 
      FROM offices 
      GROUP BY departement
      ORDER BY value DESC
    `);

    // 3. Users by Department (Utilisateurs par Dép.)
    const usersByDeptRes = await pool.query(`
      SELECT COALESCE(department, 'Non défini') as name, COUNT(*)::int as value 
      FROM users 
      WHERE role_id = 8 
      GROUP BY department
      ORDER BY value DESC
    `);

    // 4. Evolution of Users (Inscriptions)
    let evolutionQuery = '';
    if (period === 'day') {
      evolutionQuery = `
        SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as label, COUNT(*)::int as users 
        FROM users 
        GROUP BY label 
        ORDER BY label ASC LIMIT 30
      `;
    } else if (period === 'year') {
      evolutionQuery = `
        SELECT TO_CHAR(created_at, 'YYYY') as label, COUNT(*)::int as users 
        FROM users 
        GROUP BY label 
        ORDER BY label ASC
      `;
    } else { // default: month
      evolutionQuery = `
        SELECT TO_CHAR(created_at, 'YYYY-MM') as label, COUNT(*)::int as users 
        FROM users 
        GROUP BY label 
        ORDER BY label ASC
      `;
    }
    const evolutionRes = await pool.query(evolutionQuery);

    res.json({
      status: 'success',
      data: {
        totalEntities: counts.total_entities,
        totalUsers: counts.total_users,
        totalEmployees: counts.total_employees,
        totalOffices: counts.total_offices,
        officePieData: officePieRes.rows,
        usersByDept: usersByDeptRes.rows,
        evolutionData: evolutionRes.rows,
        deptData: [] // placeholder to support component defaults
      }
    });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Entities Fetching ────────────────────────────────────────────────────────────
const getEntities = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM entities ORDER BY name ASC');
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error('getEntities error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Services CRUD & Relations ───────────────────────────────────────────────────
const getServices = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*,
             COALESCE(
               (SELECT json_agg(json_build_object('id', op.id, 'name', op.name, 'description', op.description, 'required_documents', op.required_documents, 'price', op.price, 'actif', op.actif))
                FROM service_operations op WHERE op.service_id = s.id), '[]'::json
             ) as operations,
             COALESCE(
               (SELECT json_agg(json_build_object('id', ent.id, 'name', ent.name, 'sigle', ent.sigle))
                FROM entity_services es
                JOIN entities ent ON es.entity_id = ent.id
                WHERE es.service_id = s.id), '[]'::json
             ) as entities
      FROM services s
      ORDER BY s.name ASC
    `);
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error('getServices error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const createService = async (req, res) => {
  const { name, description, categorie, actif, is_public, entity_ids = [], required_documents = [], operations = [] } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Insert service
    const serviceRes = await client.query(`
      INSERT INTO services (name, description, categorie, actif, is_public, required_documents)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb)
      RETURNING id
    `, [name, description, categorie, actif, is_public, JSON.stringify(required_documents)]);
    
    const serviceId = serviceRes.rows[0].id;
    
    // 2. Link entities
    if (entity_ids.length > 0) {
      for (const entId of entity_ids) {
        await client.query(`
          INSERT INTO entity_services (entity_id, service_id)
          VALUES ($1, $2)
        `, [entId, serviceId]);
      }
    }
    
    // 3. Insert operations
    if (operations.length > 0) {
      for (const op of operations) {
        await client.query(`
          INSERT INTO service_operations (service_id, name, description, required_documents, price, price_htg, detailed_description, actif)
          VALUES ($1, $2, $3, $4::jsonb, $5, $5, $6, $7)
        `, [
          serviceId,
          op.name,
          op.description || '',
          JSON.stringify(op.required_documents || []),
          op.price || 0,
          op.detailed_description || '',
          op.actif !== false
        ]);
      }
    }
    
    await client.query('COMMIT');
    res.status(201).json({ status: 'success', data: { id: serviceId } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('createService error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  } finally {
    client.release();
  }
};

const updateService = async (req, res) => {
  const { id } = req.params;
  const { name, description, categorie, actif, is_public, entity_ids = [], required_documents = [], operations = [] } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Update service details
    await client.query(`
      UPDATE services
      SET name = $1, description = $2, categorie = $3, actif = $4, is_public = $5, required_documents = $6::jsonb, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `, [name, description, categorie, actif, is_public, JSON.stringify(required_documents), id]);
    
    // 2. Sync entities: delete old and insert new
    await client.query('DELETE FROM entity_services WHERE service_id = $1', [id]);
    if (entity_ids.length > 0) {
      for (const entId of entity_ids) {
        await client.query(`
          INSERT INTO entity_services (entity_id, service_id)
          VALUES ($1, $2)
        `, [entId, id]);
      }
    }
    
    // 3. Sync operations
    const incomingOpNames = operations.map(o => o.name);
    if (incomingOpNames.length > 0) {
      await client.query(`
        DELETE FROM service_operations 
        WHERE service_id = $1 AND name NOT IN (${incomingOpNames.map((_, idx) => `$${idx + 2}`).join(',')})
      `, [id, ...incomingOpNames]);
    } else {
      await client.query('DELETE FROM service_operations WHERE service_id = $1', [id]);
    }
    
    // Insert or update operations
    for (const op of operations) {
      const opCheck = await client.query(`
        SELECT id FROM service_operations WHERE service_id = $1 AND name = $2
      `, [id, op.name]);
      
      if (opCheck.rows.length > 0) {
        await client.query(`
          UPDATE service_operations
          SET description = $1, required_documents = $2::jsonb, price = $3, price_htg = $3, detailed_description = $4, actif = $5, updated_at = CURRENT_TIMESTAMP
          WHERE service_id = $6 AND name = $7
        `, [
          op.description || '',
          JSON.stringify(op.required_documents || []),
          op.price || 0,
          op.detailed_description || '',
          op.actif !== false,
          id,
          op.name
        ]);
      } else {
        await client.query(`
          INSERT INTO service_operations (service_id, name, description, required_documents, price, price_htg, detailed_description, actif)
          VALUES ($1, $2, $3, $4::jsonb, $5, $5, $6, $7)
        `, [
          id,
          op.name,
          op.description || '',
          JSON.stringify(op.required_documents || []),
          op.price || 0,
          op.detailed_description || '',
          op.actif !== false
        ]);
      }
    }
    
    await client.query('COMMIT');
    res.json({ status: 'success', message: 'Service mis à jour avec succès' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('updateService error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  } finally {
    client.release();
  }
};

const deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM services WHERE id = $1', [id]);
    res.json({ status: 'success', message: 'Service supprimé avec succès' });
  } catch (err) {
    console.error('deleteService error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const globalSearch = async (req, res) => {
  const { query } = req.query;
  if (!query || !query.trim()) {
    return res.status(400).json({ status: 'error', message: 'Query parameter is required' });
  }

  try {
    const term = query.trim();
    const isNumeric = /^\d+$/.test(term);

    if (isNumeric) {
      const numericId = parseInt(term, 10);
      
      // 1. Search for request by ID
      const reqQuery = `
        SELECT r.*,
               o.name as office_name,
               so.required_documents as operation_required_docs,
               r.details->>'firstName' as first_name,
               r.details->>'lastName' as last_name,
               SPLIT_PART(r.type, ' - ', 1) as service_name
        FROM service_requests r
        LEFT JOIN offices o ON r.office_id = o.id
        LEFT JOIN service_operations so ON (r.details->>'operationId')::text = so.id::text
        WHERE r.id = $1
      `;
      const reqRes = await pool.query(reqQuery, [numericId]);
      if (reqRes.rows.length > 0) {
        return res.json({ status: 'success', type: 'request', data: reqRes.rows[0] });
      }

      // 2. Search for user by ID
      const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [numericId]);
      if (userRes.rows.length > 0) {
        return res.json({ status: 'success', type: 'user', data: userRes.rows[0] });
      }
    }

    // 3. Search for user by email (exact or prefix) or NIF or exact name
    const userQuery = `
      SELECT * FROM users 
      WHERE LOWER(email) = LOWER($1) 
         OR nif = $1 
         OR LOWER(CONCAT(first_name, ' ', last_name)) = LOWER($1)
      LIMIT 1
    `;
    const userRes2 = await pool.query(userQuery, [term]);
    if (userRes2.rows.length > 0) {
      return res.json({ status: 'success', type: 'user', data: userRes2.rows[0] });
    }

    // 4. Try searching user by partial name/email/NIF to return the first matching user
    const partialUserQuery = `
      SELECT * FROM users
      WHERE LOWER(CONCAT(first_name, ' ', last_name)) LIKE LOWER($1)
         OR LOWER(email) LIKE LOWER($1)
         OR nif LIKE $1
      LIMIT 1
    `;
    const partialUserRes = await pool.query(partialUserQuery, [`%${term}%`]);
    if (partialUserRes.rows.length > 0) {
      return res.json({ status: 'success', type: 'user', data: partialUserRes.rows[0] });
    }

    // If nothing found
    return res.status(404).json({ status: 'error', message: 'Aucun résultat trouvé pour cette recherche.' });

  } catch (err) {
    console.error('globalSearch error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Placeholder implementations for remaining admin endpoints
// Placeholder implementations removed; real implementations below

// ─── Entity Services ────────────────────────────────────────────────────────
const getEntityServices = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT s.id, s.name, s.required_documents, s.is_public
       FROM services s
       JOIN entity_services es ON s.id = es.service_id
       WHERE es.entity_id = $1 ORDER BY s.name ASC`,
      [id]
    );
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error('getEntityServices error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const setEntityServices = async (req, res) => {
  const { id } = req.params; // entity id
  const { service_ids = [] } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM entity_services WHERE entity_id = $1', [id]);
    for (const sid of service_ids) {
      await client.query('INSERT INTO entity_services (entity_id, service_id) VALUES ($1, $2)', [id, sid]);
    }
    await client.query('COMMIT');
    res.json({ status: 'success', message: 'Services associés mis à jour' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('setEntityServices error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  } finally {
    client.release();
  }
};

// ─── Entities CRUD ────────────────────────────────────────────────────────
const createEntity = async (req, res) => {
  const {
    name, sigle, type_entite, description, date_creation, statut,
    ministere_tutelle, responsable, telephone, email, site_web,
    pays, departement, ville, adresse, code_postal
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO entities (name, sigle, type_entite, description, date_creation, statut,
        ministere_tutelle, responsable, telephone, email, site_web,
        pays, departement, ville, adresse, code_postal)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING *`,
      [name, sigle, type_entite, description, date_creation, statut,
        ministere_tutelle, responsable, telephone, email, site_web,
        pays, departement, ville, adresse, code_postal]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error('createEntity error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const updateEntity = async (req, res) => {
  const { id } = req.params;
  const {
    name, sigle, type_entite, description, date_creation, statut,
    ministere_tutelle, responsable, telephone, email, site_web,
    pays, departement, ville, adresse, code_postal
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE entities SET name=$1, sigle=$2, type_entite=$3, description=$4, date_creation=$5, statut=$6,
        ministere_tutelle=$7, responsable=$8, telephone=$9, email=$10, site_web=$11,
        pays=$12, departement=$13, ville=$14, adresse=$15, code_postal=$16, updated_at=NOW()
       WHERE id=$17 RETURNING *`,
      [name, sigle, type_entite, description, date_creation, statut,
        ministere_tutelle, responsable, telephone, email, site_web,
        pays, departement, ville, adresse, code_postal, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Entity not found' });
    }
    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error('updateEntity error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const deleteEntity = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM entities WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Entity not found' });
    }
    // Cascade delete of entity_services handled by DB foreign key ON DELETE CASCADE if defined
    res.json({ status: 'success', message: 'Entité supprimée' });
  } catch (err) {
    console.error('deleteEntity error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};



 // Users & Roles
const getUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.nif, u.role_id, u.office_id, u.assigned_services, u.created_at,
             r.name as role_name, o.name as office_name, e.name as entity_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN offices o ON u.office_id = o.id
      LEFT JOIN entities e ON o.entity_id = e.id
      ORDER BY u.id ASC
    `);
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error('getUsers error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const getUserDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error('getUserDetail error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const getUserCommunications = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM communications WHERE user_id = $1 ORDER BY created_at DESC', [id]);
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error('getUserCommunications error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const getRoles = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles ORDER BY id ASC');
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error('getRoles error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = {
  getStats,
  getEntities,
  getEntityServices,
  createEntity,
  updateEntity,
  deleteEntity,
  setEntityServices,
  getOffices: requestCtrl.getOffices,
  createOffice: async (req, res) => {
    const { name, type, entity_id } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO offices (name, type, entity_id) VALUES ($1, $2, $3) RETURNING *',
        [name, type, entity_id]
      );
      res.status(201).json({ status: 'success', data: result.rows[0] });
    } catch (err) {
      console.error('createOffice error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  },
  updateOffice: async (req, res) => {
    const { id } = req.params;
    const { name, type, entity_id } = req.body;
    try {
      const result = await pool.query(
        'UPDATE offices SET name = $1, type = $2, entity_id = $3 WHERE id = $4 RETURNING *',
        [name, type, entity_id, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Office not found' });
      res.json({ status: 'success', data: result.rows[0] });
    } catch (err) {
      console.error('updateOffice error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  },
  deleteOffice: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM offices WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Office not found' });
      res.json({ status: 'success', message: 'Office deleted' });
    } catch (err) {
      console.error('deleteOffice error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  },
  getServices,
  createService,
  updateService,
  deleteService,
  createOperation: async (req, res) => {
    const { service_id, name, description, required_documents = [], price } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO service_operations (service_id, name, description, required_documents, price, actif) 
         VALUES ($1, $2, $3, $4::jsonb, $5, true) RETURNING *`,
        [service_id, name, description, JSON.stringify(required_documents), price]
      );
      res.status(201).json({ status: 'success', data: result.rows[0] });
    } catch (err) {
      console.error('createOperation error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  },
  updateOperation: async (req, res) => {
    const { id } = req.params;
    const { name, description, required_documents, price, actif } = req.body;
    try {
      const result = await pool.query(
        `UPDATE service_operations SET name = $1, description = $2, required_documents = $3::jsonb, price = $4, actif = $5 WHERE id = $6 RETURNING *`,
        [name, description, JSON.stringify(required_documents), price, actif, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Operation not found' });
      res.json({ status: 'success', data: result.rows[0] });
    } catch (err) {
      console.error('updateOperation error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  },
  deleteOperation: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM service_operations WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Operation not found' });
      res.json({ status: 'success', message: 'Operation deleted' });
    } catch (err) {
      console.error('deleteOperation error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  },
  getUsers,
  getUserDetail,
  getUserCommunications,
  getRoles,
  createUser: async (req, res) => {
    const { first_name, last_name, email, password, phone, nif, role_id, office_id, assigned_services = [] } = req.body;
    try {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const result = await pool.query(
        'INSERT INTO users (first_name, last_name, email, password, phone, nif, role_id, office_id, assigned_services) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
        [first_name, last_name, email, hashedPassword, phone, nif, role_id, office_id, JSON.stringify(assigned_services)]
      );
      res.status(201).json({ status: 'success', data: result.rows[0] });
    } catch (err) {
      console.error('createUser error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  },
  updateUser: async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email, password, phone, nif, role_id, office_id, assigned_services = [] } = req.body;
    try {
      let queryStr = 'UPDATE users SET first_name=$1, last_name=$2, email=$3, phone=$4, nif=$5, role_id=$6, office_id=$7, assigned_services=$8 WHERE id=$9 RETURNING *';
      let params = [first_name, last_name, email, phone, nif, role_id, office_id, JSON.stringify(assigned_services), id];

      if (password && password.trim() !== '') {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        queryStr = 'UPDATE users SET first_name=$1, last_name=$2, email=$3, password=$4, phone=$5, nif=$6, role_id=$7, office_id=$8, assigned_services=$9 WHERE id=$10 RETURNING *';
        params = [first_name, last_name, email, hashedPassword, phone, nif, role_id, office_id, JSON.stringify(assigned_services), id];
      }

      const result = await pool.query(queryStr, params);
      if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'User not found' });
      res.json({ status: 'success', data: result.rows[0] });
    } catch (err) {
      console.error('updateUser error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  },
  updateUserProfile: async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email } = req.body;
    try {
      const result = await pool.query(
        'UPDATE users SET first_name=$1, last_name=$2, email=$3 WHERE id=$4 RETURNING *',
        [first_name, last_name, email, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'User not found' });
      res.json({ status: 'success', data: result.rows[0] });
    } catch (err) {
      console.error('updateUserProfile error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  },
  updateUserAvatar: async (req, res) => {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    const avatarPath = req.file.filename;
    try {
      const result = await pool.query(
        'UPDATE users SET avatar = $1 WHERE id = $2 RETURNING *',
        [avatarPath, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'User not found' });
      res.json({ status: 'success', data: result.rows[0] });
    } catch (err) {
      console.error('updateUserAvatar error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  },
  deleteUser: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'User not found' });
      res.json({ status: 'success', message: 'User deleted' });
    } catch (err) {
      console.error('deleteUser error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  },
  globalSearch,
};
