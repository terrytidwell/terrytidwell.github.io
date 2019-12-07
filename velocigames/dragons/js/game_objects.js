//------------------------------------------------------------------------------
class Tile
{
    //--------------------------------------------------------------------------
    constructor()
    {
        console.log("In Tile constructor.");
    }
}

//------------------------------------------------------------------------------
class PlainsTile extends Tile
{
    //--------------------------------------------------------------------------
    constructor()
    {
        super();
        console.log("In PlainsTile constructor.");
    }
}

//------------------------------------------------------------------------------
class MountainTile extends Tile
{
    //--------------------------------------------------------------------------
    constructor()
    {
        super();
        console.log("In PlainsTile constructor.");
    }
}

//------------------------------------------------------------------------------
class MineTile extends Tile
{
    //--------------------------------------------------------------------------
    constructor()
    {
        super();
        console.log("In PlainsTile constructor.");
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

        this.m_tile_map = new TileMap(10, 10);

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
    }
}