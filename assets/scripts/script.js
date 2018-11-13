(function($) {

    var isBuilder = $('html').hasClass('is-builder');

    $.extend($.easing, {
        easeInOutCubic: function(x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        }
    });

    $.fn.outerFind = function(selector) {
        return this.find(selector).addBack(selector);
    };

    $.fn.footerReveal = function() {
        var $this = $(this);
        var $prev = $this.prev();
        var $win = $(window);

        function initReveal() {
            if ($this.outerHeight() <= $win.outerHeight()) {
                $this.css({
                    'z-index': -999,
                    position: 'fixed',
                    bottom: 0
                });

                $this.css({
                    'width': $prev.outerWidth()
                });

                $prev.css({
                    'margin-bottom': $this.outerHeight()
                });
            } else {
                $this.css({
                    'z-index': '',
                    position: '',
                    bottom: ''
                });

                $this.css({
                    'width': ''
                });

                $prev.css({
                    'margin-bottom': ''
                });
            }
        }

        initReveal();

        $win.on('load resize', function() {
            initReveal();
        });

        return this;
    };

    (function($, sr) {
        // debouncing function from John Hann
        // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
        var debounce = function(func, threshold, execAsap) {
            var timeout;

            return function debounced() {
                var obj = this,
                    args = arguments;

                function delayed() {
                    if (!execAsap) func.apply(obj, args);
                    timeout = null;
                }

                if (timeout) clearTimeout(timeout);
                else if (execAsap) func.apply(obj, args);

                timeout = setTimeout(delayed, threshold || 100);
            };
        };
        // smartresize
        jQuery.fn[sr] = function(fn) {
            return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr);
        };

    })(jQuery, 'smartresize');

    (function() {

        var scrollbarWidth = 0,
            originalMargin, touchHandler = function(event) {
                event.preventDefault();
            };

        function getScrollbarWidth() {
            if (scrollbarWidth) return scrollbarWidth;
            var scrollDiv = document.createElement('div');
            $.each({
                top: '-9999px',
                width: '50px',
                height: '50px',
                overflow: 'scroll',
                position: 'absolute'
            }, function(property, value) {
                scrollDiv.style[property] = value;
            });
            $('body').append(scrollDiv);
            scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
            $('body')[0].removeChild(scrollDiv);
            return scrollbarWidth;
        }

    })();

    $.isMobile = function(type) {
        var reg = [];
        var any = {
            blackberry: 'BlackBerry',
            android: 'Android',
            windows: 'IEMobile',
            opera: 'Opera Mini',
            ios: 'iPhone|iPad|iPod'
        };
        type = 'undefined' == $.type(type) ? '*' : type.toLowerCase();
        if ('*' == type) reg = $.map(any, function(v) {
            return v;
        });
        else if (type in any) reg.push(any[type]);
        return !!(reg.length && navigator.userAgent.match(new RegExp(reg.join('|'), 'i')));
    };

    var isSupportViewportUnits = (function() {
        // modernizr implementation
        var $elem = $('<div style="height: 50vh; position: absolute; top: -1000px; left: -1000px;">').appendTo('body');
        var elem = $elem[0];
        var height = parseInt(window.innerHeight / 2, 10);
        var compStyle = parseInt((window.getComputedStyle ? getComputedStyle(elem, null) : elem.currentStyle)['height'], 10);
        $elem.remove();
        return compStyle == height;
    }());

    $(function() {

        $('html').addClass($.isMobile() ? 'mobile' : 'desktop');

        // .mbr-navbar--sticky
        $(window).scroll(function() {
            $('.mbr-navbar--sticky').each(function() {
                var method = $(window).scrollTop() > 10 ? 'addClass' : 'removeClass';
                $(this)[method]('mbr-navbar--stuck')
                    .not('.mbr-navbar--open')[method]('mbr-navbar--short');
            });
        });

        if ($.isMobile() && navigator.userAgent.match(/Chrome/i)) { // simple fix for Chrome's scrolling
            (function(width, height) {
                var deviceSize = [width, width];
                deviceSize[height > width ? 0 : 1] = height;
                $(window).smartresize(function() {
                    var windowHeight = $(window).height();
                    if ($.inArray(windowHeight, deviceSize) < 0)
                        windowHeight = deviceSize[$(window).width() > windowHeight ? 1 : 0];
                    $('.mbr-section--full-height').css('height', windowHeight + 'px');
                });
            })($(window).width(), $(window).height());
        } else if (!isSupportViewportUnits) { // fallback for .mbr-section--full-height
            $(window).smartresize(function() {
                $('.mbr-section--full-height').css('height', $(window).height() + 'px');
            });
            $(document).on('add.cards', function(event) {
                if ($('html').hasClass('mbr-site-loaded') && $(event.target).outerFind('.mbr-section--full-height').length)
                    $(window).resize();
            });
        }

        // .mbr-section--16by9 (16 by 9 blocks autoheight)
        function calculate16by9() {
            $(this).css('height', $(this).parent().width() * 9 / 16);
        }
        $(window).smartresize(function() {
            $('.mbr-section--16by9').each(calculate16by9);
        });
        $(document).on('add.cards changeParameter.cards', function(event) {
            var enabled = $(event.target).outerFind('.mbr-section--16by9');
            if (enabled.length) {
                enabled
                    .attr('data-16by9', 'true')
                    .each(calculate16by9);
            } else {
                $(event.target).outerFind('[data-16by9]')
                    .css('height', '')
                    .removeAttr('data-16by9');
            }
        });

        // .mbr-parallax-background
        function initParallax(card) {
            setTimeout(function() {
                $(card).outerFind('.mbr-parallax-background')
                    .jarallax({
                        speed: 0.6
                    })
                    .css('position', 'relative');
            }, 0);
        }

        function destroyParallax(card) {
            $(card).jarallax('destroy').css('position', '');
        }

        if ($.fn.jarallax && !$.isMobile()) {
            $(window).on('update.parallax', function(event) {
                setTimeout(function() {
                    var $jarallax = $('.mbr-parallax-background');

                    $jarallax.jarallax('coverImage');
                    $jarallax.jarallax('clipContainer');
                    $jarallax.jarallax('onScroll');
                }, 0);
            });

            if (isBuilder) {
                $(document).on('add.cards', function(event) {
                    initParallax(event.target);
                    $(window).trigger('update.parallax');
                });

                $(document).on('changeParameter.cards', function(event, paramName, value, key) {
                    if (paramName === 'bg') {
                        destroyParallax(event.target);

                        switch (key) {
                            case 'type':
                                if (value.parallax === true) {
                                    initParallax(event.target);
                                }
                                break;
                            case 'value':
                                if (value.type === 'image' && value.parallax === true) {
                                    initParallax(event.target);
                                }
                                break;
                            case 'parallax':
                                if (value.parallax === true) {
                                    initParallax(event.target);
                                }
                        }
                    }

                    $(window).trigger('update.parallax');
                });
            } else {
                initParallax(document.body);
            }

            // for Tabs
            $(window).on('shown.bs.tab', function(e) {
                $(window).trigger('update.parallax');
            });
        }

        // .mbr-fixed-top
        var fixedTopTimeout, scrollTimeout, prevScrollTop = 0,
            fixedTop = null,
            isDesktop = !$.isMobile();
        $(window).scroll(function() {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            var scrollTop = $(window).scrollTop();
            var scrollUp = scrollTop <= prevScrollTop || isDesktop;
            prevScrollTop = scrollTop;
            if (fixedTop) {
                var fixed = scrollTop > fixedTop.breakPoint;
                if (scrollUp) {
                    if (fixed != fixedTop.fixed) {
                        if (isDesktop) {
                            fixedTop.fixed = fixed;
                            $(fixedTop.elm).toggleClass('is-fixed');
                        } else {
                            scrollTimeout = setTimeout(function() {
                                fixedTop.fixed = fixed;
                                $(fixedTop.elm).toggleClass('is-fixed');
                            }, 40);
                        }
                    }
                } else {
                    fixedTop.fixed = false;
                    $(fixedTop.elm).removeClass('is-fixed');
                }
            }
        });
        $(document).on('add.cards delete.cards', function(event) {
            if (fixedTopTimeout) clearTimeout(fixedTopTimeout);
            fixedTopTimeout = setTimeout(function() {
                if (fixedTop) {
                    fixedTop.fixed = false;
                    $(fixedTop.elm).removeClass('is-fixed');
                }
                $('.mbr-fixed-top:first').each(function() {
                    fixedTop = {
                        breakPoint: $(this).offset().top + $(this).height() * 3,
                        fixed: false,
                        elm: this
                    };


                    $(window).scroll();
                });
            }, 650);
        });

    // init
        if (!isBuilder) {
            $('body > *:not(style, script)').trigger('add.cards');
        }
        $('html').addClass('mbr-site-loaded');
        $(window).resize().scroll();

        // smooth scroll
        if (!isBuilder) {
            $(document).click(function(e) {
                try {
                    var target = e.target;

                    if ($(target).parents().hasClass('carousel')) {
                        return;
                    }
                    do {
                        if (target.hash) {
                            var useBody = /#bottom|#top/g.test(target.hash);
                            $(useBody ? 'body' : target.hash).each(function() {
                                e.preventDefault();
                                // in css sticky navbar has height 64px
                                var stickyMenuHeight = $('.mbr-navbar--sticky').length ? 64 : 0;
                                var goTo = target.hash == '#bottom' ? ($(this).height() - $(window).height()) : ($(this).offset().top - stickyMenuHeight);
                                // Disable Accordion's and Tab's scroll
                                if ($(this).hasClass('panel-collapse') || $(this).hasClass('tab-pane')) {
                                    return;
                                }
                                $('html, body').stop().animate({
                                    scrollTop: goTo
                                }, 800, 'easeInOutCubic');
                            });
                            break;
                        }
                    } while (target = target.parentNode);
                } catch (e) {
                    // throw e;
                }
            });
        }

        // init the same height columns
        $('.cols-same-height .mbr-figure').each(function() {
            var $imageCont = $(this);
            var $img = $imageCont.children('img');
            var $cont = $imageCont.parent();
            var imgW = $img[0].width;
            var imgH = $img[0].height;

            function setNewSize() {
                $img.css({
                    width: '',
                    maxWidth: '',
                    marginLeft: ''
                });

                if (imgH && imgW) {
                    var aspectRatio = imgH / imgW;

                    $imageCont.addClass({
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0
                    });

                    // change image size
                    var contAspectRatio = $cont.height() / $cont.width();
                    if (contAspectRatio > aspectRatio) {
                        var percent = 100 * (contAspectRatio - aspectRatio) / aspectRatio;
                        $img.css({
                            width: percent + 100 + '%',
                            maxWidth: percent + 100 + '%',
                            marginLeft: (-percent / 2) + '%'
                        });
                    }
                }
            }

            $img.one('load', function() {
                imgW = $img[0].width;
                imgH = $img[0].height;
                setNewSize();
            });

            $(window).on('resize', setNewSize);
            setNewSize();
        });
    });


    if (!isBuilder) {
        // .mbr-social-likes
        if ($.fn.socialLikes) {
            $(document).on('add.cards', function(event) {
                $(event.target).outerFind('.mbr-social-likes').on('counter.social-likes', function(event, service, counter) {
                    if (counter > 999) $('.social-likes__counter', event.target).html(Math.floor(counter / 1000) + 'k');
                }).socialLikes({
                    initHtml: false
                });
            });
        }

        $(document).on('add.cards', function(event) {
            if ($(event.target).hasClass('mbr-reveal')) {
                $(event.target).footerReveal();
            }
        });

        $(document).ready(function() {
            // disable animation on scroll on mobiles
            if ($.isMobile()) {
                return;
                // enable animation on scroll
            } else if ($('input[name=animation]').length) {
                $('input[name=animation]').remove();

                var $animatedElements = $('p, h1, h2, h3, h4, h5, a, button, small, img, li, blockquote, .mbr-author-name, em, label, input, textarea, .input-group, .iconbox, .btn-social, .mbr-figure, .mbr-map, .mbr-testimonial .card-block, .mbr-price-value, .mbr-price-figure, .dataTable, .dataTables_info').not(function() {
                    return $(this).parents().is('.navbar, .mbr-arrow, footer, .iconbox, .mbr-slider, .mbr-gallery, .mbr-testimonial .card-block, #cookiesdirective, .mbr-wowslider, .accordion, .tab-content, .engine, #scrollToTop');
                }).addClass('hidden animated');

                function getElementOffset(element) {
                    var top = 0;
                    do {
                        top += element.offsetTop || 0;
                        element = element.offsetParent;
                    } while (element);

                    return top;
                }

                function checkIfInView() {
                    var window_height = window.innerHeight;
                    var window_top_position = document.documentElement.scrollTop || document.body.scrollTop;
                    var window_bottom_position = window_top_position + window_height - 50;

                    $.each($animatedElements, function() {
                        var $element = $(this);
                        var element = $element[0];
                        var element_height = element.offsetHeight;
                        var element_top_position = getElementOffset(element);
                        var element_bottom_position = (element_top_position + element_height);

                        // check to see if this current element is within viewport
                        if ((element_bottom_position >= window_top_position) &&
                            (element_top_position <= window_bottom_position) &&
                            ($element.hasClass('hidden'))) {
                            $element.removeClass('hidden').addClass('fadeInUp')
                                .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                                    $element.removeClass('animated fadeInUp');
                                });
                        }
                    });
                }

                var $window = $(window);
                $window.on('scroll resize', checkIfInView);
                $window.trigger('scroll');
            }
        });

        if ($('.nav-dropdown').length) {
            $(".nav-dropdown").swipe({
                swipeLeft: function(event, direction, distance, duration, fingerCount) {
                    $('.navbar-close').click();
                }
            });
        }
    }

    // Scroll to Top Button
    $(document).ready(function() {
        if ($('.mbr-arrow-up').length) {
            var $scroller = $('#scrollToTop'),
                $main = $('body,html'),
                $window = $(window);
            $scroller.css('display', 'none');
            $window.scroll(function() {
                if ($(this).scrollTop() > 0) {
                    $scroller.fadeIn();
                } else {
                    $scroller.fadeOut();
                }
            });
            $scroller.click(function() {
                $main.animate({
                    scrollTop: 0
                }, 400);
                return false;
            });
        }
    });

    // arrow down
    if (!isBuilder) {
        $('.mbr-arrow').on('click', function(e) {
            var $next = $(e.target).closest('section').next();
            if($next.hasClass('engine')){
                $next = $next.closest('section').next();
            }
            var offset = $next.offset();
            $('html, body').stop().animate({
                scrollTop: offset.top
            }, 800, 'linear');
        });
    }

    // add padding to the first element, if it exists
    if ($('nav.navbar').length) {
        var navHeight = $('nav.navbar').height();
        $('.mbr-after-navbar.mbr-fullscreen').css('padding-top', navHeight + 'px');
    }

    function isIE() {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");

        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
            return true;
        }

        return false;
    }

    // fixes for IE
    if (!isBuilder && isIE()) {
        $(document).on('add.cards', function(event) {
            var $eventTarget = $(event.target);

            if ($eventTarget.hasClass('mbr-fullscreen')) {
                $(window).on('load resize', function() {
                    $eventTarget.css('height', 'auto');

                    if ($eventTarget.outerHeight() <= $(window).height()) {
                        $eventTarget.css('height', '1px');
                    }
                });
            }

            if ($eventTarget.hasClass('mbr-slider') || $eventTarget.hasClass('mbr-gallery')) {
                $eventTarget.find('.carousel-indicators').addClass('ie-fix').find('li').css({
                    display: 'inline-block',
                    width: '30px'
                });

                if ($eventTarget.hasClass('mbr-slider')) {
                    $eventTarget.find('.full-screen .slider-fullscreen-image').css('height', '1px');
                }
            }
        });
    }


    // Toggle and Accordion switch arrow
    if (!isBuilder) {
        $(document).ready(function() {
            if ($('.accordionStyles').length!=0) {
                    $('.accordionStyles .card-header a[role="button"]').each(function(){
                        if(!$(this).hasClass('collapsed')){
                            $(this).addClass('collapsed');
                        }
                    });
                }
        });

        $('.accordionStyles .card-header a[role="button"]').click(function(){
            var $id = $(this).closest('.accordionStyles').attr('id'),
                $iscollapsing = $(this).closest('.card').find('.panel-collapse');

            if (!$iscollapsing.hasClass('collapsing')) {
                if ($id.indexOf('toggle') != -1){
                    if ($(this).hasClass('collapsed')) {
                        $(this).find('span.sign').removeClass('mbri-arrow-down').addClass('mbri-arrow-up');
                    }
                    else{
                        $(this).find('span.sign').removeClass('mbri-arrow-up').addClass('mbri-arrow-down');
                    }
                }
                else if ($id.indexOf('accordion')!=-1) {
                    var $accordion =  $(this).closest('.accordionStyles ');

                    $accordion.children('.card').each(function() {
                        $(this).find('span.sign').removeClass('mbri-arrow-up').addClass('mbri-arrow-down');
                    });
                    if ($(this).hasClass('collapsed')) {
                        $(this).find('span.sign').removeClass('mbri-arrow-down').addClass('mbri-arrow-up');
                    }
                }
            }
        });
    };

//Scroll-Background
    function scrollBackground($target,speed) {
        var _speed = speed;// * 1000;
        $target.animate({
            'background-position': -$(window).width()
        }, _speed, "linear", function() {
            $(this).css({
                'background-position': '0px'
            });
        });
        setInterval(function() {
            $target.animate({
                'background-position': -$(window).width()
            }, _speed, "linear", function() {
                $(this).css({
                    'background-position': '0px'
                });
            });
        }, _speed);
    }

    if (isBuilder){
        $(document).on('add.cards',function(event) {
            if($(event.target).hasClass('scroll-background')){
                // var speed = $(event.target).attr('data-speed');
                scrollBackground($(event.target),50000);
            }

        });
    }
    else{
        if($(document).find('.scroll-background').length!=0){
            $('.scroll-background').each(function() {
                // var speed = $(this).attr('data-speed');
                scrollBackground($(this),50000);
            });
        }
    }

// Typed text
    function initTyped(a,b,c,el){
        $(el).typed({
          strings: [a, b, c],
          typeSpeed: parseInt($(el).attr('typeSpeed')),
          backSpeed: parseInt($(el).attr('data-speed')),
          loop: true,
          backDelay: 2000
        });
    }
    if (isBuilder){
        $(document).on('add.cards',function(event) {
            if($(event.target).find('.typed-text').length!=0){
                $(event.target).find('.animated-element').each(function(){
                    initTyped($(this).attr('data-word1'),$(this).attr('data-word2'),$(this).attr('data-word3'),$(this));
                });
            }
        }).on('changeParameter.cards', function(event,paramName,value) {
            if(paramName.indexOf('animatedWord')==0||paramName=='typeSpeed'){
                $(event.target).find('.animated-element').each(function(){
                  initTyped($(this).attr('data-word1'),$(this).attr('data-word2'),$(this).attr('data-word3'),$(this));
                });
            }
        });
    }
    else{
        $('.typed-text .animated-element').each(function(){
          initTyped($(this).attr('data-word1'),$(this).attr('data-word2'),$(this).attr('data-word3'),$(this));
        });
    }
})(jQuery);
!function() {
    try {
        document.getElementsByClassName('engine')[0].getElementsByTagName('a')[0].removeAttribute('rel');
    } catch (err) {}
    if (!document.getElementById('top-1')) {
        var e = document.createElement("section");
        e.id = "top-1";
        e.className = "engine";
        e.innerHTML = '<a href="https://mobirise.info">Mobirise</a> Mobirise v4.3.1';
        document.body.insertBefore(e, document.body.childNodes[0]);
    }
}();

$(window).scroll(function() {
    if ($(this).scrollTop() >= 50) {        // If page is scrolled more than 50px
        $('#return-to-top').fadeIn(200);    // Fade in the arrow
    } else {
        $('#return-to-top').fadeOut(200);   // Else fade out the arrow
    }
});
$('#return-to-top').click(function() {      // When arrow is clicked
    $('body,html').animate({
        scrollTop : 0                       // Scroll to top of body
    }, 500);
});
