'use strict'
const _ = require('lodash'),
      Promise = require('bluebird'),
      logger = require('./logger'),
      AudioMixer = require('./AudioMixer'),
      utils = require('./utils')

/**
 * Handles all audio mixers
 */
class AudioMixers {
    constructor(snowmix) {
        this.snowmix = snowmix
        this.audiomixers = []
    }

    /**
     * Returns all audio mixers
     *
     * @return {array}}
     */
    all() {
        return this.audiomixers
    }

    /**
     * Returns all audio mixer IDs
     *
     * @return {array} of integers
     */
    allIds() {
        return this.audiomixers.map(f => f.id)
    }

    /**
     * Get an audioMixer by ID
     *
     * @param {integer} ID
     * @return {AudioMixer} object
     */
    byId(id) {
        id = parseInt(id)
        return this.audiomixers.find(f => f.id === id)
    }

    /**
     * Returns next available ID.
     * e.g. if existing IDs used are [1,2,3,5] return 4, then 6.
     *
     * @return {integer}
     */
    getNextAvailableId() {
        return utils.findFirstHoleInSequence(this.allIds())
    }

    /**
     * Remove all audiomixers
     * @return {Promise}
     */
    removeAll() {
        return Promise.map(this.allIds(), id => { return this.byId(id).remove() })
    }

    removeAudioMixerFromInternalListOfAudioMixers(audioMixer) {
        _.remove(this.audiomixers, a => a === audioMixer)
    }

    /**
     * Add a new audio mixer.
     * Of, if an audio mixer of the specified ID is provided, updates it.
     *
     * @param {object} containing 'name' (required) and 'id' (optional)
     * If omitted, id will be next highest value.
     */
    add(args) {
        let audioMixer = this._createOrUpdate(args)
        return audioMixer.apply().return(audioMixer)
    }

    _createOrUpdate(args) {
        let audioMixer
        if (!_.isNil(args.id)) audioMixer = this.byId(args.id)
        if (audioMixer) { // update
            Object.assign(audioMixer, args)
        }
        else { // create
            if (_.isNil(args.id)) args.id = this.getNextAvailableId()
            audioMixer = new AudioMixer(this.snowmix, args.id, args)
            this.audiomixers.push(audioMixer)
        }

        return audioMixer
    }

    /**
     * Runs when Snowmix is connected to discover all audiomixers.
     * @private
     */
    populate() {
        return this._parseAudioMixerAddCommand()
        .then((idsAndNames) => {
            return this._parseAudioMixerInfoCommand(idsAndNames)
        })
    }

    _parseAudioMixerAddCommand() {
        return this.snowmix.sendCommand('audio mixer add', { tidy: true, expectMultiline: true, logAtSillyLevel: true })
        .then(lines => {
            let idsAndNames = {}
            lines.forEach(l => {
                let match = l.match(/^\s*audio mixer\s*(\d+)\s*<(.+)>\s*$/)
                if (match) idsAndNames[parseInt(match[1])] = match[2]
            })

            return idsAndNames
        })
    }

    _parseAudioMixerInfoCommand(idsAndNames) {
        return this.snowmix.sendCommand('audio mixer info', { tidy: true, expectMultiline: true, logAtSillyLevel: true })
        .then(lines => {
            lines.forEach(l => {
                let match

                if (l.match(/^\s*audio mixer info\s*$/)) return
                if (match = l.match(/^\s*audio mixers\s*:\s*(\d+)\s*$/)) return

                if (match = l.match(/^\s*max audio mixers\s*:\s*(\d+)\s*$/)) {
                    this.maxAudioMixers = match[1]
                    return
                }

                if (match = l.match(/^\s*verbose level\s*:\s*(\d+)\s*$/)) {
                    this.verboseLevel = match[1]
                    return
                }

                if (l.match(/^\s*audio mixer id : state, rate, channels, bytespersample, signess, volume, mute, buffersize, delay, queues\s*$/)) return

                if (match = l.match(/^[-\s]*audio mixer\s*(\d+)\s*:\s*(.+)$/)) {
                    let id = parseInt(match[1])
                    let details = match[2].split(', ')

                    if (!idsAndNames.hasOwnProperty(id)) {
                        logger.debug('AudioMixer %d is known by [audio mixer add] but not [audio mixer info], omitting', id)
                        return
                    }

                    this._createOrUpdate({
                        id: id,
                        name: idsAndNames[id],
                        state: details[0],
                        rate: details[1],
                        channels: details[2],
                        bytePerSample: details[3],
                        signess: details[4],
                        volume: details[5].split(','), // one value for each channel
                        muted: details[6] !== 'unmuted',
                        bufferSize: details[7],
                        delay: details[8],
                        queues: details[9],
                    })
                    return
                }

                logger.warn('Misunderstood line in audio mixer info:', l)
            })
        })
    }
}

module.exports = AudioMixers