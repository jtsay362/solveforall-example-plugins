/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter, XML */
function makeChangeHtml(change) {
  const changeString = _.numberFormat(Math.abs(change));

  let changePrefix = null;
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

  const xml = new XML(responseText);

  const code = xml.message.code.text().toString().trim();
  if (code !== '0') {
    console.error('Unexpected error code: ' + code);
    return [];
  }

  if (xml.response.results.length() < 1) {
    console.warn('No results found');
    return [];
  }

  const result = xml.response.results.result[0];

  const streetAddress = result.address.street.text().toString().trim();
  const city = result.address.city.text().toString().trim();
  const state = result.address.state.text().toString().trim();
  const zipCode = result.address.zipcode.text().toString().trim();

  const cityStateZip = city + ', ' + state + ' ' + zipCode;
  const fullAddressHtml = _(streetAddress).escapeHTML() + '<br/>' +
    _(cityStateZip).escapeHTML();

  const detailsLink = result.links.homedetails.text().toString().trim();
  const estimatedValue = _.numberFormat(parseFloat(result.zestimate.amount.text().toString().trim()));
  const valueChange = parseFloat(result.zestimate.valueChange.text().toString().trim());
  const valueChangePrefix = makeChangeHtml(valueChange);

  const estimatedValueUpdated = result.zestimate['last-updated'].text().toString();

  const rent = _.numberFormat(parseFloat(result.rentzestimate.amount.text().toString().trim()));
  const rentChange = parseFloat(result.rentzestimate.valueChange.text().toString().trim());
  const rentChangePrefix = makeChangeHtml(rentChange);
  const rentUpdated = result.rentzestimate['last-updated'].text().toString();

  const contentTemplate = `
<html>
  <head></head>
  <body>
    <div>
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
    </div>

    <p>
      <a href="<%= detailsLink %>">
        See more details for <%= streetAddress %>, <%= cityStateZip %> on Zillow
      </a>
    </p>

    <div>
      <a href="http://www.zillow.com/">
        <img src="https://solveforall.com/resources/images/zillow_150x38.png"
         width="150" height="38" alt="Zillow Real Estate Search">
      </a>
    </div>

    <p>
      <small>&copy; Zillow, Inc., 2006-2015. Use is subject to <a href="http://www.zillow.com/corp/Terms.htm">Terms of Use</a>.
      <a href="http://www.zillow.com/wikipages/What-is-a-Zestimate/">What&#39;s a Zestimate?</a></small>
    </p>
  </body>
</html>`

  console.debug('Content template = "' + contentTemplate + '"');

  const model = {
    _,
    streetAddress,
    cityStateZip,
    detailsLink,
    estimatedValue,
    estimatedValueUpdated,
    valueChangePrefix,
    rent,
    rentChangePrefix,
    rentUpdated
  };

  const ejs = require('ejs');

  return [{
    content: ejs.render(contentTemplate, model),
    contentType: 'text/html',
    serverSideSanitized: true,
    label: 'Zillow',
    uri: detailsLink,
    iconUrl: 'http://www.zillow.com/favicon.ico',
    summaryHtml: fullAddressHtml,
    relevance: 1.0
  }];
}

function generateResults(recognitionResults, q, context) {
  if (context.isSuggestionQuery) {
    return [];
  }

  const zwsid = context.developerSettings['ZWSID'];

  if (!zwsid) {
    throw 'No ZWSID set!'
  }

  const recognitionResult = recognitionResults['com.solveforall.recognition.location.UsAddress'][0];

  const url = 'http://www.zillow.com/webservice/GetSearchResults.htm'

  let address = recognitionResult.streetAddress;

  if (!address) {
    console.info('No address found');
    return [];
  }

  if (recognitionResult.secondaryUnit) {
    address += ' ' + recognitionResult.secondaryUnit;
  }

  console.info('address = "' + address + '"');

  let cityStateZip = null;

  if (recognitionResult.zipCode && (recognitionResult.zipCode >= 5)) {
    cityStateZip = recognitionResult.zipCode;
  } else if (recognitionResult.city && recognitionResult.stateAbbreviation) {
    cityStateZip = recognitionResult.city + ', ' +
      recognitionResult.stateAbbreviation;
  } else {
    console.info('No city/state/zip found');
    return [];
  }

  console.info('cityStateZip = "' + cityStateZip + '"');

  const request = hostAdapter.makeWebRequest(url, {
    data: {
      'zws-id': zwsid,
      address: address,
      citystatezip: cityStateZip,
      rentzestimate: true
    },
    accept: 'application/xml'
  });

  request.send('handleResponse');

  return HostAdapter.SUSPEND;
}
