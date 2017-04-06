(function (App) {

    // **********************************************************************************************
    // ***** vars

    var _stage = new createjs.Stage("myCanvas");
    var _mainContainer = new createjs.Container();


    // **********************************************************************************************
    // ***** event handlers

    function handleTick() {
        _stage.update();
    }


    // **********************************************************************************************
    // ***** init

    function init() {

        createjs.Ticker.addEventListener("tick", handleTick);
        createjs.Ticker.setFPS(40);

        _stage.canvas.width = App.model.defaultStageWidth;
        _stage.canvas.height = App.model.defaultStageHeight;
        _stage.enableMouseOver(40);
        createjs.Touch.enable(_stage);

        _stage.addChild(_mainContainer);
        App.model.mainContainer = _mainContainer;
    }
    init();


    // **********************************************************************************************
    // ## Public interface

    App.myCanvas = {
    };

}(window.Site));