var request = require('request');
var _ = require('underscore');
var express = require("express");
var builder = require('botbuilder');
var bodyParser = require("body-parser");

var app = express();

app.use(bodyParser.json());

var _response = {};

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
    //appId: 'c9ffe203-7782-4a66-bf6b-7512600ad12c',
    //appPassword: 'ar6iifY3jEQq8MqOm8G2O2Y'
});

var bot = new builder.UniversalBot(connector);

app.post('/api/messages', connector.listen());


//api for getting data from LUIS server
app.post('/api/luis', function (req, res, next) {
    try {
        _response = {};
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
        _response.Message = "Exception Occurred";
        _response.Success = false;
        _response.Exception = e.message;
        console.log("Exception : " + JSON.stringify(e) + "for request data :-" + JSON.stringify(req.body));
        res.send(_response);
    }   
});

//Setting up server
var server = app.listen(process.env.PORT || 4000, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});


var recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v2.0/apps/9e8003f2-e927-4051-b18c-d4ad1ad0a807?subscription-key=c45dc99ded6c4789b9d5264218fc4c5a&verbose=true');
var intents = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', intents);

intents.onBegin(function (session, args, next) {
    //session.dialogData.name = args.name;
    //session.send("Hi %s...", args.name);
    next();
});

intents.onDefault(builder.DialogAction.send("I'm sorry. I didn't understand."));
var response = {};
intents.matches('find city name', [
    function (session, args, next) {
        response.city = builder.EntityRecognizer.findEntity(args.entities, 'city');
        //if (!task) {
        //    builder.Prompts.text(session, "What would you like to call the task?");
        //} else {
        //    next({ response: task.entity });
        //}
        next();
    },
    function (session, results) {
        if (response) {
            // ... save task
            session.send("I found City as : %s",response.city.entity);
        } else {
            session.send("Please input valid inputs ");
            session.beginDialog('/'); 
        }
    }
]);


intents.matches('book_meetingroom', [
    function (session, args, next) {
        response.meetingRoom = builder.EntityRecognizer.findEntity(args.entities, 'meetingroom');
        response.city = (builder.EntityRecognizer.findEntity(args.entities, 'city')) ? (builder.EntityRecognizer.findEntity(args.entities, 'city')) :  builder.EntityRecognizer.findEntity(args.entities, 'builtin.geography.city');
        //response.dateTime = builder.EntityRecognizer.findEntity(args.entities, 'datetime');
        next();
    },
    function (session, results) {
        if (response) {
            // ... save task
            session.send("I found Room as : %s & City as : %s", response.meetingRoom.entity, response.city.entity);
        } else {
            session.send("Please input valid inputs ");
            session.beginDialog('/');
        }
    }
]);

intents.matches('Get Weather : Enter Location', [
    function (session, args, next) {
        //response.meetingRoom = builder.EntityRecognizer.findEntity(args.entities, 'meetingroom');
        //response.city = builder.EntityRecognizer.findEntity(args.entities, 'city');
        //response.dateTime = builder.EntityRecognizer.findEntity(args.entities, 'datetime');
        next();
    },
    function (session, results) {
        //if (response) {
        //    // ... save task
        //    session.send("I found Room as : %s & City as : %s", response.meetingRoom.entity, response.city.entity);
        //} else {
        //    session.send("Please input valid inputs ");
        //    session.beginDialog('/');
        //}
        //session.endDialog();
    }
]);

