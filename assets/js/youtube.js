var youtubeURL, youtubeApi, songName_y, artist_y;

api = "key=" + localStorage.getObject("access")['youtube'];

$("#submit").on("click", function(){
    //console.log("here");
    songName_y = $("#songName").val().trim();
    artist_y = $("#artist").val().trim();
    console.log(songName_y, artist_y);
    $("#youtube").empty();
    if(songName_y === "" || artist_y === ""){
        alert("Must enter both song name and artist");
    }
    else{
        queryURL="https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q="+artist_y+"+"+songName_y+"&type=video&videoDimension=2d&"+api;
        console.log(queryURL);
        $.ajax({
            url: queryURL,
            method: "GET",
            success: function(response){
                console.log(response);
                var result = response.items;
                var mv_id = result[0].id.videoId;
                var src = "https://www.youtube.com/embed/" + mv_id;
                //console.log(mv_id);
                $("#youtube").attr("src", src);

                //to get thumbnail image of this video: 
                //result[0].snippet.thumbnails.medium.url;
                //result[0].snippet.thumbnails.medium.width;
                //result[0].snippet.thumbnails.medium.height;
            },
            error : function(){
                $("#youtube").text("Youtube: Not Found");
            }
        });
    }
});