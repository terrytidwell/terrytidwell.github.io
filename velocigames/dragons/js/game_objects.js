//------------------------------------------------------------------------------
class Tile
{
    //--------------------------------------------------------------------------
    constructor(image_key)
    {
        this.m_image_key = image_key;
    }

    //--------------------------------------------------------------------------
    getImageKey()
    {
        return this.m_image_key;
    }

    //--------------------------------------------------------------------------
    handleClick()
    {}
}

//------------------------------------------------------------------------------
class PlainsTile extends Tile
{
    //--------------------------------------------------------------------------
    constructor()
    {
        super("plains_tile");
    }
}

//------------------------------------------------------------------------------
class MountainsTile extends Tile
{
    //--------------------------------------------------------------------------
    constructor()
    {
        super("mountains_tile");
    }
}

//------------------------------------------------------------------------------
class MineTile extends Tile
{
    //--------------------------------------------------------------------------
    constructor()
    {
        super(["mountains_tile", "mine_tile"]);
    }
}

//##############################################################################

//------------------------------------------------------------------------------
class TileMap
{
    //--------------------------------------------------------------------------
    constructor(width, height)
    {
        this.m_width = width;
        this.m_height = height;

        this.m_tiles = new Array(this.m_width);
        for (let x = 0; x < this.m_width; ++x)
        {
            this.m_tiles[x] = new Array(this.m_height);
        }
    }

    //--------------------------------------------------------------------------
    getWidth()
    {
        return this.m_width;
    }

    //--------------------------------------------------------------------------
    getHeight()
    {
        return this.m_height;
    }

    //--------------------------------------------------------------------------
    getTile(x, y)
    {
        if (x < 0 || x >= this.m_width) throw "x out of range (got " + x + ")";
        if (y < 0 || y >= this.m_height) throw "y out of range (got " + y + ")";
        return this.m_tiles[x][y];
    }

    //--------------------------------------------------------------------------
    setTile(x, y, tile)
    {
        if (x < 0 || x >= this.m_width) throw "x out of range (got " + x + ")";
        if (y < 0 || y >= this.m_height) throw "y out of range (got " + y + ")";
        this.m_tiles[x][y] = tile;
    }

    //--------------------------------------------------------------------------
    handleClick(x, y, tile, event)
    {
        console.log("Clicked on " + tile.getImageKey()
            + " at " + x + ", " + y + ".");
        event.stopPropagation();
    }
}

//------------------------------------------------------------------------------
class TileMapView
{
    //--------------------------------------------------------------------------
    constructor(scene, tile_width, tile_height)
    {
        this.m_scene = scene;
        this.m_tile_width = tile_width;
        this.m_tile_height = tile_height;
        this.m_tile_map = null;
    }

    //--------------------------------------------------------------------------
    attachTileMap(tile_map)
    {
        if (null !== this.m_tile_map)
        {
            throw "Changing tile map not yet implemented."; // todo
        }

        var self = this;
        this.m_tile_map = tile_map;
        for (let x = 0; x < this.m_tile_map.getWidth(); ++x)
        {
            for (let y = 0; y < this.m_tile_map.getHeight(); ++y)
            {
                let tile = this.m_tile_map.getTile(x, y);
                let image_key = tile.getImageKey();
                if (image_key instanceof Array)
                {
                    while (image_key.length > 1)
                    {
                        this.m_scene.add.image(
                            (x + 0.5) * this.m_tile_width,
                            (y + 0.5) * this.m_tile_height,
                            image_key.shift())
                    }
                    image_key = image_key.shift()
                }
                let tile_image = this.m_scene.add.image(
                    (x + 0.5) * this.m_tile_width,
                    (y + 0.5) * this.m_tile_height,
                    image_key);
                tile_image.setInteractive();
                tile_image.on(
                    "pointerup",
                    function(pointer, localX, localY, event)
                    {
                        tile.handleClick(event);

                        if (!event.cancelled)
                        {
                            tile_map.handleClick(x, y, tile, event);
                        }

                        if (!event.cancelled)
                        {
                            self.handleClick(x, y, tile, event);
                        }
                    });
            }
        }
    }

    //--------------------------------------------------------------------------
    handleClick(x, y, tile, event)
    {}
}

//##############################################################################

//------------------------------------------------------------------------------
class GameArea
{
    //--------------------------------------------------------------------------
    constructor(width, height)
    {
        this.m_tile_map = new TileMap(width, height);
    }
}

//------------------------------------------------------------------------------
class VillageArea extends GameArea
{
    //--------------------------------------------------------------------------
    constructor()
    {
        super(20, 20);

        for (let x = 0; x < this.m_tile_map.getWidth(); ++x)
        {
            for (let y = 0; y < this.m_tile_map.getHeight(); ++y)
            {
                let tile = null;
                if (x < y)
                {
                    tile = new MountainsTile();
                }
                else
                {
                    tile = new PlainsTile();
                }
                this.m_tile_map.setTile(x, y, tile);
            }
        }
        let mine_x = Math.floor(this.m_tile_map.getWidth() / 2);
        let mine_y = Math.floor(this.m_tile_map.getHeight() / 2);
        this.m_tile_map.setTile(mine_x, mine_y, new MineTile());
    }
}