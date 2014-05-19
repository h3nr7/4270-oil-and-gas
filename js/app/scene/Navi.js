(function() {

	var ns = MKK.getNamespace('app.scene');
	var EventDispatcher = MKK.getNamespace('mkk.event.EventDispatcher');

	if(!ns.Navi) {

		var Navi = function Navi() {

			this.view = null;
			this.setup()
		}

		ns.Navi = Navi;

		var p = Navi.prototype = new EventDispatcher();

		p.setup = function() {

			//create container
			var vTemp = document.createElement('div');
			vTemp.style.position = 'absolute';
			vTemp.style.left = '0px';
			vTemp.style.top = '0px';
			vTemp.style.background = 'white';
			vTemp.style.paddingTop = "7px";
			vTemp.style.width = "1024px";
			vTemp.style.height = "40px";
			vTemp.innerHTML = '<img style="position: absolute; left: 10px;" src="images/exxon_logo.png"/><img style="position: absolute; right: 10px;" src="images/mobile_logo.png"/>';

			this.view = vTemp;
		}



	}



})();