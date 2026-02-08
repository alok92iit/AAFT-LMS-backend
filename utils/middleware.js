


export const AdminAccess=async (req,res,next)=>{
    if (req.user.role != "OWNER") res.status(403).json({ msg: "Permission denied" })
    else{ return next()}
}