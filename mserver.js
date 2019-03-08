var express = require('express');
var app = express();

var fs = require('fs');
var rimraf = require('rimraf');
var archiver = require('archiver');


var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').__express);
app.set('view engine', 'html');
function salesforceLogin(callback){
   conn.login('hanifa@tr.com','Testing1234!', function(err, userInfo) {
     callback(err,userInfo);
   });
}
function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = a[property].localeCompare(b[property]);
        return result * sortOrder;
    }
}

app.get('/', function (req, res) {
     res.render('list');  
});

//Connection
  var jsforce = require('jsforce');
  var conn = new jsforce.Connection({
  });


//LoadPAGES
app.get('/loadPages',function(req,res){
  console.log('GET Request Ror APEX PAGES');
  salesforceLogin(function(err, userInfo) {
    if (err) { return console.error(err); }
    conn.metadata.list([{type : 'ApexPage', folder : null}], '39.0', function(err, metadata) {
      if (err) { console.error(err); }
      metadata.sort(dynamicSort("fullName"));
      res.render('cl2',{fields : metadata,name : 'ApexPages'});
      console.log('Pages data loading');
    });
  });
});

//LoadClasses
app.get('/loadClasses',function(req,res){
  console.log('GET Request for APEX CLASSES');
  salesforceLogin(function(err, userInfo) {
    if (err) { return console.error(err); }
    conn.metadata.list([{type : 'ApexClass', folder : null}], '39.0', function(err, metadata) {
      if (err) { console.error(err); }
      metadata.sort(dynamicSort("fullName"));
      res.render('cl2',{fields : metadata,name : 'ApexClasses'});
      console.log('Classes data loading');
    });
  });
});

//LOADTRIGGERS
app.get('/loadTriggers',function(req,res){
  console.log('GET Request for APEX TRIGGERS');
  salesforceLogin(function(err, userInfo) {
    if (err) { return console.error(err); }
    conn.metadata.list([{type : 'ApexTrigger', folder : null}], '39.0', function(err, metadata) {
      if (err) { console.error(err); }
      metadata.sort(dynamicSort("fullName"));
      res.render('cl2',{fields : metadata,name : 'ApexTriggers'});
      console.log('Trigger data loading');
    });
  });
});

//generate ZIP FILE
app.post('/zipFileDownload',function(req,res){
  var pages=req.body["pages[]"];
  var classes=req.body["classes[]"];
  var triggers=req.body["triggers[]"];
  //creating the main directory folder
  fs.mkdir("Folder",function(err){
    //creating the sub directories
    fs.mkdir(__dirname+"/Folder/"+"Pages",function(err){
      if(err){ return console.error(err)}
    });
    fs.mkdir(__dirname+"/Folder/"+"Classes",function(err){
      if(err){ return console.error(err)}
    });
    fs.mkdir(__dirname+"/Folder/"+"Triggers",function(err){
      if(err){ return console.error(err)}
    });
    salesforceLogin(function(err, userInfo) {
    	conn.sobject("ApexPage").select('id,Name,Markup').where({Name : pages})
      	.execute(function(err, records1) {
        	if (err) { console.error(err); }
	        for(var i=0;i<records1.length;i++){  
	          var PfileName=records1[i].Name+'.vf';
	          fs.writeFile(__dirname+"/"+"Folder"+"/"+"Pages"+"/"+PfileName,records1[i].Markup,function(err){
              if(err){ return console.error(err)}
            });
	        }
	        conn.sobject("ApexClass").select('id,Name,Body').where({Name :classes })
	          .execute(function(err, records2) {
	            if (err) { console.error(err); }
	            for(var j=0;j<records2.length;j++){  
	              var fileName=records2[j].Name+'.cls';
	              fs.writeFile(__dirname+"/"+"Folder"+"/"+"Classes"+"/"+fileName,records2[j].Body,function(err){
                  if(err){ return console.error(err)}
                });
	            }
	            conn.sobject("ApexTrigger").select('id,Name,Body').where({Name : triggers})
	              .execute(function(err, records3) {
	            		if (err) { console.error(err); }
	            		for(var k=0;k<records3.length;k++){  
			                var TfileName=records3[k].Name+'.cls';
			                fs.writeFile(__dirname+"/"+"Folder"+"/"+"Triggers"+"/"+TfileName,records3[k].Body,function(err){
                        if(err){ return console.error(err)}
                      });
	            		}
                  var archive = archiver.create('zip',{});
  						    var output = fs.createWriteStream(__dirname + '/'+'Folder'+'.zip');
  						    console.log('Creating Folder.zip file');
  						    archive.pipe(output);
              		archive.directory(__dirname+"/Folder/Pages","Pages");
              		archive.directory(__dirname+"/Folder/Classes","Classes");
              		archive.directory(__dirname+"/Folder/Triggers","Triggers");
              		archive.finalize();
              		output.on("close",function(){
              			res.send("File Created...");
              		});
	          	});
        	});
    	});
  	});
});
});
app.get("/zip",function(req,res){
  res.download(__dirname+'/Folder.zip');
  rimraf(__dirname + '/Folder', function (){
      console.log('Folder Deleted');
  });
  rimraf(__dirname + '/Folder.zip', function (){
      console.log('ZIP Deleted');
  });
});
var server = app.listen(8087, function(){
	var host = server.address().address
	var port = server.address().port
	console.log("Example app listening at http://%s:%s", host, port)
}); 