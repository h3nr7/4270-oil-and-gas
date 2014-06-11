(function() {
	
	// ------------------------------------
	// LIBRARIES
	// ------------------------------------
	var ns = MKK.getNamespace('app.scene');
	var data = MKK.getNamespace('data');
	var copydata = data.copydata;
	var scenedata = data.scenedata;
	var styledata = data.styledata;
	var settings = data.settings;
	var AbScene = ns.AbScene;
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;

	var Scene1Level = ns.level.Scene1Level;
	var ElSprite = ns.element.ElSprite;
	var ElText = ns.element.ElText;
	var ElRect = ns.element.ElRect;


	var FrameTween = MKK.getNamespace('app.animation').FrameTween;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;


	if(!ns.Scene1) {

		// ------------------------------------
		// CONSTRUCTOR
		// ------------------------------------
		var Scene1 = function Scene1() {

			this.tweenTime = {
				_speed: 500,

				startTime1: 2200
			};

		}

		ns.Scene1 = Scene1;
		var p = Scene1.prototype = new AbScene();

		// ------------------------------------
		// FUNCTIONS
		// ------------------------------------
		//open when init is completed
		p.open = function() {

			this.createLevels(scenedata.scene1.level, Scene1Level);


			// ----------------------------------------
			//Styling text
			// ----------------------------------------
			var strapStyle = styledata.straplinegrey;
			var symStyle = styledata.symbolTitle;
			var symStyle2 = styledata.symbolTitle2;
			var symStyle3 = styledata.symbolTitle3;
			var disclaimStyle = styledata.disclaimTitle;

			//copy scene1
			var copies = copydata.scene1;


			//create elements
			var cloud1 = new ElSprite("cloud_satellite.png", 100,100, 0);
			var logo1 = new ElSprite("cloud_text1.png", 512,374, 0, 0.5, 0.5);
			var arrow1 = new ElSprite("cloud_text1c.png", 512,454, 0, 0.5, 0.5);

			var txt1 = new ElText("Start by scrolling here", 512,414, 0, 0.5, 0.5);
			txt1.setStyle({"font":"12px EMPrintW01-regular"});


			var txt2 = new ElText(copies.line1, 512,900, 0, 0.5, 0.5);
			txt2.setStyle(strapStyle);

			var txt3 = new ElText(copies.line2, 512,2000, 0, 0.5, 0.5);
			txt3.setStyle(strapStyle);


			var txt4 = new ElText(copies.line3, 512,2000, 0, 0.5, 0.5);
			txt4.setStyle(strapStyle);

			var txt5 = new ElText(copies.line4, 512,3600, 0, 0.5, 0.5);
			txt5.setStyle(strapStyle);

			var disclaimTxt1 = new ElText(copies.line4b, 512,4100, 0, 0.5, 0.5);
			disclaimTxt1.setStyle(disclaimStyle);


			var cloud2 = new ElSprite("cloud_blue1.png", 100,580, 0);
			var cloud3 = new ElSprite("cloud_grey1.png", 600,1280, 0);
			var cloud4 = new ElSprite("cloud_white1.png", 630,1520, 0);
			var cloud5 = new ElSprite("cloud_white2.png", 60,1490, 0);
			var cloud6 = new ElSprite("cloud_grey2.png", 0,2780, 0);
			// var cloud7 = new ElSprite("cloud_blue1.png", 800,2320, 0);

			var symbol1 = new ElSprite("cloud_icon_safety.png", 322,3730, 0);
			var symbol2 = new ElSprite("cloud_icon_environmental.png", 470,3730, 0);
			var symbol3 = new ElSprite("cloud_icon_productivity.png", 622,3730, 0);

			this.symTxt1 = new ElText(copies.symbolline1, 357,3820, 0, 0.5, 0.5);
			this.symTxt2 = new ElText(copies.symbolline2, 506,3820, 0, 0.5, 0.5);
			this.symTxt3 = new ElText(copies.symbolline3, 655,3820, 0, 0.5, 0.5);
			this.symTxt1.setStyle(symStyle);
			this.symTxt2.setStyle(symStyle);
			this.symTxt3.setStyle(symStyle);

			var logo2 = new ElSprite("mobile_shc_small.png", 180,4280, 0, 0.5, 0.5);
			var logo3 = new ElSprite("mobile_grease_small.png", 518,4280, 0, 0.5, 0.5);
			var logo4 = new ElSprite("signum_small.png", 850,4295, 0, 0.5, 0.5);

			var symTxt4 = new ElText(copies.line5, 512,4400, 0, 0.5, 0.5);
			symTxt4.setStyle(symStyle2);

			var symTxt5 = new ElText(copies.line6, 512,4470, 0, 0.5, 0.5);
			var symTxt6 = new ElText(copies.line7, 512,4540, 0, 0.5, 0.5);
			var symTxt7 = new ElText(copies.line8, 512,4610, 0, 0.5, 0.5);
			var symTxt8 = new ElText(copies.line9, 512,4680, 0, 0.5, 0.5);
			symTxt5.setStyle(symStyle3);
			symTxt6.setStyle(symStyle3);
			symTxt7.setStyle(symStyle3);
			symTxt8.setStyle(symStyle3);

			var cloud8 = new ElSprite("cloud_white2.png", 50, 2700, 0);
			var cloud9 = new ElSprite("cloud_blue1.png", 800,3710, 0);
			var cloud10 = new ElSprite("cloud_white1.png", -100, 3200, 0);


			//add to level 1
			this.level[0].addElement(txt2.container);
			this.level[0].addElement(txt4.container);
			this.level[0].addElement(cloud4.container);
			this.level[0].addElement(cloud8.container);
			this.level[0].addElement(cloud10.container);

			//add to level 2
			this.level[1].addElement(logo1.container);
			this.level[1].addElement(txt1.container);
			this.level[1].addElement(cloud3.container);
			this.level[1].addElement(txt3.container);
			this.level[1].addElement(txt5.container);
			this.level[1].addElement(disclaimTxt1.container);
			//symbols
			this.level[1].addElement(symbol1.container);
			this.level[1].addElement(symbol2.container);
			this.level[1].addElement(symbol3.container);

			this.level[1].addElement(this.symTxt1.container);
			this.level[1].addElement(this.symTxt2.container);
			this.level[1].addElement(this.symTxt3.container);
			//logos and final part
			this.level[1].addElement(logo2.container);
			this.level[1].addElement(logo3.container);
			this.level[1].addElement(logo4.container);
			this.level[1].addElement(symTxt4.container);
			this.level[1].addElement(symTxt5.container);
			this.level[1].addElement(symTxt6.container);
			this.level[1].addElement(symTxt7.container);
			this.level[1].addElement(symTxt8.container);



			//add to level 3
			this.level[2].addElement(cloud1.container);
			this.level[2].addElement(cloud2.container);
			this.level[2].addElement(arrow1.container);
			this.level[2].addElement(cloud5.container);
			this.level[2].addElement(cloud6.container);
			this.level[2].addElement(cloud9.container);

			this.addLevel(this.level[0]);
			this.addLevel(this.level[1]);
			this.addLevel(this.level[2]);

			// var tT = new TweenEach({x:50});

			// tT.to({x:100}).onUpdate(function(va){

			// }).start(3000);
			
			// -------------------------
			//TWEENING
			// -------------------------
			// var tT = this.tweenTime;
			// var tween0Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc0);
			// this.tween0 = new TweenEach({alpha:0 })
			// 				.to({alpha:1}, tT._speed)
			// 				// .easing(TWEEN.Easing.Cubic.Out)
			// 				.onUpdate(tween0Bound)
			// 				.delay(this.startFrame + tT.startTime1).start();



		}


		// -------------------------
		// TWEENING FUNCTION
		// -------------------------
		p.tweenFunc0 = function(e) {
			cObj = this.tween0.tweenVars();
			this.symTxt1.opacity(this.tween0.alpha)
		}

		p.tweenFunc1 = function(e) {

		}

		p.tweenFunc2 = function(e) {

		}

		//close when destroyed
		p.close = function() {

		}

		p.update = function(frame) {

			this._update(frame);
			var cFrame = this.localCurFrame(frame);


			if(cFrame>=0 && cFrame<this.duration) {
				this.cPos.y = -cFrame;
			}

			this.level[0].update(cFrame);
			this.level[1].update(cFrame);
			this.level[2].update(cFrame);

		}



	}




})();