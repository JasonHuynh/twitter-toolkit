var els = document.getElementsByClassName("tippin-button");
var elClone = undefined;
for(var z = 0; z < els.length; z++) {

  //Trick to remove listeners
  var el = els[z];
  elClone = el.cloneNode(true);
  el.parentNode.replaceChild(elClone, el);

  //Add listener again
  els[z].addEventListener('click', function(){
    //Get username for that button
    var userhandle = decodeURI(this.getAttribute("data-username"));
    var usertwitid = this.getAttribute("data-user-id-twitter");
    var tweetid = decodeURI(this.getAttribute("data-tweet"));
    //Log
    console.log('Donating to username: ', userhandle);

    //Send message to open prompt with QR code
    chrome.runtime.sendMessage({message: 'buttonClicked', user: userhandle, tweet: tweetid, usertwitterid: usertwitid});
  });

    /*
    if(!els[z].classList.contains("tippin-button-listener-added")){
    els[z].classList.add("tippin-button-listener-added");
    //this.parentNode.innerHTML = c;

    }else{
    //console.log('Cant add again the same!');
    }
    */
}