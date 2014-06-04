(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var settings = MKK.getNamespace('data').settings;
	var ElSprite = ns.ElSprite;
	var AbContainer = MKK.getNamespace('app.scene').AbContainer;

	if(!ns.ElOilHole) {

		var ElOilHole = function ElOilHole(name, startFrame, duration, x, y, z, sLevel) {

			this.name = name;
			this.holeName = "oilrig-drill-hole.png";
			this.z = z;
			this._level = sLevel || 0;
			// this.container.position = this.cPos;
			this.setup(startFrame, duration, x, y);

	


		}	

		ns.ElOilHole = ElOilHole;

		var p = ElOilHole.prototype = new AbContainer();

		p.setup = function(sFrame, duration, x, y) {

			this._setup(sFrame, duration, x, y);

			this.hole = new ElSprite(this.holeName, 512, 0, 0, 0.5, 0);

			this.container.addChild(this.hole.container);
		}

		p.updateInner = function(level) {
			
		}

		p.update = function() {

		}

	}


})();
