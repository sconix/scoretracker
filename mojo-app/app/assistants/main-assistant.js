/*
 *    MainAssistant - does something
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


function MainAssistant() {
	/* This is the creator function for your scene assistant object. It will be passed all the 
	 * additional parameters (after the scene name) that were passed to pushScene. The reference
	 * to the scene controller (this.controller) has not be established yet, so any initialization
	 * that needs the scene controller should be done in the setup function below. 
	 */

   this.config = {};

}    

MainAssistant.prototype.setup = function() {
	/* This function is for setup tasks that have to happen when the scene is first created
	 * Use Mojo.View.render to render view templates and add them to the scene, if needed.
    * Setup widgets and add event handlers to listen to events from widgets here. 
    */
	
  this.controller.get("version").innerHTML = "v" + Mojo.Controller.appInfo.version;


	this.modelAppMenu = {visible: true, items: [ 
		{label: $L("Import Game"), command: 'import'},
		{label: $L("Help"), command: 'help'}]};
	
	this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true},
		this.modelAppMenu);

	this.itemsCommandMenu = [{toggleCmd: "games", items:[
		{'label': $L("Games"), 'command': "games", width:105},
		{'label': $L("Players"), 'command': "players", width: 110},
		{'label': $L("Teams"), 'command': "teams", width: 105}]} ];

	this.modelCommandMenu = {'visible': true, 'items': this.itemsCommandMenu};
		
	this.controller.setupWidget(Mojo.Menu.commandMenu, null, this.modelCommandMenu);
	
	this.listModel = {items: [] ,disabled: true};

	this.controller.setupWidget('GamesList', {itemTemplate:'common/games-item', swipeToDelete: true, addItemLabel: "Create a new game..."},	this.listModel);

	Mojo.Event.listen(this.controller.get('GamesList'), Mojo.Event.listDelete, 
		this.handleRemoveGameFromList.bind(this));

	Mojo.Event.listen(this.controller.get('GamesList'), Mojo.Event.listTap, 
		this.handleViewGamesFromList.bind(this));

	Mojo.Event.listen(this.controller.get('GamesList'), Mojo.Event.listAdd, 
		this.handleAppendGamesToList.bind(this));

	this.modelPlayerName = {'value': "", 'disabled': false};
		   
	this.controller.setupWidget("AddPlayers", { 'hintText': $L("Type a name and press enter..."), 
		'multiline': false, 'requiresEnterKey': true, 'focus': true},
		this.modelPlayerName);

	Mojo.Event.listen(this.controller.get("AddPlayers"), Mojo.Event.propertyChange, 
		this.addPlayer.bind(this));

	this.modelPlayersList = {items: [] ,disabled: true};

	this.controller.setupWidget('PlayersList', {itemTemplate:'common/names-item', swipeToDelete: true},	this.modelPlayersList);

	Mojo.Event.listen(this.controller.get('PlayersList'), Mojo.Event.listDelete, 
		this.handleRemovePlayerFromList.bind(this));

	this.modelTeamName = {'value': "", 'disabled': false};
		   
	this.controller.setupWidget("AddTeams", { 'hintText': $L("Type a name and press enter..."), 
		'multiline': false, 'requiresEnterKey': true, 'focus': true},
		this.modelTeamName);

	Mojo.Event.listen(this.controller.get("AddTeams"), Mojo.Event.propertyChange, 
		this.addTeam.bind(this));

	this.modelTeamsList = {items: [] ,disabled: true};

	this.controller.setupWidget('TeamsList', {itemTemplate:'common/names-item', swipeToDelete: true},	this.modelTeamsList);

	Mojo.Event.listen(this.controller.get('TeamsList'), Mojo.Event.listDelete, 
		this.handleRemoveTeamFromList.bind(this));
}

MainAssistant.prototype.handleRemovePlayerFromList = function(event) {
	delete this.config.players[this.modelPlayersList.items[event.index].name];
	
	this.modelPlayersList.items.splice(event.index, 1);

	this.saveConfig();
}

MainAssistant.prototype.handleRemoveTeamFromList = function(event) {
	delete this.config.teams[this.modelTeamsList.items[event.index].name];
	
	this.modelTeamsList.items.splice(event.index, 1);
	
	this.saveConfig();
}

MainAssistant.prototype.addPlayer = function(event) {
	if(this.modelPlayerName.value.length > 0) {
		if(this.config.players[this.modelPlayerName.value] != undefined)
			return;

		this.config.players[this.modelPlayerName.value] = {};

		this.modelPlayersList.items.push({name: this.modelPlayerName.value, totalScore: 0});

		this.modelPlayersList.items.sort(this.sortAlphabetically);

		this.controller.modelChanged(this.modelPlayersList, this);

		this.modelPlayerName.value = "";
		
		this.controller.modelChanged(this.modelPlayerName, this);

		this.saveConfig();
	}
}

MainAssistant.prototype.addTeam = function(event) {
	if(this.modelTeamName.value.length > 0) {
		if(this.config.teams[this.modelTeamName.value] != undefined)
			return;

		this.config.teams[this.modelTeamName.value] = {};

		this.modelTeamsList.items.push({name: this.modelTeamName.value, totalScore: 0});

		this.modelTeamsList.items.sort(this.sortAlphabetically);

		this.controller.modelChanged(this.modelTeamsList, this);
		
		this.modelTeamName.value = "";
		
		this.controller.modelChanged(this.modelTeamName, this);

		this.saveConfig();
	}
}

MainAssistant.prototype.loadConfig = function() {
  var fquery = {"from":"org.e.lnx.wee.scoretracker:1"};


   this.controller.serviceRequest("palm://com.palm.db/", {
      method: "find",
      parameters: { "query": fquery },
      onSuccess: function(e) { 
      Mojo.Log.error("find success! ");
      	if(e.results.length > 0) {
    	
      	this.config = e.results[0];

			// SHOULD check for adding of useStats, statsList

/*
					this.config.prefs = {};
					this.config.scores = {};
					this.config.games = {"Frisbee Golf - Example": {"allowSkip":"yes","allowTeams":"no","endResult":"points","gameWinner":"least","placesList":[{"_id":"180cc","place":"Hiironen","rounds":18,"target":""},{"_id":"180cd","place":"Liminka","rounds":18,"target":""},{"_id":"180ce","place":"Meri-Toppila","rounds":18,"target":""}],"playerStats":"no","playersLimit":"variable","pointsInput":"round","pointsLimit":"none","pointsRange":"3-8-c","statsList":[],"teamsLimit":"variable","usePlaces":"places","useRounds":"rounds", "useStats":"none"}};
					this.config.players = {"Player1": {}, "Player2": {}, "Player3": {}, "Player4": {}};
					this.config.teams = {"Team1": {}, "Team2": {}, "Team3": {}, "Team4": {}};
				*/    			
      	
      	}
      	else {
				this.config = {
					_kind: "org.e.lnx.wee.scoretracker:1",
					prefs: {},
					scores: {},
					games: {"Frisbee Golf - Example": {"allowSkip":"yes","allowTeams":"no","endResult":"points","gameWinner":"least","placesList":[{"_id":"180cc","place":"Hiironen","rounds":18,"target":""},{"_id":"180cd","place":"Liminka","rounds":18,"target":""},{"_id":"180ce","place":"Meri-Toppila","rounds":18,"target":""}],"playerStats":"no","playersLimit":"variable","pointsInput":"round","pointsLimit":"none","pointsRange":"3-8-c","teamsLimit":"variable","usePlaces":"places","useRounds":"rounds"}},
					players: {"Player1": {}, "Player2": {}, "Player3": {}, "Player4": {}},
					teams: {"Team1": {}, "Team2": {}, "Team3": {}, "Team4": {}}
				};
				}
		
      

 this.controller.serviceRequest("palm://com.palm.db/", {
        method: "put",
        parameters: { "objects": [this.config] },
        onSuccess: function(e) 
        { 
           Mojo.Log.error("put success!");
           
           this.config._id = e.results[0].id;
           this.config._rev = e.results[0].rev;
        }.bind(this),
        onFailure: function(e) { Mojo.Log.error("put failure!");}
 });

      	

this.listModel.items.clear();

      	for(var key in this.config.games) {
      		if(this.config.scores[key] == undefined)
      			var total = 0;
      		else
      			var total = this.config.scores[key].length;
      	
				this.listModel.items.push({gameName: key, totalGames: total});
				}
			this.listModel.disabled = false;

      	this.controller.modelChanged(this.listModel, this);

this.modelPlayersList.items.clear();

      	for(var key in this.config.players) {
      		var total = 0;
      		
      		for(var game in this.config.scores) {
	      		for(var i = 0; i < this.config.scores[game].length;i++) {
	      			if(this.config.scores[game][i].players.indexOf(key) != -1)
	      				total++;
	      		}
	      	}
      	
				this.modelPlayersList.items.push({name: key, totalGames: total});
				}

		this.modelPlayersList.items.sort(this.sortAlphabetically);


      	this.controller.modelChanged(this.modelPlayersList, this);

this.modelTeamsList.items.clear();

      	for(var key in this.config.teams) {
      		var total = 0;
      		
      		for(var game in this.config.scores) {
	      		for(var i = 0; i < this.config.scores[game].length;i++) {
	      			if(this.config.scores[game][i].teams.indexOf(key) != -1)
	      				total++;
	      		}
	      	}

				this.modelTeamsList.items.push({name: key, totalGames: total});
				}
		this.modelTeamsList.items.sort(this.sortAlphabetically);

      	this.controller.modelChanged(this.modelTeamsList, this);

      }.bind(this),
      onFailure: function(e) { Mojo.Log.error("find failure!");}
   });
}

MainAssistant.prototype.saveConfig = function() {
 this.controller.serviceRequest("palm://com.palm.db/", {
        method: "put",
        parameters: { "objects": [this.config] },
        onSuccess: function(e) 
        { 
           Mojo.Log.error("put success!");
           
           this.config._id = e.results[0].id;
           this.config._rev = e.results[0].rev;
        }.bind(this),
        onFailure: function(e) { Mojo.Log.error("put failure!");}
 });
}

MainAssistant.prototype.handleAppendGamesToList = function(event) {
	
	this.controller.stageController.pushScene("wizard", this.config);
}

MainAssistant.prototype.handleRemoveGameFromList = function(event) {
	var gameName = this.listModel.items[event.index].gameName;

	delete this.config.games[gameName];

	this.controller.serviceRequest("palm://com.palm.db/", {
        method: "put",
        parameters: { "objects": [this.config] },
        onSuccess: function(e) 
        { 
           Mojo.Log.error("put success!");
           
           this.config._id = e.results[0].id;
           this.config._rev = e.results[0].rev;
        }.bind(this),
		onFailure: function(e) { Mojo.Log.error("put failure!");}
 });
}

MainAssistant.prototype.handleViewGamesFromList = function(event) {
	this.controller.stageController.pushScene("list", this.config, this.listModel.items[event.index].gameName);
}

MainAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		if(event.command == "games") {
			this.controller.get("players").hide();
			this.controller.get("teams").hide();
			this.controller.get("games").show();
		}
		else if(event.command == "players") {
			this.controller.get("games").hide();
			this.controller.get("teams").hide();
			this.controller.get("players").show();
		}
		else if(event.command == "teams") {
			this.controller.get("games").hide();
			this.controller.get("players").hide();
			this.controller.get("teams").show();
		}
		else if(event.command == "import") {
			this.controller.stageController.pushScene("gdm", "importGDoc", "Game Rules",
				"[STAPP] -", null, this.importGameRules.bind(this));
		}
	}		
}

MainAssistant.prototype.importGameRules = function(data){
	if((data.body.version != this.config.version) || 
		(data.body.game == undefined) || (data.body.rules == undefined))
	{
		this.controller.showAlertDialog({
			title: $L("Configuration Version Error"),
			message: "The version of the game rules that you are trying to import is not supported.",
			choices:[
			  {label:$L("Close"), value:"close", type:'default'}],
			preventCancel: true,
			allowHTMLMessage: true,
			onChoose: function(value) {
			}.bind(this)});
	}
	else {
		var gameName = data.body.game;
	
		if(this.config.games[data.body.game] != undefined)
			gameName = gameName + " (I)";
		
		this.config.games[gameName] = data.body.rules;

		this.listModel.items.clear();

      	for(var key in this.config.games) {
      		if(this.config.scores[key] == undefined)
      			var total = 0;
      		else
      			var total = this.config.scores[key].length;
      	
				this.listModel.items.push({gameName: key, totalGames: total});
				}
			this.listModel.disabled = false;

      	this.controller.modelChanged(this.listModel, this);

		
		this.saveConfig();
	}
}

MainAssistant.prototype.sortAlphabetically = function(a, b){
	var c = a.name.toLowerCase();
	var d = b.name.toLowerCase();

	return ((c < d) ? -1 : ((c > d) ? 1 : 0));
}

MainAssistant.prototype.activate = function(event) {
	/* Put in event handlers here that should only be in effect when this scene is active. 
	 *	For  example, key handlers that are observing the document .
	 */

	

	this.loadConfig();
}
	
MainAssistant.prototype.deactivate = function(event) {
	/* Remove any event handlers you added in activate and do any other cleanup that should 
	 * happen before this scene is popped or another scene is pushed on top. 
	 */
}

MainAssistant.prototype.cleanup = function(event) {
	/* This function should do any cleanup needed before the scene is destroyed as a result
	 * of being popped off the scene stack.
	 */ 
}

