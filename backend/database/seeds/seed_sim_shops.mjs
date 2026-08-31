// =====================================================================
// seed_sim_shops.mjs
//
// One-time (re-runnable) seed for the sim_shops table. Reads the shops
// that used to live in frontend/src/data/simShopsData.js and inserts
// them as approved, active, source = 'seed'.
//
// Re-running deletes and re-inserts only the source = 'seed' rows, so
// admin- and user-created shops are never touched.
//
//   node database/seeds/seed_sim_shops.mjs
//   npm run seed:sim-shops
// =====================================================================

import "dotenv/config";
import pg from "pg";
import { shopsByDistrict } from "../../../frontend/src/data/simShopsData.js";

const { Pool } = pg;

const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE
});

const run = async () => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query("DELETE FROM sim_shops WHERE source = 'seed'");

        let inserted = 0;

        for (const [district, areas] of Object.entries(shopsByDistrict)) {
            for (const [area, shops] of Object.entries(areas)) {
                for (const s of shops) {
                    await client.query(
                        `INSERT INTO sim_shops (
                            name, district, area, address, landmark, phone, alt_phone, email,
                            hours, established, operators, services, esim_support, map_link,
                            status, source, is_active
                         )
                         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,
                                 'approved','seed',true)`,
                        [
                            s.name,
                            district,
                            area,
                            s.address,
                            s.landmark || null,
                            s.phone,
                            s.altPhone || null,
                            s.email || null,
                            s.hours,
                            s.established || null,
                            Array.isArray(s.operator) ? s.operator : [],
                            Array.isArray(s.services) ? s.services : [],
                            !!s.esimSupport,
                            s.mapLink || null
                        ]
                    );
                    inserted += 1;
                }
            }
        }

        await client.query("COMMIT");
        console.log(`Seeded ${inserted} SIM/eSIM shops (source = 'seed').`);
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Seed failed:", error.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
};

run();
