(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var settings = MKK.getNamespace('data').settings;
	var ElSprite = ns.ElSprite;
	var AbContainer = MKK.getNamespace('app.scene').AbContainer;

	if(!ns.ElFpso) {

		var ElFpso = function ElFpso(startFrame, duration, x, y, z) {

			this.name = name;
			this.holeName = "oilrig-drill-hole.png";
			this.z = z;
			this.element = [];
			// this.container.position = this.cPos;
			this.setup(startFrame, duration, x, y);

	


		}	

		ns.ElFpso = ElFpso;

		var p = ElFpso.prototype = new AbContainer();

		p.setup = function(sFrame, duration, x, y) {

			this._setup(sFrame, duration, x, y);

			this.addSprite('fpso_01.png', 0,0,0, 0,0);
			this.addSprite('fpso_02.png', 213,0,0, 0,0);
			this.addSprite('fpso_03.png', 547,0,0, 0,0);
			this.addSprite('fpso_04.png', 902,0,0, 0,0);
			this.addSprite('fpso_05.png', 1480,0,0, 0,0);
		}

		p.update = function() {

		}


		p.addSprite = function(name, x, y, z, aX, aY) {
			var tmp = new ElSprite(name, x, y, z, aX, aY);
			this.element.push(tmp);
			this.container.addChild(tmp.container);
		}

	}


})();
