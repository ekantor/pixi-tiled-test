import * as PIXI from 'pixi.js';
window['PIXI'] = PIXI;
global['PIXI'] = PIXI;
import 'pixi-tilemap';

export default class TILEDGraphics extends PIXI.Container {
	private readonly textureCache = [];

	constructor(tilemap, path) {
		super();
		fetch(this.getTilesetPath(path, tilemap.tilesets[0])).then(res => res.json()).then(tileset => {
			const baseTexture = PIXI.BaseTexture.from(this.getTilesetImagePath(path, tileset));
			tilemap.layers.forEach(layer => {
				if (!layer.visible || layer.type != "tilelayer") return;
				
				const container = this.addChild(new PIXI.Container()) as PIXI.Container;
				container.alpha = layer.opacity;
				let tileNum = 0;
				let currTileLayer;
				
				const processLayerData = (layerData) => {
					layerData.data.forEach((id, index) => {
						const i = index % layerData.width + layerData.x;
						const j = Math.floor(index / layerData.width) + layerData.y;
						if (tileNum++ % 16383 == 0) {
							currTileLayer = container.addChild(new PIXI.tilemap.CompositeRectTileLayer());
						}							
						const x = i * tileset.tilewidth + (layerData.offsetx || 0);
						const y = j * tileset.tileheight + (layerData.offsety || 0);
						this.createTile(baseTexture, tileset, currTileLayer, id, x, y);
					});
				}

				if (layer.data) {
					processLayerData(layer);
				} else if (layer.chunks) {
					layer.chunks.forEach(processLayerData);
				}
			});
		});
	}

	private createTile(baseTexture, tileset, container, id: number, x, y) {
		if (id == 0)
			return;

		const tilesetId = this.clearFlags(id) - 1;
		
		if (!this.textureCache[tilesetId]) {
			this.createTexture(baseTexture, tileset, tilesetId);
		}
		const texture = this.textureCache[tilesetId];

		container.addFrame(texture, x, y, id);
	}

	private createTexture(baseTexture, tileset, tilesetId: number) {
		let x = tileset.tilewidth * (tilesetId % tileset.columns);
		let y = tileset.tileheight * Math.floor(tilesetId / tileset.columns);
		let width = tileset.tilewidth;
		let height = tileset.tileheight;

		this.textureCache[tilesetId] = new PIXI.Texture(baseTexture, new PIXI.Rectangle(x, y, width, height));
	}

	private clearFlags(tile: number) {
		tile &= ~(0x20000000 | 0x40000000 | 0x80000000);
		return tile;
	}

	private getTilesetPath(path, tileset) {
		const splitPath = path.split('/');
		const split = tileset.source.split('.');
		split[split.length - 1] = 'json';
		const filename = split.join('.');
		splitPath[splitPath.length - 1] = filename;
		return splitPath.join('/');
	}

	private getTilesetImagePath(path, tileset) {
		const splitPath = path.split('/');
		splitPath[splitPath.length - 1] = tileset.image;
		return splitPath.join('/');
	}
}