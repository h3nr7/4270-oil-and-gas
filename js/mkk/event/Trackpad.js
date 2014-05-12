(function(){

	var ns = MKK.getNamespace('mkk.event');
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var EventDispatcher = MKK.getNamespace('mkk.event').EventDispatcher;

	if (!ns.Trackpad) {

		var Trackpad = function Trackpad(target) {

			//vars
			this.target = target;
			this.value = 0;
			this.easingValue = 0;
			this.easingMin = -10700;
			this.speedDamper = 0.9;
			this.dragOffset;
			this.dragging;
			this.speed = 0;
			this.prevPosition = 0;
		}


		ns.Trackpad = Trackpad;
		var p = Trackpad.prototype = new EventDispatcher();


		p.setup = function() {

			console.log('Trackpad setup');
			var that = this;

			// Mouse Handler
			console.log(this.listener);
			this.mousedownBound = ListenerFunctions.createListenerFunction(this, this.mousedownHandler);
			this.target.addEventListener('mousedown', this.mousedownBound);
			this.mouseupBound = ListenerFunctions.createListenerFunction(this, this.mouseupHandler);
			this.target.addEventListener('mouseup', that.mouseupBound);

			// Mouse Wheel Handler
			this.mousewheelBound = ListenerFunctions.createListenerFunction(this, this.mousewheelHandler);
			this.target.addEventListener('mousewheel', this.mousewheelBound);

			// Touch Handler
			this.touchStartBound = ListenerFunctions.createListenerFunction(this, this.touchstartHandler);
			this.target.addEventListener('touchstart', this.touchstartBound);

			this.touchmoveBound = ListenerFunctions.createListenerFunction(this, this.touchmoveHandler);

			this.touchendBound = ListenerFunctions.createListenerFunction(this, this.touchendHandler);


			//on arrow button pressed
			this.onarrowBound = ListenerFunctions.createListenerFunction(this, this.onArrowHandler);
			document.body.addEventListener('keydown', this.onarrowBound);

		}

		p.unlock = function() {
			this.locked = false;
			this.speed = 0;
			this.easingValue = this.value;
		}

		p.lock = function() {

			this.locked = true;
		}

		p.update = function() {

			if (this.easingValue > 0) this.easingValue=0;
			if (this.easingValue < this.easingMin) this.easingValue = this.easingMin;
			this.value = this.easingValue;

			if (this.dragging) {
				var newSpeed = this.easingValue - this.prevPosition;
				this.prevPosition = this.easingValue;
			}
			else {
				this.speed *= this.speedDamper;
				this.easingValue += this.speed;

				if(Math.abs(this.speed) < 1) this.speed=0;

			}
		}

		p.startDrag = function(newPosition) {
			if(!this.locked) return;
			this.dragging = true;
			this.dragOffset = newPosition - this.value;

		}

		p.endDrag = function(newPosition) {
			if(this.locked) return;
			this.dragging = false;
		}

		p.updateDrag = function(newPosition) {
			if(this.locked) return;
			this.easingValue = (newPosition - this.dragOffset);
		}





		// ----------------------------------------
		// Event Handlers
		// ----------------------------------------
		p.mousedownHandler = function(e) {
			if(e) e.preventDefault();

			e.returnValue=false;

			this.mousemoveBound = ListenerFunctions.createListenerFunction(this, this.mousemoveHandler);
			this.target.addEventListener('mousemove', this.mousemoveBound);


		}

		p.mouseupHandler = function(e) {

		}

		p.mousewheelHandler = function(e) {
			e.preventDefault();
			this.speed = e.wheelDelta * 0.1;
			
		}

		p.onArrowHandler = function(event) {
			if (event.keyCode == 38) {
				this.speed +=4;
			}
			else if (event.keyCode == 40) {
				this.speed -=4;
				return false;
			}
		}

		p.mousemoveHandler = function(e) {

			if(e) e.preventDefault();
			this.updateDrag(e.pageY);
		}

		p.mouseupHandler = function(e) {
			this.target.removeEventListener('mousemove', this.mousemoveBound);
			this.target.removeEventListener('mouseup', this.mouseupHandler);

			this.endDrag();
		}

		p.touchstartHandler = function(e) {
			this.target.addEventListener('touchmove', this.touchmoveBound);
			this.target.addEventListener('touchend', this.touchendBound);
			this.endDrag();
		}

		p.touchmoveHandler = function(e) {
			e.preventDefault();
			this.updateDrag(e.touches[0].clientY);
		}

		p.touchendHandler = function(e) {
			this.target.removeEventListener('touchmove', this.touchmoveBound);
			this.target.removeEventListener('touchend', this.touchendBound);
			this.endDrag();
		}




	}





})();