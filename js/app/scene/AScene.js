(function(){

	var ns = MKK.getNamespace('app.scene');
	var EventDispatcher = MKK.getNamespace('mkk.event').EventDispatcher;

	if (!ns.AScene) {

		var AScene = function AScene() {
			this.container = null;
			this.curFrame = 0;
			this.startFrame = 0;
			this.totFrame = 1000;

		}

		ns.AScene = AScene;

		var p = AScene.prototype = new EventDispatcher();
		var s = EventDispatcher.prototype;

		p.preSetup = function(stage) {
			this.container = new PIXI.DisplayObjectContainer();
			this.container.position.x = 0;
			this.container.position.y = 0;
			stage.addChild(this.container);

		}

		p.init = function() {

		}

		p.destroy = function() {

		}

		p.createLevel = function() {

			var level = new PIXI.DisplayObjectContainer();
			level.x = 0;
			level.y = 0;

			return level;
		}

		p.add = function() {
			//add all display object to scene
		}

		p.remove = function() {
			//removes everything within the container
			this.container.removeAll();			
		}

		p.preUpdate = function(frame) {
			this.curFrame = frame - this.startFrame;
		}
		
		p.render = function() {

		}



	}



})();