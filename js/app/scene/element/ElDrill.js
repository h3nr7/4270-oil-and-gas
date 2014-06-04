(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var settings = MKK.getNamespace('data').settings;
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var ElSprite = ns.ElSprite;
	var AbContainer = MKK.getNamespace('app.scene').AbContainer;

	if(!ns.ElDrill) {

		var ElDrill = function ElDrill(startFrame, duration, x, y, z) {

			this.name = name;
			this.z = z;
			this._speed = 600;
			this.bitsPos = [
				{y:80, toy: 100, scale: 1},
				{y:100, toy: 120, scale: 1},
				{y:120, toy: 140, scale: 1},
				{y:140, toy: 160, scale: 0.9},
				{y:160, toy: 180, scale: 0.2},
			];
			this.drillbits = [];


			// this.container.position = this.cPos;
			this.setup(startFrame, duration, x, y);
	


		}	

		ns.ElDrill = ElDrill;

		var p = ElDrill.prototype = new AbContainer();

		p.setup = function(sFrame, duration, x, y) {

			this._setup(sFrame, duration, x, y);

			this.drilHook = new ElSprite('oilrig-large-drill-dynamic-holder.png', 0, -135, 0, 0.5, 0);
			this.container.addChild(this.drilHook.container);

			this.drilMain = new ElSprite('oilrig-large-drill-dynamic.png', 0, 0, 0, 0.5, 0);
			this.container.addChild(this.drilMain.container);

			this.bitContainer = new PIXI.DisplayObjectContainer();
			this.bitContainer.position.x=0;
			this.bitContainer.position.y=0;
			this.maskObj = new PIXI.Graphics();
			this.maskObj.clear();
			this.maskObj.beginFill(0x8bc5ff, 1);
			this.maskObj.drawRect(0, 0, 50, 110);
			this.maskObj.endFill();
			this.maskObj.position.x = -25;
			this.maskObj.position.y = 88;	
			this.bitContainer.mask = this.maskObj;
			this.bitContainer.addChild(this.maskObj);		
			this.container.addChild(this.bitContainer);

			this.createBits();

			var tB = this.bitsPos;
			var that = this;
			var tweenUpdateBound = function(e) { that.tweenUpdate(e, this)};
			this.tweener = new TWEEN.Tween({
									y1:tB[0].y,
									y2:tB[1].y,
									y3:tB[2].y,
									y4:tB[3].y,
									y5:tB[4].y,
									scale4:1,
									scale5:1
								})
								.to({ 
									y1:tB[0].toy,
									y2:tB[1].toy,
									y3:tB[2].toy,
									y4:tB[3].toy,
									y5:tB[4].toy,
									scale4: tB[3].scale,
									scale5: tB[4].scale
								}, this._speed)
								.repeat(Infinity)
								.onUpdate(tweenUpdateBound).start();
		}

		p.createBits = function() {

			var tB = this.bitsPos;
			for( var i=0; i<tB.length; i++) {
				var tmp = new ElSprite('oilrig-large-drill-dynamic-spiral.png', 0, tB[i].y, 0, 0.5, 0.5);
				this.drillbits.push(tmp);
				this.bitContainer.addChild(tmp.container);
			}

		}

		p.tweenUpdate = function(e, ta) {

			this.drillbits[0].yPos(ta.y1);
			this.drillbits[1].yPos(ta.y2);
			this.drillbits[2].yPos(ta.y3);
			this.drillbits[3].yPos(ta.y4);
			this.drillbits[4].yPos(ta.y5);
			this.drillbits[3].scale(ta.scale4);
			this.drillbits[4].scale(ta.scale5);
		}

		p.updateInner = function(level) {
			
		}

		p.update = function() {

		}

	}


})();
