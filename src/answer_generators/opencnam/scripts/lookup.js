/*jslint browser: true, continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global $, _ */
_.mixin(_.string.exports());

var gotResult = false;
var isPro = true;
function callback(data) {
  gotResult = true;
  $('#caller_id').html('<b>' + _(data.name).escapeHTML() + '</b>');
}

$(function() {
  var infoHolder = $('#info_holder');
  var clientKind = infoHolder.attr('data-client-kind');

  var data = { format: 'json' };
  var settingsString = infoHolder.attr('data-settings');

  var settings = null;

  try {
    settings = JSON.parse(settingsString);
  } catch (e) {
    console.log('No settings found.');
  }

  if (settings) {
    if (settings.accountSid && (settings.accountSid.trim().length > 0)) {
      data['account_sid'] = settings.accountSid.trim();
    } else {
      isPro = false;
    }

    if (isPro && settings.authToken && (settings.authToken.trim().length > 0)) {
      data['auth_token'] = settings.authToken.trim();
    } else {
      isPro = false;
    }
  } else {
    isPro = false;
  }

  $('#opencnam_tier_info').text((isPro ? 'Using Professional Tier.' :
    'Using Hobbyist Tier.') +
     " Edit this Answer Generator's settings to change tier.");

  var fullNumber = infoHolder.attr('data-full-number');

  var ajaxOptions = {
    url: 'https://api.opencnam.com/v2/phone/%2B1' + encodeURIComponent(fullNumber),
    crossDomain: true,
    data: data
  };

  // Use jsonp until opencnam allows cross-domain requests.
  //if (clientKind == 'web') {
    data.format = 'jsonp';
    ajaxOptions.dataType = 'jsonp';
    ajaxOptions.jsonpCallback = 'callback';
  /* } else {
    data.format = 'json';
    ajaxOptions.dataType = 'json';
    ajaxOptions.success = callback;
  } */

  $.ajax(ajaxOptions);
});

setTimeout(function() {
  if (!gotResult) {
    $('#caller_id').text(isPro ? '(Not found)' :
      '(Unavailable for Hobbyist Tier users)');
  }
}, 5000);
