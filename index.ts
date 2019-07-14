import * as PIXI from 'pixi.js';
import TILEDGraphics from './TILEDGraphics';

window.onload = () => {	
	const path = 'assets/1v1/1v1_field.json';

	const app = new PIXI.Application({ width: 800, height: 600 });
	
	fetch(path).then(res => res.json()).then(tilemap => {
		app.stage.addChild(new TILEDGraphics(tilemap, path));
	});
	
	document.body.appendChild(app.view);
	
	const keys = {};
	document.addEventListener('keydown', e => keys[e.key] = true);
	document.addEventListener('keyup', e => keys[e.key] = false);

	app.ticker.add(() => {
		const v = 10;
		if (keys['ArrowLeft'] || keys['a']) {
			app.stage.x += v;
		}
		if (keys['ArrowRight'] || keys['d']) {
			app.stage.x -= v;
		}
		if (keys['ArrowDown'] || keys['s']) {
			app.stage.y -= v;
		}
		if (keys['ArrowUp'] || keys['w']) {
			app.stage.y += v;
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
	});

	app.start();
}
