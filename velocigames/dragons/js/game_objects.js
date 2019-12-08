//------------------------------------------------------------------------------
class TileAction
{
    //--------------------------------------------------------------------------
    // button_text, cost_text, cost_check_fn, cost_text_fn, active_text,
    // duration_seconds, begin_fn, end_fn
    constructor(values)
    {
        values = utils.add_defaults({
            button_text: "button_text",
            cost_text: null,
            cost_check_fn: function () { return true; },
            cost_text_fn: null,
            active_text: "active_text",
            duration_seconds: 0,
            begin_fn: function() {},
            end_fn: function() {},
        }, values);

        let self = this;
        this.m_button_text = values.button_text;
        this.m_cost_text = values.cost_text;
        this.m_cost_text_fn = values.cost_text_fn;
        this.m_cost_check_fn = values.cost_check_fn;
        this.m_active_text = values.active_text;
        this.m_duration_seconds = values.duration_seconds;
        this.m_begin_fn = values.begin_fn;
        this.m_end_fn = values.end_fn;
        this.m_execute_fn = function(scene)
        {
            self.m_begin_fn(scene, self);
            self.setActive(scene,true);
            scene.time.delayedCall(
                self.m_duration_seconds * MILLIS_PER_SECOND,
                function ()
                {
                    self.m_end_fn(scene, self);
                    self.setActive(scene,false);
                });
        };
        this.m_is_active = false;
    }

    //--------------------------------------------------------------------------
    getButtonText()
    {
        return this.m_button_text
            + this.getCostText();
    }

    //--------------------------------------------------------------------------
    getCostText()
    {
        if (null !== this.m_cost_text)
        {
            return "\nCost: " + this.m_cost_text;
        }
        else if (null !== this.m_cost_text_fn)
        {
            return "\nCost: " + this.m_cost_text_fn();
        }
        else
        {
            return "";
        }
    }

    //--------------------------------------------------------------------------
    getActiveText()
    {
        return this.m_active_text;
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

    //--------------------------------------------------------------------------
    isActive()
    {
        return this.m_is_active;
    }

    //--------------------------------------------------------------------------
    isCostMet()
    {
        return this.m_cost_check_fn();
    }

    //--------------------------------------------------------------------------
    setActive(scene, is_active)
    {
        if (is_active !== this.m_is_active)
        {
            this.m_is_active = is_active;
            scene.events.emit("update_actions");
        }
    }
}

//------------------------------------------------------------------------------
class Tile
{
    //--------------------------------------------------------------------------
    // display_name, image_key, image_index, actions
    constructor(values)
    {
        values = utils.add_defaults({
            display_name: "display_name",
            image_key: "image_key",
            image_index: null,
            mouseover_image_key: null,
            actions: [],
            x: 0,
            y: 0,
        }, values);
        this.m_display_name = values.display_name;
        this.m_image_key = values.image_key;
        this.m_image_index = values.image_index;
        this.m_mouseover_image_key = values.mouseover_image_key;
        this.m_actions = values.actions;
        this.m_x = values.x;
        this.m_y = values.y;
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
            // todo: not used - may be deleted
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
        else if (null !== this.m_image_index)
        {
            // terrain

            let image = scene.add.image(0, 0, image_key, this.m_image_index);
            // image.setOrigin(0, 0);
            image.scale = 2;

            game_object = image
        }
        else
        {
            // simple image
            let image = scene.add.image(0, 0, image_key);
            // image.setOrigin(0, 0);
            if (null !== this.m_mouseover_image_key)
            {
                let mouseover_image_key = this.m_mouseover_image_key;
                image.setInteractive();
                image.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER,
                    function ()
                    {
                        image.setTexture(mouseover_image_key);
                    });
                image.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT,
                    function ()
                    {
                        image.setTexture(image_key);
                    });
            }
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
    constructor(x, y)
    {
        super({
            display_name: "Plains",
            image_key: "terrain",
            image_index: 32*12 + Math.floor(Math.random()*3),
            x: x, y: y
        });
    }
}

//------------------------------------------------------------------------------
class PlainsTopTile extends Tile
{
    //--------------------------------------------------------------------------
    constructor(x, y)
    {
        super({
            display_name: "Plains",
            image_key: "terrain",
            image_index: 32*41+5,
            x: x, y: y
        });
    }
}

//------------------------------------------------------------------------------
class PlainsTop2Tile extends Tile
{
    //--------------------------------------------------------------------------
    constructor(x,y)
    {
        super({
            display_name: "Mountains",
            image_key: "terrain",
            image_index: 32 * 40 + 4,
            x: x, y: y
        });
    }
}

//------------------------------------------------------------------------------
class MountainsTile extends Tile
{
    //--------------------------------------------------------------------------
    constructor(x,y)
    {
        super({
            display_name: "Mountains",
            image_key: "terrain",
            image_index: 26 * 32 + 18 + Math.floor(Math.random() * 3),
            x: x, y: y
        });
    }
}

//------------------------------------------------------------------------------
class MineTile extends Tile
{
    //--------------------------------------------------------------------------
    constructor(x, y)
    {
        let actions = [
            new TileAction({
                button_text: "Mine Gold",
                active_text: "Mining for gold",
                duration_seconds: 0.5,
                end_fn: function(scene)
                {
                    let coin = new Coin(scene, x, y, 1);
                },
            }),
        ];
        super({
            display_name: "Mine",
            image_key: "mine_tile",
            actions: actions,
            x: x, y: y
        });
    }
}

//------------------------------------------------------------------------------
class FarmTile extends Tile
{
    //--------------------------------------------------------------------------
    constructor(x, y)
    {
        let actions = [
            new TileAction({
                button_text: "Raise Cow",
                duration_seconds: 5,
                active_text: "Nurturing cow",
                end_fn: function(scene, action)
                {
                    new Cow(scene, x, y, 1);
                }
            }),
            new TileAction({
                button_text: "Sell Cow",
                cost_text: "1 cow",
                cost_check_fn: function ()
                {
                    return game_model.m_global_resources.m_cows >= 1;
                },
                active_text: "Putting cow up for sale",
                duration_seconds: 2,
                begin_fn: function (scene)
                {
                    game_model.m_global_resources.m_cows -= 1;
                    scene.events.emit("update_global_resources");

                },
                end_fn: function(scene)
                {
                    new Coin(scene, x, y, 1);
                    new Coin(scene, x, y, 1);
                    new Coin(scene, x, y, 1);
                    new Coin(scene, x, y, 1);
                    new Coin(scene, x, y, 1);
                }
            }),
        ];
        super({
            display_name: "Farm",
            image_key: "farm_tile",
            actions: actions,
            x: x, y: y
        });
    }
}

//------------------------------------------------------------------------------
class BuildingAddTile extends Tile
{
    //--------------------------------------------------------------------------
    constructor(terrain_name, x, y)
    {

        let actions = [
            new TileAction({
                button_text: "Gather Hoard",
                cost_text_fn: function() {
                    return game_model.m_global_resources.m_hoard_cost + " gold"
                },
                duration_seconds: 30,
                active_text: "Gathering Gold",
                cost_check_fn: function ()
                {
                    return game_model.m_global_resources.m_gold >= game_model.m_global_resources.m_hoard_cost;
                },
                begin_fn: function (scene, action)
                {
                    game_model.m_global_resources.m_gold -= game_model.m_global_resources.m_hoard_cost;
                    game_model.m_global_resources.m_hoard_cost += 10;
                    scene.events.emit("update_global_resources");
                },
                end_fn: function (scene, action)
                {
                }
            }),
        ];

        if (terrain_name === "Mountains")
        {
            actions.push(
                new TileAction({
                    button_text: "Dig Mine",
                    cost_text_fn: function() {
                        return game_model.m_global_resources.m_mine_cost + " gold"
                    },
                    duration_seconds: 30,
                    active_text: "Blasting away",
                    cost_check_fn: function ()
                    {
                        return game_model.m_global_resources.m_gold >= game_model.m_global_resources.m_mine_cost;
                    },
                    begin_fn: function (scene, action)
                    {
                        game_model.m_global_resources.m_gold -= game_model.m_global_resources.m_mine_cost;
                        game_model.m_global_resources.m_mine_cost += 10;
                        scene.events.emit("update_global_resources");
                    },
                    end_fn: function (scene, action)
                    {
                    }
                }),
            );
        }
        else if (terrain_name === "Plains")
        {
            actions.push(
                new TileAction({
                    button_text: "Found Farm",
                    cost_text_fn: function() {
                        return game_model.m_global_resources.m_farm_cost + " gold"
                    },
                    duration_seconds: 30,
                    active_text: "Pretending to have a green thumb",
                    cost_check_fn: function ()
                    {
                        return game_model.m_global_resources.m_gold >= game_model.m_global_resources.m_farm_cost;
                    },
                    begin_fn: function (scene, action)
                    {
                        game_model.m_global_resources.m_gold -= game_model.m_global_resources.m_farm_cost;
                        game_model.m_global_resources.m_farm_cost += 10;
                        scene.events.emit("update_global_resources");

                    },
                    end_fn: function (scene, action)
                    {
                    }
                }),
            );
        }

        super({
            display_name: terrain_name,
            image_key: "plus_tile",
            mouseover_image_key: "plus_tile_hover",
            actions: actions,
            x: x, y: y
        });
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
                for (let z = 0; z < this.m_depth; ++z)
                {
                    this.m_tiles[x][y][z] = null;
                }
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
    getTileStack(x, y)
    {
        if (x < 0 || x >= this.m_width) throw "x out of range (got " + x + ")";
        if (y < 0 || y >= this.m_height) throw "y out of range (got " + y + ")";
        let stack = [];
        for (let z = 0; z < this.m_depth; ++z)
        {
            stack.push(this.m_tiles[x][y][z]);
        }
        return stack;
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

        this.m_selection_cursor = this.m_scene.add.image(0, 0, "selection_overlay");
        this.m_selection_cursor.setVisible(false);
        this.m_selection_cursor.setDepth(1);

        // TODO use me
        this.m_hover_cursor = this.m_scene.add.image(0, 0, "hover_overlay");
        this.m_hover_cursor.setVisible(false);
        this.m_hover_cursor.setDepth(1);
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
                let tile_stack = this.m_tile_map.getTileStack(x, y);
                let top_tile_game_object = null;
                let top_tile = null;
                for (let z = 0; z < this.m_tile_map.getDepth(); ++z)
                {
                    let tile = this.m_tile_map.getTile(x, y, z);
                    if (tile === null)
                    {
                        continue;
                    }

                    let tile_game_object = tile.createGameObject(this.m_scene);
                    tile_game_object.setPosition(
                        (x + 0.5) * this.m_tile_width,
                        (y + 0.5) * this.m_tile_height,
                        z);

                    top_tile_game_object = tile_game_object;
                    top_tile = tile;
                }
                top_tile_game_object.setInteractive();
                top_tile_game_object.on(
                    Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
                    function (pointer, localX, localY, event)
                    {
                        top_tile.handleClick(event);
                        tile_map.handleClick(x, y, top_tile, event);
                        this.handleClick(x, y, top_tile, event);
                    },
                    this);
            }
        }
    }

    //--------------------------------------------------------------------------
    hideCursor()
    {
        this.m_selection_cursor.setVisible(false);
    }

    //--------------------------------------------------------------------------
    showCursor(x, y)
    {
        this.m_selection_cursor.setVisible(true);
        this.m_selection_cursor.setPosition((x + 0.5) * this.m_tile_width,
            (y + 0.5) * this.m_tile_height);
    }

    //--------------------------------------------------------------------------
    handleClick(x, y, tile, event)
    {
        this.showCursor(x, y);
        let tile_info = {
            m_x: x,
            m_y: y,
            m_tile_map: this.m_tile_map,
            m_tile_stack: this.m_tile_map.getTileStack(x, y)
        };
        this.m_scene.events.emit("update_selected_tile", tile)
    }
}

//##############################################################################

//------------------------------------------------------------------------------
class DroppedResource
{
    //--------------------------------------------------------------------------
    constructor(scene, tile_x, tile_y, value, sprite_sheet_key,
                anim_key, global_resource_key, global_max_resource_key)
    {
        this.scene = scene;
        this.tile_x = tile_x;
        this.tile_y = tile_y;
        this.value = value;
        this.value_scale = 0.01;

        this.spit_distance_min = 1;
        this.spit_distance_max = 2;

        this.sprite_sheet_key = sprite_sheet_key;
        this.anim_key = anim_key;
        this.global_resource_key = global_resource_key;
        this.global_max_resource_key = global_max_resource_key;

        this.create();
    }

    //--------------------------------------------------------------------------
    create()
    {
        let scene = this.scene;
        // let sprite = scene.add.sprite({
        //     "x": (this.tile_x + 0.5) * layout_info.m_tile_width,
        //     "y": (this.tile_y + 0.5) * layout_info.m_tile_height,
        //     "key": this.sprite_sheet_key,
        //     // "scale": {
        //     //     x: 1 + this.value * this.value_scale,
        //     //     y: 1 + this.value * this.value_scale,
        //     // }
        // });
        let sprite = scene.add.sprite(
            (this.tile_x + 0.5) * layout_info.m_tile_width,
            (this.tile_y + 0.5) * layout_info.m_tile_height,
            this.sprite_sheet_key,
            // "scale": {
            //     x: 1 + this.value * this.value_scale,
            //     y: 1 + this.value * this.value_scale,
            // }
        );
        scene.anims.create({
            key: this.anim_key,
            frames: scene.anims.generateFrameNumbers(this.sprite_sheet_key),
            frameRate: 30,
            repeat: -1
        });

        let self = this;
        sprite.anims.load(this.anim_key);
        sprite.anims.play(this.anim_key);

        let hit_area = new Phaser.Geom.Rectangle(
            (this.tile_x + 0.5) * layout_info.m_tile_width - 64,
            (this.tile_y + 0.5) * layout_info.m_tile_height - 64,
            128, 128
        );
        sprite.setInteractive({"hitArea": hit_area});
        sprite.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, function (pointer, localX, localY, event) {
            event.stopPropagation();
            if (game_model.m_global_resources[self.global_resource_key] + self.value <
                game_model.m_global_resources[self.global_max_resource_key])
            {
                game_model.m_global_resources[self.global_resource_key] += self.value;
                scene.events.emit("update_global_resources");
                scene.children.remove(sprite);
            }
            else
            {
                // TODO play bad noise and show x sprite?
                console.log("unable to remove coin");
            }
        });

        sprite.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, function (pointer, localX, localY, event)
        {
            event.stopPropagation();
        });


            let spit_distance = Math.random() * (this.spit_distance_max - this.spit_distance_min) + this.spit_distance_min;
        let radians = Math.random() * 2 * Math.PI;
        let target_x = ((this.tile_x + 0.5) + Math.cos(radians) * spit_distance);
        let target_y = ((this.tile_y + 0.5) + Math.sin(radians) * spit_distance);

        let tween = scene.tweens.add({
            targets: [ sprite ],
            x: (target_x) * layout_info.m_tile_width,
            y: (target_y) * layout_info.m_tile_height,
            duration: 1000,
            ease: 'Sine.easeOut',
        });
    }
}

//------------------------------------------------------------------------------
class Coin extends DroppedResource
{
    //--------------------------------------------------------------------------
    constructor(scene, tile_x, tile_y, coin_value)
    {
        super(scene, tile_x, tile_y, coin_value,
            "coin_spritesheet", "spin_coin",
            "m_gold", "m_max_gold");
    }
}

//------------------------------------------------------------------------------
class Cow extends DroppedResource
{
    //--------------------------------------------------------------------------
    constructor(scene, tile_x, tile_y, cow_value)
    {
        super(scene, tile_x, tile_y, cow_value,
            "cow_spritesheet", "playful_cow",
            "m_cows", "m_max_cows");
    }
}

//##############################################################################

//------------------------------------------------------------------------------
class GameArea
{
    //--------------------------------------------------------------------------
    constructor(width, height)
    {
        this.m_tile_map = new TileMap(width, height, 2);
    }
}

//------------------------------------------------------------------------------
class VillageArea extends GameArea
{
    //--------------------------------------------------------------------------
    constructor()
    {
        super(20, 20);

        this.m_terrain_layer = 0;
        this.m_building_layer = 1;

        for (let x = 0; x < this.m_tile_map.getWidth(); ++x)
        {
            for (let y = 0; y < this.m_tile_map.getHeight(); ++y)
            {
                let tile = null;
                if (x < y)
                {
                    tile = new MountainsTile(x,y);
                }
                else
                {
                    tile = new PlainsTile(x,y);
                }
                this.m_tile_map.setTile(x, y, this.m_terrain_layer, tile);
            }
        }

        for (let x = 0; x < this.m_tile_map.getWidth();++x)
        {
            if (x < this.m_tile_map.getHeight())
            {
                this.m_tile_map.setTile(x, x, 0, new PlainsTopTile(x,x));
            }
            if (x+1 < this.m_tile_map.getHeight())
            {
                this.m_tile_map.setTile(x, x+1, this.m_terrain_layer, new PlainsTop2Tile(x,x+1));
            }
        }
        //let mine_x = Math.floor(this.m_tile_map.getWidth() / 2);
        //let mine_y = Math.floor(this.m_tile_map.getHeight() / 2);
        this.addBuilding(8, 10, new MineTile(8, 10,));
        this.addBuilding(11, 8, new FarmTile(11, 8));

        //this.m_tile_map.setTile(0, 1, new PlainsTopTile());
        //this.m_tile_map.setTile(0, 2, new PlainsTop2Tile());
        //this.m_tile_map.setTile(1, 2, new PlainsTopTile());
    }

    addBuilding(x, y, building_tile)
    {
        this.m_tile_map.setTile(x, y, this.m_building_layer, building_tile);
        if (x+1 < this.m_tile_map.getWidth())
        {
            this.createBuildingAddTileIfPossible(x+1, y);
        }
        if (x-1 >= 0)
        {
            this.createBuildingAddTileIfPossible(x-1, y);
        }
        if (y+1 < this.m_tile_map.getHeight())
        {
            this.createBuildingAddTileIfPossible(x, y+1);
        }
        if (y-1 >= 0)
        {
            this.createBuildingAddTileIfPossible(x, y-1);
        }
    }

    createBuildingAddTileIfPossible(x, y)
    {
        let tile_stack = this.m_tile_map.getTileStack(x,y);
        if (tile_stack[this.m_building_layer] === null)
        {
            this.m_tile_map.setTile(x, y, this.m_building_layer,
                new BuildingAddTile(tile_stack[this.m_terrain_layer].getDisplayName(), x, y));
        }
    }
}