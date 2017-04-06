
// TODO: Santelia: Clean up, refactor, and document once we finalize functionality and what this will do with videodesk.

(function($, IBM) {

	var me = IBM.namespace(IBM, 'common.module.contactmodule'),
		$contactModule,
		$cmButton,
		allowedColors = [
			"blue-50",
			"gray-70",
			"green-50",
			"magenta-50",
			"orange-50",
			"purple-50",
			"red-50",
			"teal-50"
		],

		buttonText = "Contact IBM",
		settings = {
			bgColorClass: "",
			buttonColorClass: "",
			color: "gray-70"
		};

	// Inits onload if module and modules are enabled (default).
	me.autoInit = function() {
		if (IBM.common.util.config.isEnabled("contactModuleWidget")) {
			$(me.init); // Run onload.
			me.init()

		}
	};

	// This does the stuff.
	me.init = function () {

		$contactModule = $("#ibm-contact-module");

		setColorClassesToUse();

		// If there's no contact module on the page or if it's empty placeholder right now, stop.
	/*	if (!$contactModule[0] || !$contactModule.children()[0]) {
			return;
		}
*/
		// Add widget class to hide it, then format and set it up deferred.
		// This hides it, so we can put everything else in the back of the queue and process later since it's offscreen.
		$contactModule.addClass("ibm-contact-widget " + settings.bgColorClass + " addtransition ibm-hide ibm-alternate-background");

		setTimeout(setupContactModule, 100);
	};

	function setColorClassesToUse () {
		var colorOverride = IBM.common.util.config.get("contactModuleWidget.color");

		if (colorOverride && $.inArray(colorOverride, allowedColors) > -1) {
			settings.color = colorOverride;
		}

		settings.bgColorClass = "ibm-contact--bg-" + settings.color;
		settings.buttonColorClass = "ibm-btn-" + settings.color;
	}

	function setupContactModule () {
		// Add close button if it doesn't exist already.
		if (!$(".ibm-icononly .ibm-close-link", $contactModule)[0]) {
			$contactModule.prepend('<p class="ibm-icononly"><a class="ibm-close-link" href="#">Close</a></p>');
		}

		//$contactModule.find("ul:last").addClass("ibm-padding-bottom-0");
		$contactModule.addClass("ibm-padding-bottom-0");

		if ($contactModule.find("h2")[0]) {
			buttonText = $contactModule.find("h2").text();
		}

		// Inject sticky button if it doesn't already exist.
		/*if (!$("button.ibm-contact-widget-btn")[0]) {
			$cmButton = $('<button type="button" class="ibm-btn-pri ' + settings.bgColorClass + ' ibm-contact-widget-btn ibm-active" value="">' + buttonText + '</button>').appendTo("#ibm-content-main").click(function (evt) {
					evt.preventDefault();
					me.showContactModule(true);
				});
		}
		*/

		//if (!$("button.ibm-contact-widget-btn")[0]) {
			/*$cmButton = $('<button type="button" class="ibm-btn-pri ibm-contact-widget-btn ibm-active" value="">CONTACT US</button>').appendTo("body").click(function (evt) {
					evt.preventDefault();
					me.showContactModule(true);
				});*/
		//}

		$('.contact-us').bind('click',function (evt) {
       		evt.preventDefault();
       		me.showContactModule(true);
   		});

		// Bind the close link.
		$contactModule.find(".ibm-close-link").click(function (evt) {
			evt.preventDefault();
			me.showContactModule(false);
		});

		// This allows the module to be hidden initially without the transition effect running onload for initial hide.
		setTimeout(function(){
			$contactModule.removeClass("ibm-hide");
		}, 1000);

		// Replace "close" with translated version when translations are available.
		IBM.common.translations.subscribe("dataready", "contactmodulewidget", translateCloseText).runAsap(translateCloseText);
	}

	function translateCloseText () {
		$contactModule.find(".ibm-close-link").html(IBM.common.translations.data.v18main.misc.close);
	}

	// API to show/hide the contact module
	me.showContactModule = function (b) {
		if (b) {
			$contactModule.addClass("ibm-active");
			//$cmButton.removeClass("ibm-active");
		}
		else {
			$contactModule.removeClass("ibm-active");
			//$cmButton.addClass("ibm-active");
		}
	};

me.autoInit();
	/* Wait for META to complete (all head stuff runs) so we can get the config value.
	**********************************************************************************************/
	IBM.common.meta.subscribe("dataReady", "contactmodulewidget", me.autoInit);

})(jQuery, IBMCore);
