import jwt from "jsonwebtoken";
import pool from "../config/db.js";


export const authenticateUser = async (req, res, next) => {

    try {

        const token = req.cookies.token;


        if (!token) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }


        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        req.user = decoded;


        // Refresh role from the database and enforce suspension. The JWT
        // only carries id + role at sign-in time; checking here means a
        // ban or a role change takes effect on the next request without
        // waiting for the 1-day token to expire. If the lookup fails we
        // fall back to the token claims rather than locking everyone out.
        try {

            const { rows } = await pool.query(
                "SELECT role, suspended_at FROM users WHERE id = $1",
                [decoded.id]
            );

            const account = rows[0];

            if (account) {

                if (account.suspended_at) {
                    return res.status(403).json({
                        message: "This account has been suspended. Contact support."
                    });
                }

                req.user.role = account.role;
            }

        } catch (lookupError) {
            console.error("Auth account lookup failed, using token claims:", lookupError.message);
        }


        next();


    } catch(error){

        return res.status(401).json({
            message:"Invalid or expired token"
        });

    }

};


// Verifies the JWT cookie if present and attaches req.user, but never
// blocks the request — lets both guests and logged-in users hit a route.
export const attachUserIfPresent = (req, res, next) => {

    const token = req.cookies.token;

    if (!token) {
        return next();
    }

    try {

        req.user = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

    } catch (error) {
        // Invalid/expired token: proceed as a guest rather than failing.
    }

    next();

};


export const authorizeAdmin=(req,res,next)=>{

 if(req.user.role!=="admin")
 {
    return res.status(403).json({
       message:"Forbidden"
    });
 }

 next();
}


// Content moderation + support tier. An admin is always also a moderator.
// Extend the platform by minting `role = 'moderator'` accounts (via the
// admin Users screen) — they reach every route mounted behind this guard
// but nothing behind authorizeAdmin (payments, user roles, listings).
export const authorizeModerator = (req, res, next) => {

    if (req.user.role !== "admin" && req.user.role !== "moderator") {
        return res.status(403).json({
            message: "Forbidden"
        });
    }

    next();
};