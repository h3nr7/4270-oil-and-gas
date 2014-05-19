(function() {

	var ns = MKK.getNamespace('app.scene');
	var settings = MKK.getNamespace('data').settings;
	var AbContainer = ns.AbContainer;


	if(!ns.AbLevel) {


		var AbLevel = function AbLevel(name) {
			this.name = name;
			this.scene = null;
			// this.container = null;
			this.isTiltable = false;
			this.depthLevel = settings.depthLevel;
			this.z = 0;
			this.element = [];
		}


		ns.AbLevel = AbLevel;

		var p = AbLevel.prototype = new AbContainer();


		p.setup = function(x, y, z) {
			console.log('lala2')
			this._setup(x, y);
			if( z!=null || z!=undefined ) this.z = z;	
		}

		// p._setup = function(x, y, z) {
		// 	this._setup(x, y);
		// 	if( z!=null || z!=undefined ) this.z = z;			
		// }

		p.init = function(scene) {

			this._init();

		}

		p.addElement = function(el) {
			this.element.push(el);
			this.container.addChild(el);
		}

		p.removeElement = function(el) {
			var index = this.level.indexOf(el);
			if( index > -1 ) {
				this.container.removeChild(el);
				this.oLevel.splice(index,1);
			}		
		}

		p.update = function(frame) {
			this._update(frame);

			//update all elements
			var el = this.element;
			var elLen = this.element.length;
			for(var i=0; i<elLen; i++) {
				// el[i].y = this.
			}

		}
	

	}


})();