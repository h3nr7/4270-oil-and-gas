(function(){

	var ns = MKK.getNamespace('mkk.event');
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var EventDispatcher = MKK.getNamespace('mkk.event').EventDispatcher;
	var Mathbase = MKK.getNamespace('mkk.math').MathBase;

	if (!ns.TouchEvent) {

		var TouchEvent = function TouchEvent(target, type, callback) {

			//vars
			this.target = target;
			this.type = type;
			this.callback = callback;

			switch (this.type) {

				case 'tap':
				default:
					this.setupTap();
					break;
				// case 'drag':
				// 	this.setupDrag();
				// 	break;
			}

		}


		ns.TouchEvent = TouchEvent;
		var p = TouchEvent.prototype = new EventDispatcher();


		p.setupTap = function() {

			var downEvent = ('ontouchstart' in window ? 'touchstart' : 'mousedown');
			var upEvent = ('ontouchend' in window ? 'touchend' : 'mouseup');

			var downBound = ListenerFunctions.createListenerFunction( this, this.downHandler );
			this.target.addEventListener( downEvent, downBound );

			var upBound = ListenerFunctions.createListenerFunction( this, this.upHandler );
			this.target.addEventListener( upEvent, upBound );


			
		}

		p.downHandler = function(e) {
			console.log('me down');
		}

		p.upHandler = function(e) {
			console.log('me up');
			this.callback.call(e);
		}

	}

})();