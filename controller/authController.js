const formidable = require('formidable');
const validator = require('validator');
const registerModel = require('../models/authModel');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const console = require('console');
const { uploadFile, deleteFile, getObjectSignedUrl } = require('../s3.js');
const sharp = require('sharp');
const crypto = require('crypto');
const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

function newLock() {
     var unlock, lock = new Promise((res, rej) => { unlock = res; });
     return [lock, unlock];
}

module.exports.userRegister = async (req, res) => {

     console.log(req.body)
     // console.log(req.file)

     const {
          userName, email, password, image,id
     } = req.body;


     const error = [];

     if (!userName) {
          error.push('Please provide your user name');
     }
     if (!email) {
          error.push('Please provide your Email');
     }
     if (email && !validator.isEmail(email)) {
          error.push('Please provide your Valid Email');
     }
     if (!password) {
          error.push('Please provide your Password');
     }
     if (error.length > 0) {
          res.status(400).json({
               error: {
                    errorMessage: error
               }
          })
     } else {

          const checkUser = await registerModel.findOne({
               email: email
          });

          console.log(checkUser)

          if (checkUser) {
               res.status(404).json({
                    error: {
                         errorMessage: ['Your email already exited']
                    }
               })
          } else {
               try {
                    var userCreate
                    await registerModel.create({
                         userName,
                         email,
                         password: await bcrypt.hash(password, 10),
                         image,
                         id
                    }).then((res)=>{
                         console.log("hello",res)
                         userCreate = res

                    }).catch(err=>console.log(err));

                    console.log(userCreate);

                    const token = jwt.sign({
                         id: userCreate.id,
                         email: userCreate.email,
                         userName: userCreate.userName,
                         image: userCreate.image,
                         registerTime: userCreate.createdAt
                    }, process.env.SECRET, {
                         expiresIn: process.env.TOKEN_EXP
                    });

                    console.log("Hi");
                    // var options;
                    const options = { expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000) }


                    res.status(201).cookie('authToken',token,options).json({
                         successMessage: 'Your Registeration is Successful',token
                    })



               } catch (error) {
                    res.status(500).json({
                         error: {
                              errorMessage: ['Internal Server Error']
                         }
                    })

               }


          }

          // }) // end Formidable  


     }
}

module.exports.userLogin = async (req, res) => {
     const error = [];
     const { email, password } = req.body;
     if (!email) {
          error.push('Please provide your Email');
     }
     if (!password) {
          error.push('Please provide your Passowrd');
     }
     if (email && !validator.isEmail(email)) {
          error.push('Please provide your Valid Email');
     }
     if (error.length > 0) {
          res.status(400).json({
               error: {
                    errorMessage: error
               }
          })
     } else {

          try {
               const checkUser = await registerModel.findOne({
                    email: email
               }).select('+password');

               if (checkUser) {
                    const matchPassword = await bcrypt.compare(password, checkUser.password);

                    if (matchPassword) {
                         const token = jwt.sign({
                              id: checkUser._id,
                              email: checkUser.email,
                              userName: checkUser.userName,
                              image: checkUser.image,
                              registerTime: checkUser.createdAt
                         }, process.env.SECRET, {
                              expiresIn: process.env.TOKEN_EXP
                         });
                         const options = { expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000) }

                         res.status(200).cookie('authToken', token, options).json({
                              successMessage: 'Your Login Successful', token
                         })

                    } else {
                         res.status(400).json({
                              error: {
                                   errorMessage: ['Your Password not Valid']
                              }
                         })
                    }
               } else {
                    res.status(400).json({
                         error: {
                              errorMessage: ['Your Email Not Found']
                         }
                    })
               }


          } catch {
               res.status(404).json({
                    error: {
                         errorMessage: ['Internal Sever Error']
                    }
               })

          }
     }

}

module.exports.userLogout = (req, res) => {
     res.status(200).cookie('authToken', '').json({
          success: true
     })
}

module.exports.getSingleImage = async (req, res) => {
     // console.log("hello ", req.query.imageid);
     // const image = await Images.find({ image: req.params.id });
     // if (image.length === 0) {
     //   res.status(404).json({ message: "File not found!" });
     // }

     // else {

     //   console.log(image);
     imageUrl = await getObjectSignedUrl(req.query.imageid);
     // console.log(imageUrl)
     if (imageUrl.length === 0) {
          res.status(404).json({ message: "File not found!" });
     }
     else
          res.status(200).json({ imageURL: imageUrl })
     // }
}