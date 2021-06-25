import $ from 'jquery';
import Swiper from 'swiper/bundle';
import 'swiper/swiper-bundle.css';
import * as Survey from "survey-jquery";
import exampleSurveyJSON from '../surveys/survey-example.json';

console.log('yay')
var surveyResults = [];


const surveySwiper = new Swiper('#survey', {
  direction: 'vertical',
  // pagination: {
  //   el: ".swiper-pagination",
  //   renderBullet: function (index, className) {
  //     return '<span class="' + className + '">' + (index + 1) + "</span>";
  //   },
  // },
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
  console.log(survey)

  $("#surveyContainer"+index).Survey({model:survey});
})

function addQuestionData(sender) {
  surveyResults.push(sender.data)
  console.log(surveyResults)
  $('.sv_complete_btn').attr('disabled', true);
  surveySwiper.slideNext();
}

function addEventListeners(survey, options) {
  console.log(survey)
  console.log(options.question)
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