/*
 *    ListAssistant - does something
*/


function ListAssistant(config, game) {
	/* This is the creator function for your scene assistant object. It will be passed all the 
	 * additional parameters (after the scene name) that were passed to pushScene. The reference
	 * to the scene controller (this.controller) has not be established yet, so any initialization
	 * that needs the scene controller should be done in the setup function below. 
	 */

	this.config = config;

	this.game = game;
	
	if(this.config.scores[this.game] == undefined)
		this.config.scores[this.game] = [];
}    

ListAssistant.prototype.setup = function() {
	/* This function is for setup tasks that have to happen when the scene is first created
	 * Use Mojo.View.render to render view templates and add them to the scene, if needed.
    * Setup widgets and add event handlers to listen to events from widgets here. 
    */
	
	
	
	this.modelAppMenu = {visible: true, items: [ 
		{label: $L("Edit or copy game"), command: 'edit'},
		{label: $L("Export game"), command: 'export'},
		{label: $L("Help"), command: 'help'}]};
	
	this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true},
		this.modelAppMenu);

	
	
	this.itemsCommandMenu = [
			{},
			{'label': $L("New Game"), 'command': "new", 'width': 150},
			{} ];

	this.modelCommandMenu = {'visible': true, 'items': this.itemsCommandMenu};
		
	this.controller.setupWidget(Mojo.Menu.commandMenu, null, this.modelCommandMenu);

	this.controller.get("GameName").update(this.game);

	this.listModel = {items: []};

	this.controller.setupWidget('ScoresList', {itemTemplate:'common/stats-item', swipeToDelete: true},	this.listModel);

	Mojo.Event.listen(this.controller.get('ScoresList'), Mojo.Event.listDelete, 
		this.handleRemoveScoresFromList.bind(this));

	Mojo.Event.listen(this.controller.get('ScoresList'), Mojo.Event.listTap, 
		this.handleViewScoresFromList.bind(this));
}

ListAssistant.prototype.handleRemoveScoresFromList = function(event) {
	this.config.scores[this.game].splice(event.index, 1);

	this.listModel.items.splice(event.index, 1);

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

ListAssistant.prototype.handleViewScoresFromList = function(event) {
	this.controller.stageController.pushScene("score", this.config, this.game, event.index);
}

ListAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		if(event.command == "new") {
			this.controller.stageController.pushScene("setup", this.config, this.game);		
		}
		else if(event.command == "edit") {
			this.controller.stageController.pushScene("wizard", this.config, this.game);
		}
		else if(event.command == "export") {
			var document = {version: this.config.version, game: this.game, rules: this.config.games[this.game]};
		
			this.controller.stageController.pushScene("gdm", "exportGDoc", "Game Rules", "[STAPP] -",
				{title: "Score Tracker - " + this.game, body: document}, null);
		}
	}
}

ListAssistant.prototype.activate = function(event) {
	/* Put in event handlers here that should only be in effect when this scene is active. 
	 *	For  example, key handlers that are observing the document .
	 */


	this.listModel.items.clear();

	for(var i = 0; i < this.config.scores[this.game].length; i++) {
		var participiants = 0;
		var playersTeams = "Players";

		participiants = this.config.scores[this.game][i].players.length;
	
		if(this.config.scores[this.game][i].teams.length > 0) {
			participiants = this.config.scores[this.game][i].teams.length;
			playersTeams = "Teams";
		}
	
	
	
		var date = new Date(this.config.scores[this.game][i].date.start);
		
		var dateStr = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();

		var info = dateStr + " - " + playersTeams + ": " + participiants + " - Place: ";
		
		if(this.config.scores[this.game][i].place.length > 0)
			info += this.config.scores[this.game][i].place;
		else
			info += "-";

		var winner = this.config.games[this.game].gameWinner;


		if(participiants == 1) {
					if(playersTeams == "Players")
				var name1 = this.config.scores[this.game][i].players[0];
		else
			var name1 = this.config.scores[this.game][i].teams[0];
			
			var scores1 = this.config.scores[this.game][i].total[0];

		if(this.config.scores[this.game][i].date.end == undefined)
			this.listModel.items.push({total: "Game is not finished yet", info: info});

		else			
			this.listModel.items.push({total: "Practising: &nbsp; <b>" + name1 + "</b> &nbsp; <b>(" + scores1 + ")</b>", info: info});
		} 
		else if(participiants == 2) {

			if(playersTeams == "Players") {
			var name1 = this.config.scores[this.game][i].players[0];
			var name2 = this.config.scores[this.game][i].players[1];
			}
			else {
			var name1 = this.config.scores[this.game][i].teams[0];
			var name2 = this.config.scores[this.game][i].teams[1];
			}
					
			var scores1 = this.config.scores[this.game][i].total[0];
			var scores2 = this.config.scores[this.game][i].total[1];
		
			if(this.config.scores[this.game][i].date.end == undefined)
			this.listModel.items.push({total: "Game is not finished yet", info: info});

			else if(((winner == "least") && (scores1 < scores2)) || ((winner == "most") && (scores1 > scores2)))
				this.listModel.items.push({total: "<b>" + name1 + "</b> vs " + name2 + " &nbsp; <b> (" + scores1 + " - " + scores2 + ")</b>", info: info});
			else if(((winner == "least") && (scores1 > scores2)) || ((winner == "most") && (scores1 < scores2)))
				this.listModel.items.push({total: name1 + " vs <b>" + name2 + "</b> &nbsp; <b> (" + scores1 + " - " + scores2 + ")</b>", info: info});
			else
				this.listModel.items.push({total: name1 + " vs " + name2 + " &nbsp; <b> (" + scores1 + " - " + scores2 + ")</b>", info: info});
		}
		else {
			var winnerIdx = 0;
			
			for(var j = 0; j < this.config.scores[this.game][i].total.length; j++) {
				if((winner == "most") && (this.config.scores[this.game][i].total[j] > this.config.scores[this.game][i].total[winnerIdx]))
					winnerIdx = j;

				if((winner == "least") && (this.config.scores[this.game][i].total[j] < this.config.scores[this.game][i].total[winnerIdx]))
					winnerIdx = j;
			}
		
			if(playersTeams == "Players")
			var name1 = this.config.scores[this.game][i].players[winnerIdx];
			else
			var name1 = this.config.scores[this.game][i].teams[winnerIdx];	
			
		if(this.config.scores[this.game][i].date.end == undefined)
			this.listModel.items.push({total: "Game is not finished yet", info: info});
		else
			this.listModel.items.push({total: "Game winner: &nbsp; <b>" + name1 + "</b> &nbsp;", info: info});
		}
	}
	
	this.controller.modelChanged(this.listModel, this);
}
	
ListAssistant.prototype.deactivate = function(event) {
	/* Remove any event handlers you added in activate and do any other cleanup that should 
	 * happen before this scene is popped or another scene is pushed on top. 
	 */
}

ListAssistant.prototype.cleanup = function(event) {
	/* This function should do any cleanup needed before the scene is destroyed as a result
	 * of being popped off the scene stack.
	 */ 
}

