function generateResults
(
  recognitionResults,
  q,
  context
)
{
  if (!recognitionResults['com.solveforall.recognition.business.UPSTrackingNumber'])
  {
    return null;
  }    
  
  return [{
    label: "UPS",
    uri: 'http://wwwapps.ups.com/WebTracking/processInputRequest?sort_by=status&tracknums_displayed=1&TypeOfInquiryNumber=T&loc=en_us&InquiryNumber1=' + 
         q + '&track.x=0&track.y=0',      
    iconUrl: 'http://www.ups.com/favicon.ico',
    tooltip: 'UPS Tracking Number',
    embeddable: false
  }];  
}



