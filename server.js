
'use strict'
var mime = require('mime-types')
var files = require('./file-storage');
var auth = require('./user-authentication');
var express = require('express');
var multer = require('multer')
var session = require('cookie-session');
var app = express();
app.use(express.static('public'));
app.set('view engine', 'jade');
app.use(multer({ inMemory: true }));
app.use(session({ signed: true, secret: '[cookie signing key]' }));
const axios = require('axios')
const https = require('https');
const http = require('http');
var request = require('request');
const fs = require('fs');
const Path = require('path')  


app.get('/heartbeat', function(req, res) {
  res.status(200).jsonp({success:true, message:'Health Check Successful'});
});

app.get('/allFiles', function(req, res, next) {
      if(req.query.userId){
        files.getUserFiles(req.query.userId, function(err, files, key) {
        if (err) return next(err);
          var userfiles = files.map((file) => Object.assign(file, { id: file.id || file[key].id }))
          console.log('files.length-'+userfiles.length)
          if(!userfiles.length > 0){
            res.status(404).send({message:'No files found found for this user'});
          }
          else{
            res.status(200).send(userfiles);
          }
          
      })
      }
      else{
        files.getAllFiles(function(err, files, key) {
        if (err) return next(err);
         var allfiles = files.map((file) => Object.assign(file, { id: file.id || file[key].id }));
          if(!allfiles.length > 0){
            res.status(404).send({message:'No files found'});
          }
          else{
            res.status(200).send(allfiles);
          }
         
      });
    }
});


app.post('/download', function(req, res, next) {
  if (! req.body.filename){
     return  res.jsonp({ error: true , errorMessage: 'File Unique Identifier required to download file'})
  }

      var filename = req.body.filename;
      var userIdentifier = req.query.userId;
      res.redirect('/download/files/'+filename+'?userId='+userIdentifier);


  
});

app.get('/download/files/:filename', function(req, res, next) {

var queryUserId = req.query.userId;
  if(!req.query.userId){
      return  res.status(401).jsonp({ error: true , errorMessage: 'User ID not found. Please login to download file'})
  }   
  files.downloadFile(req.params.filename, function(err, fileUrl, fileName, fileId, fileUserId){

    var fileUSer = fileUserId;
    if(!fileId){
      return  res.status(404).jsonp({ error: true , errorMessage: 'File does not exists. Please check File Identifier'})
    }
    if(queryUserId != fileUserId){
      return  res.status(401).jsonp({ error: true , errorMessage: 'User cannot download file. User can download only self uploaded files or token might be expired. Please login again'})
    }

      files.downloadFileFromCloud(fileId, fileName, function(data){
             res.set({
            'Content-Disposition': 'attachment; filename='+fileName,

            'Content-Type': mime.contentType(fileName)

           });
           res.writeHead(200);
           res.write(data);
           res.end();
     })
      
    
     
  });
});

app.get('/login', function(req, res) {
  var authenticationUrl = auth.getAuthenticationUrl();
  res.redirect(authenticationUrl);
});

app.get('/authfromoauth2', function(req, res, next) {
  auth.getUser(req.query.code, function(err, user) {
    if (err) return next(err);
    req.session.user = user;
    res.redirect('/');
  }); 
});

app.get('/logout', function(req, res) {
  req.session = null;
  res.redirect('/');
});



app.post('/upload/file', function(req, res, next) {
  if (! req.files['inputFile'])
    return  res.status(400).jsonp({ error: true , errorMessage: 'File not selected. Please select the file'})

  var uploadedFile;
  var fileSize;
  var filename;
  var fileId;
  if (req.files['inputFile']){
        uploadedFile = req.files['inputFile'].buffer;
        fileSize = bytesToSize(req.files['inputFile'].size)
        filename = req.files['inputFile'].originalname
        fileId = new Date().getTime() +'-'+ Math.random();
  }


  var userId;
  if (req.session.user)
    userId = req.session.user.id;

  files.addFile(filename, fileSize, uploadedFile, userId,fileId, function(err) {
    if (err) return next(err);
    res.status(201).jsonp({success: true, message: filename +' successfully uploaded', fileIdentifier: fileId})
  })
});




app.get('/files/delete', function(req, res, next) {
  files.deleteFile(req.query.id, function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
});

function bytesToSize(bytes) {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Byte';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};




app.get('/', function(req, res, next) {
  files.getAllFiles(function(err, files, key) {
    if (err) return next(err);
    var keyfiles = files.map((file) => Object.assign(file, { id: file.id || file[key].id }));
    res.render('index', { files: keyfiles, user: req.session.user });
  });
});

app.get('/userFiles', function(req, res, next) {
  if (! req.session.user) return res.redirect('/');
  files.getUserFiles(req.session.user.id, function(err, files, key) {
    if (err) return next(err);
    var keyfiles = files.map((file) => Object.assign(file, { id: file.id || file[key].id }));
    res.render('index', { files: keyfiles, user: req.session.user });
  });
});



app.listen(8080);

console.log('Running app on  http://localhost:8080/');
