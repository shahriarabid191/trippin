import jwt from "jsonwebtoken";


export const authenticateUser = (req, res, next) => {

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