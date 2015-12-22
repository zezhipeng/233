/**
 * Created by zezhi on 2015/11/25.
 */
"use strict";
function player(containerId,playerId){
    var container = document.getElementById(containerId);
    var player = document.getElementById(playerId);
    var playerFn={
        playOrPause:function(){
           if(player.paused){
               player.play();
               $("#playOrPause").removeClass("fa-play").addClass("fa-pause");
                $("#playOrPauseLg").removeClass("fa-play-circle")
           }
            else{
               player.pause();
               $("#playOrPause").removeClass("fa-pause").addClass("fa-play");
               $("#playOrPauseLg").addClass("fa-play-circle")
           }
        },
        vol:function(){
            var _vol =ex1.getValue();
            player.volume=_vol;
            if(_vol===0){
                $("#volume").removeClass("fa-volume-up");
                $("#volume").addClass("fa-volume-off")
            }
            else{
                $("#volume").removeClass("fa-volume-off");
                $("#volume").addClass("fa-volume-up")
            }
        },
        fullScreenOrExit:function(){
            if(!$.AMUI.fullscreen.isFullscreen){
                if ($.AMUI.fullscreen.enabled) {
                    $.AMUI.fullscreen.request(container);
                    $("#controls").css({"z-index": "21474836472"});
                    $("#fullScreenOrExit").removeClass("fa-expand").addClass("fa-compress")

                }
            }
            else{
                $.AMUI.fullscreen.exit(container);

                $("#controls").css({"z-index": "21474836472"});
                $("#fullScreenOrExit").removeClass("fa-compress").addClass("fa-expand")
            }

        }
    };
    $("#playOrPause").on("click",function(){
        playerFn.playOrPause()
     });
    $("#playOrPauseLg").on("click",function(){
        playerFn.playOrPause()
    });
    $("#video").on("click",function(){
        playerFn.playOrPause()
    });
    var ex1 = $('#ex1').slider()
        .on('slide', playerFn.vol)
        .data('slider');
    $("#fullScreenOrExit").on("click",function(){
        playerFn.fullScreenOrExit()
    });
    $("#exitFullScreen").on("click",function(){
        playerFn.exitFullScreen()
    });
    //$(".play").css({
    //                 "left":$("#"+containerId).width()/2-44+"px"})

}
