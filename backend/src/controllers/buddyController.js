import {
    createTravelBuddyRequest,
    getTravelBuddies,
    getPendingTravelBuddyRequests,
    acceptTravelBuddyRequest,
    rejectTravelBuddyRequest,
    removeTravelBuddy
} from "../models/buddyModel.js";


import { getUserByUsername } from "../models/userModel.js";
import { searchUsersByUsername } from "../models/userModel.js";


// Send travel buddy request
export const sendTravelBuddyRequest = async (req, res) => {

    try {

        const userId = req.user.id;

        const { buddyUid } = req.body;


        const buddyUser = await getUserByUsername(buddyUid);


        if (!buddyUser) {

            return res.status(404).json({
                error: "User not found"
            });

        }


        if (userId === buddyUser.id) {

            return res.status(400).json({
                error: "You cannot add yourself as a travel buddy"
            });

        }


        const request = await createTravelBuddyRequest(
            userId,
            buddyUser.id
        );


        res.status(201).json({
            message: "Travel buddy request sent",
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


// Get accepted travel buddies
export const getMyTravelBuddies = async (req, res) => {

    try {

        const userId = req.user.id;

        const buddies = await getTravelBuddies(userId);


        res.json({
            buddies
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};


// Get incoming travel buddy requests
export const getTravelBuddyRequests = async (req, res) => {

    try {

        const userId = req.user.id;

        const requests = await getPendingTravelBuddyRequests(
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


// Accept travel buddy request
export const acceptBuddyRequest = async (req, res) => {

    try {

        const { id } = req.params;

        const userId = req.user.id;


        const request = await acceptTravelBuddyRequest(
            id,
            userId
        );


        if (!request) {

            return res.status(403).json({
                error: "Unauthorized request"
            });

        }


        res.json({
            message: "Travel buddy request accepted",
            request
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Server error"
        });

    }

};


// Reject travel buddy request
export const rejectBuddyRequest = async (req, res) => {

    try {

        const { id } = req.params;

        const userId = req.user.id;


        const request = await rejectTravelBuddyRequest(
            id,
            userId
        );


        if (!request) {

            return res.status(403).json({
                error: "Unauthorized request"
            });

        }


        res.json({
            message: "Travel buddy request rejected",
            request
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Server error"
        });

    }

};


// Remove travel buddy
export const deleteTravelBuddy = async (req, res) => {

    try {

        const { id } = req.params;

        const userId = req.user.id;


        const buddy = await removeTravelBuddy(
            id,
            userId
        );


        if (!buddy) {

            return res.status(404).json({
                error: "Travel buddy not found"
            });

        }


        res.json({
            message: "Travel buddy removed",
            buddy
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Server error"
        });

    }

};


//search
export const searchUsers = async (req, res) => {

    try {

        const users = await searchUsersByUsername(
            req.query.username,
            req.user.id
        );

        res.json({
            users
        });

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Server error"
        });

    }

};