_.mixin(_.string.exports());

$(function() {
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
        contents = 'Latitude: <strong>' + _(info.lat || 'Unknown').escapeHTML() + 
          '</strong>&nbsp;&nbsp;&nbsp;';
        contents += 'Longitude: <strong>' + _(info.lon || 'Unknown').escapeHTML() + '</strong><br/>';
        contents += 'Type: <strong>' + _(info.type || 'Unknown').escapeHTML() + '</strong>';
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

