//------------------------------------------------------------------------------
class TileAction
{
    //--------------------------------------------------------------------------
    constructor(button_text, begin_text, end_text, duration_seconds, execute_fn)
    {
        this.m_button_text = button_text;
        this.m_begin_text = begin_text;
        this.m_end_text = end_text;
        this.m_duration_seconds = duration_seconds;
        this.m_execute_fn = execute_fn;
    }

    //--------------------------------------------------------------------------
    getButtonText()
    {
        return this.m_button_text;
    }

    //--------------------------------------------------------------------------
    getBeginText()
    {
        return this.m_begin_text;
    }

    //--------------------------------------------------------------------------
    getEndText()
    {
        return this.m_end_text;
    }

    //--------------------------------------------------------------------------
    getDurationSeconds()
    {
        return this.m_duration_seconds;
    }

    //--------------------------------------------------------------------------
    getExecuteFn()
    {
        return this.m_execute_fn;
    }
}

//------------------------------------------------------------------------------
class Tile
{
    //--------------------------------------------------------------------------
    constructor(display_name, image_key, image_index, actions)
    {
        this.m_display_name = display_name;
        this.m_image_key = image_key;
        this.m_image_index = image_index;
        this.m_actions = actions;
    }

    //--------------------------------------------------------------------------
    getDisplayName()
    {
        return this.m_display_name;
    }

    //--------------------------------------------------------------------------
    createGameObject(scene)
    {
        let game_object = null;
        let image_key = this.m_image_key;
        if (image_key instanceof Array)
        {
            let container = scene.add.container(0, 0);
            // note: it is impossible to set the origin of a container,
            // so we have to leave everything with an origin of (0.5, 0.5)
            for (let index = 0; index < image_key.length; ++index)
            {
                // BUG: would call image constructor, but it doesn't work
                // because of a 'this' problem
                let layer_image = scene.add.image(0, 0, image_key[index]);
                // layer_image.setOrigin(0, 0);
                // we be supposed to remove the image from the scene before
                // adding it to the container, but it seems to work
                container.add(layer_image);
                container.setSize(layer_image.width, layer_image.height);
            }
            game_object = container
        }
        else if (this.m_image_index)
        {
            let image = scene.add.image(0, 0, image_key, this.m_image_index);
            // image.setOrigin(0, 0);
            image.scale = 2;

            game_object = image
        }
        else
        {
            let image = scene.add.image(0, 0, image_key);
            //image.setOrigin(0, 0);
            game_object = image
        }
        return game_object;
    }

    //--------------------------------------------------------------------------
    handleClick()
    {}

    //--------------------------------------------------------------------------
    getActions()
    {
        return this.m_actions;
    }
}

//------------------------------------------------------------------------------
class PlainsTile extends Tile
{
    //--------------------------------------------------------------------------
    constructor()
    {
        super("Plains", "terrain",
            32*12 + Math.floor(Math.random()*3));
    }
}

//------------------------------------------------------------------------------
class PlainsTopTile extends Tile
{
    //--------------------------------------------------------------------------
    constructor()
    {
        super("Plains", "terrain", 32*41+5);
    }
}

//------------------------------------------------------------------------------
class PlainsTop2Tile extends Tile
{
    //--------------------------------------------------------------------------
    constructor()
    {
        super("Mountains", "terrain", 32*40+4);
    }
}

//------------------------------------------------------------------------------
class MountainsTile extends Tile
{
    //--------------------------------------------------------------------------
    constructor()
    {
        super("Mountains", "terrain",
            26*32+18+Math.floor(Math.random()*3));
    }
}

//------------------------------------------------------------------------------
class MineTile extends Tile
{
    //--------------------------------------------------------------------------
    constructor()
    {
        let actions = [
            new TileAction(
                "Mine Gold",
                "Starting to mine for gold.",
                "Finished mining for gold.",
                0,
                function(scene)
                {
                    game_model.m_global_resources.m_gold += 1;
                    scene.events.emit("update_global_resources")
                }),
        ];
        super("Mine",
            ["mountains_tile", "mine_tile"],
            undefined,
            actions);
    }
}

//------------------------------------------------------------------------------
class FarmTile extends Tile
{
    //--------------------------------------------------------------------------
    constructor()
    {
        super("Farm", ["farm_tile"]);
    }
}

//##############################################################################

//------------------------------------------------------------------------------
class TileMap
{
    //--------------------------------------------------------------------------
    constructor(width, height, depth)
    {
        this.m_width = width;
        this.m_height = height;
        this.m_depth = depth;

        this.m_tiles = new Array(this.m_width);
        for (let x = 0; x < this.m_width; ++x)
        {
            this.m_tiles[x] = new Array(this.m_height);
            for (let y = 0; y < this.m_height; ++y)
            {
                this.m_tiles[x][y] = new Array(this.m_depth);
            }
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
    getDepth()
    {
        return this.m_depth;
    }

    //--------------------------------------------------------------------------
    getTile(x, y, z)
    {
        if (x < 0 || x >= this.m_width) throw "x out of range (got " + x + ")";
        if (y < 0 || y >= this.m_height) throw "y out of range (got " + y + ")";
        if (z < 0 || z >= this.m_depth) throw "z out of range (got " + z + ")";
        return this.m_tiles[x][y][z];
    }

    //--------------------------------------------------------------------------
    setTile(x, y, z, tile)
    {
        if (x < 0 || x >= this.m_width) throw "x out of range (got " + x + ")";
        if (y < 0 || y >= this.m_height) throw "y out of range (got " + y + ")";
        this.m_tiles[x][y][z] = tile;
    }

    //--------------------------------------------------------------------------
    handleClick(x, y, tile, event)
    {
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

        this.m_cursor = this.m_scene.add.image(0, 0, "selection_overlay");
        this.m_cursor.setVisible(false);
        this.m_cursor.setDepth(1);
    }

    //--------------------------------------------------------------------------
    attachTileMap(tile_map)
    {
        if (null !== this.m_tile_map)
        {
            throw "Changing tile map not yet implemented."; // todo
        }

        this.m_tile_map = tile_map;
        for (let x = 0; x < this.m_tile_map.getWidth(); ++x)
        {
            for (let y = 0; y < this.m_tile_map.getHeight(); ++y)
            {
                let tile = this.m_tile_map.getTile(x, y, 0);
                let tile_game_object = tile.createGameObject(this.m_scene);
                tile_game_object.setPosition(
                    (x + 0.5) * this.m_tile_width,
                    (y + 0.5) * this.m_tile_height);
                tile_game_object.setInteractive();
                tile_game_object.on(
                    "pointerup",
                    function(pointer, localX, localY, event)
                    {
                        // BUG: patch stopPropagation to set cancelled
                        //   on the event itself (as well as on the hidden
                        //   object)
                        event.stopPropagation_ = event.stopPropagation;
                        event.stopPropagation = function ()
                        {
                            this.cancelled = true;
                            this.stopPropagation_();
                        };

                        tile.handleClick(event);

                        if (!event.cancelled)
                        {
                            tile_map.handleClick(x, y, tile, event);
                        }

                        if (!event.cancelled)
                        {
                            this.handleClick(x, y, tile, event);
                        }
                    },
                    this);
            }
        }
    }

    //--------------------------------------------------------------------------
    hideCursor()
    {
        this.m_cursor.setVisible(false);
    }

    //--------------------------------------------------------------------------
    showCursor(x, y)
    {
        this.m_cursor.setVisible(true);
        this.m_cursor.setPosition((x + 0.5) * this.m_tile_width,
            (y + 0.5) * this.m_tile_height);
    }

    //--------------------------------------------------------------------------
    handleClick(x, y, tile, event)
    {
        this.showCursor(x, y);
        this.m_scene.events.emit("update_selected_tile", tile)
    }
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
                this.m_tile_map.setTile(x, y, 0, tile);
            }
        }
        for (let x = 0; x < this.m_tile_map.getWidth();++x)
        {
            if (x < this.m_tile_map.getHeight())
            {
                this.m_tile_map.setTile(x, x, 0, new PlainsTopTile());
            }
            if (x+1 < this.m_tile_map.getHeight())
            {
                this.m_tile_map.setTile(x, x+1, 0, new PlainsTop2Tile());
            }
        }
        //let mine_x = Math.floor(this.m_tile_map.getWidth() / 2);
        //let mine_y = Math.floor(this.m_tile_map.getHeight() / 2);
        // this.m_tile_map.setTile(8, 10, new MineTile());
        // this.m_tile_map.setTile(4, 3, new FarmTile());

        //this.m_tile_map.setTile(0, 1, new PlainsTopTile());
        //this.m_tile_map.setTile(0, 2, new PlainsTop2Tile());
        //this.m_tile_map.setTile(1, 2, new PlainsTopTile());
    }
}