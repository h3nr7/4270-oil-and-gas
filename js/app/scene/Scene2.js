(function() {

	var ns = MKK.getNamespace('app.scene');
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var scenedata = MKK.getNamespace('data').scenedata;
	var styledata = MKK.getNamespace('data').styledata;
	var AbScene = ns.AbScene;

	var Scene2Level = ns.level.Scene2Level;
	var ElSprite = ns.element.ElSprite;
	var ElSpriteContainer = ns.element.ElSpriteContainer;
	var ElText = ns.element.ElText;
	var ElRect = ns.element.ElRect;
	var ElSeaBG = ns.element.ElSeaBG;
	var ElSeaWave = ns.element.ElSeaWave;


	var FrameTween = MKK.getNamespace('app.animation').FrameTween;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;


	if(!ns.Scene2) {

		var Scene2 = function Scene2() {

		}


		ns.Scene2 = Scene2;

		var p = Scene2.prototype = new AbScene();

		//open when init is completed
		p.open = function() {

			this.createLevels(scenedata.scene2.level, Scene2Level);

			// ----------------------------
			// create sea
			// ----------------------------
			this.seabg = new ElSeaBG('seabg', 0,1050,0,0,0, 1024, 2048);
			this.seawave = new ElSeaWave('seawave', 0, 1050,0,0,0, 1024);

			// ----------------------------
			// create ship
			// ----------------------------
			this.ship = new ElSpriteContainer('ship', 0, 1000, 0, 0, 0);
			this.ship.addSprite("explorer-ship-top1.png", 300,680);
			this.ship.addSprite("explorer-ship-bottom1.png", 0,980);

			// ----------------------------
			// create inner
			// ----------------------------
			this.inner = new ElSpriteContainer('inner', 0, 1000, 0, 1000, 0);
			this.inner.addSprite("exploration_inner_bg_01.png", 0,0);
			this.inner.addSprite("exploration_inner_bg_02.png", 961,0);
			this.inner.addSprite("exploration_inner_bg_03.png", 0,1023);
			this.inner.addSprite("exploration_inner_bg_04.png", 961,1023);

			// ----------------------------
			// ship tween to zoom
			// ----------------------------
			var tweenShipBound = ListenerFunctions.createListenerFunction(this, this.tweenShip);
			this.tween1 = new TweenEach({scale:1, x: 0, y:0})
							.to({scale:3, x: -560, y:-1700})
							.onUpdate(tweenShipBound)
							.delay(912).start();

			// ----------------------------
			// add to levels
			// ----------------------------
			this.level[0].addElement(this.seabg.container);
			this.level[0].addElement(this.seawave.container);
			this.level[1].addElement(this.inner.container);
			this.level[2].addElement(this.ship.container);
			

		}

		// ----------------------------
		// all tweening funcitons
		// ----------------------------
		p.tweenShip = function(e) {
				var ship = this.ship;
				var cObj = this.tween1.tweenVars();
				ship.scale(cObj.scale);
				ship.position(cObj.x, cObj.y);

		}

		//close when destroyed
		p.close = function() {

		}

		p.update = function(frame) {

			this._update(frame);
			var cFrame = this.localCurFrame(frame);


			if(cFrame>=0 && cFrame<this.duration) {
				this.cPos.y = -cFrame;
			}

			if (cFrame>=611) {
				this.level[1].show();
			}
			else {
				this.level[1].hide();
			}

			if(cFrame>=1320) {
				this.level[2].hide();
			}
			else {
				this.level[2].show();
			}

			
			this.level[0].update(cFrame);
			this.level[1].update(cFrame);
			this.level[2].update(cFrame);
		}



	}




})();