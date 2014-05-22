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
			// this.container = null;
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
			this.__update();
		}

		p.__update = function() {
			this._update();
		}


		// -----------------------------------------------------------
		// LEVEL in SCENE
		// -----------------------------------------------------------

		//sectioning within the scene
		p.createSection = function(startTime, endTime, callback) {

		}

		//create the levels
		p.createLevels = function(arr, levelClass) {
			var aLen = arr.length;
			for(var i=0; i<aLen; i++) {
				var tmp = new levelClass(arr[i].name);
				tmp.setup(arr[i].x, arr[i].y, arr[i].z);
				console.log('lala1')
				this.addLevel(tmp);
			}
		}

		// p.createElements = function(arr) {
		// 	var aLen = arr.length;
		// 	for(var i=0; i<aLen; i++) {
				
		// 	}
		// }

		p.addLevel = function(oLevel) {
			console.log(oLevel.container)
			this.container.addChild(oLevel.container);
			this.level.push(oLevel);
		}

		p.removeLevel = function(oLevel) {
			var index = this.level.indexOf(oLevel);
			if( index > -1 ) {
				this.container.removeChild(oLevel.container);
				this.level.splice(index,1);
			}
		}



	}



})();