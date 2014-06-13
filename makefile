##############################
#NPM TOOLS
##############################
SPRITESHEET=node_modules/.bin/spritesheet-js
UGLIFY=node_modules/.bin/uglifyjs

##############################
#PATHS
##############################
JSSOURCE=js
ASSETSPATH=assets
DEPLOYPATH=deploy/assets
OUTPATH=deploy/assets

##############################
#SPRITE SHEET VARS
##############################
SSFORMAT="pixi.js"
TRIM="false"
GAP="true"

##############################
#UGLIFY VARS
##############################
#3rd PARTY LIBS
LIB.DEBUG.IN =${JSSOURCE}/lib/debug/*.js
LIB.IN = ${JSSOURCE}/lib/*.js
#SITE MANAGER
SITEMANAGER.IN = ${JSSOURCE}/app/SiteManager.js
#MKK LIBS
MKK.EVENT.IN = ${JSSOURCE}/mkk/event/*.js
MKK.CORE.IN = ${JSSOURCE}/mkk/core/*.js
MKK.MATH.IN = ${JSSOURCE}/mkk/math/*.js
MKK.PHYS.IN = ${JSSOURCE}/mkk/physics/*.js

MKK.IN = ${MKK.MATH.IN} ${MKK.EVENT.IN} ${MKK.CORE.IN} ${MKK.PHYS.IN}

##############################
#APP 
##############################

#APP Events and Animation
APPEVENT.IN = ${JSSOURCE}/app/event/*.js
APPANIM.IN = ${JSSOURCE}/app/animation/*.js

#APP Scene
APPSCENE.PATH = ${JSSOURCE}/app/scene
APPSCENE.IN = ${APPSCENE.PATH}/AbElement.js ${APPSCENE.PATH}/AbSprite.js ${APPSCENE.PATH}/AbContainer.js ${APPSCENE.PATH}/AbLevel.js ${APPSCENE.PATH}/AbScene.js

#APP Elements
APPELEMENTBASE.IN = ${JSSOURCE}/app/scene/element/base/*.js
APPELEMENT.IN = ${JSSOURCE}/app/scene/element/*js

#APP Loader, Navigation, Levels & Scenes
APPLOADER.IN = ${JSSOURCE}/app/loader/*.js
APPNAVI.IN = ${JSSOURCE}/app/scene/navi/*.js
APPNLEVEL.IN = ${JSSOURCE}/app/scene/level/*.js
APPNSCENEALL.IN = ${JSSOURCE}/app/scene/scenes/*.js


#APP Testing 
APPTESTING.PATH = ${JSSOURCE}/app/scene/scenes/testing
APPTESTING.IN = ${APPTESTING.PATH}/*.js

#APP TO be output
MAINJS.IN = ${APPEVENT.IN} ${APPANIM.IN} ${APPSCENE.IN} ${APPELEMENTBASE.IN} ${APPELEMENT.IN} ${APPLOADER.IN} ${APPNAVI.IN} ${APPNLEVEL.IN} ${APPNSCENEALL.IN} ${JSSOURCE}/app.js

##############################
#DATA
##############################
DATA.IN = ${JSSOURCE}/data/*.js

##############################
#BEAUTIFY-JS VARS
##############################
FLAGS="--beautify"

##############################
#OUTPUT
##############################
DEVELOP.OUT = deploy/js/app.dev.js
DEPLOY.OUT = deploy/js/app.min.js


##############################
#DEPLOYMENT
##############################
default: deploy

development:
	OUTPATH=deploy/assets

clean:
	#rm -f ${DEPLOY.OUT}

buildCss:


global:
	${SPRITESHEET} -n global -p ${OUTPATH} -f ${SSFORMAT} --trim ${TRIM} --gap2px ${GAP} ${ASSETSPATH}/global/*.png
scene1:
	${SPRITESHEET} -n scene1 -p ${OUTPATH} -f ${SSFORMAT} --trim ${TRIM} --gap2px ${GAP} ${ASSETSPATH}/scene1/*.png
scene2:
	${SPRITESHEET} -n scene2 -p ${OUTPATH} -f ${SSFORMAT} --trim ${TRIM} --gap2px ${GAP} ${ASSETSPATH}/scene2/*.png
scene2b:
	${SPRITESHEET} -n scene2b -p ${OUTPATH} -f ${SSFORMAT} --trim ${TRIM} --gap2px ${GAP} ${ASSETSPATH}/scene2b/*.png
scene2c:
	${SPRITESHEET} -n scene2c -p ${OUTPATH} -f ${SSFORMAT} --trim ${TRIM} --gap2px ${GAP} ${ASSETSPATH}/scene2c/*.png
scene3:
	${SPRITESHEET} -n scene3 -p ${OUTPATH} -f ${SSFORMAT} --trim ${TRIM} --gap2px ${GAP} ${ASSETSPATH}/scene3/*.png
scene3b:
	${SPRITESHEET} -n scene3b -p ${OUTPATH} -f ${SSFORMAT} --trim ${TRIM} --gap2px ${GAP} ${ASSETSPATH}/scene3b/*.png
scene4:
	${SPRITESHEET} -n scene4 -p ${OUTPATH} -f ${SSFORMAT} --trim ${TRIM} --gap2px ${GAP} ${ASSETSPATH}/scene4/*.png
scene5:
	${SPRITESHEET} -n scene5 -p ${OUTPATH} -f ${SSFORMAT} --trim ${TRIM} --gap2px ${GAP} ${ASSETSPATH}/scene5/*.png
scene6:
	${SPRITESHEET} -n scene6 -p ${OUTPATH} -f ${SSFORMAT} --trim ${TRIM} --gap2px ${GAP} ${ASSETSPATH}/scene6/*.png
scene7:
	${SPRITESHEET} -n scene7 -p ${OUTPATH} -f ${SSFORMAT} --trim ${TRIM} --gap2px ${GAP} ${ASSETSPATH}/scene7/*.png
scene8:
	${SPRITESHEET} -n scene8 -p ${OUTPATH} -f ${SSFORMAT} --trim ${TRIM} --gap2px ${GAP} ${ASSETSPATH}/scene8/*.png
sceneend:
	${SPRITESHEET} -n sceneend -p ${OUTPATH} -f ${SSFORMAT} --trim ${TRIM} --gap2px ${GAP} ${ASSETSPATH}/sceneend/*.png

assets: global scene1 scene2 scene2b scene2c scene3 scene3b scene4 scene5 scene6 scene7 scene8 sceneend

development: assets
	${UGLIFY} ${LIB.DEBUG.IN} ${LIB.IN} ${SITEMANAGER.IN} ${MKK.IN} ${DATA.IN} ${MAINJS.IN} ${APPTESTING.IN} ${FLAGS} -o ${DEVELOP.OUT}

deploy: development
	${UGLIFY} ${LIB.DEBUG.IN} ${LIB.IN} ${SITEMANAGER.IN} ${MKK.IN} ${DATA.IN} ${MAINJS.IN} ${APPTESTING.IN} -o ${DEPLOY.OUT}



