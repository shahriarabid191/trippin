import * as Journal from "../models/journalModel.js";


// GET /api/journals  (the logged-in user's own entries)

export const getJournals = async (req, res) => {

    try {

        const journals = await Journal.getJournalsByUserID(req.user.id);

        res.json(journals);

    } 
    catch (error) { 

        res.status(500).json({
            message: "Server error"
        });

    }

};



// GET /api/journals/public  (community feed)

export const getCommunityJournals = async (req, res) => {

    try {

        const journals = await Journal.getPublicJournals();

        res.json(journals);

    }
    catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

};



// POST /api/journals

export const createJournal = async (req, res) => {

    const journal = await Journal.addJournal({
        title: req.body.title,
        content: req.body.content,
        isPublic: req.body.isPublic || false,
        userID: req.user.id
    });

    res.status(201)
        .json({
            message: "Journal entry created",
            journal
        });

};



// DELETE /api/journals/:id

export const removeJournal = async (req, res) => {

    const deleted =
        await Journal.deleteJournal(
            req.params.id,
            req.user.id
        );


    if (deleted === 0) {
        return res.status(404)
            .json({
                message: "Journal entry not found"
            });
    }


    res.json({
        message: "Deleted successfully"
    });

};



// PUT /api/journals/:id

export const editJournal = async (req, res) => {

    const updated =
        await Journal.updateJournal(
            req.params.id,
            req.user.id,
            req.body
        );


    if (updated === 0) {
        return res.status(404)
            .json({
                message: "Journal entry not found"
            });
    }


    res.json({
        message: "Updated successfully"
    });

};