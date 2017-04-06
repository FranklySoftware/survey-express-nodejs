
function getAppSiteLang() {
	console.log('getAppSiteLang window.Site:');
	console.log(window.Site);
	if (window.Site && window.Site.lang)
		return window.Site.lang
	else
		return'en';
}
function getAppSiteFormEnabled() {
	console.log('getAppSiteFormEnabled window.Site:');
	console.log(window.Site);
	//if (window.Site.mrsLangs.indexOf(window.Site.lang) !== -1)
	if (window.Site.formEnabled == 'true')
		return true
	else
		return false;
}
function addAnswer(question, answer, otherText) {
	$.ajax({
        url: '/'+getAppSiteLang()+'/answer',
        data: {'question': question, 'answer': answer, 'otherText':otherText},
        method: 'POST',
        async: false,
        success: function(result) {
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("textStatus: " + textStatus);
            console.log("errorThrown: " + errorThrown);
        }
    });
}

function addAnswers(js) {
    $.ajax({
        url: '/'+getAppSiteLang()+'/answer',
        data: {'answers': js},
        method: 'POST',
        async: false,
        success: function(result) {
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("textStatus: " + textStatus);
            console.log("errorThrown: " + errorThrown);
        }
    });
}

function startForm() {
	if (!getAppSiteFormEnabled()){
		console.log('API /start');
		$.ajax({
        url: '/'+getAppSiteLang()+'/start',
        method: 'POST',
        async: false,
        success: function(result) {
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("textStatus: " + textStatus);
            console.log("errorThrown: " + errorThrown);
        }
    });
	}
}

function iwm() {
    $.ajax({
        url: '/'+getAppSiteLang()+'/iwm',
        method: 'GET',
        async: false,
        success: function(result) {
            //alert("Success");
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("textStatus: " + textStatus);
            console.log("errorThrown: " + errorThrown);
        }
    });
}

function getCountries() {
    $.ajax({
        url: '/'+getAppSiteLang()+'/countries',
        method: 'GET',
        success: function(result) {
            for(var i = 0; i < result.length; i++) {
                //alert(result[i].label);
                var val = result[i].val;
                var label = result[i].label;
                $("#country_cd_select").append('<option value=' + val + '>' + label + '</option>');
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("textStatus: " + textStatus);
            console.log("errorThrown: " + errorThrown);
        }
    });
}


$( "#country_cd_select" ).change(function() {
    $("#states_select_container").hide();
    $("#state_cd_select").html("");
    $.ajax({
        url: '/'+getAppSiteLang()+'/countrieStates',
        method: 'GET',
        data: {countryCd: $( "#country_cd_select" ).val() },
        success: function(result) {
            if (!jQuery.isEmptyObject(result)) {
                $("#state_cd_select").html('<option>State</option>');
                for(var val in result) {
                    var label = result[val];
                    $("#state_cd_select").append('<option value=' + val + '>' + label + '</option>');
                }
                $("#states_select_container").show();
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("textStatus: " + textStatus);
            console.log("errorThrown: " + errorThrown);
        }
    });
});

$('#contactFlag').click(function() {
    if($('#contactFlag').prop('checked')) {
        $('#contactMediumContainer').show();
    } else {
        $('#contactMediumContainer').hide();
    }
});

$("#email_audit_submit0").click(function() {
	var name = $("#email_audit_name").val();
	var email = $("#email_audit_email_address").val();
    var errorMsg = "";

    var re = /^[a-zA-Z ]+$/;
    if (re.name) {
    } else {
        errorMsg += "Please enter a valid name<br/>";
    }

    re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    if(re.test(email)) {
    } else {
        errorMsg += "Please enter a valid email address";
    }

    if (errorMsg) {
        $("#error_msg").html(errorMsg);
        return false;
    } else {
    	$.ajax({
            url: '/'+getAppSiteLang()+'/user',
            data: {'name': name, 'email': email},
            method: 'POST',
            success: function(result) {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("textStatus: " + textStatus);
                console.log("errorThrown: " + errorThrown);
            }
        });
    }
});

$('a').click(function() {
        var url = $(this).attr("href");

        if ($(this).attr("data-vid")) {
          url = "https://www.youtube.com/watch?v=" + $(this).attr("data-vid");
        }
        if (url && url.length > 0 && url != "#") {
            $.ajax({
                url: '/'+getAppSiteLang()+'/track',
                data: {'url': url},
                method: 'POST',
                async: false,
                success: function(result) {
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log("textStatus: " + textStatus);
                    console.log("errorThrown: " + errorThrown);
                }
            });
        }
});

$(function() {
    var i = 0;
    var assets = [];
    $(".assetTracking").each(function(){
        assets[i++] =  $(this).attr("atName"); //this.id
    });

    if (assets.length > 0) {
        $.ajax({
            url: '/'+getAppSiteLang()+'/assettrack',
            data: {assets: JSON.stringify(assets)},
            method: 'POST',
            async: false,
            success: function(result) {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("textStatus: " + textStatus);
                console.log("errorThrown: " + errorThrown);
            }
        });
    }
});
