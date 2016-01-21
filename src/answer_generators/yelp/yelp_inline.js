/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/* global _, HostAdapter, hostAdapter */

const URI = require('URI');
const OAuth = require('oauth-1.0a');
const ejs = require('ejs');

function mapUrl(business) {
  const location = business.location;
  const uri = URI('http://www.mapquest.com/')
  return uri.addQuery('le', 't').
    addQuery('q', 'addr: ' + location.address.join(',') + ' city: ' + location.city +
             ' state: ' + location.state_code + ' postalCode: ' +
             location.postal_code + ' country: ' + location.country_code + ' (' +
             business.name + ')').
    addQuery('maptype', 'map').addQuery('vs', 'embed').toString();
}

function makeResponseHandler(boundData) {
  return function (responseText, httpResponse) {
    console.log(`boundData = ${JSON.stringify(boundData)}`);
    console.log(`got response text = '${responseText}'`);

    const response = JSON.parse(responseText);
    const businesses = response.businesses;

    if (!businesses || (businesses.length === 0)) {
      console.log('No businesses found');
      return [];
    }

    const {
      q,
      recognitionLevel,
      location
    } = boundData;

    const DISCARDED_PHONE_PREFIX_REGEX = /^\s*\+?1\-?\s*/;
    const contentTemplate = `
<html>
  <head>
    <style>
      .business_title {
        font-size: large;
      }
      .text_container {
        margin-right: 12px;
        margin-top: 8px;
        margin-bottom: 8px;
        width: calc(100% - 166px);
        max-width: 600px;
      }
      .num_results_label {
        margin-top: 8px;
      }
      .business_container {
        margin-bottom: 12px;
      }
      .snippet_container {
        margin-top: 8px;
      }
      .snippet_image, .deal_image {
        margin: 6px;
      }
      .snippet_text, .deal_text {
        width: calc(100% - 48px);
        max-width: 400px;
      }
    </style>
  </head>
  <body>
    <p>
      <img src="http://s3-media4.fl.yelpcdn.com/assets/2/www/img/7e704c57a423/developers/yelp_logo_75x38.png"
       width="75" height="38" alt="Yelp">
      <span class="num_results_label"> returned
        <%= _('result').pluralize(response.total, true) %>:
      </span>
    </p>

    <div>
    <% const DEAL_URL_PREFIX = 'http://www.dpbolvw.net/click-7730982-10867460?url=';
       _(response.businesses).each(function (b) { %>
      <div class="business_container">
        <div class="text_container pull-left">
          <div>
            <span><a href="<%= b.url %>" class="business_title"><%= b.name %></a></span>
            <% if (b.is_closed) { %>
              <span class="label label-danger">CLOSED</span>
            <% } %>
          </div>
          <div>
            <span><img src="<%= b.rating_img_url %>"></span>
            <span><small><%= _('review').pluralize(b.review_count, true) %></small></span>
          </div>
          <div>
            <address>
            <% let addresses = b.location.display_address || [];
               while (addresses.length > 3) {
                 addresses[0] = addresses[0] + ', ' + addresses[1];
                 addresses.splice(1, 1);
               }
               let firstLine = true;
               _(addresses).each(function (a) { %>
                 <%= a %>
                 <% if (firstLine) {
                      if (b.distance) { %>
                        (<%= (b.distance * 0.000621371).toFixed(1) %> mi.)
                   <% } %>
                      <a href="<%= mapUrl(b) %>" target="_blank" title="View map">
                        <i class="fa fa-map-marker fa-lg"></i>
                      </a>
                 <%   firstLine = false;
                    } %>
                 <br/>
               <% }); %>
            </address>
          </div>
          <div>
            <%= b.display_phone ? b.display_phone.replace(DISCARDED_PHONE_PREFIX_REGEX, '') :
                '(No phone number available)' %>
          </div>
        </div>
        <div class="pull-right">
          <a href="<%= b.url %>">
            <img class="img-thumbnail" src="<%= b.image_url %>" width="150" height="150">
          </a>
        </div>
        <div class="clear"></div>
        <% if (b.snippet_text) { %>
          <div class="snippet_container">
            <% if (b.snippet_image_url) { %>
              <div class="snippet_image pull-left">
                <img src="<%= b.snippet_image_url %>" width="32" height="32">
              </div>
            <% } %>
            <div class="snippet_text pull-left">
              <i>&ldquo;<%= b.snippet_text %>&rdquo;</i>
            </div>
            <div class="clear"></div>
          </div>
        <% } %>
        <% if (b.deals && (b.deals.length > 0)) { %>
          <div class="deals_container">
            <span class="label label-success"
              title="Links to deals are affiliate links, for which Solve for All receives a commission from Yelp.">
              Affiliate
            </span>
            &nbsp;
            <h4 class="inline-block">
              <span class="content_expander">
                <%= _('deal').pluralize(b.deals.length, true) %> available:
                <i class="fa fa-chevron-down"></i>
              </span>
            </h4>
            <div class="content_expandable initially_hidden">
            <% _(b.deals).each(function (deal) {
              let dealUrl = DEAL_URL_PREFIX + encodeURIComponent(deal.url);
            %>
              <div class="deal">
                <p>
                  <a href="<%= dealUrl %>"><b><%= deal.title %></b></a>
                </p>
                <div>
                  <% if (deal.image_url) { %>
                  <div class="deal_image pull-left">
                    <a href="<%= dealUrl %>">
                      <img src="<%= deal.image_url %>" width="32" height="32">
                    </a>
                  </div>
                  <% } %>
                  <div class="deal_text pull-left">
                    <%- deal.what_you_get %>
                  </div>
                  <div class="clear"></div>
                </div>
                <% if (deal.options && (deal.options.length > 0)) { %>
                  <div class="deal_options">
                    <b>Options</b>:
                    <ul>
                    <% _(deal.options).each(function (option) { %>
                      <li>
                        <a href="<%= DEAL_URL_PREFIX + encodeURIComponent(option.purchase_url) %>">
                          <%= option.title %>
                        </a>
                        <% if (option.remaining_count) { %>
                          <span class="label label-warning"><%= option.remaining_count %> left</span>
                        <% } %>
                      </li>
                    <% }); %>
                    </ul>
                  </div>
                <% } %>

                <% _(['important', 'additional']).each(function (restrictionType) {
                     let restrictions = deal[restrictionType + '_restrictions'];
                     if (restrictions && (restrictions.length > 0)) { %>
                     <p>
                       <b><%= _(restrictionType).capitalize() %> restrictions</b>:
                       <ul>
                       <% _(restrictions.split(/[\\r\\n]+/)).each(function (line) { %>
                          <li><%- line %></li>
                       <% }); %>
                       </ul>
                     </p>
                  <% }
                   }); %>
              </div>
            <% }); %>
            </div>
          </div>
        <% } %>
      </div>
      <hr/>
    <% }); %>
    </div>
  </body>
</html>`;

    const model = {
      _,
      response,
      DISCARDED_PHONE_PREFIX_REGEX,
      mapUrl
    };

    let uri = 'http://www.yelp.com/search?find_desc=' + encodeURIComponent(q);

    if (location) {
      uri += '&find_loc=' + encodeURIComponent(location);
    }

    return [{
      content: ejs.render(contentTemplate, model),
      contentType: 'text/html',
      serverSideSanitized: true,
      label: 'Yelp',
      uri,
      iconUrl: 'http://www.yelp.com/favicon.ico',
      relevance: recognitionLevel - 0.1
    }];
  };
}

function errorHandler(response) {
  if (response) {
    console.log('No response available?!');
  } else {
    console.log('Got error response: ' + JSON.stringify(response));
  }

  return [];
}

function generateResults(recognitionResults, q, context) {
  'use strict';

  if (context.isSuggestionQuery) {
    return [];
  }

  let location = null;
  let queryAddresses = recognitionResults['com.solveforall.recognition.location.UsAddress'];
  let queryAddressSpecificEnough = false;
  let foundExplicitLocation = false;
  let recognitionLevel = 0;

  if (queryAddresses && (queryAddresses.length > 0)) {
    let recognitionResult = queryAddresses[0];
    recognitionLevel = recognitionResult.recognitionLevel;

    let cityStateZip = null;

    if (recognitionResult.zipCode && (recognitionResult.zipCode >= 5)) {
      cityStateZip = recognitionResult.zipCode;
      queryAddressSpecificEnough = true;
    } else if (recognitionResult.city && recognitionResult.regionAbbreviation) {
      cityStateZip = recognitionResult.city + ',' + recognitionResult.regionAbbreviation;
      queryAddressSpecificEnough = true;
    } else {
      console.info('No city/state/zip found');
    }

    if (queryAddressSpecificEnough) {
      console.info('cityStateZip = "' + cityStateZip + '"');

      if (recognitionResult.streetAddress) {
        location = recognitionResult.streetAddress + ',';
      } else {
        location = '';
      }

      location += cityStateZip;

      q = q.replace(recognitionResult.matchedText, '').trim();
      console.log('Removed US address from query: ' + q);

      foundExplicitLocation = true;
    }
  }

  let ll = null;
  if (!queryAddressSpecificEnough) {
    let geoResults = recognitionResults['com.solveforall.recognition.location.GeoCoordinates'];
    if (geoResults && (geoResult.length > 0)) {
      let geoResult = geoResults[0];
      ll = geoResult.latitude.toFixed(4) + ',' + geoResult.longitude.toFixed(4);
      recognitionLevel = geoResult.recognitionLevel;
    }
  }

  const userLocation = context.location;
  if (!location && !ll && userLocation && userLocation.lat) {
    ll = userLocation.lat.toFixed(4) + ',' + userLocation.lng.toFixed(4);
  }

  if (!location && !ll && context.user && context.user.physicalAddresses &&
      (context.user.physicalAddresses.length > 0)) {
    // FIXME: use setting to pick best one
    let pa = context.user.physicalAddresses[0];
    if (pa.addressLine1) {
      location = pa.addressLine1 + ',';
    } else {
      location = '';
    }
    location += (pa.city + ',' + pa.region.abbreviation);
    // FIXME: add country
  }

  if (!location && !ll) {
    console.log('No location found');
    return [];
  }

  const yelpSettings = context.developerSettings.yelp;

  if (!yelpSettings) {
    throw 'No Yelp settings found!';
  }

  const {
    consumerKey,
    consumerSecret,
    token,
    tokenSecret
  } = yelpSettings;

  if (!(consumerKey && consumerSecret && token && tokenSecret)) {
    throw 'Missing secret!';
  }

  let processedQuery = q.replace(/\s+deals?(\s+|$)/, ' ').trim();

  if (!processedQuery) {
    if (foundExplicitLocation) {
      // So "yelp" + address does a restaurant search
      processedQuery = 'restaurant';
    } else {
      console.info('Nothing left after removing US address and "deals", not returning results');
      return [];
    }
  }

  const dealsOnly = (processedQuery !== q);

  const oauth = OAuth({
    consumer: {
      public: consumerKey,
      secret: consumerSecret
    },
    signature_method: 'HMAC-SHA1'
  });

  const tokenObj = {
    public: token,
    secret: tokenSecret
  };

  const uri = URI('http://api.yelp.com/v2/search');
  uri.addQuery('term', processedQuery);

  if (location) {
    uri.addQuery('location', location);
  } else if (ll) {
    uri.addQuery('ll', ll);
  }

  if (dealsOnly) {
    uri.addQuery('deals_filter', 'true');
  }

  const url = uri.toString();

  const requestData = {
    url,
    method: 'GET',
    data: {}
  };

  const request = hostAdapter.makeWebRequest(url, {
    accept: 'application/json',
    data: oauth.authorize(requestData, tokenObj)
  });

  const boundData = {
    q,
    recognitionLevel,
    location
  };

  request.send('makeResponseHandler(' + JSON.stringify(boundData) + ')',
    'errorHandler');

  return HostAdapter.SUSPEND;
}
