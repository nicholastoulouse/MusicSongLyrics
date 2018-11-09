var lyricsAPI, lyricsURL, youtubeAPI, youtubeURL;

// store current username to variable user in order to search from firebase
var user;

// keep track of the selected playlist name
var currentPlaylist = "";

// information of a searched song will be store in variable currentSong
var currentSong = {
    song_name : "",
    artist_name : "",
    videoURL : "",
    rawLyrics : "",
    thumbnailPicURL : ""
};

lyricsAPI = "apikey=WqDoIeBpeU4ukATNPeujatZc7kLftvkhAsogshZ0CX29WAerDXfeNnI6bjZBuzCP";
youtubeAPI = "key=AIzaSyAkAY0BtGDAhFm0c8vx-0rMGH1-TMoFzkk";

// Initialize Firebase
var config = {
    apiKey: "AIzaSyB1Unrk0m192rEGKu6OgrdYhwW5_NQ7RFc",
    authDomain: "musicapp-a8eb8.firebaseapp.com",
    databaseURL: "https://musicapp-a8eb8.firebaseio.com",
    projectId: "musicapp-a8eb8",
    storageBucket: "musicapp-a8eb8.appspot.com",
    messagingSenderId: "669778316256"
};
firebase.initializeApp(config);

var database = firebase.database();

//IMPORTANT: please edit this portion of code to style html if youtube video not found
//find Youtube video of the song, get the first result and put info to variable currentSong
// getYoutube(STRING, STRING);
function getYoutube(songName, artist){
    youtubeURL="https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q="+artist+"+"+songName+"&type=video&videoDimension=2d&"+youtubeAPI;
    console.log(youtubeURL);
    $.ajax({
        url: youtubeURL,
        method: "GET"
    })
    .then(function(response){
            var result = response.items;
            var mv_id = result[0].id.videoId;
            var src = "https://www.youtube.com/embed/" + mv_id;
            //console.log(src);
            $("#youtube").attr("src", src);
            //to get thumbnail image of this video: 
            //console.log(result[0].snippet.thumbnails.medium.url);
            //result[0].snippet.thumbnails.medium.width;
            //result[0].snippet.thumbnails.medium.height;
            currentSong.videoURL = src;
            currentSong.thumbnailPicURL = result[0].snippet.thumbnails.medium.url;
        }, 
        function(){
            //IMPORTANT: please edit this portion of code to style html if youtube video not found
            $("#youtube").text("Youtube: Not Found");
        }
    );
}

//IMPORTANT: please edit this portion of code to style html if lyrics not found
//find lyrics using both song name and artist name, put info to variable currentSong
//if lyrics not found, show error, initialize currentSong and discontinue searching from Youtube
// getLyrics(STRING, STRING);
function getLyrics(songName, artist){
    lyricsURL="https://orion.apiseeds.com/api/music/lyric/"+artist+"/"+songName+"?"+lyricsAPI;

    $.ajax({
        url: lyricsURL,
        method: "GET"
    })
    .then(function(response){
            getYoutube(songName, artist);

            var result = response.result;
            //console.log(result);
            var lyrics = result.track.text;

            $("#lyrics").html(lyrics);
            currentSong.song_name = result.track.name;
            currentSong.artist_name = result.artist.name;
            currentSong.rawLyrics = lyrics;
        },
        function(){
            //IMPORTANT: please edit this portion of code to style html if lyrics not found
            $("#lyrics").text("Lyrics: No Record");
            currentSong.song_name = "";
            currentSong.artist_name = "";
            currentSong.videoURL = "";
            currentSong.thumbnailPicURL = "";
            currentSong.rawLyrics = "";
        }
    );
}

//initialize user when user enters username
//if user is new, build Favorites playlist skeleton under his username in firebase
//Display all playlists and songs for user
function initializeUser(){
    database.ref("users").once("value").then(function(snapshot){

        if(snapshot.child(user).exists()){
            //do nothing
            console.log("username exists");
        }
        else{
            console.log("created username");
            console.log(user);
            database.ref("users/" + user).set({
                playlists : {
                    Favorites : {
                        name: "Favorites"
                    }
                }
            });   
        }

        initializeSelection();
    });
}

//Turn data from snapshot to array
//From https://ilikekillnerds.com/2017/05/convert-firebase-database-snapshotcollection-array-javascript/
function snapshotToArray(snapshot) {
    var returnArr = [];

    snapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();
        item.key = childSnapshot.key;

        returnArr.push(item);
    });

    return returnArr;
};

//replace .$[]#/ with _
// replaceSpecialCharactors(STRING);
function replaceSpecialCharactors(str){
    return str.replace(/[\.\$\[\]\#\/]/g, "_");
}

//List all exist playlist as option
function initializeSelection(){
    $("#selectPlaylist").empty();
    var empty = $("<option>");
    empty.attr("value", "empty")
        .text("Please select a playlist");

    $("#selectPlaylist").append(empty);
    //var option = $("<option>");
    database.ref("users/" + user + "/playlists/").once("value").then(function(snapshot){
        var data = snapshotToArray(snapshot);

        for(var i = 0; i < data.length; i++){
            var option = $("<option>");
            //console.log(data[i].name);
            option.attr("value", data[i].name).text(data[i].name);
            $("#selectPlaylist").append(option);
        }
        console.log("Upon initialization, playlist names are ", getPlaylistNames());
    });
}

// return playlist names as an array except for Favorites
function getPlaylistNames(){
    var names = [];
    $("#selectPlaylist option").each(function(){
        //console.log($(this).text());
        if ($(this).val() !== "Favorites" && $(this).val() !== "empty"){
            names.push($(this).val());
        }  
    });

    return names;
}


// create song info divs with class name "songinfo" for each song
// display thumbnail picture, song, and artist name of each song of the playlist
// display all of these info under id name "#playlist"
// displayPlayist(STRING)
function displayPlaylist(plname){
    $("#playlist").empty();
    if (plname === "empty"){
        console.log("here");
        return;
    }
    database.ref("users/" + user + "/playlists/" + plname).once("value").then(function(snapshot){
        var data = snapshotToArray(snapshot);
        console.log(data);
        var playlistDiv;
        playlistDiv = $("#playlist");

        if (data.length > 1){
            var songs = data[1];
            var songArr = Object.keys(songs);

            var songinfoDiv, sname, aname, thumbnail, img, info;
            for(var i = 0; i < songArr.length - 1; i++){
                sname = songs[songArr[i]].songName;
                aname = songs[songArr[i]].artist;
                info = $("<p>");
                info.text(aname + " - " + sname);
                thumbnail = songs[songArr[i]].thumbnailPicURL;
                console.log(sname, aname, thumbnail);
                img = $("<img>");
                img.attr("src", thumbnail).attr("width", 320).attr("height", 180);
                songinfoDiv = $("<div>");
                songinfoDiv.attr("class", "songinfo")
                    .attr("onclick", "getLyrics(" + "'" + sname + "','" + aname + "');");
                songinfoDiv.append(img);
                songinfoDiv.append(info);
                playlistDiv.append(songinfoDiv);
            }
        }

    });
}

// add playlist skeleton in database, add the playlist name as an option under selection
// if playlist name exist, do nothing
// addPlaylist(STRING);
function addPlaylist(plname){
    //incase plname include any special charactor that cannot use as key name
    var pname = replaceSpecialCharactors(plname);
    database.ref("users/" + user + "/playlists").once("value").then(function(snapshot){
        if(snapshot.child(pname).exists()){
            console.log("playlist name exists");
        }
        else{
            database.ref("users/" + user + "/playlists/" + pname).set({
                name: plname
            });
            var option = $("<option>");
            option.attr("value", plname).text(plname);
            $("#selectPlaylist").append(option);
        }

    });
}

// delete all info under the playlist
// delete the option from select
// deletePlaylist(STRING);
function deletePlaylist(plname){
    //incase plname include any special charactor that cannot use as key name
    var pname = replaceSpecialCharactors(plname);
    $("#selectPlaylist option[value='" + pname + "']").remove();
    database.ref("users/" + user + "/playlists/" + pname).remove()
        .then(()=>{
            $("#playlist").empty();
            $("#playlist option[value='empty']").attr("selected","selected");

        });
}

// add song info to the playlist
// update the corresponse playlist on html
// addSong(STRING, OBJECT);
function addSong(plname, song){
    //incase plname, sname, aname include any special charactor that cannot use as key name
    var pname = replaceSpecialCharactors(plname);
    var sname = replaceSpecialCharactors(song.song_name);
    var aname = replaceSpecialCharactors(song.artist_name);
    //console.log(sname, aname);

    database.ref("users/" + user + "/playlists/" + pname + "/songs/" + aname + sname).set({
        songName: song.song_name,
        artist: song.artist_name,
        videoURL: song.videoURL,
        rawLyrics:  song.rawLyrics,
        thumbnailPicURL: song.thumbnailPicURL
    }).then(() => {
        displayPlaylist(plname);
    });


}

//delete song info from the playlist
// update the corresponse playlist on html
// deleteSong(STRING, OBJECT);
function deleteSong(plname, song){
    //incase plname, sname, aname include any special charactor that cannot use as key name
    var pname = replaceSpecialCharactors(plname);
    var sname = replaceSpecialCharactors(song.song_name);
    var aname = replaceSpecialCharactors(song.artist_name);

    database.ref("users/" + user + "/playlists/" + pname + "/songs/" + aname + sname).remove()
        .then(() =>{
            displayPlaylist(plname);
        });
}

//triggered when user selects a playlist
$("#selectPlaylist").change(function(){
    displayPlaylist($(this).val());
    if($(this).val() !== "empty"){
        currentPlaylist = $(this).val();
    }
    else{
        currentPlaylist = "";
        console.log("Please selecte a playlist");
    }
});

// var lyricsAPI, lyricsURL, youtubeAPI, youtubeURL;

// // store current username to variable user in order to search from firebase
// var user;

// // information of a searched song will be store in variable currentSong
// var currentSong = {
//     song_name : "",
//     artist_name : "",
//     videoURL : "",
//     rawLyrics : "",
//     thumbnailPicURL : ""
// };

// lyricsAPI = "apikey=WqDoIeBpeU4ukATNPeujatZc7kLftvkhAsogshZ0CX29WAerDXfeNnI6bjZBuzCP";
// youtubeAPI = "key=AIzaSyAkAY0BtGDAhFm0c8vx-0rMGH1-TMoFzkk";

// // Initialize Firebase
// var config = {
//     apiKey: "AIzaSyB1Unrk0m192rEGKu6OgrdYhwW5_NQ7RFc",
//     authDomain: "musicapp-a8eb8.firebaseapp.com",
//     databaseURL: "https://musicapp-a8eb8.firebaseio.com",
//     projectId: "musicapp-a8eb8",
//     storageBucket: "musicapp-a8eb8.appspot.com",
//     messagingSenderId: "669778316256"
// };
// firebase.initializeApp(config);

// var database = firebase.database();

// //IMPORTANT: please edit this portion of code to style html if youtube video not found
// //find Youtube video of the song, get the first result and put info to variable currentSong
// // getYoutube(STRING, STRING);
// function getYoutube(songName, artist){
//     youtubeURL="https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q="+artist+"+"+songName+"&type=video&videoDimension=2d&"+youtubeAPI;
//     console.log(youtubeURL);
//     $.ajax({
//         url: youtubeURL,
//         method: "GET"
//     })
//     .then(function(response){
//             var result = response.items;
//             var mv_id = result[0].id.videoId;
//             var src = "https://www.youtube.com/embed/" + mv_id;
//             //console.log(src);
//             $("#youtube").attr("src", src);
//             //to get thumbnail image of this video: 
//             //console.log(result[0].snippet.thumbnails.medium.url);
//             //result[0].snippet.thumbnails.medium.width;
//             //result[0].snippet.thumbnails.medium.height;
//             currentSong.videoURL = src;
//             currentSong.thumbnailPicURL = result[0].snippet.thumbnails.medium.url;
//         }, 
//         function(){
//             //IMPORTANT: please edit this portion of code to style html if youtube video not found
//             $("#youtube").text("Youtube: Not Found");
//         }
//     );
// }

// //IMPORTANT: please edit this portion of code to style html if lyrics not found
// //find lyrics using both song name and artist name, put info to variable currentSong
// //if lyrics not found, show error, initialize currentSong and discontinue searching from Youtube
// // getLyrics(STRING, STRING);
// function getLyrics(songName, artist){
//     lyricsURL="https://orion.apiseeds.com/api/music/lyric/"+artist+"/"+songName+"?"+lyricsAPI;

//     $.ajax({
//         url: lyricsURL,
//         method: "GET"
//     })
//     .then(function(response){
//             getYoutube(songName, artist);

//             var result = response.result;
//             //console.log(result);
//             var lyrics = result.track.text; // .replace(/\n/g, "<br>");
//             //console.log(lyrics);
//             // var p = $("<p>").html(lyrics);
//             // $("#lyrics").append(p);
//             $("#lyrics").html(lyrics);
//             currentSong.song_name = result.track.name;
//             currentSong.artist_name = result.artist.name;
//             currentSong.rawLyrics = lyrics;
//         },
//         function(){
//             //IMPORTANT: please edit this portion of code to style html if lyrics not found
//             $("#lyrics").text("Lyrics: No Record");
//             currentSong.song_name = "";
//             currentSong.artist_name = "";
//             currentSong.videoURL = "";
//             currentSong.thumbnailPicURL = "";
//             currentSong.rawLyrics = "";
//         }
//     );
// }

// //initialize user when user enters username
// //if user is new, build Favorites playlist skeleton under his username in firebase
// //Display all playlists and songs for user
// function initializeUser(){
//     database.ref("users").once("value").then(function(snapshot){
//         if(snapshot.child(user).exists()){
//             //do nothing
//             console.log("username exists");
//         }
//         else{
//             console.log("created username");
//             console.log(user);
//             database.ref("users/" + user).set({
//                 playlists : {
//                     Favorites : {
//                         name: "Favorites"
//                     }
//                 }
//             });   
//         }

//         //print corresponding playlists for return or new user
//         displayAllPlaylists();
//     });
// }

// //Turn data from snapshot to array
// //From https://ilikekillnerds.com/2017/05/convert-firebase-database-snapshotcollection-array-javascript/
// function snapshotToArray(snapshot) {
//     var returnArr = [];

//     snapshot.forEach(function(childSnapshot) {
//         var item = childSnapshot.val();
//         item.key = childSnapshot.key;

//         returnArr.push(item);
//     });

//     return returnArr;
// };

// //replace .$[]#/ with _
// // replaceSpecialCharactors(STRING);
// function replaceSpecialCharactors(str){
//     return str.replace(/[\.\$\[\]\#\/]/g, "_");
// }

// // create div with id name for the playlists and divs for each song info
// // display thumbnail picture, song, and artist name of each song of the playlist
// // DO NOT USE THIS FUNCTION FOR UPDATING PLAYLIST CHANGES, SEE function displayAllPlaylists() for details
// // displayPlaylist(OBJECT, STRING)
// function displayPlaylist(playlistInfo, playlistTitle){
//     $("#"+playlistTitle).remove(); 
//     console.log(playlistInfo);
//     var playlistDiv, plTitle;

//     plTitle = $("<h3>");
//     plTitle.text(playlistTitle);
//     playlistDiv = $("<div>");
//     playlistDiv.attr("id", playlistTitle);
//     playlistDiv.append(plTitle);

//     if(playlistInfo.songs === undefined){
//         $("#playlists").append(playlistDiv);
//         console.log(playlistTitle + " is an empty playlist");
//         return;
//     }

//     var songArr = Object.keys(playlistInfo.songs);
//     var songinfoDiv, sname, aname, thumbnail, img, info;
    
//     for(var i = 0; i < songArr.length; i++){
//         sname = playlistInfo.songs[songArr[i]].songName;
//         aname = playlistInfo.songs[songArr[i]].artist;
//         info = $("<p>");
//         info.text(aname + " - " + sname);
//         thumbnail = playlistInfo.songs[songArr[i]].thumbnailPicURL;
//         //console.log(sname, aname, thumbnail);
//         img = $("<img>");
//         img.attr("src", thumbnail).attr("width", 320).attr("height", 180);
//         songinfoDiv = $("<div>");
//         songinfoDiv.append(img);
//         songinfoDiv.append(info);
//         playlistDiv.append(songinfoDiv);
//     }

//     $("#playlists").append(playlistDiv);
// }

// //display all playlists for a user
// //HIGHLIGHT: any changes to playlists: add/delete a playlist, add/delete a song from a playlist will trigger this function
// function displayAllPlaylists(returnLists){ // either true or undefined
//     var playlistArr = [];
//     database.ref("users/" + user + "/playlists/").once("value").then(function(snapshot){
//         var data = snapshotToArray(snapshot);
//         //console.log(data[0].name);
//         //displayPlaylist(data[0]);
//         for(var i = 0; i < data.length; i++){
//             if (returnLists === true) {
//                 playlistArr.push(data[i].name);
//             } else {
//                 displayPlaylist(data[i], data[i].name);
//             }
//         }
//     });
//     return playlistArr;
// }

// // add playlist skeleton in database, if playlist name exist, do nothing
// // addPlaylist(STRING);
// function addPlaylist(plname){
//     //incase plname include any special charactor that cannot use as key name
//     var pname = replaceSpecialCharactors(plname);
//     database.ref("users/" + user + "/playlists").once("value").then(function(snapshot){
//         if(snapshot.child(pname).exists()){
//             console.log("playlist name exists");
//         }
//         else{
//             database.ref("users/" + user + "/playlists/" + pname).set({
//                 name: plname
//             });
//         }

//         displayAllPlaylists();
//     });
// }

// // delete all info under the playlist
// // deletePlaylist(STRING);
// function deletePlaylist(plname){
//     //incase plname include any special charactor that cannot use as key name
//     var pname = replaceSpecialCharactors(plname);
//     database.ref("users/" + user + "/playlists/" + pname).remove();

//     displayAllPlaylists();
// }

// //add song info to the playlist
// // addSong(STRING, OBJECT);
// function addSong(plname, song){
//     //incase plname, sname, aname include any special charactor that cannot use as key name
//     var pname = replaceSpecialCharactors(plname);
//     var sname = replaceSpecialCharactors(song.song_name);
//     var aname = replaceSpecialCharactors(song.artist_name);
//     console.log(sname, aname);

//     database.ref("users/" + user + "/playlists/" + pname + "/songs/" + aname + sname).set({
//         songName: song.song_name,
//         artist: song.artist_name,
//         videoURL: song.videoURL,
//         rawLyrics:  song.rawLyrics,
//         thumbnailPicURL: song.thumbnailPicURL
//     }).then(() => {
//         displayAllPlaylists();
//     });


// }

// //delete song info from the playlist
// // deleteSong(STRING, OBJECT);
// function deleteSong(plname, song){
//     //incase plname, sname, aname include any special charactor that cannot use as key name
//     var pname = replaceSpecialCharactors(plname);
//     var sname = replaceSpecialCharactors(song.song_name);
//     var aname = replaceSpecialCharactors(song.artist_name);

//     database.ref("users/" + user + "/playlists/" + pname + "/songs/" + aname + sname).remove();

//     displayAllPlaylists();
// }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////for testing code only////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
$("#addUserName").on("click", function(){
    //console.log("here");
    user = $("#username").val().trim(); 
    initializeUser();
});

// $("#addNewPlaylist").on("click", function(){
//     var plname = $("#playlistName").val().trim();
//     // database.ref("users/" + user + "/playlists/" + plname).set({});
// });

$("#addSong").on("click", function(){
    addSong("favorites", currentSong);
});

$("#deleteSong").on("click", function(){
    deleteSong("favorites", currentSong);
});

$("#submit").on("click", function(){
    var songName = $("#songName").val().trim();
    var artist = $("#artist").val().trim();

    $("#youtube").empty();
    $("#lyrics").empty();
    
    if(songName === "" || artist === ""){
        console.log("Must enter both song name and artist");
    }
    else{
        getLyrics(songName, artist);
    }
});

*/
