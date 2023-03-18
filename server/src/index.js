
const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const { default: mongoose } = require('mongoose');
const app = express();

app.use(bodyParser.json());

mongoose.connect("mongodb+srv://sagar:NR489Xvqr9MVCuEZ@cluster0.qks1ndl.mongodb.net/group5Database", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route);

app.use(function(req,res){
    res.status(400).send({status:false,msg:"route is not valid"})
})

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});