var request = require('request');
var _ = require('underscore');
var express = require("express");

var bodyParser = require("body-parser");

var app = express();

app.use(bodyParser.json());

var _response = {};

// define the home page route, running index.html when server runs
app.post('/api/luis', function (req, res, next) {
    try{
        var message = req.body.Message;
        var luisEndPoint = "https://api.projectoxford.ai/luis/v2.0/apps/9e8003f2-e927-4051-b18c-d4ad1ad0a807?subscription-key=c45dc99ded6c4789b9d5264218fc4c5a&verbose=true&q=" + message;
        request(luisEndPoint, function (error, response, resBody) {
            if (error) {
                res.send("Error" + error);
            }
            else {
                var body = JSON.parse(resBody);
                _response.Query = body.query;
                if (body.entities.length > 0 && body.topScoringIntent.intent != "None") {
                    _response.Intent = body.topScoringIntent.intent;
                    _response.Entities = body.entities;
                    _response.Success = true;
                    _response.Message = "Match Found";
                }
                else {
                    _response.Intent = {};                    
                    _response.Entities = [];
                    _response.Success = false;
                    _response.Message = "Match not Found";
                }                   
                res.send(_response);
            }
        });
    }
    catch (e) {
        res.send("Error" + e);
    }   
});

//Setting up server
var server = app.listen(process.env.PORT || 4000, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});


