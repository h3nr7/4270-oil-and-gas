(function() {
	
	// ------------------------------------
	// LIBRARIES
	// ------------------------------------
	var ns = MKK.getNamespace('app.scene');
	var EventDispatcher = MKK.getNamespace('mkk.event.EventDispatcher');

	if(!ns.Navi) {

		var Navi = function Navi() {

			this.buttonLinks = [

				{id:1, name: '', frame:0},
				{id:2, name: '', frame:0},
				{id:3, name: '', frame:0},
				{id:4, name: '', frame:0},
				{id:5, name: '', frame:0},
				{id:6, name: '', frame:0},
				{id:7, name: '', frame:0},
				{id:8, name: '', frame:0}
			]
			this.tweenTime = {

				_speed: 250,
				sideHideX: -100,
				sideShowX: 50,

			};

			this.view = null;
			this.setup();

			this.isAnimating = false;
			this.isSideHidden = false;

		}

		ns.Navi = Navi;

		var p = Navi.prototype = new EventDispatcher();

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
			vTemp.style.left = this.tweenTime.sideShowX + 'px';
			vTemp.style.top = '100px';
			vTemp.style.width = "26px";
			vTemp.style.height = "500px";

			var butLen = this.buttonLinks.length;
			for (var i=0; i<butLen; i++) {
				var tBut = this.createButtons(i*70, i);
				vTemp.appendChild(tBut);
			}

			return vTemp;
		}

		p.createButtons = function(y, id) {
			var vTemp = document.createElement('div');
			vTemp.id = id;
			vTemp.style.position = 'absolute';
			vTemp.style.left = '0px';
			vTemp.style.top = y + 'px';
			vTemp.style.background = 'url(images/nav-ball-red.png) center center no-repeat';
			vTemp.style.backgroundSize = '26px 26px'; 
			vTemp.style.width = "26px";
			vTemp.style.height = "26px";
			vTemp.style.cursor = 'pointer';
			return vTemp;
		}

		p.createlines = function() {
			var vTemp = document.createElement('div');
			vTemp.id = id;
			vTemp.style.position = 'absolute';
			vTemp.style.left = '0px';
			vTemp.style.top = '5px';
			vTemp.style.background = 'url(images/nav-ball-red.png) center center no-repeat';
			vTemp.style.backgroundSize = '26px 26px'; 
			vTemp.style.width = "26px";
			vTemp.style.height = "26px";
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



	}



})();