import TileMap from './Tilemap';

const app = new PIXI.Application({ width: 800, height: 600 });
const tilemap = new TileMap('world', 'map.json');

document.body.appendChild(app.view);
app.stage.addChild(tilemap.container);

app.start();