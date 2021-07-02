// import "core-js/stable";
// import "regenerator-runtime/runtime";
import $ from 'jquery';
import * as Survey from "survey-jquery";
import exampleSurveyJSON from '../surveys/survey-example.json';
import _ from 'lodash';

let surveyResults = [];
let questionCount = 0;
let questionNum = 0;

let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);
window.addEventListener('resize', () => {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
});

$('#survey').append(`
<div class='slider-view'>
  <div class='slider-list'>
  </div>
</div>
`)
exampleSurveyJSON.questions.forEach(function(question, index) {
  $('.slider-list').append(`
  <div class='question-container'>
    <div class='question'>
      <div id="surveyContainer${index + 1}"></div>
      <button type='submit' class='next-question' disabled>Next</button>
    </div>
  </div>
  `)
})

// async function getPosts() {
//   const response = await fetch('https://jsonplaceholder.typicode.com/posts');

//   const data = await response.json();

//   return data;
// }
// getPosts().then(posts => console.log(posts))
  // exampleSurveyJSON.questions.forEach(question, function() {
//   $('#survey').append(`

//   `)
// })


//add custom properties to the survey questions
Survey.Serializer.addProperty("question", "customClasses:text");
Survey.Serializer.addProperty("survey", "otherJSON:text");


//initialise swiper
// const surveySwiper = new Swiper('#survey', {
//   direction: 'vertical',
//   pagination: {
//     el: ".swiper-pagination",
//     type: "progressbar",
//     progressbarOpposite: true,
//   },
//   navigation: {
//     nextEl: '.next-question',
//     prevEl: '.swiper-button-prev',
//   },
//   allowTouchMove: false,
//   slidesPerView: 1
// });
// $("#survey").slick({
//   draggable: false,
//   infinite: false,
//   touchMove: false,
//   vertical: true,
//   arrows: false,
//   verticalSwiping: false,
//   accessibility: false,
//   respondTo: 'slider',
//   rows: 0
// });


function nextQuestion(question) {
  if(question.hasErrors() === false) {
    questionNum++

    surveyResults.push(question.data)
    console.log(surveyResults)
    let slider = $('.slider-list')
    let survey = $('#survey')
    
    slider.toggleClass('transitioning')
    setTimeout(function() {
      slider.toggleClass('transitioning')
    }, 500)
    slider.css('transform', `translateY(-${survey.height()*questionNum}px)`)
  }
}

$(window).resize(function() {
  $('.slider-list').css('transform', `translateY(-${$('#survey').height()*questionNum}px)`)
})

// $('.next-question').click(function() {
//   nextQuestion()
// })
// $('#survey').click(function() {
//   console.log('yay')
//   nextQuestion()
// })

//inital rendering with of the survey
exampleSurveyJSON.questions.forEach(function (question, index) {
  var survey = new Survey.Model(question);

  survey.onComplete.add(addQuestionData);
  survey.onCompleting.add(function() {
    console.log('Completing')
  })
  survey.checkErrorsMode = 'onComplete';
  // survey.onValueChanged.add(checkValidity)
  survey.completeText = 'Next';
  // survey.hideRequiredErrors = true;
  survey.onUpdateQuestionCssClasses.add(addCustomClasses)
  survey.onAfterRenderQuestionInput.add(addEventListeners)

  questionCount = questionCount + 1;
  $("#surveyContainer" + (index + 1)).Survey({ model: survey });
})
$('.sv_complete_btn').remove(); //disable next buttons

//add customs classes if there is one
function addCustomClasses(survey, options) {
  var classes = options.cssClasses

  if (options.question.customClasses) {
    classes.root += " " + options.question.customClasses;
  }
}

function addEventListeners(survey, options) {
  let surveyNextBtn = $(`#${survey.renderedElement.id}`).nextAll('.next-question').first()

  surveyNextBtn[0].onclick = function() {
    nextQuestion(survey)
  }

  if (options.question.getType() === 'text' || options.question.getType() === 'comment') {
    options.htmlElement.onkeyup = function () {
      if (options.htmlElement.value.trim().length > 0) {
        surveyNextBtn.attr('disabled', false);
      } else {
        surveyNextBtn.attr('disabled', true);
      }
    }
  }

  options.htmlElement.onchange = function () {
    if (survey.hasErrors() === false) {
      surveyNextBtn.attr('disabled', false);
    } else {
      surveyNextBtn.attr('disabled', true);
    }
  }

  // console.log(options.htmlElement)
}



//triggered when the question is answered
function addQuestionData(sender) {
  surveyResults.push(sender.data)
  console.log(surveyResults)
  if (sender.otherJSON && shouldAddendQuestion("Other", sender.data)) {
    appendQuestion(sender.otherJSON, sender.renderedElement.id)
    return;
  }
  if (sender.yesJSON && shouldAddendQuestion("Yes", sender.data)) {
    appendQuestion(sender.yesJSON, sender.renderedElement.id)
    return;
  }
  $('.sv_complete_btn').attr('disabled', true);
  // surveySwiper.slideNext();
  console.log('next')
  // $("#survey").slick('slickNext');
  nextQuestion()
}


//enables next if no errors
function checkValidity(survey) {
  console.log(survey.data)
  if (survey.hasErrors() === false) {
    $('.sv_complete_btn').attr('disabled', false);
    $('.next-question').attr('disabled', false);
  } else {
    $('.sv_complete_btn').attr('disabled', true);
    $('.next-question').attr('disabled', true);
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
  // surveySwiper.update()
  var survey = new Survey.Model(question);

  survey.onComplete.add(addQuestionData);
  survey.onValueChanging.add(checkValidity)
  survey.completeText = 'Next';
  survey.hideRequiredErrors = true;

  survey.onUpdateQuestionCssClasses.add(addCustomClasses)
  $("#surveyContainer" + questionCount).Survey({ model: survey });
}