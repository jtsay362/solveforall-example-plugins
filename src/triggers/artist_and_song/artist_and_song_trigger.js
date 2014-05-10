/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter */

function shouldActivate(q, recognitionResults, context) { 
  var ARTIST_KEYS = ['org.dbpedia.ontology.Band', 'org.dbpedia.ontology.MusicalArtist', 'org.dbpedia.ontology.Artist'];
  var SONG_KEYS = ['org.dbpedia.ontology.Single', 'org.dbpedia.ontology.MusicalWork', 'org.dbpedia.ontology.Album'];
      
  if (_(ARTIST_KEYS).find(function (key) {
        return recognitionResults[key];
      }) && _(SONG_KEYS).find(function (key) {
        return recognitionResults[key];    
      })) {
    return true;
  }
  return false;        
}
