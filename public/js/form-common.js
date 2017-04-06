/**
 * dre_common.js
 */
var $ = jQuery.noConflict();
var countryElementID = "Q_DROPDOWN_-16";
var stateElementID = "Q_DROPDOWN_-17";
var emailElementID = "Q_TEXTBOX_-8";
var validateStates = true;

var fields_refresh_required = ['SE', 'DE', 'AT', 'CH', 'FI', 'JP', 'CN', 'TW', 'KR', 'HK'];

$(document).ready(function(){

  if(!getAppSiteFormEnabled()){return;}


    //Ajax call to load states
    if ($("#" + countryElementID).length > 0 && $("#" + stateElementID).length > 0) {
        //Add a hidden field to mark there is state question in current campaign
        var hiddenFieldHasStateComp = "hasStateComp";
    	if ($("#" + hiddenFieldHasStateComp).length == 0) {
    		$("#registerform").append("<input type=\"hidden\" value=\"true\" name=\"hasStateComp\" id=\"hasStateComp\">");
    	}
    }

    //Adjust submit button width
    if ($("#btn_submitform").width() < 155) {
    	$("#btn_submitform").width(155);
    }

    //Initialize country drop down based on the URL lang parameter
    initCountrySelection();

    modifyStyle();

    //attach change listener to Country dropdown
    if ($("#" + countryElementID).length > 0 && $("#" + countryElementID)[0].tagName == "SELECT") {
    	var oldCountryValue;
    	$('#' + countryElementID).select2().on('select2:selecting', function() {
    		oldCountryValue = this.value;
    	});
		$("#" + countryElementID).change(function(event){
			$("#" + stateElementID).select2("val", "");
			if ((fields_refresh_required.indexOf(oldCountryValue) > -1) || (fields_refresh_required.indexOf(this.value) > -1)) {
				getCountrySpecificConfiguration();
			} else {
				loadStates();
			}
	    });
	}

});

function modifyStyle() {
	$('#registerform div label').each(function() {
        if ($(this).next().length > 0) {
        	$(this).css('margin-bottom','0');
        }
    });
}

function initCountrySelection() {
  console.log("cbo lang:", window.Site.lang);
  var cboLang = window.Site.lang;
	var lang = $("input[name='language']").val().toUpperCase();
  console.log("lang:", lang);

  var langMap  = {'en':'US', 'ko':'KR', 'fr':'FR', 'es': 'ES', 'de':'DE'}

  lang = langMap[cboLang];

  //if (lang !== "" && lang !== "en_US" && $("#" + countryElementID).length > 0) {
  if (lang !== "" && $("#" + countryElementID).length > 0) {
	    $("#" + countryElementID + " option").each(function(){
        //if ($(this).val() === lang.substring(3)) {
        if ($(this).val() === lang) {
			     //$(this).attr("selected", true);
			     $('#' + countryElementID).val($(this).val());
			     if ($("#" + stateElementID).length > 0) {
			    	 loadStates();
			     }
			 }
		});
    }
}

function getCountrySpecificConfiguration() {
	var currentURL = window.location.href;
	var currentURLChunks = currentURL.split('/');
	var url = './' + currentURLChunks[currentURLChunks.length - 1] + '&countrySpec=' + $("#" + countryElementID).val();

	showLoader();
	$.ajax({
        url:      url,
        type:     "get",
        success:  function( data ) {
              updateFormData(data);
              hideLoader();
        }
   });
}

function updateFormData(data) {
	// 1. Get values of all fields in form
	var persistedValues = {};
	var attachedEvents = {};

	$('#register_questions :input').each(
		function() {
			var fieldId = $(this).attr('id');

			var fieldValue = isCheckbox($(this)) ? $(this).prop('checked') : $(this).val();
			if (isUserInputField($(this)) && (typeof fieldValue !== 'undefined')) {
				persistedValues[fieldId] = fieldValue;
			}

			var fieldEventsObject = $._data($(this)[0], 'events');
			if (typeof fieldEventsObject !== 'undefined') {
				attachedEvents[fieldId] = buildEventsTypeHandlerMap(fieldEventsObject);
			}

		}
	);

	// 2. replace form content
	var $newContent = $(data);
	var newFormData = $newContent.find('div[id="register_questions"]').html();

	var $wrapper = $('#register_questions');
	$wrapper.html(newFormData);

	// 3. set previous values
	$('#register_questions :input').each(
		function() {
			var fieldId = $(this).attr('id');
			var persistedValue = persistedValues[fieldId];
			if (typeof persistedValue !== 'undefined') {
				if (isCheckbox($(this))) {
					$(this).prop('checked', persistedValue);
				} else {
					$(this).val(persistedValue);
				}
			}
		}
	);

	// 4. set event handlers
	$('#register_questions :input').each(
		function() {
			var fieldId = $(this).attr('id');
			var fieldEventsMap = attachedEvents[fieldId];
			if (fieldEventsMap !== 'undefined') {
				for (type in fieldEventsMap) {
					eventsArr = fieldEventsMap[type];
					for (i = 0; i < eventsArr.length; i++) {
						$(this).bind(type, eventsArr[i]);
					}
				}
			}
		}
	);

	// 5. loading states
	loadStates();

	// 6. doNonBindalbeInitialization
	doNonBindableInitialization();

}

function isCheckbox($input) {
	return $input.is(':checkbox');
}

function buildEventsTypeHandlerMap(fieldEventsObject) {
	var fieldEventsMap = {};

	for (key in fieldEventsObject) {
		eventsArr = fieldEventsObject[key];
		for (i = 0; i < eventsArr.length; i++) {
			currentEvent = eventsArr[i];
			eventType = currentEvent.type;
			eventHandler = currentEvent.handler

			var events = (eventType in fieldEventsMap) ? fieldEventsMap[eventType] : [];
			events.push(eventHandler);

			fieldEventsMap[eventType] = events;
		}
	}

	return fieldEventsMap;
}

function loadStates(){
	clearStates();
    $.ajax({
    //url:      "./loadStates?countryCode=" + $("#" + countryElementID).val() + "&lang=" + $("#locale").val(),
    url: '/'+getAppSiteLang()+"/loadStates?countryCode=" + $("#" + countryElementID).val() + "&lang=" + $("#locale").val(),
         type:     "get",
         success:  function( data ) {
               addStates(data);
         }
    });
}

function clearStates(){
    $("#" + stateElementID).empty();
    $("#" + stateElementID).attr("disabled",true);
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function addStates(data) {
  console.log("add states !!!!!" + data);
    try {
        //var responseData = eval('('+data+')');
            var states = data;
            if (Object.size(states) == 0) {
                validateStates = false;
            } else {
              console.log("parse response", stateElementID);
            	validateStates = true;
                $("#" + stateElementID).attr("disabled",false);
                $("#" + stateElementID).append("<option value=''></option>");
                for(var stateCode in states) {
                  console.log(stateCode +": "+states[stateCode]);
                    $("#" + stateElementID).append("<option value='" + stateCode + "'>" + states[stateCode] + "</option>");
                }
            }
			$('body').trigger('statesLoaded', {'validateStates' : validateStates});

    } catch (error) {
        console.log(error.message);
    }
}

// function addStates(data) {
//     try {
//         var responseData = eval('('+data+')');
//         if (responseData.returnBean.returnCode == 200) {
//             var states = responseData.states;
//             if (states.length == 0) {
//                 validateStates = false;
//             } else {
//             	validateStates = true;
//                 $("#" + stateElementID).attr("disabled",false);
//                 $("#" + stateElementID).append("<option value=''></option>");
//                 for(var i = 0; i < states.length; i ++){
//                     var state = states[i];
//                     $("#" + stateElementID).append("<option value='" + state.stateCode + "'>" + state.stateName + "</option>");
//                 }
//             }
// 			$('body').trigger('statesLoaded', {'validateStates' : validateStates});
//         }
//     } catch (error) {
//         //alert($("#errorMsg").val());
//     }
// }

//This is for all IWM signup pages to enable metrics gathering
//Pick up source, s_tact, s_pkg, and s_cmp values from URL string
function qsgrab(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var regex = new RegExp(regexS, "i");
    var results = regex.exec(window.location.href);
    if (results == null)
        return "";
    else
        return results[1];
}

//Coremetrics
function invokeCoremetrics() {
    var ibmregsource = qsgrab( 'source' );
    var ibmregtact = qsgrab( 's_tact' );
    if(!ibmregtact && defaultTactic){
    	ibmregtact = defaultTactic;
    }
    var ibmregcmp = qsgrab( 's_cmp' );
    var ibmregpkg = qsgrab( 's_pkg' );
    var ibmregoff = qsgrab( 's_off_cd' );
    var ibmregmail = qsgrab( 's_mail_cd' );

    if(signupPageIncluded){
    	IBMCore.common.util.queue.push(function(){
            return typeof(cmExecuteTagQueue) === 'function';
        }, function(){
            var eventID = campaignTitle;

            console.log("begin");
            console.log(ibmregsource);
            console.log(ibmregtact);
            console.log(ibmregcmp);
            console.log(ibmregpkg);
            console.log(ibmregoff);
            console.log(ibmregmail);
            console.log(campaignTitle);
            console.log("end");
            ibmStats.event({ 'ibmEV' : 'IWM', 'ibmEvAction' : eventID, 'ibmEvName' : ibmregsource, 'ibmEvGroup' : ibmregpkg, 'ibmEvModule' : ibmregtact, 'ibmEvSection': ibmregcmp, 'ibmEvTarget': 'IWMStart','ibmConversion' : 'true', 'point' : '10', 'convtype' : '1', 'ibmregoff' : ibmregoff,  'ibmregmail' : ibmregmail});
        });
    } else if(thankYouPageIncluded) {
    	IBMCore.common.util.queue.push(function() {
            return typeof(cmExecuteTagQueue) === 'function';
        }, function(){
            var eventID = campaignTitle;
            // refresh corematrix values in thankyou page.
            ibmregsource = document.getElementById('sourceCode').value;
            ibmregpkg = document.getElementById('packageCode').value;
            ibmregtact = document.getElementById('tacticCode').value;
            ibmregoff = document.getElementById('callingOfferCode').value;
            ibmregmail = document.getElementById('mailingCode').value;
            ibmregcmp = document.getElementById('campaign').value;

            console.log("begin");
            console.log(ibmregsource);
            console.log(ibmregtact);
            console.log(ibmregcmp);
            console.log(ibmregpkg);
            console.log(ibmregoff);
            console.log(ibmregmail);
            console.log(campaignTitle);
            console.log("end");
            ibmStats.event({ 'ibmEV' : 'IWM', 'ibmEvAction' : eventID, 'ibmEvName' : ibmregsource, 'ibmEvGroup' : ibmregpkg, 'ibmEvModule' : ibmregtact, 'ibmEvSection': ibmregcmp, 'ibmEvTarget': 'IWMCompletion','ibmConversion' : 'true', 'point' : '20', 'convtype' : '2', 'ibmregoff' : ibmregoff,  'ibmregmail' : ibmregmail});
            if(userEmail != ""){
                cmCreateRegistrationTag(userEmail);
            }
        });
    }

}
// Coremetrics End
//Privacy - granular preferences and notice and choice
function reInitPrivacy() {
	setTimeout(function () {
		if (typeof(ext) == "object" &&
			typeof(ext.noticechoice) == "object" &&
			typeof(ext.noticechoice.nc.init) == "function") {
			ext.noticechoice.nc.init();
		}
	}, 1000);
}

function isUserInputField(input) {
	return !(input.is('input') && (input.attr('type').toLowerCase() === 'hidden'));
}
