(function() {
	
	// ------------------------------------
	// LIBRARIES
	// ------------------------------------
	var ns = MKK.getNamespace('app.scene');
	var EventDispatcher = MKK.getNamespace('mkk.event.EventDispatcher');
	var settings = MKK.getNamespace('data').settings;
	var scenedata = MKK.getNamespace('data').scenedata;
	var MathBase = MKK.getNamespace('mkk.math').MathBase;

	var TouchEvent = MKK.getNamespace('mkk.event').TouchEvent;
	var FrameTween = MKK.getNamespace('app.animation').FrameTween;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;

	if(!ns.Navi) {

		var Navi = function Navi() {

			this.totalFrame = scenedata.totalFrame;
			this.buttonLinks = [

				{ id:0, name: scenedata.scene1.name, frame:scenedata.scene1.cuepoint },
				{ id:1, name: scenedata.scene2.name, frame:scenedata.scene2.cuepoint },
				{ id:2, name: scenedata.scene3.name, frame:scenedata.scene3.cuepoint },
				{ id:3, name: scenedata.scene4.name, frame:scenedata.scene4.cuepoint },
				{ id:4, name: scenedata.scene5.name, frame:scenedata.scene5.cuepoint },
				{ id:5, name: scenedata.scene6.name, frame:scenedata.scene6.cuepoint },
				{ id:6, name: scenedata.scene8.name, frame:scenedata.scene8.cuepoint }
			];

			this.redButs = [];
			this.blueButs = [];
			this.nametitle = [];

			this.tweenTime = {

				_speed: 250,
				sideHideX: -300,
				sideShowX: 50,
				buttonDistance: 70,
				buttonVertGap: 5,
				butSize: 26,
				txtOffset: 5

			};

			//calculate the max bar height
			this.maxBarHeight = ( (this.buttonLinks.length-1)*this.tweenTime.buttonDistance);

			this.view = null;
			this.setup();

			this.updateProcess(0.96);

			this.isAnimating = false;
			this.isSideHidden = true;

		}

		ns.Navi = Navi;

		var p = Navi.prototype = new EventDispatcher();

		// ----------------------------
		// setup
		// ----------------------------
		p.setup = function() {


			this.topview = this.setupTop();
			this.sideview = this.setupSide();
		}

		p.setupTop = function() {
			//create container
			var vTemp = document.createElement('div');
			vTemp.id = 'navi-top';
			vTemp.style.position = 'absolute';
			vTemp.style.left = '0px';
			vTemp.style.top = '0px';
			vTemp.style.background = 'white';
			vTemp.style.paddingTop = "7px";
			vTemp.style.width = "1024px";
			vTemp.style.height = "40px";
			vTemp.innerHTML = '<a style="position: absolute; width: 1024px; height: 40px;" href="com.exxonmobil.mobilperformance://"><img style="position: absolute; left: 10px;" src="images/exxon_logo.png"/><img style="position: absolute; right: 10px;" src="images/mobile_logo.png"/></a>';

			return vTemp;
		}

		p.setupSide = function() {
			var vTemp = document.createElement('div');
			vTemp.id = 'navi-side';
			vTemp.style.position = 'absolute';
			vTemp.style.left = this.tweenTime.sideHideX + 'px';
			vTemp.style.top = '100px';
			vTemp.style.width = "26px";
			vTemp.style.height = ( this.maxBarHeight + this.tweenTime.buttonVertGap*2 ) + "px";

			var redbar = this.createlines(this.maxBarHeight, settings.defaultBrandRed, false);
			var bluebar = this.createlines(this.maxBarHeight, settings.defaultBrandBlue, true);
			this.bluebar = vTemp.appendChild(bluebar);
			this.redbar = vTemp.appendChild(redbar);

			var that = this;
			var butLen = this.buttonLinks.length;
			for (var i=0; i<butLen; i++) {

				//create buttons
				var bBut = this.createButton(i*70, i, false);
				this.blueButs.push( vTemp.appendChild(bBut) )
				var rBut = this.createButton(i*70, i, true);
				this.redButs.push( vTemp.appendChild(rBut) );
				//create button events
				var rbBound = function(e) { that.buttonTapFunc(e, i, this) };
				var tT = new TouchEvent( this.redButs[i], 'tap', rbBound );

				//create title
				var tTitle = this.createTitle( i*70, this.buttonLinks[i].name );
				this.nametitle.push( vTemp.appendChild( tTitle ) );

			}

			return vTemp;
		}


		p.buttonTapFunc = function(e, i, obj) {
			// var dist = this.buttonLinks[i]
			var navNum = parseInt( obj.target.id.replace('navbut', '') );
			console.log(e, i, navNum);
			this.dispatchCustomEvent('navitap', {distance: this.buttonLinks[navNum].frame});
		}

		// ----------------------------
		// create assets
		// ----------------------------
		p.createButton = function(y, id, isRed) {
			var vTemp = document.createElement('div');
			vTemp.id = 'navbut'+id;
			vTemp.style.position = 'absolute';
			vTemp.style.left = '0px';
			vTemp.style.top = y + 'px';
			//specify colors
			var color = 'red';
			if(!isRed) { color = 'blue' }

			vTemp.style.background = 'url(images/nav-ball-'+ color +'.png) center center no-repeat';
			vTemp.style.backgroundSize = '26px 26px'; 
			vTemp.style.width = "26px";
			vTemp.style.height = "26px";
			vTemp.style.cursor = 'pointer';
			return vTemp;
		}

		p.createlines = function(height, color, isAlignTop) {
			var vTemp = document.createElement('div');

			vTemp.style.position = 'absolute';
			vTemp.style.left = '9px';
			//check if it should align from top or bottom
			if(isAlignTop) {
				vTemp.style.top = this.tweenTime.buttonVertGap + 'px';
				vTemp.id = 'redbar';
			}
			else {
				vTemp.style.bottom = this.tweenTime.buttonVertGap + 'px';
				vTemp.id = 'bluebar';
			}
			vTemp.style.background = color;
			vTemp.style.width = '7px';
			vTemp.style.height = ( height ) + 'px';
			return vTemp;
		}

		p.createTitle = function(height, name) {
			var vTemp = document.createElement('div');
			vTemp.style.position = 'absolute';
			vTemp.style.left = '32px';
			vTemp.style.top = height + this.tweenTime.txtOffset + 'px';
			vTemp.innerHTML = name;
			vTemp.style.color = settings.defaultBrandRed;
			vTemp.style.fontFamily = ' emprintw01-semibold ,sans-serif';

			return vTemp;
		}

		// ----------------------------
		// SHOW and HIDE the nav
		// ----------------------------
		p.hideSide = function() {

			if(this.isAnimating || this.isSideHidden) return;
			var tT = this.tweenTime;
			var that = this;
			var updateBound = function(e) { that.hideUpdate(e, this) };
			var completeBound = function(e) { that.hideComplete(e, this) };
			this.hideTween = new TWEEN.Tween({x: tT.sideShowX})
								.to({x: tT.sideHideX}, tT._speed)
								.onUpdate( updateBound )
								.easing(TWEEN.Easing.Cubic.InOut)
								.onComplete( completeBound ).start();
		}

		p.showSide = function() {
			if(this.isAnimating || !this.isSideHidden) return;
			var tT = this.tweenTime;
			var that = this;
			var updateBound = function(e) { that.showUpdate(e, this) };
			var completeBound = function(e) { that.showComplete(e, this) };
			this.hideTween = new TWEEN.Tween({x: tT.sideHideX})
								.to({x: tT.sideShowX}, tT._speed)
								.easing(TWEEN.Easing.Cubic.InOut)
								.onUpdate( updateBound )
								.onComplete( completeBound ).start();
		}

		p.hideUpdate = function(e, obj) {
			this.isAnimating = true;
			this.sideview.style.left = obj.x + 'px';
		}

		p.hideComplete = function(e, obj) {
			this.isAnimating = false;
			this.isSideHidden = true;
		}

		p.showUpdate = function(e, obj) {
			this.isAnimating = true;
			this.sideview.style.left = obj.x + 'px';
		}

		p.showComplete = function(e, obj) {
			this.isAnimating = false;
			this.isSideHidden = false;
		}

		// ----------------------------
		// UPDATE and ANIMATE
		// ----------------------------
		p.updateProcess = function(e) {

			this.redbar.style.height = this.maxBarHeight * e + 'px';
		}

		p.update = function(frame) {
			var tot = this.totalFrame;
			var blLen = this.buttonLinks.length;
			var output = 0;
			for(var i=0; i<blLen; i++) {

				//move and scale lines
				var bl = this.buttonLinks[i].frame;
				var bln = tot;
				if( (i+1) < blLen ) { bln = this.buttonLinks[i+1].frame };
				if(frame>=bl && frame<bln) {
					var output = MathBase.Fit(frame, bl, bln, i*0.165, (i+1)*0.165);
				}
				//change buttons
				if(frame>=(bl-1) && frame>1) {
					this.redButs[i].style.opacity = 0;
					this.nametitle[i].style.color = settings.defaultBrandBlue;
				}
				else {
					this.redButs[i].style.opacity = 1;
					this.nametitle[i].style.color = settings.defaultBrandRed;
				}

			}
			this.updateProcess(1-output);
		}

	}



})();