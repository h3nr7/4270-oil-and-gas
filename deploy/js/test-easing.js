(function() {

	var Core = MKK.getNamespace('mkk.core').Core;
	var Trackpad = MKK.getNamespace('mkk.event').Trackpad;
	var AssetsLoader = MKK.getNamespace('app.loader').AssetsLoader;
	var ns = MKK.getNamespace('app');

	if (!ns.App) {

		var App = function App() {
	
		}

		ns.App = App;
		var p =  App.prototype = new Core();
		var s = Core.prototype;



		p.debug = function() {	


			this.easing = TWEEN.Easing.Linear.None;
			this.interpolation = TWEEN.Interpolation.Linear;
			this.duration = 1500;
			this.startPos = 20;
			this.endPos = 900;
			this.test = 3;

			this.gui = new dat.GUI();

			var f1 = this.gui.addFolder('Easing & Interpolation');


			f1.add(this, 'duration', 0, 5000).step(100);
			f1.add(this, 'startPos', 10, 500);
			f1.add(this, 'endPos', 500, 1024);

			f1.add(this, 'interpolation', {
				Linear: TWEEN.Interpolation.Linear,
				Bezier: TWEEN.Interpolation.Bezier,
				CatmullRom: TWEEN.Interpolation.CatmullRom

			});

			this.easeControl = f1.add(this, 'easing', {
				Linear:'linear',
				QuadIn:'quadin',
				QuadOut:'quadout',
				QuadInOut:'quadinout'
			});

			f1.open();

			this.stats = new Stats();
			var dEle = this.stats.domElement;
			dEle.style.position = 'absolute';
			dEle.style.right = '0px';
			dEle.style.bottom = '0px';

			document.body.appendChild(this.stats.domElement);

			var that = this;
			this.easeControl.onFinishChange(function(value) {
			  // Fires when a controller loses focus.
			  switch(value) {
				case 'linear':
					that.easing = TWEEN.Easing.Linear.None;
					break;
				case 'quadin':
					that.easing = TWEEN.Easing.Quadratic.In;
					break;
				case 'quadout':
					that.easing = TWEEN.Easing.Quadratic.Out;
					break;
				case 'quadinout':
					that.easing = TWEEN.Easing.Quadratic.InOut;
					break;

			  }

			  that.run();
			});
		}

		p.setup = function() {

			s.setup();
			this.stage = new PIXI.Stage(0xe7e7e7);
			// create a renderer instance.
			this.renderer = PIXI.autoDetectRenderer(1280, 768);
			// add the renderer view element to the DOM
			document.body.appendChild(this.renderer.view);

			this.debug();
			this.load();
		}

		p.load = function() {
			assetsToLoader = [
				"assets/global.json",
				"assets/sceneend.json"
			];

			loader = new PIXI.AssetLoader(assetsToLoader);

			// use callback
			var that = this;
			loadComplete = function() { that.loadComplete() };
			loader.onComplete = loadComplete;
			//begin load
			loader.load();			
		}

		p.loadComplete = function() {
			this.init();
		}

		p.init = function() {
			console.log('init');
			//create animation object
			this.container = new PIXI.DisplayObjectContainer();
			var sub = PIXI.Sprite.fromFrame("sceneend_houses.png");
			this.container.addChild(sub);
			this.stage.addChild(this.container);

			this.run();


		}

		p.run = function() {
			this.container.position.x = 0;
			this.container.position.y = 300;
			var that = this;
			console.log(that.easing);
			var tT = new TWEEN.Tween({x:that.startPos})
						.to({x:that.endPos}, that.duration)
						.easing( that.easing )
						.onUpdate( function(){

							that.container.position.x = this.x;
						}).start();
		}

		p.update = function() {

		}

		p.render = function() {
			this.stats.begin();
			TWEEN.update();
			this.renderer.render(this.stage);
			this.stats.end();
		}

	}

})();