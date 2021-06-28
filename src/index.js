import $ from 'jquery';
import Swiper from 'swiper/bundle';
import 'swiper/swiper-bundle.css';
import * as Survey from "survey-jquery";
import exampleSurveyJSON from '../surveys/survey-example.json';

var surveyResults = [];
var questionCount = -1;

Survey.Serializer.addProperty("question", "customClasses:text");
Survey.Serializer.addProperty("survey", "otherJSON:text");

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

exampleSurveyJSON.questions.forEach(function(question, index) {
  var survey = new Survey.Model(question);

  survey.onComplete.add(addQuestionData);
  survey.onValueChanging.add(checkValidity)
  survey.completeText = 'Next';

  survey.onAfterRenderQuestion.add(addEventListeners)

  survey.onUpdateQuestionCssClasses.add(addCustomClasses)
  questionCount = questionCount + 1;
  $("#surveyContainer"+index).Survey({model:survey});
})

function addCustomClasses(survey, options) {
  var classes = options.cssClasses
  console.log(options.question.customClasses)

  if (options.question.customClasses) {
    classes.root += " "+options.question.customClasses;
  }
}

function addQuestionData(sender) {
  appendQuestion(sender.otherJSON, sender.renderedElement.id) 
  surveyResults.push(sender.data)
  // console.log(sender.renderedElement.id)
  // console.log(sender.otherJSON)
  $('.sv_complete_btn').attr('disabled', true);
  surveySwiper.slideNext();
}

function addEventListeners(survey, options) {
  console.log(survey)
  console.log(options.question)
  console.log(survey.data)

  console.log(options.question.customClasses)
}

function checkValidity(survey) {
  if(survey.hasErrors() === false) {
    $('.sv_complete_btn').attr('disabled', false);
  } else {
    $('.sv_complete_btn').attr('disabled', true);
  }
}

$('.sv_complete_btn').attr('disabled', true);


function testType() {
  console.log('ok yay')
}

$('textarea').keyup(function() {
  console.log('yay')
})

console.log($('textarea'))

setTimeout(function() {
  $('textarea').keyup(function() {
    testType()
  })
  console.log($('textarea'))
},1000)

function appendQuestion(object, location) {
  console.log(object)
  console.log(location)
  console.log(questionCount)
}