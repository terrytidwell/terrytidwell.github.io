//------------------------------------------------------------------------------
class Tile
{
    //--------------------------------------------------------------------------
    constructor(image_tag)
    {
        this.m_image_tag = image_tag;
    }
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
        super("mine_tile");
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
}

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

        for (let x = 0; x < this.m_tile_map.m_width; ++x)
        {
            for (let y = 0; y < this.m_tile_map.m_height; ++y)
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
                this.m_tile_map.m_tiles[x][y] = tile;
            }
        }
        let mine_x = Math.floor(this.m_tile_map.m_width / 2);
        let mine_y = Math.floor(this.m_tile_map.m_height / 2);
        this.m_tile_map.m_tiles[mine_x][mine_y] = new MineTile();
    }
}