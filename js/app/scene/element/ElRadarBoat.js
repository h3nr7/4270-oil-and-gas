(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var settings = MKK.getNamespace('data').settings;
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;
	var AbContainer = MKK.getNamespace('app.scene').AbContainer;
	var ElSprite = ns.ElSprite;
	var ElRotatingSprite = ns.ElRotatingSprite;
	var scenedata = MKK.getNamespace('data').scenedata;

	if(!ns.ElRadarBoat) {

		var ElRadarBoat = function ElRadarBoat(sFrame, duration, x, y, z) {

			this.name = name;
			this.element = [];
			this._showTop = false;
			this.container = new PIXI.DisplayObjectContainer();
			this.fan = [];
			this.setup(sFrame, duration, x, y);

			this.z = z
			this.container.position = this.cPos;


		}	

		ns.ElRadarBoat = ElRadarBoat;

		var p = ElRadarBoat.prototype = new AbContainer();

		p.setup = function(sFrame, duration, x, y) {

			this._setup(sFrame, duration, x, y);

			this.part0 = this.addSprite('radar_boat1_01.png', 0, 0, 0, 0.5, 0);
			this.part1 = this.addSprite('radar_boat1_02.png', 0, 342, 0, 0.5, 0);
			this.part3 = this.addSprite('radar_boat1_03.png', 0, 668, 0, 0.5, 0);
			this.part2 = this.addSprite('radar_boat1_04.png', 0, 869, 0, 0.5, 0);

			this.addFan(250, 1035, 0, 1000);
			this.addFan(-250, 1035, 0, 1000);

			this.hideTop();


		}

		p.open = function() {

		}

		p.showTop = function() {
			this.part0.show();
			this.part1.show();
			this.part2.show();
			this._showTop = true;
		}

		p.hideTop = function() {
			this.part0.hide();		
			this.part1.hide();
			this.part3.hide();
			this._showTop = false;
		}

		p.addSprite = function(name, x, y, z, aX, aY) {
			var tmp = new ElSprite(name, x, y, z, aX, aY);
			this.element.push(tmp);
			this.container.addChild(tmp.container);
			return tmp;
		}

		p.addFan = function(x, y, z, velo) {
			var tmp = new ElRotatingSprite('radar_boat1_propeller.png', x, y, z, velo, 0.5, 0.5);
			tmp.start();
			this.fan.push(tmp);
			this.container.addChild(tmp.container);
		}

		p.update = function(frame) {
			this._update(frame);
			var cFrame = this.localCurFrame(frame);
		}

	}

})();
