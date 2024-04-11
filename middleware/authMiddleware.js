const jwt = require('jsonwebtoken');

module.exports.authMiddleware = async(req,res,next) => {
     const authToken = req.body.authToken;
     console.log(req.body)
     // console.log(req.body.authToken)
     // console.log(req.cookies)
     // console.log(authToken)
     if(authToken){
          console.log("inside authtoken middleware")
          const deCodeToken = await jwt.verify(authToken,process.env.SECRET);
          req.myId = deCodeToken.id;
          next();
     }else{

          console.log("plz login")

          res.status(400).json({
               error:{
                    errorMessage: ['Please Loing First']
               }
          })
     } 
}