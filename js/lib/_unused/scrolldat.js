/**
 * @author monKiKi / http://monkiki.co
 */


var ScrollDat = function() {


	var body = document.getElementsByTagName('body')[0];
	var container = document.createElement('div');
	var indicator = document.createElement('div');


	var currentY = 0;
	var browserWidth = 0;
	var browserHeight = 0;
	container.style.cssText = [
									'position: fixed;',
									'width: 80px;',
									'height: 40px;',
									'background: rgba(0,0,0,0.7);',
									'left: 0px;',
									'bottom: 0px;'
								].join('');

	indicator.style.cssText = [
									'position: relative;',
									'width: 70px;',
									'height: auto;',
									'text-align: left;',
									'margin: 5px auto;',
									'color: rgb(0,255,255);',
									'font-family: helvetica, sans-serif;',
									'font-size: 10px;' 
								].join('');


	container.appendChild(indicator);


	return {

		domElement: container,


		end: function(yY) {

			var w = window,
			    d = document,
			    e = d.documentElement,
			    g = d.getElementsByTagName('body')[0];

			browserWidth = w.innerWidth|| e.clientWidth|| g.clientWidth;
			browserHeight = w.innerHeight|| e.clientHeight|| g.clientHeight;

			indicator.innerHTML =  '<p>s: ' + yY + 'px<p/><p>w: ' + browserWidth  + 'px</p><p>h: ' +browserHeight+ 'px</p>';
		},

		update: function(yY) {
			this.end(yY);
		}
	}
}
