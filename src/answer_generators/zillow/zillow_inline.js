function isNonBlankString(s) {
  'use strict';
  return s && (s.trim().length > 0);
}

function makeChangeHtml(change) {
  var changeString = _.numberFormat(Math.abs(change));

  var changePrefix = null;
  if (change < 0) {
    changePrefix = '<i class="fa fa-long-arrow-down"></i>&nbsp;$' +
      changeString;
  } else if (change > 0) {
    changePrefix = '<i class="fa fa-long-arrow-up"></i>&nbsp;$' +
     changeString;
  } else {
    changePrefix = 'unchanged';
  }

  return changePrefix;
}

function handleResponse(responseText, httpResponse) {
  console.log('got response text = "' + responseText + '"');

  responseText = responseText.replace(/^<\?xml\s+version\s*=\s*"1.0"\s+encoding\s*=\s*"utf-8"\s*\?>/, '');
  responseText = responseText.replace(/<!--.*-->/, '');

  var xml = new XML(responseText);

  var code = xml.message.code.text().toString().trim();
  if (code != '0') {
    console.error('Unexpected error code: ' + code);
    return [];
  }

  if (xml.response.results.length() < 1) {
    console.warn('No results found');
    return [];
  }

  var result = xml.response.results.result[0];

  var streetAddress = result.address.street.text().toString().trim();
  var city = result.address.city.text().toString().trim();
  var state = result.address.state.text().toString().trim();
  var zipCode = result.address.zipcode.text().toString().trim();

  var cityStateZip = city + ', ' + state + ' ' + zipCode;
  var fullAddressHtml = _(streetAddress).escapeHTML() + '<br/>' +
    _(cityStateZip).escapeHTML();

  var detailsLink = result.links.homedetails.text().toString().trim();
  var estimatedValue = _.numberFormat(parseFloat(result.zestimate.amount.text().toString().trim()));
  var valueChange = parseFloat(result.zestimate.valueChange.text().toString().trim());
  var valueChangePrefix = makeChangeHtml(valueChange);

  var estimatedValueUpdated = result.zestimate['last-updated'].text().toString();

  var rent = _.numberFormat(parseFloat(result.rentzestimate.amount.text().toString().trim()));
  var rentChange = parseFloat(result.rentzestimate.valueChange.text().toString().trim());
  var rentChangePrefix = makeChangeHtml(rentChange);
  var rentUpdated = result.rentzestimate['last-updated'].text().toString();

  var contentTemplateXml = <heredoc>
    <![CDATA[
    <html>
      <head></head>
      <body>
        <div class="row">
          <div class="span8">
            <dl class="dl-horizontal">
              <dt>
                Zestimate<sup>&reg;</sup>
              </dt>
              <dd>
                $<%= estimatedValue %>
                (<%- valueChangePrefix %> from 30 days ago)
                <br/>
                <small>Updated <%= estimatedValueUpdated %></small>
              </dd>
              <dt>
                Rent Zestimate<sup>&reg;</sup>
              </dt>
              <dd>
                $<%= rent %> / month
                (<%- rentChangePrefix %> from 30 days ago)
                <br/>
                <small>Updated <%= rentUpdated %></small>
              </dd>
            </dl>
            <p>
              <a href="<%= detailsLink %>">
                See more details for <%= streetAddress %>, <%= cityStateZip %> on Zillow
              </a>
            </p>
          </div>
          <div class="span2">
            <a href="http://www.zillow.com/"><img src="http://www.zillow.com/widgets/GetVersionedResource.htm?path=/static/logos/Zillowlogo_150x40_rounded.gif" width="150" height="40" alt="Zillow Real Estate Search" /></a>
          </div>
        </div>

        <p>
          <small>&copy; Zillow, Inc., 2006-2013. Use is subject to <a href="http://www.zillow.com/corp/Terms.htm">Terms of Use</a>.
          <a href="http://www.zillow.com/wikipages/What-is-a-Zestimate/">What&#39;s a Zestimate?</a></small>
        </p>
      </body>
    </html>
    ]]>
  </heredoc>

  var contentTemplate = contentTemplateXml.toString();

  console.debug('Content template = "' + contentTemplate + '"');

  var model = {
    streetAddress: streetAddress,
    cityStateZip: cityStateZip,
    detailsLink: detailsLink,
    estimatedValue: estimatedValue,
    estimatedValueUpdated: estimatedValueUpdated,
    valueChangePrefix: valueChangePrefix,
    rent: rent,
    rentChangePrefix: rentChangePrefix,
    rentUpdated: rentUpdated
  };

  return [{
    content: ejs.render(contentTemplate, model),
    contentType: 'text/html',
    serverSideSanitized: true,
    label: 'Zillow',
    iconUrl: 'http://www.zillow.com/favicon.ico',
    summaryHtml: fullAddressHtml,
    relevance: 1.0
  }];
}

function generateResults(recognitionResults, q, context) {
  'use strict';

  if (context.isSuggestionQuery) {
    return [];
  }

  var recognitionResult = recognitionResults['com.solveforall.recognition.location.UsAddress'][0];

  var url = 'http://www.zillow.com/webservice/GetSearchResults.htm'

  var address = recognitionResult.streetAddress;

  if (!isNonBlankString(address)) {
    console.info('No address found');
    return [];
  }

  if (isNonBlankString(recognitionResult.secondaryUnit)) {
    address += ' ' + recognitionResult.secondaryUnit;
  }

  console.info('address = "' + address + '"');

  var cityStateZip = null;

  if (recognitionResult.zipCode && (recognitionResult.zipCode >= 5)) {
    cityStateZip = recognitionResult.zipCode;
  } else if (isNonBlankString(recognitionResult.city) &&
             isNonBlankString(recognitionResult.stateAbbreviation)) {
    cityStateZip = recognitionResult.city + ', ' +
      recognitionResult.stateAbbreviation;
  } else {
    console.info('No city/state/zip found');
    return [];
  }

  console.info('cityStateZip = "' + cityStateZip + '"');

  var request = hostAdapter.makeWebRequest(url, {
    data: {
      'zws-id': 'INSERT YOUR ZWS HERE',
      address: address,
      citystatezip: cityStateZip,
      rentzestimate: true
    },
    accept: 'application/xml'
  });

  request.send('handleResponse');

  return HostAdapter.SUSPEND;
}