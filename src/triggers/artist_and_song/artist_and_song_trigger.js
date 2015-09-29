/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _ */

function shouldActivate(q, recognitionResults, context) {
  const ARTIST_KEYS = ['org.dbpedia.ontology.Band',
    'org.dbpedia.ontology.MusicalArtist',
    'org.purl.dc.Singer', 'org.purl.dc.AmericanSinger',
    'org.dbpedia.ontology.Artist'];
    const SONG_KEYS = ['org.dbpedia.ontology.Single', 'org.dbpedia.ontology.MusicalWork', 'org.dbpedia.ontology.Album'];

  if (_(ARTIST_KEYS).find(key => recognitionResults[key]) &&
      _(SONG_KEYS).find(key => recognitionResults[key])) {
    return true;
  }
  return false;
}
