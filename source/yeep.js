
( function ( yeep )
{
    "use strict";

    var defaults = {
        logging: true
    };

    var settings = {};

    yeep.tracks = {};
    yeep.envelopes = {};
    yeep.tones = {};
    yeep.notes = {};
    yeep.effects = {};

    yeep.log = function ()
    {
        if ( settings.logging )
        {
            console.log.apply( console, arguments );
        }
    };

    yeep.extend = function ( target )
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

    yeep.play = function ( soundName, options )
    {
        //TODO: add options for repeats and what-not
        yeep.tracks[ soundName ]();
    };

    yeep.audioCtx = new ( window.AudioContext || window.webkitAudioContext )();

    return ( yeep );

} )( this.yeep = {} );
