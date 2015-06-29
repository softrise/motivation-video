(function (init) {
    if (typeof define !== 'undefined' && define.amd) {
        define(['notification'], init);
    }
    else {
        init(window.notifications);
    }
})(function (notifications) {

    $(document).ready(function () {
        showStudyBanner();
        navOverride();

        $('.ios-scrollable').on('touchstart', function (e) {});

        loginPopupBlur();
        loginPopupOpen();

        submitMiniForms();

        triggerTooltips();

        initSeeMoreSeeLessToggle();

        //prevent default when flag exists
        $('[data-preventDefault="true"]').on('click', function (e) {e.preventDefault();});

        // initialize tabs to accordion plugin bootstrap-tabcollapse.js
        $('.vertSubTabs').tabCollapse({
            tabsClass: 'visible',
            accordionClass: ''
        });

        socialButtons();
        dropdownAccordion();
        initPlaceholderSwap();

        remilonNotification();

        /*
         * create a cookie:
         * http://ecucation-portal.com/?SSOE=factor-variation

         * delete a cookie:
         * http://ecucation-portal.com/?SSOE=del
         */

        if (location.search) {
            var str = location.search.substring(1);
            var res = str.split("=");

            if (res[0] === "SSOE") {
                if (res[1] != 'del') {
                    $.cookie('SSOE', str, {path: '/'});
                }
                else {
                    $.cookie("SSOE", null, {expires: -1});
                }
            }
        }

        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })

    });

    function showStudyBanner() {
        //set cookie when visiting site
        //expire with session
        //show banner only if cookie hasnt been set
        $.cookie('hasSeen', 'true')
    }

    function initSeeMoreSeeLessToggle() {
        /*shows more [anything] if clicked*/
        $('.seeMore').click(function () {
            $(this).parent().children('.displayNone').toggle();

            if ($(window).width() < 481) {
                $(this).parent().children('.displayDesktop').toggle();
            }
            else {
                $(this).parent().children('.displayDesktop').show();
            }


            var showMoreToggleText = $(this).html();

            if (showMoreToggleText.match(/more/i) != null) {
                $(this).html($(this).html().replace('more', 'less'));
            }
            else {
                $(this).html($(this).html().replace('less', 'more'));
            }
        });
    }

//this is the form used on the research side
    function submitMiniForms() {
        // Needs to be a delegate in order to support ajax search results!
        $('body').on('change', '.miniformSelect', function () {
            $(this).closest('.miniform').submit();
        });
    }


//bootstrap tooltips have to be initialized with js
    function triggerTooltips() {
        $('#fullSchoolDisclaimer, #sidebarDisclaimer').tooltip();

        $('body').on('click', function (e) {
            $('[data-toggle="tooltip"]').each(function () {
                //the 'is' for buttons that trigger popups
                //the 'has' for icons within a button that triggers a popup
                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.tooltip').has(e.target).length === 0) {
                    $(this).tooltip('hide');
                }
            });
        });
    }


    function navOverride() {
        //hack: this fixes the nav on the homepage on ios??????? dont delete
        $('.newNavContainer .collapseHeader').on('click touch', function () {});

        $('.mNav').on('click', function () {
            $(this).parent().toggleClass('open')
        });

        $(window).on('resize', function () {
            if ($(window).width() > 768) {
                $('.newNavContainer .dropdown').removeClass('open')
            }
        });
    }

    function socialButtons() {
        // social / rate popovers
        $('[share-popover]').popover({
            html: true,
            trigger: 'click focus',
            content: function () {return $("#shareContent").html();}
        });

        $('[rate-popover]').popover({
            html: true,
            trigger: 'click focus',
            content: function () {return $("#popoverRateContent").html();}
        });

        var $body = $('body');

        // Set up thumb buttons
        $body.on('click', '[data-thumb-rate]:not(.selected)', function () {
            if (!$(this).hasClass('selected')) {
                var thumb = $(this);
                var data = {};
                /*we arent passing any questions / answers / comments for v1*/
                data['smoLocation'] = thumb.data('thumb-rate');
                data['at'] = document.location.href;

                $.ajax({
                    type: "POST",
                    url: '/social/dislikeFeedback.process',
                    data: data,
                    dataType: 'html',
                    success: function (data) {
                        // Update the current popover and template as well
                        $('[data-thumb-rate]').removeClass('selected');
                        $('[data-thumb-rate="' + thumb.data('thumb-rate') + '"]').addClass('selected');
                        //todo: give feedback after success
                        console.log(data)
                    }
                });
            }
        });

        // Dismiss the popovers
        $body.on('click', function (e) {
            //only buttons
            if ($(e.target).data('toggle') !== 'popover' && $(e.target).parents('.popover.in').length === 0) {
                $('[data-toggle="popover"]').popover('hide');
            }
        });
    }

    function dropdownAccordion() {
        // Prevent dropdown to be closed when we click on an accordion link
        $('.dropdown-accordion').on('click', 'a[data-toggle="collapse"]', function (event) {
            event.preventDefault();
            event.stopPropagation();
            $($(this).data('parent')).find('.panel-collapse.in').collapse('hide');
            $($(this).attr('href')).collapse('show');
        })
    }

    /*
     * buffalo: todo: sucky code for login popup that hasnt been bootstrapified yet
     * we can make this all work / look better in boot strap without this extra garbage.
     * when we do just delete all of this and make it a bootstrap modal
     * */
    function loginPopupBlur() {
        var popup = $('.memberLogin');

        $('body').click(function (e) {
            var loginTrigger = $(e.target).data('trigger');

            if ($(e.target).closest('.memberLogin').length <= 0 && loginTrigger != 'loginPopup') {
                popup.hide();
            }
        });

        $(document).keyup(function (e) {
            if (e.keyCode == 27) {
                popup.hide();
            }
        });

        $('.betaClose').click(function () {
            popup.hide();
        });
    }

    function loginPopupOpen() {
        $('[data-trigger="loginPopup"]').on('click', function (e) {
            $('.memberLogin').fadeIn();
        });
    }

    function initPlaceholderSwap() {
        // Set up data attribute
        $('[placeholder]').each(function () {
            var $elem = $(this);
            $elem.attr('data-placeholder', $elem.attr('placeholder'));
        });

        // Just swapping didn't work if the javascript loaded after user focuses in on the search
        // Clear placeholder on focusin
        $('[placeholder]').on('focusin', function () {
            $(this).attr('placeholder', '');
        });
        // Replace placeholder on focusout
        $('[placeholder]').on('focusout', function () {
            $(this).attr('placeholder', $(this).attr('data-placeholder'));
        });
    }

    function remilonNotification() {
        $('[data-notify-error]').on('click', function (e) {
            notifications.error($(this).attr('data-notify-error'));
        });
    }
});