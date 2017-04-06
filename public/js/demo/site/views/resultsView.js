(function(App) {

    // **********************************************************************************************
    // properties

    var _container = $('#resultsView');
    var _loadingResults = $('#loadingText');
    var _secondPanel = $('#resultsView .secondPanel');
    var _secondaryBoxes = $('#resultsView .secondaryBoxes');
    var _numCols = 3;
    var _colCounter = 0;
    var _rowCounter = 0;
    var _boxesMinY = 300;
    var _boxVerticalSpacing = 340;

    var _box0 = $('.box0');
    var _box1 = $('.box1');
    var _box2 = $('.box2');
    var _box0Text = $('.box0 .txt');
    var _box1Text = $('.box1 .txt');
    var _box2Text = $('.box2 .txt');

    var _container0Bar = $('.barContainer0 .leftBar');
    var _container1Bar = $('.barContainer1 .leftBar');
    var _container2Bar = $('.barContainer2 .leftBar');

    var _bar0Perc = null;
    var _bar1Perc = null;
    var _bar2Perc = null;

    var _hasPageScrolled = false;

    var _isActive = false;
    var _isFiredOffOnceAlready = false;

    var _numItemsReturned = 10;

    var _acceptedLastWords = ["annuities", "options", "stocks"];
    var _lastWordIndex = null;
    var _lastWord = null;
    var _foundLastWord = false;

    var _complexity_score = null;


    // **********************************************************************************************
    // event handlers

    function handlePageChanged() {
        if (App.model.getPage() === App.model.RESULTS_PAGE) {
            TweenMax.delayedCall(0.5, function() {
                _loadingResults.css("display", "block");
                TweenMax.fromTo(_loadingResults, 1, {alpha: 0}, {alpha: 1, ease: Power4.easeOut});
            });
        } else {
            _loadingResults.css("display", "none");
        }
    }

    function cont() {
        handleResultsReceived();
    }

    function handleResultsReceived() {
        _data = App.dataArray;

        


        // var test_array = [  [100%,50%,96%,98%,61%,100%,94%,19%,79%,1%,1%,31%,52%,0%,100%,100%,71%,10%,0%,0%,0%,100%,4%,41%],
        //                     [0%,0%,5%,95%,48%,0%,0%,0%,0%,0%,13%,13%,14%,85%,22%,100%,90%,100%,48%,100%,91%,100%,9%,0%],
        //                     [94%,100%,91%,4%,66%,38%,24%,92%,20%,21%,47%,100%,89%,27%,100%,3%,2%,18%,0%,100%,98%,14%,100%,100%],
        //                     [2%,72%,98%,91%,100%,0%,0%,0%,0%,76%,100%,0%,0%,100%,66%,0%,0%,0%,28%,100%,100%,100%,60%,54%],
        //                     [7%,52%,100%,67%,0%,0%,59%,82%,7%,100%,100%,100%,47%,0%,4%,3%,70%,0%,1%,100%,1%,18%,100%,4%],
        //                     [11%,52%,95%,23%,0%,0%,4%,97%,28%,38%,20%,100%,100%,23%,8%,3%,2%,33%,1%,100%,100%,100%,100%,12%],
        //                     [42%,63%,98%,1%,0%,17%,98%,100%,98%,0%,2%,100%,100%,0%,3%,48%,0%,0%,26%,100%,100%,100%,100%,6%],
        //                     [0%,1%,0%,97%,100%,2%,24%,1%,0%,100%,100%,0%,1%,100%,98%,100%,100%,1%,100%,100%,100%,13%,100%,1%],
        //                     [26%,98%,98%,66%,0%,0%,100%,100%,88%,0%,3%,100%,100%,0%,96%,3%,0%,0%,0%,100%,100%,4%,100%,100%],
        //                     [0%,93%,41%,0%,0%,0%,0%,96%,1%,0%,50%,100%,100%,23%,0%,3%,3%,79%,2%,100%,93%,100%,100%,1%],
        //                     [0%,93%,41%,0%,0%,0%,0%,96%,1%,0%,50%,100%,100%,23%,0%,3%,3%,79%,2%,100%,93%,100%,100%,1%],
        //                     [0%,86%,51%,3%,5%,0%,0%,87%,3%,0%,53%,100%,95%,30%,0%,9%,6%,0%,61%,87%,100%,100%,100%,1%],
        //                     [0%,86%,51%,3%,5%,0%,0%,87%,3%,0%,53%,100%,95%,30%,0%,9%,6%,0%,61%,87%,100%,100%,100%,1%]];

        findRelevance(traitScoreArray, _data);

        if (!_isFiredOffOnceAlready) {
            matchLastWord();
            _isFiredOffOnceAlready = true;

        }

        _data.sort(function(a, b) {
            return parseFloat(b.relevance) - parseFloat(a.relevance) ;
        });
        // console.log(_data);
        // findRelevance(test_array, _data);
        TweenMax.to(_loadingResults, 0.3, {alpha: 0, ease: Power4.easeOut, onComplete: function() {
            _loadingResults.css("display", "none")
        }})
        if (!_isActive) {
            TweenMax.delayedCall(0.5, function() {
                _container.css("display", "block");
                TweenMax.fromTo(_container, 1, {alpha: 0}, {alpha: 1, ease: Power4.easeOut});
                reset();
            });
        }
        _isActive = true;
    }


    // **********************************************************************************************
    // core functions

    function matchLastWord() {
        _lastWord = window.lastText;

        for (var i=0; i<_acceptedLastWords.length; i++) {
            if (_lastWord.indexOf(_acceptedLastWords[i]) > -1) {
                _lastWord = _acceptedLastWords[i];
                console.log("our last word is: " + _lastWord);
                _lastWordIndex = i;
                _foundLastWord = true;
                break;
            }  
        }
        // console.log("found the last word: " + _foundLastWord);
        // console.log("_lastWord: " + _lastWord);
    }

    function findBarWidthPercent(p_num) {
        var perc = p_num;
        var bgWidth = 1200;
        var pixels = perc * bgWidth;
        return pixels;
    }

    function reset() {

        var _firstItemComplexity = null;

        console.log(_data);

        console.log(window.Site.extraNine[0])

        // add ones at the beginning
        if (_foundLastWord) {
            // console.log("add it in...")
            // console.log("last word index: " + _lastWordIndex)

            var idOffset = 0;
            var theID = null;

            // get complexity level
            if (_complexity_score < 0.3) {
                idOffset = 2;
                _firstItemComplexity = "advanced";
            } else if (_complexity_score > 0.3 && _complexity_score <= 0.6) {
                idOffset = 1;
                _firstItemComplexity = "intermediate";
            } else if (_complexity_score > 0.6) {
                idOffset = 0;
                _firstItemComplexity = "basic";
            }

            var startingID = _lastWordIndex * 3;
            theID = startingID + idOffset;
            
            console.log("startingID: " + startingID);
            console.log("idOffset: " + idOffset)
            console.log("theID: " + theID)

            _data[0] = window.Site.extraNine[theID]
        }

        console.log("complexity score: " + _complexity_score);
        console.log("first item complexity: " + _firstItemComplexity);

        _numItemsReturned = App.dataArray.length;


        _box0.prepend('<img src="' + _data[0].imageURL + '">');
        _box0Text.append('<div>' + _data[0].name + '</div>');

        _box1.prepend('<img src="' + _data[1].imageURL + '">');
        _box1Text.append('<div>' + _data[1].name + '</div>');

        _box2.prepend('<img src="' + _data[2].imageURL + '">');
        _box2Text.append('<div>' + _data[2].name + '</div>');

        window.onscroll = function() {
            if (!_hasPageScrolled) {
                TweenMax.fromTo(_container0Bar, 3, {width: 0}, {width: findBarWidthPercent(_bar0Perc), delay: 1, ease: Power4.easeInOut});
                TweenMax.fromTo(_container1Bar, 3, {width: 0}, {width: findBarWidthPercent(_bar1Perc), delay: 1.2, ease: Power4.easeInOut});
                TweenMax.fromTo(_container2Bar, 3, {width: 0}, {width: findBarWidthPercent(_bar2Perc), delay: 1.4, ease: Power4.easeInOut});
            }
            _hasPageScrolled = true;
        }

        for (var i=3; i<_numItemsReturned; i++) {

            var fileTypeThumbnail = null;

            switch (App.dataArray[i].type) {
                case "audio":
                    fileType = "images/tag-video.png";
                    break;
                case "pdf":
                    fileType = "images/tag-pdf.png";
                    break;
                case "video":
                    fileType = "images/tag-www.png";
                    break;
            }

            var myDiv = '<div class="secondaryBox col' + _colCounter + ' box' + i + '">' +
                    '<img class="theImage" src="' + _data[i].imageURL + '">' +
                    '<div class="txt">' + _data[i].name + '</div>' +
                    '<div class="tag tag'+i+'"><img src="' + fileType + '"></div>'+
                '</div>';
            
            _secondaryBoxes.append(myDiv);

            // var d = $('.box' + i);
            // d.css("top", (_rowCounter*_boxVerticalSpacing+_boxesMinY) + "px");

            if (_colCounter < _numCols-1) {
                _colCounter++;

            } else {
                _colCounter = 0;
                _rowCounter++;
            }
        }
    }

    function findRelevance(p_values_array, p_content_array) {
        var overallValues_array = [];

        console.log(p_values_array);
        console.log(p_content_array);

        for (var q=0; q<p_values_array.length; q++) {
            var question_array = p_values_array[q];
            for (var s=0; s<question_array.length; s++) {
                if (!overallValues_array[s]) {
                    overallValues_array[s] = 0;
                }
                overallValues_array[s] += Number(String(question_array[s]).replace("%", "")) / 100;
            }
        }
        console.log(overallValues_array);
        
        for (var q=0; q<overallValues_array.length; q++) {
            overallValues_array[q] /= p_values_array.length;
        }

        var confidence_array = ["assertiveness", "excitment-seeking", "activity level", "Prone to worry", "immoderation", "vulnerability"];
        var confidence_score = 0;
        for (var c=0; c<confidence_array.length; c++) {
            for (var r=0; r<relTraitsArray.length; r++) {
                if (relTraitsArray[r].toLowerCase() == confidence_array[c].toLowerCase()) {
                    confidence_score += overallValues_array[r];
                    break;
                }
            }
        }
        confidence_score /= confidence_array.length;

        console.log(overallValues_array.length);
        var complexity_array = ["Self-enhancement", "Conscientiousness", "Openness", "Challenge", "Curiosity", "Excitement"];
        var _complexity_score = 0;
        for (var c=0; c<complexity_array.length; c++) {
            console.log("_complexity_score = " + _complexity_score);
            for (var r=0; r<relTraitsArray.length; r++) {
                if (relTraitsArray[r].toLowerCase() == complexity_array[c].toLowerCase()) {
                    console.log(r + "  " + overallValues_array[r] + "  " + overallValues_array.length);
                    if ((!overallValues_array[r]) || (overallValues_array[r] == undefined)) {
                        overallValues_array[r] = 0;
                    }
                    _complexity_score += overallValues_array[r];
                    if (_complexity_score == null) {
                        _complexity_score = Math.random();
                    }
                    break;
                }
            }
        }
        _complexity_score /= complexity_array.length;

        // _complexity_score = Math.random();

        var modality_array = ["orderliness", "self-discipline", "intellect", "imagination", "excitement"];
        var modalityScores_array = [0, 0, 0, 0, 0];
        for (var c=0; c<modality_array.length; c++) {
            for (var r=0; r<relTraitsArray.length; r++) {
                if (relTraitsArray[r].toLowerCase() == modality_array[c].toLowerCase()) {
                    modalityScores_array[c] = overallValues_array[r];
                    break;
                }
            }
        }
        var pdfScore = (modalityScores_array[0] + modalityScores_array[1]) / 2;
        var podScore = modalityScores_array[2];
        var vidScore = (modalityScores_array[3] + modalityScores_array[4]) / 2;
        var modality_score = "pdf";
        if (podScore > pdfScore) {
            modality_score = "audio";
        }
        if ((vidScore > podScore) && (vidScore > pdfScore)) {
            modality_score = "video";
        }

        _bar0Perc = confidence_score;
        _bar1Perc = _complexity_score;

        switch (modality_score) {
            case "pdf":
                _bar2Perc = 0.33;
                break;
            case "audio":
                _bar2Perc = 0.66;
                break;
            case "video":
                _bar2Perc = 1;
        }

        console.log(confidence_score);
        console.log(_complexity_score);
        console.log(modality_score);

        for (var c=0; c<p_content_array.length; c++) {
            var content = p_content_array[c];
            var complexityRelevance = Math.abs(content.complexityRanking - _complexity_score);
            var confidenceRelevance = Math.abs(content.confidenceRanking - confidence_score);
            var modalityRelevance = 0;
            if (content.type == modality_score) {
                modalityRelevance = 1;
            }

            content.relevance = (complexityRelevance + confidenceRelevance + modalityRelevance) / 3;
            console.log("content.relevance = " + content.relevance);
        }
    }



    // **********************************************************************************************
    // init

    App.eventDispatcher.subscribe(App.model.PAGE_CHANGED, handlePageChanged);
    App.eventDispatcher.subscribe(App.model.RESULTS_RECEIVED, handleResultsReceived);

    
    function init() {
    }
    init();


    // **********************************************************************************************
    // public interface

    App.resultsView = {
        cont: cont
    };

}(window.Site));