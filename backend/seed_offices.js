const db = require('./src/config/db');

async function run() {
    try {
        console.log('Fetching entities...');
        const entitiesRes = await db.query('SELECT id, sigle FROM entities');
        const entities = entitiesRes.rows;
        console.log('Entities in DB:', entities);

        const mef = entities.find(e => e.sigle === 'MEF');
        const dgi = entities.find(e => e.sigle === 'DGI');
        const oavct = entities.find(e => e.sigle === 'OAVCT');
        const dcpr = entities.find(e => e.sigle === 'DCPR');

        const officesToSeed = [
            { name: 'SIAAH Headquarters', type: 'GLOBAL', entity_id: mef ? mef.id : null },
            { name: 'OAVCT Port-au-Prince', type: 'OAVCT', entity_id: oavct ? oavct.id : null },
            { name: 'DGI Port-au-Prince', type: 'DGI', entity_id: dgi ? dgi.id : null },
            { name: 'DCPR Port-au-Prince', type: 'DCPR', entity_id: dcpr ? dcpr.id : null }
        ];

        console.log('Seeding offices...');
        for (const office of officesToSeed) {
            const check = await db.query('SELECT id FROM offices WHERE name = $1', [office.name]);
            if (check.rows.length === 0) {
                await db.query(
                    'INSERT INTO offices (name, type, entity_id, statut) VALUES ($1, $2, $3, \'Actif\')',
                    [office.name, office.type, office.entity_id]
                );
                console.log(`✓ Inserted office: ${office.name}`);
            } else {
                await db.query(
                    'UPDATE offices SET type = $1, entity_id = $2 WHERE name = $3',
                    [office.type, office.entity_id, office.name]
                );
                console.log(`✓ Updated office: ${office.name}`);
            }
        }

        console.log('Office seeding complete.');
    } catch (err) {
        console.error('Error seeding offices:', err);
    } finally {
        db.pool.end();
    }
}

run();
