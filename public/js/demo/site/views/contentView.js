(function(App) {

	var question;
	var answer;
	var answerList = [];

	// **********************************************************************************************
	// properties


	// **********************************************************************************************
	// event handlers

	function handlePageChanged() {
		if (App.model.getPage() === App.model.CONTENT_PAGE) {
			TweenMax.delayedCall(0.5, function() {
				App.contentView._container.css("display", "block");
				TweenMax.fromTo(App.contentView._container, 1.5, {alpha: 0}, {alpha: 1, ease: Power4.easeOut});
			});
		} else {
			App.contentView._container.css("display", "none");
		}
	}


	// **********************************************************************************************
	// core functions

	function start() {
		var startQ = 0;
		startForm(); 
		App.contentView._intro.removeClass("current");
		App.contentView._intro.addClass("past");

		App.model.questions_array[startQ].slide_cntr.show(startQ);
		App.model.questions_array[startQ].slide_cntr.removeClass("future");
		App.model.questions_array[startQ].slide_cntr.addClass("current");

		App.contentView._next_btn.css("background-color","#734098");
		App.contentView._next_btn.css("border-color","#734098");
		//App.contentView._next_btn.css("background-color","#325c80");

		App.contentView._footer.addClass("active");

		$('#ibm-footer-wrapper-0').remove();

		$('#ibm-footer-0').attr('id','ibm-footer');
		$('#ibm-footer-module-2').attr('id','ibm-footer-module');
		$('#ibm-footer-wrapper-1').show();

		IBMCore.common.util.config.set({"footer":{"type":"alternate"}});
		IBMCore.common.module.footer.init();
		IBMCore.common.module.localeselector.init();
		// +
		$("footer[aria-label='IBM']").hide();
		// +

		$(".timeline").html("<img src='images/timeline_0.svg' />");
		$(".steps > div:eq(0)").addClass("done");

		App.contentView._intro.hide(750);
	}

	function answer(e) {
		$("#question_" + e.data.question.group).attr('data-next_id','');
		console.info(e);
		question = e.data.question;
		answer = e.data.answer;
		answerList[question.id] = answer;

		e.data.question.content_cntr.removeClass("asked");
		e.data.question.content_cntr.removeClass("answered");

		if (e.data.question.multiple) {
			if (e.data.question.answers_array[e.data.answer.id].answer_cntr.hasClass("selected")) {
				e.data.question.answers_array[e.data.answer.id].answer_cntr.removeClass("selected");
				delete e.data.question.selectedAnswerIdList[e.data.answer.id];
				delete e.data.question.selectedAnswerList[e.data.answer._id];

				var foundChecked = false;
				for (key in e.data.question.selectedAnswerList) {
					foundChecked = true;
					break;
				}

				if (foundChecked) {
					e.data.question.content_cntr.addClass("answered");
				} else {
					e.data.question.content_cntr.addClass("asked");
				}
			} else {
				if (e.data.question.multiLimit && e.data.question.multiLimit <= Object.keys(e.data.question.selectedAnswerIdList).length) {
				} else {
					e.data.question.answers_array[e.data.answer.id].answer_cntr.addClass("selected");
					e.data.question.selectedAnswerIdList[e.data.answer.id] = 1;

					e.data.question.selectedAnswerList[e.data.answer._id] = 1;
				}
				e.data.question.content_cntr.addClass("answered");
			}

			if (e.data.answer.nextQuestion)
			{
				if (e.data.question.answers_array[e.data.answer.id].answer_cntr.hasClass("selected"))
				{
					if (e.data.question.group == $("#question_item_"+ e.data.answer.nextQuestion).data("group_id"))
					{
						$("#question_item_"+ e.data.answer.nextQuestion).show();
						resizeQuestion(function(){
							//$(".slide.question.current").animate({ scrollTop: $(".slide.question.current").height() }, 1000);
							$("html, body").animate({ scrollTop: $(document).height() }, 1000);
						});

					}
				} else {
					if (e.data.question.group == $("#question_item_"+ e.data.answer.nextQuestion).data("group_id"))
					{
						$("#question_item_"+ e.data.answer.nextQuestion).hide();
						resizeQuestion();
					}
				}
			}
		} else {
			if (e.data.question.selectedAnswerID >= 0 && e.data.answer.id != e.data.question.selectedAnswerID) {
				e.data.question.answers_array[e.data.question.selectedAnswerID].answer_cntr.removeClass("selected");
				e.data.question.selectedAnswerIdList = [];
				e.data.question.selectedAnswerList = [];
				if (e.data.question.answers_array[e.data.question.selectedAnswerID].nextQuestion)
				{
					if (e.data.question.group == $("#question_item_"+ e.data.question.answers_array[e.data.question.selectedAnswerID].nextQuestion).data("group_id"))
					{
						$("#question_item_"+ e.data.question.answers_array[e.data.question.selectedAnswerID].nextQuestion).hide();
					}
				}
			}
			e.data.question.content_cntr.addClass("answered");
			if (!e.data.question.answers_array[e.data.answer.id].answer_cntr.hasClass("selected")) {
				e.data.question.selectedAnswerId = e.data.answer.id;
				e.data.question.answers_array[e.data.answer.id].answer_cntr.addClass("selected");
				e.data.question.selectedAnswerIdList[e.data.answer.id] = 1;
				e.data.question.selectedAnswerList[e.data.answer._id] = 1;


				console.log("_____");
				console.log(e.data.answer);
				console.log("_____");
				if (e.data.answer.nextQuestion)
				{
					if (e.data.question.answers_array[e.data.answer.id].answer_cntr.hasClass("selected"))
					{
						if (e.data.question.group == $("#question_item_"+ e.data.answer.nextQuestion).data("group_id"))
						{
							$("#question_item_"+ e.data.answer.nextQuestion).show();
							resizeQuestion(function(){
								//$(".slide.question.current").animate({ scrollTop: $(".slide.question.current").height() }, 1000);
								$("html, body").animate({ scrollTop: $(document).height() }, 1000);
							});
						}
					} else {
						if (e.data.question.group == $("#question_item_"+ e.data.answer.nextQuestion).data("group_id"))
						{
							$("#question_item_"+ e.data.answer.nextQuestion).hide();
							resizeQuestion();
						}
					}
				}
			}
		}

		e.data.question.selectedAnswerID = e.data.answer.id;
		var answerPerRow = e.data.question.answerPerRow;
		if (isMobile()){
			answerPerRow = 1;
		}

		var questionCount = $("#question_" + e.data.question.group + " .question_item").length;
		var answeredCount = $("#question_" + e.data.question.group + " .question_item .content.answered").length;

		var k = 0;
		var nextQuestionStatus = false;
		var nextQuestionHardFinish = false;
		var nextQuestionHardFinishBlock = null;
		var answerCheckArray = [];
		$("#question_" + e.data.question.group + " .question_item").each(function(){
			var currentQuestionId  = $(this).attr("id");

			var currentQuestionParentQId = $(this).data('parent_qid');
			var currentQuestionParentAId = $(this).data('parent_aid');

			if (typeof currentQuestionParentQId === "undefined")
			{
				$("#" + currentQuestionId + " > .content > .answers > .button").each(function(){
					if ($(this).hasClass("selected"))
					{
						nextQuestionStatus = true;
						if (nextQuestionHardFinishBlock == null && $(this).data("hard_finish"))
						{
							nextQuestionHardFinish = $(this).data("hard_finish");
						} else {
							nextQuestionHardFinishBlock = true;
							nextQuestionHardFinish = false;
						}
						var currentQuestionIndex 	= currentQuestionId.replace("question_item_","");
						var currentAnswerIndex		= $(this).attr("id").replace("answer_","");
						//console.log("--" + currentQuestionIndex + "--" + currentAnswerIndex);
						nextQuestionStatus = checkChildQuestionsStatus(e.data.question.group,currentQuestionIndex,currentAnswerIndex);
						console.log("HT"+nextQuestionStatus);
						if (nextQuestionStatus === false)
						{
							return false;
						} else if (nextQuestionStatus !== true)
						{
							nextQuestionHardFinish = nextQuestionStatus;
							nextQuestionStatus = true;
							return false;
						}
					}
				});
			}
		});

		var currentQuestionGroup = $(".slide.question.current").attr("id");
		var currentQuestionGroupId = currentQuestionGroup.replace("question_","");;

		var totalQuestionLength = $(".slide.question").length;

		if (nextQuestionStatus == true) {
			if (nextQuestionHardFinish != false || (currentQuestionGroupId == (totalQuestionLength-1))) {
				App.contentView._next_btn.find("#next_text").html("See Results");
				App.contentView._next_btn.off("click");
				App.contentView._next_btn.on("click", { group: e.data.question.group,hard_finish: nextQuestionHardFinish }, App.contentView.nextQuestion);
				App.contentView._next_btn.removeClass("disabled");
			} else {
				App.contentView._next_btn.find("#next_text").html('Next Question<img src="../images/icons/next_arrow.png" alt="" />');
				App.contentView._next_btn.off("click");
				App.contentView._next_btn.on("click", { group: e.data.question.group }, App.contentView.nextQuestion);
				App.contentView._next_btn.removeClass("disabled");
			}

		} else {
			App.contentView._next_btn.off('click');
			App.contentView._next_btn.addClass('disabled');
		}
	}

	function checkChildQuestionsStatus(groupIndex,parentQIndex,parentAIndex)
	{
		var nextQuestionHardFinish = false;
		var nextQuestionStatus = true;
		var childFound   		= false;
		console.log("checChilds");
		$("#question_" + groupIndex + " .question_item").each(function() {
			var currentQuestionId  = $(this).attr("id");

			console.log("Parent_Q_ID"+parentQIndex);
			console.log("Parent_A_ID"+$(this).attr("data-parent_aid"));
			if ($(this).attr("data-parent_aid"))
			{
				var parent_aid_array = $(this).attr("data-parent_aid").split(",");
			} else {
				var parent_aid_array = [];
			}

			console.log("____"+inArray(parentAIndex,parent_aid_array));



			if ( $(this).attr("data-parent_qid") == parentQIndex && inArray(parentAIndex,parent_aid_array) )
			{
				console.log("a1" + $(this).attr("id"));
				nextQuestionStatus = false;

				$( "#" + $(this).attr("id") + " > .content > .answers > .button").each(function(){
					console.log("a2"+$(this).attr("id"));

					if ($(this).hasClass("selected"))
					{
						if ($(this).data("hard_finish"))
						{
							nextQuestionHardFinish = $(this).data("hard_finish");
						}
						console.log("a3");
						nextQuestionStatus = true;
						var currentQuestionIndex 	= currentQuestionId.replace("question_item_","");
						var currentAnswerIndex		= $(this).attr("id").replace("answer_","");
						console.log("--" + currentQuestionIndex + "--" + currentAnswerIndex);
						nextQuestionStatus = checkChildQuestionsStatus(groupIndex,currentQuestionIndex,currentAnswerIndex);
					}
				});

				if (nextQuestionStatus == false)
				{
					return false;
				}
			}
		});

		console.log("checChildsENd");

		if (nextQuestionHardFinish)
		{
			return nextQuestionHardFinish;
		} else {
			return nextQuestionStatus;
		}
	}

	function previousQuestion(e) {
		App.contentView._footer.find("#next_button #next_text").html('Next Question<img src="../images/icons/next_arrow.png" alt="" />');
		var currentBackGroupId = $(".slide.question.current").attr("data-back_id");
		var currentQuestionGroup = $(".slide.question.current").attr("id");
		var currentQuestionGroupId = currentQuestionGroup.replace("question_","");;

		if (typeof currentBackGroupId != 'undefined')
		{
			switch (currentBackGroupId)
			{
				case "0":
					App.contentView._next_btn.css("background-color","#325c80");
					break;
				case "1":
					App.contentView._next_btn.css("background-color","#144d14");
					break;
				case "2":
					App.contentView._next_btn.css("background-color","#8c0f1c");
					break;
				case "3":
					App.contentView._next_btn.css("background-color","#005448");
					break;
				case "4":
					App.contentView._next_btn.css("background-color","#325c80");
					break;
				case "5":
					App.contentView._next_btn.css("background-color","#734098");
					break;
				case "6":
					App.contentView._next_btn.css("background-color","#734098");
					break;
				case "7":
					App.contentView._next_btn.css("background-color","#144d14");
					break;
				case "8":
					App.contentView._next_btn.css("background-color","#144d14");
					break;
				case "9":
					App.contentView._next_btn.css("background-color","#8c0f1c");
					break;
			}
			//App.model.questions_array[currentQuestionGroupId].slide_cntr.removeClass("current");
			//App.model.questions_array[currentQuestionGroupId].slide_cntr.addClass("future");
			//App.model.questions_array[currentQuestionGroupId].slide_cntr.hide(750);
			$("#question_"+currentQuestionGroupId).removeClass("current");
			$("#question_"+currentQuestionGroupId).addClass("future");
			$("#question_"+currentQuestionGroupId).hide(750);

			App.contentView._next_btn.off("click");
			App.contentView._next_btn.on("click", { group: e.data.question.group - 1 }, App.contentView.nextQuestion);
			App.contentView._next_btn.removeClass("disabled");

			if (e.data.question.group > 0) {
				App.contentView._back_btn.show();
				//App.model.questions_array[currentQuestionGroupId - 1].slide_cntr.show(0);
				//App.model.questions_array[currentQuestionGroupId - 1].slide_cntr.removeClass("past");
				//App.model.questions_array[currentQuestionGroupId - 1].slide_cntr.addClass("current");
				$("#question_"+currentBackGroupId).show(0);
				$("#question_"+currentBackGroupId).removeClass("past");
				$("#question_"+currentBackGroupId).removeClass("future");
				console.log("currentBackGroupId: " + currentBackGroupId);
				$("#question_"+currentBackGroupId).addClass("current");

				//$(".timeline").html("<img src='images/timeline_" + (e.data.question.id + 1) + ".svg' />");
				$(".steps > div:eq(" + (e.data.question.id) + ")").removeClass("done");
				console.log("e.data.question.id " + e.data.question.id);
				if (App.model.questions_array[e.data.question.id - 1].id > 0){
					//if (currentBackGroupId > 4){//remove question 1 - 4 hack, it's not always 9 on the way BACK depending on how far you go
					//alert(App.model.questions_array[e.data.question.id - 1].id);
					console.log(App.model.questions_array[e.data.question.id - 1].id);
					App.contentView._back_btn.off('click');
					App.contentView._back_btn.on("click", {question: App.model.questions_array[e.data.question.id - 1]}, App.contentView.previousQuestion);
				} else {
					App.contentView._back_btn.off('click');
					App.contentView._back_btn.hide();
				}
			}
		} else{
			App.contentView._results.addClass("future");
			App.contentView._results.removeClass("current");
			App.contentView._results.hide(750);

			$(".steps > div:last").removeClass("done").removeClass("completed");

			App.contentView._back_btn.show();
			App.model.questions_array[App.model.questions_array.length - 1].slide_cntr.show(0);
			App.model.questions_array[App.model.questions_array.length - 1].slide_cntr.removeClass("past");
			App.model.questions_array[App.model.questions_array.length - 1].slide_cntr.addClass("current");

			App.contentView._next_btn.off("click");
			App.contentView._next_btn.on("click", { group: App.model.questions_array[App.model.questions_array.length - 1].group }, App.contentView.nextQuestion);
			App.contentView._next_btn.removeClass("disabled");

			//$(".timeline").html("<img src='images/timeline_" + (e.data.question.id + 1) + ".svg' />");
			App.contentView._back_btn.off('click');
			App.contentView._back_btn.on("click", {question: App.model.questions_array[App.model.questions_array.length - 1]}, App.contentView.previousQuestion);
		}
	}

	function nextQuestion(e) {
		var id = 0;
		var parentId = 0;
		var currentSelectedId = null;
		$("#question_" + e.data.group + " .question_item").each(function(index, item) {
			id = parseInt(item.id.replace("question_item_", ""));

			if (! App.model.questions_array[id].upQ)
			{
				parentId = id;
			}

			// show the values stored
			var answerStr = "";
			var delimiter = "";

			//console.log("+++"+id+"++++");
			//console.log(App.model.questions_array[id].selectedAnswerIdList);

			for (var kk in App.model.questions_array[id].selectedAnswerIdList)
			{
				console.log("|-->"+kk);
				if (currentSelectedId == null)
				{
					currentSelectedId = kk;
				}
				//var currentQuestion_id = App.model.questions_array[id].answers_array;
				//console.log(kk);
			}



			console.log(App.model);

			var otherText = null;

			for (var ansCode in App.model.questions_array[id].selectedAnswerList) {
				// use hasOwnProperty to filter out keys from the Object.prototype
				if (App.model.questions_array[id].selectedAnswerList.hasOwnProperty(ansCode))
				{
					var currentAid = 1;
					for ( var ci = 0; ci< App.model.questions_array[id].answers_array.length; ci++)
					{
						var ccAId = App.model.questions_array[id].answers_array[ci]._id

						if (ccAId == ansCode){

							var controlInput = App.model.questions_array[id].answers_array[ci].answer_cntr.find('input').val();
							if (controlInput)
							{
								otherText = controlInput;
							}
						}
					}
					answerStr += delimiter + ansCode;
					console.log(App.model.questions_array[id].selectedAnswerList);
					delimiter = ",";
				}
			}



			if (answerStr)
			{
				console.log("_____");
				console.log(answerStr);
				console.log("_____");
				addAnswer(App.model.questions_array[id]._id, answerStr, otherText);
			}
		});

		var currentQuestionGroup = $(".slide.question.current").attr("id");
		//var currentQuestionGroupId = currentQuestionGroup.replace("question_","");;

		$("#"+currentQuestionGroup).removeClass("current");
		$("#"+currentQuestionGroup).addClass("past");
		$("#"+currentQuestionGroup).hide(750);

		App.contentView._next_btn.off('click');
		App.contentView._next_btn.addClass('disabled');

		//console.log("---"+id);
		//console.log("---"+App.model.questions_array.length);

		if (id < (App.model.questions_array.length - 1) &&  ! e.data.hard_finish) {
			App.contentView._back_btn.show();
			//console.log(currentSelectedId);
			//console.log(App.model.questions_array[id]);
			//console.log(id);
			//console.log(parentId);

			if ($("#"+currentQuestionGroup).attr('data-next_id'))
			{
				var nextId = $("#"+currentQuestionGroup).attr('data-next_id');
			}
			else if (App.model.questions_array[parentId].answers_array[currentSelectedId].nextQuestion && typeof App.model.questions_array[App.model.questions_array[parentId].answers_array[currentSelectedId].nextQuestion] != 'undefined' && e.data.group != App.model.questions_array[App.model.questions_array[parentId].answers_array[currentSelectedId].nextQuestion].group )
			{
				console.log(App.model.questions_array[App.model.questions_array[parentId].answers_array[currentSelectedId].nextQuestion].group);
				//console.log("N+++");
				var nextId = App.model.questions_array[parentId].answers_array[currentSelectedId].nextQuestion;
			} else {
				var nextId = id + 1;
			}

			/*
			switch (App.model.questions_array[nextId].group)
			{
				case 1:
					App.contentView._next_btn.css("background-color","#144d14");
					break;
				case 2:
					App.contentView._next_btn.css("background-color","#8c0f1c");
					break;
				case 3:
					App.contentView._next_btn.css("background-color","#005448");
					break;
				case 4:
					App.contentView._next_btn.css("background-color","#325c80");
					break;
				case 5:
					App.contentView._next_btn.css("background-color","#734098");
					break;
				case 6:
					App.contentView._next_btn.css("background-color","#734098");
					break;
				case 7:
					App.contentView._next_btn.css("background-color","#144d14");
					break;
				case 8:
					App.contentView._next_btn.css("background-color","#144d14");
					break;
				case 9:
					App.contentView._next_btn.css("background-color","#8c0f1c");
					break;
			}
			*/
			var nextButtonColor = "inherit";
			switch (App.model.questions_array[nextId].group)
			{
				case 1:
					nextButtonColor = "#144d14";
					break;
				case 2:
					nextButtonColor = "#8c0f1c";
					break;
				case 3:
					nextButtonColor = "#005448";
					break;
				case 4:
					nextButtonColor = "#325c80";
					break;
				case 5:
					nextButtonColor = "#734098";
					break;
				case 6:
					nextButtonColor = "#734098";
					break;
				case 7:
					nextButtonColor = "#144d14";
					break;
				case 8:
					nextButtonColor = "#144d14";
					break;
				case 9:
					nextButtonColor = "#8c0f1c";
					break;
			}
			App.contentView._next_btn.css("background-color",nextButtonColor);
			App.contentView._next_btn.css("border-color",nextButtonColor);

			//console.log("N___"+nextId);

			App.model.questions_array[nextId].slide_cntr.show(0);
			App.model.questions_array[nextId].slide_cntr.removeClass("future");
			App.model.questions_array[nextId].slide_cntr.removeClass("past");
			App.model.questions_array[nextId].slide_cntr.addClass("current");
			App.model.questions_array[nextId].content_cntr.addClass("asked");

			$(".slide.question.current").animate({ scrollTop: 0 }, 1000);
			$("html, body").animate({ scrollTop: 0 }, 1000);

			//$(".timeline").html("<img src='images/timeline_" + (e.data.question.id + 1) + ".svg' />");
			$(".slide.question.current").attr('data-back_id',e.data.group);
			App.contentView._back_btn.off('click');
			App.contentView._back_btn.on("click", {question: App.model.questions_array[nextId]}, App.contentView.previousQuestion);

			$("#"+currentQuestionGroup).attr('data-next_id',nextId);

			$(".steps > div:eq(" + (App.model.questions_array[id].group + 1) + ")").addClass("done");

			/*if (id == (App.model.questions_array.length - 2)) {
			 App.contentView._footer.find("#next_button #next_text").html("See Results");
			 }*/


			var nextGroupId = App.model.questions_array[nextId].group;
			var k = 0;
			var nextQuestionStatus = false;
			var nextQuestionHardFinish = false;
			var answerCheckArray = [];
			console.log("NEXT_ID:"+nextGroupId);
			$("#question_" + nextGroupId + " .question_item").each(function(){
				var currentQuestionId  = $(this).attr("id");

				var currentQuestionParentQId = $(this).data('parent_qid');
				var currentQuestionParentAId = $(this).data('parent_aid');

				if (typeof currentQuestionParentQId === "undefined")
				{
					console.log("ZZZ-0")
					$("#" + currentQuestionId + " > .content > .answers > .button").each(function(){
						console.log("ZZZ-1")
						if ($(this).hasClass("selected"))
						{
							console.log("ZZZ-2")
							console.log("XXX"+currentQuestionId);
							nextQuestionStatus = true;
							if ($(this).data("hard_finish"))
							{
								nextQuestionHardFinish = $(this).data("hard_finish");
							}
							var currentQuestionIndex 	= currentQuestionId.replace("question_item_","");
							var currentAnswerIndex		= $(this).attr("id").replace("answer_","");
							//console.log("--" + currentQuestionIndex + "--" + currentAnswerIndex);
							nextQuestionStatus = checkChildQuestionsStatus((nextGroupId),currentQuestionIndex,currentAnswerIndex);
							console.log("XXX"+nextQuestionStatus);
							if (nextQuestionStatus == false)
							{
								return false;
							}
						}
					});
				}
			});


			var currentQuestionGroup = $(".slide.question.current").attr("id");

			var currentQuestionGroupId = currentQuestionGroup.replace("question_","");;

			var totalQuestionLength = $(".slide.question").length;

			console.log(currentQuestionGroup);
			console.log(currentQuestionGroupId);
			console.log(totalQuestionLength);
			console.log(nextQuestionStatus);
			console.log(nextQuestionHardFinish);

			if (nextQuestionStatus == true) {
				if (nextQuestionHardFinish != false || (currentQuestionGroupId == (totalQuestionLength-1))) {
					App.contentView._next_btn.find("#next_text").html("See Results");
					App.contentView._next_btn.off("click");
					App.contentView._next_btn.on("click", { group: nextGroupId,hard_finish: nextQuestionHardFinish }, App.contentView.nextQuestion);
					App.contentView._next_btn.removeClass("disabled");
				} else {
					App.contentView._next_btn.find("#next_text").html('Next Question<img src="../images/icons/next_arrow.png" alt="" />');
					App.contentView._next_btn.off("click");
					App.contentView._next_btn.on("click", { group: nextGroupId }, App.contentView.nextQuestion);
					App.contentView._next_btn.removeClass("disabled");
				}

			} else {
				App.contentView._next_btn.off('click');
				App.contentView._next_btn.addClass('disabled');
			}

			/*var questionCount = $("#question_" + (App.model.questions_array[id].group+1) + " .question_item").length;
			 var answeredCount = $("#question_" + (App.model.questions_array[id].group+1) + " .question_item .content.answered").length;

			 if (questionCount == answeredCount) {
			 App.contentView._next_btn.off("click");
			 App.contentView._next_btn.on("click", { group: (App.model.questions_array[id].group+1) }, App.contentView.nextQuestion);
			 App.contentView._next_btn.removeClass("disabled");
			 } else {
			 App.contentView._next_btn.off('click');
			 App.contentView._next_btn.addClass('disabled');
			 }*/
		} else {
			//App.contentView._results.show(0);
			//App.contentView._results.removeClass("future");
			//App.contentView._results.addClass("current");
			//App.contentView._footer.hide();
			//$("#container").addClass("full");


			// set same height for overview and next steps
			/*
			 if (!isMobile()){
			 window.site.setSameHeight(['#results_overview', "#results_next_steps"])
			 }
			 */
			//$(".timeline").html("<img src='images/timeline_4.svg' />");
			App.contentView._back_btn.off('click');
			App.contentView._back_btn.on("click", {}, App.contentView.previousQuestion);

			$(".steps > div:last").addClass("completed");

			var score = 0;
			$(".answers .selected").each(function(){
				score += ($(this).data('score')) ? $(this).data('score') : 0;
			});

			if (score < 6) { // Beginer: 3 - 5
				level = "build";
			} else if (score < 12) { // Advanced 6 - 11
				level = "rollout";
			} else if (score > 11){ // Expert 12 - 13
				level = "Expert";
			}

			var form = $(document.createElement('form'));
//			$(form).attr("action", "/result");
			$(form).attr("action", '/'+App.lang+'/result');

			$(form).attr("method", "POST");

			var input = $("<input>")
				.attr("type", "hidden")
				.attr("name", "level")
				.val(e.data.hard_finish);

			$(form).append($(input));

			$("body").append( form );

			$(form).submit();

		}
	}


	function gotoStart(e) {
//		window.location="/";
		window.location='/'+App.lang;
	}

	function gotoEmailAudit(e) {
		getCountries();

		App.contentView._results.removeClass("current");
		App.contentView._results.addClass("past");
		App.contentView._results.hide(750);

		App.contentView._emailAudit.show(0);
		App.contentView._emailAudit.removeClass("future");
		App.contentView._emailAudit.addClass("current");

		App.contentView._back_btn.off('click');
		App.contentView._footer.hide();
		$("#container").css("bottom", "0px");
		$("#container").scrollTop(0);

	}

	function emailAuditSubmit(e) {
		var firstName = $("#firstName").val();
		var lastName = $("#lastName").val();
		var phone = $("#phone").val();
		var email = $("#email_audit_email_address").val();
		var company = $("#company").val();
		var country = $("#country_cd_select").val();
		var state = $("#state_cd_select").val();
		var errorMsg = "";

		var re = /^[a-zA-Z ]+$/;
		var phonere = /^[0-9]+$/;

		if (re.test(firstName)) {
		} else {
			errorMsg = "Please enter a valid first name<br/>";
		}

		if (re.test(lastName)) {
		} else {
			errorMsg = "Please enter a valid last name<br/>";
		}

		if (phonere.test(phone)) {
		} else {
			errorMsg = "Please enter a valid Phone Number<br/>";
		}

		if (re.test(company)) {
		} else {
			errorMsg = "Please enter a valid Company<br/>";
		}

		var contactFlag = 'N'
		if($('#contactFlag').prop('checked')) {
			contactFlag = 'Y';
		}
		var contactMedium = $("input:checkbox[name=contactMedium]:checked").map(function() {return this.value;}).get().join(',');

		var privacyFlag = 'N'
		if($('#privacyFlag').prop('checked')) {
			privacyFlag = 'Y';
		}

		re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		if(re.test(email)) {
		} else {
			errorMsg += "Please enter a valid email address";
		}

		if (errorMsg.length > 0) {
			$("#error_msg").html(errorMsg);
			return false;
		} else {
			$.ajax({
				url: '/user',
				data: {'firstName': firstName, 'lastName':lastName, 'email': email, 'phone':phone, 'company':company, 'country':country, 'state':state, 'contactFlag':contactFlag, 'contactMedium':contactMedium, 'privacyFlag':privacyFlag},
				method: 'POST',
				success: function(result) {
					console.log(result);
					$("#email_audit_name").val("");
					$("#email_audit_email_address").val("");
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log("textStatus: " + textStatus);
					console.log("errorThrown: " + errorThrown);
				}
			});

			App.contentView._emailAudit.removeClass("current");
			App.contentView._emailAudit.addClass("past");
			App.contentView._emailAudit.hide(750);

			App.contentView._outro.show(0);
			App.contentView._outro.removeClass("future");
			App.contentView._outro.addClass("current");
			$("#container").scrollTop(0);
		}
	}

	function hasBlurb(answer){
		var has = answer.blurb && answer.blurb.title && answer.blurb.body && answer.blurb.title.length > 0 && answer.blurb.body.length > 0;
		//console.log("has blurb : " + has);
		return has;
	}

	function isMobile(){
		return $('#mobile').width() / $('body').width() * 100 == 100;
	}

	function inArray(needle, haystack) {
		var length = haystack.length;
		for(var i = 0; i < length; i++) {
			if(haystack[i] == needle) return true;
		}
		return false;
	}

	function resizeQuestion(next){
		var $currentQuestion = $(".slide.question.current");
		var currentQuestionHeight = 0;
		if ($currentQuestion.data("height")){
			currentQuestionHeight = $currentQuestion.data("height");
		}
		else{
			currentQuestionHeight = $currentQuestion.outerHeight();
			$currentQuestion.data("height", currentQuestionHeight);
		}

		var $childQuestions = $("[data-parent_qid]:visible", $currentQuestion);
		var childHeights = {};
		$childQuestions.each(function( index, element ) {
			var parentqid = $(element).data("parent_qid");
			var elementHeight = $(element).outerHeight();
			childHeights[parentqid] = childHeights[parentqid] || 0;
			if (elementHeight > childHeights[parentqid]){
				childHeights[parentqid] = elementHeight;
			}
		});

		var extraHeight = 0;
		for(var parentqid in childHeights){
			extraHeight += childHeights[parentqid];
		}
		$currentQuestion.height(currentQuestionHeight + extraHeight);
		if (next){
			next();
		}
	}

	// **********************************************************************************************
	// init


	function init() {
		App.contentView._container = $("#contentView");
		App.contentView._footer = $("#footer");

		App.contentView._intro = App.contentView._container.find("#intro");
		_start_btn = App.contentView._intro.find("#start");
		_start_btn.on("click", App.contentView.start);

		App.contentView._back_btn = App.contentView._footer.find("#back_button");
		App.contentView._next_btn = App.contentView._footer.find("#next_button");
		App.contentView._back_btn.hide();

		console.log("____");
		console.log(App.model.questions_array);
		App.model.questions_array.forEach(function(p_question, i) {
			var q = p_question.group;
			var groupQuestionCount = i;
			if (p_question.upQ)
			{
				if (App.model.questions_array[p_question.upQ].upQ)
				{
					$("#question_item_" + p_question.upQ + " > .content > .answers > .button:last")
						.after($(".question_item_hide #question_item_0")
						.clone()
						.attr("id", "question_item_" + groupQuestionCount)
						.attr("data-group_id",q)
						.attr("data-parent_qid",p_question.upQ)
						.attr("data-parent_aid",p_question.upA)
						.hide()
					);
				} else {
					$("#question_item_" + p_question.upQ + " > .content > .answers > #answer_" + p_question.upA)
						.after($(".question_item_hide #question_item_0")
						.clone()
						.attr("id", "question_item_" + groupQuestionCount)
						.attr("data-group_id",q)
						.attr("data-parent_qid",p_question.upQ)
						.attr("data-parent_aid",p_question.upA)
						.hide()
					);
				}

			} else{
				$(".question_item_hide #question_item_0").clone()
					.attr("id", "question_item_" + groupQuestionCount).attr("data-group_id",q)
					.appendTo($("#question_" + q));
			}

			p_question.slide_cntr = App.contentView._container.find("#question_" + q);


			// +
			//p_question.slide_cntr.find("#question_item_" + groupQuestionCount + " .guage h1").html(p_question.guage);
			p_question.slide_cntr.find("#question_item_" + groupQuestionCount + " .guage h4").html(p_question.guage);
			// +
			if (p_question.upQ) {
				p_question.slide_cntr.find("#question_item_" + groupQuestionCount + " .guage").remove();
			}

			// +
			//p_question.slide_cntr.find("#question_item_" + groupQuestionCount + " .title h1").html(p_question.question);
			p_question.slide_cntr.find("#question_item_" + groupQuestionCount + " .title h2").html(p_question.question);
			// +
			if (p_question.multiple) {
				if (p_question.multipleBlurb){
					p_question.slide_cntr.find("#question_item_" + groupQuestionCount + " .title").append("<br/>"+p_question.multipleBlurb);
				}else{
					p_question.slide_cntr.find("#question_item_" + groupQuestionCount + " .title").append("<br/>(Select all that apply)");
				}
			}

			p_question.slide_cntr.addClass("future");
			p_question.slide_cntr.css("display", "none");
			p_question.selectedAnswerID  = -1;

			p_question.content_cntr = p_question.slide_cntr.find("#question_item_" + groupQuestionCount + " .content");
			p_question.content_cntr.addClass("asked");

			p_question.answers_cntr = p_question.content_cntr.find(".answers");
			console.log(p_question.answers_cntr);
			p_question.answers_array.forEach(function(p_answer, a) {
				// p_question.answers_cntr.append("<div id='answer_" + a + "' class='button'><div class='copy'>" + p_answer.answer + "</div><div class='radio'><div class='selected'></div></div></div>");
				var answerPerRow = p_question.answerPerRow;
				if (isMobile()){
					answerPerRow = 1;
				}
				var lineNumber = Math.floor(a / answerPerRow);
				var buttonIndex = a - (lineNumber * answerPerRow);
				var isLightButton = (lineNumber % 2 == 0) ? (buttonIndex % 2 == 1) : (buttonIndex % 2 == 0);
				p_question.answers_cntr.append(
					"<div "+
						"id='answer_" + a + "' "+
						"class='button" + (isLightButton ? " light" : "") + " "+
						"ibm-textcolor-gray-60 " +
						"ibm-background-white-core " +
						"ibm-col-" + answerPerRow + "'>" +
						"<div "+
							"class='copy ibm-textcolor-gray-60 ibm-center'>" +
							p_answer.answer +
						"</div>"+
					"</div>"
				);

				p_answer.answer_cntr = p_question.answers_cntr.find("#answer_" + a);

				p_answer.answer_cntr.attr("data-score",p_answer.score);

				if (p_answer.hard_finish)
				{
					p_answer.answer_cntr.attr("data-hard_finish",p_answer.hard_finish);
				}

				if (p_answer.with_input == true)
				{
					p_answer.answer_cntr.find(".copy").append("<input type='text' class='other_text' placeholder='"+p_answer.with_input_placeholder+"' />");
				}

				if (p_question.icons) {
					// p_answer.answer_cntr.prepend("<div class='icon'><img src='images/question_" + (p_question.id + 1) + "_icon_" + p_answer.id + ".svg'></img></div>");
					p_answer.answer_cntr.prepend("<div class='icon' style='background-image:url(images/" + p_answer.icon + ");'></div>");
				}
				else{
					p_answer.answer_cntr.addClass('ibm-vertical-center');
					p_answer.answer_cntr.addClass('no-icon');
				}

				if (p_answer.blurb.text) {
					p_answer.answer_cntr.prepend("<div class='help'></div><div class='help-text'>"+p_answer.blurb.text+"</div>");
				}

				//if (!hasBlurb((p_answer))) {
				//    p_answer.answer_cntr.addClass('no-transition');
				//}

				//console.log("p_answer.average");
				//console.log(p_answer.average);
				if (p_answer.average) {
					p_answer.answer_cntr.prepend("<div class='average'><img src='images/average.svg'></img></div>");
				}

				p_question.selectedAnswerIdList = {};
				p_question.selectedAnswerList = {};
				p_answer.answer_cntr.on("click", { question: p_question, answer: p_answer }, App.contentView.answer);
			});

			if ($("#question_" + q + " .question_item").length == 1) {
				p_question.next_cntr = p_question.slide_cntr.find(".next");
				p_question.next_cntr.on("click", { group: q }, App.contentView.nextQuestion);
			}

			console.log(p_question.slide_cntr);

		});

		App.contentView._results = App.contentView._container.find("#results");
		App.contentView._results.addClass("future");
		App.contentView._results.css("display", "none");
		App.contentView._results.find("#beginner #free_consultation_button").on("click", { }, App.contentView.gotoEmailAudit);
		App.contentView._results.find("#advanced #free_consultation_button").on("click", { }, App.contentView.gotoEmailAudit);
		App.contentView._results.find("#expert #free_consultation_button").on("click", { }, App.contentView.gotoEmailAudit);

		App.contentView._emailAudit = App.contentView._container.find("#email_audit");
		App.contentView._emailAudit.addClass("future");
		App.contentView._emailAudit.css("display", "none");
		App.contentView._emailAudit.find("#email_audit_submit").attr("href", "javascript:void(0)").on("click", { }, App.contentView.emailAuditSubmit);

		App.contentView._outro = App.contentView._container.find("#outro");
		App.contentView._outro.addClass("future");
		App.contentView._outro.css("display", "none");
		App.contentView._outro.find("#restart_button").on("click", { }, App.contentView.gotoStart);
		//App.contentView._outro.append("<img src='images/finalScreen.svg'></img>");

		App.eventDispatcher.subscribe(App.model.PAGE_CHANGED, handlePageChanged);

		console.log(App);
	}


	// **********************************************************************************************
	// public interface

	App.contentView = {

		init: init,
		start: start,
		answer: answer,
		nextQuestion: nextQuestion,
		previousQuestion: previousQuestion,
		gotoEmailAudit: gotoEmailAudit,
		emailAuditSubmit: emailAuditSubmit,
		gotoStart: gotoStart,

		_container: null,
		_footer: null,

		_intro: null,
		_start_btn: null,

		_back_btn: null,

		_results: null,
		_emailAudit: null,
		_outro: null
	};

}(window.Site));
