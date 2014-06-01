(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var AbElement = MKK.getNamespace('app.scene').AbElement;
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var MathBase = MKK.getNamespace('mkk.math').MathBase;

	if(!ns.ElRotatingSprite) {

		var ElRotatingSprite = function ElRotatingSprite(name, x, y, z, velo, aX, aY) {

			this.name = name;
			this.z = z;
			this.setup(x, y);
			this.container = PIXI.Sprite.fromFrame(name);
			this.container.position = this.cPos;
			this.container.anchor.x = aX || 0;
			this.container.anchor.y = aY || 0;
			this._velocity = velo || 1000;
			this._direction = 1;
			if(this._velocity<0) this._direction = -1;
			this._speed = Math.abs(this._velocity);
			this._repeat = Infinity;


			var tweenUpdateBound = ListenerFunctions.createListenerFunction(this, this.tweenUpdate);
			this.tweener = new TWEEN.Tween({rotation:0})
								.to({ rotation: 1 }, this._speed)
								.onUpdate(tweenUpdateBound);

		}	

		ns.ElRotatingSprite = ElRotatingSprite;

		var p = ElRotatingSprite.prototype = new AbElement();

		p.start = function() {
			this.tweener.repeat(this._repeat).start();
		}

		p.update = function() {

		}

		p.tweenUpdate = function(e) {

			this.container.rotation = e*MathBase.PI2 * this._direction;

		}


		p.repeat = function(re) {
			if(re) this._repeat = re;
			return this._repeat;
		}

		p.velocity = function(sp) {
			if(sp) this._velocity = sp;
			return this._velocity;
		}

	}


})();