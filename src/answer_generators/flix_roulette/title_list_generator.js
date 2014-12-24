/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter, XML, ejs */
function makeRatingHtml(rating) {
  var IMAGE_URL_BASE = 'https://solveforall.com/libs/jquery-raty/img/';

  if (!rating) {
    return ''; 
  }
  var intRating = Math.floor(rating);    
  var escapedRating = _(rating).escapeHTML();

  var s = '<span title="Rating: ' + escapedRating + '">';  
  s += ' <span class="sr-only">' + escapedRating + '</span>';

  var i = 0;
  for (i = 0; i < intRating; i++) {
    s += '<img src="' + IMAGE_URL_BASE + 'star-on.png" width="16" height="16" alt="">';
  }

  var fractionRating = rating - intRating;
  if (fractionRating >= 0.5) {
    s += '<img src="' + IMAGE_URL_BASE + 'star-half.png" width="16" height="16" alt="">';
    i += 1;
  }  

  for (; i < 5; i++) {
    s += '<img src="' + IMAGE_URL_BASE + 'star-off.png" width="16" height="16" alt="">';                                  
  }

  return s;                  
}

function makeResponseHandler(q, key, bestName, bestResult) {
  return function(responseText, httpResponse) {
    console.log('got response text = "' + responseText + '"');

    var titles = JSON.parse(responseText);
      
    if (titles.length === 0) {
      console.log('No titles found');
      return []; 
    }
    
    var contentTemplateXml = <heredoc>
      <![CDATA[
      <html>
        <head>
          <style>
            .item {
              margin-bottom: 4px;
            }        
            .main_info {
              width: calc(100% - 80px);
            }
            .header_line {
              margin-bottom: 2px;
            }
            img.with_fallback {
              margin-top: 4px;
              margin-bottom: 4px;
              margin-right: 10px;
            }
            .watch_button {
              font-weight: bold;
              margin-bottom: 10px;
              margin-right: 10px;
              min-width: 60px;
              min-height: 40px;
            }
            hr {
              margin-top: 15px;
              margin-bottom: 15px;
            }
          </style>
        </head>
        <body>     
          <% for (var i = 0; i < titles.length; i++) {
            var title = titles[i];
            var uri = 'http://www.allflicks.net/movies/' + 
              encodeURIComponent(title.show_id) + '/'; %>
            <div class="item"> 
              <div class="pull-left">
                <a href="http://www.netflix.com/WiPlayer?movieid=<%= encodeURIComponent(title.show_id) %>"               
                 <% if (title.poster) { %>                                    
                 title="Watch <%= title.show_title %> on Netflix"
                 <% } else { %>
                 class="btn btn-danger watch_button"
                 <% } %>   
                >
                  <% if (title.poster) { %>                                    
                    <img class="with_fallback" data-img-src-0="<%= title.poster %>"        
                     width="60" alt="Watch on Netflix">
                  <% } else { %>
                    Watch on Netflix
                  <% } %>              
                </a>
              </div>          

              <div class="pull-left main_info">
                <div class="header_line">  
                  <a href="<%= uri %>" title="<%= title.summary %>"><b><%= title.show_title %></b></a>
                  <% if (title.release_year) { %>
                    (<%= title.release_year %>)
                  <% } %>
                  <%- ratingHtmls[i] %>
                </div>      

                <% if (title.show_cast && (title.show_cast.length > 0)) { %>        
                  <div class="header_line">          
                    Cast:
                    <%- title.show_cast.split(/\s*,\s*/).map(function (name) {
                      return '<a href="http://allflicks.net/actor/?actor=' + 
                        encodeURIComponent(name) + '" class="plain plain_on_hover">' + _(name).escapeHTML() + '</a>';        
                    }).join(', ') %>
                  </div>
                <% } %>                         
                      
                <div class="header_line">                  
                  <% if (title.category) { %>                
                    <a href="http://allflicks.net/?keyword=<%= encodeURIComponent(title.category) %>"
                     class="plain plain_on_hover">
                      <%= title.category %>
                    </a>
                  <% } %>                        
                  <% if (title.runtime && (title.runtime !== 'N/A')) { 
                    if (title.category) { %>
                    |
                    <% } %>                      
                    <%= title.runtime %>
                  <% } %>
                </div>                                    
              </div>        
              <div class="clear"></div>      
            </div>          
            <% if (i < titles.length - 1) { %>
              <hr>
            <% } %>
          <% } %>
        
          <p>
            <small>
              API access from <a href="http://netflixroulette.net/">Flix Roulette</a>,
              using data from <a href="http://www.netflix.com">Netflix</a>.
            </small>
          </p>
        </body>
      </html>
      ]]>
    </heredoc>

    var contentTemplate = contentTemplateXml.toString();

    console.debug('Content template = "' + contentTemplate + '"');

    var model = {
      titles: titles,      
      ratingHtmls: _(titles).map(function (title) {
        return makeRatingHtml(title.rating);
      })
    };

    var label = 'Netflix Titles ';
    var uri = 'http://www.allflicks.net/'                                       
                                         
    switch (key) {
      case 'org.dbpedia.ontology.Agent':
      label += 'Starring ' + bestName;
      uri += 'actor/?actor=';
      break;                
     
      default:
      label = 'Netflix Search Results for ' + q;
      uri += '?keyword=' 
      break;
    }
                                                                   
    uri += encodeURIComponent(bestName);
                                         
    return [{
      label: label,
      content: ejs.render(contentTemplate, model),
      contentType: 'text/html',
      serverSideSanitized: true,
      uri:  uri,
      iconUrl: 'http://www.allflicks.net/favicon.png',
      relevance: bestResult.recognitionLevel + 0.01
    }];
  };
}

function generateResults(recognitionResults, q, context) {
  'use strict';

  if (context.isSuggestionQuery) {
    return [];
  }
  
  var articles = recognitionResults['com.solveforall.recognition.WikipediaArticle'];                                    
  
  if (articles.length === 0) {
    console.info('No Wikipedia article references found');
    return []; 
  }
  
  var bestResult = null;
  var bestKey = null;  
  var bestName = null;
  
  _(['org.dbpedia.ontology.Agent']).each(function (key) {
    var rrs = recognitionResults[key];
    
    _(rrs || []).each(function (rr) {        
      if (!bestResult || (rr.recognitionLevel > bestResult.recognitionLevel)) {
        var article = _(articles).find(function (a) {
            return (a.article === rr.wikipediaArticleName);
        });
        
        if (article) {
          bestName = article.title;
          bestKey = key;
          bestResult = rr;         
        }
      }      
    });        
  });

  var parameterName = null;
  var parameterValue = null;
  if (bestResult) {    
    parameterName = 'actor';
    parameterValue = bestName;
  } else {
    console.log('No actors/directors found');
    return [];
  }
      
  var url = 'http://netflixroulette.net/api/api.php?' + parameterName + '=' + 
    encodeURIComponent(parameterValue);

  var request = hostAdapter.makeWebRequest(url, {
    accept: 'application/json'
  });

  request.send('makeResponseHandler(' + 
               JSON.stringify(q) + ',' + 
               JSON.stringify(bestKey) + ',' + 
               JSON.stringify(bestName) + ',' +
               JSON.stringify(bestResult) + ')');

  return HostAdapter.SUSPEND;
}