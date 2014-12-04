
( function ( tones )
{
    "use strict";

    tones.ar = function ( options )
    {
        var defaults = {
            oscType: "sine",
            freq: yeep.notes.C4,
            delaySec: 0,
            upSec: 0.05,
            vol: 0.4,
            downSec: 0.5
        };

        var set = yeep.extend( {}, defaults, options );

        set.attackSec = set.upSec;
        set.attackVol = set.vol;
        set.decaySec = 0;
        set.sustainSec = 0;
        set.releaseSec = set.downSec;

        return( tones.adsr( set ) );
    };

    tones.adsr = function ( options )
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

        var set = yeep.extend( {}, defaults, options );

        var osc = yeep.audioCtx.createOscillator();
        osc.frequency.setValueAtTime( set.freq, 0 );
        osc.type = set.oscType;

        var lastNode = osc;
        var gainNode = yeep.envelopes.adsr( set );

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

        lastNode.connect( yeep.audioCtx.destination );

        var now = yeep.audioCtx.currentTime;
        osc.start( now );
        osc.stop( now + set.delaySec + set.attackSec + set.decaySec + set.sustainSec + set.releaseSec );

        return ( lastNode );
    };

    return ( tones );

} )( this.yeep.tones );
