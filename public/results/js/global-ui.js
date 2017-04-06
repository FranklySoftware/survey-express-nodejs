// JavaScript Document


// this script injects a " Cookie Preferences " link on the footer that opens a truste module window so user can admin his/hers cookies
/*! function() {



    function e() {
        $(".footer ul").append('<li class="footer-link"><a href="#" onclick="truste.eu.clickListener();return false;">' + o + "</a></li>")
    }
    trusteEnabledCountries = ["at", "be", "bg", "ca", "ch", "cy", "cz", "de", "dk", "ee", "es", "fi", "fr", "gb", "gr", "hu", "ie", "it", "lt", "lv", "mx", "nl", "no", "pl", "pt", "ro", "se", "si", "sk", "uk", "us"];
    var r = window.navigator.userLanguage || window.navigator.language;
    if (r.split("-").length > 1) var t = r.split("-")[0].toLowerCase(),
        a = r.split("-")[1].toLowerCase();
    else var t = r.toLowerCase(),
        a = r.toLowerCase();
    for (var s = !1, i = 0; i < trusteEnabledCountries.length; i++)
        if (a === trusteEnabledCountries[i]) {
            s = true;
            break
        }
    var o = "Cookie Preferences";
    "es" === t ? o = "ConfiguraciÃ³n de Cookies" : "fr" === t && (o = "PrÃ©fÃ©rences relatives aux tÃ©moins"), s && ("fr" === t && "ca" === a && (t = "fr_CA"), $.ajax({
        url: "//consent.truste.com/notice?domain=ibm.com&c=ibm-metrics&language=" + t,
        dataType: "script",
        cache: true,
        success: e
    }))
}();*/


// livestream event
function liveStreamPlayer(options){

	var _this = this;
	_this.o = options || {};

	this.show = function(){

		$('#'+_this.o.node).addClass('active');

		$('#persistent-nav-sec a.hero-live-btn').on('transitionend webkitTransitionEnd oTransitionEnd', function () {
			$(this).off('transitionend webkitTransitionEnd oTransitionEnd');
			$(this).css({'display':'none'});
		});
		setTimeout(function(){
			_this.buildIframe( $(this) );
},400)
	}
	this.buildIframe = function(btn){
		if( $('#persistent-nav-sec span').find('iframe') != 'undefined' ) {
			$('#persistent-nav-sec span').find('iframe').remove();
		}
		var iframe = $('<iframe />',{
			'src':'https://livestream.com/accounts/1046/events/'+_this.o.id+'/player?width=560&height=315&autoPlay=true&mute=false',
			'frameborder':0
			}).appendTo($('#persistent-nav-sec span'));

		var src = '';
		if( _this.o.id =='4476919'){
			src = 'https://stage.streamtext.net/player?event=Bluemix&ff=Verdana,sans-serif&fs=16&fgc=e1e1e1&bgc=000000&header=false&controls=false&footer=false&scroll=false&chat=false&content-style=overflow:hidden';
		}else{
			src ='https://stage.streamtext.net/player?event=Bluemix2&ff=Verdana,sans-serif&fs=16&fgc=e1e1e1&bgc=000000&header=false&controls=false&footer=false&scroll=false&chat=false&content-style=overflow:hidden'
		}
		iframe = $('<iframe />',{
			'src':src,
			'frameborder':0,
			'class': 'iframe1',
			'name':'LiveCaptions'
			}).appendTo($('#persistent-nav-sec span'));
		$('#persistent-nav-sec iframe').css({'display':'inline-block','z-index':3})
			$('#persistent-nav-sec iframe').addClass('active');


		setTimeout(function(){
			$(btn).css({'z-index':2,'display':'none'});

		},2000)

	}
	this.show();


}




/* persistant-nav */

(function uiPersistentNav(options){
	var _this = this;

	this.init = function(){

		var nav = $('.ui-persistent-nav');
		if(nav.length > 0){

			for(var i = 0; i < nav.length; i++){

				var elem = $(nav).eq(i);
				var anchorTo = $(elem).attr('data-anchor');
				var btns = $(elem).attr('data-cta');
				var o = {
					'anchorTo': anchorTo,
					'btns': btns
				}
				var bn = new this.buildNav( o )
			}

		}

	}

	this.buildNav = function( o ){

		var _bn = this;

		var btns = o.btns.split(",");

		this.anchorTo = function( a ){
			$('html, body').animate({
				scrollTop: $('#'+ a).offset().top - 150
			}, 420);
		}


		for(var i = 0 ; i < btns.length; i++){
			$( '#' + btns[i].replace(/\s/g, '') ).bind('click', function( a ){
				return function(){
					_bn.anchorTo( a );
				}
			}( o.anchorTo )).attr('href','javascript: void(0);')
		}

	}

	this.init();

})();

/* Tab Widget */
(function bmTabWidget(options){
	var _this =  this;
	_this.o = options || {};


	this.init = function(){

		// add click to all html5 videos
		var videos = $('video');
		for(var i = 0; i < videos.length; i++){
			console.log('video')
			$(videos[i]).click(function(){this.paused?this.play():this.pause();});
		}


		var btm = $('.ui-tabs-module');


		if( btm.length > 0 ){

			for(var i = 0; i < btm.length; i++){
				new this.tabWidget( btm[i] , $( btm[i] ).hasClass('ui-m-dropdown') );
			}

		}

	}


	this.tabWidget = function(cnt, md){
		var td =  this;
		td.options = {
			tabs : [],
			haveDropdown: md,
			selectMenuLabel:'',
		}

		this.select = function(){
			return $('<select />').appendTo( $(btnCnt) ).bind('change', function(){
				if (typeof(pauseAllVideos) == 'function'){
					pauseAllVideos();
				}
				td.show( td.options.tabs[ $(this).find(" option:selected" ).val() ] ) ;
			});
		}
		this.selectLabel = function(){
			return $('<div />').appendTo( $(btnCnt) );
		}

		this.option = function( o ){
			return $('<option />',{'html':o.html,'value':o.val});
		}

		this.show = function(obj){

			if(td.active == obj.index){
				return;
			}

			td.active = obj.index;
			$(obj.btnCnt).find(' > a ').removeClass('active');
			$(obj.slidesCnt).find(' > div ').removeClass('active');
			$(obj.btnCnt).find(' > a ').eq(obj.index).addClass('active');
			$(obj.slidesCnt).find(' > div ').eq(obj.index).addClass('active');

			if(td.options.haveDropdown){
				$(obj.btnCnt).find(' select ').find('option').eq(obj.index).prop('selected', true);
				td.options.selectMenuLabel.html( $(obj.btnCnt).find(' select ').find(" option:selected" ).text() )
			}

		}

		var btnCnt = $(cnt).find('.nav');
		var slidesCnt = $(cnt).find('.slides');
		var slide = $(cnt).find('.slides > div');


		/* Add Tabbed button */
		$('#next-tab-button').bind('click', function( obj ){


			if (typeof(pauseAllVideos) == 'function'){
				pauseAllVideos();
			}
			var nextNumber = td.active + 1;

			if (nextNumber >= $(cnt).find('.nav > a').length ){
				td.active = -1;
				nextNumber = 0;
			}

			$(btnCnt).find(' > a ').eq(td.active).removeClass('active');
			$(slidesCnt).find(' > div ').eq(td.active).removeClass('active');
			$(btnCnt).find(' > a ').eq(nextNumber).addClass('active');
			$(slidesCnt).find(' > div ').eq(nextNumber).addClass('active');

			td.active++;
		});

		if(md){
			var selectMenu = td.select();
			td.options.selectMenuLabel = td.selectLabel();
		}

		for(var i = 0; i < $(cnt).find('.nav > a').length; i++){
			var href = $(cnt).find('.nav > a')[i];
			var mySlide = slide[i];
			var obj = {
				btnCnt : btnCnt,
				slidesCnt : slidesCnt,
				btn : href,
				slide : mySlide,
				index : i
			}

			td.options.tabs.push(obj)

			$(href).bind('click', function( obj ){
				return function(){
					if (typeof(pauseAllVideos) == 'function'){
						pauseAllVideos();
					}
					td.show( obj );
				}
			}( obj ) ).attr('href','javascript: void(0);');

			// if we are building mobile select
			if(md){
				var opt = {
					html : $(href).html(),
					val :  i
				}

				$(selectMenu).append( td.option( opt ) )
			}

			if( i == 0 ){
				if(md){
					$(td.options.selectMenuLabel).html( $(href).html() )
				}
				td.show( obj );
			}
		}

	}


	this.init();

})();
/* END Tab Widget */

// Global header navigation menu and submenu
function globalHeaderUI(){
	var _this = this;
	_this.isMobile = false;

	this.init = function(){



		// adding click action to solutions/discover link/tab and an overview link for the mobile view
		var overviewLink = $('<a />',{'class':'m-overview','href':'/cloud-computing/bluemix/solutions/','html':'Overview'})
		$('.bluemix-nav-unauthorized').find('.subnav-cnt').eq(0).find('.col-6-1').eq(0).prepend(overviewLink);


		$(window).resize(function(){
			_this.resize();
		});

		// add new touch to mobile menu
		$('#header-mobile-button').bind('click', function(){
			_this.showMobileMenu();
		});


		for(var i =0; i< $('.li-has-subnav').length; i++){
			var href = $('.li-has-subnav').eq(i).find('a').eq(0);
			var subnav = $('.li-has-subnav').eq(i).find('nav').eq(0);
			var o = {
				subnav:subnav,
				li: $('.li-has-subnav').eq(i)
			}
			$(href).bind('click',function( obj ){
				return function(){
					if(_this.isMobile){
						_this.openSubNav( obj );
					}else{
						window.location.href = '//'+ window.location.host + "/cloud-computing/bluemix/solutions/";
					}
				}
			} (o) );
		}


		this.resize();

		$(document).bind('click', function(event){
			if( $(event.target).hasClass('has-submenu') || $(event.target).hasClass('bluemix-nav-menu-button') || $(event.target).hasClass('sub-header') ){
				return;
			}
		})

		$('main').bind('click', function(event){
			$('body').removeClass('mobile-nav-open');
			$('body').css('overflow','');
		});

	}

	this.openSubNav = function( obj ){

		if( $(obj.subnav).css('display') == 'none'){
			$(obj.subnav).css('display','block');
			$(obj.li).addClass('active');
		}else{
			$(obj.subnav).css('display','none');
			$(obj.li).removeClass('active');
		}

	}

	this.showMobileMenu = function(){
		if( $('body').hasClass('mobile-nav-open') ){
			$('body').removeClass('mobile-nav-open');
			$('body').css('overflow','');
		}else{
			$('body').addClass('mobile-nav-open');
			$('.bluemix-nav-unauthorized').css('height', _this.wh+22);
			$('body').css('overflow','hidden');
		}
	}

	this.show = function(o){
		if(o.cnt.css('display') == 'none'){
			o.cnt.css('display','block');
		}else{
			o.cnt.css('display','none');
		}
	}

	this.resize = function(){

		_this.ww = $(window).width();
		_this.wh = $(window).height();
		if( _this.ww < 1074 ){
			if( !_this.isMobile ){
				$('.li-has-subnav').find('nav').css('display','none');
			}
			_this.isMobile = true;
			$('.hide-if-expired').css({'max-height':'none','height':'initial'});
			$('.subnav-cnt').css({'max-height':'none','position':'relative','top':0});
			$('.bluemix-nav-unauthorized').css('height', _this.wh+22);

		}else{
			_this.isMobile = false;
			$('.li-has-subnav').find('nav').css('display','block');
			$('body').css('overflow','');
			$('.subnav-cnt').css({'max-height':'','position':'absolute','top':'50px'})
			$('.bluemix-nav-unauthorized').css('height', '');
			$('body').removeClass('mobile-nav-open');

		}


	}

	this.init()

};// End Global header navigation menu and submenu



/* same col height widget */
function sameHeightCol(){
	var _this = this;

	this.init = function(){

		var sameHeight = $('.ui-same-height-cols');


		if( sameHeight.length > 0 ){

			for(var i = 0; i < sameHeight.length; i++){
				new this.heightWidget( sameHeight[i] );
			}

		}

	}

	this.heightWidget = function(cnt){

		var hw = this;

		hw.opts = {
			cnt: cnt,
			cols : $(cnt).find(' > *'),
			tallest: 0
		};

		this.onresize = function(opts){

			opts.tallest = 0;

			$(opts.cnt).find(' > *').outerHeight( '' );

			for(var c = 0; c < opts.cols.length; c++){
				if( $(opts.cols[c]).outerHeight()  > opts.tallest){
					opts.tallest = $(opts.cols[c]).outerHeight() ;
				}
			}
			$(opts.cnt).find(' > *').outerHeight( opts.tallest );
		}

		hw.onresize(hw.opts);

		$(window).resize( function(){
			hw.onresize(hw.opts);
		});

	}

	this.init();

};
$(document).ready(function(e) {
    sameHeightCol();
	globalHeaderUI();
});
/* same col height widget */





// see if its a youku video

function isYouKu(){
	var youkuRedirect = false;
	var userLanguage = window.navigator.userLanguage || window.navigator.language
	var chinese = [
			{"Code":"zh","Name":"Chinese"},
			{"Code":"zh-CN","Name":"Chinese (S)"},
			{"Code":"zh-HK","Name":"Chinese (Hong Kong)"},
			{"Code":"zh-MO","Name":"Chinese (Macau)"},
			{"Code":"zh-SG","Name":"Chinese (Singapore)"}
		]

	for(var i = 0; i < chinese.length; i++){
		if(chinese[i].Code.toLowerCase() == userLanguage.toLowerCase()){
			youkuRedirect = true;
		}
	}
	return youkuRedirect;
}





// global youtube video player
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var ytAPIReady = false;

function onYouTubeIframeAPIReady(ytID) {
	console.log('youtube iframe api ready')
	ytAPIReady = true;
}

function ytVideoReady(v){
	//console.log('video is ready');
}

allYouTubePlayers = []

function pauseAllVideos(){
	for(var i = 0; i < allYouTubePlayers.length; i++){
		allYouTubePlayers[i].node.pauseVideo();
	}
}

function videoOverlayPlayer(options){
	var _this = this;
	_this.o = options;
	_this.o.inline = false;
	_this.showIt = false;

	this.uniqueID = function(label){

		var id = label || '';
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for( var i=0; i < 20; i++ ){
			id += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return id;

	}

	this.video = function(params){
		//console.log(params.node + '    ' + params.vid)
    var pVars = {
      'autoplay': 0,
      'controls': 3,
      'autohide':1,
      'wmode':'transparent',
      'rel':0,
      'modestbranding':1,
      'showinfo':0,
      'fs':1,
      'vq':'hd1080',
      'h1':0
      //list: 'PLGIu8R0SYWDrkx5ZR3xDUGuymUyHTPwGP',
      //listType: 'playList'
      //,'start':options.seekTo
    };
    if (params.list) {
        pVars.list = params.list;
        pVars.listType = 'playList';
    }
		var newPlayer = new YT.Player(params.node, {
			height: '100%',
			width: '100%',
			playerVars: pVars,
			videoId:params.vid,
			//,events: {'onStateChange': pauseAllVideos}
		});
		var p = {
			vid:	_this.o.vid,
			node: newPlayer,
			nodeID : params.node
		}

		allYouTubePlayers.push(p);


	}

	this.onresize = function(){

		var ww = ($(window).width() / 16) * (  ( $(window).width() < 767)  ? .94 : .70 );
		var vw = ( ww * 16);
		var vh = ( vw / 16) * 9;
		var vl = vw / 2;
		var vt = vh / 2;

		$('.global-video-overlay').find(' > div').css({'width':vw,'height':vh,'top':'50%','left':'50%','margin-top':-vt,'margin-left':-vl});


		// adjust the play button
		/*if(_this.o.hover){
			var playBtn = $(_this.o.btn).find('span');
				console.log('playBtn ' + playBtn)
				playBtnW = Number($(playBtn).outerWidth())/2;
				playBtnH = $(playBtn).outerHeight();
				console.log('playBtnW ' + playBtnW)
				//$(playBtn).css({'margin-top': -playBtnW,'margin-left': -playBtnW });
				$(playBtn).css({'margin-left': -playBtnW });
		}*/

	}

	this.build = function(){


		var appendTo = 'body';
		var appendClass = 'global-video-overlay';
		var paddingLeft = 0;
		var paddingRight = 0;
		if( $(_this.o.btn).hasClass('inline') ){
			_this.o.inline = true;
			_this.o.inlineCnt = _this.o.btn;
			paddingLeft = $(_this.o.btn.parent()).css('padding-left')
			paddingRight = $(_this.o.btn.parent()).css('padding-right')
			$(_this.o.inlineCnt).css({'position':'relative'})
			appendTo = $(_this.o.inlineCnt);
			appendClass = 'global-video-inline-overlay';

		}





		_this.overlayID = _this.uniqueID('overlay-id-');
		_this.overlay = $('<div />',{
			'class':appendClass,
			'id': _this.overlayID
		}).appendTo( appendTo ).addClass( (_this.o.inline) ? 'inline' : '' )//.css({'padding-left': paddingLeft,'padding-right': paddingRight})


		_this.o.nodeID = this.uniqueID('video-cnt-');
		_this.videoNode = $('<div />',{
			'class':(_this.o.inline) ? 'global-video-inline-container': 'global-video-container'//,
			//'id': _this.o.nodeID
		}).appendTo( $(_this.overlay) ).css('display','inline-block');

		var iframeDiv = $('<div />',{
			'id': _this.o.nodeID
		}).appendTo( $(_this.videoNode) )

		if( !(_this.o.inline) ){

			_this.closeBtn = $('<a />',{
				'class':'global-video-close-btn',
				'href':'javascript: void(0);'
			}).appendTo( $(_this.overlay) ).bind('click',function(){
				_this.close();
			});



		}


		var btnID = _this.uniqueID('btn-');
		$( _this.o.btn ).click(function( o ){
			return function(){
				_this.show(o , $(this) );
			}
		}(_this.o )).attr({'href':'javascript: void(0);','id':btnID});

		if(_this.o.hover){
			var span = $('<span />').appendTo( '#' + btnID );
			//var img = $('<img />',{'src':'/cloud-computing/bluemix/api/global/imgs/video-play-icon.svg'}).appendTo( span );
		}




		$('#' + _this.overlayID ).on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e){
			if(_this.showIt){
				$(_this.overlay).css('display','inline-block');
				if( !(_this.o.inline) ){
					$('body').css({'overflow-y':'hidden'});
				}
				$('#' + _this.o.nodeID ).addClass('active');
				//_this.videoManager();
			}else{
				$(_this.overlay).css('display','none');
				$('body').css({'overflow-y':'visible'});
			}
		})

		_this.params = {
			vid:	_this.o.vid,
			node: _this.o.nodeID,
			nodeID: _this.o.nodeID
		}

		_this.video(_this.params);

		this.onresize();

	}

	this.show = function(o, btn){

		// if the user's language is chinese redirect them to the youku.com site
		if( isYouKu() ){
			window.open('http://v.youku.com/v_show/'+_this.o.vid+'==.html','_blank');
			return;
		}




		if( $(btn).hasClass('inline') ){
			$(btn).find('img').css( {'opacity':0} );
		}

		pauseAllVideos();

		_this.showIt = true;

		$(_this.overlay).css('display','inline-block');

		setTimeout(function(){
			$('#' + _this.overlayID ).addClass('active');
		},100);


		setTimeout(function(){
			for(var i = 0; i < allYouTubePlayers.length; i++){
				if( _this.o.nodeID == allYouTubePlayers[i].nodeID){
					allYouTubePlayers[i].node.playVideo();
				}
			}
		},1200)

		setTimeout(function(){
			$(_this.closeBtn).addClass('active');
		},2000)

		if( !(_this.o.inline) ){
			$('body').css({'overflow-y':'hidden'});
		}

		this.onresize();

	}

	this.videoManager = function(){
		for(var i = 0; i < allYouTubePlayers.length; i++){
			if(_this.o.vid == allYouTubePlayers[i].vid){
				allYouTubePlayers[i].node.playVideo();
			}else{
				allYouTubePlayers[i].node.pauseVideo();
			}
		}
	}

	this.close = function(){
		for( var i = 0; i < allYouTubePlayers.length; i++){
			allYouTubePlayers[i].node.pauseVideo();
		}
		$('#' + _this.overlayID ).removeClass('active');
		$(_this.closeBtn).removeClass('active');
		$('#' + _this.o.nodeID ).removeClass('active');
		_this.showIt = false;
	}

	$(window).resize(function(){
		_this.onresize();
	})

	this.build();
}



$(function initOverlayPlayer(){
	if(ytAPIReady){
		return
	}
	setTimeout(function(){
		if(ytAPIReady){
			$( ".video-overlay" ).each(function() {

				if( $( this ).attr('data-vid') != undefined ){
					var vID = $( this ).attr('data-vid');
          var list = $( this ).attr('list');
          if(vID != ""){
						var newModule = new videoOverlayPlayer({ vid:vID, list:list, btn: $( this ), hover: $(this).hasClass('ui-hover') })
					}else{
						alert('you are implementing a video overlay but you didn\'t provide the video ID on the "data-vid" attribute')
					}
				}else{
					alert('you are implementing a video overlay but you didn\'t provide "data-vid" attribute')
				}
			});
		}else{
			initOverlayPlayer()
		}
	},100)

});


(function uiExpand(){
	var _this = this;

	this.init = function(){
		var section = $('.ui-expand');
		for(var i = 0 ; i < section.length; i++){
			new this.build( section[i] );
		}
	}

	this.build = function(sec){

		var _e = this;

		this.closeSection = function(sec, open){

		 	$('html,body').animate({ scrollTop: $( sec ).offset().top - 50 /*header height */ }, 420 );

		 	if(open){
				$(sec).animate({ 'height': $(sec).find(' > div ').outerHeight(true) }, 420 );
			}else{
				$(sec).animate({ 'height': 0 }, 320 );
				//$(sec).removeClass('active');
			}

		}

		this.addCloseBtn = function(sec){
			var btn = $('<a />',{'class':'section-close-btn','href':'javascript: void(0);'}).bind('click', function(){
				_e.closeSection( sec, false );
			}).appendTo( $(sec).find(' > div') )
		}( sec )


		var btns = $(sec).attr('data-cta').split(",");

		for(var i = 0 ; i < btns.length; i++){
			$( '#' + btns[i].replace(/\s/g, '') ).bind('click', function(props){
				return function(){
					_e.closeSection( sec, true );
				}
			}( sec )).attr('href','javascript: void(0);')
		}

	}
	this.init();


})();
