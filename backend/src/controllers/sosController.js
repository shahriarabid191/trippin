import {
    createSosRequest,
    getSosContacts,
    getPendingSosRequests,
    acceptSosRequest,
    rejectSosRequest,
    removeSosContact
} from "../models/sosModel.js";

import {
    getUserByUsername,
    searchUsersByUsername
} from "../models/userModel.js";

import { publishEvent } from "../events/eventPublisher.js";
import { EVENT_TYPES } from "../events/eventTypes.js";


// Send SOS contact request
export const sendSosRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { contactUid } = req.body;

        const contactUser = await getUserByUsername(contactUid);

        if (!contactUser) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        if (userId === contactUser.id) {
            return res.status(400).json({
                error: "You cannot add yourself as an SOS contact"
            });
        }

        const request = await createSosRequest(
            userId,
            contactUser.id
        );

        await publishEvent({
            type: EVENT_TYPES.SOS_CONTACT_REQUEST_SENT,
            userId: contactUser.id,
            data: {
                senderId: userId,
                senderUsername: req.user.username,
                recipientId: contactUser.id,
                redirectTo: "/sos"
            }
        });

        res.status(201).json({
            message: "SOS contact request sent",
            request
        });

    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            return res.status(400).json({
                error: "Request already exists"
            });
        }

        res.status(500).json({
            error: "Server error"
        });
    }
};


// Get accepted SOS contacts
export const getMySosContacts = async (req, res) => {
    try {
        const userId = req.user.id;

        const contacts = await getSosContacts(
            userId
        );

        res.json({
            contacts
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get incoming SOS contact requests
export const getSosRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await getPendingSosRequests(
            userId
        );

        res.json({
            requests
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Accept SOS contact request
export const acceptRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const request = await acceptSosRequest(
            id,
            userId
        );

        if (!request) {
            return res.status(403).json({
                error: "Unauthorized request"
            });
        }

        await publishEvent({
            type: EVENT_TYPES.SOS_CONTACT_REQUEST_ACCEPTED,
            userId: request.user_id,
            data: {
                requesterId: request.user_id,
                accepterId: userId,
                accepterUsername: req.user.username,
                redirectTo: "/sos"
            }
        });

        res.json({
            message: "SOS request accepted",
            request
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Server error"
        });
    }
};


// Reject SOS contact request
export const rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const request = await rejectSosRequest(
            id,
            userId
        );

        if (!request) {
            return res.status(403).json({
                error: "Unauthorized request"
            });
        }

        await publishEvent({
            type: EVENT_TYPES.SOS_CONTACT_REQUEST_REJECTED,
            userId: request.user_id,
            data: {
                requesterId: request.user_id,
                rejecterId: userId,
                rejecterUsername: req.user.username,
                redirectTo: "/sos"
            }
        });

        res.json({
            message: "SOS request rejected",
            request
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Server error"
        });
    }
};


// Remove SOS contact
export const deleteSosContact = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const contact = await removeSosContact(
            id,
            userId
        );

        if (!contact) {
            return res.status(404).json({
                error: "SOS contact not found"
            });
        }

        res.json({
            message: "SOS contact removed",
            contact
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Server error"
        });
    }
};


// Search users
export const searchUsers = async (req, res) => {
    try {
        const users = await searchUsersByUsername(
            req.query.username,
            req.user.id
        );

        res.json({
            users
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Server error"
        });
    }
};