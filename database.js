var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var bluemix = require('./config/bluemix');

var StartSchema = new Schema({
    sessionId: { type : String, index : true },
    clientIP: String,
    refUrl: String,
    lang: String,
    createdAt: { type: Date, 'default': Date.now }
});
mongoose.model('starts', StartSchema);

var QuestionSchema = new Schema({
    _id: String,
    id: { type: Number, index: true },
    questions_array: [{
	    _id: String,
	    id: { type: Number, index: true },
	    group: Number,
	    key: String,
	    question: String,
	    answerPerRow: Number,
	    icons: Boolean,
	    selectedAnswerID: Number,
	    multiple: Boolean,
	    multiLimit: Number,
	    answers_array: []
    }]
});
mongoose.model('questions', QuestionSchema);

var QuestionAnswerSchema = new Schema({
    sessionId: { type : String, index : true },
    qId: String,
    aId: String,
    other: String,
    clientIP: String,
    lang: String,
    createdAt: { type: Date, 'default': Date.now }
});
mongoose.model('questionAnswers', QuestionAnswerSchema);

var UserSchema = new Schema({
    sessionId: { type : String, index : true },
    emailHash: String,
    iwmTxId: Number,
    iwmError: Schema.Types.Mixed,
    contactFlag: String,
    contactMedium: String,
    privacyFlag: String,
    lang: String,
    profile: Schema.Types.Mixed,
    createdAt: { type: Date, 'default': Date.now }
});
mongoose.model('users', UserSchema);

var Result = new Schema ({
    level: { type : String } ,
    sessionId: { type : String, index : true },
    lang: String,
    createdAt: { type: Date, 'default': Date.now }
});
mongoose.model('result', Result);

var AssetTrackingSchema = new Schema ({
    assets: { type : String, index : true},
    sessionId: { type : String, index : true },
    lang: String,
    createdAt: { type: Date, 'default': Date.now }
});
mongoose.model('assetTracking', AssetTrackingSchema);


var TrackingSchema = new Schema ({
    url: { type : String, index : true},
    sessionId: { type : String, index : true },
    lang: String,
    createdAt: { type: Date, 'default': Date.now }
});
mongoose.model('tracking', TrackingSchema);


var bmUri = bluemix.getDBUri();
var uri = bmUri;

console.log("Connecting to uri: ", uri);

var db = mongoose.connect(uri);
//console.log(db);
