(function(){

	var MathBase = MKK.getNamespace('mkk.math').MathBase;
	var ns = MKK.getNamespace('app.scene.element');
	var settings = MKK.getNamespace('data').settings;
	var ElSprite = ns.ElSprite;
	var AbContainer = MKK.getNamespace('app.scene').AbContainer;

	if(!ns.ElOilHole) {

		var ElOilHole = function ElOilHole(name, startFrame, duration, x, y, z, sLevel) {

			this.name = name;
			this.holeName = "oilrig-drill-hole.png";
			this.pipeoilName = "oilrig_pipe_oil.png";
			this.z = z;
			this._level = sLevel || 0;
			// this.container.position = this.cPos;
			this.holeX = 512;
			this.holeY = -100;
			this.drillStartY = -1000;
			this.setup(startFrame, duration, x, y);



		}	

		ns.ElOilHole = ElOilHole;

		var p = ElOilHole.prototype = new AbContainer();

		p.setup = function(sFrame, duration, x, y) {

			this._setup(sFrame, duration, x, y);

			this.hole = new ElSprite(this.holeName, this.holeX, this.holeY, 0, 0.5, 0);

			this.masker = this.createMask(485, -50, 55, 705);

			this.casing = this.addCasing(0, 665);
			this.pipe = this.addCasing(-1076, 1076, 'pipe');
			this.oilmask = this.createMask(497, 0, 30, 1731);

			this.container.addChild(this.hole.container);
			this.container.addChild(this.masker);
			this.hole.container.mask = this.masker;

			this.createPipeOil();


			this.updateOil(0.1);

		}

		p.updateInner = function(level) {
			
		}

		p.update = function() {

		}

		p.createMask = function(x, y, w, h) {
			var casing = new PIXI.Graphics();
			casing.clear();
			casing.beginFill(0x999999, 1);
			casing.drawRect(0, 0, w, h);
			casing.endFill();
			casing.position.x = x;
			casing.position.y = y;	
			return casing;			
		}

		p.setHoleYPos = function(e) {
			this.hole.container.y =  -1550 +  e*1450;
		}

		p.showPipe = function() {
			this.pipeOil.visible = true;
			this.pipe.visible = true;
			this.casing.visible = true;
		}

		p.hidePipe = function() {

			this.pipeOil.visible = false;
			this.pipe.visible = false;
			this.casing.visible = false;
		}

		p.addCasing = function(y, h, isPipe) {

			var color = settings.defaultOilBGColor;
			var alpha = 0.6;
			if(isPipe) {
				color = settings.defaultOilRigBlue;
				this.casing.alpha =1;
			}

			var casing = new PIXI.Graphics();
			casing.clear();
			casing.beginFill(color, 1);
			casing.drawRect(0, 0, 30,h);
			casing.endFill();
			casing.position.x = 497;
			casing.position.y = y;	
			casing.alpha = alpha;
			casing.visible = false;
			this.container.addChild(casing);

			return casing;
		}

		p.createPipeOil = function() {
			this.masker2 = this.createMask(485, -1076, 55, 1745);
			this.pipeOil = new PIXI.DisplayObjectContainer();
			this.pipewave = new ElSprite(this.pipeoilName, 0,0,0, 0,0);
			this.pipeExt = this.drawExtendedOil(0,28,30, 1680);
			this.pipeOil.addChild(this.pipewave.container);
			this.pipeOil.addChild(this.pipeExt);
			this.pipeOil.position.x = 497;
			this.pipeOil.position.y = -1047;
			
			this.pipeOil.mask = this.masker2;
			this.pipeOil.visible = false;
			this.container.addChild(this.masker2);
			this.container.addChild(this.pipeOil);
		}

		p.updateOil = function(e) {
			this.pipeOil.position.y = MathBase.Fit01(e, 670, -1097);
		}


		p.drawExtendedOil = function(x, y, width, height) {
			var extended = new PIXI.Graphics();

			var oilcolor = settings.defaultOilColor;
			extended.beginFill(oilcolor);

			extended.drawRect(x, y, width, height);
			extended.endFill();

			return extended;
		}



	}


})();
