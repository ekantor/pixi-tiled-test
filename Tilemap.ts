import * as PIXI from 'pixi.js';
window['PIXI'] = PIXI;
global['PIXI'] = PIXI;
import 'pixi-tilemap';

export default class TileMap {
	public readonly container = new PIXI.Container();
	private mapData: any;
	private tilesetData: any;
	private texture: PIXI.Texture;

	private readonly textureCache = [];

	constructor(path: string, filename: string) {
		PIXI.tilemap.Constant.use32bitIndex = true;
		fetch(path + filename).then(res => res.json()).then(res => {
			this.mapData = res;
			fetch(path + this.mapData.tilesets[0].source.split('.')[0] + '.json').then(res => res.json()).then(res => {
				this.tilesetData = res;
				PIXI.Loader.shared.add('tileset', path + this.tilesetData.image);
				PIXI.Loader.shared.load((loader, resources) => {
					this.texture = resources.tileset.texture;
					this.mapData.layers.forEach(layer => {
						if (!layer.visible || layer.type != "tilelayer")
							return;
						
						const container = this.container.addChild(new PIXI.Container()) as PIXI.Container;
						container.alpha = layer.opacity;
						let tileNum = 0;
						let currTileLayer;
						
						if (layer.chunks) {
							layer.chunks.forEach(chunk => {
								chunk.data.forEach((id, index) => {
									const i = index % chunk.height + chunk.x;
									const j = Math.floor(index / chunk.height) + chunk.y;
									if (tileNum++ % 16384 == 0) {
										currTileLayer = container.addChild(new PIXI.tilemap.CompositeRectTileLayer());
									}							
									this.createTile(currTileLayer, id, i, j);
								});
							});
						}
					});
				});
			});
		});
	}

	private createTile(container, id: number, i: number, j: number) {
		if (id == 0)
			return;

		let flags = this.getFlags(id);
		const tilesetId = this.clearFlags(id) - 1;
		
		if (!this.textureCache[tilesetId]) {
			this.createTexture(tilesetId);
		}
		const texture = this.textureCache[tilesetId];

		const mirror = this.getMirror(flags);

		container.addFrame(texture, i * this.tilesetData.tilewidth, j * this.tilesetData.tileheight, mirror);
	}

	private createTexture(tilesetId: number) {
		let x = this.tilesetData.tilewidth * (tilesetId % this.tilesetData.columns);
		let y = this.tilesetData.tileheight * Math.floor(tilesetId / this.tilesetData.columns);
		let width = this.tilesetData.tilewidth;
		let height = this.tilesetData.tileheight;

		this.textureCache[tilesetId] = new PIXI.Texture(this.texture.baseTexture, new PIXI.Rectangle(x, y, width, height));
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
			throw new Error('Diagonal flip not implemented')
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
}