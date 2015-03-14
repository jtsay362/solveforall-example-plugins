/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/* global _, HostAdapter, hostAdapter, ejs, URI, OAuth */

function mapUrl(business) {
  var location = business.location;
  var uri = URI('http://www.mapquest.com/')
  return uri.addQuery('le', 't').
    addQuery('q', 'addr: ' + location.address.join(',') + ' city: ' + location.city +
             ' state: ' + location.state_code + ' postalCode: ' + 
             location.postal_code + ' country: ' + location.country_code + ' (' +
             business.name + ')').
    addQuery('maptype', 'map').addQuery('vs', 'embed').toString();      
}

function makeResponseHandler(q) {
  return function (responseText, httpResponse) {
    console.log('got response text = "' + responseText + '"');
    
    var response = JSON.parse(responseText);
    var businesses = response.businesses;
    
    if (!businesses || (businesses.length === 0)) {
      console.log('No businesses found');
      return [];
    }
    
    var DISCARDED_PHONE_PREFIX_REGEX = /^\s*\+?1\-?\s*/;    
    var contentTemplateXml = <heredoc>
      <![CDATA[
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
          <% var DEAL_URL_PREFIX = 'http://www.dpbolvw.net/click-7730982-10867460?url=';
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
                  <% var addresses = b.location.display_address || [];
                     while (addresses.length > 3) {
                       addresses[0] = addresses[0] + ', ' + addresses[1];
                       addresses.splice(1, 1); 
                     }        
                     var firstLine = true;  
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
                  <h4>                    
                    <span class="content_expander">
                      <%= _('deal').pluralize(b.deals.length, true) %> available: 
                      <i class="fa fa-chevron-down"></i>
                    </span>
                  </h4>
                  <div class="content_expandable initially_hidden">
                  <% _(b.deals).each(function (deal) { 
                    var dealUrl = DEAL_URL_PREFIX + encodeURIComponent(deal.url);                     
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
                           var restrictions = deal[restrictionType + '_restrictions']; 
                           if (restrictions && (restrictions.length > 0)) { %>
                           <p>  
                             <b><%= _(restrictionType).capitalize() %> restrictions</b>:
                             <ul>
                             <% _(restrictions.split(/[\r\n]+/)).each(function (line) { %>
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
      </html>
      ]]>
    </heredoc>

    var contentTemplate = contentTemplateXml.toString();

    var model = {
      response: response,
      DISCARDED_PHONE_PREFIX_REGEX: DISCARDED_PHONE_PREFIX_REGEX,
      mapUrl: mapUrl
    };

    return [{
      content: ejs.render(contentTemplate, model),
      contentType: 'text/html',
      serverSideSanitized: true,
      label: 'Yelp',
      uri: 'http://www.yelp.com/search?find_desc=' + encodeURIComponent(q),
      iconUrl: 'http://www.yelp.com/favicon.ico',    
      relevance: 1.0
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

  var location = null;
  var queryAddresses = recognitionResults['com.solveforall.recognition.location.UsAddress'];
  var queryAddressSpecificEnough = false;  
  
  if (queryAddresses && (queryAddresses.length > 0)) {
    var recognitionResult = queryAddresses[0];

    var cityStateZip = null;

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
    }
  }
  
  var ll = null;
  if (!queryAddressSpecificEnough) {
    var geoResults = recognitionResults['com.solveforall.recognition.location.GeoCoordinates'];
    if (geoResults && (geoResult.length > 0)) {
      var geoResult = geoResults[0];      
      ll = geoResult.latitude.toFixed(4) + ',' + geoResult.longitude.toFixed(4);       
    }
  }
  
  var userLocation = context.location;
  if (!location && !ll && userLocation && userLocation.lat) {
    ll = userLocation.lat.toFixed(4) + ',' + userLocation.lng.toFixed(4);    
  }  
  
  if (!location && !ll && context.user && context.user.physicalAddresses && 
      (context.user.physicalAddresses.length > 0)) {
    // FIXME: use setting to pick best one
    var pa = context.user.physicalAddresses[0];
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
  
  var yelpSettings = context.developerSettings.yelp;
  
  if (!yelpSettings) {
    throw 'No Yelp settings found!';
  }
  
  var consumerKey = yelpSettings.consumerKey;
  var consumerSecret = yelpSettings.consumerSecret;
  var tokenKey = yelpSettings.token;
  var tokenSecret = yelpSettings.tokenSecret;
  
  if (!(consumerKey && consumerSecret && tokenKey && tokenSecret)) {  
    throw 'Missing secret!';
  }
  
  var processedQuery = q.replace(/\s+deals?(\s+|$)/, ' ').trim();
    
  if (!processedQuery) {
    console.info('Nothing left after removing US address and "deals", not returning results');
    return [];             
  }
    
  var dealsOnly = (processedQuery !== q);
  
  var oauth = OAuth({
    consumer: {
      public: consumerKey,
      secret: consumerSecret
    },
    signature_method: 'HMAC-SHA1'
  });
  
  var token = {
    public: tokenKey,
    secret: tokenSecret
  };
  
  var uri = URI('http://api.yelp.com/v2/search');
  uri.addQuery('term', processedQuery);
  
  if (location) {
    uri.addQuery('location', location); 
  } else if (ll) {
    uri.addQuery('ll', ll); 
  }  
  
  if (dealsOnly) {
    uri.addQuery('deals_filter', 'true'); 
  }
    
  var url = uri.toString();
  
  var requestData = {
    url: url,
    method: 'GET',
    data: {}    
  };
  
  var request = hostAdapter.makeWebRequest(url, {
    accept: 'application/json',
    data: oauth.authorize(requestData, token) 
  });

  request.send('makeResponseHandler(' + JSON.stringify(processedQuery) + ')', 'errorHandler');

  return HostAdapter.SUSPEND;
}
