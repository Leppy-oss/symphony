const mineflayer = require('mineflayer');
const { Item } = require('prismarine-item')
const mcData = require('minecraft-data')('1.19');

module.exports = {
    minecraftData: require('minecraft-data')(require('./bot-options').connectionOptions.version),
    smeltable: [
        'porkchop',
        'cod',
        'salmon',
        'beef',
        'chicken',
        'rabbit',
        'mutton',
        'raw_iron',
        'raw_copper',
        'raw_gold',
        'kelp',
        'potato',
        'netherite_scrap',
        'coal_ore',
        'deepslate_coal_ore',
        'iron_ore',
        'deepslate_iron_ore',
        'copper_ore',
        'deepslate_copper_ore',
        'gold_ore',
        'deepslate_gold_ore',
        'redstone_ore',
        'deepslate_redstone_ore',
        'emerald_ore',
        'deepslate_emerald_ore',
        'diamond_ore',
        'deepslate_diamond_ore',
        'lapis_ore',
        'deepslate_lapis_ore',
        'nether_gold_ore',
        'nether_quartz_ore',
        'sand',
        'cobblestone',
        'sandstone',
        'red_sandstone',
        'stone',
        'quartz_block',
        'netherrack',
        'nether_bricks',
        'clay_ball',
        'basalt',
        'clay',
        'stone_bricks',
        'polished_blackstone_bricks',
        'cobbled_deepslate',
        'deepslate_tiles',
        'white_terracotta',
        'orange_terracotta',
        'magenta_terracotta',
        'light_blue_terracotta',
        'yellow_terracotta',
        'lime_terracotta',
        'pink_terracotta',
        'gray_terracotta',
        'light_gray_terracotta',
        'cyan_terracotta',
        'purple_terracotta',
        'blue_terracotta',
        'brown_terracotta',
        'green_terracotta',
        'red_terracotta',
        'cactus',
        'oak_log',
        'spruce_log',
        'birch_log',
        'jungle_log',
        'acacia_log',
        'dark_oak_log',
        'mangrove_log',
        'stripped_oak_log',
        'stripped_spruce_log',
        'stripped_birch_log',
        'stripped_jungle_log',
        'stripped_acacia_log',
        'stripped_dark_oak_log',
        'stripped_mangrove_log',
        'oak_wood',
        'spruce_wood',
        'birch_wood',
        'jungle_wood',
        'acacia_wood',
        'dark_oak_wood',
        'mangrove_wood',
        'stripped_oak_wood',
        'stripped_spruce_wood',
        'stripped_birch_wood',
        'stripped_jungle_wood',
        'stripped_acacia_wood',
        'stripped_dark_oak_wood',
        'stripped_mangrove_wood',
        'chorus_fruit',
        'wet_sponge',
        'sea_pickle'
    ],
    /**
     * @param {Item} item
     */
    isSmeltable: (item) => {
        return module.exports.smeltable.includes(item.name);
    },
    fuel: [
        'lava_bucket',
        'coal_block',
        'dried_kelp_block',
        'blaze_rod',
        'coal',
        'charcoal',
        'oak_boat',
        'oak_chest_boat',
        'spruce_boat',
        'spruce_chest_boat',
        'birch_boat',
        'birch_chest_boat',
        'jungle_boat',
        'jungle_chest_boat',
        'acacia_boat',
        'acacia_chest_boat',
        'dark_oak_boat',
        'dark_oak_chest_boat',
        'mangrove_boat',
        'mangrove_chest_boat',
        'scaffolding',
        'oak_sign',
        'spruce_sign',
        'birch_sign',
        'jungle_sign',
        'acacia_sign',
        'dark_oak_sign',
        'mangrove_sign',
        'crimson_sign',
        'warped_sign',
        'oak_log',
        'spruce_log',
        'birch_log',
        'jungle_log',
        'acacia_log',
        'dark_oak_log',
        'mangrove_log',
        'stripped_oak_log',
        'stripped_spruce_log',
        'stripped_birch_log',
        'stripped_jungle_log',
        'stripped_acacia_log',
        'stripped_dark_oak_log',
        'stripped_mangrove_log',
        'oak_wood',
        'spruce_wood',
        'birch_wood',
        'jungle_wood',
        'acacia_wood',
        'dark_oak_wood',
        'mangrove_wood',
        'stripped_oak_wood',
        'stripped_spruce_wood',
        'stripped_birch_wood',
        'stripped_jungle_wood',
        'stripped_acacia_wood',
        'stripped_dark_oak_wood',
        'stripped_mangrove_wood',
        'oak_planks',
        'spruce_planks',
        'birch_planks',
        'jungle_planks',
        'acacia_planks',
        'dark_oak_planks',
        'mangrove_planks',
        'oak_slab',
        'spruce_slab',
        'birch_slab',
        'jungle_slab',
        'acacia_slab',
        'dark_oak_slab',
        'mangrove_slab',
        'oak_stairs',
        'spruce_stairs',
        'birch_stairs',
        'jungle_stairs',
        'acacia_stairs',
        'dark_oak_stairs',
        'mangrove_stairs',
        'oak_pressure_plate',
        'spruce_pressure_plate',
        'birch_pressure_plate',
        'jungle_pressure_plate',
        'acacia_pressure_plate',
        'dark_oak_pressure_plate',
        'mangrove_pressure_plate',
        'oak_button',
        'spruce_button',
        'birch_button',
        'jungle_button',
        'acacia_button',
        'dark_oak_button',
        'mangrove_button',
        'oak_trapdoor',
        'spruce_trapdoor',
        'birch_trapdoor',
        'jungle_trapdoor',
        'acacia_trapdoor',
        'dark_oak_trapdoor',
        'mangrove_trapdoor',
        'oak_fence',
        'spruce_fence',
        'birch_fence',
        'jungle_fence',
        'acacia_fence',
        'dark_oak_fence',
        'mangrove_fence',
        'oak_fence_gate',
        'spruce_fence_gate',
        'birch_fence_gate',
        'jungle_fence_gate',
        'acacia_fence_gate',
        'dark_oak_fence_gate',
        'mangrove_fence_gate',
        'mangrove_roots',
        'ladder',
        'crafting_table',
        'cartography_table',
        'fletching_table',
        'smithing_table',
        'loom',
        'bookshelf',
        'lectern',
        'composter',
        'chest',
        'trapped_chest',
        'barrel',
        'daylight_detector',
        'jukebox',
        'note_block',
        'white_banner',
        'orange_banner',
        'magenta_banner',
        'light_blue_banner',
        'yellow_banner',
        'lime_banner',
        'pink_banner',
        'gray_banner',
        'light_gray_banner',
        'cyan_banner',
        'purple_banner',
        'blue_banner',
        'brown_banner',
        'green_banner',
        'red_banner',
        'black_banner',
        'crossbow',
        'bow',
        'fishing_rod',
        'oak_door',
        'spruce_door',
        'birch_door',
        'jungle_door',
        'acacia_door',
        'dark_oak_door',
        'mangrove_door',
        'wooden_pickaxe',
        'wooden_sword',
        'wooden_shovel',
        'wooden_axe',
        'wooden_hoe',
        'bowl',
        'oak_sapling',
        'spruce_sapling',
        'birch_sapling',
        'jungle_sapling',
        'acacia_sapling',
        'dark_oak_sapling',
        'mangrove_sapling',,
        'stick',
        'dead_bush',
        'azalea',
        'bamboo',
        'white_wool',
        'orange_wool',
        'magenta_wool',
        'light_blue_wool',
        'yellow_wool',
        'lime_wool',
        'pink_wool',
        'gray_wool',
        'light_gray_wool',
        'cyan_wool',
        'purple_wool',
        'blue_wool',
        'brown_wool',
        'green_wool',
        'red_wool',
        'black_wool',
        'white_carpet',
        'orange_carpet',
        'magenta_carpet',
        'light_blue_carpet',
        'yellow_carpet',
        'lime_carpet',
        'pink_carpet',
        'gray_carpet',
        'light_gray_carpet',
        'cyan_carpet',
        'purple_carpet',
        'blue_carpet',
        'brown_carpet',
        'green_carpet',
        'red_carpet',
        'black_carpet'
    ],
    /**
     * @param {Item} item 
     */
    isFuel : (item) => {
        return module.exports.fuel.includes(item.name);
    }
}