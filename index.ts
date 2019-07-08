import TileMap from './Tilemap';

window.onload = () => {	
	const app = new PIXI.Application({ width: 800, height: 600 });
	const tilemap = new TileMap('world/', 'map.json');
	
	app.stage.addChild(tilemap.container);

	document.body.appendChild(app.view);
	app.start();
}
