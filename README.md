
TABLE OF CONTENTS 


1.	APPLICATION DESIGN 
a.	Working 
2.	WEB SERVICES 
a.	Upload file endpoint
b.	Download file endpoint
c.	List All Files and List All Files By User endpoints
3.	DESIGN SPECIFICATIONS
4.	IMPROVEMENTS













APPLICATION DESIGN

This application can be used as file store to view list of files, upload and download files. User can view all files in file store and user has to login to upload/download/delete files. 

Working : 

I have provided a browser based mechanism to file store. 
The home page of application is hosted in https://magicstore.appspot.com.  In home/landing page, user can view all files. Here is a screenshot of home page.

 
User has to login to upload/download/delete files. 


After login view 

 



Upload : From Browser, file has to selected and then click on Upload. Unique file identifier is generated and returned in response. If user clicks on upload, without selecting a file, error message is returned. 


Download : From Browser, file can be downloaded by File Unique Identifier. File is downloaded as an attachment. If user clicks on Download File button, without providing File Unique ID, error message is returned. 

AllFiles : Click on AllFiles to view all files present in data store. 

MyFiles: Click on MyFiles to view files specific to the logged in user. 

To filter files by user, I have an endpoint which queries Google Data Store for files by a specific user and renders response back to browser. 



WEBSERVICES

I have added swagger.yaml  in github repository for below webservices specifications. 

swagger.yaml – Defines request and response specifications of endpoints.

1.	UPLOAD ENDPOINT 

POST : https://magicstore.appspot.com/upload/file

Request : File has to be uploaded as form-param. Key of the form-param is inputFile. And file has to be selected. 

This endpoint can be tested from Postman.

Here is the screen shot for request and response format. 

 


Response : On successful file upload, unique file identifier is returned. This can be used to download files. 

Edge Case :

When the file is not selected, 400 Bad Request is returned. 


 


2.	DOWNLOAD FILE ENDPOINT 

GET : https://magicstore.appspot.com/download/files/{filename}?userId={userId}

Sample endpoint : https://magicstore.appspot.com/download/files/1562703378604-0.9203580344498954?userId=100901310530987033575


Request : This request can be downloaded from browser and from Postman.  

Response : When the request is passed through browser, file is downloaded as an attachment. From Postman, contents of the file is displayed in body. 


Here is the screen shot for request and response format from Postman.

 



Edge Cases :



1.	When User ID query parameter is not passed in request, HTTP 401 UnAuthorized status is returned.

 



2.	When invalid file identifier is passed in request, HTTP 404 NOT FOUND is returned.


 


3.	When the user is attempting to download the file uploaded by other users. Download operation is not permitted.
 

3.	LIST ALL FILES ENDPOINT 

a.	POST : https://magicstore.appspot.com/allFiles

This endpoint lists all files along with file attributes(file size, file name, url where file is stored, user id of the user who uploaded file) present in the file store.

	Response format : 
 



b.	POST : https://magicstore.appspot.com/allFiles?userId={userIdentifier}


Sample endpoint : https://magicstore.appspot.com/allFiles?userId=100901310530987033575

This endpoint lists all files along with file attributes(file size, file name, url where file is stored, user id of the user who uploaded file) present in the file store uploaded by given User ID.

	






Response format : 

	 




	Edge Case :  Invalid User ID(When there are no files associated with user) https://magicstore.appspot.com/allFiles?userId=1562703378604-0.9203580344498954





	Request :  Invalid User ID
	Response : HTTP 404 No files found for User.
 



DESIGN SPECIFICATIONS






Upload : 












Google Storage : Google Cloud Storage is a RESTful online file storage web service for storing and accessing data on Google Cloud Platform infrastructure.

Google DataStore : Google Cloud Datastore is a highly scalable, fully managed NoSQL database service offered by Google on the Google Cloud Platform. Cloud Datastore is built upon Google's Bigtable and Megastore technology.


Use Case : In this application, I am using Google Data Store as a Database which stores file attributes. And I have indexed all attributes. So that, it can be queried by any index. I have used Google Storage to store the files with unique id generated. Every file uploaded generates a unique ID, so files are stored by unique ID in cloud storage. 

When a file is uploaded, entity is created in datastore with file name, file size, user id and file is uploaded to cloud storage and url to access the file in cloud storage is stored in fileUrl property. 

Authentication and Authorization : I am using Google OAuth2.0 Api for user login and generating user token.

Application is configured to redirect to OAuth2.0 by calling Google+ API and redirect back to our API. This is a configuration in OAuth2.0ClientId set up.  These paramters are returned by Google+ people.get() API.


Field	Description
access_token	A token that can be sent to a Google API.
id_token	A JWT that contains identity information about the user that is digitally signed by Google.

expires_in	The remaining lifetime of the access token.
token_type	Identifies the type of token returned. At this time, this field always has the value Bearer.
refresh_token(optional)	This field is only present if access_type=offline is included in the authentication request. For details, see Refresh tokens.



Code Frame work Selection.

I code in Java most of the time. I decided to use node js with Express because of flexibility and  familiarity. 

And express also supports browser view rendering, which I have currently used to render a browser experience for file store.




IMPROVEMENTS : 

1.	Beautifying HTML.
2.	Adding routing back to Home Page after generating upload and download messages.
3.	Adding a separate login page.
4.	Adding logs to Logging tool. 


I was planning on using Google Logging Tools/ Elastic Search. But I had to finish this in a very less time because of my work commitments.  I will work on adding it later. 
