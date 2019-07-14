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
