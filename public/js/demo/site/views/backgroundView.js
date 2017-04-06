(function(App) {

    // **********************************************************************************************
    // properties

    var _grid = $('#backgroundGrid');
    var _texture = $('#backgroundTexture');
    var _topPanelDiv = $('#resultsView .topPanel');

    // **********************************************************************************************
    // event handlers

    function handleWindowResize() {
        // console.log(_topPanelDiv.height()+300);
        _grid.css("height", App.model.getStageSize().height);
        // _grid.css("height", _topPanelDiv.height() + "px");
        _texture.css("height", App.model.getStageSize().height);
        // _texture.css("height", _topPanelDiv.height() + "px");
    }


    // **********************************************************************************************
    // core functions


    // **********************************************************************************************
    // init

    App.eventDispatcher.subscribe(App.model.WINDOW_RESIZE, handleWindowResize);

    function init() {
        handleWindowResize();
    }
    init();


    // **********************************************************************************************
    // public interface

    App.backgroundView = {
    };

}(window.Site));