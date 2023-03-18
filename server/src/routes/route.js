const express = require('express');
const router = express.Router();
const Urlcontroller=require('../Controllers/UrlController.js')


router.get('/test-me', function (req, res) {
    res.send('My second ever api!')
});

router.post('/url/shorten',Urlcontroller.Shorturl)
router.get('/:urlCode',Urlcontroller.Geturl)


module.exports = router