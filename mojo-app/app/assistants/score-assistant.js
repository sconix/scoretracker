/*
 *    ScoreAssistant - does something
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


function ScoreAssistant(config, game, index) {
	/* This is the creator function for your scene assistant object. It will be passed all the 
	 * additional parameters (after the scene name) that were passed to pushScene. The reference
	 * to the scene controller (this.controller) has not be established yet, so any initialization
	 * that needs the scene controller should be done in the setup function below. 
	 */
	 
	this.config = config;

	this.game = game;	 
	
	this.index = index;	

	this.pageIndex = 0;

	this.playerIndex = 0;
	
	this.roundIndex = 0;

	this.view = "normal";

	this.scores = this.config.scores[this.game][this.index];

	this.players = this.scores.players;

	if(this.scores.teams.length > 0)
		this.players = this.scores.teams;

	this.loopAllThrough = true;
}    

ScoreAssistant.prototype.setup = function() {
	/* This function is for setup tasks that have to happen when the scene is first created
	 * Use Mojo.View.render to render view templates and add them to the scene, if needed.
    * Setup widgets and add event handlers to listen to events from widgets here. 
    */

	this.modelAppMenu = {visible: true, items: [ 
		{label: $L("Add new player"), command: 'add'},
		{label: $L("Remove player"), command: 'remove'},
		{label: $L("Reset game"), command: 'reset'},
		{label: $L("New game"), command: 'new'},
		{label: $L("Help"), command: 'help'}]};
	
	
	this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true},
		this.modelAppMenu);


	if(this.scores.date.end == undefined) {
			this.itemsCommandMenu = [{items: [
					{'label': $L("<-"), 'command': "prev"},
					{'label': $L("New"), 'command': "new"},
					{'label': $L("....."), 'command': "menu"},
					{'label': $L("End"), 'command': "end"},
					{'label': $L("->"), 'command': "next"}]} ];
	}
	else {
		this.itemsCommandMenu = [{items: [
				{'label': $L("<-"), 'command': "prev"},
				{'label': $L("Normal"), 'command': "normal", width: 95},
				{'label': $L("Result"), 'command': "result", width: 95},
				{'label': $L("->"), 'command': "next"}], toggleCmd: "normal"} ];
	}	

	this.modelCommandMenu = {'visible': true, 'items': this.itemsCommandMenu};
			
	this.controller.setupWidget(Mojo.Menu.commandMenu, undefined, this.modelCommandMenu);	



	this.modelResultList = {items: []};

	this.controller.setupWidget('ResultList', {itemTemplate:'common/score-item', swipeToDelete: false},
		this.modelResultList);

	Mojo.Event.listen(this.controller.get('ResultList'), Mojo.Event.listTap, 
		this.handleRoundsListTap.bind(this));



	this.modelRoundsList = {items: []};

	this.controller.setupWidget('RoundsList', {itemTemplate:'common/round-item', swipeToDelete: false, 
		addItemLabel: "Show all rounds..."}, this.modelRoundsList);

	Mojo.Event.listen(this.controller.get('RoundsList'), Mojo.Event.listTap, 
		this.handleRoundsListTap.bind(this));

	Mojo.Event.listen(this.controller.get('RoundsList'), Mojo.Event.listAdd, 
		this.handleRoundsListAdd.bind(this));

	this.modelScoresList = {items: []};

	this.controller.setupWidget('ScoresList', {itemTemplate:'common/round-item', swipeToDelete: false},
		this.modelScoresList);

	Mojo.Event.listen(this.controller.get('ScoresList'), Mojo.Event.listTap, 
		this.handleRoundsListTap.bind(this));

	this.modelAdd0Button = {buttonClass: '', disabled: false};

	this.controller.setupWidget('Add0Button', 
		{label: $L("Skip")}, this.modelAdd0Button);
	
	Mojo.Event.listen(this.controller.get('Add0Button'), Mojo.Event.tap, 
		this.handleAddPointsButtonPress.bind(this, 0));

	this.modelAdd3Button = {buttonClass: '', disabled: false};

	this.controller.setupWidget('Add3Button', 
		{label: $L("3")}, this.modelAdd3Button);
	
	Mojo.Event.listen(this.controller.get('Add3Button'), Mojo.Event.tap, 
		this.handleAddPointsButtonPress.bind(this, 3));

	this.modelAdd4Button = {buttonClass: '', disabled: false};

	this.controller.setupWidget('Add4Button', 
		{label: $L("4")}, this.modelAdd4Button);
	
	Mojo.Event.listen(this.controller.get('Add4Button'), Mojo.Event.tap, 
		this.handleAddPointsButtonPress.bind(this, 4));

	this.modelAdd5Button = {buttonClass: '', disabled: false};

	this.controller.setupWidget('Add5Button', 
		{label: $L("5")}, this.modelAdd5Button);
	
	Mojo.Event.listen(this.controller.get('Add5Button'), Mojo.Event.tap, 
		this.handleAddPointsButtonPress.bind(this, 5));

	this.modelAdd6Button = {buttonClass: '', disabled: false};

	this.controller.setupWidget('Add6Button', 
		{label: $L("6")}, this.modelAdd6Button);
	
	Mojo.Event.listen(this.controller.get('Add6Button'), Mojo.Event.tap, 
		this.handleAddPointsButtonPress.bind(this, 6));

	this.modelAdd7Button = {buttonClass: '', disabled: false};

	this.controller.setupWidget('Add7Button', 
		{label: $L("7")}, this.modelAdd7Button);
	
	Mojo.Event.listen(this.controller.get('Add7Button'), Mojo.Event.tap, 
		this.handleAddPointsButtonPress.bind(this, 7));

	this.modelAdd8Button = {buttonClass: '', disabled: false};

	this.controller.setupWidget('Add8Button', 
		{label: $L("8")}, this.modelAdd8Button);
	
	Mojo.Event.listen(this.controller.get('Add8Button'), Mojo.Event.tap, 
		this.handleAddPointsButtonPress.bind(this, 8));

	this.modelAdd9Button = {buttonClass: '', disabled: false};

	this.controller.setupWidget('AddXButton', 
		{label: $L("Custom")}, this.modelAdd9Button);
	
	Mojo.Event.listen(this.controller.get('AddXButton'), Mojo.Event.tap, 
		this.handleAddPointsButtonPress.bind(this, "x"));

	this.modelNo1Button = {buttonClass: '', disabled: false};

	this.controller.setupWidget('No1Button', 
		{label: $L("1")}, this.modelNo1Button);
	
	Mojo.Event.listen(this.controller.get('No1Button'), Mojo.Event.tap, 
		this.handleAddNumberButtonPress.bind(this, 1));

	this.modelNo2Button = {buttonClass: '', disabled: false};

	this.controller.setupWidget('No2Button', 
		{label: $L("2")}, this.modelNo2Button);
	
	Mojo.Event.listen(this.controller.get('No2Button'), Mojo.Event.tap, 
		this.handleAddNumberButtonPress.bind(this, 2));

	this.modelNo3Button = {buttonClass: '', disabled: false};

	this.controller.setupWidget('No3Button', 
		{label: $L("3")}, this.modelNo3Button);
	
	Mojo.Event.listen(this.controller.get('No3Button'), Mojo.Event.tap, 
		this.handleAddNumberButtonPress.bind(this, 3));

	this.modelNo4Button = {buttonClass: '', disabled: false};

	this.controller.setupWidget('No4Button', 
		{label: $L("4")}, this.modelNo4Button);
	
	Mojo.Event.listen(this.controller.get('No4Button'), Mojo.Event.tap, 
		this.handleAddNumberButtonPress.bind(this, 4));

	this.modelNo5Button = {buttonClass: '', disabled: false};

	this.controller.setupWidget('No5Button', 
		{label: $L("5")}, this.modelNo5Button);
	
	Mojo.Event.listen(this.controller.get('No5Button'), Mojo.Event.tap, 
		this.handleAddNumberButtonPress.bind(this, 5));

	this.modelNo6Button = {buttonClass: '', disabled: false};

	this.controller.setupWidget('No6Button', 
		{label: $L("6")}, this.modelNo6Button);
	
	Mojo.Event.listen(this.controller.get('No6Button'), Mojo.Event.tap, 
		this.handleAddNumberButtonPress.bind(this, 6));

	this.modelNo7Button = {buttonClass: '', disabled: false};

	this.controller.setupWidget('No7Button', 
		{label: $L("7")}, this.modelNo7Button);
	
	Mojo.Event.listen(this.controller.get('No7Button'), Mojo.Event.tap, 
		this.handleAddNumberButtonPress.bind(this, 7));

	this.modelNo8Button = {buttonClass: '', disabled: false};

	this.controller.setupWidget('No8Button', 
		{label: $L("8")}, this.modelNo8Button);
	
	Mojo.Event.listen(this.controller.get('No8Button'), Mojo.Event.tap, 
		this.handleAddNumberButtonPress.bind(this, 8));

	this.modelNo9Button = {buttonClass: '', disabled: false};

	this.controller.setupWidget('No9Button', 
		{label: $L("9")}, this.modelNo9Button);
	
	Mojo.Event.listen(this.controller.get('No9Button'), Mojo.Event.tap, 
		this.handleAddNumberButtonPress.bind(this, 9));

	this.modelNo0Button = {buttonClass: '', disabled: false};

	this.controller.setupWidget('No0Button', 
		{label: $L("0")}, this.modelNo0Button);
	
	Mojo.Event.listen(this.controller.get('No0Button'), Mojo.Event.tap, 
		this.handleAddNumberButtonPress.bind(this, 0));

	this.modelNoCButton = {buttonClass: '', disabled: false};

	this.controller.setupWidget('NoCButton', 
		{label: $L("C")}, this.modelNoCButton);
	
	Mojo.Event.listen(this.controller.get('NoCButton'), Mojo.Event.tap, 
		this.handleAddNumberButtonPress.bind(this, "c"));

	this.modelNoDButton = {buttonClass: '', disabled: false};

	this.controller.setupWidget('NoDButton', 
		{label: $L("OK")}, this.modelNoDButton);
	
	Mojo.Event.listen(this.controller.get('NoDButton'), Mojo.Event.tap, 
		this.handleAddNumberButtonPress.bind(this, "d"));


	this.controller.get("player1-name").update(this.players[0]);
	this.controller.get("player2-name").update(this.players[0]);
	
	if(this.scores.teams.length > 1)
		this.controller.get("player2-name").update(this.players[1]);	


		this.updateScores();

}

ScoreAssistant.prototype.refreshScores = function(action) {
	if(action == "new") {
		this.scoring = true;
	
		this.updateRoundScores();		
	}
	else if(action == "score") {
		if(this.playerIndex == (this.players.length - 1)) {
			this.modelCommandMenu.visible = true;
			
			this.controller.modelChanged(this.modelCommandMenu, this);
		
			this.controller.get("input-score").hide();
			
			this.updateScores();

			this.scoring = false;
		}
		else {
			this.playerIndex++;

			this.controller.get("scores-title").update("Score for " + this.players[this.playerIndex]);

			 this.saveConfig();
		}
	}


}

ScoreAssistant.prototype.handleRoundsListAdd = function(event) {
			this.controller.get("round-scores").hide();
		this.controller.get("all-scores").show();	
}


ScoreAssistant.prototype.handleRoundsListTap = function(event) {
	if((this.scores.date.end != undefined) || (this.view == "total"))
		return;

	if(event.originalEvent.target.id == "player1-scores") {
		this.playerIndex = (this.pageIndex * 2);
		this.roundIndex = event.index;
	}
	else if(event.originalEvent.target.id == "player2-scores") {
		this.playerIndex = (this.pageIndex * 2) + 1;
		this.roundIndex = event.index;
		
		if(this.playerIndex == this.players.length)
			this.playerIndex = 0;
	}
	else if((event.originalEvent.target.id == "player-name") || 
		(event.originalEvent.target.id == "player-score"))
	{
		this.playerIndex = event.index;
	}	
	else
		return;
	
	this.modelCommandMenu.visible = false;
	
	this.controller.modelChanged(this.modelCommandMenu, this);
	
	this.controller.get("round-scores").hide();
	this.controller.get("all-scores").hide();
	this.controller.get("result-scores").hide();

	this.controller.get("input-score").show();
	
	this.loopAllThrough = false;
	
	this.controller.get("scores-title").update("Score for " + this.players[this.playerIndex]);
}

ScoreAssistant.prototype.handleAddNumberButtonPress = function(number) {
	if(number == "d") {
		this.controller.get("input-number").hide();
		this.controller.get("input-score").show();	
		
		this.handleAddPointsButtonPress(parseInt(this.number));
	}
	else if(number == "c") {
		this.number = this.number.toString().slice(0, -1);

		this.controller.get("number-title").update("Score for " + this.players[this.playerIndex] + ": " + this.number);
	}
	else {
		this.number = this.number + number;
		
		this.controller.get("number-title").update("Score for " + this.players[this.playerIndex] + ": " + this.number);
	}

}

ScoreAssistant.prototype.handleAddPointsButtonPress = function(points) {
	if(points == "x") {
		this.number = "";
	
		this.controller.get("input-score").hide();
		this.controller.get("input-number").show();	

		this.controller.get("number-title").update("Score for " + this.players[this.playerIndex] + ": ");	
	}
	else {
		if(this.scores.total[this.playerIndex] == undefined)
			this.scores.total[this.playerIndex] = 0;
	
		if(this.scores.rounds[this.roundIndex] == undefined)
			this.scores.rounds[this.roundIndex] = [];
	
		if(this.scores.rounds[this.roundIndex][this.playerIndex] == undefined)
			this.scores.rounds[this.roundIndex][this.playerIndex] = 0;

		this.scores.total[this.playerIndex] = this.scores.total[this.playerIndex] - this.scores.rounds[this.roundIndex][this.playerIndex] + points;
		this.scores.rounds[this.roundIndex][this.playerIndex] = points;		

		if((!this.loopAllThrough) || (this.playerIndex == (this.players.length - 1))) {
			this.modelCommandMenu.visible = true;
			
			this.controller.modelChanged(this.modelCommandMenu, this);
		
			this.controller.get("input-score").hide();
			
			this.updateScores();
			
			if(this.loopAllThrough) {
				var appController = Mojo.Controller.getAppController();
		
				 var stageController = appController.getStageController("dash");
			
				if(stageController)
					stageController.delegateToSceneAssistant("refreshScores", "score", this.playerIndex);
			}
			
			this.playerIndex = 0;
			
			this.scoring = false;
		}
		else {
			this.playerIndex++;		
		
			this.controller.get("scores-title").update("Score for " + this.players[this.playerIndex]);

			var appController = Mojo.Controller.getAppController();
		
		    var stageController = appController.getStageController("dash");
			
			if(stageController)
				stageController.delegateToSceneAssistant("refreshScores", "score", this.playerIndex);

		}
	}
}

ScoreAssistant.prototype.updateScores = function() {
	this.controller.get("player1-name").update(this.players[0 + (2*this.pageIndex)]);

	this.controller.get("player1-total").update(this.scores.total[0 + (2*this.pageIndex)]);
	
	if(((2*this.pageIndex) + 1) == this.players.length) {
		this.controller.get("player2-name").update(this.players[0]);

		this.controller.get("player2-total").update(this.scores.total[0]);
	}
	else {
		this.controller.get("player2-name").update(this.players[1 + (2*this.pageIndex)]);
	
		this.controller.get("player2-total").update(this.scores.total[1 + (2*this.pageIndex)]);
	}

	this.modelResultList.items.clear();		
	this.modelRoundsList.items.clear();
	this.modelScoresList.items.clear();

	if((this.view == "total") && (this.scores.date.end != undefined))
		this.controller.get("round-title").update("End Result Of The Game");
	else if((this.view == "total") && (this.scores.date.end == undefined))
		this.controller.get("round-title").update("Current Total Scores");
	else if(this.scores.date.end != undefined)
		this.controller.get("round-title").update("Results For Round " + (this.scores.rounds.length - this.roundIndex));
	else
		this.controller.get("round-title").update("Scores For Round " + (this.scores.rounds.length - this.roundIndex));

	for(var i = 0; i < this.players.length; i++) {
		if(this.view == "total")
			this.modelResultList.items.push({player: this.players[i], score: this.scores.total[i]});
		else if(this.view == "round")
			this.modelResultList.items.push({player: this.players[i], score: this.scores.rounds[this.roundIndex][i]});
	}
	
	for(var i = 0; i < this.scores.rounds.length; i++) {
		if(((2*this.pageIndex) + 1) == this.players.length) {
			this.modelRoundsList.items.push({player1: this.scores.rounds[i][0 + (2*this.pageIndex)], player2: this.scores.rounds[i][0], roundNo: this.scores.rounds.length - i});
			this.modelScoresList.items.push({player1: this.scores.rounds[i][0 + (2*this.pageIndex)], player2: this.scores.rounds[i][0], roundNo: this.scores.rounds.length - i});
		}
		else {
			this.modelRoundsList.items.push({player1: this.scores.rounds[i][0 + (2*this.pageIndex)], player2: this.scores.rounds[i][1 + (2*this.pageIndex)], roundNo: this.scores.rounds.length - i});
			this.modelScoresList.items.push({player1: this.scores.rounds[i][0 + (2*this.pageIndex)], player2: this.scores.rounds[i][1 + (2*this.pageIndex)], roundNo: this.scores.rounds.length - i});
		}
	}

	if(this.modelRoundsList.items.length > 3)
		this.modelRoundsList.items.splice(3);

	this.controller.modelChanged(this.modelResultList, this);
	this.controller.modelChanged(this.modelRoundsList, this);
	this.controller.modelChanged(this.modelScoresList, this);

	if(this.view == "normal") {
		if(this.scores.rounds.length <= 3) {
			this.controller.get("round-scores").hide();
			this.controller.get("all-scores").show();
		}
		else {				
			this.controller.get("all-scores").hide();
			this.controller.get("round-scores").show();
		}
	}
	else
		this.controller.get("result-scores").show();

	if(this.scores.date.end == undefined) {
		this.controller.serviceRequest("palm://com.palm.db/", {
        method: "put",
        parameters: { "objects": [this.config] },
        onSuccess: function(e) 
        { 
           this.config._id = e.results[0].id;
           this.config._rev = e.results[0].rev;

           Mojo.Log.error("put success!");
        }.bind(this),
        onFailure: function(e) { Mojo.Log.error("put failure!");}
 });
	}
}

ScoreAssistant.prototype.saveConfig = function() {
	this.controller.serviceRequest("palm://com.palm.db/", {
        method: "put",
        parameters: { "objects": [this.config] },
        onSuccess: function(e) 
        { 
           this.config._id = e.results[0].id;
           this.config._rev = e.results[0].rev;

           Mojo.Log.error("put success!");
        }.bind(this),
        onFailure: function(e) { Mojo.Log.error("put failure!");}
 });
}
ScoreAssistant.prototype.updateRoundScores = function() {
	this.loopAllThrough = true;

	this.modelCommandMenu.visible = false;
	
	this.controller.modelChanged(this.modelCommandMenu, this);
	
	this.controller.get("round-scores").hide();
	this.controller.get("all-scores").hide();
	this.controller.get("result-scores").hide();
	
	this.controller.get("input-score").show();
	
	this.playerIndex = 0;
	
	this.controller.get("scores-title").update("Score for " + this.players[this.playerIndex]);

	if(this.view == "total")
		this.view = "round";

	this.controller.get("round-title").update("Scores For Round " + (this.scores.rounds.length + 1));

	this.roundIndex = 0;
	this.scores.rounds.splice(0, 0, []);
}

ScoreAssistant.prototype.handleCommand = function(event) {
	if((event.type == Mojo.Event.back) && (this.scores.date.end == undefined)) {
		event.stop();

		if(this.scoring) {
			for(var i = 0; i < this.scores.rounds[0].length; i++)
				this.scores.total[i] = this.scores.total[i] - this.scores.rounds[0][i];
	
		 	this.scores.rounds.splice(0,1);
		 }
	 
	 
	 this.saveConfig();


		this.controller.stageController.popScenesTo("list");		
 
	}
	else if(event.type == Mojo.Event.command) {
		if(event.command == "normal") {
			this.view = "normal";
		
			this.controller.get("result-title").hide();		
			this.controller.get("result-scores").hide();		

			this.controller.get("normal-title").show();

			if(this.scores.rounds.length <= 3)
				this.controller.get("all-scores").show();
			else
				this.controller.get("round-scores").show();
		}
		else if(event.command == "result") {
			this.view = "total";
		
			this.controller.get("normal-title").hide();
			this.controller.get("all-scores").hide();
			this.controller.get("round-scores").hide();

			this.controller.get("result-title").show();		
			this.controller.get("result-scores").show();		

			this.updateScores();
		}
		else if(event.command == "next") {
			if(this.scores.date.end != undefined) {
				if(this.view == "normal")
					this.modelCommandMenu.items[0].toggleCmd = "normal";
				else
					this.modelCommandMenu.items[0].toggleCmd = "result";
			}

			this.controller.modelChanged(this.modelCommandMenu, this);

			if(this.view == "normal") {
				if(this.players.length > ((this.pageIndex + 1) * 2))
					this.pageIndex++;
				else
					this.pageIndex = 0;

				this.updateScores();
			}
			else if(this.view == "total") {
				this.view = "round";
				
				this.roundIndex = this.scores.rounds.length - 1;
				
				this.updateScores();
			}
			else if(this.view == "round") {
				this.roundIndex--;
				
				if(this.roundIndex == - 1) {
					this.view = "total";

					this.roundIndex = 0;
				}

				this.updateScores();
			}
		}
		else if(event.command == "prev") {
			if(this.scores.date.end != undefined) {
				if(this.view == "normal")
					this.modelCommandMenu.items[0].toggleCmd = "normal";
				else
					this.modelCommandMenu.items[0].toggleCmd = "result";
			}

			this.controller.modelChanged(this.modelCommandMenu, this);
						
			if(this.view == "normal") {
				if(this.pageIndex == 0)
					this.pageIndex = Math.ceil(this.players.length / 2) - 1;
				else
					this.pageIndex--;

				this.updateScores();
			}
			else if(this.view == "total") {
				this.view = "round";
				
				this.roundIndex = 0;
				
				this.updateScores();
			}
			else if(this.view == "round") {
				this.roundIndex++;
				
				if(this.roundIndex == this.scores.rounds.length) {
					this.view = "total";

					this.roundIndex = 0;
				}

				this.updateScores();
			}
		}
		else if(event.command == "menu") {
			var items = [];		

		if(this.scores.date.end == undefined) {
			var appController = Mojo.Controller.getAppController();
		
			var stageController = appController.getStageController("dash");

			if(stageController)
				items.push({label: $L('Dashboard Controls'), command: 'dashboard', chosen: true});
			else
				items.push({label: $L('Dashboard Controls'), command: 'dashboard', chosen: false});

			items.push({});
		}

		if(this.view == "normal") {
	    	items.push({label: $L('Use Normal View'), command: 'normal', chosen: true});
	 		items.push({label: $L('Use Result View'), command: 'result', chosen: false});
	 	}
	   else {
	    	items.push({label: $L('Use Normal View'), command: 'normal', chosen: false});
	 		items.push({label: $L('Use Result View'), command: 'result', chosen: true});
	 	}
	    
			this.controller.popupSubmenu({
            onChoose: function(value) {
            	if(value == "dashboard") {
            		var appController = Mojo.Controller.getAppController();
		
						var stageController = appController.getStageController("dash");

						if(stageController)
							appController.closeStage("dash");
						else {
							var dashScene = function(stageController) {
								stageController.pushScene("dash", this.scores, this.refreshScores.bind(this));
							};
				
							var stageArgs = {name: "dash", lightweight: false, clickableWhenLocked:true};
						
							appController.createStageWithCallback(stageArgs, 
								dashScene.bind(this), "dashboard");
						}            	
            	}
            	
            			else if(value == "normal") {
			this.view = "normal";
		
			this.controller.get("result-title").hide();		
			this.controller.get("result-scores").hide();		

			this.controller.get("normal-title").show();

			if(this.scores.rounds.length <= 3)
				this.controller.get("all-scores").show();
			else
				this.controller.get("round-scores").show();
		}
		else if(value == "result") {
			if(this.scores.rounds.length > 0)
				this.view = "round";
			else
				this.view = "total";
		
			this.controller.get("normal-title").hide();
			this.controller.get("all-scores").hide();
			this.controller.get("round-scores").hide();

			this.controller.get("result-title").show();		
			this.controller.get("result-scores").show();		

			this.updateScores();
		}
            }.bind(this),
				popupClass: "command-popup-menu",
/*				scrimClass: "popup-menu-scrim",*/
	/*			manualPlacement: true,*/
            items: items
            });
		
		}
		else if(event.command == "new") {
			this.scoring = true;

			this.updateRoundScores();
		
			var appController = Mojo.Controller.getAppController();
		
		    var stageController = appController.getStageController("dash");
			
			if(stageController)
				stageController.delegateToSceneAssistant("refreshScores", "round", 0);
		}
		else if(event.command == "end") {
				this.controller.showAlertDialog({
			title: $L("Game finished?"),
			message: "",
			choices:[{label:$L("Yes"), value:"yes", type:'affirmative'}, {label:$L("No"), value:"no", type:'default'}],
			preventCancel: true,
			allowHTMLMessage: true,
			onChoose: function(value) {
				if(value == "yes") {
					var date = new Date();
				
					this.scores.date.end = date.getTime();
					this.saveConfig();
				
					this.controller.stageController.popScenesTo("list");
				}
			}.bind(this)});
			}

		else if(event.command == "undo") {
			if(this.scores.rounds.length == 0)
				return;

			this.controller.showAlertDialog({
				title: $L("Undo last round?"),
				message: "",
				choices:[{label:$L("Yes"), value:"yes", type:'affirmative'}, {label:$L("No"), value:"no", type:'default'}],
				preventCancel: true,
				allowHTMLMessage: true,
				onChoose: function(value) {
					if(value == "yes") {
						this.scores.total[0] -= this.scores.rounds[0][0];
						this.scores.total[1] -= this.scores.rounds[0][1];

						this.scores.rounds.splice(0, 1);
			
						this.updateScores();
					}
				}.bind(this)}); 
		}
		else if(event.command == "clear") {
			if(this.scores.rounds.length == 0)
				return;
			
			this.controller.showAlertDialog({
				title: $L("Clear all scores?"),
				message: "",
				choices:[{label:$L("Yes"), value:"yes", type:'affirmative'}, {label:$L("No"), value:"no", type:'default'}],
				preventCancel: true,
				allowHTMLMessage: true,
				onChoose: function(value) {
					if(value == "yes") {
						this.scores.total = [0,0];

						this.scores.rounds.clear();
			
						this.updateScores();
					}
				}.bind(this)}); 
		}
	}
}

ScoreAssistant.prototype.sortByPlayedGames = function(a, b){
	if(a.timestamp == b.timestamp) {
		var c = a.totalGames;
		var d = b.totalGames;
	}
	else {
		var c = a.timestamp;
		var d = b.timestamp;
	}
	
	return ((c < d) ? -1 : ((c > d) ? 1 : 0));
}


ScoreAssistant.prototype.activate = function(event) {
	/* Put in event handlers here that should only be in effect when this scene is active. 
	 *	For  example, key handlers that are observing the document .
	 */
}
	
ScoreAssistant.prototype.deactivate = function(event) {
	/* Remove any event handlers you added in activate and do any other cleanup that should 
	 * happen before this scene is popped or another scene is pushed on top. 
	 */
}

ScoreAssistant.prototype.cleanup = function(event) {
	/* This function should do any cleanup needed before the scene is destroyed as a result
	 * of being popped off the scene stack.
	 */ 
	 
var appController = Mojo.Controller.getAppController();
			
			appController.closeStage("dash");
	 

}

