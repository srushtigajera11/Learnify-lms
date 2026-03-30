module.exports.isAdmin = (req, res, next) => {

  if(req.user.role === "admin" || req.user.isAdmin){
     return next()
  }

  return res.status(403).json({
     message: "Admin access denied"
  })

};