var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').__express);
app.set('view engine', 'html');


app.get('/', function (req, res) {
   res.render('Ex2');  
})
app.post('/country_get',function(req,res){
    var selectedCountry= {
                            India: ["Delhi" , "Mumbai","Hyderabad","Pune" ], 
                            USA: ["California", "LA","Texas","Arizona","New York"],
                            UK: ["Manchester","London","Liverpool","Glasglow"]
                         };
     var country=req.body.country;
     res.send(selectedCountry[country]);
});

app.post('/process_post', function (req, res) {
   // Prepare output in JSON form
var data = {
      first_name:req.body.first,
      last_name:req.body.last,
      country:req.body.country,
      city:req.body.city,
      male:req.body.male,
      female:req.body.female,
      email:req.body.name,
      password:req.body.pass,
      re_password:req.body.rpwd
   };

var responseMap = {
         "statusCode" : 200,
         "message" : " Message OK",
          "data" : data
      };


console.log("WORKING");
   var reForEmail = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
   var reForPassword=/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
   var email= req.body.name;
   var pwd = req.body.pass;
   var rpwd= req.body.rpwd;
 
        if(email.match(reForEmail)){
         if(pwd.match(reForPassword)){
           if(pwd==rpwd)
           {
               console.log("valid");
                //res.render('login');
               console.log( "Recieved the Data");
               console.log('Redirecting..')
           }  
           else
           {
            res.status(403).send(" password not matching");
            console.log("password not matching");
           }  

         }
         else{
            res.status(404).send("invalid password");
             console.log( "invalid password");
         }
        }
        else{
          res.status(404).send("invalid email");
           console.log( "invalid emails");

        }

   })

var server = app.listen(8086, function () {
var host = server.address().address
var port = server.address().port
console.log("Example app listening at http://%s:%s", host, port)

})