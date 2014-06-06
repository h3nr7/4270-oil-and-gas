(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var settings = MKK.getNamespace('data').settings;
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;
	var AbContainer = MKK.getNamespace('app.scene').AbContainer;
	var ElSprite = ns.ElSprite;
	var ElRotatingSprite = ns.ElRotatingSprite;
	var scenedata = MKK.getNamespace('data').scenedata;

	if(!ns.ElHelicopter) {

		var ElHelicopter = function ElHelicopter(sFrame, duration, x, y) {

			this.name = name;
			this.element = [];
			this.container = new PIXI.DisplayObjectContainer();

			this.setup(sFrame, duration, x, y);

			this.z = scenedata.scene2.element.radar.z;
			this.container.position = this.cPos;


		}	

		ns.ElHelicopter = ElHelicopter;

		var p = ElHelicopter.prototype = new AbContainer();

		p.setup = function(sFrame, duration, x, y) {

			this._setup(sFrame, duration, x, y);

			this.sign = this.addSprite('helicopter-sign.png', 0, 30, 0, 0, 0, 0);
			this.addSprite('helicopter.png', 0,0,0, 0,0);

			this.blade = new ElRotatingSprite('helicopter_blade.png', 30, 30, 0, 2000, 0.5, 0.5);
			this.blade.start();
			this.container.addChild(this.blade.container);

		}

		p.open = function() {

		}

		p.addSprite = function(name, x, y, z, aX, aY) {
			var tmp = new ElSprite(name, x, y, z, aX, aY);
			this.element.push(tmp);
			this.container.addChild(tmp.container);
			return tmp;
		}

		p.showSign = function() {
			this.sign.show();
		}

		p.hideSign = function() {
			this.sign.hide();
		}

	}

})();
