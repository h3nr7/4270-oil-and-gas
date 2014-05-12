(function() {
	
	var ns =  MKK.getNamespace('mkk.math');


	if (!ns.Easing) {

		var Easing = function Easing() {

		}

		ns.Easing = Easing;

		// ---------------------------
		// Global Vars
		// ---------------------------
		Easing._tweens = [];
		Easing.time = null;


		Easing.add = function( tween ) {
			Easing._tweens.push(tween);
		}

		Easing.remove = function( tween ) {

			var i= _tweens.indexOf( tween );
			if( i!== -1) {
				_tweens.splice( i, 1 );
			}
		}

		Easing.update = function(time) {

			Easing.time = time !== undefined ? time : ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() );
			while ( i < _tweens.length ) {
				if ( _tweens[i].update(time) ) {
					i++;
				}
				else {
					_tweens.splice(i, 1);
				}
			}
		}

		//------------------------
		// Ease function
		// -----------------------
		Easing.linear = function(t, obj, callback) {
			return t;
		}

		Easing.inQuad = function(t, obj, callback) {

		}

		Easing.outQuad = function() {

		}

		Easing.inCubic = function() {

		}

		Easing.outCubic = function() {

		}

		// -----------------------------
		//interpolation
		// -----------------------------
		Easing.Interpolation = {};

		Easing.Interpolation.linear = function() {

		}

		Easing.Interpolation.bezier = function() {

		}

		Easing.Interpolation.catMullRom = function() {

		}




	}



})();