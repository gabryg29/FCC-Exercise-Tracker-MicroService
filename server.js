'use strict';

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const shortid = require('shortid');
const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true})

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});




// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})


  
// Test API EndPoint
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

//---------------------------------------------------------------------------
//FUNCIONALIDAD PRINCIPAL DEL PROGRAMA
//---------------------------------------------------------------------------
console.log("Que comience el programa");

//Creo mi modelo de base de datos
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
var userSchema = new Schema({ 
  username: {type: String, required: true},
  _id: {type: String, required : true},
  //exercises: {type: [exerciseSchema], required : true, default: []}
  exercises: {type: [{description:String, date:Date, duration:Number}], required : true, default: []}
});
var User = mongoose.model('User', userSchema);

//Método POST para crear nuevos usuarios
app.post("/api/exercise/new-user",(req, res) => {
  var username = req.body.username;
  User.findOne({ username:  username}, (req,response)=>{
    if(response!==null){res.send("Ese nombre de usuario ya está en la base de datos")}
    else{
      User.create({username:username, _id: shortid.generate()}, (err,data)=>{
         if(err){console.log(err);}
         else{
           User.findOne({username:  username},("username _id"), (req, response) =>{
             res.json({username: response.username, _id: response._id})
           });
         }
      });
    }
  });
});

//Método POST para añadir nuevos tracks de ejercicios
app.post("/api/exercise/add",(req, res) => {
  var userId = req.body.userId;
  var description = req.body.description;
  var duration = req.body.duration;
  var date = req.body.date;
  if(date==""){date = new Date();}
  var exercisePush = {description:description, date:date, duration:duration};
  User.findOneAndUpdate({ _id:  userId}, {$push: {exercises: exercisePush}},{new:true},(req,response)=>{
    if(response==null){res.send("El id introducido es incorrecto. Cree un usuario antes de asignarle ejercicios")}
    else{
      res.json({username:response.username,_id:response._id,description:description,duration:duration,date:date});
    }
  });
});

//Método GET para ver todos los usuarios que hay creados
app.get("/api/exercise/users", function (req, res) {
  User.find({}, function(err,data){
    if(err){console.log(err);}
    else{
      var finalJson = [];
      data.forEach(function(element) {
        finalJson.push({username:element.username,_id:element._id});
      });
      res.json(finalJson);
    }
  });  
});

//Método GET para ver la información que se solicita
//https://4-exercise-tracker-microservice.glitch.me/api/exercise/log?userId=JP_GRJKlb&from=1999-01-01&to=2020-12-12&limit=999
app.get("/api/exercise/log", function (req, res) {
  var userId=req.query.userId;
  var from=new Date(req.query.from) || "";
  var to=new Date(req.query.to) || "";
  var limit=req.query.limit || "";
  //console.log("From: "+from+" - To: "+to+" - Limit: "+limit);
  User.findOne({_id:userId}, function(err,data){
    if(err){console.log(err);}
    else{
      var finalCount=0;
      var finalArray=[];
      //Solo me quedo los que haya entre from y to hasta un maximo de limit
      data.exercises.forEach(function(element) {
        if((element.date.getTime()>from.getTime() || from=="") && (element.date.getTime()<to.getTime() || to=="") && (limit>0 || limit=="")){
          console.log("Inserto: "+limit);
          finalArray.push({description:element.description, duration:element.duration, date:element.date});
          finalCount++;
          if(limit!==""){limit--;}
        }
      });
      var finalJson={_id:userId, username:data.username, count:finalCount, log:finalArray};
      res.json(finalJson);
    }
  });    
});

//---------------------------------------------------------------------------

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


/*
app.post("/api/shorturl/new",(req, res) => {
  var urlGlobal = req.body.url;
  var urlPlana = urlGlobal.replace(/(^\w+:|^)\/\//, ""); //https://www.freecodecamp.com -> www.freecodecamp.com
  
  dns.lookup(urlPlana, (err, address, family) =>{
    if(err){
      console.log(err)
      res.json({error: "invalid URL"})
    }
    else{
      console.log("URL Correcta, procedemos a insertarla en la BBDD");
      //Busco en la BD el dato. Si está lo devuelvo. Si no está, lo creo y lo devuelvo
      URL.findOne({ url:  urlGlobal}, (req,response)=>{ //Busco algo que coincida con url, de eso me quedo los 3 parametros y saco función de error
        //----------------- IF TERNARIO --------------
        if(response!==null){
          res.json({url: response.url, URLnumbertuampa: response.number})
        }
        else{
          URL.create({url:  urlGlobal, number: incremental}, (err,data)=>{
            if(err){console.log(err);}
            else{
              URL.findOne({url:  urlGlobal},("number url"), (req, response) =>{
                incremental++;
                console.log("Insertada una nueva entrada: "+incremental);
                res.json({url: response.url, URLnumber: response.number})
              });
            }
          });
        }
      });   
    }
  });
});

//Si alguien escribe .../api/shorturl/X, tengo que redirigirlo a la web que haya puesto
app.get("/api/shorturl/:data", function (req, res) {
  URL.findOne({number : req.params.data}, function(err,data){
    //----------------- IF TERNARIO --------------
    err ? console.log(err)
      : data!==null ? res.redirect(data.url)
        : res.json({"error":"link not found"});
    //---------------------------------------------
  });  
});
*/