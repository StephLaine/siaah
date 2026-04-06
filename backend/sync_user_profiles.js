const { pool } = require('./src/config/db');

async function syncUsers() {
    try {
        console.log("Starting sync: Extracting details from service_requests to populate users table...");
        
        // Get all requests ordered by created_at desc so the newest request details override older ones
        const result = await pool.query('SELECT user_id, details FROM service_requests ORDER BY created_at ASC');
        const requests = result.rows;

        let updatedCount = 0;

        for (const req of requests) {
            const userId = req.user_id;
            let details = req.details;
            
            if (typeof details === 'string') {
                try { details = JSON.parse(details); } catch(e) {}
            }
            
            if (!details || typeof details !== 'object') continue;

            const {
                sexe, dob, pob, nationality, bloodGroup,
                state, city, country, address, street, houseNumber,
                phone, phone2, nifCin
            } = details;

            // Resolve full address
            let full_address = address;
            if (!full_address && street) {
                full_address = `${houseNumber ? houseNumber + ' ' : ''}${street}`.trim();
            }

            // Figure out NIF/CIN (if nifCin has 10 digits it's NIF, 17 is CIN roughly, but we can just use heuristics, or put it in both if empty)
            let nif = null;
            let cin = null;
            if (nifCin) {
                if (nifCin.length > 10) cin = nifCin;
                else nif = nifCin;
            }

            // Build update query dynamically for only values that exist in details
            let updates = [];
            let values = [];
            let paramIdx = 1;

            if (sexe) { updates.push(`sexe = COALESCE(sexe, $${paramIdx++})`); values.push(sexe.substring(0, 20)); }
            if (dob) { updates.push(`dob = COALESCE(dob, $${paramIdx++})`); values.push(dob); }
            if (pob) { updates.push(`pob = COALESCE(pob, $${paramIdx++})`); values.push(pob); }
            if (nationality) { updates.push(`nationality = COALESCE(nationality, $${paramIdx++})`); values.push(nationality); }
            if (bloodGroup) { updates.push(`blood_group = COALESCE(blood_group, $${paramIdx++})`); values.push(bloodGroup); }
            if (city) { updates.push(`city = COALESCE(city, $${paramIdx++})`); values.push(city); }
            if (state) { updates.push(`department = COALESCE(department, $${paramIdx++})`); values.push(state); }
            if (country) { updates.push(`country = COALESCE(country, $${paramIdx++})`); values.push(country); }
            if (full_address) { updates.push(`full_address = COALESCE(full_address, $${paramIdx++})`); values.push(full_address); }
            if (phone) { updates.push(`phone = COALESCE(phone, $${paramIdx++})`); values.push(phone); }
            if (phone2) { updates.push(`phone2 = COALESCE(phone2, $${paramIdx++})`); values.push(phone2); }
            if (cin) { updates.push(`cin = COALESCE(cin, $${paramIdx++})`); values.push(cin); }
            if (nif) { updates.push(`nif = COALESCE(nif, $${paramIdx++})`); values.push(nif); }

            if (updates.length > 0) {
                values.push(userId);
                const queryStr = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIdx}`;
                await pool.query(queryStr, values);
                updatedCount++;
            }
        }
        
        console.log(`Sync successful: Data extracted and migrated for ${updatedCount} request details.`);
    } catch (err) {
        console.error("Migration fatal error:", err);
    } finally {
        pool.end();
    }
}

syncUsers();
