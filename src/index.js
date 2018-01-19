'use strict';

var Alexa = require('alexa-sdk');
var https = require("https");
var VoiceLabs = require("voicelabs")("cc939ed0-e4cb-11a7-0599-02ddc10e4a8b");

const APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).

const handlers = {
    'LaunchRequest': function () {
        var speechText = getRandomWelcomeMessage() + getRandomWelcomeQuestion();
        VoiceLabs.track(this.event.session, "LaunchRequest", null, speechText, (error, response) => {
            this.response.speak(speechText).listen(getRandomWelcomeQuestion());
            this.emit(":responseReady");
          });
    },
    'SpeakerIntent': function () {
        var slotName = "speaker";
        if (isEntityResolutionMatch.call(this, slotName))
        {
            if (isExclusiveEntityResolutionMatch.call(this, slotName))
            {
                var speakerName = getSpeakerName.call(this);
                var speakerId = getSpeakerId.call(this);
                var speakerFirstName = "";
                var speakerBio = "";
                var speakerTwitter = "";

                httpsGet("/api/speakersdata/" + speakerId, (data) => {
                    console.log("SPEAKER DATA = " + JSON.stringify(data));
                    speakerFirstName = data.FirstName;
                    speakerBio = cleanSSML(data.Biography);
                    speakerTwitter = getSpeakerTwitter(data);

                    console.log("SPEAKER BIO = " + speakerBio);

                    var speechText = "The speaker you requested is " + speakerName  + ". " + speakerBio + " " + speakerFirstName + "'s on Twitter as " + speakerTwitter + ". " + getRandomQuestion();
                    VoiceLabs.track(this.event.session, this.event.request.intent.name, this.event.request.intent.slots, speechText, (error, response) => {
                        this.response.speak(speechText).listen(getRandomQuestion());
                        this.emit(":responseReady");
                      });
                });
            }
            else
            {
                //WE GOT MULTIPLE MATCHES, AND NEED TO DISAMBIGUATE.
                //DIDN'T GET A POSITIVE MATCH ON A SPEAKER NAME.
                var speechText = "I found several speakers that matched " + getSpokenSlot.call(this, "speaker") + ". Which of these did you want? " + getDisambiguationList.call(this, "speaker");
                VoiceLabs.track(this.event.session, this.event.request.intent.name, this.event.request.intent.slots, speechText, (error, response) => {
                    this.response.speak(speechText).listen("Which speaker did you want to know about?");
                    this.emit(":responseReady");
                });
            }
        }
        else
        {
            //DIDN'T GET A POSITIVE MATCH ON A SPEAKER NAME.
            var speechText = "I think you asked me about a speaker, but I didn't find a match.  Who did you want to know about?";
            VoiceLabs.track(this.event.session, this.event.request.intent.name, this.event.request.intent.slots, speechText, (error, response) => {
                this.response.speak(speechText).listen("Which speaker did you want to know about?");
                this.emit(":responseReady");
              });
            
        }
    },
    'SessionIntent': function () {
        var slotName = "session";
        if (isEntityResolutionMatch.call(this, slotName))
        {
            if (isExclusiveEntityResolutionMatch.call(this, slotName))
            {
                var sessionName = cleanSSML(getSessionName.call(this));
                var sessionId = getSessionId.call(this);
                var sessionRoom = "";
                var sessionDay = "";
                var sessionTime = "";
                var sessionAbstract = "";
                var sessionSpeaker = "";

                httpsGet("/api/sessionsdata/" + sessionId, (data) => {
                    console.log("SESSION DATA = " + JSON.stringify(data));
                    sessionRoom = getSessionRoom(data);
                    sessionDay = getSessionDayOfWeek(data);
                    sessionTime = getSessionTime(data);
                    sessionAbstract = cleanSSML(data.Abstract);
                    sessionSpeaker = cleanSSML(getSpeakerList(data));

                    var speechText = "The session you requested is " + sessionName + ". It is being held in " + sessionRoom + ", at " + sessionTime + " on " + sessionDay + ". " + sessionSpeaker + "<break time='1s'/>Here's the description: " + sessionAbstract + ". " + getRandomQuestion();
                    VoiceLabs.track(this.event.session, this.event.request.intent.name, this.event.request.intent.slots, speechText, (error, response) => {
                        this.response.speak(speechText).listen(getRandomQuestion());
                        this.emit(":responseReady");
                      });
                });
            }
            else
            {
                //WE GOT MULTIPLE MATCHES, AND NEED TO DISAMBIGUATE.
                var speechText = "I found several sessions that matched " + getSpokenSlot.call(this, "session") + ". Which of these did you want? " + getDisambiguationList.call(this, "session");
                VoiceLabs.track(this.event.session, this.event.request.intent.name, this.event.request.intent.slots, speechText, (error, response) => {
                    this.response.speak(speechText).listen("Which session did you want to know about?");
                    this.emit(":responseReady");
                });
            }
        }
        else
        {
            //DIDN'T GET A POSITIVE MATCH ON A SESSION NAME.
            var speechText = "I think you asked me about a session, but I didn't find a match.  Which one did you want to know about?";
            VoiceLabs.track(this.event.session, this.event.request.intent.name, this.event.request.intent.slots, speechText, (error, response) => {
                this.response.speak(speechText).listen("Which session did you want to know about?");
                this.emit(":responseReady");
              });
        }
    },
    'AttendeePartyIntent': function () {
        var speechText = "The attendee party is held on Thursday night. It starts with karaoke and a photo booth at 7:30pm, and the waterpark will be open for us from 10pm until 1am.  I personally can't wait to try the Cheetah Racers.  Is there something else I can tell you about?";
        VoiceLabs.track(this.event.session, this.event.request.intent.name, this.event.request.intent.slots, speechText, (error, response) => {
            this.response.speak(speechText).listen(getRandomWelcomeQuestion());
            this.emit(":responseReady");
          });
    },
    'BreakfastIntent': function () {
        var speechText = "Breakfast is served each day in the Grand Hall from 7 to 8 am.  Except for Friday.  On Friday, after the late night in the waterpark, breakfast is from 7:30 to 8:30am.  Enjoy that extra half hour of sleep!  Is there something else I can tell you about?";
        VoiceLabs.track(this.event.session, this.event.request.intent.name, this.event.request.intent.slots, speechText, (error, response) => {
            this.response.speak(speechText).listen(getRandomWelcomeQuestion());
            this.emit(":responseReady");
          });
    },
    'GameRoomIntent': function () {
        var speechText = "The game room is open from 7am until midnight each day.  The Alexa team will be there from 7 to 10pm each night playing their favorites, and also teaching some new games you can play with your Amazon Echo.  Is there something else I can tell you about?";
        VoiceLabs.track(this.event.session, this.event.request.intent.name, this.event.request.intent.slots, speechText, (error, response) => {
            this.response.speak(speechText).listen(getRandomWelcomeQuestion());
            this.emit(":responseReady");
          });
    },
    'JamSessionIntent': function () {
        var speechText = "The jam session will be held from 9:30pm to 11:30pm on Thursday night.  Is there something else I can tell you about?";
        VoiceLabs.track(this.event.session, this.event.request.intent.name, this.event.request.intent.slots, speechText, (error, response) => {
            this.response.speak(speechText).listen(getRandomWelcomeQuestion());
            this.emit(":responseReady");
          });
    },
    'LightningTalksIntent': function () {
        var speechText = "The lightning talks will be held from 7pm to 10pm on Wednesday night.  Is there something else I can tell you about?";
        VoiceLabs.track(this.event.session, this.event.request.intent.name, this.event.request.intent.slots, speechText, (error, response) => {
            this.response.speak(speechText).listen(getRandomWelcomeQuestion());
            this.emit(":responseReady");
          });
    },
    'LunchIntent': function () {
        var speechText = "On Tuesday and Wednesday, lunch is from noon until 1pm.  On Thursday, an open lunch block is available from 11am to 2pm.  On Friday, the open lunch hours are from 10:30am until 2pm.  During the open lunch hours, you can stop in any time to get something to eat.  Is there something else I can tell you about?";
        VoiceLabs.track(this.event.session, this.event.request.intent.name, this.event.request.intent.slots, speechText, (error, response) => {
            this.response.speak(speechText).listen(getRandomWelcomeQuestion());
            this.emit(":responseReady");
          });
    },
    'OfficeHoursIntent': function () {
        var speechText = "From 1 to 3pm on Wednesday, Thursday, and Friday, the Alexa team will be holding office hours in Salon B and G.  Stop by to ask questions, write some code, or just learn more about building voice skills.";
        VoiceLabs.track(this.event.session, this.event.request.intent.name, this.event.request.intent.slots, speechText, (error, response) => {
            this.response.speak(speechText).listen(getRandomWelcomeQuestion());
            this.emit(":responseReady");
          });
    },
    'PrecompilerMixerIntent': function () {
        var speechText = "The precompiler mixer will be held from 8pm to 11pm on Tuesday evening.  Is there something else I can tell you about?";
        VoiceLabs.track(this.event.session, this.event.request.intent.name, this.event.request.intent.slots, speechText, (error, response) => {
            this.response.speak(speechText).listen(getRandomWelcomeQuestion());
            this.emit(":responseReady");
          });
    },
    'RaffleIntent': function () {
        var speechText = "The code mash raffle will be held from 5pm to 6pm on Friday.  There is also a kids mash raffle from 4pm to 5pm on Friday.  Is there something else I can tell you about?";
        VoiceLabs.track(this.event.session, this.event.request.intent.name, this.event.request.intent.slots, speechText, (error, response) => {
            this.response.speak(speechText).listen(getRandomWelcomeQuestion());
            this.emit(":responseReady");
          });
    },
    'WelcomeReceptionIntent': function () {
        var speechText = "The welcome reception is from 8pm to 11:30pm on Wednesday night.  Is there something else I can tell you about?";
        VoiceLabs.track(this.event.session, this.event.request.intent.name, this.event.request.intent.slots, speechText, (error, response) => {
            this.response.speak(speechText).listen(getRandomWelcomeQuestion());
            this.emit(":responseReady");
          });
    },
    'WinnerIntent': function () {
        var speechText = "The winners of the Amazon Echos at Codemash this year were David Keene and Bharat Kuncharavelu!  Congratulations!";
        VoiceLabs.track(this.event.session, this.event.request.intent.name, this.event.request.intent.slots, speechText, (error, response) => {
            this.response.speak(speechText).listen(getRandomWelcomeQuestion());
            this.emit(":responseReady");
          });
    },
    'AMAZON.HelpIntent': function () {
        var speechText = "You can ask me about any of the code mash speakers or sessions, or about times in the agenda, like lunch hours.  What can I help you with?";
        VoiceLabs.track(this.event.session, this.event.request.intent.name, this.event.request.intent.slots, speechText, (error, response) => {
            this.response.speak(speechText).listen("What can I help you with?");
            this.emit(":responseReady");
          });
    },
    'AMAZON.CancelIntent': function () {
        var speechText = "Goodbye.  Hope you're having a great code mash!";
        VoiceLabs.track(this.event.session, this.event.request.intent.name, this.event.request.intent.slots, speechText, (error, response) => {
            this.response.speak(speechText);
            this.emit(":responseReady");
          });
    },
    'AMAZON.StopIntent': function () {
        var speechText = "Goodbye.  Hope you're having a great code mash!";
        VoiceLabs.track(this.event.session, this.event.request.intent.name, this.event.request.intent.slots, speechText, (error, response) => {
            this.response.speak(speechText);
            this.emit(":responseReady");
          });
    },
    'SessionEndedRequest': function () {
        var speechText = "Goodbye.  Hope you're having a great code mash!";
        VoiceLabs.track(this.event.session, "SessionEndedRequest", null, speechText, (error, response) => {
            this.response.speak(speechText);
            this.emit(":responseReady");
          });
    },
    'Unhandled': function () {
        var speechText = "Something seems to have gone wrong with the Code mash API.  Try again shortly.";
        VoiceLabs.track(this.event.session, "Unhandled", null, speechText, (error, response) => {
            this.response.speak(speechText);
            this.emit(":responseReady");
          });
    },
};

function getRandomWelcomeMessage()
{
    var messages = ["Welcome to the Code mash skill!",
                   "This is the Code mash skill.",
                   "Hello!",
                   "Welcome!"];
    var random = getRandom(0, messages.length-1);
    return messages[random];
}

function getRandomWelcomeQuestion()
{
    var questions = ["What can I help you with?",
                     "What can I assist with?",
                     "Which code mash speaker or session would you like to know about?"];
    var random = getRandom(0, questions.length-1);
    return " " + questions[random];
}

function getRandomQuestion()
{
    var questions = ["What else can I help you with?",
                     "What else can I assist with?",
                     "Which other code mash speaker or session would you like to know about?"];
    var random = getRandom(0, questions.length-1);
    return " " + questions[random];
}

function getRandom(min, max)
{
    return Math.floor(Math.random() * (max-min+1)+min);
}

function getSpeakerName()
{
    return this.event.request.intent.slots.speaker.resolutions.resolutionsPerAuthority[0].values[0].value.name;
}

function getSpeakerId()
{
    return this.event.request.intent.slots.speaker.resolutions.resolutionsPerAuthority[0].values[0].value.id;
}

function getSpeakerTwitter(data)
{
    return data.TwitterLink.replace("https://twitter.com/", "")
}

function getSpokenSlot(slot)
{
    return this.event.request.intent.slots[slot].value;
}

function getDisambiguationList(slot)
{
    var list = this.event.request.intent.slots[slot].resolutions.resolutionsPerAuthority[0].values;
    console.log("DISAMBIGUATION LIST " + JSON.stringify(list));
    var disambiguationList = "";

    for (var i = 0;i<list.length; i++)
    {
        if (i>0) disambiguationList += ", ";
        if ((list.length - i) === 1) disambiguationList += "or ";
        disambiguationList += list[i].value.name;
    }
    console.log("FORMATTED LIST = " + disambiguationList);
    return disambiguationList;
}

function getSessionName()
{
    return this.event.request.intent.slots.session.resolutions.resolutionsPerAuthority[0].values[0].value.name;
}

function getSessionId()
{
    return this.event.request.intent.slots.session.resolutions.resolutionsPerAuthority[0].values[0].value.id;
}

function getSessionRoom(data)
{
    var roomcount = data.Rooms.length;
    var roomstring = "";

    for (var i = 0; i<roomcount; i++)
    {
        if (i>0) roomstring += " and ";
        roomstring += data.Rooms[i].replace(" - Sessionz", " ");
    }

    return roomstring;
}

function getSpeakerList(data)
{
    var speakercount = data.Speakers.length;
    var speakerstring = "";

    for (var i = 0; i<speakercount; i++)
    {
        if (i>0) speakerstring += " and ";
        speakerstring += data.Speakers[i].FirstName + " " + data.Speakers[i].LastName;
    }

    if (speakercount > 1) return "The speakers for this session are " + speakerstring + ".";
    else return "The speaker for this session is " + speakerstring + ".";
}

function getSessionDayOfWeek(data)
{
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    var datetime = new Date(data.SessionStartTime);
    return days[datetime.getDay()];
}

function getSessionTime(data)
{
    var datetime = new Date(data.SessionStartTime);
    var hours = datetime.getHours();
    var minutes = datetime.getMinutes();
    var ampm = "am";

    if (hours > 12)
    {
        hours = hours - 12;
        ampm = "pm";
    }

    if (minutes === 0) minutes = "00";

    return hours + ":" +minutes + " " + ampm;
}

function isEntityResolutionMatch(slot)
{
    if ((this.event) && 
        (this.event.request) && 
        (this.event.request.intent) && 
        (this.event.request.intent.slots) && 
        (this.event.request.intent.slots[slot]) && 
        (this.event.request.intent.slots[slot].resolutions) && 
        (this.event.request.intent.slots[slot].resolutions.resolutionsPerAuthority) && 
        (this.event.request.intent.slots[slot].resolutions.resolutionsPerAuthority[0]) && 
        (this.event.request.intent.slots[slot].resolutions.resolutionsPerAuthority[0].status) && 
        (this.event.request.intent.slots[slot].resolutions.resolutionsPerAuthority[0].status.code) && 
        (this.event.request.intent.slots[slot].resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH"))return true;
    else return false;
}

function isExclusiveEntityResolutionMatch(slot)
{
    console.log("MATCH COUNT = " + this.event.request.intent.slots[slot].resolutions.resolutionsPerAuthority[0].values.length);
    if (this.event.request.intent.slots[slot].resolutions.resolutionsPerAuthority[0].values.length === 1) return true;
    else return false;
}

function cleanSSML(text)
{
    return text.toLowerCase().replace(new RegExp("[&]", "g"), "and")
                             .replace(new RegExp("codemash", "g"), "code mash")
                             .replace(new RegExp("[(]", "g"), " ")
                             .replace(new RegExp("[)]", "g"), " ")
                             .replace(new RegExp("c#", "g"), "see sharp")
                             .replace(new RegExp("github", "g"), "git hub");
}

function httpsGet(path, callback) {
    var options = {
        host: "speakers.codemash.org",
        port: 443,
        path: path,
        method: 'GET',
    };

    console.log("PATH = https://" + options.host + options.path);

    var req = https.request(options, res => {
        res.setEncoding('utf8');
        var returnData = "";

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {
            var data = JSON.parse(returnData);
            console.log("DATA = " + JSON.stringify(data));
            callback(data);
        });

    });
    req.end();

}

exports.handler = function (event, context) {
    console.log("EVENT = " + JSON.stringify(event));
    console.log("CONTEXT = "  + JSON.stringify(context));
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
