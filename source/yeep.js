
( function ( yeep )
{
    "use strict";

    var defaults = {
        logging: true
    };

    var settings = {};

    var log = function ()
    {
        if ( settings.logging )
        {
            console.log.apply( console, arguments );
        }
    };

    var extend = function ( target )
    {
        for ( var i = 1; i < arguments.length; i++ )
        {
            var source = arguments[ i ];
            if ( source )
            {
                Object.keys( source ).forEach( function ( key )
                {
                    target[ key ] = source[ key ];
                } );
            }
        }
        return ( target );
    };


    yeep.notes = ( function ()
    {
        var result = {};
        var notes = [ "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#" ];
        var noteIndex = 0;

        for ( var freq = 55; freq < 20000; freq *= Math.pow( 2, 1 / 12 ) )
        {
            result[ notes[ noteIndex % 12 ] + ( 1 + Math.floor( noteIndex / 12 ) ) ] = freq;
            noteIndex++;
        }
        return ( result );
    } )();

    var audioCtx = new ( window.AudioContext || window.webkitAudioContext )();

    yeep.play = function ( soundName, options )
    {
        //TODO: add options for repeats and what-not
        yeep.tracks[ soundName ]();
    };

    yeep.gains = {
        "ar": function ( options )
        {
            var defaults = {
                delaySec: 0,
                attackSec: 0.05,
                attackVol: 1,
                releaseSec: 0.02
            };

            var set = extend( {}, defaults, options );

            var now = audioCtx.currentTime;

            var gainNode = audioCtx.createGain();
            gainNode.gain.setValueAtTime( 0, 0 );
            gainNode.gain.setValueAtTime( 0.00001, now + set.delaySec );
            gainNode.gain.exponentialRampToValueAtTime( set.attackVol, now + set.delaySec + set.attackSec );
            gainNode.gain.exponentialRampToValueAtTime( 0.00001, now + set.delaySec + set.attackSec + set.releaseSec );

            return ( gainNode );
        },
        "adsr": function ( options )
        {
            var defaults = {
                delaySec: 0,
                attackSec: 0.05,
                attackVol: 1,
                decaySec: 0.02,
                decayVol: 0.8,
                sustainSec: 0.2,
                releaseSec: 0.02
            };

            var set = extend( {}, defaults, options );

            var now = audioCtx.currentTime;

            var gainNode = audioCtx.createGain();
            gainNode.gain.setValueAtTime( 0, 0 );
            gainNode.gain.setValueAtTime( 0.00001, now + set.delaySec );
            gainNode.gain.exponentialRampToValueAtTime( set.attackVol, now + set.delaySec + set.attackSec );
            gainNode.gain.exponentialRampToValueAtTime( set.decayVol, now + set.delaySec + set.attackSec + set.decaySec );
            gainNode.gain.exponentialRampToValueAtTime( set.decayVol, now + set.delaySec + set.attackSec + set.decaySec + set.sustainSec );
            gainNode.gain.exponentialRampToValueAtTime( 0.00001, now + set.delaySec + set.attackSec + set.decaySec + set.sustainSec + set.releaseSec );

            return ( gainNode );
        }
    };

    yeep.tones = {
        "ar": function ( options )
        {
            var defaults = {
                oscType: "sine",
                freq: yeep.notes.C4,
                delaySec: 0,
                upSec: 0.05,
                vol: 0.4,
                downSec: 0.5
            };

            var set = extend( {}, defaults, options );

            set.attackSec = set.upSec;
            set.attackVol = set.vol;
            set.decaySec = 0;
            set.sustainSec = 0;
            set.releaseSec = set.downSec;

            return( yeep.tones.adsr( set ) );
        },
        "adsr": function ( options )
        {
            var defaults = {
                oscType: "sine",
                freq: yeep.notes.C4,
                delaySec: 0,
                attackSec: 0.05,
                attackVol: 1,
                decaySec: 0.02,
                decayVol: 0.8,
                sustainSec: 0.2,
                releaseSec: 0.02,
                preGainFilters: [],
                postGainFilters: []
            };

            var set = extend( {}, defaults, options );

            var osc = audioCtx.createOscillator();
            osc.frequency.setValueAtTime( set.freq, 0 );
            osc.type = set.oscType;

            var lastNode = osc;
            var gainNode = yeep.gains.adsr( set );

            set.preGainFilters.forEach( function ( filter )
            {
                lastNode.connect( filter );
                lastNode = filter;
            } );

            lastNode.connect( gainNode );
            lastNode = gainNode;

            set.postGainFilters.forEach( function ( filter )
            {
                lastNode.connect( filter );
                lastNode = filter;
            } );

            lastNode.connect( audioCtx.destination );

            var now = audioCtx.currentTime;
            osc.start( now );
            osc.stop( now + set.delaySec + set.attackSec + set.decaySec + set.sustainSec + set.releaseSec );

            return ( lastNode );
        }
    };

    yeep.tracks = {
        "ping": function ()
        {
            yeep.tones.ar( { freq: yeep.notes.C4 } );
        },
        "add": function ()
        {
            yeep.tones.ar( { freq: yeep.notes.C4 } );
            yeep.tones.ar( { freq: yeep.notes.E4, delaySec: 0.2 } );
        },
        "remove": function ()
        {
            yeep.tones.ar( { freq: yeep.notes.E4 } );
            yeep.tones.ar( { freq: yeep.notes.C4, delaySec: 0.2 } );
        },
        "ring": function ()
        {
            for ( var i = 0; i < 2; i++ )
            {
                yeep.tones.ar( { freq: yeep.notes.C4, delaySec: 0.8 * i } );
                yeep.tones.ar( { freq: yeep.notes.C4, delaySec: 0.8 * i + 0.3 } );
                yeep.tones.ar( { freq: yeep.notes.G4, delaySec: 0.8 * i + 0.4 } );
                yeep.tones.ar( { freq: yeep.notes.E4, delaySec: 0.8 * i + 0.5 } );
            }
        },
        "sadTrombone": function ()
        {
            var base = { oscType: "triangle", delaySec: 0, attackSec: 0.5, sustainSec: 0.5, decayVol: 1 };

            yeep.tones.adsr( extend( {}, base, { freq: yeep.notes[ "D3" ], delaySec: 0 } ) );
            yeep.tones.adsr( extend( {}, base, { freq: yeep.notes[ "C#3" ], delaySec: 0.75, sustainSec: 0.5 } ) );
            yeep.tones.adsr( extend( {}, base, { freq: yeep.notes[ "C3" ], delaySec: 1.5, sustainSec: 0.5 } ) );
            yeep.tones.adsr( extend( {}, base, { freq: yeep.notes[ "B3" ], delaySec: 2.25, sustainSec: 1.5, releaseSec: 0.5 } ) );
        },
        "snare": function ( options )
        {
            options = options || {};
            var lp = audioCtx.createBiquadFilter();

            lp.type = "lowpass";
            lp.frequency.setValueAtTime( 5000, audioCtx.currentTime + ( options.delaySec || 0 ) );
            lp.frequency.exponentialRampToValueAtTime( 3000, audioCtx.currentTime + 0.1 + ( options.delaySec || 0 ) );

            var noise = audioCtx.createWhiteNoise();
            var noiseGain = yeep.gains.ar( { attackSec: 0, attackVol: 2, releaseSec: 1, delaySec: options.delaySec || 0 } );

            noise.connect( noiseGain );
            noiseGain.connect( lp );
            lp.connect( audioCtx.destination );
        },
        "kick": function ( options )
        {
            var lp = audioCtx.createBiquadFilter();
            lp.type = "lowpass";
            lp.frequency.value = 500;
            lp.frequency.setValueAtTime( 500, audioCtx.currentTime + ( options.delaySec || 0 ) );
            lp.frequency.exponentialRampToValueAtTime( 1, audioCtx.currentTime + 0.4 + ( options.delaySec || 0 ) );

            var postGain = audioCtx.createGain();
            postGain.gain.value = 1.5; //TODO: doesn't amplify in firefox, ok in chrome

            yeep.tones.ar( extend( {}, { oscType: "square", freq: yeep.notes[ "A1" ], upSec: 0.02, downSec: 0.6, vol: 1, postGainFilters: [ lp, postGain ] }, options ) );
        },
        "splash": function ( options )
        {
            options = options || {};
            var lp = audioCtx.createBiquadFilter();

            lp.type = "highpass";
            lp.frequency.value = 1500;
            lp.frequency.setValueAtTime( 1500, audioCtx.currentTime + ( options.delaySec || 0 ) );
            lp.frequency.exponentialRampToValueAtTime( 3000, audioCtx.currentTime + 0.5 + ( options.delaySec || 0 ) );

            var noise = audioCtx.createWhiteNoise();
            var noiseGain = yeep.gains.ar( { attackSec: 0, attackVol: 1, releaseSec: 2, delaySec: options.delaySec || 0 } );

            noise.connect( noiseGain );
            noiseGain.connect( lp );
            lp.connect( audioCtx.destination );
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
            yeep.tones.adsr( extend( {}, base, { delaySec: 0.6, freq: yeep.notes["C4"], sustainSec: 0.8 } ) );
        }
    };

    return ( yeep );

} )( this.yeep = {} );
