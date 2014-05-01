/*jslint browser: true, continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global $, _ */
_.mixin(_.string.exports());

function processAngle(c) {
  try {
    if (c) {      
      if (typeof c === 'string') {      
        c = parseFloat(c); 
      }

      // 5 digits = accuracy of 1.11 m at equator
      return c.toFixed(5);
    } else {
      return 'Unknown'; 
    }
  } catch (e) {
    return 'Error';     
  }
}

$(function() {
  'use strict';
  
  var infoHolder = $('#info_holder');
  var address = JSON.parse(infoHolder.attr('data-address'));

  var url = 'http://nominatim.openstreetmap.org/search?format=json';

  if (address.streetAddress) {
    url += '&street=' + encodeURIComponent(address.streetAddress);
  }

  if (address.city) {
    url += '&city=' + encodeURIComponent(address.city);
  }

  if (address.stateAbbreviation) {
    url += '&state=' + encodeURIComponent(address.stateAbbreviation);
  }

  if (address.postalCode) {
    url += '&postalcode=' + encodeURIComponent(address.postalCode);
  }

  url += '&email=admin@solveforall.com&limit=1&countrycodes=us';

  $.ajax({
    url: url,
    dataType: 'json',
    crossDomain: true,
    headers: { 'X-Alt-Referer': 'https://solveforall.com' },
    success: function(result) {
      var contents = null;

      if (result && (result.length > 0)){
        var info = result[0];
        contents = 'Display name: ' + _(info.display_name || 'Not found').escapeHTML() + '<br/>';        
                        
        contents += 'Latitude: <strong>' + _(processAngle(info.lat)).escapeHTML() + 
          '</strong>&nbsp;&nbsp;&nbsp;';
        contents += 'Longitude: <strong>' + _(processAngle(info.lon)).escapeHTML() + '</strong><br/>';
        contents += 'Address Type: <strong>' + _(info.type || 'Unknown').escapeHTML() + '</strong>';
      } else {
        contents = 'Not found';
      }

      $('#coordinates').html(contents);
    }, 
    error: function() {
      $('#coordinates').html('Sorry, a communication error has occurred. Please try again later.');
    }
  });
});

