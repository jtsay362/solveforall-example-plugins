importClass(java.io.File);
importClass(Packages.org.apache.commons.io.FileUtils);

function loadFile(fileName) {
	let file = new File(fileName);
	if (file.isAbsolute() === false) {
		file = new File(fileName);
	}

	let out = FileUtils.readFileToString(file);

	// Convert Java string to Javascript string
  out = new String(out).toString();

  //print(out);

  return out;
}

function outputToFile(fileName, s) {
  let file = new File(fileName);
	if (file.isAbsolute() === false) {
		file = new File(fileName);
	}

  FileUtils.write(file, s)
}

eval(loadFile('test_harness/env/setup.js'));

let IMPLICIT_HTML = '<head>\n' +
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

const ejs = require('ejs');

function processEjs(inFileName, input, useSanitizedEnvironment, outFilenameSuffix) {
  var template = loadFile('src/answer_generators/wikipedia/info.html.ejs');
	var renderer = ejs.compile(template);
	var html = renderer(_.extend(makeImplicitEjsModel(), input));

	if (useSanitizedEnvironment) {
  	html = html.replace('<head>', IMPLICIT_HTML);
	}

  outFileName = inFileName.replace('src/answer_generators/', 'build/samples/')
    .replace(/\.html\.ejs$/, outFilenameSuffix + '.html');
  outputToFile(outFileName, html);
}

function testWikiInfoBoxOnPerson() {
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
	}, true, '_alba');
}

function testWikiInfoBoxOnCompany() {
	processEjs('src/answer_generators/wikipedia/info.html.ejs', {
    context: {
      settings: {
      }
    },
		recognitionResults: {
      "com.solveforall.recognition.WikipediaArticle": [
				{
		      "inLinkCount": 4629,
		      "matchedText": "Google",
		      "longAbstract_en": "Google is an American multinational corporation specializing in Internet-related services and products. These include online advertising technologies, search, cloud computing, and software. Most of its profits are derived from AdWords.Google was founded by Larry Page and Sergey Brin while they were Ph.D. students at Stanford University. Together they own about 16 percent of its shares. They incorporated Google as a privately held company on September 4, 1998. An initial public offering followed on August 19, 2004. Its mission statement from the outset was \"to organize the world's information and make it universally accessible and useful\", and its unofficial slogan was \"Don't be evil\". In 2006 Google moved to headquarters in Mountain View, California, nicknamed the Googleplex.Rapid growth since incorporation has triggered a chain of products, acquisitions and partnerships beyond Google's core search engine. It offers online productivity software including email (Gmail), an office suite (Google Drive), and social networking (Google+). Desktop products include applications for web browsing, organizing and editing photos, and instant messaging. The company leads the development of the Android mobile operating system and the browser-only Chrome OS for a netbook known as a Chromebook. Google has moved increasingly into communications hardware: it partners with major electronics manufacturers in production of its high-end Nexus devices and acquired Motorola Mobility in May 2012. In 2012, a fiber-optic infrastructure was installed in Kansas City to facilitate a Google Fiber broadband service.The corporation has been estimated to run more than one million servers in data centers around the world (as of 2007) and to process over one billion search requests and about 24 petabytes of user-generated data each day (as of 2009).In December 2013 Alexa listed google.com as the most visited website in the world. Numerous Google sites in other languages figure in the top one hundred, as do several other Google-owned sites such as YouTube and Blogger. Its market dominance has led to prominent media coverage, including criticism of the company over issues such as copyright, censorship, and privacy.",
		      "title": "Google",
		      "article": "Google",
		      "outLinkCount": 316,
		      "thumbnailImageUri": "http://commons.wikimedia.org/wiki/Special:FilePath/Logo_Google_2013_Official.svg?width=300",
		      "dbpediaVersion": "2014",
		      "recognitionLevel": 1.0292611,
		      "localRecognitionLevel": 1.0292611,
		      "homePageUri": "http://google.com",
		      "humanFormattedArticle": "Google",
		      "redirectedFrom": [
		        "Goooogle",
		        "Googl3",
		        "Google/to do",
		        "Google Research",
		        "Gooogle",
		        "GOOG",
		        "G00gle",
		        "Google!",
		        "Google Inc.",
		        "Giigke,cin",
		        "Google/",
		        "Googer",
		        "Googlenym",
		        "Google.",
		        "Google Blog",
		        "Mountain view chocolate factory",
		        "Googke",
		        "Googgle",
		        "Foofle",
		        "Demo Slam",
		        "G00g1e",
		        "20 percent time",
		        "Gaia",
		        "Googers",
		        "Googl",
		        "Google Angika",
		        "Google inc.",
		        "1e100.net",
		        "G00gl3",
		        "Ggogle",
		        "Google for Business",
		        "Google Demo Slam",
		        "Gooooooooogle",
		        "Google Space",
		        "@google",
		        "Googlr",
		        "Blue Red Yellow Blue Green Red",
		        "Author Rank",
		        "Google Pakistan",
		        "Google, Inc",
		        "Gstatic.com",
		        "Dashboard",
		        "Google Inc",
		        "Google.c",
		        "Googlit",
		        "GGQ1",
		        "Google pakistan",
		        "Google voice-powered search",
		        "Googlw",
		        "Google Incorporated",
		        "Google.cpm",
		        "Google Site Search",
		        "The Google Guys",
		        "Google Measure Map",
		        "Google English",
		        "Gewgol",
		        "Google\\",
		        "Google guys",
		        "Google™",
		        "Guugle",
		        "Google Guys",
		        "Google community",
		        "Gogole",
		        "GoogIe",
		        "Google Glossary",
		        "Google UK",
		        "Gooooooogle",
		        "Goolge",
		        "Goofle",
		        "Goolgle",
		        "GGEA",
		        "Google India",
		        "Google France",
		        "@Google",
		        "20% time",
		        "Goooooogle",
		        "Ğööğle",
		        "Google check",
		        "Gooooogle",
		        "Googleable",
		        "Google, Inc.",
		        "Animated Google",
		        ".lol",
		        "Google EnergySense",
		        "Google Japan",
		        "Innovation Time Off",
		        "Site Flavored Google Search Box",
		        "Goog"
		      ],
		      "semanticProps": {
		        "org.dbpedia.ontology.foundingDate": {
		          "dataType": "date",
		          "value": "1998-09-04",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.assets": {
		          "dataType": "usDollar",
		          "value": "1.1092E11",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.foundationPlace": {
		          "value": "org.dbpedia.resource.Menlo_Park,_California",
		          "kind": "uri"
		        },
		        "org.dbpedia.ontology.equity": {
		          "dataType": "usDollar",
		          "value": "8.73E10",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.industry": {
		          "value": "org.dbpedia.resource.Telecommunications_equipment",
		          "kind": "uri"
		        },
		        "org.dbpedia.ontology.foundingYear": {
		          "dataType": "year",
		          "value": "1998",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.operatingIncome": {
		          "dataType": "usDollar",
		          "value": "1.396E10",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.numberOfEmployees": {
		          "dataType": "http://www.w3.org/2001/XMLSchema#nonNegativeInteger",
		          "value": "49829",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.locationCity": {
		          "value": "org.dbpedia.resource.Mountain_View,_California",
		          "kind": "uri"
		        },
		        "org.dbpedia.ontology.netIncome": {
		          "dataType": "usDollar",
		          "value": "1.292E10",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.revenue": {
		          "dataType": "usDollar",
		          "value": "5.982E10",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.product": {
		          "value": "org.dbpedia.resource.List_of_Google_products",
		          "kind": "uri"
		        },
		        "com.xmlns.foaf.0.1.homepage": {
		          "value": "http://google.com",
		          "kind": "uri"
		        },
		        "com.xmlns.foaf.0.1.name": {
		          "dataType": "string",
		          "value": "Google Inc.",
		          "language": "en",
		          "kind": "literal"
		        }
		      },
		      "depictionImageUri": "http://commons.wikimedia.org/wiki/Special:FilePath/Logo_Google_2013_Official.svg"
		    }
			]
    }
	}, true, '_google');
}

function testWikiInfoBoxOnCity() {
	processEjs('src/answer_generators/wikipedia/info.html.ejs', {
		context: {
			settings: {
			}
		},
		recognitionResults: {
			"com.solveforall.recognition.WikipediaArticle": [
				{
		      "inLinkCount": 15400,
		      "matchedText": "San Diego",
		      "longAbstract_en": "San Diego /ˌsæn diːˈeɪɡoʊ/ is a major city in California, on the coast of the Pacific Ocean in Southern California, approximately 120 miles (190 km) south of Los Angeles and immediately adjacent to the border with Mexico. San Diego is the eighth-largest city in the United States and second-largest in California and is one of the fastest growing cities in the nation. San Diego is the birthplace of California and is known for its mild year-round climate, natural deep-water harbor, extensive beaches, long association with the U.S. Navy, and recent emergence as a healthcare and biotechnology development center. The population was estimated to be 1,322,553 as of 2012.Historically home to the Kumeyaay people, San Diego was the first site visited by Europeans on what is now the West Coast of the United States. Upon landing in San Diego Bay in 1542, Juan Cabrillo claimed the entire area for Spain, forming the basis for the settlement of Alta California 200 years later. The Presidio and Mission of San Diego, founded in 1769, formed the first European settlement in what is now California. In 1821, San Diego became part of newly independent Mexico, and in 1850, became part of the United States following the Mexican-American War and the admission of California to the union.The city is the seat of San Diego County and is the economic center of the region as well as the San Diego–Tijuana metropolitan area. San Diego's main economic engines are military and defense-related activities, tourism, international trade, and manufacturing. The presence of the University of California, San Diego (UCSD), with the affiliated UCSD Medical Center, has helped make the area a center of research in biotechnology.",
		      "title": "San Diego",
		      "article": "San_Diego",
		      "outLinkCount": 645,
		      "thumbnailImageUri": "http://commons.wikimedia.org/wiki/Special:FilePath/SD_Montage.jpg?width=300",
		      "dbpediaVersion": "2014",
		      "recognitionLevel": 0.7973634,
		      "localRecognitionLevel": 0.7973634,
		      "homePageUri": "http://www.sandiego.gov/",
		      "geoLocation": {
		        "lon": -117.1625,
		        "lat": 32.715
		      },
		      "humanFormattedArticle": "San Diego",
		      "redirectedFrom": [
		        "San diego, ca",
		        "City of San Diego",
		        "San Deigo",
		        "Sandiego",
		        "San Diego California",
		        "San Diego CA",
		        "San Diego, California, US",
		        "San Diego, Ca",
		        "San deigo",
		        "San Diego, California, U.S.A.",
		        "San Diego, California, U.S.",
		        "San diego, CA",
		        "The weather in San Diego",
		        "Pill Hill, San Diego, California",
		        "San Deigo, California",
		        "San Diego, USA",
		        "San Diego, California, USA",
		        "Sandy Eggo",
		        "San Diego, California",
		        "San Diego, Calif.",
		        "Urban Communities of San Diego",
		        "America's Finest City",
		        "UN/LOCODE:USSAN",
		        "San diego beaches",
		        "San Diego, CA"
		      ],
		      "semanticProps": {
		        "org.dbpedia.ontology.timeZone": {
		          "value": "org.dbpedia.resource.Pacific_Time_Zone",
		          "kind": "uri"
		        },
		        "org.dbpedia.ontology.foundingDate": {
		          "dataType": "date",
		          "value": "1850-03-27",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.motto": {
		          "dataType": "string",
		          "value": "Semper Vigilans (Latin for \"Ever Vigilant\")",
		          "kind": "literal"
		        },
		        "com.xmlns.foaf.0.1.nick": {
		          "dataType": "string",
		          "value": "America's Finest City",
		          "language": "en",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.leaderName": {
		          "value": "org.dbpedia.resource.Kevin_Faulconer",
		          "kind": "uri"
		        },
		        "org.w3.www.1999.02.22-rdf-syntax-ns#type": {
		          "value": "net.opengis.www.gml._Feature",
		          "kind": "uri"
		        },
		        "com.xmlns.foaf.0.1.name": {
		          "dataType": "string",
		          "value": "San Diego",
		          "language": "en",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.isPartOf": {
		          "value": "org.dbpedia.resource.San_Diego_County,_California",
		          "kind": "uri"
		        },
		        "org.georss.www.georss.point": {
		          "dataType": "string",
		          "value": "32.715 -117.1625",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.populationUrban": {
		          "dataType": "http://www.w3.org/2001/XMLSchema#nonNegativeInteger",
		          "value": "2956746",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.areaTotal": {
		          "dataType": "http://www.w3.org/2001/XMLSchema#double",
		          "value": "9.6451E8",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.areaWater": {
		          "dataType": "http://www.w3.org/2001/XMLSchema#double",
		          "value": "1.2227E8",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.populationDensity": {
		          "dataType": "http://www.w3.org/2001/XMLSchema#double",
		          "value": "1545.4",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.populationTotalRanking": {
		          "dataType": "http://www.w3.org/2001/XMLSchema#positiveInteger",
		          "value": "8",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.postalCode": {
		          "dataType": "string",
		          "value": "92101-92117, 92119-92124, 92126-92140, 92142, 92145, 92147, 92149-92155, 92158-92172, 92174-92177, 92179, 92182, 92184, 92186, 92187, 92190-92199",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.governingBody": {
		          "value": "org.dbpedia.resource.San_Diego_City_Council",
		          "kind": "uri"
		        },
		        "org.dbpedia.ontology.leaderTitle": {
		          "dataType": "string",
		          "value": "Mayor",
		          "language": "en",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.percentageOfAreaWater": {
		          "dataType": "float",
		          "value": "12.68",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.areaCode": {
		          "dataType": "string",
		          "value": "619, 858",
		          "kind": "literal"
		        },
		        "com.xmlns.foaf.0.1.homepage": {
		          "value": "http://www.sandiego.gov/",
		          "kind": "uri"
		        },
		        "org.w3.www.2003.01.geo.wgs84_pos#long": {
		          "dataType": "float",
		          "value": "-117.1625",
		          "kind": "literal"
		        },
		        "org.w3.www.2003.01.geo.wgs84_pos#lat": {
		          "dataType": "float",
		          "value": "32.715",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.country": {
		          "value": "org.dbpedia.resource.United_States",
		          "kind": "uri"
		        },
		        "org.dbpedia.ontology.areaLand": {
		          "dataType": "http://www.w3.org/2001/XMLSchema#double",
		          "value": "8.4223E8",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.populationMetro": {
		          "dataType": "http://www.w3.org/2001/XMLSchema#nonNegativeInteger",
		          "value": "3095313",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.governmentType": {
		          "value": "org.dbpedia.resource.Mayor–council_government",
		          "kind": "uri"
		        },
		        "org.dbpedia.ontology.elevation": {
		          "dataType": "http://www.w3.org/2001/XMLSchema#double",
		          "value": "486.0",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.populationTotal": {
		          "dataType": "http://www.w3.org/2001/XMLSchema#nonNegativeInteger",
		          "value": "1345895",
		          "kind": "literal"
		        },
		        "org.dbpedia.ontology.utcOffset": {
		          "dataType": "string",
		          "value": "-8",
		          "kind": "literal"
		        }
		      },
		      "depictionImageUri": "http://commons.wikimedia.org/wiki/Special:FilePath/SD_Montage.jpg"
		    }
			]
		}
	}, true, '_sandiego');
}

print('Starting samples ...');

testWikiInfoBoxOnPerson();
testWikiInfoBoxOnCompany();
testWikiInfoBoxOnCity();

print('Done creating samples!');
