(function() {

	var ns = MKK.getNamespace('app.scene.element');
	var settings = MKK.getNamespace('data').settings;
	var AbContainer = MKK.getNamespace('app.scene').AbContainer;
	var ElSprite = ns.ElSprite;


	if(!ns.ElSpriteContainer) {


		var ElSpriteContainer = function ElSpriteContainer(name, sFrame, duration, x, y, z) {
			this.name = name;
			// this.container = null;
			this.isTiltable = false;
			this.depthLevel = settings.depthLevel;
			this.z = z || 0;
			this.sprite = [];
			this.element = [];
			this.setup(sFrame, duration, x, y, z);
		}


		ns.ElSpriteContainer = ElSpriteContainer;

		var p = ElSpriteContainer.prototype = new AbContainer();


		p.setup = function(sFrame, duration, x, y, z) {
			this._setup(sFrame, duration, x, y);
			if( z!=null || z!=undefined ) this.z = z;	
		}

		p.init = function() {

			this._init();

		}

		p.addSprite = function(name, x, y, z, aX, aY) {
			var tmp = new ElSprite(name, x, y, z, aX, aY);
			this.sprite.push(tmp);
			this.container.addChild(tmp.container);
			return tmp;
		}

		p.addElement = function(obj) {
			this.element.push(obj);
			this.container.addChild(obj);
		}

		p.update = function(frame) {
			this._update(frame);

			//update all sprites
			var el = this.sprite;
			var elLen = this.sprite.length;
			for(var i=0; i<elLen; i++) {
				// el[i].y = this.
			}

		}
	

	}


})();