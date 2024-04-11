const router = require('express').Router();
const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const {getFriends,messageUploadDB,messageGet,ImageMessageSend,messageSeen,delivaredMessage} = require('../controller/messengerController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/get-friends', getFriends);
router.post('/send-message', messageUploadDB);
router.get('/get-message', messageGet);
router.post('/image-message-send',upload.single('image'), ImageMessageSend);

router.post('/seen-message', messageSeen);
router.post('/delivared-message', delivaredMessage);
 

module.exports = router;