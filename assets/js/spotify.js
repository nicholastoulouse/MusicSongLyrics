// window.onSpotifyWebPlaybackSDKReady = () => {
// //     // You can now initialize Spotify.Player and use the SDK

//     const play = ({
//         spotify_uri,
//         playerInstance: {
//             _options: {
//             getOAuthToken,
//             id
//             }
//         }
//     }) => {
//         getOAuthToken(access_token => {
//             fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
//                 method: 'PUT',
//                 body: JSON.stringify({ uris: [spotify_uri] }),
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${access_token}`
//                 },
//             });
//         });
//     };
      
//     play({
//         playerInstance: new Spotify.Player({ name: "..." }),
//         spotify_uri: 'spotify:track:7xGfFoTpQ2E7fRF5lN10tr',
//     });

// };
// var songName = "someone+like+you";
// var api = "547478c12c0741338e5049d6abb2a84e";
// var queryURL = "https://api.spotify.com/v1/search?q="+songName+"&type=track&api="+api;

var url = "https://api.spotify.com/v1/audio-analysis/6EJiVf7U0p1BBfs0qqeb1f";
var auth = localStorage.getObject("access")['spotify'];

fetch(url, {
  method: "GET",
  headers: {
    Authorization: `${auth}`     
  }
})
.then(response => response.json())
.then(response => {
	console.log(response);
})
.catch(function(error) { console.log(error); });

// .then(({beats})) => {
// //   beats.forEach((beat, index) => {
// //     console.log(`Beat ${index} starts at ${beat.start}`);
// //   })
//     console.log(response);
// }
