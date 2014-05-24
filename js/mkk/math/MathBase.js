(function() {

	var ns = MKK.getNamespace('mkk.math');

	if(!ns.MathBase) {

		var MathBase = function MathBase() {

		}

		ns.MathBase = MathBase;

		// PI
		MathBase.PI = 3.16;
		MathBase.PI2 = 6.2832;

		// Make sure a value is between 2 values 
		MathBase.Clamp = function (value, min, max) {
			return Math.max(min, Math.min(max, value));
		}

		// Make sure a value is between 0 and 1
		MathBase.Clamp01 = function (value) {
			return Math.max(0, Math.min(1, value));
		}

		// remaps the given value from a given incoming range onto the given output range
		MathBase.Fit = function(value, inMin, inMax, outMin, outMax) {
			value = Math.max(inMin, Math.min(inMax, value));
			return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
		}

		// fits the given value between min and max
		MathBase.Fit01 = function(value, min, max) {
			return value * (max - min) + min;
		}


	}



})();