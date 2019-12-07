//------------------------------------------------------------------------------
class Tile
{
    //--------------------------------------------------------------------------
    constructor()
    {
    }
}

//------------------------------------------------------------------------------
class PlainsTile extends Tile
{
    //--------------------------------------------------------------------------
    constructor()
    {
        super();
    }
}

//------------------------------------------------------------------------------
class MountainTile extends Tile
{
    //--------------------------------------------------------------------------
    constructor()
    {
        super();
    }
}

//------------------------------------------------------------------------------
class MineTile extends Tile
{
    //--------------------------------------------------------------------------
    constructor()
    {
        super();
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
class VillageArea
{
    //--------------------------------------------------------------------------
    constructor()
    {

        this.m_tile_map = new TileMap(20, 20);

        for (let x = 0; x < this.m_tile_map.m_width; ++x)
        {
            for (let y = 0; y < this.m_tile_map.m_height; ++y)
            {
                let tile = null;
                if (x < y)
                {
                    tile = new MountainTile();
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