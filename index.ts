import * as PIXI from 'pixi.js';
import TILEDGraphics from './TILEDGraphics';

const p2 = require('p2');

const shape = new p2.Circle({ radius: 32 });

const body = new p2.Body({ mass: 1 });
body.addShape(shape);

const world = new p2.World({
	gravity: [0, 0],
});
world.addBody(body);


window.onload = () => {	
	const path = 'assets/world/map.json';

	const app = new PIXI.Application({ width: 800, height: 600 });
	
	const player = new PIXI.Graphics();
	player.beginFill(0x0000ff);
	player.drawCircle(0, 0, 32);
	player.endFill();

	fetch(path).then(res => res.json()).then(tilemap => {
		app.stage.addChild(new TILEDGraphics(tilemap, path));
		app.stage.addChild(player);

		const collisionLayer = tilemap.layers.find(layer => layer.name === 'akadalyok');
		collisionLayer.objects.forEach(object => {
			if (object.ellipse) {
				const shape = new p2.Circle({ radius: object.width / 2 });
				const body = new p2.Body();
				body.position[0] = object.x + (collisionLayer.offsetx || 0);
				body.position[1] = object.y + (collisionLayer.offsety || 0);
				body.addShape(shape, [shape.radius, shape.radius]);				
				world.addBody(body);

				// const graphics = new PIXI.Graphics();
				// graphics.beginFill(0xff0000);
				// graphics.drawCircle(object.width / 2, object.width / 2, object.width / 2);
				// graphics.endFill();
				// graphics.x = object.x + (collisionLayer.offsetx || 0);
				// graphics.y = object.y + (collisionLayer.offsety || 0);
				// app.stage.addChild(graphics);
			} else if (object.polygon) {
				const body = new p2.Body();
				body.fromPolygon(object.polygon.map(p => [
					p.x + object.x + (collisionLayer.offsetx || 0), 
					p.y + object.y + (collisionLayer.offsety || 0)
				]));
				world.addBody(body);

				// const graphics = new PIXI.Graphics();
				// graphics.beginFill(0xff0000);
				// object.polygon.forEach((p, i) => {
				// 	if (i == 0) {
				// 		graphics.moveTo(p.x, p.y);
				// 	} else {
				// 		graphics.lineTo(p.x, p.y);
				// 	}
				// })
				// graphics.endFill();
				// graphics.x = object.x + (collisionLayer.offsetx || 0);
				// graphics.y = object.y + (collisionLayer.offsety || 0);
				// app.stage.addChild(graphics);
			} else {
				console.warn('not implemented');
			}
		});
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
