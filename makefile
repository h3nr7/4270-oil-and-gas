#tools
SPRITESHEET=node_modules/.bin/spritesheet-js
UGLIFY=node_modules/.bin/uglifyjs

#oaths
JSSOURCE=js
ASSETSPATH=assets
DEPLOYPATH=deploy/assets
OUTPATH=deploy/assets

#VARS
SSFORMAT="pixi.js"

default: global sceneend

development:
	OUTPATH=deploy/assets

clean:
	#rm -f ${DEPLOY.OUT}

buildCss:


global:
	${SPRITESHEET} -n global -p ${OUTPATH} -f ${SSFORMAT} ${ASSETSPATH}/global/*.png
scene1:
	${SPRITESHEET} -n scene2 -p ${OUTPATH} -f ${SSFORMAT} ${ASSETSPATH}/scene1/*.png
scene2:
	${SPRITESHEET} -n scene3 -p ${OUTPATH} -f ${SSFORMAT} ${ASSETSPATH}/scene2/*.png
scene3:
	${SPRITESHEET} -n scene4 -p ${OUTPATH} -f ${SSFORMAT} ${ASSETSPATH}/scene3/*.png
scene4:
	${SPRITESHEET} -n scene5 -p ${OUTPATH} -f ${SSFORMAT} ${ASSETSPATH}/scene4/*.png
scene5:
	${SPRITESHEET} -n scene6 -p ${OUTPATH} -f ${SSFORMAT} ${ASSETSPATH}/scene5/*.png
scene6:
	${SPRITESHEET} -n scene6 -p ${OUTPATH} -f ${SSFORMAT} ${ASSETSPATH}/scene6/*.png
sceneend:
	${SPRITESHEET} -n sceneend -p ${OUTPATH} -f ${SSFORMAT} ${ASSETSPATH}/sceneend/*.png


compress:
	# ${UGLIFY} ${LIB.IN} ${NSMANAGER.IN} ${SUBAPP.IN} ${APP.IN} ${MAINJS.IN} ${FLAGS} -o ${DEVELOP.OUT}
deploy:



