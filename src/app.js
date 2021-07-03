import $ from 'jquery';
import * as Survey from "survey-jquery";
import _ from 'lodash';
import exampleSurveyJSON from '../surveys/survey-example.json';

// console.log(exampleSurveyJSON.questions[7].elements)
// let testObject = {
//   "titleLocation": "hidden",
//   "isRequired": true,
//   "description": "1 mean low, 5 high",
//   "type": "rating",
//   "name": "How would the organisation rate the importance of digital technology to transform and improve healthcare outcomes for all Australians?"
// }
// exampleSurveyJSON.questions[7].elements.push(testObject)
// console.log(exampleSurveyJSON.questions[7].elements)

let surveyJSON = exampleSurveyJSON
let surveyResults = [];
let questionCount = 0;
let questionTotal = surveyJSON.questions.length


//set vh too 100% vh on mobile
function fixVh() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
fixVh()
$(window).resize(function() {
  fixVh()
})


//render initial html to #survey
$('#survey').append(`
<div class='slider-view'>
  <div class='slider-list'>
  </div>
</div>
<div class="progress-bar">
  <div class="progress">
    <span class="value"></span>
  </div>
</div>
`)
appendedNextQuestion(surveyJSON.questions[0])


//create elements for next question
function appendedNextQuestion(nextQuestion) {
  $('.slider-list').append(`
  <div class='question-container'>
    <div class='question-wrapper'>
      <div class='question'>
        <div id="surveyContainer${questionCount}"></div>
        <button type='submit' class='next-question' disabled="disabled">Next</button>
      </div>
    </div>
  </div>
  `)
  initialiseQuestion(nextQuestion)
}
//generate the next question
function initialiseQuestion(nextQuestion) {
  var survey = new Survey.Model(nextQuestion);

  survey.checkErrorsMode = 'onComplete';
  survey.onUpdateQuestionCssClasses.add(addCustomClasses)
  survey.onAfterRenderQuestionInput.add(addEventListeners)

  $("#surveyContainer" + questionCount).Survey({ model: survey });
  $('.sv_complete_btn').remove();
  $('.sv_prev_btn').remove();
  $('.sv_next_btn').remove();
  $('.sv_preview_btn').remove();
}


//move and animates progress bar
function calcProgressBar() {
  $('.progress-bar .progress').css('width', `${((questionCount)/questionTotal)*100}%`)

  $({value: ((questionCount-1)/questionTotal)*100}).animate({value: ((questionCount)/questionTotal)*100}, {
    duration: 500,
    easing:'swing',
    step: function() {
      $('.progress-bar .progress .value').text(`${Math.round(this.value)}%`);
    }
  });
}


//add customs classes if there is one
function addCustomClasses(survey, options) {
  var classes = options.cssClasses

  if (options.question.customClasses) {
    classes.root += " " + options.question.customClasses;
  }
}

//add event listners to survey elements
function addEventListeners(survey, options) {
  let surveyNextBtn = $(`#${survey.renderedElement.id}`).nextAll('.next-question').first()

  //navigation functionality to next btn
  surveyNextBtn[0].onclick = function() {
    nextQuestion(survey)
  }

  //key error detection for textfields and textareas
  if (options.question.getType() === 'text' || options.question.getType() === 'comment') {
    options.htmlElement.onkeyup = function () {
      console.log('typed')
      if (options.htmlElement.value.trim().length > 0) {
        surveyNextBtn.attr('disabled', false);
      } else {
        let disableBtn = true
        $(`#${survey.renderedElement.id} .sv_q_text_root`).each(function() {
          if($(this).val().trim().length > 0) {
            disableBtn = false;
            return false;
          }
        })
        if(disableBtn) {
          surveyNextBtn.attr('disabled', true);
        }
      }
    }
  //click error detection or all other input types
  } else {
    options.htmlElement.onclick = function () {
      console.log('clicked')
      if (survey.hasErrors(false) === false) {
        surveyNextBtn.attr('disabled', false);
      } else {
        surveyNextBtn.attr('disabled', true);
      }
    }
  }
}



//triggered when the question is answered
function addQuestionData(sender) {
  surveyResults.push(sender.data)
  if (sender.otherJSON && shouldAddendQuestion("Other", sender.data)) {
    appendQuestion(sender.otherJSON, sender.renderedElement.id)
    return;
  }
  if (sender.yesJSON && shouldAddendQuestion("Yes", sender.data)) {
    appendQuestion(sender.yesJSON, sender.renderedElement.id)
    return;
  }
  $('.sv_complete_btn').attr('disabled', true);
  nextQuestion()
}


//check if a question should be appended after the current question
function shouldAddendQuestion(check, data) {
  if (_.includes(data, check)) {
    return true;
  }
  if (_.includes(data[Object.keys(data)[0]], "Other")) {
    return true;
  }
  if (Array.isArray(data[Object.keys(data)[0]])) {
    if (_.includes(data[Object.keys(data)[0]].flatMap(ans => Object.values(ans)), "Other")) {
      return true;
    }
  }
}


//appends new question after current question
function appendQuestion(question, location) {
  questionCount = questionCount + 1;
  $('.swiper-slide-next').removeClass('swiper-slide-next')
  $("#" + location).parent().parent().after(`
    <div class='swiper-slide swiper-slide-next'>
      <div class='question'>
        <div id="surveyContainer${questionCount}"></div>
      </div>
    </div>
  `)
  // surveySwiper.update()
  var survey = new Survey.Model(question);

  survey.onComplete.add(addQuestionData);
  survey.completeText = 'Next';
  survey.hideRequiredErrors = true;

  survey.onUpdateQuestionCssClasses.add(addCustomClasses)
  $("#surveyContainer" + questionCount).Survey({ model: survey });
}


//navigation to next question
function nextQuestion(survey) {
  if(survey.hasErrors() === false) {
    questionCount++;
    console.log(selectNextQuestion(survey.data))
    appendedNextQuestion(surveyJSON.questions[questionCount])
    calcProgressBar()

    surveyResults.push(survey.data)
    console.log(surveyResults)
    
    $('.slider-list').toggleClass('transitioning')
    setTimeout(function() {
      $('.slider-list').toggleClass('transitioning')
      $('.question-container')[0].remove()
      $('.slider-list').css('transform', `translateY(0px)`)
    }, 500)
    $('.slider-list').css('transform', `translateY(-${$('#survey').height()}px)`)
  }
}

function selectNextQuestion(questionData) {
  if (_.includes(questionData, "Other")) {
    console.log("1")
    return true;
  }
  if (_.includes(questionData[Object.keys(questionData)[0]], "Other")) {
    console.log("2")
    return true;
  }
  if (Array.isArray(questionData[Object.keys(questionData)[0]])) {
    if (_.includes(questionData[Object.keys(questionData)[0]].flatMap(ans => Object.values(ans)), "Other")) {
      console.log("3")
      return true;
    }
  }
  console.log('Didnt find other')
  return false;
}