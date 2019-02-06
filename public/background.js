chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

      //Log
      console.log('[chrome.runtime.onMessage] '+request.message);

      //If listeners
      if (request.message == "listeners"){
        //add event handler for button click. This handler is injectedScript.js
        chrome.tabs.executeScript(null, {file: "injectedScript.js"});
        sendResponse({message: "OK"});//optional
      }else if(request.message == "requestInvoice")
      {
        var userhandle = request.user;

        //Open popup - chrome.runtime.id is the app id
        //chrome.extension.sendRequest('gdegbhlhjkgkmneoemdglhjaipaefjjd', { 'user': userhandle }, function() {});                                                                                                                         
        //chrome.windows.create({url: `${chrome.extension.getURL("send.html")}?username=${userhandle}`, type: "popup", width: 390, height: 520,});
        var w = 440;
        var h = 680;
        var left = (screen.width/2)-(w/2);
        var top = (screen.height/2)-(h/2); 
        chrome.windows.create({url: `https://tippin.me/buttons/send-lite.php?u=${userhandle}`, type: "popup", width: w, height: h,'left': left, 'top': top});
        sendResponse({message: "ok"});//optional
      }
      
    });