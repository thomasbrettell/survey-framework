import $ from 'jquery';
import Swiper from 'swiper/bundle';
import 'swiper/swiper-bundle.css';
import * as Survey from "survey-jquery";
import exampleSurveyJSON from '../surveys/survey-example.json';

var surveyResults = [];
var questionCount = 0;

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
  survey.hideRequiredErrors = true;

  survey.onAfterRenderQuestion.add(addEventListeners)

  survey.onUpdateQuestionCssClasses.add(addCustomClasses)
  questionCount = questionCount + 1;
  $("#surveyContainer"+(index+1)).Survey({model:survey});
})

function addCustomClasses(survey, options) {
  var classes = options.cssClasses
  console.log(options.question.customClasses)

  if (options.question.customClasses) {
    classes.root += " "+options.question.customClasses;
  }
}

function addQuestionData(sender) {
  surveyResults.push(sender.data)
  console.log(surveyResults)
  if(sender.otherJSON) {
    appendQuestion(sender.otherJSON, sender.renderedElement.id) 
    return;
  }
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

function appendQuestion(question, location) {
  console.log(location)
  console.log(questionCount)
  console.log($("#"+location).parent().parent())
  questionCount = questionCount + 1;
  $('.swiper-slide-next').removeClass('swiper-slide-next')
  $("#"+location).parent().parent().after(`
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

  survey.onAfterRenderQuestion.add(addEventListeners)

  survey.onUpdateQuestionCssClasses.add(addCustomClasses)
  $("#surveyContainer"+questionCount).Survey({model:survey});

  surveySwiper.slideNext();
}