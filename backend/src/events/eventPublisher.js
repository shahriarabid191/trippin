import { randomUUID } from "crypto";

import { notificationQueue } from "../queues/notificationQueue.js";


export const publishEvent = async ({
    type,
    userId,
    data = {}
}) => {

    const event = {
        eventId: randomUUID(),
        type,
        userId,
        data,
        createdAt: new Date().toISOString()
    };


    await notificationQueue.add(
        type,
        event,
        {
            jobId: event.eventId
        }
    );


    console.log(
        `[EVENT QUEUED] ${type} (${event.eventId})`
    );


    return event;
};