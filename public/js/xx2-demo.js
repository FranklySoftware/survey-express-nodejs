/**
 * Copyright 2014 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*global $:false */

'use strict';

var sp = {};
var ended = false;

var relTraitsArray = ["Conscientiousness", 
                      "Achievement striving", 
                      "Cautiousness", 
                      "Dutifulness", 
                      "Orderliness", 
                      "Self-discipline", 
                      "Self-efficacy", 
                      "Openness", 
                      "Adventurousness", 
                      "Artistic interests", 
                      "Emotionality", 
                      "Imagination", 
                      "Intellect", 
                      "Liberalism", 
                      "Anxiety", 
                      "Immoderation", 
                      "Vulnerability", 
                      "Activity level", 
                      "Assertiveness", 
                      "Excitement-seeking", 
                      "Stability", 
                      "Structure", 
                      "Challenge", 
                      "Curiosity", 
                      "Excitement", 
                      "Openness to change", 
                      "Self-enhancement"];
var traitScoreArray = [];

$(document).ready(function() {

  // Only works on Chrome
  if (!$('body').hasClass('chrome')) {
    $('.unsupported-overlay').show();
  }

  var totalString = "";
  var textString = "It’s not just a red-blue political divide, either. There is a kind of two-parent arc that starts in the West in Utah, runs up through the Dakotas and Minnesota and then down into New England and New Jersey. ";

  // UI
  var micButton = $('.micButton'),
    micText = $('.micText'),
    transcript = $('#text'),
    errorMsg = $('.errorMsg');

  // Service
  var recording = false,
    speech = new SpeechRecognizer({
      ws: '',
      model: 'WatsonModel'
    });

  speech.onstart = function() {
    console.log('demo.onstart()');
    recording = true;
    micButton.addClass('recording');
    micText.text('Press again when finished');
    errorMsg.hide();
    transcript.show();

    // Clean the paragraphs
    transcript.empty();
    $('<p></p>').appendTo(transcript);
  };

  speech.onerror = function(error) {
    console.log('demo.onerror():', error);
    recording = false;
    // micButton.removeClass('recording');
    // displayError(error);
  };

  speech.onend = function() {
    totalString += textString;
    textString = make100(textString);
    endIt();
  };

  sp.endRecording = function() {
    ended = true;
    endIt();
  }

  sp.sendQuestion = function() {
    totalString += textString;
    textString = make100(textString);
    console.log("totalString: " + totalString);
    console.log("sending textString: " + textString);
    analyzeThis();
    textString = 'Clear. ';
  }


  function make100(str) {
    var tempString = str;
    var count = countWords(str);

    if (count!=0) {
      while (count < 100) {
        str += tempString;
        count = countWords(str);
      }
    }
    return str;
  }

  function countWords(str) {
    var count = 0;
    for (var i = 1; i <= str.length; i++) {
      if (str.charAt(i) == " ") {
        count ++;
      }
    }
     return count + 1;

  }

  function endIt() {
    console.log('demo.onend()');
    // setTimeout(analyzeThis, 500);
    analyzeThis();
    recording = false;
    speech.stop();
    // micButton.removeClass('recording');
    // micText.text('Press to start speaking');
  }

  speech.onresult = function(data) {
    // console.log('demo.onresult()');
    showResult(data);

  };

  sp.startRecording = function() {
    // setTimeout(analyzeThis, 3000)

  // function startRecording() {
    console.log("please start recording...")
    if (!recording) {
      speech.start();
    } else {
      speech.stop();
      // micButton.removeClass('recording');
      // micText.text('Processing speech');
    }
  }

  micButton.click(function() {
    
    startRecording();
    // if (!recording) {
    //   speech.start();
    // } else {
    //   speech.stop();
    //   micButton.removeClass('recording');
    //   micText.text('Processing speech');
    // }
  });

  function showResult(data) {
    // console.log("should be working...")
    // console.log(data)
    // console.log(data.results[0].alternatives[0].transcript)
    //if there are transcripts
    if (data.results && data.results.length > 0) {

      //if is a partial transcripts
      if (data.results.length === 1 ) {
        var paragraph = transcript.children().last(),
          text = data.results[0].alternatives[0].transcript || '';

        //Capitalize first word
        text = text.charAt(0).toUpperCase() + text.substring(1);
        // if final results, append a new paragraph
        if (data.results[0].final){
          text = text.trim() + '.';
          $('<p></p>').appendTo(transcript);
          textString += text;
          console.log("textString " + textString);
          $(".content").html(textString);
        }
        paragraph.text(text);
      }
    }
    transcript.show();
  }

  function displayError(error) {
    var message = error;
    try {
      var errorJson = JSON.parse(error);
      message = JSON.stringify(errorJson, null, 2);
    } catch (e) {
      message = error;
    }

    errorMsg.text(message);
    errorMsg.show();
    transcript.hide();
  }

  // submit event
  function transcriptAudio(audio) {
    $('.loading').show();
    $('.error').hide();
    transcript.hide();
    $('.url-input').val(audio);
    $('.upload-form').hide();
    // Grab all form data
    $.ajax({
      url: '/',
      type: 'POST',
      data: $('.upload-form').serialize(),
      success: showAudioResult,
      error: _error
    });
  }

  //personality stuff
  
  var widgetId = 'vizcontainer', // Must match the ID in index.jade
    widgetWidth = 700, widgetHeight = 700, // Default width and height
    personImageUrl = 'images/app.png'; // Can be blank

  // Jquery variables
  var $content = $('.content'),
    $loading = $('.loading'),
    $error = $('.error'),
    $errorMsg = $('.errorMsg'),
    $traits = $('.traits'),
    $results = $('.results');

  /**
   * Clear the "textArea"
   */
  $('.clear-btn').click(function(){
    $('.clear-btn').blur();
    $content.val('');
    updateWordsCount();
  });

  /**
   * Update words count on change
   */
  $content.change(updateWordsCount);

  /**
   * Update words count on copy/past
   */
  $content.bind('paste', function(e) {
    setTimeout(updateWordsCount, 100);
  });

  /**
   * 1. Create the request
   * 2. Call the API
   * 3. Call the methods to display the results
   */
  // $('.analysis-btn').click(analyzeThis);

  function analyzeThis(){
    $('.analysis-btn').blur();
    $loading.show();
    $error.hide();
    $traits.hide();
    $results.hide();

   //textString = "It’s not just a red-blue political divide, either. There is a kind of two-parent arc that starts in the West in Utah, runs up through the Dakotas and Minnesota and then down into New England and New Jersey. It encompasses both the conservative Mountain West and the liberal Northeast.It’s not just a red-blue political divide, either. There is a kind of two-parent arc that starts in the West in Utah, runs up through the Dakotas and Minnesota and then down into New England and New Jersey. It encompasses both the conservative Mountain West and the liberal Northeast.It’s not just a red-blue political divide, either. There is a kind of two-parent arc that starts in the West in Utah, runs up through the Dakotas and Minnesota and then down into New England and New Jersey. It encompasses both the conservative Mountain West and the liberal Northeast.It’s not just a red-blue political divide, either. There is a kind of two-parent arc that starts in the West in Utah, runs up through the Dakotas and Minnesota and then down into New England and New Jersey. It encompasses both the conservative Mountain West and the liberal Northeast.";

    $.ajax({
      type: 'POST',
      data: {
        text: textString
      },
      url: '/analyze',
      dataType: 'json',
      success: function(response) {
        console.log("success");
        $loading.hide();

        if (response.error) {
          showError(response.error);
        } else {
          $results.show();
          getTraits(response, relTraitsArray);
          //showTextSummary(response);
          //showVizualization(response);
        }
          console.log("ENDED1......" + ended)
          if (ended) {
            console.log("ENDED2......" + ended)
            window.Site.model.resultsReceived();
          }

      },
      error: function(xhr) {
        console.log("error " + JSON.parse(xhr.responseText));
        console.log(xhr);
        $loading.hide();
        var error;
        try {
          error = JSON.parse(xhr.responseText);
        } catch(e) {}
        showError(error.error || error);
      }
    });
  }

  /**
   * Display an error or a default message
   * @param  {String} error The error
   */
  function showError(error) {
    var defaultErrorMsg = 'Error processing the request, please try again later.';
    $error.show();
    $errorMsg.text(error || defaultErrorMsg);
  }

  /**
   * Displays the traits received from the
   * Personality Insights API in a table,
   * just trait names and values.
   */
  function getTraits(data, relTraitsArray) {
    console.log('showTraits()');
    $traits.show();
    var currTraitsScore = [];
    var traitList = flatten(data.tree),
      table = $traits;

    table.empty();

    // Header
    $('#header-template').clone().appendTo(table);

    // For each trait
    // console.log(traitList);
    for (var j = 0; j <relTraitsArray.length; j++) {
        for (var i = 0; i < traitList.length; i++) {
          var elem = traitList[i];

          var Klass = 'row';
          Klass += (elem.title) ? ' model_title' : ' model_trait';
          Klass += (elem.value === '') ? ' model_name' : '';
          //console.log(elem.id);
          //console.log(elem.value);
          if (elem.id == relTraitsArray[j]) {
            console.log(relTraitsArray[j] + ": " + elem.value);
            currTraitsScore.push(elem.value);

          }
        }
    

      // if (elem.value !== '') { // Trait child name
      //   $('#trait-template').clone()
      //     .attr('class', Klass)
      //     .find('.tname')
      //     .find('span').html(elem.id).end()
      //     .end()
      //     .find('.tvalue')
      //       .find('span').html(elem.value === '' ?  '' : (elem.value + ' (± '+ elem.sampling_error+')'))
      //       .end()
      //     .end()
      //     .appendTo(table);
      // } else {
      //   // Model name
      //   $('#model-template').clone()
      //     .attr('class', Klass)
      //     .find('.col-lg-12')
      //     .find('span').html(elem.id).end()
      //     .end()
      //     .appendTo(table);
      // }
    }

    traitScoreArray.push(currTraitsScore);
    console.log("currTraitsScore:" + currTraitsScore);
    console.log("traitScoreArray:" + traitScoreArray);
  }

  /**
   * Returns a 'flattened' version of the traits tree, to display it as a list
   * @return array of {id:string, title:boolean, value:string} objects
   */
  function flatten( /*object*/ tree) {
    var arr = [],
      f = function(t, level) {
        if (!t) return;
        if (level > 0 && (!t.children || level !== 2)) {
          arr.push({
            'id': t.name,
            'title': t.children ? true : false,
            'value': (typeof (t.percentage) !== 'undefined') ? Math.floor(t.percentage * 100) + '%' : '',
            'sampling_error': (typeof (t.sampling_error) !== 'undefined') ? Math.floor(t.sampling_error * 100) + '%' : ''
          });
        }
        if (t.children && t.id !== 'sbh') {
          for (var i = 0; i < t.children.length; i++) {
            f(t.children[i], level + 1);
          }
        }
      };
    f(tree, 0);
    return arr;
  }
  /**
   * Construct a text representation for big5 traits crossing, facets and
   * values.
   */
  function showTextSummary(data) {
    // console.log('showTextSummary()');
    // var paragraphs = [
    //   assembleTraits(data.tree.children[0]),
    //   assembleFacets(data.tree.children[0]),
    //   assembleNeeds(data.tree.children[1]),
    //   assembleValues(data.tree.children[2])
    // ];
    // var div = $('.summary-div');
    // div.empty();
    // paragraphs.forEach(function(sentences) {
    //   $('<p></p>').text(sentences.join(' ')).appendTo(div);
    // });
  }


 

  function updateWordsCount() {
    var text = textString;
    var wordsCount = text.match(/\S+/g) ? text.match(/\S+/g).length : 0;
    $('.wordsCount').css('color',wordsCount < 100 ? 'red' : 'gray');
    $('.wordsCount').text(wordsCount + ' words');
  }
  $content.keyup(updateWordsCount);
  updateWordsCount();

});