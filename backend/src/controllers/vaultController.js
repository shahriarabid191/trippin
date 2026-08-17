import * as Vault from "../models/vaultModel.js";
import fs from "fs";


// GET /api/vault
export const getFilesByUserID = async (req, res) => {

    try {

        const files = await Vault.getUserFiles(req.user.id);

        const validFiles = [];


        for (const file of files) {

            if (fs.existsSync(file.file_path)) {

                validFiles.push(file);

            } 
            else {

                // remove orphan database entry
                await Vault.deleteFile(
                    file.id,
                    req.user.id
                );

            }

        }


        res.json(validFiles);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};




// POST /api/vault
export const uploadFile = async (req, res) => {

    try {


        // No file uploaded
        if (!req.file) {

            return res.status(400).json({
                message: "No file uploaded"
            });

        }



        const fileData = {

            user_id: req.user.id,

            display_name: req.file.originalname,

            stored_name: req.file.filename,

            file_path: req.file.path,

            mime_type: req.file.mimetype,

            file_size: req.file.size

        };



        const file = await Vault.createFile(fileData);



        // Duplicate filename
        if (!file) {


            // Remove file already saved by multer
            if (
                req.file.path &&
                fs.existsSync(req.file.path)
            ) {

                fs.unlinkSync(req.file.path);

            }


            return res.status(409).json({
                message: "File already exists"
            });

        }



        res.status(201).json({

            message: "File uploaded successfully",

            file

        });



    } catch (error) {


        console.error(error);



        // cleanup if DB fails after multer upload
        if (
            req.file &&
            req.file.path &&
            fs.existsSync(req.file.path)
        ) {

            fs.unlinkSync(req.file.path);

        }



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
                message: "File not found or unauthorized"
            });

        }



        // Delete physical file

        if (
            file.file_path &&
            fs.existsSync(file.file_path)
        ) {

            fs.unlinkSync(file.file_path);

        }



        const deleted = await Vault.deleteFile(
            req.params.id,
            req.user.id
        );



        if (!deleted) {

            return res.status(404).json({
                message: "File not found"
            });

        }



        res.json({

            message: "Deleted successfully"

        });



    } catch (error) {


        console.error(error);


        res.status(500).json({
            message: "Server error"
        });


    }

};





// PUT /api/vault/:id
export const renameFile = async (req, res) => {

    try {

        const { display_name } = req.body;


        if (!display_name || !display_name.trim()) {

            return res.status(400).json({
                message: "Filename cannot be empty"
            });

        }


        const cleanName = display_name.trim();



        // Check duplicate name
        const exists = await Vault.fileNameExists(
            req.user.id,
            cleanName,
            req.params.id
        );


        if (exists) {

            return res.status(409).json({

                message: "A file with this name already exists"

            });

        }




        const file = await Vault.updateFileName(

            req.params.id,

            req.user.id,

            cleanName

        );



        if (!file) {

            return res.status(404).json({

                message: "File not found or unauthorized"

            });

        }



        res.json({

            message: "Filename updated",

            file

        });



    } catch (error) {


        console.error(error);


        res.status(500).json({

            message: "Server error"

        });


    }

};