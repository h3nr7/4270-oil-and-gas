(function() {
	
	// ------------------------------------
	// LIBRARIES
	// ------------------------------------
	var ns = MKK.getNamespace('app.scene');
	var EventDispatcher = MKK.getNamespace('mkk.event.EventDispatcher');
	var settings = MKK.getNamespace('data').settings;
	var scenedata = MKK.getNamespace('data').scenedata;

	var FrameTween = MKK.getNamespace('app.animation').FrameTween;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;

	if(!ns.Navi) {

		var Navi = function Navi() {

			this.buttonLinks = [

				{ id:1, name: scenedata.scene1.name, frame:scenedata.scene1.cuepoint },
				{ id:2, name: scenedata.scene2.name, frame:scenedata.scene2.cuepoint },
				{ id:3, name: scenedata.scene3.name, frame:scenedata.scene3.cuepoint },
				{ id:4, name: scenedata.scene4.name, frame:scenedata.scene4.cuepoint },
				{ id:5, name: scenedata.scene5.name, frame:scenedata.scene5.cuepoint },
				{ id:6, name: scenedata.scene6.name, frame:scenedata.scene6.cuepoint },
				{ id:7, name: scenedata.scene8.name, frame:scenedata.scene8.cuepoint }
			];

			this.tweenTime = {

				_speed: 250,
				sideHideX: -100,
				sideShowX: 50,
				buttonDistance: 70,
				buttonVertGap: 5,

			};

			//calculate the max bar height
			this.maxBarHeight = ( (this.buttonLinks.length-1)*this.tweenTime.buttonDistance - this.tweenTime.buttonVertGap);

			this.view = null;
			this.setup();

			this.updateProcess(0.96);

			this.isAnimating = false;
			this.isSideHidden = false;

		}

		ns.Navi = Navi;

		var p = Navi.prototype = new EventDispatcher();

		p.setup = function() {


			this.topview = this.setupTop();
			this.sideview = this.setupSide();
		}

		p.updateProcess = function(e) {

			this.redbar.style.height = this.maxBarHeight * e + 'px';
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
			vTemp.style.left = this.tweenTime.sideShowX + 'px';
			vTemp.style.top = '100px';
			vTemp.style.width = "26px";
			vTemp.style.height = ( this.maxBarHeight + this.tweenTime.buttonVertGap*2 ) + "px";

			var redbar = this.createlines(this.maxBarHeight, settings.defaultBrandRed, false);
			var bluebar = this.createlines(this.maxBarHeight, settings.defaultBrandBlue, true);
			this.bluebar = vTemp.appendChild(bluebar);
			this.redbar = vTemp.appendChild(redbar);

			var butLen = this.buttonLinks.length;
			for (var i=0; i<butLen; i++) {
				var bBut = this.createButton(i*70, i, false);
				vTemp.appendChild(bBut);

				var rBut = this.createButton(i*70, i, true);
				vTemp.appendChild(rBut);
			}

			return vTemp;
		}

		p.createButton = function(y, id, isRed) {
			var vTemp = document.createElement('div');
			vTemp.id = id;
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
			vTemp.id = 'redbar';
			vTemp.style.position = 'absolute';
			vTemp.style.left = '9px';
			//check if it should align from top or bottom
			if(isAlignTop) {
				vTemp.style.top = this.tweenTime.buttonVertGap + 'px';
			}
			else {
				vTemp.style.bottom = this.tweenTime.buttonVertGap + 'px';
			}
			vTemp.style.background = color;
			vTemp.style.width = '7px';
			vTemp.style.height = ( height ) + 'px';
			return vTemp;
		}

		p.hideSide = function() {

			if(this.isAnimating || this.isSideHidden) return;
			console.log('hide me');
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
			console.log('show me');
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
			console.log(obj.x)
			this.sideview.style.left = obj.x + 'px';
		}

		p.showComplete = function(e, obj) {
			this.isAnimating = false;
			this.isSideHidden = false;
		}

		p.update = function(frame) {
			// console.log(frame);
		}



	}



})();