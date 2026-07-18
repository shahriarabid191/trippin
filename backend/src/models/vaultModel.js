import pool from "../config/db.js";



// Add file
export async function createFile(file){

    const existing = await pool.query(
        `
        SELECT *
        FROM files
        WHERE user_id=$1
        AND display_name=$2
        `,
        [
            file.user_id,
            file.display_name
        ]
    );


    if(existing.rows.length > 0){
        return null;
    }


    const result = await pool.query(
        `
        INSERT INTO files(
            user_id,
            display_name,
            stored_name,
            file_path,
            mime_type,
            file_size
        )
        VALUES($1,$2,$3,$4,$5,$6)
        RETURNING *
        `,
        [
            file.user_id,
            file.display_name,
            file.stored_name,
            file.file_path,
            file.mime_type,
            file.file_size
        ]
    );


    return result.rows[0];
}




// Get all files of a user
export async function getUserFiles(userID){


    const result = await pool.query(

        `
        SELECT *
        FROM files
        WHERE user_id=$1
        ORDER BY created_at DESC
        `,

        [
            userID
        ]

    );


    return result.rows;

}





// Delete file
export async function deleteFile(id, userID){


    const result = await pool.query(

        `
        DELETE FROM files
        WHERE id=$1 AND user_id=$2
        `,

        [
            id,
            userID
        ]

    );


    return result.rowCount;

}

// Update display name
export async function updateFileName(id, userID, display_name){

    const result = await pool.query(

        `
        UPDATE files
        SET display_name=$1
        WHERE id=$2 AND user_id=$3
        RETURNING *
        `,

        [
            display_name,
            id,
            userID
        ]

    );


    return result.rows[0];

}