import * as PIXI from 'pixi.js';
import TILEDGraphics from './TILEDGraphics';

const p2 = require('p2');
const getCollisionBodies = require('./getCollisionBodies');

const shape = new p2.Circle({ radius: 32 });

const body = new p2.Body({ mass: 1 });
body.addShape(shape);

const world = new p2.World({
	gravity: [0, 0],
});
world.addBody(body);


window.onload = () => {	
	const app = new PIXI.Application({ width: 800, height: 600 });
	
	const player = new PIXI.Graphics();
	player.beginFill(0x0000ff);
	player.drawCircle(0, 0, 32);
	player.endFill();
	
	const worldMapPath = 'assets/world/map.json';
	fetch(worldMapPath).then(res => res.json()).then(tilemap => {
		app.stage.addChild(new TILEDGraphics(tilemap, worldMapPath));
		app.stage.addChild(player);

		const collisionLayer = tilemap.layers.find(layer => layer.name === 'akadalyok');
		if (collisionLayer) {
			getCollisionBodies(collisionLayer).forEach(body => world.addBody(body));
		}

		const fields1v1Layer = tilemap.layers.find(layer => layer.name === '1v1');
		if (fields1v1Layer) {
			fields1v1Layer.objects.forEach(object => {
				const field1v1Path = 'assets/1v1/1v1_field.json';
				fetch(field1v1Path).then(res => res.json()).then(tilemap => {
					const fieldGraphics = app.stage.addChild(new TILEDGraphics(tilemap, field1v1Path));
					fieldGraphics.x = object.x;
					fieldGraphics.y = object.y;
				});		
			});
		}

	});
	
	document.body.appendChild(app.view);
	
	const keys = {};
	document.addEventListener('keydown', e => keys[e.key] = true);
	document.addEventListener('keyup', e => keys[e.key] = false);

	app.ticker.add(() => {
		const v = 5;

		body.velocity[0] = body.velocity[1] = 0;
		if (keys['ArrowLeft'] || keys['a']) {
			body.velocity[0] -= v;
		}
		if (keys['ArrowRight'] || keys['d']) {
			body.velocity[0] += v;
		}
		if (keys['ArrowDown'] || keys['s']) {
			body.velocity[1] += v;
		}
		if (keys['ArrowUp'] || keys['w']) {
			body.velocity[1] -= v;
		}

		const zoom = 1.1;
		if (keys['z'] || keys['y']) {
			app.stage.scale.x *= zoom;
			app.stage.scale.y *= zoom;
		}
		if (keys['x']) {
			app.stage.scale.x /= zoom;
			app.stage.scale.y /= zoom;
		}

		world.step(app.ticker.deltaMS);

		player.x = body.position[0];
		player.y = body.position[1];

		app.stage.x = 400 - player.x;
		app.stage.y = 300 - player.y;
	});

	app.start();
}
