"use strict";
angular.module("app.directives", ["ui.load"]).directive("uiModule", ["MODULE_CONFIG", "uiLoad", "$compile", function(MODULE_CONFIG, uiLoad, $compile) {
    return {
        restrict: "A",
        compile: function(el, attrs) {
            var contents = el.contents().clone();
            return function(scope, el, attrs) {
                el.contents().remove();
                uiLoad.load(MODULE_CONFIG[attrs.uiModule]).then(function() {
                    $compile(contents)(scope, function(clonedElement, scope) {
                        el.append(clonedElement)
                    })
                })
            }
        }
    }
}]).directive("uiShift", ["$timeout", function($timeout) {
    return {
        restrict: "A",
        link: function(scope, el, attr) {
            var _el = $(el),
                _window = $(window),
                prev = _el.prev(),
                parent, width = _window.width();
            !prev.length && (parent = _el.parent());

            function sm() {
                $timeout(function() {
                    var method = attr.uiShift;
                    var target = attr.target;
                    _el.hasClass("in") || _el[method](target).addClass("in")
                })
            }
            function md() {
                parent && parent["prepend"](el);
                !parent && _el["insertAfter"](prev);
                _el.removeClass("in")
            }(width < 768 && sm()) || md();
            _window.resize(function() {
                if (width !== _window.width()) {
                    $timeout(function() {
                        (_window.width() < 768 && sm()) || md();
                        width = _window.width()
                    })
                }
            })
        }
    }
}]).directive("uiToggleClass", ["$timeout", "$document", function($timeout, $document) {
    return {
        restrict: "AC",
        link: function(scope, el, attr) {
            el.on("click", function(e) {
                e.preventDefault();
                var classes = attr.uiToggleClass.split(","),
                    targets = (attr.target && attr.target.split(",")) || Array(el),
                    key = 0;
                angular.forEach(classes, function(_class) {
                    var target = targets[(targets.length && key)];
                    (_class.indexOf("*") !== -1) && magic(_class, target);
                    $(target).toggleClass(_class);
                    key++
                });
                $(el).toggleClass("active");

                function magic(_class, target) {
                    var patt = new RegExp("\\s" + _class.replace(/\*/g, "[A-Za-z0-9-_]+").split(" ").join("\\s|\\s") + "\\s", "g");
                    var cn = " " + $(target)[0].className + " ";
                    while (patt.test(cn)) {
                        cn = cn.replace(patt, " ")
                    }
                    $(target)[0].className = $.trim(cn)
                }
            })
        }
    }
}]).directive("uiNav", ["$timeout", function($timeout) {
    return {
        restrict: "AC",
        link: function(scope, el, attr) {
            var _window = $(window),
                _mb = 768,
                wrap = $(".app-aside"),
                next, backdrop = ".dropdown-backdrop";
            el.on("click", "a", function(e) {
                next && next.trigger("mouseleave.nav");
                var _this = $(this);
                _this.parent().siblings(".active").toggleClass("active");
                _this.next().is("ul") && _this.parent().toggleClass("active") && e.preventDefault();
                _this.next().is("ul") || ((_window.width() < _mb) && $(".app-aside").removeClass("show off-screen"))
            });
            el.on("mouseenter", "a", function(e) {
                next && next.trigger("mouseleave.nav");
                $("> .nav", wrap).remove();
                if (!$(".app-aside-fixed.app-aside-folded").length || (_window.width() < _mb)) {
                    return
                }
                var _this = $(e.target),
                    top, w_h = $(window).height(),
                    offset = 50,
                    min = 150;
                !_this.is("a") && (_this = _this.closest("a"));
                if (_this.next().is("ul")) {
                    next = _this.next()
                } else {
                    return
                }
                _this.parent().addClass("active");
                top = _this.parent().position().top + offset;
                next.css("top", top);
                if (top + next.height() > w_h) {
                    next.css("bottom", 0)
                }
                if (top + min > w_h) {
                    next.css("bottom", w_h - top - offset).css("top", "auto")
                }
                next.appendTo(wrap);
                next.on("mouseleave.nav", function(e) {
                    $(backdrop).remove();
                    next.appendTo(_this.parent());
                    next.off("mouseleave.nav").css("top", "auto").css("bottom", "auto");
                    _this.parent().removeClass("active")
                });
                $(".smart").length && $('<div class="dropdown-backdrop"/>').insertAfter(".app-aside").on("click", function(next) {
                    next && next.trigger("mouseleave.nav")
                })
            });
            wrap.on("mouseleave", function(e) {
                next && next.trigger("mouseleave.nav");
                $("> .nav", wrap).remove()
            })
        }
    }
}]).directive("uiScroll", ["$location", "$anchorScroll", function($location, $anchorScroll) {
    return {
        restrict: "AC",
        link: function(scope, el, attr) {
            el.on("click", function(e) {
                $location.hash(attr.uiScroll);
                $anchorScroll()
            })
        }
    }
}]).directive("uiFullscreen", ["uiLoad", function(uiLoad) {
    return {
        restrict: "AC",
        template: '<i class="fa fa-expand fa-fw text"></i><i class="fa fa-compress fa-fw text-active"></i>',
        link: function(scope, el, attr) {
            if (screenfull.enabled) {
                el.removeClass("hide")
            }
            el.on("click", function() {
                var target;
                attr.target && (target = $(attr.target)[0]);
                el.toggleClass("active");
                screenfull.toggle(target)
            })
        }
    }
}]).directive("uiButterbar", ["$rootScope", "$anchorScroll", function($rootScope, $anchorScroll) {
    return {
        restrict: "AC",
        template: '<span class="bar"></span>',
        link: function(scope, el, attrs) {
            el.addClass("butterbar hide");
            scope.$on("$stateChangeStart", function(event) {
                $anchorScroll();
                el.removeClass("hide").addClass("active")
            });
            scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState) {
                event.targetScope.$watch("$viewContentLoaded", function() {
                    el.addClass("hide").removeClass("active")
                })
            })
        }
    }
}]).directive("setNgAnimate", ["$animate", function($animate) {
    return {
        link: function($scope, $element, $attrs) {
            $scope.$watch(function() {
                return $scope.$eval($attrs.setNgAnimate, $scope)
            }, function(valnew, valold) {
                $animate.enabled( !! valnew, $element)
            })
        }
    }
}]).directive("highlight", ["$interpolate", "hljs", "$window", function($interpolate, hljs, $window) {
    return {
        restrict: "EA",
        scope: true,
        compile: function(tElem, tAttrs) {
            var interpolateFn = $interpolate(tElem.html(), true);
            tElem.html("");
            return function(scope, elem, attrs) {
                scope.$watch(interpolateFn, function(value) {
                    elem.html(hljs.highlight("sql", value).value)
                })
            }
        }
    }
}]).directive("ngConfirmClick", [function() {
    return {
        priority: 1,
        terminal: true,
        link: function(scope, element, attr) {
            var msg = attr.ngConfirmClick || "Are you sure?";
            var clickAction = attr.confirmedClick;
            element.bind("click", function(event) {
                if (window.confirm(msg)) {
                    scope.$eval(clickAction)
                }
            })
        }
    }
}]).directive("scrollLeftOnClick", function() {
    return {
        restrict: "A",
        link: function(scope, $elm) {
            $elm.on("click", function() {
                $('[name="unionScroll"]').animate({
                    scrollLeft: "+=400"
                }, 1000)
            })
        }
    }
}).directive("scrollRightOnClick", function() {
    return {
        restrict: "A",
        link: function(scope, $elm) {
            $elm.on("click", function() {
                $('[name="unionScroll"]').animate({
                    scrollLeft: "-=400"
                }, 1000)
            })
        }
    }
}).directive("scroll", function($window) {
    return function(scope, element, attrs) {
        angular.element(document.getElementsByName("unionScroll")).bind("scroll", function() {
            var scrollLeft = this.scrollLeft;
            angular.forEach(document.getElementsByName("unionScroll"), function(ele) {
                ele.scrollLeft = scrollLeft
            })
        })
    }
}).directive("slideToggle", function($ocLazyLoad, $timeout) {
    return {
        restrict: "A",
        scope: {
            isOpen: "=slideToggle"
        },
        link: function(scope, element, attr) {
            var slideDuration = parseInt(attr.slideToggleDuration, 10) || 200;
            if (attr.startShown == "false") {
                element.hide()
            }
            scope.$watch("isOpen", function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    element.stop().slideToggle(slideDuration)
                }
                if (scope.isOpen) {
                    if (angular.element("xmp").length > 0) {
                        $ocLazyLoad.load([{
                            files: ["https://dev.g.alicdn.com/alimama-engineering-fe/zhizi-fe/0.0.30/js/sqi-cdn/strapdown.min.js"],
                            cache: false
                        }])
                    }
                }
            })
        }
    }
});

