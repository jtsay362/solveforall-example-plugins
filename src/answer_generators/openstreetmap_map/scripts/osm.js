/*jslint browser: true, continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global $, _, ol */

'use strict';

function addWithLeading(s, a, lead) {
  if (!a) {
    return s;
  }
  if (s) {
    s += lead;
  }
  return s + a;
}

function latLongToCoordinates(lat, lon) {
  return ol.proj.transform([
    lon, lat
  ], 'EPSG:4326', 'EPSG:3857');
}

$(function () {
  var de = $('#data');

  var BASE_URL = (de.attr('data-content-base-url') || '');

  var zoom = 15;
  var zoomString = de.attr('data-zoom');
  try {
    zoom = parseInt(zoomString || '15', 10);
  } catch (e) {
    console.error('Can\'t parse zoom: "' + zoomString + '"');
  }
  // TODO: ensure zoom is small enough to fit bounding box

  // 'degrees', 'imperial', 'nautical', 'metric', 'us'
  var scaleUnits = de.attr('data-scale-units') || 'metric';

  var labelHtml = de.attr('data-label') || '';

  if (labelHtml) {
    labelHtml = '<h4>' + _.escape(labelHtml) + '</h4>';
  }

  var address = de.attr('data-address');

  function loadMap(geoCodeResult) {
    var a = geoCodeResult.address
    var as = address || '';
    if (a) {
      as = '';
      if (a.road) {
        if (a.house_number) {
          as += a.house_number;
          as += ' ';
        }
        as += a.road
      }

      as = addWithLeading(as, a.city, '\n');

      if (a.state) {
        as = addWithLeading(as, a.state, a.city ? ', ' : '\n');
      }

      as = addWithLeading(as, a.postcode, ' ');
      if ((as.country_code !== 'us') && as.country) {
        as = addWithLeading(as, a.country, '\n');
      }
    }

    if (as) {
      labelHtml += _.escape(as).replace('\n', '<br>');
    }

    var centerCoordinates = latLongToCoordinates(geoCodeResult.lat,
      geoCodeResult.lon);

    var iconFeature = new ol.Feature({
      geometry: new ol.geom.Point(centerCoordinates),
      name: labelHtml
    });

    var iconStyle = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        opacity: 0.9,
        src: BASE_URL + '/images/pin.png'
      }))
    });

    iconFeature.setStyle(iconStyle);

    var vectorSource = new ol.source.Vector({
      features: [iconFeature]
    });

    var vectorLayer = new ol.layer.Vector({
      source: vectorSource
    });

    var rasterLayer = new ol.layer.Tile({
      //source: new ol.source.OSM()
      source: new ol.source.MapQuest({
        layer: 'osm'
      })
    });

    var map = new ol.Map({
      controls: ol.control.defaults({
        attributionOptions: {
          collapsible: false
        }
      }).extend([
        new ol.control.ScaleLine({
          units: scaleUnits
        }),
        new ol.control.FullScreen()
      ]),

      layers: [
        rasterLayer, vectorLayer
      ],
      target: 'map',
      view: new ol.View({
        center: centerCoordinates,
        zoom: zoom
      })
    });

    var element = document.getElementById('popup');

    var popup = new ol.Overlay({
      element: element,
      positioning: 'bottom-center',
      stopEvent: false
    });
    map.addOverlay(popup);

    function showPopupForFeature(feature) {
      var geometry = feature.getGeometry();
      var coord = geometry.getCoordinates();
      popup.setPosition(coord);
      $(element).popover({
        placement: 'top',
        html: true,
        content: feature.get('name')
      });
      $(element).popover('show');
    }

    function togglePopup(evt) {
      var feature = map.forEachFeatureAtPixel(evt.pixel,
          function(feature, layer) {
            return feature;
          });
      if (feature) {
        showPopupForFeature(feature);
      } else {
        $(element).popover('destroy');
      }
    }

    // display popup on click
    map.on('click', function(evt) {
      togglePopup(evt);
    });


    var bb = geoCodeResult.boundingbox;

    if (bb && a && !a.road) {
      try {
        var minLat = parseFloat(bb[0]);
        var maxLat = parseFloat(bb[1]);
        var minLong = parseFloat(bb[2]);
        var maxLong = parseFloat(bb[3]);
        var extent = [minLong, minLat, maxLong, maxLat];
        extent = ol.extent.applyTransform(extent,
          ol.proj.getTransform("EPSG:4326", "EPSG:3857"));

        map.getView().fitExtent(extent, map.getSize());
      } catch (e) {
        console.error('Cannot fit bounding box', e);
      }
    }

    // change mouse cursor when over marker
    /* Doesn't work and .style causes an error
    map.on('pointermove', function(e) {
      /*
      if (e.dragging) {
        $(element).popover('destroy');
        return;
      } * /
      var pixel = map.getEventPixel(e.originalEvent);
      var hit = map.hasFeatureAtPixel(pixel);
      map.getTarget().style.cursor = hit ? 'pointer' : '';
    }); */

    // Without setTimeout(), popup's left bottom corner is placed above the pin.
    setTimeout(function () {
      showPopupForFeature(iconFeature);
    }, 0);
  }

  var latitudeString = de.attr('data-latitude');

  if (latitudeString) {
    var latitude = parseFloat(latitudeString);
    var longitude = parseFloat(de.attr('data-longitude'));

    if (!labelHtml) {
      labelHtml = _.escape(latitude.toFixed(5) + ", " + longitude.toFixed(5));
    }

    loadMap({
      lat: latitude,
      lon: longitude
    });
    return;
  }

  if (address) {
    $.ajax({
      url: 'https://nominatim.openstreetmap.org/search/',
      //type: 'POST',
      data: {
        format: 'json',
        q: address,
        countrycodes: 'us',
        addressdetails: '1',
        email: 'help@solveforall.com',
        limit: 1
      },
      success: function (data) {
        if (data && (data.length > 0)) {
          console.log(JSON.stringify(data));

          var geoCodeResult = data[0];
          geoCodeResult.lat = parseFloat(geoCodeResult.lat);
          geoCodeResult.lon = parseFloat(geoCodeResult.lon);

          loadMap(geoCodeResult);
        } else {
          console.error('received bad data: ' + data);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error('Failed with status ' + textStatus + ', error = ' + errorThrown);
      }
    });
    return;
  }
});
