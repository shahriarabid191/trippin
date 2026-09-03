import "dotenv/config";

import {
    Worker,
    createPostgresBackend
} from "bullmq";

import {
    createNotification
} from "../models/notificationModel.js";

import {
    EVENT_TYPES
} from "../events/eventTypes.js";


const connection = {
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    schema: "bullmq"
};


const worker = new Worker(
    "notifications",

    async (job) => {

        const event = job.data;

        console.log(
            `[NOTIFICATION WORKER] Processing: ${event.type}`
        );


        /*
         * An event may have:
         *
         * userId
         * OR
         * data.recipientIds
         *
         * This allows one event to notify one
         * or multiple users.
         */

        let recipientIds = [];


        if (
            Array.isArray(event.data?.recipientIds)
        ) {

            recipientIds = event.data.recipientIds;

        }
        else if (event.userId) {

            recipientIds = [event.userId];

        }


        if (recipientIds.length === 0) {

            console.warn(
                `[NOTIFICATION WORKER] No recipients for event ${event.eventId}`
            );

            return;

        }


        const notifications = [];


        for (const userId of recipientIds) {

            const notification =
                await createNotification({

                    userId,

                    eventId: event.eventId,

                    type: event.type,

                    title: getTitle(event.type),

                    message: getMessage(
                        event.type,
                        event.data
                    ),

                    priority: getPriority(
                        event.type
                    ),

                    metadata: event.data || {}

                });


            /*
             * null means the event already created
             * a notification because of our
             * ON CONFLICT (event_id, user_id) DO NOTHING
             */

            if (notification) {

                notifications.push(notification);

                console.log(
                    `[NOTIFICATION CREATED] ${notification.id}`
                );

            }
            else {

                console.log(
                    `[NOTIFICATION EXISTS] Event ${event.eventId}`
                );

            }

        }


        return notifications;
    },

    {
        connection,

        /*
         * If notification processing fails,
         * BullMQ can retry the job.
         */

        concurrency: 5
    },

    createPostgresBackend
);


worker.on("completed", (job) => {

    console.log(
        `[JOB COMPLETED] ${job.id}`
    );

});


worker.on("failed", (job, error) => {

    console.error(
        `[JOB FAILED] ${job?.id}`,
        error
    );

});


worker.on("error", (error) => {

    console.error(
        "[NOTIFICATION WORKER ERROR]",
        error
    );

});


worker.on("ready", () => {

    console.log(
        "🔔 Notification worker connected to PostgreSQL"
    );

});


console.log(
    "🔔 Notification worker started"
);


/*
 * ------------------------------------------------
 * TITLE
 * ------------------------------------------------
 */

function getTitle(type) {

    switch (type) {

        case EVENT_TYPES.CHAT_MESSAGE_SENT:
            return "New Message";

        case EVENT_TYPES.CHAT_MESSAGE_REACTED:
            return "Message Reaction";

        case EVENT_TYPES.BUDDY_REQUEST_SENT:
            return "New Buddy Request";

        case EVENT_TYPES.BUDDY_REQUEST_ACCEPTED:
            return "Buddy Request Accepted";

        case EVENT_TYPES.BUDDY_REQUEST_REJECTED:
            return "Buddy Request Rejected";

        case EVENT_TYPES.SOS_CONTACT_REQUEST_SENT:
            return "New SOS Contact Request";

        case EVENT_TYPES.SOS_CONTACT_REQUEST_ACCEPTED:
            return "SOS Contact Request Accepted";

        case EVENT_TYPES.SOS_CONTACT_REQUEST_REJECTED:
            return "SOS Contact Request Rejected";

        case EVENT_TYPES.SOS_TRIGGERED:
            return "SOS Alert";

        case EVENT_TYPES.SOS_ACKNOWLEDGED:
            return "SOS Alert Acknowledged";

        case EVENT_TYPES.SHARED_BUDGET_CREATED:
            return "Shared Budget Created";

        case EVENT_TYPES.SHARED_BUDGET_UPDATED:
            return "Shared Budget Updated";

        case EVENT_TYPES.SHARED_BUDGET_DELETED:
            return "Shared Budget Deleted";

        case EVENT_TYPES.PAYMENT_SUCCESS:
            return "Payment Successful";

        case EVENT_TYPES.PAYMENT_FAILED:
            return "Payment Failed";

        case EVENT_TYPES.REVIEW_RECEIVED:
            return "New Review";

        default:
            return "New Notification";
    }

}


/*
 * ------------------------------------------------
 * MESSAGE
 * ------------------------------------------------
 */

function getMessage(type, data = {}) {

    switch (type) {

        case EVENT_TYPES.CHAT_MESSAGE_SENT:
            return `${data.senderUsername} sent you a message.`;

        case EVENT_TYPES.CHAT_MESSAGE_REACTED:
            return `${data.reactorUsername} reacted to your message.`;

        case EVENT_TYPES.BUDDY_REQUEST_SENT:
            return `${data.senderUsername} sent you a buddy request.`;

        case EVENT_TYPES.BUDDY_REQUEST_ACCEPTED:
            return `${data.accepterUsername} accepted your buddy request.`;

        case EVENT_TYPES.BUDDY_REQUEST_REJECTED:
            return `${data.rejecterUsername} rejected your buddy request.`;

        case EVENT_TYPES.SOS_CONTACT_REQUEST_SENT:
            return `${data.senderUsername} wants to add you as a sos contact.`;

        case EVENT_TYPES.SOS_CONTACT_REQUEST_ACCEPTED:
            return `${data.accepterUsername} accepted your SOS contact request.`;

        case EVENT_TYPES.SOS_CONTACT_REQUEST_REJECTED:
            return `${data.rejecterUsername} rejected your SOS contact request.`;

        case EVENT_TYPES.SOS_TRIGGERED:
            return `${data.senderUsername} has triggered an SOS emergency.`;

        case EVENT_TYPES.SOS_ACKNOWLEDGED:
            return `${data.acknowledgerUsername} acknowledged your SOS alert.`;

        case EVENT_TYPES.SHARED_BUDGET_CREATED:
            return `${data.creatorUsername} created a shared budget.`;

        case EVENT_TYPES.SHARED_BUDGET_UPDATED:
            return `${data.updaterUsername} updated the shared budget.`;

        case EVENT_TYPES.SHARED_BUDGET_DELETED:
            return `${data.deleterUsername} deleted the shared budget.`;

        case EVENT_TYPES.PAYMENT_SUCCESS:
            return `Your payment was successfully completed.`;

        case EVENT_TYPES.PAYMENT_FAILED:
            return `Your payment failed.`;

        case EVENT_TYPES.REVIEW_RECEIVED:
            return `${data.reviewerUsername} left you a review.`;

        default:
            return "New notification.";
    }

}

/*
 * ------------------------------------------------
 * PRIORITY
 * ------------------------------------------------
 */

function getPriority(type) {

    switch (type) {

        case EVENT_TYPES.SOS_TRIGGERED:
            return "critical";

        case EVENT_TYPES.PAYMENT_FAILED:
            return "high";

        default:
            return "normal";
    }

}