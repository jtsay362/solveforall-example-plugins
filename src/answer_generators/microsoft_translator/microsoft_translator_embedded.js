/*jslint browser: true, continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global $, _, Microsoft */
var sourceLanguageCode = $('#data-holder').attr('data-source-language-code');
if (sourceLanguageCode === 'null') {
  sourceLanguageCode = null;
}

var targetLanguageCode = $('#data-holder').attr('data-target-language-code');

$(function() {
  function handleLanguages(languages) {
    if (sourceLanguageCode) {
      var foundSourceLanguage = _(languages).find(function (lang) {
        return lang['Code'] === sourceLanguageCode;
      });

      if (foundSourceLanguage) {
        $('#source_language').text(foundSourceLanguage.Name);
      }
    }

    var foundTargetLanguage = _(languages).find(function (lang) {
      return lang['Code'] === targetLanguageCode;
    });

    if (foundTargetLanguage) {
      $('#selected_target_language').text(foundTargetLanguage.Name);
    }
  }

  function updateProgress(percent) {
    $('#translation_progress_bar').css('width', '' + percent + '%').attr(
      'aria-valuenow', '' + percent).html('' + percent + '%');
  }

  function onProgress(value) {
    updateProgress(Math.round(value * 100.0));
  }

  function onError(error) {
    $('#translation_progress').addClass('hidden');
    $('#translation_error').removeClass('hidden').addClass('show');
  }

  function onComplete() {
    $('#translation_progress').addClass('hidden');
    $('#translation_result').removeClass('hidden').addClass('show');

    $('#WidgetFloaterPanels').css({
      top: '85vh',
      left: '10px'
    });
  }

  function onRestoreOriginal() {
  }

  $('#translation_progress_container').css({
    'margin-left': '20vw',
    'margin-right': '20vw'
  });

  updateProgress(0);

  Microsoft.Translator.Widget.GetLanguagesForTranslate('en', handleLanguages);

  Microsoft.Translator.Widget.Translate(sourceLanguageCode, targetLanguageCode,
    onProgress, onError, onComplete, onRestoreOriginal, 8000);
});
