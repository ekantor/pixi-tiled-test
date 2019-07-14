import * as PIXI from 'pixi.js';
window['PIXI'] = PIXI;
global['PIXI'] = PIXI;
import 'pixi-tilemap';

export default class TileMap {
	public readonly container = new PIXI.Container();

	private readonly textureCache = [];

	constructor(path: string) {
		PIXI.tilemap.Constant.use32bitIndex = true;
		fetch(path).then(res => res.json()).then(tilemap => {
			fetch(this.getTilesetPath(path, tilemap.tilesets[0])).then(res => res.json()).then(tileset => {
				PIXI.Loader.shared.add('tileset', this.getTilesetImagePath(path, tileset));
				PIXI.Loader.shared.load((loader, resources) => {
					const baseTexture = resources.tileset.texture.baseTexture;
					tilemap.layers.forEach(layer => {
						if (!layer.visible || layer.type != "tilelayer")
							return;
						
						const container = this.container.addChild(new PIXI.Container()) as PIXI.Container;
						container.alpha = layer.opacity;
						let tileNum = 0;
						let currTileLayer;
						
						const processLayerData = (layerData) => {
							layerData.data.forEach((id, index) => {
								const i = index % layerData.width + layerData.x;
								const j = Math.floor(index / layerData.width) + layerData.y;
								if (tileNum++ % 16384 == 0) {
									currTileLayer = container.addChild(new PIXI.tilemap.CompositeRectTileLayer());
								}							
								this.createTile(baseTexture, tileset, currTileLayer, id, i, j);
							});
						}

						if (layer.data) {
							processLayerData(layer);
						} else if (layer.chunks) {
							layer.chunks.forEach(processLayerData);
						}
					});
				});
			});
		});
	}

	private createTile(baseTexture, tileset, container, id: number, i: number, j: number) {
		if (id == 0)
			return;

		let flags = this.getFlags(id);
		const tilesetId = this.clearFlags(id) - 1;
		
		if (!this.textureCache[tilesetId]) {
			this.createTexture(baseTexture, tileset, tilesetId);
		}
		const texture = this.textureCache[tilesetId];

		const mirror = this.getMirror(flags);

		container.addFrame(texture, i * tileset.tilewidth, j * tileset.tileheight, mirror);
	}

	private createTexture(baseTexture, tileset, tilesetId: number) {
		let x = tileset.tilewidth * (tilesetId % tileset.columns);
		let y = tileset.tileheight * Math.floor(tilesetId / tileset.columns);
		let width = tileset.tilewidth;
		let height = tileset.tileheight;

		this.textureCache[tilesetId] = new PIXI.Texture(baseTexture, new PIXI.Rectangle(x, y, width, height));
	}

	private getMirror(flags) {
		let res = 0;
		if (flags.horizontalFlip) {
			res += 2;
		}
		if (flags.verticalFlip) {
			res += 4;
		}
		if (flags.diagonalFlip) {
			console.warn('Diagonal flip not implemented');
			// sprite.rotation = Math.PI / 2;
			// sprite.scale.y *= -1;
		}
		return res;
	} 

	private getFlags(tile: number) {
		return {
			diagonalFlip: tile & 0x20000000,
			verticalFlip: tile & 0x40000000,
			horizontalFlip: tile & 0x80000000
		};
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