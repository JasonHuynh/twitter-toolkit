var tweet_scores = {}; // maps tweet id to score from database
//Document ready
$(document).ready(function () {

    function constructString(obj) {
        if (typeof obj === "undefined") {
            return "This tweet didn't provice a source.";
        }
        var bias = obj["bias"];
        var bias_str = "";
        if (bias == -2) {
            bias_str = " leans left";
        } else if (bias == -1) {
            bias_str = " leans left-center";
        } else if (bias == 0) {
            bias_str = " is centrist";
        } else if (bias == 1) {
            bias_str = " leans right-center";
        } else if (bias == 2) {
            bias_str = " leans right";
        }
        //alert(obj.domain);
        var str = "";
        str += "This tweet references the domain " + obj["domain"];
        str += ". " + obj["source"] + bias_str;
        str += " and has a credibility score of " + obj["credibility"];
        str += " out of 5.\n\n";

        if (obj["manipulation"] == 1) {
            str += "Warning: This tweet appears to show signs of manipulation.";
        }
        return str;
    }
    //Load tdata array and assign when ready
    /*var tdata_array = [];
    var tdata_loaded = false;
    chrome.storage.local.get(['tdata'], function(data) {
        console.log('Storage local loaded!');
        //No matter the data, it has been loaded. Flag.
        tdata_loaded = true;
        //Check
        if(data.tdata !== null)
        {
            //console.log('Tdata is'+data.tdata);
            tdata_array = data.tdata;
        }else{
            console.log('Tdata array is empty, set as empty array!');
            tdata_array = [];
        }

        //We want to reload now that we got it
        modifyTimeline(); // All your code is contained here, or executes later that this
    });*/


    /// BUTTON INJECTION
    // Add button to every tweet being shown
    function modifyTimeline(){

            //Evaluate tweets
        $('.tweet').each(function(index){
            var tweet = $(this);
            var tweetid = $(this).attr("data-tweet-id");
            var tweetText = $(this).find('.tweet-text').html();
            var username = $(this).attr('data-screen-name');
            var useridtwitter = $(this).attr('data-user-id');
            if(typeof username !== 'undefined' && typeof username !== 'undefined'){

                //Flag Tweet
                //console.log('Tweet by: '+ username+' \n');
                var $containerButtons = $(this).find('.js-actions');
                if(!$containerButtons.hasClass("toolkit-button-added")) {//"tippin-button-added")){
                    //Add flag
                    $containerButtons.addClass("toolkit-button-added");//"tippin-button-added");
                    var classButton = 'toolkit-button toolkit-button-default';//'tippin-button tippin-button-yes';
                    //classButton = 'toolkit-button toolkit-button-default';//'tippin-button tippin-button-none';

                    //rounded button
                    $containerButtons.append(`
                    <div class="ProfileTweet-action ProfileTweet-action--tip ToolkitButton">
                        <button class="${classButton}" data-username="${encodeURI(username)}" data-user-id-twitter="${useridtwitter}" data-tweet="${encodeURI(tweetid)}">&nbsp;</button>
                    </div>`);

                    var button = $(this).find('.ToolkitButton');
                    button.click(function() {
                        var score_data = tweet_scores[tweetid];
                        alert(constructString(score_data));
                    });
                }
            }
            //alert("appended buttons");
            //alert(tweetid);
            if (!(tweetid in tweet_scores)) {
                var tweet_text = $(this).find('.tweet-text'); //gets tweet text
                var text = tweet_text.text();
                var xhr = new XMLHttpRequest(); //beginning an HTTP request
                xhr.open("GET", "http://127.0.0.1:5000/score?tweet=" + encodeURIComponent(text), true);
                xhr.onreadystatechange = function () {//onreadystatechange = function() { // callback function
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        //alert("received data from server");
                        //alert(text);
                        var str = xhr.responseText.replace(/'/g, '"');
                        var obj = JSON.parse(str);
                        tweet_scores[tweetid] = obj;
                        var bias = obj["bias"];
                        var button = $(tweet).find('.toolkit-button');

                        if (bias == -2) {
                            //alert("left");
                            button.addClass('toolkit-button-left');
                        } else if (bias == -1) {
                            button.addClass('toolkit-button-left-center');
                        } else if (bias == 0) {
                            //alert("center");
                            button.addClass('toolkit-button-center');
                        } else if (bias == 1) {
                            button.addClass('toolkit-button-right-center');
                        } else if (bias == 2) {
                            button.addClass('toolkit-button-right');
                        }
                        button.removeClass('toolkit-button-default');
                        //alert(obj.domain);
                    }
                }
                xhr.send(); // sends request
            }

        });

        //Notify to Background to run the listeners script
        chrome.runtime.sendMessage({message: "listeners"});

    }

    // Listen for changes with MutationObserver
    // Select the target node (tweet modal)
    var target = $('.stream-items').get(0);

    // Create an observer instance
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            //Log
            //console.log('Mutation took place!');
            //Call method to Inject button
            modifyTimeline();
        });
    });

    // Configuration of the observer
    var config = { childList:true, attributes:true, subtree: false, attributeFilter:['stream-items'] };

    // Pass in the target node, as well as the observer options
    observer.observe(target, config);

    //First call on Start
    modifyTimeline();

    /// LISTENER
    // Listen for soft reload messages
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if(request.message == 'softreload')
        {
            console.log('Doing soft reload...');
            //Stop and reset observer
            observer.disconnect();
            target = $('.stream-items').get(0);
            observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    //Log
                    //console.log('Mutation took place!');
                    //Call method to Inject button
                    modifyTimeline();
                });
            });
            observer.observe(target, config);
            //First try
            modifyTimeline();
        }

    });

});
