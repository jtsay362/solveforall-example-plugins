/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter */
const ANY_USAGE_TYPE = "any";

function generateResults(recognitionResults, q, context) {
  const user = context.user;

  if (!user || !user.physicalAddresses || (user.physicalAddresses.length === 0)) {
    console.info("No physical addresses available");
    return [];
  }

  const preferredUsageType = context.settings.preferredUsageType || ANY_USAGE_TYPE;

  const rrs = recognitionResults['com.solveforall.recognition.location.UsAddress'];
  let destAddressString = q;
  let relevance = 0.0;
  if (rrs && (rrs.length > 0)) {
    var rr = rrs[0];

    if (rr.city) {
      destAddressString = rr.normalizedFullAddressWithoutCountry;
      relevance = rrs[0].recognitionLevel;
    } else {
      // Yahoo! Directions requires a city
      return [];
    }
  }

  let startAddress = _(user.physicalAddresses).find(function (address) {
    return (address.country && (address.country.name === 'United States') &&
      ((address.usageType === preferredUsageType) || (preferredUsageType === ANY_USAGE_TYPE)));
  });

  if (!startAddress) {
    startAddress = _(user.physicalAddresses).find(function (address) {
      return (address.country && (address.country.name === 'United States'));
    });
  }

  if (!startAddress) {
    console.info("No US address found");
    return [];
  }

  let startAddressString = '';

  if (startAddress.addressLine1) {
    startAddressString += startAddress.addressLine1;
    startAddressString += ', ';
  }

  const hasCity = !!startAddress.city;
  if (hasCity) {
    startAddressString += startAddress.city;
  } else {
    return [];
  }

  const hasState = !!startAddress.region.abbreviation;
  if (hasState) {
    if (startAddressString.length > 0) {
      startAddressString += ', ';
    }

    startAddressString += startAddress.region.abbreviation;
  }

  if (!hasCity) {
    if (startAddressString.length > 0) {
      startAddressString += ', ';
    }

    startAddressString += startAddress.postalCode;
  }

  return [{
    label: 'Google Maps Directions',
    iconUrl: 'https://www.google.com/favicon.ico',
    uri: 'https://www.google.com/maps/dir/' + encodeURIComponent(startAddressString) +
      '/' + encodeURIComponent(destAddressString) + '/',
    tooltip: 'Directions to ' + destAddressString,
    embeddable: false,
    relevance
  }];
}
