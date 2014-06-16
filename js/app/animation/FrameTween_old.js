(function(){

	var ns = MKK.getNamespace('app.animation');


	if(!ns.FrameTween) {

		var FrameTween = function FrameTween() {

		}

		ns.FrameTween = FrameTween;

		FrameTween._tweens = [];
		FrameTween.curFrame = 0;

		FrameTween.add = function( tTween ) {
			FrameTween._tweens.push(tTween);
		}

		FrameTween.remove = function( tTween ) {
			var i = FrameTween._tweens.indexOf( tTween );
			if ( i !== -1 ) {
				FrameTween._tweens.splice( i, 1 );
			}
		}

		FrameTween.update = function( cFrame ) {

			FrameTween.curFrame = cFrame;
			if ( FrameTween._tweens.length === 0 ) return false;
			var i = 0;

			while ( i < FrameTween._tweens.length) {
				if ( FrameTween._tweens[ i ].update( cFrame ) ) {
					i++;
				} else {
					FrameTween._tweens.splice( i, 1 );
				}
			}
			return true;
		}

	}



})();