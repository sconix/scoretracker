/*
 *    WizardAssistant - does something
 *   
 *    Arguments:
 *        none                           
 *        
 *    Functions:
 *        constructor         No-op
 *        setup               Sets up a list widget.
 *        activate            No-op
 *        deactivate          No-op
 *        cleanup             No-op
 *        dividerFunc		  Returns a divider label to use in the list dividers.
*/


function WizardAssistant(config, game) {
	/* This is the creator function for your scene assistant object. It will be passed all the 
	 * additional parameters (after the scene name) that were passed to pushScene. The reference
	 * to the scene controller (this.controller) has not be established yet, so any initialization
	 * that needs the scene controller should be done in the setup function below. 
	 */

	this.config = config;

	this.game = game;

	this.stage = 1;
	
	this.view = "main";
}    

WizardAssistant.prototype.setup = function() {
	/* This function is for setup tasks that have to happen when the scene is first created
	 * Use Mojo.View.render to render view templates and add them to the scene, if needed.
    * Setup widgets and add event handlers to listen to events from widgets here. 
    */

	this.modelAppMenu = {visible: true, items: [ 
		{label: $L("Help"), command: 'help'}]};
	
	this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true},
		this.modelAppMenu);

	if(this.game) {
		this.itemsCommandMenu = [
			{'label': $L("< Prev"), 'command': "prev", disabled: true},
			{'label': $L("Back"), 'command': "back", disabled: false},
			{'label': $L("Next >"), 'command': "next", disabled: false} ];
	}
	else {
		this.itemsCommandMenu = [
			{'label': $L("< Prev"), 'command': "prev", disabled: true},
			{'label': $L("Save"), 'command': "save", disabled: true},
			{'label': $L("Next >"), 'command': "next", disabled: false} ];
	}
	
	this.modelCommandMenu = {'visible': true, 'items': this.itemsCommandMenu};
		
	this.controller.setupWidget(Mojo.Menu.commandMenu, null, this.modelCommandMenu);

	if(this.game)
		this.modelGameName = {'value': this.game, 'disabled': false};
	else		   
		this.modelGameName = {'value': "", 'disabled': false};

	this.controller.setupWidget("GameName", { 'hintText': $L("Name of the game..."), 
		'multiline': false, 'enterSubmits': false, 'focus': true},
		this.modelGameName);

	Mojo.Event.listen(this.controller.get("GameName"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	if(this.game)
		this.modelGameType = {'value': this.config.games[this.game].useRounds, 'disabled': false};
	else
		this.modelGameType = {'value': "rounds", 'disabled': false};
				
	this.choicesTypeSelector = [
		{'label': $L("Yes, is round based"), 'value': "rounds"},
		{'label': $L("No, only single session"), 'value': "single"}];  

	this.controller.setupWidget("GameType", {
		'labelPlacement': "right", 'choices': this.choicesTypeSelector}, 
		this.modelGameType);

	Mojo.Event.listen(this.controller.get("GameType"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	if(this.game)
		this.modelGameTeams = {'value': this.config.games[this.game].allowTeams, 'disabled': false};
	else
		this.modelGameTeams = {'value': "yes", 'disabled': false};	

	this.choicesTeamsSelector = [
		{'label': $L("Yes, can have teams"), 'value': "yes"},
		{'label': $L("Yes, only team based"), 'value': "only"},
		{'label': $L("No, only single players"), 'value': "no"}];  

	this.controller.setupWidget("GameTeams", {
		'labelPlacement': "right", 'choices': this.choicesTeamsSelector}, 
		this.modelGameTeams);

	Mojo.Event.listen(this.controller.get("GameTeams"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	if(this.game) {
		if(this.config.games[this.game].playersLimit == "variable")
			this.modelGamePlayersNo = {'value': "variable", 'disabled': false};
		else if(this.config.games[this.game].playersLimit.split("-").length > 1)
			this.modelGamePlayersNo = {'value': "range", 'disabled': false};
		else
			this.modelGamePlayersNo = {'value': "fixed", 'disabled': false};		
	}
	else
		this.modelGamePlayersNo = {'value': "variable", 'disabled': false};
		
	this.choicesGamePlayersNo = [
		{'label': $L("Fixed number"), 'value': "fixed"},
		{'label': $L("Fixed number range"), 'value': "range"},
		{'label': $L("Variable, no limits"), 'value': "variable"} ];

	this.controller.setupWidget("GamePlayersNo", {
		'labelPlacement': "right", 'choices': this.choicesGamePlayersNo}, 
		this.modelGamePlayersNo);

	Mojo.Event.listen(this.controller.get("GamePlayersNo"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	if((this.game) && (this.modelGamePlayersNo.value == "fixed")) {
		this.controller.get("PlayersNoRow").removeClassName("single");
		this.controller.get("PlayersNoRow").addClassName("first");

		this.controller.get("PlayersFixedRow").show();
			
		this.modelGamePlayerNo = {value: this.config.games[this.game].playersLimit};
	}
	else
		this.modelGamePlayerNo = {value: 2};

	this.controller.setupWidget("GamePlayerNo", {label: 'Number of players',
			min: 1, max: 99 }, this.modelGamePlayerNo ); 

	Mojo.Event.listen(this.controller.get("GamePlayerNo"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	if((this.game) && (this.modelGamePlayersNo.value == "range")) 
		this.modelGamePlayersMin = {value: this.config.games[this.game].playersLimit.split("-")[0]};
	else
		this.modelGamePlayersMin = {value: 2};

	this.controller.setupWidget("GamePlayersMin", {label: " ",
			min: 1, max: 99 }, this.modelGamePlayersMin ); 

	Mojo.Event.listen(this.controller.get("GamePlayersMin"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));
	
	if((this.game) && (this.modelGamePlayersNo.value == "range")) {
		this.controller.get("PlayersNoRow").removeClassName("single");
		this.controller.get("PlayersNoRow").addClassName("first");

		this.controller.get("PlayersRangeRow").show();

		this.modelGamePlayersMax = {value: this.config.games[this.game].playersLimit.split("-")[1]};
	}
	else
		this.modelGamePlayersMax = {value: 10};

	this.controller.setupWidget("GamePlayersMax", {label: " ",
			min: 1, max: 99 }, this.modelGamePlayersMax ); 

	Mojo.Event.listen(this.controller.get("GamePlayersMax"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));
	
	if(this.game) {
		if(this.modelGameTeams.value == "no")
			this.modelGameTeamsNo = {'value': "variable", 'disabled': true};
		else if(this.config.games[this.game].teamsLimit == "variable")
			this.modelGameTeamsNo = {'value': "variable", 'disabled': false};
		else if(this.config.games[this.game].teamsLimit.split("-").length > 1)
			this.modelGameTeamsNo = {'value': "range", 'disabled': false};
		else
			this.modelGameTeamsNo = {'value': "fixed", 'disabled': false};		
	}
	else
		this.modelGameTeamsNo = {'value': "variable", 'disabled': false};
		
	this.choicesGameTeamsNo = [
		{'label': $L("Fixed number"), 'value': "fixed"},
		{'label': $L("Fixed number range"), 'value': "range"},
		{'label': $L("Variable, no limits"), 'value': "variable"}];  

	this.controller.setupWidget("GameTeamsNo", {
		'labelPlacement': "right", 'choices': this.choicesGameTeamsNo}, 
		this.modelGameTeamsNo);

	Mojo.Event.listen(this.controller.get("GameTeamsNo"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	if((this.game) && (this.modelGameTeamsNo.value == "fixed")) {
		this.controller.get("TeamsNoRow").removeClassName("single");
		this.controller.get("TeamsNoRow").addClassName("first");

		this.controller.get("TeamsFixedRow").show();

		this.modelGameTeamNo = {value: this.config.games[this.game].teamsLimit};
	}
	else
		this.modelGameTeamNo = {value: 2};

	this.controller.setupWidget("GameTeamNo", {label: 'Number of teams',
			min: 1, max: 99 }, this.modelGameTeamNo ); 

	Mojo.Event.listen(this.controller.get("GameTeamNo"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	if((this.game) && (this.modelGameTeamsNo.value == "range"))
		this.modelGameTeamsMin = {value: this.config.games[this.game].teamsLimit.split("-")[0]};
	else
		this.modelGameTeamsMin = {value: 2};

	this.controller.setupWidget("GameTeamsMin", {label: " ",
			min: 1, max: 99 }, this.modelGameTeamsMin ); 

	Mojo.Event.listen(this.controller.get("GameTeamsMin"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));
	
	if((this.game) && (this.modelGameTeamsNo.value == "range")) {
		this.controller.get("TeamsNoRow").removeClassName("single");
		this.controller.get("TeamsNoRow").addClassName("first");

		this.controller.get("TeamsRangeRow").show();

		this.modelGameTeamsMax = {value: this.config.games[this.game].teamsLimit.split("-")[1]};
	}
	else
		this.modelGameTeamsMax = {value: 10};

	this.controller.setupWidget("GameTeamsMax", {label: " ",
			min: 1, max: 99 }, this.modelGameTeamsMax ); 

	Mojo.Event.listen(this.controller.get("GameTeamsMax"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	if(this.game) {
		if(this.modelGameTeams.value == "no")
			this.modelGamePlayerPoints = {'value': "no" , 'disabled': true};
		else
			this.modelGamePlayerPoints = {'value': this.config.games[this.game].playerStats , 'disabled': false};
	}
	else
		this.modelGamePlayerPoints = {'value': "no", 'disabled': false};
		
	this.choicesGamePlayerPoints = [
		{'label': $L("No, does not have"), 'value': "no"},
		{'label': $L("Yes, for statistics"), 'value': "yes"}];  

	this.controller.setupWidget("GamePlayerPoints", {
		'labelPlacement': "right", 'choices': this.choicesGamePlayerPoints}, 
		this.modelGamePlayerPoints);

	Mojo.Event.listen(this.controller.get("GamePlayerPoints"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	if(this.game)
		this.modelGamePointsRecording = {'value': this.config.games[this.game].pointsInput, 'disabled': false};
	else
		this.modelGamePointsRecording = {'value': "round", 'disabled': false};
		
	this.choicesGamePointsRecording = [
		{'label': $L("After players turn"), 'value': "turn"},
		{'label': $L("After every round"), 'value': "round"},
		{'label': $L("During game play"), 'value': "live"}];  

	this.controller.setupWidget("GamePointsRecording", {
		'labelPlacement': "right", 'choices': this.choicesGamePointsRecording}, 
		this.modelGamePointsRecording);

	Mojo.Event.listen(this.controller.get("GamePointsRecording"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	if(this.game) {
		if(this.config.games[this.game].pointsRange == "single")
			this.modelGamePointsInput = {'value': "single", 'disabled': false};
		else if((this.config.games[this.game].pointsRange.length > 0) &&
			((this.config.games[this.game].pointsRange[0] == "-") ||
			(this.config.games[this.game].pointsRange[0] == "+")))
		{
			this.modelGamePointsInput = {'value': "custom", 'disabled': false};
		}
		else if(this.config.games[this.game].pointsRange.split("-").length == 2)		
			this.modelGamePointsInput = {'value': "range", 'disabled': false};
		else if(this.config.games[this.game].pointsRange.split("-").length == 3)		
			this.modelGamePointsInput = {'value': "range+", 'disabled': false};
		else
			this.modelGamePointsInput = {'value': "custom", 'disabled': false};
	}
	else
		this.modelGamePointsInput = {'value': "single", 'disabled': false};
		
	this.choicesGamePointsInput = [
		{'label': $L("One point (+/-)"), 'value': "single"},
		{'label': $L("Any custom number(s)"), 'value': "custom"},
		{'label': $L("Limited number range"), 'value': "range"},
		{'label': $L("Number range + custom"), 'value': "range+"}];  

	this.controller.setupWidget("GamePointsInput", {
		'labelPlacement': "right", 'choices': this.choicesGamePointsInput}, 
		this.modelGamePointsInput);

	Mojo.Event.listen(this.controller.get("GamePointsInput"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	if((this.game) && (this.modelGamePointsInput.value == "custom")) {
		this.controller.get("PointInputRow").removeClassName("single");
		this.controller.get("PointInputRow").addClassName("first");

		this.controller.get("PointsCustomRow").show();
				
		this.modelPointsCustom = {'value': this.config.games[this.game].pointsRange, 'disabled': false};
	}
	else
		this.modelPointsCustom = {'value': "", 'disabled': false};
		   
	this.controller.setupWidget("PointsCustom", { 'hintText': $L("-5,-10,+5,+10,..."), 
		'multiline': false, 'enterSubmits': false, 'focus': true},
		this.modelPointsCustom);

	Mojo.Event.listen(this.controller.get("PointsCustom"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	if((this.game) && (this.modelGamePointsInput.value.substr(0, 5) == "range"))
		this.modelPointsRangeMin = {'value': this.config.games[this.game].pointsRange.split("-")[0].replace("-c",""), 'disabled': false};
	else
		this.modelPointsRangeMin = {'value': 0};

	this.controller.setupWidget("PointsRangeMin", {label: " ",
			min: 0, max: 99 }, this.modelPointsRangeMin ); 

	Mojo.Event.listen(this.controller.get("PointsRangeMin"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	if((this.game) && (this.modelGamePointsInput.value.substr(0, 5) == "range")) {
		this.controller.get("PointInputRow").removeClassName("single");
		this.controller.get("PointInputRow").addClassName("first");

		this.controller.get("PointsRangeRow").show();
				
		this.modelPointsRangeMax = {'value': this.config.games[this.game].pointsRange.split("-")[1].replace("-c",""), 'disabled': false};
	}
	else
		this.modelPointsRangeMax = {'value': 99};

	this.controller.setupWidget("PointsRangeMax", {label: " ",
			min: 0, max: 99 }, this.modelPointsRangeMax ); 

	Mojo.Event.listen(this.controller.get("PointsRangeMax"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	if(this.game) {
		if(this.modelGameType.value == "single")
			this.modelGamePointsSkip = {'value': "no", 'disabled': true};
		else
			this.modelGamePointsSkip = {'value': this.config.games[this.game].allowSkip, 'disabled': false};		
	}
	else
		this.modelGamePointsSkip = {'value': "no", 'disabled': false};
		
	this.choicesGamePointsSkip = [
		{'label': $L("Yes, allow skipping"), 'value': "yes"},
		{'label': $L("No, disallow skipping"), 'value': "no"}];  

	this.controller.setupWidget("GamePointsSkip", {
		'labelPlacement': "right", 'choices': this.choicesGamePointsSkip}, 
		this.modelGamePointsSkip);

	Mojo.Event.listen(this.controller.get("GamePointsSkip"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	if(this.game) {
		if(this.config.games[this.game].pointsLimit == "none")
			this.modelGamePointsLimit = {'value': "none", 'disabled': false};
		else if(this.config.games[this.game].pointsLimit.indexOf("+") != -1)
			this.modelGamePointsLimit = {'value': "fixed+", 'disabled': false};
		else
			this.modelGamePointsLimit = {'value': "fixed", 'disabled': false};
	}
	else
		this.modelGamePointsLimit = {'value': "none", 'disabled': false};
		
	this.choicesGamePointsLimit = [
		{'label': $L("No limit"), 'value': "none"},
		{'label': $L("Fixed number"), 'value': "fixed"},
		{'label': $L("Fixed + 2 difference"), 'value': "fixed+"}];  

	this.controller.setupWidget("GamePointsLimit", {
		'labelPlacement': "right", 'choices': this.choicesGamePointsLimit}, 
		this.modelGamePointsLimit);

	Mojo.Event.listen(this.controller.get("GamePointsLimit"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	if((this.game) && (this.modelGamePointsLimit.value != "none")) {
		this.controller.get("PointsLimitRow").removeClassName("single");
		this.controller.get("PointsLimitRow").addClassName("first");

		this.controller.get("PointsFixedRow").show();

		this.modelPointsFixed = {'value': this.config.games[this.game].pointsLimit.replace("+2",""), 'disabled': false};
	}
	else
		this.modelPointsFixed = {'value': "", 'disabled': false};
		   
	this.controller.setupWidget("GamePointsFixed", { 'hintText': $L("Enter points limit..."), 
		'multiline': false, 'enterSubmits': false, 'focus': true, modifierState: Mojo.Widget.numLock},
		this.modelPointsFixed);

	Mojo.Event.listen(this.controller.get("GamePointsFixed"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));
	
	if(this.game)	
		this.modelGameWinnerLogic = {'value': this.config.games[this.game].gameWinner, 'disabled': false};
	else
		this.modelGameWinnerLogic = {'value': "most", 'disabled': false};
			
	this.choicesGameWinnerLogic = [
		{'label': $L("Who has most points"), 'value': "most"},
		{'label': $L("Who has least points"), 'value': "least"}];  

	this.controller.setupWidget("GameWinnerLogic", {
		'labelPlacement': "right", 'choices': this.choicesGameWinnerLogic}, 
		this.modelGameWinnerLogic);

	Mojo.Event.listen(this.controller.get("GameWinnerLogic"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	if(this.game) {
		if(this.modelGameType.value == "single")
			this.modelGameEndResult = {'value': "points", 'disabled': true};
		else
			this.modelGameEndResult = {'value': this.config.games[this.game].endResult, 'disabled': false};		
	}
	else	
		this.modelGameEndResult = {'value': "points", 'disabled': false};
		
	this.choicesGameEndResult = [
		{'label': $L("Based on points"), 'value': "points"},
		{'label': $L("Based on victories"), 'value': "rounds"}];  

	this.controller.setupWidget("GameEndResult", {
		'labelPlacement': "right", 'choices': this.choicesGameEndResult}, 
		this.modelGameEndResult);

	Mojo.Event.listen(this.controller.get("GameEndResult"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	if(this.game)
		this.modelGameUseStats = {'value': this.config.games[this.game].useStats, 'disabled': false};
	else
		this.modelGameUseStats = {'value': "none", 'disabled': false};
			
	this.choicesGameUseStats = [
		{'label': $L("Yes, use stats"), 'value': "extra"},
		{'label': $L("Yes, it is needed"), 'value': "stats"},
		{'label': $L("No, there is no need"), 'value': "none"}];  

	this.controller.setupWidget("GameUseStats", {
		'labelPlacement': "right", 'choices': this.choicesGameUseStats}, 
		this.modelGameUseStats);

	Mojo.Event.listen(this.controller.get("GameUseStats"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	if(this.modelGameUseStats.value != "none")
		this.modelStatsList = {items: [] , disabled: false};
	else
		this.modelStatsList = {items: [] , disabled: true};

	if(this.game) {
		for(var i = 0; i < this.config.games[this.game].statsList.length; i++)
			this.modelStatsList.items.push(this.config.games[this.game].statsList[i]);
	}

	this.controller.setupWidget('GameStatsList', {itemTemplate:'common/place-item', swipeToDelete: true, 
		addItemLabel: "Add new statistic..."}, this.modelStatsList);

	Mojo.Event.listen(this.controller.get('GameStatsList'), Mojo.Event.listDelete, 
		this.handleRemoveStatsFromList.bind(this));

	Mojo.Event.listen(this.controller.get('GameStatsList'), Mojo.Event.listTap, 
		this.handleEditStatsFromList.bind(this));

	Mojo.Event.listen(this.controller.get('GameStatsList'), Mojo.Event.listAdd, 
		this.handleAppendStatsToList.bind(this));

	if(this.game)
		this.modelGameUsePlaces = {'value': this.config.games[this.game].usePlaces, 'disabled': false};
	else
		this.modelGameUsePlaces = {'value': "none", 'disabled': false};
			
	this.choicesGameUseTracks = [
		{'label': $L("Yes, use places"), 'value': "places"},
		{'label': $L("No, there is no need"), 'value': "none"}];  

	this.controller.setupWidget("GameUsePlaces", {
		'labelPlacement': "right", 'choices': this.choicesGameUseTracks}, 
		this.modelGameUsePlaces);

	Mojo.Event.listen(this.controller.get("GameUsePlaces"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	if(this.modelGameUsePlaces.value == "places")
		this.listModel = {items: [] , disabled: false};
	else
		this.listModel = {items: [] , disabled: true};

	if(this.game) {
		for(var i = 0; i < this.config.games[this.game].placesList.length; i++)
			this.listModel.items.push(this.config.games[this.game].placesList[i]);
	}

	this.controller.setupWidget('GamePlacesList', {itemTemplate:'common/place-item', swipeToDelete: true, addItemLabel: "Add new place..."}, this.listModel);

	Mojo.Event.listen(this.controller.get('GamePlacesList'), Mojo.Event.listDelete, 
		this.handleRemoveTrackFromList.bind(this));

	Mojo.Event.listen(this.controller.get('GamePlacesList'), Mojo.Event.listTap, 
		this.handleEditTrackFromList.bind(this));

	Mojo.Event.listen(this.controller.get('GamePlacesList'), Mojo.Event.listAdd, 
		this.handleAppendTrackToList.bind(this));

	this.modelPlaceName = {'value': "", 'disabled': false};
		   
	this.controller.setupWidget("PlaceName", { 'hintText': $L("Name of the place..."), 
		'multiline': false, 'enterSubmits': false, 'focus': true},
		this.modelPlaceName);

	Mojo.Event.listen(this.controller.get("PlaceName"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	if(this.modelGameType.value == "single")
		this.modelTrackRoundsLimit = {'value': "no", 'disabled': true};
	else
		this.modelTrackRoundsLimit = {'value': "no", 'disabled': false};
		
	this.choicesTrackRoundsLimit = [
		{'label': $L("No special limit"), 'value': "no"},
		{'label': $L("Has limited rounds"), 'value': "yes"}];  

	this.controller.setupWidget("TrackRoundsLimit", {
		'labelPlacement': "right", 'choices': this.choicesTrackRoundsLimit}, 
		this.modelTrackRoundsLimit);

	Mojo.Event.listen(this.controller.get("TrackRoundsLimit"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	this.modelTrackRoundsFixed = {value: 10};

	this.controller.setupWidget("TrackRoundsFixed", {label: "Rounds limit",
			min: 1, max: 99 }, this.modelTrackRoundsFixed ); 

	Mojo.Event.listen(this.controller.get("TrackRoundsFixed"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	this.modelTrackUseResult = {'value': "no", 'disabled': false};
		
	this.choicesTrackUseResult = [
		{'label': $L("No special result"), 'value': "no"},
		{'label': $L("Has an ideal result"), 'value': "yes"}];  

	this.controller.setupWidget("TrackUseResult", {
		'labelPlacement': "right", 'choices': this.choicesTrackUseResult}, 
		this.modelTrackUseResult);

	Mojo.Event.listen(this.controller.get("TrackUseResult"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));

	this.modelTrackIdealResult = {'value': "", 'disabled': false};
		   
	this.controller.setupWidget("TrackIdealResult", { 'hintText': $L("Ideal result..."), 
		'multiline': false, 'enterSubmits': false, 'focus': true, modifierState: Mojo.Widget.numLock},
		this.modelTrackIdealResult);

	Mojo.Event.listen(this.controller.get("TrackIdealResult"), Mojo.Event.propertyChange, 
		this.checkGameData.bind(this));
}

WizardAssistant.prototype.checkGameData = function(event) {
	this.edited = true;

	if(this.game)
		this.modelCommandMenu.items[1] = {label: "Save", command: "save", disabled: false};
	else
	this.modelCommandMenu.items[1].disabled = false;

	this.controller.modelChanged(this.modelCommandMenu, this);

	if(event.target.id == "GameName") {
		if(event.value.length > 0)
			this.itemsCommandMenu[1].disabled = false;
		else
			this.itemsCommandMenu[1].disabled = true;		

		this.controller.modelChanged(this.modelCommandMenu, this);
	}
	else if(event.target.id == "GameType") {
		if(event.value == "single") {
			this.modelGamePointsSkip.disabled = true;
			this.modelTrackRoundsLimit.disabled = true;			
			this.modelGameEndResult.disabled = true;
			this.modelGameEndResult.value = "points";
		}
		else {
			this.modelGamePointsSkip.disabled = false;
			this.modelTrackRoundsLimit.disabled = false;	
			this.modelGameEndResult.disabled = false;
		}
	
		this.controller.modelChanged(this.modelGamePointsSkip, this);
		this.controller.modelChanged(this.modelTrackRoundsLimit, this);
		this.controller.modelChanged(this.modelGameEndResult, this);
	}
	else if(event.target.id == "GameTeams") {
		if(event.value == "no") {
			this.modelGameTeamsNo.disabled = true;
			this.modelGamePlayerPoints.disabled = true;
		}
		else {
			this.modelGameTeamsNo.disabled = false;			
			this.modelGamePlayerPoints.disabled = false;
		}
	
		this.controller.modelChanged(this.modelGameTeamsNo, this);
		this.controller.modelChanged(this.modelGamePlayerPoints, this);
	}
	else if(event.target.id == "GamePlayersNo") {
		this.controller.get("PlayersNoRow").removeClassName("first");
		this.controller.get("PlayersNoRow").addClassName("single");

		this.controller.get("PlayersFixedRow").hide();
		this.controller.get("PlayersRangeRow").hide();

		if(event.value != "variable") {
			this.controller.get("PlayersNoRow").removeClassName("single");
			this.controller.get("PlayersNoRow").addClassName("first");
		}
		
		if(event.value == "fixed")
			this.controller.get("PlayersFixedRow").show();
		else if(event.value == "range")
			this.controller.get("PlayersRangeRow").show();
	}
	else if(event.target.id == "GameTeamsNo") {
		this.controller.get("TeamsNoRow").removeClassName("first");
		this.controller.get("TeamsNoRow").addClassName("single");

		this.controller.get("TeamsFixedRow").hide();
		this.controller.get("TeamsRangeRow").hide();

		if(event.value != "variable") {
			this.controller.get("TeamsNoRow").removeClassName("single");
			this.controller.get("TeamsNoRow").addClassName("first");
		}
		
		if(event.value == "fixed")
			this.controller.get("TeamsFixedRow").show();
		else if(event.value == "range")
			this.controller.get("TeamsRangeRow").show();
	}
	else if(event.target.id == "GamePointsInput") {
		this.controller.get("PointInputRow").removeClassName("first");
		this.controller.get("PointInputRow").addClassName("single");

		this.controller.get("PointsCustomRow").hide();
		this.controller.get("PointsRangeRow").hide();

		if(event.value != "single") {
			this.controller.get("PointInputRow").removeClassName("single");
			this.controller.get("PointInputRow").addClassName("first");
		}
				
		if(event.value == "custom")
			this.controller.get("PointsCustomRow").show();
		else if(event.value != "single")
			this.controller.get("PointsRangeRow").show();
	}
	else if(event.target.id == "GamePointsLimit") {
		this.controller.get("PointsLimitRow").removeClassName("first");
		this.controller.get("PointsLimitRow").addClassName("single");

		this.controller.get("PointsFixedRow").hide();

		if(event.value != "none") {
			this.controller.get("PointsLimitRow").removeClassName("single");
			this.controller.get("PointsLimitRow").addClassName("first");

			this.controller.get("PointsFixedRow").show();
		}
	}
	else if(event.target.id == "GameUsePlaces") {	
		if(event.value == "places")
			this.listModel.disabled = false;
		else
			this.listModel.disabled = true;
		
		this.controller.modelChanged(this.listModel, this);
	}		
	else if(event.target.id == "PlaceName") {
		if(event.value.length > 0) {
			this.modelCommandMenu.items[0] = {};
			this.modelCommandMenu.items[1] = {'label': $L("Done"), 'command': "done", disabled: false};
			this.modelCommandMenu.items[2] = {};
		}
		
		this.controller.modelChanged(this.modelCommandMenu, this);
	}
	else if(event.target.id == "TrackRoundsLimit") {
		this.controller.get("TrackRoundsRow").removeClassName("first");
		this.controller.get("TrackRoundsRow").addClassName("single");

		this.controller.get("TrackFixedRow").hide();

		if(event.value == "yes") {
			this.controller.get("TrackRoundsRow").removeClassName("single");
			this.controller.get("TrackRoundsRow").addClassName("first");

			this.controller.get("TrackFixedRow").show();
		}
	}
	else if(event.target.id == "TrackUseResult") {
		this.controller.get("TrackResultRow").removeClassName("first");
		this.controller.get("TrackResultRow").addClassName("single");

		this.controller.get("TrackIdealRow").hide();

		if(event.value == "yes") {
			this.controller.get("TrackResultRow").removeClassName("single");
			this.controller.get("TrackResultRow").addClassName("first");

			this.controller.get("TrackIdealRow").show();
		}
	}
}

WizardAssistant.prototype.handleRemoveStatsFromList = function(event) {
}

WizardAssistant.prototype.handleEditStatsFromList = function(event) {
}

WizardAssistant.prototype.handleAppendStatsToList = function(event) {
}

WizardAssistant.prototype.handleRemoveTrackFromList = function(event) {
	this.edited = true;
	
	this.listModel.items.splice(event.index, 1);
}

WizardAssistant.prototype.handleEditTrackFromList = function(event) {
			this.view = "tracks";

	this.trackIndex = event.index;

	this.controller.get("main-title").update("Add / Edit A Place");

	this.controller.get("stage" + this.stage).hide();
	
	this.controller.get("stageT").show();

	this.modelCommandMenu.items[0] = {};
	this.modelCommandMenu.items[1] = {'label': $L("Done"), 'command': "done", disabled: false};
	this.modelCommandMenu.items[2] = {};
	
	this.controller.modelChanged(this.modelCommandMenu, this);

	this.modelPlaceName.value = this.listModel.items[event.index].place;

	if(this.listModel.items[event.index].rounds == 0) {
		this.controller.get("TrackRoundsRow").removeClassName("first");	
		this.controller.get("TrackRoundsRow").addClassName("single");	

		this.controller.get("TrackFixedRow").hide();	
		
		this.modelTrackRoundsLimit.value = "no";
		this.modelTrackRoundsFixed.value = 10;
	}
	else {
		this.controller.get("TrackRoundsRow").removeClassName("single");	
		this.controller.get("TrackRoundsRow").addClassName("first");	

		this.controller.get("TrackFixedRow").show();	
	
		this.modelTrackRoundsLimit.value = "yes";	
		this.modelTrackRoundsFixed.value = this.listModel.items[event.index].rounds;
	}
	
	if(this.listModel.items[event.index].target == 0) {
		this.controller.get("TrackResultRow").removeClassName("first");	
		this.controller.get("TrackResultRow").addClassName("single");	

		this.controller.get("TrackIdealRow").hide();

		this.modelTrackUseResult.value = "no";
		this.modelTrackIdealResult.value = "";
	}
	else {
		this.controller.get("TrackResultRow").removeClassName("single");	
		this.controller.get("TrackResultRow").addClassName("first");	

		this.controller.get("TrackIdealRow").show();
		
		this.modelTrackUseResult.value = "yes";
		this.modelTrackIdealResult.value = this.listModel.items[event.index].target;
	}
	
	this.controller.modelChanged(this.modelPlaceName, this);
	this.controller.modelChanged(this.modelTrackRoundsLimit, this);
	this.controller.modelChanged(this.modelTrackRoundsFixed, this);
	this.controller.modelChanged(this.modelTrackUseResult, this);
	this.controller.modelChanged(this.modelTrackIdealResult, this);	
}

WizardAssistant.prototype.handleAppendTrackToList = function(event) {
			this.view = "tracks";

	this.trackIndex = undefined;

	if(this.listModel.disabled == true)
		return;

	this.controller.get("main-title").update("Add / Edit A Place");

	this.controller.get("stage" + this.stage).hide();
	
	this.controller.get("stageT").show();

	this.modelCommandMenu.items[0] = {};
	this.modelCommandMenu.items[1] = {'label': $L("Done"), 'command': "done", disabled: true};
	this.modelCommandMenu.items[2] = {};
	
	this.controller.modelChanged(this.modelCommandMenu, this);

	this.controller.get("TrackRoundsRow").removeClassName("first");	
	this.controller.get("TrackRoundsRow").addClassName("single");	

	this.controller.get("TrackResultRow").removeClassName("first");	
	this.controller.get("TrackResultRow").addClassName("single");	
	
	this.controller.get("TrackFixedRow").hide();	
	this.controller.get("TrackIdealRow").hide();
	
	this.modelPlaceName.value = "";
	this.modelTrackRoundsLimit.value = "no";
	this.modelTrackRoundsFixed.value = 10;
	this.modelTrackUseResult.value = "no";
	this.modelTrackIdealResult.value = "";

	this.controller.modelChanged(this.modelPlaceName, this);
	this.controller.modelChanged(this.modelTrackRoundsLimit, this);
	this.controller.modelChanged(this.modelTrackRoundsFixed, this);
	this.controller.modelChanged(this.modelTrackUseResult, this);
	this.controller.modelChanged(this.modelTrackIdealResult, this);			
}

WizardAssistant.prototype.saveGameConfig = function() {
	this.modelCommandMenu.items[1].disabled = true;
	this.controller.modelChanged(this.modelCommandMenu, this);
	
	var gameName = this.modelGameName.value;

	var useRounds = this.modelGameType.value;
	
	var allowTeams = this.modelGameTeams.value;

	var playersLimit = this.modelGamePlayersNo.value;

	if(this.modelGamePlayersNo.value == "fixed")
		playersLimit = this.modelGamePlayerNo.value.toString();
	else if(this.modelGamePlayersNo.value == "range")
		playersLimit = this.modelGamePlayersMin.value + "-" + this.modelGamePlayersMax.value;

	var teamsLimit = this.modelGameTeamsNo.value;

	if(this.modelGameTeams.value == "no")
		teamsLimit = "variable";
	else if(this.modelGameTeamsNo.value == "fixed")
		teamsLimit = this.modelGameTeamNo.value.toString();
	else if(this.modelGameTeamsNo.value == "range")
		teamsLimit = this.modelGameTeamsMin.value + "-" + this.modelGameTeamsMax.value;

	var playerStats = this.modelGamePlayerPoints.value;
	
	if(this.modelGameTeams.value == "no")
		playerStats = "no";

	var pointsInput = this.modelGamePointsRecording.value;

	var pointsRange = this.modelGamePointsInput.value;
	
	if(this.modelGamePointsInput.value == "custom")
		pointsRange = this.modelPointsCustom.value;
	else if(this.modelGamePointsInput.value == "range")
		pointsRange = this.modelPointsRangeMin.value + "-" + this.modelPointsRangeMax.value;
	else if(this.modelGamePointsInput.value == "range+")
		pointsRange = this.modelPointsRangeMin.value + "-" + this.modelPointsRangeMax.value + "-c";

	var allowSkip = this.modelGamePointsSkip.value;
	
	if(this.modelGameType == "single")
		allowSkip = "no";	

	var pointsLimit = this.modelGamePointsLimit.value;

	if(this.modelGamePointsLimit.value == "fixed")
		pointsLimit = this.modelPointsFixed.value;
	else if(this.modelGamePointsLimit.value == "fixed+")
		pointsLimit = this.modelPointsFixed.value + "+2";

	var gameWinner = this.modelGameWinnerLogic.value;

	var endResult = this.modelGameEndResult.value;
	
	if(this.modelGameType == "single")
		endResult = "points";
	
	var usePlaces = this.modelGameUsePlaces.value;

	var placesList = [];
	
	for(var i = 0; i < this.listModel.items.length; i++) {
		if(this.modelGameType == "single") {
			placesList.push({
				place: this.listModel.items[i].place, 
				rounds: "no", 
				target: this.listModel.items[i].target});
		}
		else {
			placesList.push({
				place: this.listModel.items[i].place, 
				rounds: this.listModel.items[i].rounds, 
				target: this.listModel.items[i].target});
		}
	}
			
	var config = {
		useRounds: useRounds, allowTeams: allowTeams, 
		playersLimit: playersLimit, teamsLimit: teamsLimit, playerStats: playerStats,
		pointsInput: pointsInput, pointsRange: pointsRange, allowSkip: allowSkip,
		pointsLimit: pointsLimit, gameWinner: gameWinner, endResult: endResult,
		usePlaces: usePlaces, placesList: placesList
	};

	this.config.games[gameName] = config;

this.controller.serviceRequest("palm://com.palm.db/", {
        method: "put",
        parameters: { "objects": [this.config] },
        onSuccess: function(e) 
        { 
           Mojo.Log.error("put success!");
           
           this.config._id = e.results[0].id;
           this.config._rev = e.results[0].rev;

          	this.controller.stageController.popScene();
        }.bind(this),
		onFailure: function(e) { Mojo.Log.error("put failure!");}
 });


}

WizardAssistant.prototype.handleCommand = function(event) {
  if(event.type == Mojo.Event.back) {
  		if(this.view == "tracks") {
  			event.stop();
  			
  			this.controller.get("stageT").hide();
  			this.controller.get("stage" + this.stage).show();
  			
  			this.view = "main";  			
  		}  
	}
	else if(event.type == Mojo.Event.command) {
		if(event.command == "prev") {
			if(this.stage == 1)
				return;

			this.controller.sceneScroller.mojo.revealTop(0);

			if(this.stage == 6)
				this.itemsCommandMenu[2].disabled = false;
			
			if(this.stage == 2)
				this.itemsCommandMenu[0].disabled = true;

			this.controller.modelChanged(this.modelCommandMenu, this);

			this.controller.get("stage" + this.stage).hide();
							
			this.stage--;
			
			this.controller.get("stage" + this.stage).show();

			this.controller.get("main-title").update("Rules of the game - (" + this.stage + "/6)");
		}
		else if(event.command == "next") {
			if(this.stage == 6)
				return;

		   this.controller.sceneScroller.mojo.revealTop(0);

			if(this.stage == 1)
				this.itemsCommandMenu[0].disabled = false;
			
			if(this.stage == 5)
				this.itemsCommandMenu[2].disabled = true;

			this.controller.modelChanged(this.modelCommandMenu, this);
							
			this.controller.get("stage" + this.stage).hide();
			
			this.stage++;

			this.controller.get("stage" + this.stage).show();

			this.controller.get("main-title").update("Rules of the game - (" + this.stage + "/6)");
		}
		else if(event.command == "done") {
			this.controller.get("main-title").update("Rules of the game - (" + this.stage + "/6)");

			this.controller.get("stageT").hide();

			this.controller.get("stage" + this.stage).show();

			this.modelCommandMenu.items[0] = {'label': $L("< Prev"), 'command': "prev", disabled: false};
			
			if(this.modelGameName.value.length > 0)
				this.modelCommandMenu.items[1] = {'label': $L("Save"), 'command': "save", disabled: false};
			else
				this.modelCommandMenu.items[1] = {'label': $L("Save"), 'command': "save", disabled: true};
							
			this.modelCommandMenu.items[2] = {'label': $L("Next >"), 'command': "next", disabled: true};
			
			this.controller.modelChanged(this.modelCommandMenu, this);

			var place = this.modelPlaceName.value;
			
			var rounds = 0;

			if(this.modelTrackRoundsLimit.value == "yes")
				rounds = this.modelTrackRoundsFixed.value;

			var target = 0;

			if(this.modelTrackUseResult.value == "yes")
				target = this.modelTrackIdealResult.value;

			if(this.trackIndex == undefined)
				this.listModel.items.push({place: place, rounds: rounds, target: target});
			else
				this.listModel.items.splice(this.trackIndex, 1, {place: place, rounds: rounds, target: target});

			this.controller.modelChanged(this.listModel, this);

			this.view = "main";
		}
		else if(event.command == "back") {
			this.controller.stageController.popScene();
		}		
		else if(event.command == "save") {
			var gameName = this.modelGameName.value;

			if((this.game) && (this.game == gameName)) {
				this.controller.showAlertDialog({
					title: "Save changes",
					message: "Save changes you made for this game?",
					choices: [{label: "Yes", value:"yes", type:"default"},{label: "No", value:"no", type:"default"},],
					preventCancel: true,
					allowHTMLMessage: true,
					onChoose: function(value) {
						if(value == "yes")
							this.saveGameConfig();
						else
							this.controller.stageController.popScene();
					}.bind(this)}); 		
			}
			else if(this.config.games[gameName] != undefined) {
				this.controller.showAlertDialog({
					title: "Game already exists",
					message: "Game with this name exists, do you want to override its settings?",
					choices: [{label: "Override", value:"override", type:"default"},{label: "Cancel", value:"cancel", type:"default"},],
					preventCancel: true,
					allowHTMLMessage: true,
					onChoose: function(value) {
						if(value == "override")
							this.saveGameConfig();
					}.bind(this)}); 			
			}
			else
				this.saveGameConfig();		
		}
	}

}

WizardAssistant.prototype.activate = function(event) {
	/* Put in event handlers here that should only be in effect when this scene is active. 
	 *	For  example, key handlers that are observing the document .
	 */
}
	
WizardAssistant.prototype.deactivate = function(event) {
	/* Remove any event handlers you added in activate and do any other cleanup that should 
	 * happen before this scene is popped or another scene is pushed on top. 
	 */
}

WizardAssistant.prototype.cleanup = function(event) {
	/* This function should do any cleanup needed before the scene is destroyed as a result
	 * of being popped off the scene stack.
	 */ 
}

