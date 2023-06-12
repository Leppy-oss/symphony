const { Entity } = require('prismarine-entity');

module.exports = {
    /**
     * Returns the distance between two
     * @param {Entity} entity1 
     * @param {Entity} entity2 
     */
    distance: (entity1, entity2) => {
        return entity1.position.distanceTo(entity2.position);
    },

    /**
     * @param {Entity} entity
     * @param {Array<Entity>} entities 
     */
    sort: (entity, entities) => {
        const distance = module.exports.distance;
        return entities.sort((a, b) => distance(a, entity) - distance(b, entity));
    }
}