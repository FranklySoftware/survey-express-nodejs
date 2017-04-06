var $ = jQuery;
var timer;
var readyFields;

$(document).ready(function() {

    var inputs          = $("input[type=text]");
    var submitBtn       = $("button[type=submit]");
    var emailId         = 'Q_TEXTBOX_-8';
    var emailFilter     = /^([a-zA-Z0-9_\+\.\-\''])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    var required_fields = $('#requiredFields');
    var stateId = "Q_DROPDOWN_-17";
    var invalidChars = /[<>${}?]/;

    init();

    function init() {
      if(!getAppSiteFormEnabled()){return;}


        $("body").bind("statesLoaded", function(event, data){

				setRequiredFields(data.validateStates);

        })

        inputs.bind('focus', function(event) {
            $(this).addClass('field-active')
            $(this).parent("span").prev().addClass('lbl-active')
        });
        inputs.bind('blur', function(event) {
            $(this).removeClass('field-active')
            $(this).parent("span").prev().removeClass('lbl-active')
        });

        $.each($("#mrs-wrap img"), function(index, val) {

            preload(val)
        });


        submitBtn.bind("click", function(event) {

            var fields = validate();
            var errorFields = fields.errorFields;
            readyFields = fields.readyFields;
            if (errorFields.length > 0) {
              event.preventDefault();
              markFields(errorFields, readyFields);
              //console.log("error fields",errorFields);
              //console.log("ready fields", readyFields);
            }else{
              //event.preventDefault();
              //startWithProfile(readyFields);
            }
        });

       $( "#registerform" ).submit(function( event ) {
         //alert( "Add Handler for .submit() called." );
         //console.log("FETCH FULL FORM");
         //console.log( $('#registerform').serialize();  );
         event.preventDefault();
         startWithProfile(readyFields);
       });

        doNonBindableInitialization();
    }

    function startWithProfile(fields){
      console.log("NC HIDDEN FIELDS:");
      console.log($('input:hidden[name=NC_Hidden_ShortAreaCodes]').val());
      console.log($('input:hidden[name=NC_HIDDEN_AllMedia]').val());
      console.log($('input:hidden[name=NC_Hidden_NoMediErrorText]').val());

      var formData = {};
      //formData['NC_OFFER_CHOICE']=$('#NC_Granular_Choice_-Business_Process_Management').is(':checked') ? 'true' : 'false' ;
      //formData['NC_ALL_IBM_CHOICE']=$('#NC_Granular_Choice_-NC_ALL_IBM_CHOICE').is(':checked') ? 'true' : 'false';
      formData['NC_OFFER_CHOICE']= $('input:hidden[name=NC_Hidden_ShortAreaCodes]').val() ;
      formData['NC_ALL_IBM_CHOICE']= $('input:hidden[name=NC_HIDDEN_AllMedia]').val();

      // fields.forEach(function(entry){
      //   var e = $(entry.selector);
      //   formData.push( { [e.attr('name')] : e.val() });
      // });
      // console.log('getData:', formData);
      var fieldsToMrs = {};
      fieldsToMrs['Q_DROPDOWN_-16'] = 'country';
      fieldsToMrs['Q_TEXTBOX_-1'] = 'firstName';
      fieldsToMrs['Q_TEXTBOX_-3'] = 'lastName';
      fieldsToMrs['Q_TEXTBOX_-11'] = 'company';
      fieldsToMrs['Q_DROPDOWN_-17'] = 'state';
      fieldsToMrs['Q_TEXTBOX_-9'] = 'phone';
      fieldsToMrs['Q_TEXTBOX_-8'] = 'email';

      fields.forEach(function(entry){
        var e = $(entry.selector);
        formData[fieldsToMrs[e.attr('name')]] = e.val().trim();
      });

      console.log('startWithProfile -> getData:', formData);

      $.ajax({
          url: '/'+getAppSiteLang()+'/start',
          // url:      "./startWithProfile",
           type:     "post",
           data: {'formData' : formData},
           success:  function( res ) {
                 //console.log(res);

                 $("#mrs-form").addClass("past");
                 setTimeout(function(){
                   $("#mrs-form").addClass("inactive");
                   window.scrollTo(0,0);
                   $("#intro").removeClass("inactive");
                   setTimeout(function(){
                     $("#intro").removeClass("future");
                     $("#intro").addClass("current");
                   },10);
                 },1000);
           }
      });
    }


    function setRequiredFields(isRequired){
        var fields = required_fields.val().split("|");
        var index = fields.indexOf(stateId);
        if(isRequired){
            if(index == -1){
                fields.push(stateId);
                required_fields.val(fields.join("|"))
            }
        }else{
            if(index != -1){
                fields.splice(index, 1);
                required_fields.val(fields.join("|"))
            }
        }

    }

    function preload(img) {

        var _img = new Image();
        _img.onload = function(){
            $(img).css({"max-width": _img.width})
        }
        _img.src = $(img).attr("src");

    }




    function validate() {

    	var requiredFields = [];
    	if (required_fields.val().trim() != "") {
    		requiredFields = required_fields.val().split("|").map(function(fieldId) {
                return $('#' + fieldId);
            });
    	}

        var emailField = requiredFields.find(function(field) {
            return field.attr('id') === emailId;
        });

        var errorFields = requiredFields.filter(function(requiredField) {
            console.log(requiredField.val())
            return !requiredField.val() || invalidChars.test(requiredField.val())
        });
        if (emailField && (errorFields.indexOf(emailField) === -1) && !emailFilter.test(emailField.val())) {
            errorFields.push(emailField);
        }

        var readyFields = requiredFields.filter(function(requiredField) {
            return errorFields.indexOf(requiredField) === -1;
        });


        var obj = {
            "errorFields": errorFields,
            "readyFields": readyFields
        }
        return obj;
    }

    function markFields(errorFields, readyFields) {

        $.each(errorFields, function(index, val) {
            var field = $(val);
            field.addClass('ibm-field-error');
            if (field.is('input')) {
                field.parent("span").next().show();

            } else {
                $(".ibm-alert-link", field.parent()).show();

            }
        });

        $.each(readyFields, function(index, val) {
            var field = $(val);
            console.log(field.val())
            field.removeClass('ibm-field-error');
            if (field.is('input')) {
                field.parent("span").next().hide();
            } else {
                console.log(field.parent())
                $(".ibm-alert-link", field.parent()).hide();
            }
        });
    }
});

function showLoader() {
    $("#loader").show();
};

function hideLoader() {
    $("#loader").hide();
}

function doNonBindableInitialization() {
    $("select").select2();

    window.clearInterval(timer)
    var privacy = $("#privacyid");
    var delay = 250;
    var count = 0;
    var maxCount = 20;

    timer = window.setInterval(function() {
        count++
        if (privacy.length > 0 && $("input:checkbox", privacy).length > 0) {
            console.log("timer done")
            $("input:checkbox").each(function() {
                IBMCore.common.widget.checkboxradio.init(this);
            });
            $("input:radio").each(function() {
                IBMCore.common.widget.checkboxradio.init(this);
            });
            window.clearInterval(timer);
        }

        if (count >= maxCount) {
            window.clearInterval(timer);
        }
    }, delay);
}
