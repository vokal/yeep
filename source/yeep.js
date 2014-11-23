
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

    yeep.tones = {
        "upDown": function ( options )
        {
            var defaults = {
                oscType: "sine",
                freq: yeep.notes.C4,
                delaySec: 0,
                upSec: 0.05,
                vol: 0.4,
                downSec: 0.5
            };

            var set = extend ( {}, defaults, options );

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
                releaseSec: 0.02
            };

            var set = extend ( {}, defaults, options );

            var osc = audioCtx.createOscillator();
            osc.type = set.oscType;
            var gainNode = audioCtx.createGain();
            osc.connect( gainNode );
            gainNode.connect( audioCtx.destination );
            var now = audioCtx.currentTime;

            osc.frequency.setValueAtTime( set.freq, 0 );

            gainNode.gain.setValueAtTime( 0, 0 );
            gainNode.gain.setValueAtTime( 0.00001, now + set.delaySec );
            gainNode.gain.exponentialRampToValueAtTime( set.attackVol, now + set.delaySec + set.attackSec );
            gainNode.gain.exponentialRampToValueAtTime( set.decayVol, now + set.delaySec + set.attackSec + set.decaySec );
            gainNode.gain.exponentialRampToValueAtTime( set.decayVol, now + set.delaySec + set.attackSec + set.decaySec + set.sustainSec );
            gainNode.gain.exponentialRampToValueAtTime( 0.00001, now + set.delaySec + set.attackSec + set.decaySec + set.sustainSec + set.releaseSec );

            osc.start( 0 );

            setTimeout( function () {
                osc.stop();
                osc = null;
                gainNode = null;
            }, 1000 * ( now + set.delaySec + set.attackSec + set.decaySec + set.sustainSec + set.releaseSec + 0.01 ) );

            return ( osc );
        }
    };

    yeep.tracks = {
        "ping": function ()
        {
            yeep.tones.upDown( { freq: yeep.notes.C4 } );
        },
        "add": function ()
        {
            yeep.tones.upDown( { freq: yeep.notes.C4 } );
            yeep.tones.upDown( { freq: yeep.notes.E4, delaySec: 0.2 } );
        },
        "remove": function ()
        {
            yeep.tones.upDown( { freq: yeep.notes.E4 } );
            yeep.tones.upDown( { freq: yeep.notes.C4, delaySec: 0.2 } );
        },
        "ring": function ()
        {
            for ( var i = 0; i < 2; i++ )
            {
                yeep.tones.upDown( { freq: yeep.notes.C4, delaySec: 0.8 * i } );
                yeep.tones.upDown( { freq: yeep.notes.C4, delaySec: 0.8 * i + 0.3 } );
                yeep.tones.upDown( { freq: yeep.notes.G4, delaySec: 0.8 * i + 0.4 } );
                yeep.tones.upDown( { freq: yeep.notes.E4, delaySec: 0.8 * i + 0.5 } );
            }
        },
        "sadTrombone": function ()
        {
            yeep.tones.adsr( { oscType: "sawtooth", freq: yeep.notes[ "D3" ], delaySec: 0, attackSec: 0.5, sustainSec: 0.5 } );
            yeep.tones.adsr( { oscType: "sawtooth", freq: yeep.notes[ "C#3" ], delaySec: 0.75, attackSec: 0.5, sustainSec: 0.5 } );
            yeep.tones.adsr( { oscType: "sawtooth", freq: yeep.notes[ "C3" ], delaySec: 1.5, attackSec: 0.5, sustainSec: 0.5 } );
            yeep.tones.adsr( { oscType: "sawtooth", freq: yeep.notes[ "B3" ], delaySec: 2.25, attackSec: 0.5, sustainSec: 1.5, releaseSec: 0.5 } );
        },
        "snare": function ( options )
        {
            var osc = yeep.tones.upDown( extend( {}, { oscType: "square", freq: yeep.notes[ "A3" ], upSec: 0.05, downSec: 0.5, vol: 1 }, options ) );
        },
        "kick": function ( options )
        {
            yeep.tones.upDown( extend( {}, { oscType: "sawtooth", freq: yeep.notes[ "A1" ], upSec: 0.05, downSec: 0.6, vol: 1 }, options ) );
        },
        "splash": function ( options )
        {
            var noise = audioCtx.createBrownNoise();
            var noiseGain = audioCtx.createGain();
            var noiseFilter = audioCtx.createBiquadFilter();
            noiseGain.gain.value = 700;
            noiseFilter.frequency.value = 5000;
            noise.connect( noiseFilter );
            noiseFilter.connect( noiseGain );

            var osc = yeep.tones.upDown( extend( {}, { oscType: "sawtooth", freq: yeep.notes[ "A6" ], upSec: 0.05, downSec: 0.8, vol: 1 }, options ) );

            noiseGain.connect( osc.frequency );
        },
        "rimshot": function ()
        {
            yeep.tracks.snare();
            yeep.tracks.kick( { delaySec: 0.15 } );
            yeep.tracks.splash( { delaySec: 0.5 } );
        }
    };

    return ( yeep );

} )( this.yeep = {} );
