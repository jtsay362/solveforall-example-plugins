/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/* global _, HostAdapter, hostAdapter, ejs, URI, OAuth */
function makeResponseHandler(q) {
  return function (responseText, httpResponse) {
    console.log('got response text = "' + responseText + '"');
    
    var response = JSON.parse(responseText);
    var businesses = response.businesses;
    
    if (!businesses || (businesses.length === 0)) {
      console.log('No businesses found');
      return [];
    }
    
    var contentTemplateXml = <heredoc>
      <![CDATA[
      <html>
        <head>
          <style> 
            .text_container {
              margin-left: 12px;
              margin-top: 8px;
              margin-bottom: 8px;
            }
            .num_results_label {
              margin-top: 8px;
            }
            .business_container {
              margin-bottom: 12px;
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
          <% _(response.businesses).each(function (b) { %>            
            <div class="business_container">
              <div class="pull-left">
                <a href="<%= b.url %>">
                  <img class="img-thumbnail" src="<%= b.image_url %>" width="150" height="150">
                </a>
              </div>
              <div class="text_container pull-left">
                <div>
                  <span><a href="<%= b.url %>"><%= b.name %></a></span>
                  <% if (b.is_closed) { %>
                    <span class="label label-danger">CLOSED</span>                                      
                  <% } %>                  
                </div>
                <div>
                  <span><img src="<%= b.rating_img_url %>"></span>
                  <span>(<%= _('review').pluralize(b.review_count, true) %>)</span>                
                </div>
                <div>
                  <% var addresses = b.location.display_address || [];
                     while (addresses.length > 3) {
                       addresses[0] = addresses[0] + ', ' + addresses[1];
                       addresses.splice(1, 1); 
                     }        
                    _(addresses).each(function (a) { %>
                    <%= a %><br/>        
                    <% }); %>
                </div>
                <div>
                  <%= b.display_phone || '(No phone number available)' %>
                </div>
              </div>      
              <div class="clear"></div> 
              <% if (b.deals && (b.deals.length > 0)) { %>
                <div class="deals_container">                  
                  <h4><%= _('deal').pluralize(b.deals.length, true) %> available:</h4>
                  <% _(b.deals).each(function (deal) { %>
                    <div class="deal">
                      <p>
                        <a href="<%= deal.url %>"><b><%= deal.title %></b></a>
                      </p>
                      <p>
                        <%- deal.what_you_get %>    
                      </p>

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
      response: response
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
    var recognitionResult = [0];

    var cityStateZip = null;

    if (recognitionResult.zipCode && (recognitionResult.zipCode >= 5)) {
      cityStateZip = recognitionResult.zipCode;
      queryAddressSpecificEnough = true;
    } else if (recognitionResult.city && recognitionResult.stateAbbreviation) {
      cityStateZip = recognitionResult.city + ',' + recognitionResult.stateAbbreviation;
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
    console.log('dev settings = ' + JSON.stringify(context.developerSettings));
    throw 'Missing secret!';
  }
  
  var processedQuery = q.replace(/\s+deals?(\s+|$)/, ' ').trim();
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
  
  var uri = new URI('http://api.yelp.com/v2/search');
  uri.addQuery('term', q);
  
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

  request.send('makeResponseHandler(' + JSON.stringify(q) + ')', 'errorHandler');

  return HostAdapter.SUSPEND;
}
