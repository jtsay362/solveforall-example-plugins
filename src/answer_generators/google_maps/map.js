/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global $, _, google */

$(function () {
  'use strict';
  
  var map;
  var geocoder;
  var targetLatLng;
  var targetMarker;
  var infoWindow;

  function updateLocation(position) {
    var start = new google.maps.LatLng(parseFloat(position.coords.latitude),
      parseFloat(position.coords.longitude));

    map.setCenter(start);
  }

  var zoom = 15;

  var zoomString = $('#data').attr('data-zoom');
  try {
    zoom = parseInt(zoomString || '15', 10);
  } catch (e) {
    console.error('Can\'t parse zoom: "' + zoomString + '"');
  }

  var mapType = $('#data').attr('data-map-type');

  if (mapType.length === 0) {
    mapType = 'roadmap';
  }

  var mapTypeId = google.maps.MapTypeId[mapType.toUpperCase()] ||
    google.maps.MapTypeId.ROADMAP;

  var myOptions = {
    zoom: zoom,
    //center: targetLatLng,
    mapTypeId: mapTypeId
  };

  map = new google.maps.Map($('#map_canvas').get(0), myOptions);

  infoWindow = new google.maps.InfoWindow();

  geocoder = new google.maps.Geocoder();

  var address = $('#data').attr('data-address');

  geocoder.geocode({
    address: address
  }, function (results, status) {
    if ((status === google.maps.GeocoderStatus.OK) && (results.length > 0) &&
        results[0].geometry && results[0].geometry.location) {
      targetLatLng = results[0].geometry.location;
      map.setCenter(targetLatLng);

      targetMarker = new google.maps.Marker({
        position: targetLatLng,
        map: map,
        title: address,
        animation: google.maps.Animation.DROP
      });

      infoWindow.setContent(address);
      infoWindow.open(map, targetMarker);

      google.maps.event.addListener(targetMarker, 'click', function() {
         infoWindow.setContent(address);
         infoWindow.open(map, targetMarker);
      });

      if (($('#data').attr('data-tilt') === 'false') &&
          ((mapTypeId === google.maps.MapTypeId.SATELLITE) ||
           (mapTypeId === google.maps.MapTypeId.HYBRID))) {
        map.setTilt(0);
      }
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(updateLocation);
      }
    }
  });

/*
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(updateLocation);
    } */
});
