/**
 * titlechecker.js
 * 
 * 
 */
(function() {
    var subWelcomeToggle = $.getSetIniDbBoolean('subscribeHandler', 'subscriberWelcomeToggle', true);
    var timerArray = [];

    var announce = false;
    var srGame = '';
    var srGameId = '';
    var oldGameName = '';
    var wordsToSay = '';
    var categoriesId = [];
    var categoryNames = [];
    var runners = [];
    var runId = [];
    var times = [];
    var testArray = [];
    var catsFound = 0;
    var matchedCat = '';
    var numOfCategories = 0;
    var wrGameMode = $.getSetIniDbNumber('SpeedRunCom', 'wrGameMode' , 0);
    
    //  0/true = auto   1/false= manual

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
        $.consoleLn(gameName);

        $.consoleLn(badGames.indexOf(gameName.toUpperCase()) + ' index');
        //	if (oldGameName == gameName){
        //		$.consoleLn('game is same');			
        //		return;
        //	} else 
        {

            if (badGames.indexOf(gameName.toUpperCase()) > -1) {
                sayFunction('Special game found. Please try another or set game manually');

            } else {
                categoriesId = [];
                categoryNames = [];
                runners = [];
                times = [];
                testArray = [];
                runId = [];

                gameSearchUrl = 'https://www.speedrun.com/api/v1/games?name=' + gameName;
                $.consoleLn(gameSearchUrl);
                var srAPI = $.customAPI.get(gameSearchUrl).content;
                srAPIJSON = JSON.parse(srAPI);

                if (srAPIJSON.pagination.size == 0) {
                    sayFunction(srAPIJSON.pagination.size + ' results found');

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
        //https://www.speedrun.com/api/v1/games?name=Super%20Mario%20World%202%20Yoshi%27s%20Island
    }

    function getRecords() {
        //example url  https://www.speedrun.com/api/v1/games/pd0wq31e/records?top=1&max=200 smw 
        //example url  https://www.speedrun.com/api/v1/games/o6gnxo12/records?top=1&max=200 Super Mario World 2: Yoshi's Island
        // https://www.speedrun.com/api/v1/games/o6gnxo12/records?top=1?embed=categories&offset=109 ^ last 3

        allRecordsUrl = 'https://www.speedrun.com/api/v1/games/' + srGameId + '/records?top=1&max=200'
        $.consoleLn(allRecordsUrl);
        var allRecords = $.customAPI.get(allRecordsUrl).content;
        allRecords = JSON.parse(allRecords);
        numOfCategories = allRecords.pagination.size;
        $.consoleLn((numOfCategories.toFixed(0)) + ' Categories found');

        catsToSearch = numOfCategories;
        for (i = 0, x = 0; i <= (catsToSearch - 1); i++, x++) {

            $.consoleLn(numOfCategories + ' numOfCategories');
            $.consoleLn(i + ' i');
            $.consoleLn(x + ' x');

            //checks if run is an IL
            if (allRecords.data[i].level != null) {
                x--
                numOfCategories--
                $.consoleLn('IL found - skip');
                continue;
            }

            // checks if run is empty
            if (String(allRecords.data[i].runs) == '') {
                x--
                numOfCategories--
                $.consoleLn('run empty - skip');
                continue;
            }

            categoriesId[x] = allRecords.data[i].category
            $.consoleLn(categoriesId[x] + ' - cat id');



            runId[x] = allRecords.data[i].runs[0].run.id
            $.consoleLn(runId[x] + ' - runId');

            times[x] = allRecords.data[i].runs[0].run.times.primary;
            $.consoleLn(times[x] + ' - times');

            timesFixed = times[x].replace('PT', '');
            timesFixed = timesFixed.replace('H', ':');
            timesFixed = timesFixed.replace("M", ':');
            timesFixed = timesFixed.replace('S', '');
            times[x] = timesFixed
            $.consoleLn(times[x] + ' - times correct');

            runUrl = 'https://www.speedrun.com/api/v1/runs/' + runId[x] + '?embed=category,players';
            $.consoleLn(runUrl);
            var runs = $.customAPI.get(runUrl).content;
            runs = JSON.parse(runs);


            categoryNames[x] = runs.data.category.data.name;
            $.consoleLn(categoryNames[x] + ' - cat name');

         
    
            if (String(runs.data.players.data[0].name) == 'undefined') {
                runners[x] = runs.data.players.data[0].names.international;
                //normal names
            } else {                        
                 runners[x] = runs.data.players.data[0].name;
            //jp names
            }






            //example url https://www.speedrun.com/api/v1/categories/n2y1y72o

        }

        $.consoleLn(categoriesId.join(' , '));      
        $.consoleLn(categoryNames.join(' , '));
        $.consoleLn(runners.join(' , '));
        $.consoleLn(times.join(' , '));
        searchTitle()

    }

    function searchTitle() {
        catsFound = 0;
        testArray = [];
        incrementNum = 0;

        for (i = 0; i <= (numOfCategories - 1); i++) {

            cat = categoryNames[i];
            cat = cat.toUpperCase();
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

        if (catsFound == 0) {
            matchedCat = -2;
            sayFunction('no cats in title');
            return;
        }
        if (catsFound == 1) {
            matchedCat = testArray[0];
        }

        if (catsFound > 1) {
            matchedCat = -1;
            $.consoleLn(catsFound);

            string1 = 'Type "cat X" for your pick '
            for (i = 1; i <= catsFound; i++) {
                string1 = string1.concat(categoryNames.indexOf(categoryNames[testArray[i - 1]]) + ': ');

                string1 = string1.concat(categoryNames[testArray[i - 1]] + ' ');
            }
            $.consoleLn(string1);
        }
        sayFunction('matchedCat ' + matchedCat + ' @ spot 2');

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
                sayFunction('Please type game name');
                $.consoleLn('1');

            } else if (argsString.toLowerCase() == 'auto') {
                $.consoleLn('else if');

                wrGameMode = 0;
                $.setIniDbNumber('SpeedRunCom', 'wrGameMode' , wrGameMode)
                $.consoleLn(wrGameMode);
                //  $.setIniDbBoolean('subscribeHandler', 'wrGameMode', wrGameMode); /////////////add to db
                getStreamInfo()
            } else {
                $.consoleLn('else');

                wrGameMode = 1;
                $.setIniDbNumber('SpeedRunCom', 'wrGameMode' , wrGameMode)

                sayFunction($.whisperPrefix(sender) + (wrGameMode ? 'mode 0 true.' : 'mode 1 false.'));

                gameName = argsString.toLowerCase();
                getGameId(gameName)
            }
        }

        //  0/true = auto   1/false= manual

        if (command.equalsIgnoreCase('tctest')) {
            $.consoleLn('tctest command called');

            //test function time

            for (q = 1; q <= 15; q++) {
                var start = new Date();
                getStreamInfo()
                var end = new Date();
                var duration = end - start;
                $.consoleLn(duration);
                timerArray.push(duration);

                $.consoleLn(typeof duration);

                function getSum(total, num) {
                    return total + num;
                }
                $.consoleLn('run ' + q);
                $.consoleLn((timerArray.reduce(getSum) / timerArray.length) / 1000 + ' s');

            }

        }

        if (command.equalsIgnoreCase('tctest2')) {
            $.consoleLn('tctest2 command called');
            if (action === undefined) {
                $.consoleLn(wrGameMode);

            
        
                

            }
        }

        if (command.equalsIgnoreCase('wr')) {
            $.consoleLn('!wr command called');
            $.consoleLn('matchedCat = ' + matchedCat);
            if (matchedCat != '') {
                if (matchedCat >= 0) {
                    sayFunction(runners[matchedCat] + ' holds the ' + categoryNames[matchedCat] + ' world record with a time of ' + times[matchedCat])
                }
                if (matchedCat == -2) {
                    sayFunction('tell chat no cats found')
                }
                if (matchedCat == -1) {
                    sayFunction('tell chat  which at you want?')
                }

            } else {
                sayFunction('no loaded games/records');
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
                                sayFunction('Please enter a valid category number.');
                            }

                        }

                    } else {

                        for (i = 0; i < numOfCategories; i++) {
                            if (categoryNames[i].toUpperCase() == argsString.toUpperCase()) {
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
                            sayFunction('No matches found, please try again.');
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
                for (i = 0; i < numOfCategories; i++) {
                    string1 = string1.concat(i + ': ');
                    string1 = string1.concat(categoryNames[i] + ' ');
                }
                sayFunction(string1);

            } else {
                sayFunction('no loaded games/records');
            }
        }

    });

    /**
     * @event initReady
     */
    $.bind('initReady', function() {
        getStreamInfo()

        $.registerChatCommand('./handlers/titlechecker v2.js', 'tctest', 7);
        $.registerChatCommand('./handlers/titlechecker v2.js', 'tctest2', 7);
        $.registerChatCommand('./handlers/titlechecker v2.js', 'allcats', 7);
        $.registerChatCommand('./handlers/titlechecker v2.js', 'searchgame', 7);
        $.registerChatCommand('./handlers/titlechecker v2.js', 'wr', 7);
        $.registerChatCommand('./handlers/titlechecker v2.js', 'cat', 7);

        //$.consoleDebug(message)

    });
})();

//notes / to do list
// autonauts  game does TypeError: Cannot read property "run" from undefined ----fixed with if (String(allRecords.data[i].runs) == '')
// need to save wrGameMode to DB ---- done
 
// in manual mode save game  to db and pull from it on load
// in all modes save cat to db and pull at startup
// do somethign with subcats and rule
// check if runner id is in array already to avoid calling api again
// add cat rules command
// 
//
//
// searchgame super mario 64 TypeError: Cannot read property "international" from undefined --unclean fix. for 0 exit akira doesnt have international name

//
//
//
//
//
//
//
//
//