$('.map-showcase').empty();
const randomSet = new Set();
for (let j = 4, i; j !== 0; j--) {
    i = Math.floor(Math.random() * mapData.length);
    const initial = i;
    while (randomSet.has(i) || !mapData[i]._tag.includes('showcase')) {
        i = (i + 1) % mapData.length;
        if (initial === i) {
            break;
        }
    }
    randomSet.add(i);
    $('.map-showcase').append(`
    <div class="song-card">
        <img class="cover" alt="${
            mapData[i]._songName
        }" src="./assets/img/cover/${mapData[i]._coverImage}" loading="lazy">
        <div class="metadata">
            <span class="song-name">${mapData[i]._songName}</span>
            <span class="song-subname">${mapData[i]._songSubName}</span><br>
            <span class="song-artist">${mapData[i]._songAuthorName}</span><br>
            <span class="song-bpm">${
                mapData[i]._beatsPerMinute._base
            }BPM</span><br>
            <span class="song-duration">${toMMSS(
                mapData[i]._songDuration
            )}</span><br>
            <span class="map-release"></span><br>
            <div class="map-link">
                <a href="${mapData[i]._link.BeatSaver._url}">${
        mapData[i]._link.BeatSaver._name
    }</a> |
                <a href="${mapData[i]._link.BeastSaber._url}">${
        mapData[i]._link.BeastSaber._name
    }</a>
            </div>
        </div>
    </div>`);
}
