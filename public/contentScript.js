//Document ready
$(document).ready(function() {
    //console.log('Executing contentScript.js...');
   
    /// BUTTON INJECTION
    // Add button to every tweet being shown
    function modifyTimeline(){
        $('.tweet').each(function(index){
            //var tweetText = $(this).find('.tweet-text').html();
            var username = $(this).attr('data-screen-name')

            if(typeof username !== 'undefined' && typeof username !== 'undefined'){
                //Flag Tweet
                //console.log('Tweet by: '+ username+' \n');
                var $containerButtons = $(this).find('.js-actions');
                if(!$containerButtons.hasClass("tippin-button-added")){
                    //Add flag
                    $containerButtons.addClass("tippin-button-added");
                    //add button
                    //rounded button
                    $containerButtons.append(`
                    <div class="ProfileTweet-action ProfileTweet-action--tip TippinButton">
                        <button class="tippin-button" data-original-content="${encodeURI(username)}">&nbsp;</button>
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
    // Listen for soft reloads and webln invoices messages
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        // Wait for requests to open WEBLN
        if(request.message == 'weblnpayinvoice')
        {
            //Request invoice to Tippin's api
            console.log('Requesting invoice...');

            $.ajax({
                url: 'https://api.tippin.me/v1/invoice/'+request.user,
                type: 'POST',
                headers: {
                    "authorization": "basic YjZiNjBjYWU0MDlkZTY3OWNjN2IxMDA3NjMzODdkZmE6MDI2ZTdhNWQ5ZDI1MTkzYzNkYWRmNzExOWIzYzliZGQK"
                },
                data: {
                },
                dataType : 'json',
                success: function(data, textStatus, xhr) {
                    if(data.error)
                    {
                        console.log('[Error Requesting Invoice] '+data.message);
                        showAlert(data.message);
                    }else{
                        console.log('[Invoice Received] '+data.lnreq);
                        webln_payInvoice(data.lnreq);
                    }
                },
                error: function(xhr, textStatus, errorThrown) {
                    console.log('[Error Requesting Invoice id2]'+errorThrown);
                    console.log('[Error Requesting Invoice id2 code]'+xhr);
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