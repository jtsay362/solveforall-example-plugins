/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global $, _, google */

$(function () {
  'use strict';
  
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

  var map = new google.maps.Map($('#map_canvas').get(0), myOptions);

  var infoWindow = new google.maps.InfoWindow();
    
  function updateLocation(position) {
    var start = new google.maps.LatLng(parseFloat(position.coords.latitude),
      parseFloat(position.coords.longitude));

    map.setCenter(start);
  }
  
  function handleLocation(targetLatLng, label) {    
    map.setCenter(targetLatLng);

    var targetMarker = new google.maps.Marker({
      position: targetLatLng,
      map: map,
      title: label,
      animation: google.maps.Animation.DROP
    });

    infoWindow.setContent(label);
    infoWindow.open(map, targetMarker);

    google.maps.event.addListener(targetMarker, 'click', function() {
       infoWindow.setContent(label);
       infoWindow.open(map, targetMarker);
    });

    if (($('#data').attr('data-tilt') === 'false') &&
        ((mapTypeId === google.maps.MapTypeId.SATELLITE) ||
         (mapTypeId === google.maps.MapTypeId.HYBRID))) {
      map.setTilt(0);
    }            
  }
    
  var address = $('#data').attr('data-address');
  var label = $('#data').attr('data-label');

  if (address && (address.length > 0)) {  
    if (!label) {
      label = address;
    }
    
    var geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({
      address: address
    }, function (results, status) {
      if ((status === google.maps.GeocoderStatus.OK) && (results.length > 0) &&
          results[0].geometry && results[0].geometry.location) {
        handleLocation(results[0].geometry.location, label);
      } else {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(updateLocation);
        }
      }
    });
  } else {
    var latitude = parseFloat($('#data').attr('data-latitude'));
    var longitude = parseFloat($('#data').attr('data-longitude'));
    
    if (!label) {
      label = latitude.toFixed(5) + ", " + longitude.toFixed(5);       
    }
    
    handleLocation(new google.maps.LatLng(latitude, longitude), label);                      
  }

/*
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(updateLocation);
    } */
});
