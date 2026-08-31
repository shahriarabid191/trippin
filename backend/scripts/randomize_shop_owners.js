import "dotenv/config";
import pool from "../src/config/db.js";

async function run() {
    try {
        console.log("Fetching users...");
        const usersRes = await pool.query("SELECT id FROM users");
        if (usersRes.rows.length === 0) {
            console.log("No users found. Please create some users first.");
            process.exit(0);
        }
        
        const userIds = usersRes.rows.map(r => r.id);
        
        console.log("Fetching seeded shops...");
        const shopsRes = await pool.query("SELECT id FROM sim_shops WHERE source = 'seed' OR submitted_by IS NULL");
        const shopIds = shopsRes.rows.map(r => r.id);
        
        if (shopIds.length === 0) {
            console.log("No seeded/unassigned shops found.");
            process.exit(0);
        }
        
        let updatedCount = 0;
        
        for (const shopId of shopIds) {
            const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
            await pool.query(
                "UPDATE sim_shops SET submitted_by = $1, source = 'user' WHERE id = $2",
                [randomUserId, shopId]
            );
            updatedCount++;
        }
        
        console.log(`Successfully assigned ${updatedCount} shops to random users.`);
    } catch (error) {
        console.error("Error randomizing shop owners:", error);
    } finally {
        process.exit(0);
    }
}

run();
