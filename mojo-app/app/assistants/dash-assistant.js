
function DashAssistant(scores, refreshCallback) {
	this.scores = scores;
	
	this.refreshCallback = refreshCallback;

	this.roundIndex = 0;	

	this.playerIndex = 0;

	this.score = 0;
}

DashAssistant.prototype.setup = function() {
	if(this.scores.teams.length > 0)
		this.controller.get("player-name").update(this.scores.teams[this.playerIndex]);
	else	
		this.controller.get("player-name").update(this.scores.players[this.playerIndex]);

	this.controller.get("score").update("-");	
		
	Mojo.Event.listen(this.controller.get('new-round'), Mojo.Event.tap, 
		this.handleNewRound.bind(this));
			
	Mojo.Event.listen(this.controller.get('next'), Mojo.Event.tap, 
		this.handleNextScore.bind(this));

	Mojo.Event.listen(this.controller.get('prev'), Mojo.Event.tap, 
		this.handlePrevScore.bind(this));

	Mojo.Event.listen(this.controller.get('player-name'), Mojo.Event.tap, 
		this.handleTogglePlayer.bind(this));

}

DashAssistant.prototype.refreshScores = function(action, index) {
	if(action == "round") {
		this.roundIndex = index;
		this.playerIndex = 0;		

		this.controller.get('dash-actions').hide();
		this.controller.get('dash-controls').show();	
	}
	else if(action == "score") {
		var players = this.scores.players;

		if(this.scores.teams.length > 0)
			players = this.scores.teams;

		this.controller.get("score").update(this.scores.rounds[this.roundIndex][this.playerIndex]);	

		this.score = this.scores.rounds[this.roundIndex][this.playerIndex];

		if(this.playerIndex == (players.length - 1)) {
			this.controller.get('dash-controls').hide();	
			this.controller.get('dash-actions').show();

			this.playerIndex = 0;

			this.controller.get("player-name").update(players[this.playerIndex]);
		}
		else {
			this.playerIndex = index;
			
			this.controller.get("player-name").update(players[this.playerIndex]);
		}
	}
}

DashAssistant.prototype.handleNewRound = function(event) {
	this.controller.get('dash-actions').hide();
	this.controller.get('dash-controls').show();	

	this.roundIndex = 0;

	this.playerIndex = 0;

	this.refreshCallback("new");
}

DashAssistant.prototype.handleTogglePlayer = function(event) {
	if(this.scores.total[this.playerIndex] == undefined)
		this.scores.total[this.playerIndex] = 0;

	if(this.scores.rounds[this.roundIndex] == undefined)
		this.scores.rounds[this.roundIndex] = [];

	if(this.scores.rounds[this.roundIndex][this.playerIndex] == undefined)
		this.scores.rounds[this.roundIndex][this.playerIndex] = 0;

	this.scores.total[this.playerIndex] = this.scores.total[this.playerIndex] - this.scores.rounds[this.roundIndex][this.playerIndex] + this.score;
	this.scores.rounds[this.roundIndex][this.playerIndex] = this.score;		
	
	this.playerIndex++;

	if(this.scores.teams.length > 0)
		var players = this.scores.teams;
	else
		var players = this.scores.players;
		
	if(this.playerIndex == players.length) {
		this.playerIndex = 0;

		this.controller.get('dash-controls').hide();	
		this.controller.get('dash-actions').show();

		this.controller.get("player-name").update(players[this.playerIndex]);
	}
	else {
		this.controller.get("player-name").update(players[this.playerIndex]);
	}

	this.refreshCallback("score");
}

DashAssistant.prototype.handleNextScore = function(event) {
	this.score++;

	if((this.score) < 3)
		this.score = 3;

	if((this.score) == 9)
		this.score = 0;
	
	if(this.score == 0)	
		this.controller.get("score").update("-");	
	else
		this.controller.get("score").update(this.score);
}

DashAssistant.prototype.handlePrevScore = function(event) {
	this.score--;
	
	if((this.score) == -1)
		this.score = 8;
	
	if(this.score == 2)
		this.score = 0;
	
	if(this.score == 0)	
		this.controller.get("score").update("-");	
	else
		this.controller.get("score").update(this.score);
}


DashAssistant.prototype.activate = function(event) {
	/* Put in event handlers here that should only be in effect when this scene is active. 
	 *	For  example, key handlers that are observing the document .
	 */
}
	
DashAssistant.prototype.deactivate = function(event) {
	/* Remove any event handlers you added in activate and do any other cleanup that should 
	 * happen before this scene is popped or another scene is pushed on top. 
	 */
}

DashAssistant.prototype.cleanup = function(event) {
	/* This function should do any cleanup needed before the scene is destroyed as a result
	 * of being popped off the scene stack.
	 */ 
}
