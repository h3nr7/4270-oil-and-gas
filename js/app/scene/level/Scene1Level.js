(function() {

	var ns = MKK.getNamespace('app.scene.level');
	var AbLevel = MKK.getNamespace('app.scene').AbLevel;
	var settings = MKK.getNamespace('data').settings;
	var AbContainer = ns.AbContainer;


	if(!ns.Scene1Level) {


		var Scene1Level = function Scene1Level(name) {
			this.depthLevel = settings.depthLevel;
		}

		ns.Scene1Level = Scene1Level;

		var p = Scene1Level.prototype = new AbLevel;

		p.setup = function(x, y, z) {
			this._preSetup(x, y, z);
			this.oPos.y = this.startFrame;
		}

		p.update = function(frame) {

			this._update(frame);
			// console.log(this.oPos.y, this.cPos.y, frame)
			this.cPos.setY(this.oPos.y-frame*this.z*this.depthLevel);
		}
	}


})();