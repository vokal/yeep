
( function ( effects )
{
    "use strict";

    effects.reverb = function ( options )
    {
        var defaults = {
            releaseSec: 3,
            attackVol: 1
        };

        var set = yeep.extend( {}, defaults, options );

        var channels = 2;
        var frameCount = yeep.audioCtx.sampleRate * set.releaseSec;
        var buffer = yeep.audioCtx.createBuffer( 2, frameCount, yeep.audioCtx.sampleRate );

        for ( var channelIndex = 0; channelIndex < channels; channelIndex++ )
        {
           var channel = buffer.getChannelData( channelIndex );
           for ( var i = 0; i < frameCount; i++ )
           {
                var progress = ( frameCount - i ) / frameCount;
                channel[ i ] = Math.pow( progress, 2 ) * ( 2 * Math.random() - 1 );
           }
        }

        var convolver = yeep.audioCtx.createConvolver();
        convolver.normalize = true;
        convolver.buffer = buffer;

        return ( convolver );
    };

    return ( effects );

} )( this.yeep.effects );
