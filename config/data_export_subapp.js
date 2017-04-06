var express = require('express');
var router = express.Router();

require('dotenv').load();
var mongoose = require('mongoose');
var fs = require('fs');

require ('../database');
var _ = require('underscore');

var async = require("async");

var Starts = mongoose.model("starts");
var Questions = mongoose.model("questions");
var QuestionAnswers = mongoose.model('questionAnswers');
var Users = mongoose.model("users");
var Tracking = mongoose.model("tracking");
var AssetTracking = mongoose.model("assetTracking");
var Result = mongoose.model("result");
var util = require('util');

var sessions = {};
var questions = [];

function isValid(val) {
    //console.log("val:", val);
    if (typeof(val) == 'undefined') return '""';

    var vals = val.split(",");
    var ret = "";
    for (var i = 0; i < vals.length; i++) {
        if (ret) {
            ret += "," + as[vals[i]];
        } else {
            ret = as[vals[i]];
        }
    }
    return '"'+ret+'"';
}

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

// middleware that is specific to this router
var auth = require('./basicAuth');
router.use('/', auth.scopedBasicAuth( {

    "/en/cbo-data-export": {
                    username: "data-admin",
                    password: "D@t2Exp.rt!",
    },
    "/ko/cbo-data-export": {
                    username: "data-admin",
                    password: "P2J@jWyW",
    },
    "/fr/cbo-data-export": {
                    username: "data-admin",
                    password: "=3GVs5KQ",
    },
    "/es/cbo-data-export": {
                    username: "data-admin",
                    password: "5&R%wU%5",
    },
    "/de/cbo-data-export": {
                    username: "data-admin",
                    password: "uh8xQc*E",
    }
  }
));


router.use(function timeLog(req, res, next) {
  //process.env.TZ = 'America/New_York';  SET IN Bluemix site environment variables
  var ts= new Date();
  console.log( 'Export Time: ', ts );
  console.log('Timezone offset: ', ts.getTimezoneOffset());
  var testDate = new Date("2016-06-13 14:26:42-0400");
  console.log('Test Date: ', testDate);
  var testDate2 = new Date("2016-06-13 14:26:42");
  console.log('Test Date2: ', testDate2);
  testDate.setTime(testDate.getTime() - 240*60*1000);//hack for running within server context
  console.log("Adjusted Test Date: ", testDate)
  next();
});

router.get('/', function(req, res, next) {
  console.log('Export lang: '+res.locals.lang);
  var lang = res.locals.lang;
  console.log('Export baseUrl: '+req.baseUrl);

  var dataClause = lang == 'en' ? {$or:[{ lang:'en' }, {lang: {$exists:false} } ]} : {lang: lang};
  console.log("dataClause:");
  console.info(util.inspect(dataClause, {showhidden: false, depth: null}));
  sessions = {}; //clear module variable

  async.parallel([
      function(callback) {
          Questions.find( {_id: lang} ).exec(function(err, res) {
              if (err) {
                  console.info(err);
              } else {
                  questions = res[0].questions_array;
                  console.log("done with Questions");
              }
              callback(err);
          });
      },
      function(callback) {
          Starts.find( dataClause ).exec(function(err, res) {
              if (err) {
                  console.log("err:", err);
              } else {
                console.log("Starts count: ",res.length);
                  for (var i = 0; i < res.length; i++) {
                      var cd = new Date(res[i].createdAt);
                      //cd.setTime(cd.getTime() - 240*60*1000);//hack for running within bluemix server context
                      var fd = (cd.getMonth() + 1) + "/" + cd.getDate() + "/" + (cd.getYear() + 1900) + " " + addZero(cd.getHours()) + ":" + addZero(cd.getMinutes()) + ":" + addZero(cd.getSeconds());
                      // var thisSession = {};
                      // thisSession["startAt"] = fd;
                      // thisSession["clientIP"] = res[i].clientIP;
                      // thisSession["refUrl"] = res[i].refUrl;
                      // sessions[res[i].sessionId] = thisSession;


                      if (!sessions[res[i].sessionId]) {
                          sessions[res[i].sessionId] = {};
                      }
                      //if using parallel calls, need to set specific properties.
                      sessions[res[i].sessionId]["startAt"] = fd;
                      sessions[res[i].sessionId]["clientIP"] = res[i].clientIP;
                      sessions[res[i].sessionId]["refUrl"] = res[i].refUrl;

                  }
              }
              console.log("done with start");
              // console.info("sessions:", sessions);
              callback(err);
          });
      },

      function(callback) {
          //console.log("");
          //console.log("");
          //console.log("");
          QuestionAnswers.find( dataClause ).sort({sessionId:1, qId:1, aId:1}).exec(function(err, res) {
              if (err) {
                  console.info(err);
              } else {
                  for (var i = 0; i < res.length; i++) {
                      var aRes = res[i];
                      //console.log("aRes.sessionId:", aRes.sessionId);
                      if (!sessions[aRes.sessionId]) {
                          sessions[aRes.sessionId] = {};
                      }

                      thisSession = sessions[aRes.sessionId];
                      //console.info("thisSession:", thisSession);
                      if (!thisSession[aRes.aId]) {
                          var cd = aRes.createdAt;
                          var fd = (cd.getMonth() + 1) + "/" + cd.getDate() + "/" + (cd.getYear() + 1900) + " " + addZero(cd.getHours()) + ":" + addZero(cd.getMinutes()) + ":" + addZero(cd.getSeconds());
                          //thisSession[aRes.aId] = fd;
                          thisSession[aRes.aId] = {'cd': fd, 'other':aRes.other};
                      }
                  }

                  console.log("done with QuestionAnswers");
                  //console.info("sessions:", sessions);
              }
              callback(err);

          });
      },

      function(callback) {
          Result.find( dataClause ).sort({sessionId:1}).exec(function(err, res) {
              if (err) {
                  console.info(err);
              } else {
                  //console.info("Results: ", res);
                  var noCnt = 0;
                  for (var i = 0; i < res.length; i++) {
                      var aRes = res[i];
                      if (!sessions[aRes.sessionId]) {
                          //console.info("session id not found, skipping this result:", aRes.sessionId);
                          noCnt++;
                          //continue;
                          sessions[aRes.sessionId] = {};
                      }
                      //console.log("session id FOUND, adding result to session");
                      if (!sessions[aRes.sessionId].result) {
                          sessions[aRes.sessionId].result = aRes.level;
                          //console.info("thisSession:", sessions[aRes.sessionId]);
                      } else {
                          console.info("result already existed for this session:", aRes.sessionId);
                      }
                  }
                  console.info("noCnt:", noCnt);
              }

              callback(err);
          });
      },

      function(callback) {
          AssetTracking.find( dataClause ).sort({sessionId:1}).exec(function(err, res) {
              if (err) {
                  console.info(err);
              } else {
                  for (var i = 0; i < res.length; i++) {
                      var aRes = res[i];
                      if (!sessions[aRes.sessionId]) {
                        //continue;
                        sessions[aRes.sessionId] = {};
                      }
                      sessions[aRes.sessionId].assets = aRes.assets;
                  }
              }

              callback(err);
          });
      },

      function(callback) {
          Tracking.find( dataClause ).sort({sessionId:1, createdAt: 1}).exec(function(err, res) {
              if (err) {
                  console.info(err);
              } else {
                  for (var i = 0; i < res.length; i++) {
                      var aRes = res[i];
                      if (!sessions[aRes.sessionId]) {
                        //continue;
                        sessions[aRes.sessionId] = {};
                      }
                      if (!sessions[aRes.sessionId].tracks) {
                          sessions[aRes.sessionId].tracks = [];
                      }
                      var cd = new Date(aRes.createdAt);
                      var fd = (cd.getMonth() + 1) + "/" + cd.getDate() + "/" + (cd.getYear() + 1900) + " " + addZero(cd.getHours()) + ":" + addZero(cd.getMinutes()) + ":" + addZero(cd.getSeconds());
                      sessions[aRes.sessionId].tracks.push({url: aRes.url, timestamp: fd});
                  }
              }

              callback(err);
          });
      }],

      function(err) {
      if (err) {
          console.log('ERROR: pulling starts/question/answer data:',err);
          res.sendStatus(500);
          return;
      }
          //console.log("Closing DB connection ... ");
          //mongoose.disconnect();
          //console.log("closed!");

          var header = {};
          header['en']="Session,Referrer URL,Country,Timestamp,Industry,Timestamp,Role,Timestamp,Comp Size,Timestamp,Software,Timestamp,Software2,Timestamp,Software3,Timestamp,Cognitive Software,Timestamp,In Conjunction,Timestamp,Scale,Timestamp,Familiar,Timestamp,Belief,Timestamp,Obstacle,Timestamp,Cog Goals,Timestamp,Use Case,Timestamp,Result,Link1,Link2,Link3,Link4,Link5,Asset1,Asset2,Asset3,Asset4,Asset5\n";
          header['es']="Sesión,URL de procedencia,País,Marca de tiempo,Industria,Marca de tiempo,Rol,Marca de tiempo,Tamaño de la computadora,Marca de tiempo,Software,Marca de tiempo,Software2,Marca de tiempo,Software3,Marca de tiempo,Software cognitivo,Marca de tiempo,En combinación,Marca de tiempo,Escala,Marca de tiempo,Familiar,Marca de tiempo,Convicción,Marca de tiempo,Obstáculo,Marca de tiempo,Objetivos cognitivos,Marca de tiempo,Caso de uso,Marca de tiempo,Resultado,Enlace1,Enlace2,Enlace3,Enlace4,Enlace5,Activo1,Activo2,Activo3,Activo4,Activo5\n";
          header['de']="Sitzung,Zugewiesene URL,Land,Zeitstempel,Branche,Zeitstempel,Rolle,Zeitstempel,Firmengröße,Zeitstempel,Software,Zeitstempel,Software2,Zeitstempel,Software3,Zeitstempel,Kognitive Software,Zeitstempel,In Verbindung mit,Zeitstempel,Umfang,Zeitstempel,Vertraut,Zeitstempel,Überzeugung,Zeitstempel,Hindernis,Zeitstempel,Kognitive Ziele,Zeitstempel,Anwendungsfall,Zeitstempel,Ergebnis,Link1,Link2,Link3,Link4,Link5,Posten1,Posten2,Posten3,Posten4,Posten5\n";
          header['fr']="Séance,Adresse du référent,Pays,Horodatage,Secteur,Horodatage,Rôle,Horodatage,Taille de composant,Horodatage,Logiciel,Horodatage,Logiciel2,Horodatage,Logiciel3,Horodatage,Logiciel cognitif,Horodatage,En parallèle,Horodatage,Échelle,Horodatage,Familier,Horodatage,Croyance,Horodatage,Obstacle,Horodatage,Objectif cognitif,Horodatage,Cas d'usage,Horodatage,Résultat,Lien1,Lien2,Lien3,Lien4,Lien5,Actif1,Actif2,Actif3,Actif4,Actif5\n";
          header['ko']="세션,접속 경로 URL,국가,타임스탬프,산업,타임스탬프,역할,타임스탬프,회사 규모,타임스탬프,소프트웨어,타임스탬프,소프트웨어2,타임스탬프,소프트웨어3,타임스탬프,코그너티브 소프트웨어,타임스탬프,관련,타임스탬프,규모,타임스탬프,친숙도,타임스탬프,신념,타임스탬프,장애,타임스탬프,코그너티브 목표,타임스탬프,적용 시나리오,타임스탬프,결과,링크1,링크2,링크3,링크4,링크5,자산1,자산2,자산3,자산4,자산5\n";
//          var contentOut = "Session,Referrer URL,Q1,Timestamp,Q2,Timestamp,Q3,Timestamp,Q4,Timestamp,Q5,Timestamp,Q5a,Timestamp,Q5b,Timestamp,Q5c,Timestamp,Q5a1,Timestamp,Q5a2,Timestamp,Q6,Timestamp,Q6a,Timestamp,Q6b1,Timestamp,Q6b2,Timestamp,Q7,Timestamp,Result,Asset1,Asset2,Asset3,Asset4,Asset5,Link1,Link2,Link3,Link4,Link5\n";
          var contentOut = header[lang];
          var delimiter = ",";

          var cnt = 0;
          for (var sessionId in sessions) {
            var ok = false;
            _.map(sessions[sessionId], function(v, k){
              ok = k.match(/^Q1/g) ? true : ok;  //must have first question answered
            });

            if (!ok) { continue;}


              var answered = true;
              // console.log("sessionId:", cnt++, " : ", sessionId);
              if (sessionId.charAt(0) == "=") {
                  var aLine = sessionId.substring(1);
              } else {
                  var aLine = sessionId;
              }

              var thisSession = sessions[sessionId];

              //console.info("thisSession[refUrl]:", thisSession["refUrl"]);
              if (thisSession["refUrl"] && thisSession["refUrl"] != null) {
                  aLine += delimiter + '"' + thisSession["refUrl"] + '"';
              } else {
                  aLine += delimiter + '';
              }
              //console.info("thisSession: ", thisSession);
              //console.info("as:", as);
              for (var q = 0; q < questions.length; q++) {
                  if (aLine.length > 0) {
                      aLine += delimiter;
                  }

                  var aQ = questions[q];

                  //aLine += "\""; // opening quote
                  var answers = aQ.answers_array;
                  var ansText = "";
                  var cd = "";
                  var multi = false;
                  for (var a = 0; a < answers.length; a++) {
                      var aId = answers[a]._id;
                      if (thisSession[aId]) {
                          if (ansText.length > 0) {
                              ansText += ", "; // multiple answer separator
                              multi = true;
                          }
                          if (thisSession[aId].other && thisSession[aId].other != null && _.contains(['Q8-A6','Q9-A6','Q10-A1'], aId)){
                            ansText += answers[a].answer + ": " + thisSession[aId].other;
                          }else{
                            ansText += answers[a].answer;
                          }
                          cd = thisSession[aId].cd;
                      }
                  }
                  // if (aQ.id == 0 && ansText.length < 1) {
                  //     answered = false;
                  //     break;
                  // }
                  if (!multi && ansText.indexOf(",") > 0) {
                      multi = true;
                  }
                  if (multi) {
                      aLine += "\"" + ansText + "\"";
                      ansText = "\"" + ansText + "\"";
                  } else {
                      aLine += ansText;
                  }
                  aLine += delimiter + cd;
              }
              if (answered) {
                  //contentOut += aLine;

                  if (thisSession["result"]) {
                      aLine += delimiter + thisSession["result"];

                      if (thisSession["assets"]) {
                          var assets = JSON.parse(thisSession["assets"]);
                          for (var a = 0; a < assets.length; a++) {
                              aLine += delimiter + assets[a];
                          }
                          if (assets.length == 4){
                            aLine += delimiter;
                          }
                      } else {
                          aLine += delimiter+delimiter+delimiter+delimiter+delimiter;
                      }

                      if (thisSession["tracks"]) {
                          var tracks = thisSession["tracks"];
                          for (var t = 0; t < tracks.length; t++) {
                              aLine += delimiter + tracks[t].url;
                          }
                      }
                  }

                  contentOut += aLine + "\n";
              } else {
                  console.info("No answer for this session");
                  console.info("and result is:", thisSession["result"]);
              }
          }

          //console.info("contentOut:", contentOut);
          var fileName = 'cbo-data-export.csv';
          var filePath = __dirname + '/../extracts/';
          if (!fs.existsSync(filePath)){
              fs.mkdirSync(filePath);
          }

          fs.writeFile(filePath+fileName, contentOut, function(err) {
              if (err) {
                  console.log(err);
              }else{
                res.sendFile(fileName, {root: filePath, headers:{'Content-Type':'text/csv','Content-Disposition':'attachment; filename='+fileName}}, function (err) {
                  if (err) {
                    console.log(err);
                    res.status(err.status).end();
                  }
                  else {
                    console.log('Sent file');
                  }
                });
              }
          });
      }
  );
});

module.exports = router;
