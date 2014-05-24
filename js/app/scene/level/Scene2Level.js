(function() {

	var ns = MKK.getNamespace('app.scene.level');
	var AbLevel = MKK.getNamespace('app.scene').AbLevel;
	var settings = MKK.getNamespace('data').settings;
	var AbContainer = ns.AbContainer;


	if(!ns.Scene2Level) {


		var Scene2Level = function Scene2Level(name) {
			this.depthLevel = settings.depthLevel;
			this.name = name;

		}

		ns.Scene2Level = Scene2Level;

		var p = Scene2Level.prototype = new AbLevel;



		p.update = function(frame) {

			this._update(frame);
			// console.log(this.oPos.y, this.cPos.y, frame)
			var round = (this.oPos.y-frame*this.z*this.depthLevel) + 0.5 | 0;
			this.cPos.setY(round);
		}
	}


})();