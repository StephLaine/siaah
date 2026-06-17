INSERT INTO service_operations (service_id, operation_name, price_htg, description, required_documents)
SELECT s.id, ops.operation_name, 0, '', ''
FROM services s
JOIN (
  VALUES
    ('Permis de conduire','Nouveau permis'),
    ('Permis de conduire','Renouveller un permis de conduire'),
    ('Permis de conduire','Corriger un permis'),
    ('Permis de conduire','Remplacer un permis'),
    ('Immatriculation','Immatriculer un véhicule'),
    ('Immatriculation','Renouveller une plaque d''immatriculation'),
    ('Immortc...')
) AS ops(service_name, operation_name)
ON CONFLICT DO NOTHING;
