var site = {

    init: function() {
        // start loading data

        window.Site.contentView.init();

        // window resize event
        $(window).resize(site.handleWindowResize);

        // Note, the stage size first set in init() in model.js
        site.changeStageDimensions();
        // console.log("fire off!")
        window.Site.model.setPage(window.Site.model.CONTENT_PAGE);
        // window.Site.model.setScene(window.Site.model.SHOP_SCENE);

    },

    handleWindowResize: function() {
        // set window size in the model
        window.Site.model.setStageSize({
            width: $(window).width(),
            height: $(window).height()
        });
        site.changeStageDimensions();
    },

    changeStageDimensions: function() {
        $('#wrapper').css("width", window.Site.model.getStageSize().width);
        $('#wrapper').css("height", window.Site.model.getStageSize().height);
    },

    setSameHeight: function(elements){
        // find max height
        var maxHeight = 0;
        for(var elementIndex in elements){
            var $element = $(elements[elementIndex]);
            if ($element.height() > maxHeight){
                maxHeight = $element.outerHeight();
            }
        }

        // set max height
        for(var elementIndex in elements){
            $(elements[elementIndex]).height(maxHeight);
        }

    }

}