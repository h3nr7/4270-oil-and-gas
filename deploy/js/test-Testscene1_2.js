(function(){

	var scenedata = MKK.getNamespace('data').scenedata;
	var Core = MKK.getNamespace('mkk.core').Core;
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var Trackpad = MKK.getNamespace('mkk.event').Trackpad;
	var AssetsLoader = MKK.getNamespace('app.loader').AssetsLoader;
	var Navi = MKK.getNamespace('app.scene').Navi;
	var ns = MKK.getNamespace('app');
	var Scene1 = MKK.getNamespace('app.scene').Scene1;
	var Scene2 = MKK.getNamespace('app.scene').Scene2;
	var Scene3 = MKK.getNamespace('app.scene').Scene3;
	var Scene4 = MKK.getNamespace('app.scene').Scene4;
	var Scene6 = MKK.getNamespace('app.scene').Scene6;
	var Scene7 = MKK.getNamespace('app.scene').Scene7;
	var Scene8 = MKK.getNamespace('app.scene').Scene8;
	var Scroller = MKK.getNamespace('app.event').Scroller;
	var Loader = MKK.getNamespace('app.loader').Loader;
	var FrameTween = MKK.getNamespace('app.animation').FrameTween;

	if(!ns.app) {

		var App = function() {
			//some variatble
			this.isDebug = true;
			this.loaded = false;
		}

		ns.App = App;

		var p = App.prototype = new Core();
		var s = Core.prototype;

		p.setup = function() {

			// --------------------------------------------------
			// Setup
			// --------------------------------------------------	
			this._setup();


			// --------------------------------------------------
			// PIXI Stage
			// --------------------------------------------------			
			this.stage = new PIXI.Stage(0xe7e7e7);
			// create a renderer instance.
			this.renderer = new PIXI.CanvasRenderer(1024, 768);
			this.renderer.roundPixels = true;
			// this.renderer = PIXI.autoDetectRenderer(1024, 768);
			// add the renderer view element to the DOM
			document.body.appendChild(this.renderer.view);

			// --------------------------------------------------
			// Loader
			// --------------------------------------------------	
			this.loader = new Loader();
			document.body.appendChild(this.loader.view);

			// --------------------------------------------------
			// Navigator
			// --------------------------------------------------	
			this.navi = new Navi();
			document.body.appendChild(this.navi.topview);
			document.body.appendChild(this.navi.sideview);
			document.body.appendChild(this.navi.soundview);


			// --------------------------------------------------
			// SCROLLER Setup
			// --------------------------------------------------
			this.scroller = new Scroller();
			this.scroller.setup(this.renderer.view);
			// ------------------

			if (this.isDebug) this.debug();

			//setup scenes
			this.scene1 = new Scene1();
			this.scene1.setup(scenedata.scene1.startFrame, scenedata.scene1.duration, 0, 0);
			this.scene2 = new Scene2();
			this.scene2.setup(scenedata.scene2.startFrame,scenedata.scene2.duration, 0, 0);
			this.scene3 = new Scene3();
			this.scene3.setup(scenedata.scene3.startFrame,scenedata.scene3.duration, 0, 0);
			this.scene4 = new Scene4();
			this.scene4.setup(scenedata.scene4.startFrame,scenedata.scene4.duration, 0, 0);	
			this.scene6 = new Scene6();
			this.scene6.setup(scenedata.scene6.startFrame,scenedata.scene6.duration, 0, 0);	
			this.scene7 = new Scene7();
			this.scene7.setup(scenedata.scene7.startFrame,scenedata.scene7.duration, 0, 0);		
			this.scene8 = new Scene8();
			this.scene8.setup(scenedata.scene8.startFrame,scenedata.scene8.duration, 0, 0);			

			this.loadFonts();
		}

		p.init = function() {

			this.scene1.init(this.stage);
			this.scene2.init(this.stage);
			this.scene3.init(this.stage);
			//scene 6 to go on top of scene 4
			this.scene6.init(this.stage);
			this.scene4.init(this.stage);
			
			this.scene7.init(this.stage);
			this.scene8.init(this.stage);

			// --------------------------			
			// fadeout loader
			// --------------------------
			this.loader.fadeout();


			// --------------------------
			// scroller swipe detector
			// --------------------------
			this.swipeLeftFuncBound = ListenerFunctions.createListenerFunction(this, this.swipeLeftFunc);
			this.swipeRightFuncBound = ListenerFunctions.createListenerFunction(this, this.swipeRightFunc);

			this.scroller.trackpad.addEventListener('swipeleft', this.swipeLeftFuncBound);
			this.scroller.trackpad.addEventListener('swiperight', this.swipeRightFuncBound);

			this.naviTapFuncBound = ListenerFunctions.createListenerFunction(this, this.naviTapFunc);
			this.navi.addEventListener('navitap', this.naviTapFuncBound);

			this.soundTapFuncBound = ListenerFunctions.createListenerFunction(this, this.soundTapFunc);
			this.navi.addEventListener('soundtap', this.soundTapFuncBound);

			//end scene event
			this.replayFuncBound = ListenerFunctions.createListenerFunction(this, this.replayFunc);
			this.scene8.addEventListener('replay', this.replayFuncBound);
		}

		// --------------------------
		// SWIPE EVENT FUNCTIONS
		// --------------------------
		p.swipeLeftFunc = function(e) {
			console.log('swipe left man', e);
			this.navi.hideSide();
		}

		p.swipeRightFunc = function(e) {
			console.log('swipe right man', e);
			this.navi.showSide();
		}

		p.naviTapFunc = function(e) {
			this.scroller.scrollto(e.detail.distance);
		}

		p.soundTapFunc = function(e) {
			console.log('oh man, 'e.detail.soundstate);
		}

		p.replayFunc = function(e) {
			this.scroller.scrollto(0);
		}


        p.loadFonts = function() {

    //     	var fontLoadingBound = ListenerFunctions.createListenerFunction(this, this.fontLoading);
            var fontActiveBound = ListenerFunctions.createListenerFunction(this, this.fontActive);
    //     	WebFont.load({
	   //          custom: {
	   //              families: ['emprintw01-light', 'emprintw01-regular', 'emprintw01-semibold'],
	   //              urls: ['css/main.css']
	   //          },
	   //          loading: fontLoadingBound,
	   //          active: fontActiveBound,
	   //          //inactive: function() {console.log('webfont loading')},
				// //fontloading: function(familyName, fvd) {console.log('webfont loading')},
				// //fontactive: function(familyName, fvd) {console.log('webfont loading')},
				// //fontinactive: function(familyName, fvd) {console.log('webfont loading')}
    //     	});

			//dummy font loader
			var that = this;
			this.tweener = new TWEEN.Tween({rotation:0})
								.to({ rotation: 1 }, 3000)
								.onUpdate(function(e){ that.loader.waveYPos(e); })
								.onComplete(fontActiveBound).start();
        }

       p.fontLoading = function() {
       		//TODO
       		console.log('Web font loading');
       }

       p.fontActive = function() {
			//TODO
       		console.log('Web font Active');
       		this.load();
       }


		p.load = function() {

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
				"assets/sceneend.json",
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
			this.loaded = true;
			console.log('load complete');
			this.init();
		}


		p.update = function() {

			TWEEN.update();
			if (!this.loaded) return;
			//scene update
			var frame = this.scroller.getDistance();
			FrameTween.update(frame);
			
			this.scene1.update(frame);
			this.scene2.update(frame);
			this.scene3.update(frame);
			this.scene4.update(frame);
			this.scene6.update(frame);
			this.scene7.update(frame);
			this.scene8.update(frame);

			this.scroller.update();
			this.navi.update(frame);
		}

		p.animate = function() {

			this.scene2.animate();
		}

		p.render = function() {

			if (!this.loaded) return;

			if (this.stats) { this.stats.begin() };
			//render code starts here
			this.update();
			this.animate();
			
			this.renderer.render(this.stage);

			//render code ends here
			if (this.stats) { this.stats.end() };
		}


		//debugger
		p.debug = function() {	

			this.gui = new dat.GUI({ autoPlace: false });

			this.stats = new Stats();
			var dEle = this.stats.domElement;
			dEle.style.position = 'absolute';
			dEle.style.right = '0px';
			dEle.style.bottom = '0px';

			this.gui.domElement.style.position = 'absolute';
			this.gui.domElement.style.right = '10px';
			this.gui.domElement.style.top = '46px';

			document.body.appendChild(this.stats.domElement);
			document.body.appendChild(this.gui.domElement);

			//add debugger for other libs
			this.scroller.debug(this.gui);
		}

	}
})();