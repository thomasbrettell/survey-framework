import $ from 'jquery';
import Swiper from 'swiper/bundle';
import 'swiper/swiper-bundle.css';
import * as Survey from "survey-jquery";
import exampleSurveyJSON from '../surveys/survey-example.json';
import _ from 'lodash';

var surveyResults = [];
var questionCount = 0;


//add custom properties to the survey questions
Survey.Serializer.addProperty("question", "customClasses:text");
Survey.Serializer.addProperty("survey", "otherJSON:text");


//initialise swiper
const surveySwiper = new Swiper('#survey', {
  direction: 'vertical',
  pagination: {
    el: ".swiper-pagination",
    type: "progressbar",
    progressbarOpposite: true,
  },
  navigation: {
    nextEl: '.next-question',
    prevEl: '.swiper-button-prev',
  },
  allowTouchMove: false,
  slidesPerView: 1
});


//inital rendering with of the survey
exampleSurveyJSON.questions.forEach(function (question, index) {
  var survey = new Survey.Model(question);

  survey.onComplete.add(addQuestionData);
  survey.onValueChanging.add(checkValidity)
  survey.completeText = 'Next';
  survey.hideRequiredErrors = true;
  survey.onUpdateQuestionCssClasses.add(addCustomClasses)

  questionCount = questionCount + 1;
  $("#surveyContainer" + (index + 1)).Survey({ model: survey });
})
$('.sv_complete_btn').attr('disabled', true); //disable next buttons


//add customs classes if there is one
function addCustomClasses(survey, options) {
  var classes = options.cssClasses

  if (options.question.customClasses) {
    classes.root += " " + options.question.customClasses;
  }
}


//triggered when the question is answered
function addQuestionData(sender) {
  surveyResults.push(sender.data)
  console.log(surveyResults)
  if (sender.otherJSON && shouldAddendQuestion("Other", sender.data)) {
    appendQuestion(sender.otherJSON, sender.renderedElement.id)
    return;
  }
  $('.sv_complete_btn').attr('disabled', true);
  surveySwiper.slideNext();
}


//enables next if no errors
function checkValidity(survey) {
  if (survey.hasErrors() === false) {
    $('.sv_complete_btn').attr('disabled', false);
  } else {
    $('.sv_complete_btn').attr('disabled', true);
  }
}


function testType() {
  console.log('ok yay')
}
$('textarea').keyup(function () {
  console.log('yay')
})
setTimeout(function () {
  $('textarea').keyup(function () {
    testType()
  })
}, 1000)


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
  surveySwiper.update()
  var survey = new Survey.Model(question);

  survey.onComplete.add(addQuestionData);
  survey.onValueChanging.add(checkValidity)
  survey.completeText = 'Next';
  survey.hideRequiredErrors = true;

  survey.onUpdateQuestionCssClasses.add(addCustomClasses)
  $("#surveyContainer" + questionCount).Survey({ model: survey });

  $('.sv_complete_btn').attr('disabled', true);
  surveySwiper.slideNext();
}