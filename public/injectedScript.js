var els = document.getElementsByClassName("tippin-button");
for(var z = 0; z < els.length; z++) {
  /*
    els[z].addEventListener('click', function(){
    var c = decodeURI(this.getAttribute("data-original-content"));
    console.log('Donating to username: ', c);
    //this.parentNode.innerHTML = c;
    
  });
  */
    
    //this.parentNode.innerHTML = c;
    els[z].addEventListener('click', function(){
        //Get username for that button
        var userhandle = decodeURI(this.getAttribute("data-original-content"));
        console.log('Donating to username: ', userhandle);
        //Send message to open prompt with QR code
        chrome.runtime.sendMessage({message: 'requestInvoice', user: userhandle}, 
        function() { 
             /* callback */ 
                console.log('Confirmation received.');
        });
    });
  
}