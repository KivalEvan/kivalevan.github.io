const input = {
    duration: 0,
    type: {
        mapperStyle: false,
        specificStyle: false,
    },
    difficulty: {
        expertPlus: false,
        expert: false,
        hard: false,
        normal: false,
        easy: false,
    },
    lighting: {
        handcraftNormal: false,
        lolighter: true,
    },
};

const rate = {
    base: 10,
    specific: 5,
    difficulty: {
        expertPlus: 10,
        expert: 8,
        hard: 5,
        normal: 2,
        easy: 0,
    },
    lighting: {
        handcraftNormal: 15,
        lolighter: 0,
    },
};

const regexMMSS = /^\d{1,2}:\d{2}/;

// i dont have elegant solution to this
// and im lazy to figure it out just for this alone
$('#song-length').change(function () {
    if (String(this.value).trim().match(regexMMSS)) {
        let [min, sec] = String(this.value).split(':');
        input.duration = parseInt(min) * 60 + parseInt(sec);
    } else {
        input.duration = Math.abs(parseInt(this.value));
    }
    this.value = toMMSS(input.duration);
    calculateCost();
});

$('#type-mapper').click(function () {
    if (input.type.mapperStyle) {
        $('#type-mapper').prop('checked', true);
    }
    $('#type-specific').prop('checked', false);
    input.type.mapperStyle = true;
    input.type.specificStyle = false;

    $('#difficulty-expert-plus').prop('checked', true);
    input.difficulty.expertPlus = true;
    calculateCost();
});
$('#type-specific').click(function () {
    if (input.type.specificStyle) {
        $('#type-specific').prop('checked', true);
    }
    $('#type-mapper').prop('checked', false);
    input.type.mapperStyle = false;
    input.type.specificStyle = true;
    calculateCost();
});

$('#difficulty-expert-plus').click(diffCheck);
$('#difficulty-expert').click(diffCheck);
$('#difficulty-hard').click(diffCheck);
$('#difficulty-normal').click(diffCheck);
$('#difficulty-easy').click(diffCheck);

$('#lighting-handcraft-normal').click(function () {
    if (input.lighting.handcraftNormal) {
        $('#lighting-handcraft-normal').prop('checked', true);
    }
    $('#lighting-lolighter').prop('checked', false);
    input.lighting.handcraftNormal = true;
    input.lighting.lolighter = false;
    calculateCost();
});
$('#lighting-lolighter').click(function () {
    if (input.lighting.lolighter) {
        $('#lighting-lolighter').prop('checked', true);
    }
    $('#lighting-handcraft-normal').prop('checked', false);
    input.lighting.handcraftNormal = false;
    input.lighting.lolighter = true;
    calculateCost();
});

function diffCheck() {
    input.difficulty[this.value] = this.checked;
    if (this.value === 'expertPlus') {
        if ($('#type-mapper').prop('checked')) {
            $('#type-mapper').prop('checked', false);
            $('#type-specific').prop('checked', true);
            input.type.mapperStyle = false;
            input.type.specificStyle = true;
        }
    }
    calculateCost();
}

function calculateCost() {
    let amt = 0;
    const rateScale = calculateRateScale();
    let multi = false;
    for (const d in input.difficulty) {
        if (input.difficulty[d]) {
            amt +=
                (rate.base +
                    rate.specific * (input.type.specificStyle - multi / 2) +
                    rate.difficulty[d]) *
                rateScale;
            if (input.type.specificStyle) {
                multi = true;
            }
        }
    }
    if (input.lighting.handcraftNormal) {
        amt += (rate.base + rate.lighting.handcraftNormal) * rateScale;
    }
    $('#rate-scale').html(rateScale);
    $('#result-cost').html(`$${amt.toFixed(2)}`);
}
function calculateRateScale() {
    return (
        Math.floor(input.duration / 60) +
        Math.ceil((input.duration % 60) / 30) / 2
    );
}

function toMMSS(num) {
    if (!num) {
        return '0:00';
    }
    let numr = Math.round(num);
    let min = Math.floor(numr / 60);
    let sec = numr % 60;
    return `${min}:${sec > 9 ? sec : `0${sec}`}`;
}
