// if user has JS disabled, then section should always show
// otherwise, hide and only show specific
// replace section id with something else to prevent href redirect
// this is because if user has JS enabled, then they shouldnt move anywhere and only replace content

$('section')
    .hide()
    .each(function () {
        $(this).prop('id', `section-${$(this).attr('id')}`);
    });

if (location.hash !== null && location.hash !== '') {
    const section = ['home', 'project', 'commission', 'contact'];
    const index = section.indexOf(location.hash.substring(1));
    if (index !== -1) {
        $('nav li').find(`selector-${section[index]}`).addClass('active');
        $(`section#section-${section[index]}`).show();
        document.title = `Kival Evan | ${
            section[index].charAt(0).toUpperCase() + section[index].slice(1)
        }`;
    } else {
        $('nav li a').first().addClass('active');
        $('section').first().show();
        document.title = 'Kival Evan | Home';
    }
} else {
    $('nav li a').first().addClass('active');
    $('section').first().show();
    document.title = 'Kival Evan | Home';
}

$('nav li a').click(function () {
    $(this)
        .addClass('active')
        .parent()
        .siblings('li')
        .children()
        .removeClass('active');
    $(`section#section-${$(this).attr('id').substring(9)}`)
        .show()
        .siblings('section')
        .hide();
    document.title = `Kival Evan | ${$(this).html()}`;
});
