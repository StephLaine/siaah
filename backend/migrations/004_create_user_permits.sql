CREATE TABLE user_permits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  permit_id INTEGER REFERENCES driving_permits(id) ON DELETE CASCADE,
  request_id INTEGER REFERENCES service_requests(id),
  status VARCHAR(20) DEFAULT 'assigned',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, permit_id)
);
