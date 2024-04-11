const router = require('express').Router();

const {userRegister,userLogin,userLogout,getSingleImage} = require('../controller/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post('/user-login',userLogin);
router.post('/user-register',upload.single('image'),userRegister);
router.post('/user-logout',authMiddleware,userLogout);
router.get('/', getSingleImage)
module.exports = router;