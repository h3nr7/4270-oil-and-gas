(function(){

	var ns = MKK.getNamespace('app.scene');
	var AbContainer = ns.AbContainer;
	var AbLevel = ns.AbLevel;
	var settings = MKK.getNamespace('data').settings;

	if(!ns.AbScene) {

		var AbScene = function AbScene(width, height) {

			this.width = width?width:settings.defaultWidth;
			this.height = height?height:settings.defaultHeight;

			this.stage = null;
			this.container = null;
			this.element = [];
			this.level = [];

		}


		ns.AbScene = AbScene;

		var p = AbScene.prototype = new AbContainer();



		p.init = function(stage) {

			this._init();
			this.stage = stage;
			this.stage.addChild(this.container);

			this.open();
		}

		p.open = function() {
			
		}



		p.update = function() {
			this._update();
		}


		// -----------------------------------------------------------
		// LEVEL in SCENE
		// -----------------------------------------------------------

		p.addLevel = function(oLevel) {
			this.container.addChild(oLevel.container);
			this.level.push(oLevel);
		}

		p.removeLevel = function(oLevel) {
			var index = this.level.indexOf(oLevel);
			if( index > -1 ) {
				this.container.removeChild(oLevel.container);
				this.oLevel.splice(index,1);
			}
		}



	}



})();