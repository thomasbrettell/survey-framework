<?php 
$survey_json = json_decode(file_get_contents('surveys/survey-example.json'), true);
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <link rel="stylesheet" href="css/styles.css">
  <link rel="stylesheet" href="css/font/Inter/styles.css">
</head>
<body data-survey-title='<?php echo $survey_json["title"]; ?>'>

  <div id='survey' class="swiper-container">
    <div class="swiper-wrapper">
      <?php 
      foreach ($survey_json['questions'] as $index => $question) {
      ?>
        <div class="swiper-slide">
          <div class='question'>
            <div id="surveyContainer<?php echo $index; ?>"></div>
          </div>
        </div>
      <?php
      }
      ?>
    </div>
    <div class="swiper-pagination"></div>
  </div>

</body>
<script src="dist/main.js"></script>
</html>