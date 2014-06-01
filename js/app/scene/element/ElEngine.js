(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var settings = MKK.getNamespace('data').settings;
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;
	var AbContainer = MKK.getNamespace('app.scene').AbContainer;
	var ElSprite = ns.ElSprite;
	var ElRotatingSprite = ns.ElRotatingSprite;
	var scenedata = MKK.getNamespace('data').scenedata;

	if(!ns.ElEngine) {

		var ElEngine = function ElEngine(sFrame, duration, x, y, z) {

			this.name = name;
			this.base = [];
			this.pistons = [];
			this.drives = [];
			this.container = new PIXI.DisplayObjectContainer();

			this.setup(sFrame, duration, x, y);

			this.z = z
			this.container.position = this.cPos;


		}	

		ns.ElEngine = ElEngine;

		var p = ElEngine.prototype = new AbContainer();

		p.setup = function(sFrame, duration, x, y) {

			this._setup(sFrame, duration, x, y);
			this._speed = 350;
			this._repeat = 1000;
			//base
			this.addBase('engine-base.png', 0, 0, 0, 0.5, 0.5);	

			//pistons	
			this.addPiston('engine-piston.png', -68, 13, 0, 0.5, 0.5);
			this.addPiston('engine-piston.png', -23, -14, 0, 0.5, 0.5);		
			this.addPiston('engine-piston.png',  24, -14, 0, 0.5, 0.5);		
			this.addPiston('engine-piston.png',  70, 13, 0, 0.5, 0.5);			

			//drives
			this.addDrive('engine-drive.png', -56, 35, 0, 0.5, 0.5);		
			this.addDrive('engine-drive.png', -36, 22, 0, 0.5, 0.5);				
			this.addDrive('engine-drive.png', 36, 22, 0, 0.5, 0.5);		
			this.addDrive('engine-drive.png', 57, 35, 0, 0.5, 0.5);	


			var that = this;
			var tweenUpdateBound = function(e) { that.pistons[0].yPos(this.y); that.pistons[3].yPos(this.y); };
			this.tweener1 = new TWEEN.Tween({y: 13})
								.to({ y: -14 }, this._speed)
								.easing( TWEEN.Easing.Cubic.InOut )
								.repeat( Infinity )
								.yoyo( true )
								.onUpdate(tweenUpdateBound);

			var tweenUpdate2Bound = function(e) { that.pistons[1].yPos(this.y); that.pistons[2].yPos(this.y); };
			this.tweener2 = new TWEEN.Tween({y: -14})
								.to({ y: 13 }, this._speed)
								.easing( TWEEN.Easing.Cubic.InOut )
								.repeat( Infinity )
								.yoyo( true )
								.onUpdate(tweenUpdate2Bound);

			var tweenUpdate3Bound = function(e) { that.drives[0].yPos(this.y); that.drives[3].yPos(this.y); };
			this.tweener3 = new TWEEN.Tween({y: 35})
								.to({ y: 22 }, this._speed)
								.easing( TWEEN.Easing.Cubic.InOut )
								.repeat( Infinity )
								.yoyo( true )
								.onUpdate(tweenUpdate3Bound);

			var tweenUpdate4Bound = function(e) { that.drives[1].yPos(this.y); that.drives[2].yPos(this.y); };
			this.tweener4 = new TWEEN.Tween({y: 22})
								.to({ y: 35 }, this._speed)
								.easing( TWEEN.Easing.Cubic.InOut )
								.repeat( Infinity )
								.yoyo( true )
								.onUpdate(tweenUpdate4Bound);

			this.start();
		}

		p.open = function() {

		}

		p.start = function() {
			this.tweener1.start();
			this.tweener2.start();
			this.tweener3.start();
			this.tweener4.start();
		}

		p.stop = function() {
			this.tweener1.stop();
			this.tweener2.stop();
			this.tweener3.stop();
			this.tweener4.stop();			
		}

		p.addBase = function(name, x, y, z, aX, aY) {
			var tmp = new ElSprite(name, x, y, z, aX, aY);
			this.base.push(tmp);
			this.container.addChild(tmp.container);
		}

		p.addPiston = function(name, x, y, z, aX, aY) {
			var tmp = new ElSprite(name, x, y, z, aX, aY);
			this.pistons.push(tmp);
			this.container.addChild(tmp.container);
		}

		p.addDrive = function(name, x, y, z, aX, aY) {
			var tmp = new ElSprite(name, x, y, z, aX, aY);
			this.drives.push(tmp);
			this.container.addChild(tmp.container);
		}

		p.update = function(frame) {
			this._update(frame);
			var cFrame = this.localCurFrame(frame);
		}

	}

})();
