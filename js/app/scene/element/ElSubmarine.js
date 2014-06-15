(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var settings = MKK.getNamespace('data').settings;
	var ElSprite = ns.ElSprite;
	var AbContainer = MKK.getNamespace('app.scene').AbContainer;
	var MathBase = MKK.getNamespace('mkk.math').MathBase;

	if(!ns.ElSubmarine) {

		var ElSubmarine = function ElSubmarine(startFrame, duration, x, y, z) {

			this.name = name;
			this.holeName = "oilrig-drill-hole.png";
			this.z = z;
			this.element = [];
			// this.container.position = this.cPos;
			this.setup(startFrame, duration, x, y);

	


		}	

		ns.ElSubmarine = ElSubmarine;

		var p = ElSubmarine.prototype = new AbContainer();

		p.setup = function(sFrame, duration, x, y) {

			this._setup(sFrame, duration, x, y);

			this.light = this.addSprite('yellow_sub-light.png', 50,224,0, 0.5,0);
			this.addSprite('yellow_sub.png', 0,0,0, 0,0);

			// this.light = this.addSprite('yellow_sub.png', 0,0,0, 0,0);

		}

		p.rotateLight = function(e) {
			var degree = MathBase.Fit01(e, -0.4, 0.1);
			this.light.rotate(degree);
		}

		p.update = function() {

		}


		p.addSprite = function(name, x, y, z, aX, aY) {
			var tmp = new ElSprite(name, x, y, z, aX, aY);
			this.element.push(tmp);
			this.container.addChild(tmp.container);
			return tmp;
		}

	}


})();
