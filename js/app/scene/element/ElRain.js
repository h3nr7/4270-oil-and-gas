(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var AbContainer = MKK.getNamespace('app.scene').AbContainer;

	if(!ns.ElRain) {

		var ElRain = function ElRain(sFrame, duration, x, y, z, numDrop) {

			this.assetName = "rain-drop.png"
			this.name = name;
			this.z = z;
			this.numDrop = numDrop || 200;
			this.rainArr = [];

			this.speed = 24;
			this.dropSize = 1.5;
			this.windSpeed = 5;
			this.topMargin = -580;
			this.bottomMargin = 768;
			this.rightMargin = 1500;
			this.sizeDeviation = 0.8;
			this.timeDeviation = 10;
			this.isRaining = false;
			this.beginTime = Date.now();

			this.setup(sFrame, duration, x, y);
			// this.container = new PIXI.DisplayObjectContainer();
			// this.container.position = this.cPos;

			this.show();

		}	

		ns.ElRain = ElRain;

		var p = ElRain.prototype = new AbContainer();


		p.setup = function(sFrame, duration, x, y) {


			this._preSetup(x, y);

			this.container = new PIXI.SpriteBatch();
			this.container.position = this.oPos.clone();
			this.startFrame = sFrame;
			this.duration = duration;	

			PIXI.SpriteBatch()

			this.setupRain();

		}

		p.setupRain = function() {

			//localised variables
			var tname = this.assetName;
			var rainLen = this.numDrop;
			var rMargin = this.rightMargin;
			var tMargin = this.topMargin;
			var bMargin = this.bottomMargin;
			var sDeviation = this.sizeDeviation;
			var tDeviation = this.timeDeviation;
			var dSize = this.dropSize;

			for(var i=0; i<rainLen; i++) {
				var xX = Math.random() * rMargin;
				var yY = tMargin*( .5 + Math.random() *.5);

				var size = dSize * (1-sDeviation) + Math.random() * dSize * sDeviation;
				var velo = .5*( this.speed + Math.random());
				var tmp = this.addSprite(tname, xX, yY, 0.5, 0.5);
				tmp.rotate(0.06);
				tmp.scale(size);
				this.rainArr[i] = { ox: xX, oy: yY, sprite: tmp, speed: velo, starttime: tDeviation*i };			

			}
		}


		p.show = function() {
			this.isRaining = true;
			// this.beginTime = Date.now();
		}

		p.hide = function() {
			this.isRaining = false;
		}

		p.animate = function() {

			var rainLen = this.rainArr.length;

			if (!this.isRaining) {

				for(var i=0; i<rainLen; i++) { var tmpSprite = this.rainArr[i].sprite; tmpSprite.hide(); }
				return;
			}

			var rMargin = this.rightMargin;
			var tMargin = this.topMargin;
			var bMargin = this.bottomMargin;
			var sDeviation = this.sizeDeviation;
			var wSpeed = this.windSpeed;
			var bTime = this.beginTime;

			for(var i=0; i<rainLen; i++) {

				var tmpTime = Date.now();
				var stTime =  this.rainArr[i].starttime ;
				if( tmpTime < bTime+stTime ) return;
				var tmpSprite = this.rainArr[i].sprite;
				var tSpeed = this.rainArr[i].speed;
				var tox = this.rainArr[i].ox;
				var toy = this.rainArr[i].oy;

				//show hide rainArr when off screen
				if(tmpSprite.yPos()<tMargin || tmpSprite.yPos()>bMargin) {
					tmpSprite.hide();
				}
				else {
					tmpSprite.show();
				}

				//
				if(tmpSprite.yPos()<=bMargin) {

					var ty = tmpSprite.yPos()+(tSpeed);
					var tx = tmpSprite.xPos() - wSpeed;

					tmpSprite.position(tx, ty);
				}
				else {
					tmpSprite.position(tox, toy);
				}
			}	
		}

		p.update = function() {

		}

	}


})();