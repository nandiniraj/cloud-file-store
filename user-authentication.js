


   var {google} = require('googleapis');

   var clientId = '912144925106-gvmq835o67mb06ssuku4q9kh3pl9r9em.apps.googleusercontent.com';
   var clientSecret = 'SzfkPEGchJPQz0nFZYz7qBQq';
   var redirectUrl = 'https://magicstore.appspot.com/authfromoauth2';

function getAuthenticationUrl() {
  var client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUrl
  );  
  return client.generateAuthUrl({ scope: ['profile'] }); 
}

 function getUser(authorizationCode, callback) {
  var client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUrl
  );  
  client.getToken(authorizationCode, function(err, tokens) {
    if (err) return callback(err);
    client.setCredentials(tokens);
    google.plus('v1').people.get({ userId: 'me', auth: client }, function(err, profile) {
      if (err) return callback(err);
      var user = { 
        id: profile.data.id,
        name: profile.data.displayName,
        imageUrl: profile.data.image.url
      };  
      callback(null, user);
    }); 
  }); 
}


    exports.getAuthenticationUrl = getAuthenticationUrl;
    exports.getUser =getUser;
