This is tutorial 2. It explains how to switch audio.

It assumes you've completed [tutorial 1](tutorial1--switching-video.md)
and that you already have Snowmix running and a couple of inputs. You can double-check this by running:

    node-snowmix/examples/list-feeds.js


## STEP 1: Create audio inputs

Audio inputs are called *audio feeds*.
Let's make 2 so that we can switch between them:

    node-snowmix/examples/create-audiofeed.js
    node-snowmix/examples/create-audiofeed.js


## STEP 2: Create an audio mixer and audio sink

An audio mixer lets you switch/mix audiofeeds.
An audio sink lets the audio be joined with the video.
You'll almost always need exactly one of each.

    node-snowmix/examples/create-audiomixer.js
    node-snowmix/examples/create-audiosink.js


## STEP 3: Create some audio inputs

Audio inputs could either the audio from a video source, or be a dedicated audio source.

In [tutorial 1](tutorial1--switching-video.md) we used the script `file-to-snowmix-no-audio.sh` to send video. This time, we require audio. So, change these commands to use the `file-to-snowmix.sh` script instead.

i.e.

    node-snowmix/scripts/file-to-snowmix.sh 1 <full path to MP4 file>
    node-snowmix/scripts/file-to-snowmix.sh 2 <full path to MP4 file>

If you're still running `av_output2screen`, as part of tutorial 1, you should still see the output of one of these videos. And you should still be able to switch between them with `examples/switch-video.js`.

# STEP 4: Selecting an audio input

TODO!!!

# STEP 5: Switching between audio inputs

TODO!!!

## Next steps

They're not written yet, but the plan is for tutorials on images and texts.