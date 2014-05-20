(function() {

	var ns = MKK.getNamespace('app.scene');
	var scenedata = MKK.getNamespace('data').scenedata;
	var styledata = MKK.getNamespace('data').styledata;
	var AbScene = ns.AbScene;

	var Scene1Level = ns.level.Scene1Level;
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

			console.log('kakaa aa', ElSprite);

			this.createLevels(scenedata.scene2.level, Scene1Level);


			var tmp = new ElSeaBG('seabg', 0,500,0,0,0, 1024, 2048);

			var tmp2 = new ElSeaWave('seawave', 0, 500,0,0,0, 1024);


			this.ship = new ElSpriteContainer('ship', 0, 0, 0);

			this.ship.addSprite("explorer-ship-top1.png", 300,890);
			this.ship.addSprite("explorer-ship-bottom1.png", 0,1100);


			// var texture = PIXI.Texture.fromFrame('cloud_white1.png');
			// var background = new PIXI.TilingSprite(texture, window.innerWidth, 190);
			// this.container.addChild(background);

			var that = this;
			var test = new TweenEach({scale:1}).to({scale:10}).onUpdate(function(e){
				
				// console.log(that.ship)
				that.ship.container.scale.x = this.scale;
				that.ship.container.scale.y = this.scale;

			}).delay(1000).start();

			this.level[0].addElement(this.ship.container);

			// this.level[0].addElement(tmp.container);
			// this.level[0].addElement(tmp2.container);

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

			
			this.level[0].update(cFrame);
			// this.level[1].update(cFrame);
			// this.level[2].update(cFrame);
		}



	}




})();