import * as PIXI from 'pixi.js';
import 'pixi-tilemap';
// import './node_modules/pixi.js/pixi.js';
// import './pixi-tilemap/pixi-tilemap';

export default class TileMap {
	public readonly container = new PIXI.Container();
	private mapData: any;
	private tilesetData: any;
	private baseTexture: PIXI.BaseTexture;
	private tilemap = new PIXI.tilemap.CompositeRectTileLayer();

	private readonly sprites = [];

	private readonly textureCache = [];

	constructor(path: string, filename: string) {
		// PIXI.tilemap.Constant.use32bitIndex = true;
		this.container.addChild(this.tilemap);
		fetch(path + filename).then(res => res.json()).then(res => {
			this.mapData = res;
			fetch(path + this.mapData.tilesets[0].source.split('.')[0] + '.json').then(res => res.json()).then(res => {
				this.tilesetData = res;
				const img = document.createElement('img');
				img.src = path + this.tilesetData.image;
				img.onload = () => {
					this.baseTexture = new PIXI.BaseTexture(img);
					this.mapData.layers.forEach(layer => {
						if (!layer.visible || layer.type != "tilelayer")
							return;
	
						if (layer.chunks) {
							layer.chunks.forEach(chunk => {
								chunk.data.forEach((id, index) => {
									const i = index % chunk.height + chunk.x;
									const j = Math.floor(index / chunk.height) + chunk.y;
									this.createTile(id, i, j, layer.opacity);
								});
							});
						}
					});
				}
			});
		});
	}

	private createTile(id: number, i: number, j: number, opacity: number) {
		let flags = this.getFlags(id);
		id = this.clearFlags(id);

		if (id == 0)
			return;

		id = id - 1;

		if (!this.textureCache[id]) {
			this.createTexture(id);
		}

		this.tilemap.addFrame(this.textureCache[id], i * this.tilesetData.tilewidth, j * this.tilesetData.tileheight);

		// const sprite = new PIXI.Sprite(this.textureCache[id]);
		// sprite.position.set(i * this.tilesetData.tilewidth, j * this.tilesetData.tileheight);

		// if (flags.horizontalFlip) {
		// 	sprite.scale.x *= -1;
		// }
		// if (flags.verticalFlip) {
		// 	sprite.scale.y *= -1;
		// }
		// if (flags.diagonalFlip) {
		// 	sprite.rotation = Math.PI / 2;
		// 	sprite.scale.y *= -1;
		// }

		// sprite.alpha = opacity;

		// this.container.addChild(sprite);
		// this.sprites.push(sprite);
	}

	private createTexture(id: number) {
		let x = this.tilesetData.tilewidth * (id % this.tilesetData.columns);
		let y = this.tilesetData.tileheight * Math.floor(id / this.tilesetData.columns);
		let width = this.tilesetData.tilewidth;
		let height = this.tilesetData.tileheight;

		this.textureCache[id] = new PIXI.Texture(this.baseTexture, new PIXI.Rectangle(x, y, width, height));
	}

	// public updateVisibility(target: { x: number, y: number }) {
	// 	this.container.removeChildren();
	// 	let ctr = 0;
	// 	this.sprites.forEach(sprite => {
	// 		const dx = Math.abs(target.x - sprite.x);
	// 		const dy = Math.abs(target.y - sprite.y);
	// 		if (dx < 1000 && dy < 1000) {
	// 			ctr++;
	// 			this.container.addChild(sprite);
	// 		}
	// 	});
	// 	console.log(ctr);
	// }

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