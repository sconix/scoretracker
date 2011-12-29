/*
 *    SetupAssistant - does something
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


function SetupAssistant(config, game, index) {
	/* This is the creator function for your scene assistant object. It will be passed all the 
	 * additional parameters (after the scene name) that were passed to pushScene. The reference
	 * to the scene controller (this.controller) has not be established yet, so any initialization
	 * that needs the scene controller should be done in the setup function below. 
	 */
	 
	this.config = config;

	this.game = game;	 
	
	this.index = index;	

	var date = new Date();
	
	this.players = {mode: "variable", value: []};
	
	if(this.config.games[this.game].playersLimit != "variable") {
		if(this.config.games[this.game].playersLimit.split("-").length > 1) {
			this.players.mode = "range";
			
			this.players.value = this.config.games[this.game].playersLimit.split("-");
		}
		else {
			this.players.mode = "fixed";
			
			this.players.value.push(this.config.games[this.game].playersLimit)
			this.players.value.push(this.config.games[this.game].playersLimit)
		}
	}	

	this.teams = {mode: "variable", value: []};
	
	if(this.config.games[this.game].teamsLimit != "variable") {
		if(this.config.games[this.game].teamsLimit.split("-").length > 1) {
			this.teams.mode = "range";
			
			this.teams.value = this.config.games[this.game].teamsLimit.split("-");
		}
		else {
			this.teams.mode = "fixed";
			
			this.teams.value.push(this.config.games[this.game].teamsLimit);
			this.teams.value.push(this.config.games[this.game].teamsLimit);
		}
	}	
	
	this.teamPlayers = false;
}    

SetupAssistant.prototype.setup = function() {
	/* This function is for setup tasks that have to happen when the scene is first created
	 * Use Mojo.View.render to render view templates and add them to the scene, if needed.
    * Setup widgets and add event handlers to listen to events from widgets here. 
    */

		this.modelAppMenu = {visible: true, items: [ 
		{label: $L("Help"), command: 'help'}]};
	
	this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true},
		this.modelAppMenu);

	this.itemsCommandMenu = [
			{},
			{'label': $L("Start the Game"), 'command': "start", disabled: true},
			{} ];


	if(this.index == undefined)
		this.modelCommandMenu = {'visible': true, 'items': this.itemsCommandMenu};
	else	
		this.modelCommandMenu = {'visible': false, 'items': this.itemsCommandMenu};
			
	this.controller.setupWidget(Mojo.Menu.commandMenu, undefined, this.modelCommandMenu);	





	this.modelSelectedPlayers = {items: [] ,disabled: false};

	this.controller.setupWidget('SelectedPlayers', {itemTemplate: 'common/names-item', 
		swipeToDelete: false, autoconfirmDelete: true, reorderable: true}, this.modelSelectedPlayers);

	Mojo.Event.listen(this.controller.get('SelectedPlayers'), Mojo.Event.listReorder, 
		this.handleReorderPlayersList.bind(this));

	Mojo.Event.listen(this.controller.get('SelectedPlayers'), Mojo.Event.listTap, 
		this.handleRemovePlayerFromList.bind(this));

	this.modelActivePlayers = {items: [] ,disabled: false};

	this.controller.setupWidget('ActivePlayers', {itemTemplate:'common/names-item', swipeToDelete: false, 
		addItemLabel: "Show all players..."},	this.modelActivePlayers);

	Mojo.Event.listen(this.controller.get('ActivePlayers'), Mojo.Event.listTap, 
		this.handleAddPlayerFromList.bindAsEventListener(this, "active"));

	Mojo.Event.listen(this.controller.get('ActivePlayers'), Mojo.Event.listAdd, 
		this.handleShowAllPlayersList.bindAsEventListener(this));

//	Mojo.Event.listen(this.controller.get('ActiveAllPlayers'), Mojo.Event.listDelete, 
//		this.handleRemoveGameFromList.bind(this));

	this.modelAllThePlayers = {items: [], disabled: false};

	this.controller.setupWidget('AllThePlayers', {itemTemplate:'common/names-item', swipeToDelete: false},
		this.modelAllThePlayers);

	Mojo.Event.listen(this.controller.get('AllThePlayers'), Mojo.Event.listTap, 
		this.handleAddPlayerFromList.bindAsEventListener(this, "all"));

//	Mojo.Event.listen(this.controller.get('ActiveAllPlayers'), Mojo.Event.listDelete, 
//		this.handleRemoveGameFromList.bind(this));

	this.modelAddNewPlayer = {'value': "", 'disabled': false};
		   
	this.controller.setupWidget("AddNewPlayer", { 'hintText': $L("Type a name and press enter..."), 
		'multiline': false, 'requiresEnterKey': true, 'focus': false},
		this.modelAddNewPlayer);

	Mojo.Event.listen(this.controller.get("AddNewPlayer"), Mojo.Event.propertyChange, 
		this.addNewPlayer.bind(this));

//
// TEAMS
//

	this.modelSelectedTeams = {items: [] ,disabled: true};

	this.controller.setupWidget('SelectedTeams', {itemTemplate: 'common/names-item', 
		swipeToDelete: false, autoconfirmDelete: true, reorderable: true}, this.modelSelectedTeams);

	Mojo.Event.listen(this.controller.get('SelectedTeams'), Mojo.Event.listReorder, 
		this.handleReorderTeamsList.bind(this));

	Mojo.Event.listen(this.controller.get('SelectedTeams'), Mojo.Event.listTap, 
		this.handleRemoveTeamFromList.bind(this));

	this.modelActiveTeams = {items: [] ,disabled: true};

	this.controller.setupWidget('ActiveTeams', {itemTemplate:'common/names-item', swipeToDelete: false, 
		addItemLabel: "Show all teams..."},	this.modelActiveTeams);

	Mojo.Event.listen(this.controller.get('ActiveTeams'), Mojo.Event.listTap, 
		this.handleAddTeamFromList.bindAsEventListener(this, "active"));

	Mojo.Event.listen(this.controller.get('ActivePlayers'), Mojo.Event.listAdd, 
		this.handleShowAllTeamsList.bindAsEventListener(this));

	this.modelAllTheTeams = {items: [], disabled: true};

	this.controller.setupWidget('AllTheTeams', {itemTemplate:'common/names-item', swipeToDelete: false},
		this.modelAllTheTeams);

	Mojo.Event.listen(this.controller.get('AllTheTeams'), Mojo.Event.listTap, 
		this.handleAddTeamFromList.bindAsEventListener(this, "all"));

	this.modelAddNewTeam = {'value': "", 'disabled': false};
		   
	this.controller.setupWidget("AddNewTeam", { 'hintText': $L("Type a name and press enter..."), 
		'multiline': false, 'requiresEnterKey': true, 'focus': false},
		this.modelAddNewTeam);

	Mojo.Event.listen(this.controller.get("AddNewTeam"), Mojo.Event.propertyChange, 
		this.addNewTeam.bind(this));

//
// PlaceS
//

	this.modelSelectedPlace = {items: [], disabled: false};

	this.controller.setupWidget('SelectedPlace', {itemTemplate:'common/place-item', swipeToDelete: false},
		this.modelSelectedPlace);

	Mojo.Event.listen(this.controller.get('SelectedPlace'), Mojo.Event.listTap, 
		this.handleRemovePlaceFromList.bindAsEventListener(this));


	this.modelAllThePlaces = {items: [], disabled: false};

	this.controller.setupWidget('AllThePlaces', {itemTemplate:'common/place-item', swipeToDelete: false},
		this.modelAllThePlaces);

	Mojo.Event.listen(this.controller.get('AllThePlaces'), Mojo.Event.listTap, 
		this.handleSelectPlaceFromList.bindAsEventListener(this));

	this.modelAddNewPlace = {'value': "", 'disabled': false};
		   
	this.controller.setupWidget("AddNewPlace", { 'hintText': $L("Type a name and press enter..."), 
		'multiline': false, 'requiresEnterKey': true, 'focus': false},
		this.modelAddNewPlace);

	Mojo.Event.listen(this.controller.get("AddNewPlace"), Mojo.Event.propertyChange, 
		this.addNewPlace.bind(this));

//

	this.controller.setInitialFocusedElement(null);

	if(this.config.games[this.game].allowTeams == "no")
		this.setupPlayers();
	else if(this.config.games[this.game].allowTeams == "only")			
		this.setupTeams();	
	else {
		if(this.config.games[this.game].playerStats == "yes")	{
			var choices = [{label: "Yes, players in teams", value: "players", type: "default"}, 
				{label: "Yes, only teams", value: "teams", type: "default"},
				{label: "No", value: "no", type: "default"}];
		}
		else {
			var choices = [{label: "Yes", value: "teams", type: "default"},
				{label: "No", value: "no", type: "default"}];
		}
					
		this.controller.showAlertDialog({
			title: $L("Are You Playing In Teams?"),
			message: "",
			choices: choices,
			preventCancel: true,
			allowHTMLMessage: true,
			onChoose: function(value) {
				if(value != "no")
					this.setupTeams(value);
				else
					this.setupPlayers();
			}.bind(this)}); 
	}
}

SetupAssistant.prototype.setupPlayers = function(mode) {
	if(!mode) {
		if(this.players.mode == "variable")
			this.controller.get("SetupTitle").update("Select players");
		else if(this.players.mode == "fixed")	
			this.controller.get("SetupTitle").update("Select " + this.players.value[0] + " Players");
		else
			this.controller.get("SetupTitle").update("Select " + this.players.value[0] + " to " + this.players.value[1] + " Players");
	}
	else {
		if(this.players.mode == "variable")
			this.controller.get("SetupTitle").update("Select players for team");
		else if(this.players.mode == "fixed")	
			this.controller.get("SetupTitle").update("Select " + this.players.value[0] + " Players for team");
		else
			this.controller.get("SetupTitle").update("Select " + this.players.value[0] + " to " + this.players.value[1] + " Players for team");


		this.modelCommandMenu.items[1] = {'label': $L("Done"), 'command': "done", disabled: true};
		this.controller.modelChanged(this.modelCommandMenu, this);
	}
	
	this.controller.get("teams").hide();
	this.controller.get("players").show();

	this.modelActivePlayers.items.clear();
	this.modelAllThePlayers.items.clear();
	
		for(var key in this.config.players) {
			var total = 0;
			var timestamp = 0;
		
			for(var i = 0; i < this.config.scores[this.game].length;i++) {
				if(this.config.scores[this.game][i].players.indexOf(key) != -1) {
					total++;
					
					if(this.config.scores[this.game][i].date.start > timestamp)
						timestamp = this.config.scores[this.game][i].date.start;
				}
			}
	
			if(total > 0)
				this.modelActivePlayers.items.push({name: key, totalGames: total, timestamp: timestamp});

			this.modelAllThePlayers.items.push({name: key, totalGames: total});
		}

		this.modelActivePlayers.items.sort(this.sortByPlayedGames);
		this.modelAllThePlayers.items.sort(this.sortAlphabetically);
		
    	this.controller.modelChanged(this.modelActivePlayers, this);
	
     	this.controller.modelChanged(this.modelAllThePlayers, this);
	
		if(this.modelActivePlayers.items.length == 0) {
			this.controller.get("ActiveAllThePlayers").update("All The Players");		
		
			this.controller.get("ActivePlayersList").hide();
			this.controller.get("AllThePlayersList").show();
		}
}

SetupAssistant.prototype.setupTeams = function(mode) {
	if(mode == "players")
		this.teamPlayers = true;

	if(this.teams.mode == "variable")
		this.controller.get("SetupTitle").update("Select Teams");
	else if(this.teams.mode == "fixed")	
		this.controller.get("SetupTitle").update("Select " + this.teams.value[0] + " Teams");
	else
		this.controller.get("SetupTitle").update("Select " + this.teams.value[0] + " to " + this.teams.value[1] + " Teams");


	this.controller.get("players").hide();
	this.controller.get("teams").show();
	
	this.modelActiveTeams.items.clear();
	this.modelAllTheTeams.items.clear();
	
	
		for(var key in this.config.teams) {
			var total = 0;
			var timestamp = 0;
		
			for(var i = 0; i < this.config.scores[this.game].length;i++) {
				if(this.config.scores[this.game][i].teams.indexOf(key) != -1) {
					total++;
					
					if(this.config.scores[this.game][i].date.start > timestamp)
						timestamp = this.config.scores[this.game][i].date.start;
				}
			}
	
			if(total > 0)
				this.modelActiveTeams.items.push({name: key, totalGames: total, timestamp: timestamp});

			this.modelAllTheTeams.items.push({name: key, totalGames: total});
		}

		this.modelActiveTeams.items.sort(this.sortByPlayedGames);
		this.modelAllTheTeams.items.sort(this.sortAlphabetically);
		
    	this.controller.modelChanged(this.modelActiveTeams, this);
	
     	this.controller.modelChanged(this.modelAllTheTeams, this);
	
		if(this.modelActiveTeams.items.length == 0) {
			this.controller.get("ActiveAllTheTeams").update("All The Teams");		
		
			this.controller.get("ActiveTeamsList").hide();
			this.controller.get("AllTheTeamsList").show();
		}
}

SetupAssistant.prototype.setupPlaces = function() {
		this.controller.get("SetupTitle").update("Select Place / Place");
		
		this.controller.get("players").hide();
	this.controller.get("teams").hide();
	this.controller.get("places").show();			

			this.modelCommandMenu.items[1].disabled = true;
		  	this.controller.modelChanged(this.modelCommandMenu, this);	


		for(var i = 0; i < this.config.games[this.game].placesList.length; i++)
			this.modelAllThePlaces.items.push(this.config.games[this.game].placesList[i]);
	
		this.controller.modelChanged(this.modelAllThePlaces, this);
	
//		if(this.modelAllThePlaces.items.length == 0)
//			this.startGame();

}



SetupAssistant.prototype.startGame = function() {
	var date = new Date();

	var place = "";
	
	if(this.modelSelectedPlace.items.length == 1)
		place = this.modelSelectedPlace.items[0].place;

	var players = [];

	var teams = [];
	
	var total = [];

	if(this.modelSelectedTeams.items.length > 0) {
		for(var i = 0; i < this.modelSelectedTeams.items.length; i++) {
			teams.push(this.modelSelectedTeams.items[i].name);
			total.push(0);
			players = players.concat(this.modelSelectedTeams.items[i].players);
		}
	}
	else {
		for(var i = 0; i < this.modelSelectedPlayers.items.length; i++) {
			players.push(this.modelSelectedPlayers.items[i].name);
			total.push(0);
		}
	}

		this.config.scores[this.game].unshift({
			date: {start: date.getTime()},
			total: total,
			rounds: [],
			place: place,
			players: players,
			teams: teams
		});
		

		
		this.saveConfig();

		this.controller.stageController.pushScene("score", this.config, this.game, 0);
}

SetupAssistant.prototype.addNewPlayer = function() {
	if(this.modelAddNewPlayer.value.length == 0)
		return;

	if(this.players.mode != "variable") {
		if(this.modelSelectedPlayers.items.length >= this.players.value[1])
			return;
	}

	var playerName = this.modelAddNewPlayer.value;

	if(this.config.players[playerName] != undefined)
		return;
	
	this.modelAddNewPlayer.value = "";

  	this.controller.modelChanged(this.modelAddNewPlayer, this);			

	this.modelSelectedPlayers.items.push({name: playerName, totalGames: 0});

  	this.controller.modelChanged(this.modelSelectedPlayers, this);	

	this.config.players[playerName] = {};
	
	if(this.players.mode != "variable") {
		if(this.modelSelectedPlayers.items.length >= this.players.value[0]) {
			this.modelCommandMenu.items[1].disabled = false;
		  	this.controller.modelChanged(this.modelCommandMenu, this);	
		}
	}
	else {
		this.modelCommandMenu.items[1].disabled = false;
	  	this.controller.modelChanged(this.modelCommandMenu, this);	
	}

	
	this.saveConfig();
}

SetupAssistant.prototype.handleShowAllPlayersList = function(event) {
	this.controller.get("ActiveAllThePlayers").update("All The Players");		

	this.controller.get("ActivePlayersList").hide();
	this.controller.get("AllThePlayersList").show();
}

SetupAssistant.prototype.handleReorderPlayersList = function(event) {
	var item = this.modelSelectedPlayers.items[event.fromIndex];

	this.modelSelectedPlayers.items.splice(event.fromIndex, 1);
	this.modelSelectedPlayers.items.splice(event.toIndex, 0, item);
}

SetupAssistant.prototype.handleAddPlayerFromList = function(event, list) {
	if(this.players.mode != "variable") {
		if(this.modelSelectedPlayers.items.length == this.players.value[1])
			return;
	}

	if(list == "active") {
		this.modelSelectedPlayers.items.push(this.modelActivePlayers.items.splice(event.index, 1)[0]);
	
     	this.controller.modelChanged(this.modelActivePlayers, this);
	}
	else {
		this.modelSelectedPlayers.items.push(this.modelAllThePlayers.items.splice(event.index, 1)[0]);

     	this.controller.modelChanged(this.modelAllThePlayers, this);	
	}

  	this.controller.modelChanged(this.modelSelectedPlayers, this);	

	if(this.players.mode != "variable") {
		if(this.modelSelectedPlayers.items.length >= this.players.value[0]) {
			this.modelCommandMenu.items[1].disabled = false;
		  	this.controller.modelChanged(this.modelCommandMenu, this);	
		}
	}
	else {
		this.modelCommandMenu.items[1].disabled = false;
	  	this.controller.modelChanged(this.modelCommandMenu, this);	
	}
}

SetupAssistant.prototype.handleRemovePlayerFromList = function(event) {
	var item = 	this.modelSelectedPlayers.items.splice(event.index, 1)[0];
	
	if(item.totalGames > 0) {
		this.modelActivePlayers.items.push(item);

		this.modelActivePlayers.items.sort(this.sortByPlayedGames);

	  	this.controller.modelChanged(this.modelActivePlayers, this);	
  	}
  	
	this.modelAllThePlayers.items.push(item);

	this.modelAllThePlayers.items.sort(this.sortAlphabetically);

  	this.controller.modelChanged(this.modelAllThePlayers, this);	  	

  	this.controller.modelChanged(this.modelSelectedPlayers, this);	

	if(this.players.mode != "variable") {
		if(this.modelSelectedPlayers.items.length < this.players.value[0]) {
			this.modelCommandMenu.items[1].disabled = true;
		  	this.controller.modelChanged(this.modelCommandMenu, this);	
		}
	}
	else if(this.modelSelectedPlayers.items.length == 0) {
			this.modelCommandMenu.items[1].disabled = true;
		  	this.controller.modelChanged(this.modelCommandMenu, this);	
	}
}

SetupAssistant.prototype.addNewTeam = function() {
	if(this.modelAddNewTeam.value.length == 0)
		return;

	if(this.teams.mode != "variable") {
		if(this.modelSelectedTeams.items.length >= this.teams.value[1])
			return;
	}


	var teamName = this.modelAddNewTeam.value;

	if(this.config.teams[teamName] != undefined)
		return;
	
	this.modelAddNewTeam.value = "";

  	this.controller.modelChanged(this.modelAddNewTeam, this);			

	this.modelSelectedTeams.items.push({name: teamName, totalGames: 0});

  	this.controller.modelChanged(this.modelSelectedTeams, this);	

	this.config.teams[teamName] = {};
	
		if(this.teams.mode != "variable") {
		if(this.modelSelectedTeams.items.length >= this.teams.value[0]) {
			this.modelCommandMenu.items[1].disabled = false;
		  	this.controller.modelChanged(this.modelCommandMenu, this);	
		}
	}
	else {
		this.modelCommandMenu.items[1].disabled = false;
	  	this.controller.modelChanged(this.modelCommandMenu, this);	
	}

	
	if(this.teamPlayers)
		this.setupPlayers("team");
	else	
		this.saveConfig();
}

SetupAssistant.prototype.handleShowAllTeamsList = function(event) {
	this.controller.get("ActiveAllTheTeams").update("All The Teams");		


	this.controller.get("ActiveTeamsList").hide();
	this.controller.get("AllTheTeamsList").show();
}


SetupAssistant.prototype.handleReorderTeamsList = function(event) {
	var item = this.modelSelectedTeams.items[event.fromIndex];

	this.modelSelectedTeams.items.splice(event.fromIndex, 1);
	this.modelSelectedTeams.items.splice(event.toIndex, 0, item);
}

SetupAssistant.prototype.handleAddTeamFromList = function(event, list) {
	if(this.teams.mode != "variable") {
		if(this.modelSelectedTeams.items.length == this.teams.value[1])
			return;
	}
	
	if(list == "active") {
		this.modelSelectedTeams.items.push(this.modelActiveTeams.items.splice(event.index, 1)[0]);
	
     	this.controller.modelChanged(this.modelActiveTeams, this);
	}
	else {
		this.modelSelectedTeams.items.push(this.modelAllTheTeams.items.splice(event.index, 1)[0]);

     	this.controller.modelChanged(this.modelAllTheTeams, this);	
	}

  	this.controller.modelChanged(this.modelSelectedTeams, this);	

	if(this.teams.mode != "variable") {
		if(this.modelSelectedTeams.items.length >= this.teams.value[0]) {
			this.modelCommandMenu.items[1].disabled = false;
		  	this.controller.modelChanged(this.modelCommandMenu, this);	
		}
	}
	else {
		this.modelCommandMenu.items[1].disabled = false;
	  	this.controller.modelChanged(this.modelCommandMenu, this);	
	}

	if(this.teamPlayers)
		this.setupPlayers("team");
}

SetupAssistant.prototype.handleRemoveTeamFromList = function(event) {
	var item = this.modelSelectedTeams.items.splice(event.index, 1)[0];
	
	if(item.totalGames > 0) {
		this.modelActiveTeams.items.push(item);

		this.modelActiveTeams.items.sort(this.sortByPlayedGames);

	  	this.controller.modelChanged(this.modelActiveTeams, this);	
  	}
  	
	this.modelAllTheTeams.items.push(item);

	this.modelAllTheTeams.items.sort(this.sortAlphabetically);

  	this.controller.modelChanged(this.modelAllTheTeams, this);	  	

  	this.controller.modelChanged(this.modelSelectedTeams, this);	

	if(this.teams.mode != "variable") {
		if(this.modelSelectedTeams.items.length < this.teams.value[0]) {
			this.modelCommandMenu.items[1].disabled = true;
		  	this.controller.modelChanged(this.modelCommandMenu, this);	
		}
	}
	else if(this.modelSelectedTeams.items.length == 0) {
			this.modelCommandMenu.items[1].disabled = true;
		  	this.controller.modelChanged(this.modelCommandMenu, this);	
	}
}

SetupAssistant.prototype.addNewPlace = function() {
	if(this.modelAddNewPlace.value.length == 0)
		return;

	if(this.modelSelectedPlace.items.length == 1)
		return;

	var placeName = this.modelAddNewPlace.value;

	if(this.config.games[this.game].placesList.indexOf(placeName) != -1)
		return;
	
	this.modelAddNewPlace.value = "";

  	this.controller.modelChanged(this.modelAddNewPlace, this);			

	this.modelSelectedPlace.items.push({place: placeName, rounds: 0, target: 0});

  	this.controller.modelChanged(this.modelSelectedPlace, this);	

	this.config.games[this.game].placesList.push({place: placeName, rounds: 0, target: 0});

			this.modelCommandMenu.items[1].disabled = false;
		  	this.controller.modelChanged(this.modelCommandMenu, this);	

	
	this.saveConfig();
}


SetupAssistant.prototype.handleSelectPlaceFromList = function(event) {
	if(this.modelSelectedPlace.items.length == 1)
		return;

	this.modelSelectedPlace.items.push(this.modelAllThePlaces.items[event.index]);

	this.controller.modelChanged(this.modelSelectedPlace, this);

			this.modelCommandMenu.items[1].disabled = false;
		  	this.controller.modelChanged(this.modelCommandMenu, this);	

}

SetupAssistant.prototype.handleRemovePlaceFromList = function(event) {
	this.modelSelectedPlace.items.clear();
	
	this.controller.modelChanged(this.modelSelectedPlace, this);


			this.modelCommandMenu.items[1].disabled = true;
		  	this.controller.modelChanged(this.modelCommandMenu, this);	

}



SetupAssistant.prototype.handleCommand = function(event) {
	if((event.type == Mojo.Event.back) && (this.index == undefined)) {
	}
	else if(event.type == Mojo.Event.command) {
		if(event.command == "start") {
			if((this.config.games[this.game].usePlaces != "places") ||
				(this.modelSelectedPlace.items.length == 1))
			{
				this.startGame();
			}
			else
				this.setupPlaces();
		}
		else if(event.command == "done") {
			this.controller.get("players").hide();
			this.controller.get("teams").show();

	if(this.teams.mode == "variable")
		this.controller.get("SetupTitle").update("Select Teams");
	else if(this.teams.mode == "fixed")	
		this.controller.get("SetupTitle").update("Select " + this.teams.value[0] + " Teams");
	else
		this.controller.get("SetupTitle").update("Select " + this.teams.value[0] + " to " + this.teams.value[1] + " Teams");

			
			this.modelSelectedTeams.items[this.modelSelectedTeams.items.length - 1].players = this.modelSelectedPlayers.items.splice(0);
			
			this.controller.modelChanged(this.modelSelectedPlayers, this);
			
			if(this.teams.mode != "variable") {
				if(this.modelSelectedTeams.items.length < this.teams.value[0]) {
					this.modelCommandMenu.items[1] = {'label': $L("Start the Game"), 'command': "start", disabled: true};
				}
				else
					this.modelCommandMenu.items[1] = {'label': $L("Start the Game"), 'command': "start", disabled: false};				
			}
			else if(this.modelSelectedTeams.items.length == 0) {
				this.modelCommandMenu.items[1] = {'label': $L("Start the Game"), 'command': "start", disabled: true};
			}
			else {
				this.modelCommandMenu.items[1] = {'label': $L("Start the Game"), 'command': "start", disabled: false};
			}
			
			this.controller.modelChanged(this.modelCommandMenu, this);
		}
	}
}

SetupAssistant.prototype.saveConfig = function() {
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

SetupAssistant.prototype.sortByPlayedGames = function(a, b){
	if(a.timestamp == b.timestamp) {
		var c = a.totalGames;
		var d = b.totalGames;
	}
	else {
		var c = a.timestamp;
		var d = b.timestamp;
	}

	return ((c > d) ? -1 : ((c < d) ? 1 : 0));
}

SetupAssistant.prototype.sortAlphabetically = function(a, b){
	var c = a.name.toLowerCase();
	var d = b.name.toLowerCase();

	return ((c < d) ? -1 : ((c > d) ? 1 : 0));
}

SetupAssistant.prototype.activate = function(event) {
	/* Put in event handlers here that should only be in effect when this scene is active. 
	 *	For  example, key handlers that are observing the document .
	 */
}
	
SetupAssistant.prototype.deactivate = function(event) {
	/* Remove any event handlers you added in activate and do any other cleanup that should 
	 * happen before this scene is popped or another scene is pushed on top. 
	 */
}

SetupAssistant.prototype.cleanup = function(event) {
	/* This function should do any cleanup needed before the scene is destroyed as a result
	 * of being popped off the scene stack.
	 */ 
}

