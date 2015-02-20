/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter, ejs */

var ARTIST_KEYS = ['org.dbpedia.ontology.Band', 'org.dbpedia.ontology.MusicalArtist', 'org.dbpedia.ontology.Artist'];

function findBestResult(keys, recognitionResults) {
  var currentBestResult = null;
  
  console.log('entering findBestResult');
  
  _(keys).each(function (key) {
    console.log('findBestResult: checking key ' + key);    
    
    var rrList = recognitionResults[key]; 
    if (!rrList) {
      return; 
    }

    _(rrList).each(function (rr) {
       if (!currentBestResult || (rr.recognitionLevel > currentBestResult.recognitionLevel)) {
          currentBestResult = rr;        
       }    
    });    
  });

  console.log('Best result = ' + currentBestResult.wikipediaArticleName);
  
  return currentBestResult;
}

function articleNameToName(articleName, recognitionResults) {
  return _(recognitionResults['com.solveforall.recognition.WikipediaArticle']).find(function (rr) {
    return (rr.article === articleName);
  }).title;
}

function lowerCaseWords(s) {  
  return s.split(/\s+/).map(function (w) {
    return w.toLowerCase();
  });
}

function makeResponseHandler(recognitionLevel, showIfNotFound) {
  return function (responseText, response) {
    console.log('Got response ' + responseText);

    if (response.statusCode !== 200) {
      console.error('Got bad status code ' + response.statusCode);
      return null;
    }

    var artistObj = JSON.parse(responseText);

    if ((artistObj.albums.length === 0) && (showIfNotFound !== 'true')) {
      console.log('No albums for artist found, not outputting result');
      return null;
    }
                
    var contentTemplateXml = <heredoc>
      <![CDATA[
      <html>
        <head></head>
        <body>
          <% var underscoredArtist = artist.replace(' ', '_'); %>
          <% if (albums.length > 0) { %>
            <p>
              Songs by <b><%= artist %></b>:
            </p>
        
            <ul>        
            <% _(albums).each(function(album) { %>
              <li>
                <p>
                  <%= album.album %> 
                  <% if (album.year) { %>
                    (<%= album.year %>)
                  <% } %>
                  <% if (album.amazonLink) { %>                  
                    &nbsp;
                    <a href="<%= album.amazonLink %>">
                      <img src="https://images-na.ssl-images-amazon.com/images/G/01/associates/remote-buy-box/buy6._V192207736_.gif">
                    </a>                  
                  <% } %>
                </p>
                <ul>
                  <% _(album.songs).each(function(song) { %>
                  <li>
                    <a href="http://lyrics.wikia.com/<%= underscoredArtist %>:<%= song.replace(' ', '_') %>">
                      <%= song %>
                    </a>
                  </li>
                  <% }); %>
                </ul>            
              </li>
            <% }); %>
            </ul>        
          <% } else { %>
            <p>
            Sorry, I can&apos;t find any songs by <b><%= artist %></b>.
            </p>                    
          <% } %>
        </body>
      </html>
      ]]>
    </heredoc>;

    var contentTemplate = contentTemplateXml.toString();

    return [{
      content: ejs.render(contentTemplate, artistObj),
      contentType: 'text/html',
      serverSideSanitized: true,
      label: 'Songs',
      iconUrl: 'http://lyrics.wikia.com/favicon.ico',
      summaryHtml: 'Songs by <b>' + _(artistObj.artist).escapeHTML() + '</b>',
      relevance: recognitionLevel
    }];
  };
}


function generateResults(recognitionResults, q, context) {
  'use strict';

  if (context.isSuggestionQuery) {
    return [];
  }

  var artistResult = findBestResult(ARTIST_KEYS, recognitionResults);  

  var artist = null;
  var recognitionLevel = 0.0;
  if (artistResult) {
    artist = articleNameToName(artistResult.wikipediaArticleName, recognitionResults);    
    recognitionLevel = artistResult.recognitionLevel * 0.5;
  } else {
    artist = q;        
  }

  var url = 'http://lyrics.wikia.com/api.php';

  var request = hostAdapter.makeWebRequest(url, {
    data: {
      artist: artist,
      fmt: 'realjson'
    }
  });
  
  var settings = context.settings;
  request.send('makeResponseHandler(' + recognitionLevel.toFixed(4) + ',' + 
               _(settings.showIfNotFound || 'false').toBoolean() + ')');

  return HostAdapter.SUSPEND;    
}
