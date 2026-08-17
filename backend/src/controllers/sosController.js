import {
    createSosRequest,
    getSosContacts,
    getPendingSosRequests,
    acceptSosRequest,
    rejectSosRequest,
    removeSosContact
} from "../models/sosModel.js";


import { getUserByUsername } from "../models/userModel.js";


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


        const request = await createSosRequest(
            userId,
            contactUser.id
        );


        res.status(201).json({
            message: "SOS request sent",
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

        const contacts = await getSosContacts(userId);

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



// Get incoming SOS requests
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



// Accept SOS request
export const acceptRequest = async (req,res)=>{

    try {

        const {id}=req.params;
        const userId=req.user.id;


        const request = await acceptSosRequest(
            id,
            userId
        );


        if(!request){
            return res.status(403).json({
                error:"Unauthorized request"
            });
        }


        res.json({
            message:"SOS request accepted",
            request
        });


    }
    catch(error){

        console.error(error);

        res.status(500).json({
            error:"Server error"
        });

    }

};


// Reject SOS request
export const rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await rejectSosRequest(id);

        res.json({
            message: "SOS request rejected",
            request
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};



// Remove SOS contact
export const deleteSosContact = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await removeSosContact(id);

        res.json({
            message: "SOS contact removed",
            contact
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};