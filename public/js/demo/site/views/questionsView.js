(function(App) {

    // **********************************************************************************************
    // properties

    var _container = $('#questionsView');
    var _questionText = $("#questionsView .questionText");
    var _continueBtn = $('#questionsView .continueBtn');
    var _textDisplay = $('.mic-container');
    var currQuestion = 0;

    var waka = "waka";

    var _questionsArray = [
                            "Classroom desks in a circle or rows: which is better and why?",
                            "What do you think is better: a resort or booking your own accommodations?",
                            "What kind of person makes the best travel companion?",
                            "Do you like to have an itinerary, or just go with the flow?",
                            "How do you share the things you experience?  With pictures or notes or in person?",
                            "What's your favorite movie or television show? (Please say Big Bang Theory - I binge watch it.)",
                            "Is there anything specific you'd like to learn about?"
                            ];

    var numQuestions = _questionsArray.length;


    // **********************************************************************************************
    // event handlers

    function handlePageChanged() {
        if (App.model.getPage() === App.model.QUESTIONS_PAGE) {
            TweenMax.delayedCall(0.5, function() {
                _container.css("display", "block");
                _textDisplay.css("display", "block");
                TweenMax.fromTo(_container, 1, {alpha: 0}, {alpha: 1, ease: Power4.easeOut});
                TweenMax.fromTo(_textDisplay, 1, {alpha: 0}, {alpha: 0.5, ease: Power4.easeOut});
            });
        } else {
            _container.css("display", "none");
            _textDisplay.css("display", "none");
        }
    }


    // **********************************************************************************************
    // core functions

    function reset() {
        TweenMax.set(_questionText, {alpha: 0})
        TweenMax.to(_questionText, 1, {alpha: 1, delay: 0.3});
        _questionText.html(_questionsArray[currQuestion]);
    }


    // **********************************************************************************************
    // init

    App.eventDispatcher.subscribe(App.model.PAGE_CHANGED, handlePageChanged);

    function init() {
        _continueBtn.on('click', function() {
            if (currQuestion < numQuestions-1) {
                sp.sendQuestion(currQuestion);
                currQuestion++;
                reset();
            } else {
                console.log("end!!!!!! *******************")
                sp.endRecording(currQuestion);
                App.model.setPage(App.model.RESULTS_PAGE);
                // App.resultsView.cont();
            }
        });
        console.log("-------------------------")
        reset();
    }
    init();


    // **********************************************************************************************
    // public interface

    App.questionsView = {
        currQuestion: currQuestion,
        numQuestions: numQuestions,
        waka: waka
    };

}(window.Site));