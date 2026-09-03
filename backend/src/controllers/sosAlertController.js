import {
    createSosAlert,
    getReceivedSosAlerts,
    getSentSosAlerts,
    acknowledgeSosAlert
} from "../models/sosAlertModel.js";

import {
    getSosContacts
} from "../models/sosModel.js";

import {
    publishEvent
} from "../events/eventPublisher.js";

import {
    EVENT_TYPES
} from "../events/eventTypes.js";



// Trigger SOS alert (3 taps / countdown trigger)
export const triggerSosAlert = async (req, res) => {

    try {

        const senderId = req.user.id;
        const senderUsername = req.user.username;

        const {
            lat,
            long,
            type,
            countdownEnd
        } = req.body;


        // Find accepted SOS contacts
        const contacts = await getSosContacts(senderId);


        // User must have at least one contact
        if (contacts.length === 0) {

            return res.status(400).json({
                error: "No SOS contacts available"
            });

        }


        const alerts = [];


        // Create alert for every SOS contact
        for (const contact of contacts) {

            const alert = await createSosAlert(
                senderId,
                contact.contact_uid,
                lat,
                long,
                type,
                countdownEnd
            );


            alerts.push(alert);


            // Notify each SOS contact
            await publishEvent({

                type: EVENT_TYPES.SOS_TRIGGERED,

                userId: contact.contact_uid,

                data: {

                    senderId,

                    senderUsername,

                    receiverId: contact.contact_uid,

                    alertId: alert.id,

                    lat,

                    long,

                    type,

                    countdownEnd

                }

            });

        }


        res.status(201).json({

            message: "SOS alert triggered",

            alerts

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({

            error: "Server error"

        });

    }

};



// Get alerts received by logged-in user
export const getMyReceivedAlerts = async (req, res) => {

    try {

        const receiverId = req.user.id;


        const alerts = await getReceivedSosAlerts(
            receiverId
        );


        res.json({

            alerts

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({

            error: "Server error"

        });

    }

};



// Get alerts sent by logged-in user
export const getMySentAlerts = async (req, res) => {

    try {

        const senderId = req.user.id;


        const alerts = await getSentSosAlerts(
            senderId
        );


        res.json({

            alerts

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({

            error: "Server error"

        });

    }

};



// Receiver acknowledges SOS alert
export const acknowledgeAlert = async (req, res) => {

    try {

        const { id } = req.params;

        const receiverId = req.user.id;
        const receiverUsername = req.user.username;


        const alert = await acknowledgeSosAlert(
            id,
            receiverId
        );


        if (!alert) {

            return res.status(403).json({
                error: "Unauthorized or alert not found"
            });

        }


        /*
         * Notify the user who originally
         * triggered the SOS.
         */
        await publishEvent({

            type: EVENT_TYPES.SOS_ACKNOWLEDGED,

            userId: alert.sender_id,

            data: {

                alertId: alert.id,

                senderId: alert.sender_id,

                acknowledgerId: receiverId,

                acknowledgerUsername: receiverUsername

            }

        });


        res.json({

            message: "SOS alert acknowledged",

            alert

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({

            error: "Server error"

        });

    }

};