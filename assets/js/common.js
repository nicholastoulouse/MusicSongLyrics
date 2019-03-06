// Be sure to open the index.html file locally before trying to open https://nicholastoulouse.github.io/MusicSongLyrics/
// Or the API keys won't be loaded in your browser first.

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}
