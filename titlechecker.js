/**
 * titlechecker.js
 * 
 * 
 */
(function() {
    var subWelcomeToggle = $.getSetIniDbBoolean('subscribeHandler', 'subscriberWelcomeToggle', true),
        primeSubWelcomeToggle = $.getSetIniDbBoolean('subscribeHandler', 'primeSubscriberWelcomeToggle', true),
        reSubWelcomeToggle = $.getSetIniDbBoolean('subscribeHandler', 'reSubscriberWelcomeToggle', true),
        giftSubWelcomeToggle = $.getSetIniDbBoolean('subscribeHandler', 'giftSubWelcomeToggle', true),
        announce = false,
        srGame = '';
    srGameId = '';
    oldGameName = '';
    wordsToSay = '';
    var categoriesId = [];
    var categoryNames = [];
    var runnerId = [];
    var runners = [];
    var times = [];
    var testArray = [];
    var catsFound = 0;
    var matchedCat = '';
    var numOfCategories = 0;
    var wrGameMode = 0;  //  0/true = auto   1/false= manual
    
    
    var badGames = ['IRL', 'SOCIAL EATING', 'CREATIVE', 'RETRO', 'MUSIC', 'TALK SHOWS', 'BOARD GAMES'];

    function sayFunction(wordsToSay) {
        announce = true; ////////////
        if (announce == true) {
            $.say(wordsToSay);
        }
    }

    function getStreamInfo() {
        announce = true; ////////////

        gameName = String($.twitchcache.getGameTitle());
        streamTitle = String($.twitchcache.getStreamStatus());
        $.consoleLn('stream title and game updated');
        $.consoleLn('stream title = ' + streamTitle);
        $.consoleLn('stream game = ' + gameName);
        
        
        getGameId(gameName)
    }

    $.bind('twitchTitleChange', function(event) {
        $.consoleLn('title change');
        streamTitle = String($.twitchcache.getStreamStatus());
        searchTitle()
    });

    $.bind('twitchGameChange', function(event) {
        $.consoleLn('twitch game change');
        
        if (wrGameMode == 0) {        
        gameName = String($.twitchcache.getGameTitle());
        $.consoleLn(gameName);
        getGameId(gameName)
        } else {
            sayFunction('Game search is set to manual right now');
        }
    });

    function getGameId(gameName) {
        // half life 2 survivor + a hat in time error out
    //   gameName = 'super mario world';
     // gameName = 'IRL';
        $.consoleLn(gameName);

       
        
        $.consoleLn(badGames.indexOf(gameName.toUpperCase()) + ' index' );
        //	if (oldGameName == gameName){
        //		$.consoleLn('game is same');			
        //		return;
        //	} else 
        {
          


          
            if (badGames.indexOf(gameName.toUpperCase()) > -1 ) {
                sayFunction('Special game found. Please try another or set game manually');
            
            } else {
            categoriesId = [];
            categoryNames = [];
            runnerId = [];
            runners = [];
            times = [];
            testArray = [];
            
            gameSearchUrl = 'https://www.speedrun.com/api/v1/games?name=' + gameName;
            $.consoleLn(gameSearchUrl);
            var srAPI = $.customAPI.get(gameSearchUrl).content;
            srAPIJSON = JSON.parse(srAPI);
            
             if ( srAPIJSON.pagination.size == 0) {
             $.consoleLn(srAPIJSON.pagination.size + ' results found');

            } else {
         
            srGame = srAPIJSON.data[0].names.international;
            srGameId = srAPIJSON.data[0].id;
            $.consoleLn(srGame + ' Game Name');
            $.consoleLn(srGameId + ' Game ID');
            oldGameName = gameName;
            getRecords()
            }
            }
            
            
        }

        //example url  https://www.speedrun.com/api/v1/games?name=super%20mario%20world
    }

    function getRecords() {
    //example url  https://www.speedrun.com/api/v1/games/pd0wq31e/records?top=1
        allRecordsUrl = 'https://www.speedrun.com/api/v1/games/' + srGameId + '/records?top=1'
        $.consoleLn(allRecordsUrl);
        var allRecords = $.customAPI.get(allRecordsUrl).content;
        allRecords = JSON.parse(allRecords);
        numOfCategories = allRecords.pagination.size;
        $.consoleLn((numOfCategories.toFixed(0)) + ' Categories found');

        //numOfCategories = 4;
        for (i = 0; i <= (numOfCategories - 1); i++) {
            $.consoleLn(i);

            categoriesId[i] = allRecords.data[i].category
            $.consoleLn(categoriesId[i]);

            runnerId[i] = allRecords.data[i].runs[0].run.players[0].id
            $.consoleLn(runnerId[i]);

            times[i] = allRecords.data[i].runs[0].run.times.primary;
            $.consoleLn(times[i]);

            timesFixed = times[i].replace('PT', '');
            timesFixed = timesFixed.replace('H', ':');
            timesFixed = timesFixed.replace("M", ':');
            timesFixed = timesFixed.replace('S', '');
            times[i] = timesFixed

            
            //get cat name using catid
            categoriesUrl = 'https://www.speedrun.com/api/v1/categories/' + categoriesId[i];
            $.consoleLn(categoriesUrl);
            var categories = $.customAPI.get(categoriesUrl).content;
            categories = JSON.parse(categories);
            categoryNames[i] = categories.data.name;
            //example url https://www.speedrun.com/api/v1/categories/n2y1y72o
            
            //get runner name using runnerid
            usersUrl = 'https://www.speedrun.com/api/v1/users/' + runnerId[i];
            $.consoleLn(usersUrl);
            var users = $.customAPI.get(usersUrl).content;
            users = JSON.parse(users);
            runners[i] = users.data.names.international;
            //example url https://www.speedrun.com/api/v1/users/18v6n5xl		

        }

        $.consoleLn(categoriesId.join(' , '));
        $.consoleLn(runnerId.join(' , '));
        $.consoleLn(categoryNames.join(' , '));
        $.consoleLn(runners.join(' , '));
        $.consoleLn(times.join(' , '));
        searchTitle()
    
    }

    function searchTitle() {
        catsFound = 0;
        testArray = [];
        incrementNum = 0;
        

     //   streamTitle = '11 exit lunar dragon';///////////////

        for (i = 0; i <= (numOfCategories - 1); i++) {
            // $.consoleLn(i);
            cat = categoryNames[i];
            cat = cat.toUpperCase();

            // $.consoleLn(cat);
            streamTitle = streamTitle.toUpperCase();

            titleSearch = streamTitle.search(cat)

            if (titleSearch >= 0) {
                $.consoleLn(cat + ' Found at ' + titleSearch);
                catsFound++;

                testArray[incrementNum] = i;
                incrementNum++;
            }

        }
        $.consoleLn(catsFound + ' cats found in title');
        $.consoleLn('categoryNames array location(s): ' + testArray.join(' , '))

        // this just displays matched cats
        if (incrementNum > 1) {
            for (i = 0; i <= testArray.length - 1; i++) {
                $.consoleLn(categoryNames[testArray[i]]);
            }
        }

        matchCat()

    }

    function matchCat() {
        $.consoleLn(catsFound + ' in matchedCat function');

        
        
        
        if (catsFound == 0){        
           matchedCat = -2; 
           $.consoleLn('no cats in title');
           return;
        }
        if (catsFound == 1){  
            matchedCat = testArray[0];
        }
        
        if (catsFound > 1){  
            matchedCat = -1;
            $.consoleLn(catsFound);

        string1 = 'Type "cat X" for your pick '
        for (i = 1; i <= catsFound; i++) {
            string1 = string1.concat(categoryNames.indexOf(categoryNames[testArray[i -1]]) + ': '); 
          
            string1 = string1.concat(categoryNames[testArray[i -1]] + ' ');
        }          
        $.consoleLn(string1);
        }
        $.consoleLn('matchedCat ' + matchedCat + ' @ spot 2');

    }

    
    
    

    
    

    
    /*
     * @event command
     */
    $.bind('command', function(event) {
        var sender = event.getSender(),
            command = event.getCommand(),
            argsString = event.getArguments(),
            args = event.getArgs(),
            action = args[0],
            planId;

      

        if (command.equalsIgnoreCase('searchgame')) {
            $.consoleLn('searchgame command called');
            if (action === undefined) {
                $.say('Please type game name');
                            $.consoleLn('1');

            } else if (argsString.toLowerCase() == 'auto') {
            $.consoleLn('else if');

             wrGameMode = 0;
            $.consoleLn(wrGameMode);
            //  $.setIniDbBoolean('subscribeHandler', 'wrGameMode', wrGameMode); /////////////add to db
            getStreamInfo()
            } else  {
                  $.consoleLn('else');

               wrGameMode = 1;

                //  $.setIniDbBoolean('subscribeHandler', 'wrGameMode', wrGameMode); /////////////add to db
                sayFunction($.whisperPrefix(sender) + (wrGameMode ? 'mode 0 true.' : 'mode 1 false.'));
                
                gameName = argsString.toLowerCase();
                getGameId(gameName)
            }
        }
             
             //  0/true = auto   1/false= manual
             
        
        
        
        
        
        
        if (command.equalsIgnoreCase('tctest')) {
            $.consoleLn('tctest command called');
            if (action === undefined) {
                
                getStreamInfo()
            } else {
                name = action.toLowerCase();
                sayFunction(name)
            }
        }


        
        
                if (command.equalsIgnoreCase('tctest2')) {
            $.consoleLn('tctest2 command called');
            if (action === undefined) {
                
          
 
        
            gameSearchUrl = 'https://www.speedrun.com/api/v1/games/pd0wq31e/records?top=1';

            $.consoleLn(gameSearchUrl);
            var srAPI = $.customAPI.get(gameSearchUrl).content;
            srAPIJSON1 = JSON.parse(srAPI);
            
            if ( srAPIJSON1.pagination.size == 0) {
             $.consoleLn(srAPIJSON1.pagination.size + ' results found');

            } else {
            srGame = srAPIJSON1.data[0].weblink;
            
            $.consoleLn(srGame);
            
        
       
            
            }
            
            
            
            } 
        }


        
        
        
        
        

        if (command.equalsIgnoreCase('wr')) {
            $.consoleLn('!wr command called');
            $.consoleLn('matchedCat = ' + matchedCat);
          //  matchCat()
           if (matchedCat != '') {
                if (matchedCat >= 0 ){
                        sayFunction(runners[matchedCat] + ' holds the ' + categoryNames[matchedCat] + ' world record with a time of ' + times[matchedCat])
                }                  
                if (matchedCat == -2) {
                    $.consoleLn('tell chat no cats found')
                }                
                if (matchedCat == -1) {
                    $.consoleLn('tell chat  which at you want?')       
                } 
               
           } else { 
           $.consoleLn('no loaded games/records');
           }
        }
        
        if (command.equalsIgnoreCase('cat')) {
            $.consoleLn('!cat command called');
                    $.consoleLn(argsString + ' argsstrign');

            if (matchedCat != '') {

                if (action === undefined) {
                    sayFunction('Please type in a number or category.')
                } else {
                    $.consoleLn(isNaN(argsString));

                    if (isNaN(argsString) == false) { //true = word false = number
                        
                        if (action >= 0 && action < numOfCategories) {                       
                        matchedCat = action;
                        $.consoleLn(matchedCat);
                        sayFunction('you have selected ' + categoryNames[matchedCat]);
                        } else {
                         if (matchedCat >= 0) {
                            sayFunction('Invalid category number. ' + categoryNames[matchedCat] + ' has been selected instead.');                         
                            } 
                        if (matchedCat < 0) {
                        sayFunction('Please enter a valid category number.' );                         
                        }
                            
 
                        }
                        
                        
                        
                    } else {
                           
                        for (i = 0; i < numOfCategories; i++) {                                        
                        if (categoryNames[i].toUpperCase() == argsString.toUpperCase() ) {
                                $.consoleLn('match');
                                matchedCat = i;
                                $.consoleLn(matchedCat + ' matched cat');
                                sayFunction('you have selected ' + categoryNames[matchedCat]);

                                return;
                            } else {
                            
                            //   matchedCat = -2;
                                
                            }

                        }
            
                if (matchedCat >= 0) {
                sayFunction('No matches found. ' + categoryNames[matchedCat] + ' has been selected instead.');                         
                } 
                if (matchedCat < 0) {
                sayFunction('No matches found, please try again.' );                         
                }
                        
                    }
                }
            } else {
                sayFunction('no loaded games/records');
            }

        }
        
        
                if (command.equalsIgnoreCase('allcats')) {
            $.consoleLn('!allcats command called');
                 if (matchedCat != '') {


      $.consoleLn(numOfCategories + ' numOfCategories');

        string1 = 'Type "!cat X" for your pick '
        $.consoleLn(string1);
        for (i = 0; i < numOfCategories; i++) {
         string1 = string1.concat(i + ': '); 
          
            string1 = string1.concat(categoryNames[i] + ' ');
        }          
        $.consoleLn(string1);
            
        
        } else  { 
           $.consoleLn('no loaded games/records');
           }
                }
        
        
        
         if (command.equalsIgnoreCase('wrgame')) {

             
         }
        
        
        
        

    });
    

    
    /**
     * @event initReady
     */
    $.bind('initReady', function() {
        getStreamInfo()
        
        $.registerChatCommand('./handlers/titlechecker.js', 'tctest', 7);
        $.registerChatCommand('./handlers/titlechecker.js', 'tctest2', 7);
        $.registerChatCommand('./handlers/titlechecker.js', 'allcats', 7);
        $.registerChatCommand('./handlers/titlechecker.js', 'searchgame', 7);
        $.registerChatCommand('./handlers/titlechecker.js', 'wr', 7);
        $.registerChatCommand('./handlers/titlechecker.js', 'cat', 7);
        $.registerChatCommand('./handlers/titlechecker.js', 'wrgame', 7);


        //$.consoleDebug(message)

    });
})();