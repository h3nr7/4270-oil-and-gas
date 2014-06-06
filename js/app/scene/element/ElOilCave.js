(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var settings = MKK.getNamespace('data').settings;
	var ElSprite = ns.ElSprite;
	var AbContainer = MKK.getNamespace('app.scene').AbContainer;

	if(!ns.ElOilCave) {

		var ElOilCave = function ElOilCave(name, startFrame, duration, x, y, z, sLevel) {

			this.name = name;
			this.oilName = "oilrig-cave-oil.png";
			this.baseName = "oilrig-cave-mask.png";
			this.z = z;
			this._level = sLevel || 0;
			// this.container.position = this.cPos;
			this.setup(startFrame, duration, x, y);

	


		}	

		ns.ElOilCave = ElOilCave;

		var p = ElOilCave.prototype = new AbContainer();

		p.setup = function(sFrame, duration, x, y) {

			this._setup(sFrame, duration, x, y);
			this.base = new ElSprite(this.baseName, 512, 0, 0, 0.5, 0);

			this.bg = this.drawBG(50, 50, 900, 400);

			this.oilContainer = new PIXI.DisplayObjectContainer();
			this.oil = new ElSprite(this.oilName, 512, 0, 0, 0.5, 0);
			this.oilExtend = this.drawExtendedOil(0, 50, 1200, 300);


			this.oilContainer.addChild(this.oilExtend);
			this.oilContainer.addChild(this.oil.container);

			this.container.addChild(this.bg);
			this.container.addChild(this.oilContainer);
			this.container.addChild(this.base.container);

			this.updateLevel(0.6);
		}


		p.drawExtendedOil = function(x, y, width, height) {
			var extended = new PIXI.Graphics();

			var oilcolor = settings.defaultOilColor;
			extended.beginFill(oilcolor);

			extended.drawRect(x, y, width, height);
			extended.endFill();

			return extended;
		}

		p.drawBG = function(x, y, width, height) {
			var extended = new PIXI.Graphics();

			var bgcolor = settings.defaultOilBGColor;
			extended.beginFill(bgcolor);

			extended.drawRect(x, y, width, height);
			extended.endFill();

			return extended;
		}


		p.updateLevel = function(e) {
			this.oilContainer.y = 400 - e*350;
		}

		p.update = function() {

		}

	}


})();