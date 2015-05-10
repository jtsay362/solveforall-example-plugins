'use strict';

var DEFAULT_TILE_PROVIDER_NAME = 'MapQuest OSM';

var baseLayers = {
  'MapQuest OSM': L.tileLayer.provider('MapQuestOpen.OSM'),
  'MapQuest Aerial': L.tileLayer.provider('MapQuestOpen.Aerial'),
  // Should not use this by default since OSM discourages tile use.
  'OpenStreetMap Default': L.tileLayer.provider('OpenStreetMap.Mapnik'),
  /* No HTTPS support
  'OpenStreetMap German Style': L.tileLayer.provider('OpenStreetMap.DE'),
  'OpenStreetMap Black and White': L.tileLayer.provider('OpenStreetMap.BlackAndWhite'),
  'OpenStreetMap H.O.T.': L.tileLayer.provider('OpenStreetMap.HOT'), */
  /* No HTTPS support
  'Hydda Full': L.tileLayer.provider('Hydda.Full'), */
  //'MapBox Example': L.tileLayer.provider('MapBox.examples.map-zr0njcqy'),
  'Esri WorldStreetMap': L.tileLayer.provider('Esri.WorldStreetMap'),
  /* don't work
  'Esri DeLorme': L.tileLayer.provider('Esri.DeLorme'), */
  'Esri WorldTopoMap': L.tileLayer.provider('Esri.WorldTopoMap'),
  'Esri WorldImagery': L.tileLayer.provider('Esri.WorldImagery'),
  /* don't work
  'Esri WorldTerrain': L.tileLayer.provider('Esri.WorldTerrain'),
  'Esri WorldShadedRelief': L.tileLayer.provider('Esri.WorldShadedRelief'),
  'Esri WorldPhysical': L.tileLayer.provider('Esri.WorldPhysical'),
  'Esri OceanBasemap': L.tileLayer.provider('Esri.OceanBasemap'), */
  'Esri NatGeoWorldMap': L.tileLayer.provider('Esri.NatGeoWorldMap'),
  'Esri WorldGrayCanvas': L.tileLayer.provider('Esri.WorldGrayCanvas'),
  /* No HTTPS support
  'Acetate': L.tileLayer.provider('Acetate') */
  'Stamen Toner': L.tileLayer.provider('Stamen.Toner'),
  'Stamen Terrain': L.tileLayer.provider('Stamen.Terrain'),
  'Stamen Watercolor': L.tileLayer.provider('Stamen.Watercolor'),
  'Thunderforest OpenCycleMap': L.tileLayer.provider('Thunderforest.OpenCycleMap'),
  'Thunderforest Transport': L.tileLayer.provider('Thunderforest.Transport'),
  'Thunderforest Landscape': L.tileLayer.provider('Thunderforest.Landscape')
};

var overlayLayers = {
   /* No HTTPS support
  'OpenSeaMap': L.tileLayer.provider('OpenSeaMap'),
  'OpenWeatherMap Clouds': L.tileLayer.provider('OpenWeatherMap.Clouds'),
  'OpenWeatherMap CloudsClassic': L.tileLayer.provider('OpenWeatherMap.CloudsClassic'),
  'OpenWeatherMap Precipitation': L.tileLayer.provider('OpenWeatherMap.Precipitation'),
  'OpenWeatherMap PrecipitationClassic': L.tileLayer.provider('OpenWeatherMap.PrecipitationClassic'),
  'OpenWeatherMap Rain': L.tileLayer.provider('OpenWeatherMap.Rain'),
  'OpenWeatherMap RainClassic': L.tileLayer.provider('OpenWeatherMap.RainClassic'),
  'OpenWeatherMap Pressure': L.tileLayer.provider('OpenWeatherMap.Pressure'),
  'OpenWeatherMap PressureContour': L.tileLayer.provider('OpenWeatherMap.PressureContour'),
  'OpenWeatherMap Wind': L.tileLayer.provider('OpenWeatherMap.Wind'),
  'OpenWeatherMap Temperature': L.tileLayer.provider('OpenWeatherMap.Temperature'),
  'OpenWeatherMap Snow': L.tileLayer.provider('OpenWeatherMap.Snow') */
};

function addWithLeading(s, a, lead) {
  if (!a) {
    return s;
  }
  if (s) {
    s += lead;
  }
  return s + a;
}

$(function () {
  var de = $('#data');

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

  var tileProviderName = (de.attr('data-tile-provider') || '').trim();

  if (!tileProviderName || !baseLayers[tileProviderName]) {
    tileProviderName = DEFAULT_TILE_PROVIDER_NAME;
  }

  var tileProvider = baseLayers[tileProviderName];

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

    var center = [geoCodeResult.lat, geoCodeResult.lon];
    var map = L.map('map', {
			center: center,
			zoom: zoom
		});

    var bb = geoCodeResult.boundingbox;

    if (bb && a && !a.road) {
      try {
        var minLat = parseFloat(bb[0]);
        var maxLat = parseFloat(bb[1]);
        var minLong = parseFloat(bb[2]);
        var maxLong = parseFloat(bb[3]);

        map.fitBounds([
          [minLat, minLong],
          [minLat, maxLong],
          [maxLat, minLong],
          [maxLat, maxLong]
        ]);
      } catch (e) {
        console.error('Cannot fit bounding box', e);
      }
    }

    L.control.scale().addTo(map);

    L.marker(center).addTo(map).bindPopup(labelHtml).openPopup();

    var defaultLayer = tileProvider.addTo(map);
    var layerControl = L.control.layers(baseLayers, overlayLayers, {collapsed: true}).addTo(map);

    // resize layers control to fit into view.
    function resizeLayerControl() {
      var layerControlHeight = document.body.clientHeight - (10 + 50);
      var layerControl = document.getElementsByClassName('leaflet-control-layers-expanded')[0];

      try {
        layerControl.style.overflowY = 'auto';
        layerControl.style.maxHeight = layerControlHeight + 'px';
      } catch (e) {
        ;
      }
    }
    map.on('resize', resizeLayerControl);
    resizeLayerControl();
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
  }
});
