import { Queue, createPostgresBackend } from "bullmq";


const connection = {
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,

    // BullMQ creates its own schema.
    schema: "bullmq"
};


export const notificationQueue = new Queue(
    "notifications",
    {
        connection
    },
    createPostgresBackend
);