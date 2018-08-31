/**
 * Module dependencies.
 */


 // Necessary Libs
var cfenv     = require('cfenv');

var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path'),
    fs = require('fs');

const requestAPI = require('request');
var app = express();

var db;

var cloudant;

var fileToUpload;

var dbCredentials = {
    dbName: 'newsdb'
};

 require('dotenv').load();

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var multipart = require('connect-multiparty')
var multipartMiddleware = multipart();
const DiscoveryV1 = require('watson-developer-cloud/discovery/v1');


var discovery = new DiscoveryV1({
  username: process.env.DISCOVERY_USERNAME,
  password: process.env.DISCOVERY_PASSWORD,
  url: 'https://gateway.watsonplatform.net/discovery/api/',
  version: "2018-03-05"
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/style', express.static(path.join(__dirname, '/views/style')));

// development only
if ('development' == app.get('env')) {
    app.use(errorHandler());
}

function getDBCredentialsUrl(jsonData) {
    var vcapServices = JSON.parse(jsonData);
    // Pattern match to find the first instance of a Cloudant service in
    // VCAP_SERVICES. If you know your service key, you can access the
    // service credentials directly by using the vcapServices object.
    for (var vcapService in vcapServices) {
        if (vcapService.match(/cloudant/i)) {
            return vcapServices[vcapService][0].credentials.url;
        }
    }
}


app.get('/', routes.index);

function createResponseData(id, sentense, attachments) {

    var responseData = {
        id: id,
        name: sentense,
        attachements: []
    };
    return responseData;
}

function sanitizeInput(str) {
    return String(str).replace(/&(?!amp;|lt;|gt;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}



app.get('/api/favorites', function(request, response) {

    console.log("Got the latest ")

    var docList = [];
    var i = 0;
    var foundLatest = false;

    discovery.query({
      environment_id: process.env.DISCOVERY_ENVIRONMENT_ID,
      configuration_id: process.env.DISCOVERY_CONFIGURATION_ID,
      collection_id: process.env.DISCOVERY_COLLECTION_ID,
      natural_language_query:  request.query.topic,
      passage: true,
      passages_count: 5
      },

      function(error, data) {
          if (error) {
            console.log('Discovery Error:', error);
          } else {
            console.log("data.passages:"+data.passages);
            data.passages.forEach(function(item, index) {
              console.log(item);
              var responsejson= {
                id:1,
                name:item.passage_text
              }
              docList.push(responsejson);
            });
            response.write(JSON.stringify(docList));
            console.log('ending response...');
            response.end();
         }
       });


  });

http.createServer(app).listen(app.get('port'), '0.0.0.0', function() {
    console.log('Express server listening on port ' + app.get('port'));
});
