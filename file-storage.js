
var url = require('url');
var gcloud = require('google-cloud');

var request = require('request');
var fs = require('fs');
var async = require('async')
var await = require('await')



  var datastore = gcloud.datastore({
    projectId: 'magicstore',
    keyFilename: './serviceacc.json'
  });

  const storage = gcloud.storage({
    projectId: 'magicstore',
    keyFilename: './serviceacc.json'
  });

  var bucket = storage.bucket('magic-file-store');

  

  function getAllFiles(callback) {
  var query = datastore.createQuery(['File']);
  datastore.runQuery(query, (error, files) => callback(error, files, datastore.KEY));  
  }

  function getUserFiles(userId, callback) {
      var query = datastore.createQuery(['File']).filter('userId', '=', userId);
  datastore.runQuery(query, (err, files) => callback(err, files, datastore.KEY));
  }

  function addFile(fileName, fileSize, uploadedFile, userId, fileId, callback) {
  if (uploadedFile) {
      uploadFile(uploadedFile, fileName, fileId, function(err, fileUrl) {                  
      if (err) return callback(err);                                            
      var entity = {
      key: datastore.key('File'),
      data: {
      fileName: fileName,
      fileSize: fileSize,
      fileUrl: fileUrl,
      fileId: fileId
    }
  };
    if (userId)
    entity.data.userId = userId;

  datastore.save(entity, callback)                                        
    });  
  }                                                           



  }

  function deleteFile(fileId, callback) {
  var key = datastore.key(['File', parseInt(fileId, 10)]);
  datastore.get(key, function(err, file) {
    if (err) return callback(err);

    if (file.fileUrl) {
      console.log('File Url is ' +file.fileUrl)
      var file = bucket.file(file.fileId);
      file.delete(function(err) {
        if (err) return callback(err);
        datastore.delete(key, callback);
      });
    } else {
      datastore.delete(key, callback);
    }
  });
}

  function downloadFile(fileId, callback) {
  var key = datastore.key(['File', parseInt(fileId, 30)]);
  const query = datastore.createQuery('File').filter('fileId', '=', fileId);
  datastore
  .runQuery(query)
  .then(results => {
     console.log(results[0][0].fileUrl)
     callback(null, results[0][0].fileUrl, results[0][0].fileName, results[0][0].fileId, results[0][0].userId)
   })
     .catch(err => callback(err, null, null, null, null))

}

   function downloadFileFromCloud(fileId, fileName, callback) {
            console.log('Downloading File');
            var fileCont = bucket.file(fileId).createReadStream();
            var  fileBuffer = '';
            fileCont.on('data', function(contents) {
              fileBuffer += contents;
            }).on('end', function() {
              console.log("File Download Complete");
              callback(fileBuffer)
            });  


 }




  


function uploadFile(uploadedFile, filename,fileId, callback) {
  var file = bucket.file(fileId);
  var fileUrl = 'https://storage.cloud.google.com/magic-file-store/'+fileId
  var stream = file.createWriteStream();
  stream.on('error', callback);
  stream.on('finish', function() {
    // Set this file to be publicly readable
    file.makePublic(function(err) {
      if (err) return callback(err);
      callback(null, fileUrl);
    });
  });
  stream.end(uploadedFile);
}

    exports.downloadFile = downloadFile;
    exports.downloadFileFromCloud =downloadFileFromCloud;
    exports.getAllFiles= getAllFiles;
    exports.getUserFiles= getUserFiles;
    exports.addFile= addFile;
    exports.deleteFile = deleteFile;

  

