
( function ( envelopes )
{
    "use strict";

    envelopes.ar = function ( options )
    {
        var defaults = {
            delaySec: 0,
            attackSec: 0.05,
            attackVol: 1,
            releaseSec: 0.02
        };

        var set = yeep.extend( {}, defaults, options );

        var now = yeep.audioCtx.currentTime;

        var gainNode = yeep.audioCtx.createGain();
        gainNode.gain.setValueAtTime( 0, 0 );
        gainNode.gain.setValueAtTime( 0.00001, now + set.delaySec );
        gainNode.gain.exponentialRampToValueAtTime( set.attackVol, now + set.delaySec + set.attackSec );
        gainNode.gain.exponentialRampToValueAtTime( 0.00001, now + set.delaySec + set.attackSec + set.releaseSec );

        return ( gainNode );
    };

    envelopes.adsr = function ( options )
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

        var set = yeep.extend( {}, defaults, options );

        var now = yeep.audioCtx.currentTime;

        var gainNode = yeep.audioCtx.createGain();
        gainNode.gain.setValueAtTime( 0, 0 );
        gainNode.gain.setValueAtTime( 0.00001, now + set.delaySec );
        gainNode.gain.exponentialRampToValueAtTime( set.attackVol, now + set.delaySec + set.attackSec );
        gainNode.gain.exponentialRampToValueAtTime( set.decayVol, now + set.delaySec + set.attackSec + set.decaySec );
        gainNode.gain.exponentialRampToValueAtTime( set.decayVol, now + set.delaySec + set.attackSec + set.decaySec + set.sustainSec );
        gainNode.gain.exponentialRampToValueAtTime( 0.00001, now + set.delaySec + set.attackSec + set.decaySec + set.sustainSec + set.releaseSec );

        return ( gainNode );
    }

    return ( envelopes );

} )( this.yeep.envelopes );
