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
      }else if(request.message == 'reloadtdata')
      {
        //Reload tdata (Twitter users)
        console.log('Reloading tdata...');
        //loadDataTwitterUsers();
      }else if(request.message == 'buttonClicked')
      {
        console.log('button clicked');//'[buttonClicked] Message received, for username and tweet: '+userhandle+' - '+tweetid+'-'+usertwitterid);
        //Get username
        /*var userhandle = request.user;
        var tweetid = request.tweet;
        var usertwitterid = request.usertwitterid;
        //Log
        console.log('[buttonClicked] Message received, for username and tweet: '+userhandle+' - '+tweetid+'-'+usertwitterid);
        //alert("button clicked");
        var userhandle = decodeURI(this.getAttribute("data-username"));
        var usertwitid = this.getAttribute("data-user-id-twitter");
        var tweetid = decodeURI(this.getAttribute("data-tweet"));
        //Log
        //console.log('Donating to username: ', userhandle);

        //Send message to open prompt with QR code
        chrome.runtime.sendMessage({message: 'buttonClicked', user: userhandle, tweet: tweetid, usertwitterid: usertwitid});
        */

        //1. First, if tdata is loaded, check if this user has Tippin and save a query to the api. Also allows to show a reply message on non-joule users
        /*if(tdata_loaded === true)
        {
          if(tdata_array !== null && tdata_array.length>0)
          {
              console.log('Finding out if user exists on Tippin...'+tdata_array.length);
              if(tdata_array.includes(usertwitterid))
              {
                  //Keep on
                  console.log('User exists on Tippin.');
              }else{
                  //User doesn't exist, don't continue , and show alert
                  console.log('User does not exist on Tippin.');
                  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                    chrome.tabs.sendMessage(tabs[0].id, {message: 'asktojoin', user: userhandle, tweet: tweetid}, function(response) {});
                  });
                  return;
              }
          }
      }*/

      }

    });


    //Execute content script every time you change url (no need to reload, that's why changeInfo is not undefined)
    chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
      if(changeInfo.url !== undefined)
        {
          //If the changeinfo contains Twitter, then do a soft reload of contentscript
          if(changeInfo.url.includes('twitter'))
          {
            console.log('Doing a soft reload of tippin\'s content script...'+changeInfo.url);
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
              chrome.tabs.sendMessage(tabs[0].id, {message: 'softreload'}, function(response) {});
            });
          }
        }else{
          //Undefined. Don't do anything.
        }

    });


//Load User List
/*var tdata_array = [];
var tdata_loaded = false;
function loadDataTwitterUsers(){
  chrome.storage.local.get(['tdata','lastFetchTdata'], function(data) {
    console.log('Chrome Local Data loaded');
    var mustFetch = false;
    if(data.tdata === null || data.tdata === undefined)
    {
      console.log('TData is null, we need to fetch');
      mustFetch = true;
    }else{
      console.log('Local version of Tdata loaded.');
      //console.log('TData:'+data.tdata);

      //tdata not null, load it!
      tdata_array = data.tdata;
      tdata_loaded = true;
    }

    var lastFetchTS = data.lastFetchTdata;
    if (lastFetchTS === null || lastFetchTS === undefined) {
      console.log('Last fetch is null, we need to fetch');
      lastFetchTS = 0;
      mustFetch = true;
    }else{
      console.log('Last fetch: '+lastFetchTS);
    }

    const nowTS = Math.floor(Date.now() / 1000);
    if((nowTS - lastFetchTS) > 300)
    {
      console.log('Fetching...');
      mustFetch = true;
    }else{
      console.log('Aborting, you fetched '+(nowTS - lastFetchTS)+' second ago (wait until 300)');
    }

    if(mustFetch === true)
    {
      fetch('https://api.tippin.me/v1/tdata', {
        method: 'post',
        headers: new Headers({
          'authorization': 'basic YjZiNjBjYWU0MDlkZTY3OWNjN2IxMDA3NjMzODdkZmE6MDI2ZTdhNWQ5ZDI1MTkzYzNkYWRmNzExOWIzYzliZGQK'
        }),
        body: 't=0&u=0'
      })
      .then(res => res.json())
      .then(json => {
        //log
        console.log('Response received.');
        console.log(json);
        if(json.success){
          //Save TS and Tdata
          const timeStamp = Math.floor(Date.now() / 1000);
          chrome.storage.local.set({tdata: json.data, lastFetchTdata : timeStamp}, function() {
            console.log('Value of local storage set');
          });

          //Flag as loaded
          tdata_array = json.data;
          tdata_loaded = true;

          //localStorage.setItem('tdata',[json.data]);
          //localStorage.setItem('lastFetchTdata',);
        }else{
          console.log('Error on response.');
          chrome.storage.local.set({tdata: json.data, lastFetchTdata : 0}, function() {
            console.log('Value of local storage set');
          });

        }

      });
    }
  });
}
loadDataTwitterUsers();*/
