var lyricsURL, lyricsApi, songName_l, artist_l;

lyricsApi = "apikey=" + "WqDoIeBpeU4ukATNPeujatZc7kLftvkhAsogshZ0CX29WAerDXfeNnI6bjZBuzCP";
// + localStorage.getObject("access")['apiSeeds'];

//lyricsURL = "https://orion.apiseeds.com/api/music/lyric/";

$("#submit").on("click", function(){
    //console.log("here");
    songName_l = $("#songName").val().trim();
    artist_l = $("#artist").val().trim();
    $("#lyrics").empty();
    if(songName_l === "" || artist_l === ""){
        alert("Must enter both song name and artist");
    }
    else{
        lyricsURL="https://orion.apiseeds.com/api/music/lyric/"+artist_l+"/"+songName_l+"?"+lyricsApi;
        console.log(lyricsURL);
        $.ajax({
            url: lyricsURL,
            method: "GET",
            success: function(response){
                console.log(response);
                var result = response.result;
                //console.log(result);
                //console.log(result.track.text);
                var lyrics = result.track.text.replace(/\n/g, "<br>");
                var p = $("<p>").html(lyrics);
                $("#lyrics").append(p);
            },
            error : function(){
                $("#lyrics").text("Lyrics: No Record");
            }
        });
    }
});