// if user has JS disabled, then section should always show
// otherwise, hide and only show specific
// replace section id with something else to prevent href redirect
// this is because if user has JS enabled, then they shouldnt move anywhere and only replace content

$('.discord-popup').click(function () {
    alert('DM me on Discord @Kival Evan#5480');
});

$('footer img').click(function () {
    $(this).prop('src', './assets/img/ohayou-pat.png');
    $('footer span').html('oy');
});

function toMMSS(num) {
    if (!num) {
        return '0:00';
    }
    let numr = Math.round(num);
    let min = Math.floor(numr / 60);
    let sec = numr % 60;
    return `${min}:${sec > 9 ? sec : `0${sec}`}`;
}
