
//Document ready
$(document).ready(function() {
    //console.log('Executing contentScript.js...');

    //Load tdata array and assign when ready
    var tdata_array = [];
    var tdata_loaded = false;
    chrome.storage.local.get(['tdata'], function(data) {
        console.log('Storage local loaded!');
        //No matter the data, it has been loaded. Flag.
        tdata_loaded = true;
        //Check
        if(data.tdata !== null)
        {
            console.log('Tdata is'+data.tdata);
            tdata_array = data.tdata;
        }else{
            console.log('Tdata array is empty, set as empty array!');
            tdata_array = [];
        }

        //We want to reload now that we got it
        modifyTimeline(); // All your code is contained here, or executes later that this
    });

    /// BUTTON INJECTION
    // Add button to every tweet being shown
    function modifyTimeline(){

        if(tdata_loaded !== true)
        {
            console.log('tdata not loaded yet, wait');
            return;
        }

        console.log('x tdata is:'+tdata_array);
        //Evaluate tweets
        $('.tweet').each(function(index){
            //var tweetText = $(this).find('.tweet-text').html();
            var username = $(this).attr('data-screen-name');
            var useridtwitter = $(this).attr('data-user-id');
            var tweetid = $(this).attr('data-tweet-id');
            if(typeof username !== 'undefined' && typeof username !== 'undefined'){
                
                //Flag Tweet
                //console.log('Tweet by: '+ username+' \n');
                var $containerButtons = $(this).find('.js-actions');
                if(!$containerButtons.hasClass("tippin-button-added")){
                    //Add flag 
                    $containerButtons.addClass("tippin-button-added");

                    //Add custom class to reply button , so we can trigger it afterwards
                    $containerButtons.find('.js-actionReply').addClass("tippin-reply-button-"+username+"-"+tweetid);

                    //Add Tippin button depending on tdata
                    var classButton = 'tippin-button tippin-button-yes';
                    if(tdata_array !== null && tdata_array.length>0)
                    {
                        console.log('tdata lenght'+tdata_array.length);
                        if(tdata_array.includes(useridtwitter))
                        {
                            classButton = 'tippin-button tippin-button-yes';
                        }else{
                            classButton = 'tippin-button tippin-button-none';
                        }
                    }

                    //rounded button
                    $containerButtons.append(`
                    <div class="ProfileTweet-action ProfileTweet-action--tip TippinButton">
                        <button class="${classButton}" data-username="${encodeURI(username)}" data-user-id-twitter="${useridtwitter}" data-tweet="${encodeURI(tweetid)}">&nbsp;</button>
                    </div>`);


                    //Old option
                    /*
                    $containerButtons.append(`
                    <div class="ProfileTweet-action ProfileTweet-action--favorite TippinButton">
                        <button class="tippin-button EdgeButton EdgeButton--primary" data-original-content="${encodeURI(username)}" style="background-color: #FF9B97;padding: 0px;width: 60px;font-size:11px;">
                        ⚡️tippin
                        </button>
                    </div>`);
                    */
                }
            }
        });

        //Notify to Background to run the listeners script
        chrome.runtime.sendMessage({message: "listeners"});

       
            
    }

    //From time to time, reload list of Twitter users from Tippin. At least once every time a page is reload.
    chrome.runtime.sendMessage({message: "reloadtdata"});

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

    /// TWEET RESPONSE TO NON-EXISTANT USERS
    function tweetInvitation(username,tweetid)
    {
        console.log('!Asking to join... User: '+username);
        //Trigger reply
        //document.getElementsByClassName('tippin-reply-button-'+username+"-"+tweetid)[0].click();
        //Type message
        //document.getElementById('tweet-box-global').innerHTML = '<div>@Hey! Test</div>';
        var injectedCode = `
        function getConfirmation() {
            var retVal = confirm("This user does not have a Tippin account. Ask him to join?");
            if( retVal == true ) {
               //User wants to tweet
               return true;
            } else {
               //User does not want to tweet
               return false;
            }
        }
        if(getConfirmation()){
            document.getElementsByClassName('tippin-reply-button-${username}-${tweetid}')[0].click();
            document.getElementById('tweet-box-global').innerHTML = "<div>I was about to tip you, but you don't have a Tippin.me account yet :) #LightningNetwork #TippinTwitter</div>";
        }
        `;
        //var injectedCode = "document.getElementsByClassName('tippin-reply-button-"+username+"-"+tweetid+"')[0].click()";
        //injectedCode += "document.getElementById('tweet-box-global').innerHTML = '<div>I was about to tip you, but you don't have a Tippin.me account yet :)</div>';";
        var script = document.createElement('script');
        script.id = 'reply-join';
        script.appendChild(document.createTextNode(injectedCode));
        (document.body || document.head || document.documentElement).appendChild(script);
    }


    /// LISTENER
    // Listen for soft reloads and webln invoices messages
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        // Wait for requests to open WEBLN
        if(request.message == 'weblnpayinvoice')
        {
            //Request invoice to Tippin's api
            console.log('Requesting invoice for tweet '+request.tweet+'...');
            $.ajax({
                url: 'https://api.tippin.me/v1/invoice/'+request.user,
                type: 'POST',
                headers: {
                    "authorization": "basic YjZiNjBjYWU0MDlkZTY3OWNjN2IxMDA3NjMzODdkZmE6MDI2ZTdhNWQ5ZDI1MTkzYzNkYWRmNzExOWIzYzliZGQK"
                },
                data: {
                    tweet: request.tweet
                },
                dataType : 'json',
                success: function(data, textStatus, xhr) {
                    if(data.error)
                    {
                        console.log('[Error Requesting Invoice] '+data.message);
                        if(data.code === 6){
                            tweetInvitation(request.user, request.tweet);
                            console.log('This user doesnt exist');
                            return;
                        }
                       
                        showAlert(data.message);

                    }else{
                        console.log('[Invoice Received] '+data.lnreq);
                        webln_payInvoice(data.lnreq);
                    }
                },
                error: function(xhr, textStatus, errorThrown) {
                    console.log('[Error Requesting Invoice id2]'+errorThrown);
                    console.log('[Error Requesting Invoice id2 code]'+xhr);
                    //Send GET REQUEST TO https://twitter.com/i/tweet/html?id=XXXXXXXXX&modal=reply  USING TWEET ID request.tweet
                    showAlert(errorThrown);
                }
            });
            
        }else if(request.message == 'softreload')
        {
            console.log('SOFT RELOAD');
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


    /// WEBLN INTEGRATION

    // Send message to Background to disable webln status by default
    chrome.runtime.sendMessage({message: "weblnstatusvar", value: false});

    // Helper to show alert
    function showAlert(message)
    {
        var injectedCode = "alert('"+message+"')";
        var script = document.createElement('script');
        script.id = 'alertMessage';
        script.appendChild(document.createTextNode(injectedCode));
        (document.body || document.head || document.documentElement).appendChild(script);
    }

    // Prepare and enable WebLN if it exists
    function webln_preEnable()
    {
        var injectedCode = "if(typeof webln !== 'undefined'){\nwebln.enable();\n}";
        var script = document.createElement('script');
        script.id = 'weblnEnabler';
        script.appendChild(document.createTextNode(injectedCode));
        (document.body || document.head || document.documentElement).appendChild(script);
    }
    webln_preEnable();

    function retrieveWindowVariables(theVariable) {
            //Init WebLnd
            var scriptContent = "if (typeof " + theVariable + " !== 'undefined'){\n$('body').attr('tmp_" + theVariable + "', JSON.stringify(" + theVariable + "));\n}";
            var script = document.createElement('script');
            script.id = 'tmpScript';
            script.appendChild(document.createTextNode(scriptContent));
            (document.body || document.head || document.documentElement).appendChild(script);

            //Save and remove, only if it exists
            if($("body").attr("tmp_" + theVariable) === undefined)
            {
                //console.log('Webln does not exist, returning undefined...');
                return undefined;
            }
            var webln = $.parseJSON($("body").attr("tmp_" + theVariable));
            $("body").removeAttr("tmp_" + theVariable);

            //$("#tmpScript").remove();

            return webln;
        
    }

    function webln_payInvoice(invoice)
    {
        var injectedCode = "webln.sendPayment('" + invoice + "').then(response => {console.log('Payment response')})";
        var script = document.createElement('script');
        script.id = 'weblnPAYREQ'+invoice;
        script.appendChild(document.createTextNode(injectedCode));
        (document.body || document.head || document.documentElement).appendChild(script);
    }

    //THEN TRIGGER THE RETRIEVE
    setTimeout(function(){
        //console.log('Trying to retrieve Webln....');
        //Retrieve Webln
        var webln = retrieveWindowVariables("webln");
        if (typeof webln !== 'undefined') {
            //console.log('WebLn exists!');
            if(!webln.isEnabled)
                {
                    //console.log('Webln is disabled');
                }else{
                    //alert('webln estaba listo ya!');
                    //generate_invoice(10,200);
                    console.log('Webln available!');
                    //Send message to Background to enable webln status
                    chrome.runtime.sendMessage({message: "weblnstatusvar", value: true}, 
                                        function(response) {
                    });
                }
        }else{
            //console.log('Webln not present.');
        }
    },500);

});