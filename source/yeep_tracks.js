
( function ( tracks )
{
    "use strict";

    var extend = yeep.extend;

    var notification = {
        "ping": function ()
        {
            yeep.tones.ar( { freq: yeep.notes.C5 } );
        },
        "add": function ()
        {
            yeep.tones.ar( { freq: yeep.notes.C5 } );
            yeep.tones.ar( { freq: yeep.notes.E5, delaySec: 0.2 } );
        },
        "remove": function ()
        {
            yeep.tones.ar( { freq: yeep.notes.E5 } );
            yeep.tones.ar( { freq: yeep.notes.C5, delaySec: 0.2 } );
        },
        "ring": function ()
        {
            for ( var i = 0; i < 2; i++ )
            {
                yeep.tones.ar( { freq: yeep.notes.C5, delaySec: 0.8 * i } );
                yeep.tones.ar( { freq: yeep.notes.C5, delaySec: 0.8 * i + 0.3 } );
                yeep.tones.ar( { freq: yeep.notes.G5, delaySec: 0.8 * i + 0.4 } );
                yeep.tones.ar( { freq: yeep.notes.E5, delaySec: 0.8 * i + 0.5 } );
            }
        }
    };

    var tunes = {
        "sadTrombone": function ()
        {
            var base = { oscType: "triangle", delaySec: 0, attackSec: 0.5, sustainSec: 0.5, decayVol: 1 };

            yeep.tones.adsr( extend( {}, base, { freq: yeep.notes[ "D4" ], delaySec: 0 } ) );
            yeep.tones.adsr( extend( {}, base, { freq: yeep.notes[ "C#4" ], delaySec: 0.75, sustainSec: 0.5 } ) );
            yeep.tones.adsr( extend( {}, base, { freq: yeep.notes[ "C4" ], delaySec: 1.5, sustainSec: 0.5 } ) );
            yeep.tones.adsr( extend( {}, base, { freq: yeep.notes[ "B3" ], delaySec: 2.25, sustainSec: 1.5, releaseSec: 0.5 } ) );
        },
        "zelda": function ()
        {
            var base = { oscType: "triangle", attackSec: 0.1, attackVol: 0.4, decayVol: 0.4, releaseSec: 0.1 };

            yeep.tones.adsr( extend( {}, base, { delaySec: 0.0, freq: yeep.notes["D#3"] } ) );
            yeep.tones.adsr( extend( {}, base, { delaySec: 0.0, freq: yeep.notes["A4"] } ) );

            yeep.tones.adsr( extend( {}, base, { delaySec: 0.2, freq: yeep.notes["E3"] } ) );
            yeep.tones.adsr( extend( {}, base, { delaySec: 0.2, freq: yeep.notes["A#4"] } ) );

            yeep.tones.adsr( extend( {}, base, { delaySec: 0.4, freq: yeep.notes["F3"] } ) );
            yeep.tones.adsr( extend( {}, base, { delaySec: 0.4, freq: yeep.notes["B4"] } ) );

            yeep.tones.adsr( extend( {}, base, { delaySec: 0.6, freq: yeep.notes["F#3"], sustainSec: 0.8 } ) );
            yeep.tones.adsr( extend( {}, base, { delaySec: 0.6, freq: yeep.notes["C5"], sustainSec: 0.8 } ) );
        }
    };

    var drums = {
        "snare": function ( options )
        {
            options = options || {};
            var lp = yeep.audioCtx.createBiquadFilter();

            lp.type = "lowpass";
            lp.frequency.setValueAtTime( 5000, yeep.audioCtx.currentTime + ( options.delaySec || 0 ) );
            lp.frequency.exponentialRampToValueAtTime( 3000, yeep.audioCtx.currentTime + 0.1 + ( options.delaySec || 0 ) );

            var noise = yeep.audioCtx.createWhiteNoise();
            var noiseGain = yeep.envelopes.ar( { attackSec: 0, attackVol: 2, releaseSec: 1, delaySec: options.delaySec || 0 } );

            noise.connect( noiseGain );
            noiseGain.connect( lp );
            lp.connect( yeep.audioCtx.destination );
        },
        "kick": function ( options )
        {
            var lp = yeep.audioCtx.createBiquadFilter();
            lp.type = "lowpass";
            lp.frequency.value = 500;
            lp.frequency.setValueAtTime( 500, yeep.audioCtx.currentTime + ( options.delaySec || 0 ) );
            lp.frequency.exponentialRampToValueAtTime( 1, yeep.audioCtx.currentTime + 0.4 + ( options.delaySec || 0 ) );

            var postGain = yeep.audioCtx.createGain();
            postGain.gain.value = 1.5; //TODO: doesn't amplify in firefox, ok in chrome

            yeep.tones.ar( extend( {}, { oscType: "square", freq: yeep.notes[ "A1" ], upSec: 0.02, downSec: 0.6, vol: 1, postGainFilters: [ lp, postGain ] }, options ) );
        },
        "splash": function ( options )
        {
            options = options || {};
            var lp = yeep.audioCtx.createBiquadFilter();

            lp.type = "highpass";
            lp.frequency.value = 1500;
            lp.frequency.setValueAtTime( 1500, yeep.audioCtx.currentTime + ( options.delaySec || 0 ) );
            lp.frequency.exponentialRampToValueAtTime( 3000, yeep.audioCtx.currentTime + 0.5 + ( options.delaySec || 0 ) );

            var noise = yeep.audioCtx.createWhiteNoise();
            var noiseGain = yeep.envelopes.ar( { attackSec: 0, attackVol: 1, releaseSec: 2, delaySec: options.delaySec || 0 } );

            noise.connect( noiseGain );
            noiseGain.connect( lp );
            lp.connect( yeep.audioCtx.destination );
        },
        "rimshot": function ()
        {
            yeep.tracks.snare();
            yeep.tracks.kick( { delaySec: 0.3 } );
            yeep.tracks.splash( { delaySec: 0.9 } );
        },
        "beat": function ()
        {
            yeep.tracks.kick( { delaySec: 0 } );
            yeep.tracks.kick( { delaySec: 0.125 } );
            yeep.tracks.kick( { delaySec: 0.5 } );
            yeep.tracks.kick( { delaySec: 0.625 } );

            yeep.tracks.snare( { delaySec: 0.5 } );

            yeep.tracks.splash( { delaySec: 0 } );
            yeep.tracks.splash( { delaySec: 0.25 } );
            yeep.tracks.splash( { delaySec: 0.5 } );
            yeep.tracks.splash( { delaySec: 0.75 } );
        }
    };

    yeep.extend( tracks, notification, tunes, drums );

    return ( tracks );

} )( this.yeep.tracks );
