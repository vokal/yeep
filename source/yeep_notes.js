
( function ( yeep )
{
    "use strict";

    yeep.notes = ( function ()
    {
        var result = {};
        var notes = [ "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" ];
        var noteIndex = 0;

        for ( var freq = 16.35161; freq < 20000; freq *= Math.pow( 2, 1 / 12 ) )
        {
            result[ notes[ noteIndex % 12 ] + ( Math.floor( noteIndex / 12 ) ) ] = freq;
            noteIndex++;
        }
        return ( result );
    } )();

    return ( yeep.notes );

} )( this.yeep );
