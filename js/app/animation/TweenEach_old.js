(function(){

	var ns = MKK.getNamespace('app.animation');
	var FrameTween = ns.FrameTween;
	var EventDispatcher = MKK.getNamespace('mkk.event').EventDispatcher;

	if(!ns.TweenEach) {

		var TweenEach = function TweenEach(object) {

			this._object = object;
			// ----------------------------
			// Frame specific variables
			// ----------------------------
			this._scrubbable = true;
			// ----------------------------
			this._valuesStart = {};
			this._valuesEnd = {};
			this._valuesStartRepeat = {};
			this._duration = 1000;
			this._repeat = 0;
			this._yoyo = false;
			this._isPlaying = false;
			this._reversed = false;
			this._delayTime = 0;
			this._startTime = null;
			this._easingFunction = TWEEN.Easing.Linear.None;
			this._interpolationFunction = TWEEN.Interpolation.Linear;
			this._chainedTweens = [];
			this._onStartCallback = null;
			this._onStartCallbackFired = false;
			this._onUpdateCallback = null;
			this._onCompleteCallback = null;
			this._onStopCallback = null;

			// Set all starting values present on the target object
			for ( var field in object ) {
				this._valuesStart[ field ] = parseFloat(object[field], 10);
			}

		}

		ns.TweenEach = TweenEach;

		var p = TweenEach.prototype = new EventDispatcher();


		p.to = function ( properties, duration ) {

			if ( duration !== undefined ) {

				this._duration = duration;

			}
			this._valuesEnd = properties;
			return this;
		};

		p.start = function ( time ) {

			FrameTween.add( this );
			this._isPlaying = true;

			this._onStartCallbackFired = false;

			this._startTime = time || 0;
			this._startTime += this._delayTime;

			for ( var property in this._valuesEnd ) {

				// check if an Array was provided as property value
				if ( this._valuesEnd[ property ] instanceof Array ) {

					if ( this._valuesEnd[ property ].length === 0 ) {

						continue;

					}

					// create a local copy of the Array with the start value at the front
					this._valuesEnd[ property ] = [ this._object[ property ] ].concat( this._valuesEnd[ property ] );

				}

				this._valuesStart[ property ] = this._object[ property ];

				if( ( this._valuesStart[ property ] instanceof Array ) === false ) {
					this._valuesStart[ property ] *= 1.0; // Ensures we're using numbers, not strings
				}

				this._valuesStartRepeat[ property ] = this._valuesStart[ property ] || 0;

			}

			return this;

		};

		p.stop = function () {

			if ( !this._isPlaying ) {
				return this;
			}

			FrameTween.remove( this );

			this._isPlaying = false;

			if ( this._onStopCallback !== null ) {

				this._onStopCallback.call( this._object );

			}

			this.stopChainedTweens();
			return this;

		};

		p.tweenVars = function() {
			return this._object;
		}

		p.scrub = function(scrub) {
			this._scrubbable = scrub;
			return this;
		}

		p.stopChainedTweens = function () {

			for ( var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++ ) {

				this._chainedTweens[ i ].stop();

			}

		};

		p.delay = function ( amount ) {

			this._delayTime = amount;
			return this;

		};

		p.repeat = function ( times ) {

			this._repeat = times;
			return this;

		};

		p.yoyo = function( yoyo ) {

			this._yoyo = yoyo;
			return this;

		};


		p.easing = function ( easing ) {

			this._easingFunction = easing;
			return this;

		};

		p.interpolation = function ( interpolation ) {

			this._interpolationFunction = interpolation;
			return this;

		};

		p.chain = function () {

			this._chainedTweens = arguments;
			return this;

		};

		p.onStart = function ( callback ) {

			this._onStartCallback = callback;
			return this;

		};

		p.onUpdate = function ( callback ) {

			this._onUpdateCallback = callback;
			return this;

		};

		p.onComplete = function ( callback ) {

			this._onCompleteCallback = callback;
			return this;

		};

		p.onStop = function ( callback ) {

			this._onStopCallback = callback;
			return this;

		};

		p.update = function ( time ) {

			var property;

			if ( time < this._startTime ) {
				return true;
			}

			if ( this._onStartCallbackFired === false ) {

				if ( this._onStartCallback !== null ) {

					this._onStartCallback.call( this._object );

				}
				this._onStartCallbackFired = true;
			}

			var elapsed = ( time - this._startTime ) / this._duration;


			elapsed = elapsed > 1 ? 1 : elapsed;


			var value = this._easingFunction( elapsed );


			for ( property in this._valuesEnd ) {

				var start = this._valuesStart[ property ] || 0;
				var end = this._valuesEnd[ property ];

				if ( end instanceof Array ) {

					this._object[ property ] = this._interpolationFunction( end, value );

				} else {

					// Parses relative end values with start as base (e.g.: +10, -3)
					if ( typeof(end) === "string" ) {
						end = start + parseFloat(end, 10);
					}

					// protect against non numeric properties.
					if ( typeof(end) === "number" ) {
						this._object[ property ] = start + ( end - start ) * value;
					}

				}

			}

			if ( this._onUpdateCallback !== null && time>=this._startTime && time<(this._startTime+this._duration) ) {

					this._onUpdateCallback.call( this._object, value );

			}

			if ( elapsed == 1 ) {

				if ( this._repeat > 0 || this._scrubbable) {

					if( isFinite( this._repeat ) ) {
						this._repeat--;
					}

					// reassign starting values, restart by making startTime = now
					for( property in this._valuesStartRepeat ) {

						if ( typeof( this._valuesEnd[ property ] ) === "string" ) {
							this._valuesStartRepeat[ property ] = this._valuesStartRepeat[ property ] + parseFloat(this._valuesEnd[ property ], 10);
						}

						if (this._yoyo) {
							var tmp = this._valuesStartRepeat[ property ];
							this._valuesStartRepeat[ property ] = this._valuesEnd[ property ];
							this._valuesEnd[ property ] = tmp;
						}

						this._valuesStart[ property ] = this._valuesStartRepeat[ property ];

					}

					if (this._yoyo) {
						this._reversed = !this._reversed;
					}

					if(!this._scrubbable) this._startTime = time + this._delayTime;


					return true;

				} 
				else {

					if ( this._onCompleteCallback !== null ) {

						this._onCompleteCallback.call( this._object );

					}

					for ( var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++ ) {

						this._chainedTweens[ i ].start( time );

					}

					return false;

				}

			}

			return true;

		};
		

	}





})();