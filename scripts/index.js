// if user has JS disabled, then section should always show
// otherwise, hide and only show specific
$('section').hide();
if (location.hash !== null && location.hash !== '') {
    const section = ['#home', '#project', '#commission', '#contact'];
    const index = section.indexOf(location.hash);
    if (index !== -1) {
        $('nav li').find(section[index]).addClass('active');
        $('section' + section[index]).show();
    } else {
        $('nav li a').first().addClass('active');
        $('section').first().show();
    }
} else {
    $('nav li a').first().addClass('active');
    $('section').first().show();
}

$('nav li a').click(function () {
    $(this)
        .addClass('active')
        .parent()
        .siblings('li')
        .children()
        .removeClass('active');
    $('section#' + $(this).attr('id'))
        .show()
        .siblings('section')
        .hide();
});
