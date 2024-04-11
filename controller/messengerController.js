const User = require('../models/authModel');
const messageModel = require('../models/messageModel');
const sharp = require('sharp');
const crypto = require('crypto');
const axios = require('axios')
const { uploadFile, deleteFile, getObjectSignedUrl } = require('../s3.js');

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

function newLock() {
     var unlock, lock = new Promise((res, rej) => { unlock = res; });
     return [lock, unlock];
}

const getImage = async (id) => {
     const res = await axios.get(`https://looplink-chat-backend.onrender.com/api/messenger/?imageid=${id}`);
     return res.data.imageURL;
}

const getLastMessage = async (myId, fdId) => {
     const msg = await messageModel.findOne({
          $or: [{
               $and: [{
                    senderId: {
                         $eq: myId
                    }
               }, {
                    reseverId: {
                         $eq: fdId
                    }
               }]
          }, {
               $and: [{
                    senderId: {
                         $eq: fdId
                    }
               }, {
                    reseverId: {
                         $eq: myId
                    }
               }]
          }]

     }).sort({
          updatedAt: -1
     });

     // console.log(msg)
     return msg;
}

module.exports.getFriends = async (req, res) => {
     const myId = req.query.myId;
     // console.log("myid = ",myId)
     let fnd_msg = [];
     try {
          const friendGet = await User.find({
               id: {
                    $ne: myId
               }
          });
          for (let i = 0; i < friendGet.length; i++) {
               let lmsg = await getLastMessage(myId, friendGet[i].id);
               fnd_msg = [...fnd_msg, {
                    fndInfo: friendGet[i],
                    msgInfo: lmsg
               }]

          }

          res.status(200).json({ success: true, friends: fnd_msg })

     } catch (error) {
          res.status(500).json({
               error: {
                    errorMessage: 'Internal Sever Error'
               }
          })
     }
}

module.exports.messageUploadDB = async (req, res) => {

     const {
          senderName,
          reseverId,
          message,
          senderId
     } = req.body

     try {
          const insertMessage = await messageModel.create({
               senderId: senderId,
               senderName: senderName,
               reseverId: reseverId,
               message: {
                    text: message,
                    image: ''
               }
          })
          res.status(201).json({
               success: true,
               message: insertMessage
          })

     } catch (error) {
          res.status(500).json({
               error: {
                    errorMessage: 'Internal Sever Error'
               }
          })
     }


}
module.exports.messageGet = async (req, res) => {
     const myId = req.query.myId;
     const fdId = req.query.fdId;

     try {
          let getAllMessage = await messageModel.find({

               $or: [{
                    $and: [{
                         senderId: {
                              $eq: myId
                         }
                    }, {
                         reseverId: {
                              $eq: fdId
                         }
                    }]
               }, {
                    $and: [{
                         senderId: {
                              $eq: fdId
                         }
                    }, {
                         reseverId: {
                              $eq: myId
                         }
                    }]
               }]
          })

          // getAllMessage = getAllMessage.filter(m=>m.senderId === myId && m.reseverId === fdId || m.reseverId ===  myId && m.senderId === fdId );

          // console.log(getAllMessage)



          await Promise.all(getAllMessage.map(async (m) => {
               if (m.message.image) {
                    const url = await getImage(m.message.image)
                    m.message.image = url
                    // console.log(m.message.image)
               }
          }))

          res.status(200).json({
               success: true,
               message: getAllMessage
          })

     } catch (error) {
          res.status(500).json({
               error: {
                    errorMessage: 'Internal Server error'
               }
          })

     }

}


module.exports.ImageMessageSend = async (req, res) => {

     const {
          senderName,
          senderId,
          reseverId,
     } = req.body;

     const image = req.file;

     const imageName = generateFileName()

     const fileBuffer = await sharp(image.buffer)
          .resize({ height: 1920, width: 1080, fit: "contain" })
          .toBuffer();



     await uploadFile(fileBuffer, imageName, image.mimetype)
          .then(async () => {
               const insertMessage = await messageModel.create({
                    senderId: senderId,
                    senderName: senderName,
                    reseverId: reseverId,
                    message: {
                         text: '',
                         image: imageName

                    }
               })

               // await Promise.all(async () => {
                    console.log(insertMessage)
                    const url = await getImage(insertMessage.message.image)
                    insertMessage.message.image = url
               // })


               res.status(201).json({
                    success: true,
                    message: insertMessage
               })
          })
          .catch(err => {
               res.status(500).json({
                    error: {
                         errorMessage: err
                    }
               })
          })


}

module.exports.messageSeen = async (req, res) => {
     const messageId = req.body._id;

     await messageModel.findByIdAndUpdate(messageId, {
          status: 'seen'
     })
          .then(() => {
               res.status(200).json({
                    success: true
               })
          }).catch(() => {
               res.status(500).json({
                    error: {
                         errorMessage: 'Internal Server Error'
                    }
               })
          })
}


module.exports.delivaredMessage = async (req, res) => {
     const messageId = req.body._id;

     await messageModel.findByIdAndUpdate(messageId, {
          status: 'delivared'
     })
          .then(() => {
               res.status(200).json({
                    success: true
               })
          }).catch(() => {
               res.status(500).json({
                    error: {
                         errorMessage: 'Internal Server Error'
                    }
               })
          })
}