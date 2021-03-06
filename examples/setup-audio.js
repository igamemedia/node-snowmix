#!/usr/bin/env node
'use strict'
/**
 * Creates creates three audioFeeds, one audioMixer and one audioSink.
 * This is enough to get audio going!
 */
let Snowmix = require('../node-snowmix'),
    snowmix = Snowmix.new(),
    id = process.argv[2],
    name = process.argv[3]

snowmix.connect()
.then(() => {
    return Promise.all([
        snowmix.audioFeeds.deleteAll(),
        snowmix.audioMixers.deleteAll(),
        snowmix.audioSinks.deleteAll(),
    ])
}).then(() => {
    return Promise.all([
        snowmix.audioFeeds.create(),
        snowmix.audioFeeds.create(),
        snowmix.audioFeeds.create(),
        snowmix.audioMixers.create(),
        snowmix.audioSinks.create(),
    ])
}).then(() => {
    return Promise.all([
        snowmix.audioMixers.byId(1).addAudioFeed(1),
        snowmix.audioMixers.byId(1).addAudioFeed(2),
        snowmix.audioMixers.byId(1).addAudioFeed(3),
    ])
}).then(() => {
    return Promise.all([
        snowmix.audioMixers.byId(1).unmuteAudioFeed(1),
        snowmix.audioMixers.byId(1).unmuteAudioFeed(2),
        snowmix.audioMixers.byId(1).unmuteAudioFeed(3),
    ])
}).then(() => {
    return snowmix.audioMixers.byId(1).start()
}).then(() => {
    return snowmix.audioSinks.byId(1).addAudioMixer(1)
}).then(() => {
    console.log('OK, done')
    return snowmix.close()
})
