import * as Vault from "../models/vaultModel.js";

import fs from "fs";


// GET /api/vault
export const getFilesByUserID = async (req, res) => {

    try {

        let files = await Vault.getUserFiles(req.user.id);


        const validFiles = [];


        for (const file of files) {

            if (fs.existsSync(file.file_path)) {

                validFiles.push(file);

            } 
            else {

                // remove orphan database record
                await Vault.deleteFile(
                    file.id,
                    req.user.id
                );

            }

        }


        res.json(validFiles);


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};



// POST /api/vault

export const uploadFile = async (req, res) => {

    try {

        const file = await Vault.createFile({

            user_id: req.user.id,

            display_name: req.file.originalname,

            stored_name: req.file.filename,

            file_path: req.file.path,

            mime_type: req.file.mimetype,

            file_size: req.file.size

        });


        if (!file) {

            return res.status(409).json({
                message: "File already exists"
            });

        }


        res.status(201).json({

            message: "File uploaded",

            file

        });


    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Upload failed"
        });

    }

};




// DELETE /api/vault/:id

export const removeFile = async (req, res) => {

    try {

        const files = await Vault.getUserFiles(
            req.user.id
        );


        const file = files.find(
            f => f.id == req.params.id
        );


        if (!file) {

            return res.status(404).json({
                message: "File not found"
            });

        }



        // Remove physical file

        if (fs.existsSync(file.file_path)) {

            fs.unlinkSync(file.file_path);

        }



        const deleted = await Vault.deleteFile(
            req.params.id,
            req.user.id
        );


        if (deleted === 0) {

            return res.status(404).json({
                message: "File not found"
            });

        }



        res.json({
            message: "Deleted successfully"
        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};





// PUT /api/vault/:id

export const renameFile = async (req, res) => {

    try {

        const file = await Vault.updateFileName(
            req.params.id,
            req.user.id,
            req.body.display_name
        );


        res.json(file);


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};