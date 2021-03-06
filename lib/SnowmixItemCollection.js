'use strict'
const _ = require('lodash'),
    Promise = require('bluebird'),
    logger = require('./logger')

/**
 * @abstract
 * Abstract superclass for a collection of one type of Snowmix item
 * (Feed, Vfeed, Text, AudioMixer, and the rest.)
 */
class SnowmixItemCollection {
    constructor(snowmix) {
        this.snowmix = snowmix
        this.items = []
    }

    /**
     * Returns all
     * @return {array}
     */
    all() {
        return this.items
    }

    /**
     * Returns next available ID.
     * e.g. if existing IDs used are [1,2,3,5] return 4, then 6.
     * @return {integer}
     * @private
     */
    getNextAvailableId () {
        return findFirstHoleInSequence(this.allIds())
    }

    /**
     * Returns all IDs
     *
     * @return {array} IDs as integers
     */
    allIds() {
        return this.all().map(f => f.id)
    }

    /**
     * Get by ID
     *
     * @param {integer} - ID
     * @return - object
     */
    byId(id) {
        id = parseInt(id)
        return this.items.find(f => f.id === id)
    }


    /**
     * Remove all
     * @fulfill {undefined}
     */
    deleteAll() {
        return Promise.map(this.allIds(), id => { return this.byId(id).delete() })
    }

    removeFromInternalList(audioFeed) {
        _.remove(this.items, a => a === audioFeed)
    }

    create(args) {
        let item = this._createOrUpdate(args, true)

        if (item.changed) {
            delete item.changed
            return item.apply().return(item)
        }

        return Promise.resolve(item)
    }

    _createOrUpdate(args = {}, trackChange = false) {
        let item
        if (!_.isNil(args.id)) {
            item = this.byId(parseInt(args.id))
        }
        if (item) { // update
            item.assign(args, trackChange)
        }
        else { // create
            if (_.isNil(args.id)) args.id = this.getNextAvailableId()
            item = new this.itemName(this.snowmix, args.id, args)
            if (trackChange) item.changed = true
            this.items.push(item)
        }

        return item
    }

}

module.exports = SnowmixItemCollection

function findFirstHoleInSequence(sequence) {
    sequence = sequence.sort((a,b)=>a-b)
    if (!sequence.length) return 1
    for (let i=1;i<sequence.length;i++) {
        if (sequence[i] > sequence[i-1]+1) return sequence[i-1]+1
    }
    return sequence[sequence.length-1] + 1
}
