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


export const authorizeAdmin=(req,res,next)=>{

 if(req.user.role!=="admin")
 {
    return res.status(403).json({
       message:"Forbidden"
    });
 }

 next();
}