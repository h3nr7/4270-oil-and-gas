(function() {
	
	// ------------------------------------
	// LIBRARIES
	// ------------------------------------
	var ns = MKK.getNamespace('app.loader');
	var EventDispatcher = MKK.getNamespace('mkk.event.EventDispatcher');
	var MathBase = MKK.getNamespace('mkk.math').MathBase;


	if(!ns.Loader) {

		var Loader = function Loader() {

			this._view = null;
			this.setup();

			this.assetsloader;
		}

		ns.Loader = Loader;

		var p = Loader.prototype = new EventDispatcher();

		p.setup = function() {

			this.view = this.createView();

		}
		// -----------------------------------
		// Loaders
		// -----------------------------------	

		p.assetLoader = function(assets, callback) {
			assetsToLoader = [
				"assets/global.json",
				"assets/scene1.json",
				"assets/scene2.json",
				"assets/scene2b.json",
				"assets/scene2c.json",
				"assets/scene3.json",
				"assets/scene3b.json",
				"assets/scene4.json",
				"assets/scene5.json",
				"assets/scene6.json",
				"assets/scene7.json",
				"assets/scene8.json",
			];

			this.assetsloader = new PIXI.AssetLoader(assetsToLoader);
			PIXI.scaleModes.DEFAULT = PIXI.scaleModes.LINEAR;
			// PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;
			// use callback
			var that = this;
			var loadComplete = function() { callback.call() };
			loader.onComplete = loadComplete;
			//begin load
			loader.load();
		}



		// -----------------------------------
		// create views
		// -----------------------------------		
		p.createView = function() {
			//create container
			var vtmp = document.createElement('div');
			vtmp.style.position = 'absolute';

			vtmp.style.width = '1024px';
			vtmp.style.height = '768px';
			vtmp.style.left = '0px';
			vtmp.style.top = '0px';
			vtmp.style.background = '#e7e7e7';

			// vtmp.innerHTML = '<a style="position: absolute; width: 1024px; height: 40px;" href="com.exxonmobil.mobilperformance://"><img style="position: absolute; left: 10px;" src="images/exxon_logo.png"/><img style="position: absolute; right: 10px;" src="images/mobile_logo.png"/></a>';
			this.container = this.createContainer();
			vtmp.appendChild(this.container);
			var txt = this.createTxt();
			this.txt = vtmp.appendChild(txt);

			this.waveYPos(0);
			
			return vtmp;
		}

		p.createContainer = function() {
			var vtmp = document.createElement('div');
			vtmp.style.position = 'absolute';
			vtmp.style.width = '124px';
			vtmp.style.height = '124px';
			vtmp.style.left = '450px';
			vtmp.style.top = '316px';
			vtmp.style.overflow = 'hidden';

			var wave = this.createWave();
			this.wave = vtmp.appendChild(wave);
			var masker = this.createMask();
			this.masker = vtmp.appendChild(masker);

			return vtmp
		}

		p.createMask = function() {

			var vtmp = document.createElement('div');
			vtmp.style.position = 'absolute';
			vtmp.style.width = '124px';
			vtmp.style.height = '124px';
			vtmp.style.left = '0px';
			vtmp.style.top = '0px';
			vtmp.style.overflow = 'hidden';
			vtmp.style.background = 'url(images/loader-front.png) center center no-repeat';

			return vtmp;
		}

		p.createWave = function() {

			var vtmp = document.createElement('div');
			vtmp.style.position = 'absolute';
			vtmp.style.width = '124px';
			vtmp.style.height = '124px';
			vtmp.style.left = '0px';
			vtmp.style.top = '15px';
			vtmp.style.overflow = 'hidden';
			vtmp.style.background = 'url(images/loader-wave.png) left top no-repeat';

			return vtmp;			
		}

		p.createTxt = function() {
			var vtmp = document.createElement('div');
			vtmp.style.position = 'absolute';
			vtmp.style.width = '124px';
			vtmp.style.height = '30px';
			vtmp.style.left = '450px';
			vtmp.style.top = '440px';
			vtmp.style.textAlign = 'center';
			vtmp.style.fontFamily = 'EMPrintW01-regular, sans-serif';
			vtmp.style.fontSize = '13px';
			vtmp.style.color = '#666666';
			vtmp.innerHTML = 'LOADING...';

			return vtmp;	
		}


		// -----------------------------------
		// setting positions
		// -----------------------------------	
		p.waveYPos = function(e) {

			var pos = MathBase.Fit01(e, 90, 15);
			this.wave.style.top = pos + 'px';
		}

		p.containerYPos = function(y) {
			this.container.style.top = y+'px';
		}


		// -----------------------------------
		// fade out contents
		// -----------------------------------	
		p.fadeout = function() {

			var that = this;
			var fadeTween = function(e) { that.fadeoutTweenFunc(e, this) };
			var fadeTweenComplete = function(e) { that.fadeoutTweenCompleteFunc(e) };
			this.tweener = new TWEEN.Tween({y:306})
								.to({ y:276 }, 500)
								.onUpdate(fadeTween)
								.easing(TWEEN.Easing.Cubic.Out)
								.delay(250)
								.onComplete(fadeTweenComplete).start();
		}

		p.fadeoutTweenFunc = function(e, obj) {
			this.containerYPos(obj.y);
			this.view.style.opacity = 1-e;		
		}

		p.fadeoutTweenCompleteFunc = function(e, obj) {
			console.log('fadetweener complete');
			this.view.style.width = '0px';
			this.view.style.height = '0px';
			this.view.style.display = 'none';
		}

	}



})();