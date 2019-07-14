const p2 = require('p2');

module.exports = function getCollisionBodies(layer) {
	const res = [];
	layer.objects.forEach(object => {
		if (object.ellipse) {
			const shape = new p2.Circle({ radius: object.width / 2 });
			const body = new p2.Body();
			body.position[0] = object.x + (layer.offsetx || 0);
			body.position[1] = object.y + (layer.offsety || 0);
			body.addShape(shape, [shape.radius, shape.radius]);				
			res.push(body);

			// const graphics = new PIXI.Graphics();
			// graphics.beginFill(0xff0000);
			// graphics.drawCircle(object.width / 2, object.width / 2, object.width / 2);
			// graphics.endFill();
			// graphics.x = object.x + (layer.offsetx || 0);
			// graphics.y = object.y + (layer.offsety || 0);
			// app.stage.addChild(graphics);
		} else if (object.polygon) {
			const body = new p2.Body();
			body.fromPolygon(object.polygon.map(p => [
				p.x + object.x + (layer.offsetx || 0), 
				p.y + object.y + (layer.offsety || 0)
			]));
			res.push(body);

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
			// graphics.x = object.x + (layer.offsetx || 0);
			// graphics.y = object.y + (layer.offsety || 0);
			// app.stage.addChild(graphics);
		} else {
			console.warn('not implemented');
		}
	});
	return res;
}
