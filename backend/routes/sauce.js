// on definie les routes 
const express = require('express');
const router = express.Router();

const sauceC = require('../controller/sauce');
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.get('/', auth, sauceC.liste);
router.get('/:id', auth, sauceC.singleSauce);
router.post('/', auth, multer, sauceC.created);
router.put('/:id', auth, multer, sauceC.update);
router.delete('/:id', auth, sauceC.delete);
router.post('/:id/like', auth, sauceC.liked);


module.exports = router;