const express = require('express');
const router = express.Router();

router.get('/',function (req,res) {
    
    // res.render('index.hbs',{})
    res.sendfile('./public/templates/landing.html', {});

});


module.exports = router;
