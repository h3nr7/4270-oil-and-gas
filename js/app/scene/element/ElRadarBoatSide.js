(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var settings = MKK.getNamespace('data').settings;
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;
	var AbContainer = MKK.getNamespace('app.scene').AbContainer;
	var ElSprite = ns.ElSprite;
	var ElRotatingSprite = ns.ElRotatingSprite;
	var scenedata = MKK.getNamespace('data').scenedata;

	if(!ns.ElRadarBoatSide) {

		var ElRadarBoatSide = function ElRadarBoatSide(sFrame, duration, x, y, z) {

			this.name = name;
			this.element = [];
			this.container = new PIXI.DisplayObjectContainer();

			this.setup(sFrame, duration, x, y);

			this.z = z
			this.container.position = this.cPos;


		}	

		ns.ElRadarBoatSide = ElRadarBoatSide;

		var p = ElRadarBoatSide.prototype = new AbContainer();

		p.setup = function(sFrame, duration, x, y) {

			this._setup(sFrame, duration, x, y);

			this.addSprite('radar_boat_small_02.png', 298, 102, 0, 0, 0);
			this.addSprite('radar_boat_small_01.png', 0, 0, 0, 0, 0);

							

		}

		p.open = function() {

		}

		p.addSprite = function(name, x, y, z, aX, aY) {
			var tmp = new ElSprite(name, x, y, z, aX, aY);
			this.element.push(tmp);
			this.container.addChild(tmp.container);
		}

		p.update = function(frame) {
			this._update(frame);
			var cFrame = this.localCurFrame(frame);
		}

	}

})();
