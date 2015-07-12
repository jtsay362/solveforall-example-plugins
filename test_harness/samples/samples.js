importClass(java.io.File);
importClass(Packages.org.apache.commons.io.FileUtils);

function loadFile(fileName) {
	var file = new File(fileName);
	if (file.isAbsolute() === false) {
		file = new File(fileName);
	}


	var out = FileUtils.readFileToString(file);

  out = new String(out).toString();

  //print(out);

  return out;
}

function outputToFile(fileName, s) {
  var file = new File(fileName);
	if (file.isAbsolute() === false) {
		file = new File(fileName);
	}

  FileUtils.write(file, s)
}

eval(loadFile('test_harness/env/setup.js'));

var IMPLICIT_HTML = '<head>\n' +
  '<!-- Start simulated environment for sanitized content (for testing only) -->\n' +
  loadFile('test_harness/env/browser/sanitized_content.html');

['sanitized_content'].forEach(function (f) {
  IMPLICIT_HTML += '\n<style>\n';
  IMPLICIT_HTML += loadFile('test_harness/env/browser/' + f + '.css');
  IMPLICIT_HTML += '</style>\n';
});

['common', 'content_expander', 'fallback_images', 'on_load'].forEach(function (f) {
  IMPLICIT_HTML += '\n<script>\n';
  IMPLICIT_HTML += loadFile('test_harness/env/browser/' + f + '.js');
  IMPLICIT_HTML += '</script>\n';
});

IMPLICIT_HTML += '<!-- End simulated environment for sanitized content -->';

function processEjs(inFileName, input) {
  var template = loadFile('src/answer_generators/wikipedia/info.html.ejs');
	var renderer = ejs.compile(template);
	var html = renderer(input);

  html = html.replace('<head>', IMPLICIT_HTML);

  outFileName = inFileName.replace('src/answer_generators/', 'build/samples/')
    .replace(/\.ejs$/, '');
  outputToFile(outFileName, html);
}

function testWikiInfoBox() {
	processEjs('src/answer_generators/wikipedia/info.html.ejs', {
    context: {
      settings: {
      }
    },
		recognitionResults: {
      "com.solveforall.recognition.WikipediaArticle": [
        {
          "inLinkCount": 416,
          "matchedText": "Jessica Alba",
          "longAbstract_en": "Jessica Marie Alba (born April 28, 1981) is an American television and film actress and model. She began her television and movie appearances at age 13 in Camp Nowhere and The Secret World of Alex Mack (1994). Alba rose to prominence as the lead actress in the James Cameron television series Dark Angel (2000–2002) when she was 19 years-old.Alba later appeared in Honey (2003), Sin City (2005), Fantastic Four (2005), Into the Blue (2005), Fantastic Four: Rise of the Silver Surfer (2007) and Good Luck Chuck (2007).Alba has been called a sex symbol. She appears on the \"Hot 100\" section of Maxim and was voted number one on AskMen.com's list of \"99 Most Desirable Women\" in 2006, as well as \"Sexiest Woman in the World\" by FHM in 2007. In 2005, TV Guide ranked her # 45 on its \"50 Sexiest Stars of All Time\" list. The use of her image on the cover of the March 2006 Playboy sparked a lawsuit by her, which was later dropped. She has also won various awards for her acting, including the Choice Actress Teen Choice Award and Saturn Award for Best Actress on Television, and a Golden Globe nomination for her lead role in the television series Dark Angel.",
          "title": "Jessica Alba",
          "article": "Jessica_Alba",
          "outLinkCount": 193,
          "thumbnailImageUri": "http://commons.wikimedia.org/wiki/Special:FilePath/Jessica_Alba_2011.jpg?width=300",
          "dbpediaVersion": "2014",
          "recognitionLevel": 1.0,
          "humanFormattedArticle": "Jessica Alba",
          "redirectedFrom": [
            "Jessica Marie Alba",
            "Jay eh",
            "Jessica Alba filmography",
            "Jessica Abla"
          ],
          "semanticProps": {
            "org.dbpedia.ontology.birthPlace": {
              "kind": "uri",
              "value": "org.dbpedia.resource.Pomona,_California"
            },
            "org.dbpedia.ontology.viafId": {
              "kind": "literal",
              "dataType": "string",
              "value": "8521661"
            },
            "org.dbpedia.ontology.birthDate": {
              "kind": "literal",
              "dataType": "date",
              "value": "1981-04-28"
            },
            "org.purl.dc.elements.1.1.description": {
              "kind": "literal",
              "dataType": "string",
              "value": "actress"
            },
            "org.dbpedia.ontology.birthName": {
              "kind": "literal",
              "dataType": "string",
              "language": "en",
              "value": "Jessica Marie Alba"
            },
            "com.xmlns.foaf.0.1.name": {
              "kind": "literal",
              "dataType": "string",
              "language": "en",
              "value": "Alba, Jessica"
            },
            "org.dbpedia.ontology.occupation": {
              "kind": "uri",
              "value": "org.dbpedia.resource.Jessica_Alba__1"
            },
            "org.dbpedia.ontology.birthYear": {
              "kind": "literal",
              "dataType": "year",
              "value": "1981"
            },
            "org.dbpedia.ontology.alias": {
              "kind": "literal",
              "dataType": "string",
              "value": "Alba, Jessica Marie"
            },
            "org.dbpedia.ontology.activeYearsStartYear": {
              "kind": "literal",
              "dataType": "year",
              "value": "1994"
            }
          },
          "depictionImageUri": "http://commons.wikimedia.org/wiki/Special:FilePath/Jessica_Alba_2011.jpg"
        }
		  ]
    }
	});
}

testWikiInfoBox();
