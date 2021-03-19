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

// i dont have elegant solution to this
// and im lazy to figure it out just for this alone
$('#song-length').change(function () {
    input.duration = parseInt(this.value);
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

$('#difficulty-expert-plus').click(function () {
    if ($(this).prop('checked')) {
        input.difficulty.expertPlus = true;
    } else {
        input.difficulty.expertPlus = false;
        if ($('#type-mapper').prop('checked')) {
            $('#type-mapper').prop('checked', false);
            $('#type-specific').prop('checked', true);
            input.type.mapperStyle = false;
            input.type.specificStyle = true;
        }
    }
    calculateCost();
});
$('#difficulty-expert').click(function () {
    if ($(this).prop('checked')) {
        input.difficulty.expert = true;
    } else {
        input.difficulty.expert = false;
    }
    calculateCost();
});
$('#difficulty-hard').click(function () {
    if ($(this).prop('checked')) {
        input.difficulty.hard = true;
    } else {
        input.difficulty.hard = false;
    }
    calculateCost();
});
$('#difficulty-normal').click(function () {
    if ($(this).prop('checked')) {
        input.difficulty.normal = true;
    } else {
        input.difficulty.normal = false;
    }
    calculateCost();
});
$('#difficulty-easy').click(function () {
    if ($(this).prop('checked')) {
        input.difficulty.easy = true;
    } else {
        input.difficulty.easy = false;
    }
    calculateCost();
});

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

function calculateCost() {
    let amt = 0;
    const durScale = calculateRateScale();
    let multi = false;
    for (const d in input.difficulty) {
        if (input.difficulty[d]) {
            amt +=
                (rate.base +
                    rate.specific * (input.type.specificStyle - multi) +
                    rate.difficulty[d]) *
                durScale;
            if (input.type.specificStyle) {
                multi = true;
            }
        }
    }
    if (input.lighting.handcraftNormal) {
        amt += (rate.base + rate.lighting.handcraftNormal) * durScale;
    }
    $('#result-cost').html(`$${amt.toFixed(2)}`);
}
function calculateRateScale() {
    return (
        Math.floor(input.duration / 60) +
        Math.ceil((input.duration % 60) / 30) / 2
    );
}
