import "dotenv/config";
import pg from "pg";
import { runMigrations } from "bullmq";

const { Pool } = pg;


const pool = new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE
});


const migrate = async () => {

    const client = await pool.connect();

    try {

        const version = await runMigrations(
            client,
            "bullmq"
        );

        console.log(
            `BullMQ PostgreSQL schema ready. Version: ${version}`
        );

    } catch (error) {

        console.error(
            "BullMQ migration failed:",
            error
        );

        process.exitCode = 1;

    } finally {

        client.release();
        await pool.end();

    }
};


migrate();