// Listenr for messages
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

      //Log
      console.log('[chrome.runtime.onMessage] '+request.message);

      //If listeners
      if (request.message == 'listeners'){
        //add event handler for button click. This handler is injectedScript.js
        chrome.tabs.executeScript(null, {file: "injectedScript.js"});
        
        //sendResponse({message: "OK"});//optional
      }else if(request.message == 'weblnstatusvar')
      {
        console.log('[background weblnenabled] '+localStorage.getItem('weblnEnabled'));
        localStorage.setItem('weblnEnabled',request.value);
        console.log('[background weblnenabled] '+localStorage.getItem('weblnEnabled'));
      }else if(request.message == 'buttonClicked')
      {
        //Get username
        var userhandle = request.user;

        //Log
        console.log('[buttonClicked] Message received, for username '+userhandle);

        //Check if WebLN is present
        if( localStorage.getItem('weblnEnabled') == 'true')
        {
          //Webln Present.
          console.log('[Sending message to content script, to open Webln]');

          chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {message: 'weblnpayinvoice', user: userhandle}, function(response) {});  
          });

           //Send callback?
          //sendResponse({message: "ok"});//optional

        }else{
          //Webln Not present. Open window.
          var w = 420;
          var h = 590;
          var left = (screen.width/2)-(w/2);
          var top = (screen.height/2)-(h/2); 
          chrome.windows.create({url: `https://tippin.me/buttons/send-lite.php?u=${userhandle}&eh=yes`, type: "popup", width: w, height: h,'left': left, 'top': top});
          
          //Send callback?
          //sendResponse({message: "ok"});//optional
        }
      }
      
    });


    //Inject and execute content script every time you change url (no need to reload, that's why changeInfo is not undefined)
    chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
      if (tab.url.indexOf("https://twitter.com/") > -1 && changeInfo.url !== undefined){
          console.log('Executing contentScript...');
          chrome.tabs.executeScript(tabId, {file: "contentScript.js"} );
      }else{
          console.log('Page changed but not matched req.'+changeInfo.url);
      }
    });