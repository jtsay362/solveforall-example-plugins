/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter, ejs */

var ARTIST_KEYS = ['org.dbpedia.ontology.Band', 'org.dbpedia.ontology.MusicalArtist', 'org.dbpedia.ontology.Artist'];
var SONG_KEYS = ['org.dbpedia.ontology.Single', 'org.dbpedia.ontology.MusicalWork', 'org.dbpedia.ontology.Album'];

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

    var songObj = JSON.parse(responseText);

    if ((songObj.lyrics === 'Not found') && (showIfNotFound !== 'true')) {
      console.log('No lyrics found, not outputing result');
      return null;
    }
        
    var contentTemplateXml = <heredoc>
      <![CDATA[
      <html>
        <head></head>
        <body>
          <% if (lyrics !== 'Not found') { %>
            <p>
              Lyrics for &quot;<%= song %>&quot; by <b><%= artist %></b>:
            </p>
            <pre>
<%= lyrics %></pre>
            <p>
              <small>See full lyrics at <a href="<%= url %>" target="_top">Lyrics Wikia</a></small>
            </p>
          <% } else { %>
            <p>
            Sorry, I can&apos;t find lyrics for &quot;<%= song %>&quot; by <b><%= artist %></b>.
            </p>        
            <p>
              <small>Earn karma by adding the lyrics to <a href="<%= url %>" target="_top">Lyrics Wikia</a></small>!
            </p>
          <% } %>
        </body>
      </html>
      ]]>
    </heredoc>;

    var contentTemplate = contentTemplateXml.toString();

    return [{
      content: ejs.render(contentTemplate, songObj),
      contentType: 'text/html',
      serverSideSanitized: true,
      label: 'Lyrics',
      iconUrl: 'http://lyrics.wikia.com/favicon.ico',
      summaryHtml: 'Lyrics for &quot;' + _(songObj.song).escapeHTML() + '&quot; by <b>' + 
        _(songObj.artist).escapeHTML() + '</b>',
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
  var songResult = findBestResult(SONG_KEYS, recognitionResults);

  var artist = null;
  var recognitionLevel = 0.0;
  if (artistResult) {
    artist = articleNameToName(artistResult.wikipediaArticleName, recognitionResults);    
    recognitionLevel = artistResult.recognitionLevel;
  } 

  var song = null;
  if (songResult) {
    song = articleNameToName(songResult.wikipediaArticleName, recognitionResults);    
    
    if (artistResult) {
      recognitionLevel = Math.min(songResult.recognitionLevel, recognitionLevel);
    } else {
      recognitionLevel = Math.min(songResult.recognitionLevel);
    }
  }

  var words = null;
  var songWords = null;
  var artistWords = null;
  if (!artist) {
    words = lowerCaseWords(q);

    if (words.length < 2) {
      throw "Not enough words to split song and artist (1)";
    }

    if (song) {
      songWords = lowerCaseWords(song);    
      artistWords = _(words).without(songWords);

      if (artistWords.length === 0) {
        throw "Not enough words to split song and artist (2)";
      }

      artist = _(artistWords.join(' ')).titleize();    
    } else {
      // Best guess: artist is the first word
      artist = _(words[0]).titleize();
      song = _(words[1]).titleize();        
    }  
  } else if (!song) {
    words = lowerCaseWords(q);

    if (words.length < 2) {
      throw "Not enough words to split song and artist (3)";
    }  

    artistWords = lowerCaseWords(artist);    
    songWords = _(words).without(artistWords);    

    if (songWords.length === 0) {
      throw "Not enough words to split song and artist (4)";
    }

    song = _(songWords.join(' ')).titleize();    
  }

  var url = 'http://lyrics.wikia.com/api.php';

  var request = hostAdapter.makeWebRequest(url, {
    data: {
      song: song,
      artist: artist,
      fmt: 'realjson'
    }
  });
  
  var settings = context.settings;
  request.send('makeResponseHandler(' + recognitionLevel.toFixed(4) + ',' + 
               _(settings.showIfNotFound || 'false').toBoolean() + ')');

  return HostAdapter.SUSPEND;    
}
