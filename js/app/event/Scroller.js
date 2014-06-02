(function(){

	var EventDispatcher = MKK.getNamespace('mkk.event').EventDispatcher;
	var ns = MKK.getNamespace('app.event');
	var Trackpad = MKK.getNamespace('mkk.event').Trackpad;


	if (!ns.Scroller) {

		var Scroller = function Scroller() {

			this.gui = null;
			this.view = null;
			this.isStop = false;
			this.isDebug = false;
			this.scrollSpeed = 0.05;
			this.distance = 0;
			this.speedRange = 10000;
		}

		ns.Scroller = Scroller;
		var p = Scroller.prototype = new EventDispatcher();
		var s = EventDispatcher.prototype;


		p.debug = function(gui) {

			this.gui = gui;
			this.isDebug = true;
			this.f1 = this.gui.addFolder('Easing & Interpolation');
			this.f1.add(this, 'scrollSpeed', 0.01, 0.2);

			// this.f1.open();

			this.scrollDisplay = document.createElement('div');
			this.scrollDisplay.style.background = 'rgb(0, 0, 34)';
			this.scrollDisplay.style.width = '60px';
			this.scrollDisplay.style.height = '14px';
			this.scrollDisplay.style.display = 'block';
			this.scrollDisplay.style.position = 'absolute';
			this.scrollDisplay.style.left = '0px';
			this.scrollDisplay.style.bottom = '0px';
			this.scrollDisplay.style.padding = '17px 10px';
			this.scrollDisplay.style.fontFamily = 'Arial';
			this.scrollDisplay.style.fontSize = '11px';
			this.scrollDisplay.style.color = 'rgb(0, 255, 255)';
			this.scrollDisplay.style.textAlign = 'center';

			document.body.appendChild(this.scrollDisplay);
	
		}

		p.setup = function(view) {
			this.view = view;
			this.tp = new Trackpad(this.view);
			this.tp.setup();
		}


		p.start = function() { this.isStop = false; }
		p.stop = function() { this.isStop = true; }

		p.getDistance = function() {
			return Math.round(this.distance);
		}

		p.update = function() {

			if (this.isDebug) this.scrollDisplay.innerHTML = Math.round(this.distance) + 'px';

			if(!this.isStop) {
				// console.log(this.distance, this.tp.speed)
				this.distance += (this.tp.speed*this.scrollSpeed);
				if (this.distance<0) {
					this.distance = 0;
				}
				else if (this.distance>=this.scrollMax) {
					this.distance = this.scrollMax;
				}
				this.tp.update();

			}
		}	


	}


})();