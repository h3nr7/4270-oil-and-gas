(function(){

	var ns = MKK.getNamespace('mkk.event');
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var EventDispatcher = MKK.getNamespace('mkk.event').EventDispatcher;

	if (!ns.Trackpad) {

		var Trackpad = function Trackpad(target) {

			//vars
			this.target = target;
			this.speedDamper = 0.92;
			this.dragOffset = 0;;
			this.dragging;
			this.speed = 0;
			this.touchStartX = 0;
			this.touchStartY = 0;
			this.touchDate = 0;
		}


		ns.Trackpad = Trackpad;
		var p = Trackpad.prototype = new EventDispatcher();


		p.setup = function() {

			console.log('Trackpad setup');

			// Mouse Wheel Handler
			this.mousewheelBound = ListenerFunctions.createListenerFunction(this, this.mousewheelHandler);
			this.target.addEventListener('mousewheel', this.mousewheelBound);

			// Touch Handler
			this.touchStartBound = ListenerFunctions.createListenerFunction(this, this.touchstartHandler);
			this.target.addEventListener('touchstart', this.touchStartBound);

			this.touchMoveBound = ListenerFunctions.createListenerFunction(this, this.touchmoveHandler);
			this.touchEndBound = ListenerFunctions.createListenerFunction(this, this.touchendHandler);


			//on arrow button pressed
			this.onarrowBound = ListenerFunctions.createListenerFunction(this, this.onArrowHandler);
			document.body.addEventListener('keydown', this.onarrowBound);

		}

		p.unlock = function() {
			this.locked = false;
			this.speed = 0;
		}

		p.lock = function() {
			this.locked = true;
		}

		p.update = function() {

			// if (this.dragging) {
			// 	// this.speed *= this.speedDamper;
			// }
			// else {
				this.speed *= this.speedDamper;
			// }

			if(Math.abs(this.speed) < 1) this.speed=0;
		}

		p.startDrag = function(e) {
			if(this.locked) return;
			this.dragging = true;
			this.touchStartX = e.touches[0].pageX;
			this.touchStartY = e.touches[0].pageY;
			this.touchDate = Date.now();
		}

		p.endDrag = function(e) {
			if(this.locked) return;
			this.dragging = false;
			this.touchDate = null;
			// console.log(this.speed);
		}

		p.updateDrag = function(e) {
			if(this.locked || !this.touchDate) return;
			var offset = {};
			offset.x = this.touchStartX - e.touches[0].pageX;
			var t = Date.now() - this.touchDate;
			// Get distance finger has moved since swipe begin:
			offset.y = this.touchStartY - e.touches[0].pageY;
			this.speed = ( Math.abs(offset.y)>0 ) ? ( offset.y/(t/200) ) : 0; //if statement ti avoid division by 0
			// console.log(this.touchStartY, e.touches[0].pageY, t, this.touchDate, this.speed);
		}





		// ----------------------------------------
		// Event Handlers
		// ----------------------------------------

		p.mousewheelHandler = function(e) {
			e.preventDefault();
			this.speed = e.wheelDelta * this.speedDamper;
			
		}

		p.onArrowHandler = function(event) {
			if (event.keyCode == 38) {
				this.speed +=70;
			}
			else if (event.keyCode == 40) {
				this.speed -=70;
				return false;
			}
		}

		p.touchstartHandler = function(e) {
			this.startDrag(e);
			this.target.addEventListener('touchmove', this.touchMoveBound);
			this.target.addEventListener('touchend', this.touchEndBound);
		}

		p.touchmoveHandler = function(e) {
			e.preventDefault();
			this.updateDrag(e);
		}

		p.touchendHandler = function(e) {
			this.target.removeEventListener('touchmove', this.touchmoveBound);
			this.target.removeEventListener('touchend', this.touchendBound);
			this.endDrag(e);
		}




	}





})();