

// Method to add a button to every tweet being shown
// Injects it into visible tweets
function modifyTimeline(){
    $('.tweet').each(function(index){
        var tweetText = $(this).find('.tweet-text').html();
        var username = $(this).attr('data-screen-name')

        if(typeof username !== 'undefined' && typeof username !== 'undefined'){
            //Do something
            //console.log('Tweet by: '+ username+' \n');
            var $containerButtons = $(this).find('.js-actions');
            if(!$containerButtons.hasClass("tippin-button-added")){
                //Add flag
                $containerButtons.addClass("tippin-button-added");
                //add button
                $containerButtons.append(`
                <div class="ProfileTweet-action ProfileTweet-action--favorite TippinButton">
                    <button class="tippin-button EdgeButton EdgeButton--primary" data-original-content="${encodeURI(username)}" style="background-color: #FF9B97;padding: 0px;width: 60px;font-size:11px;">
                    ⚡️tippin
                    </button>
                </div>`);
            }
        }
    });
}

// Call the modifyTimeline() method to modify visible tweets
modifyTimeline();

// Listening for infinite scroll
// We need to add tippin button to every new tweet that is loaded
$('#timeline').bind('DOMSubtreeModified.event1',DOMModificationHandler);
function DOMModificationHandler(){
    $(this).unbind('DOMSubtreeModified.event1');
    setTimeout(function(){
        modifyTimeline();
        $('#timeline').bind('DOMSubtreeModified.event1',DOMModificationHandler);
    },10);
}

// Call Click listener message that will be handled by Background Script
// This way, everytime you click a button, we'll request the proper LN Invoice for that user
chrome.runtime.sendMessage({message: "listeners"}, 
                                       function(response) {
});