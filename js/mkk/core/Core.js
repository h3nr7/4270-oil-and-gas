(function() {

	var ns = MKK.getNamespace('mkk.core');
	var EventDispatcher = MKK.getNamespace('mkk.event').EventDispatcher;

	if(!ns.Core) {

		var Core = function() {


		}

		ns.Core = Core;
		var p = Core.prototype = new EventDispatcher();

		p.setup = function() {
			this._setup();
		}

		p._setup = function() {
			console.log('Core Setup :: ');
		}

		//function to disable scroller
		p.disableScrollBars = function() {
			document.documentElement.style.overflow = 'hidden';  // firefox, chrome
    		document.body.scroll = "no"; // ie only
		}
	}
})();