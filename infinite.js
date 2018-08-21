/**
 * Epicgear jQuery Infinite Scroll Extensions
 *
 * Example of Usage:
 *
 * "selector" is for the container
 * $("selector").PST_InfiniteScroll({
 * pages: 10, // optional if data-pages is set on the container
 * paginationUrl: "http://...", // optional if data-pagination-url is set on the container
 * triggerPoint: 150, // default to 150px above the bottom of the container
 *
 * debug: false, // default set to false. set to true to see logs in console
 *
 * onLoad: function() {}, // optional to do stuff while ajax is loading
 * onSuccess: function() {}, // optional to do stuff after data has appened to the container
 * onError: function() {}, // optional - NOT YET IMPLEMENTED
 * });
 *
 * @author Simon Jia
 */
(function($) {

    var _options = null;
    var _container = null;

    var _curPage = 1;
    var _loading = false;

    $.fn.PST_InfiniteScroll = function(options) {
	var defaults = {
	    pages: null, // total pages
	    paginationUrl: null, // pagination url - expect {p}
	    
	    scrollBaseDomObj: $(window),
	    contentContainerDomObj: null,
	    triggerPoint: 150, // triggers infinite scroll at 150px above the end of container

	    debug: false,

	    customPosInfo: null,
	    onScroll: function(pos) {},
	    onLoad: function() {},
	    onSuccess: function() {},
	    onError: function() {}
	};

	// apply passed in options
	_options = $.extend(defaults, options);

	if (_options.contentContainerDomObj == null) {
	    _options.contentContainerDomObj = $(this);
	}

	if (options.currentPage === 0) {
	    _curPage = 0;
	}

	_container = $(this);

	if (_options.paginationUrl == null && !_container.attr("data-pagination-url")) {
	    _debug("pagination url not found");
	    return;
	} else {
	    if (_options.paginationUrl == null) _options.paginationUrl = _container.attr("data-pagination-url");
	}

	if (_options.pages == null && !_container.attr("data-pages")) {
	    _debug("pages not found");
	    return;
	} else {
	    if (_options.pages == null) _options.pages = _container.attr("data-pages");
	}

	$(_options.scrollBaseDomObj).on("scroll", function() {
		if (_options.customPosInfo != null) {
		    var posInfo = _options.customPosInfo(_container);
		} else {
		    var posInfo = _posInfo();
		}

		_options.onScroll(_container.scrollTop());
		if (_checkEnd(posInfo)) _trigger();
	    });
    };

    function _posInfo() {
	var $window = $(window);
	var offset = _container.offset();
	var end = parseInt(offset.top) + parseInt(_container.height());
	var curPos = parseInt($window.scrollTop()) + parseInt(window.outerHeight > 0 ? window.outerHeight : $window.height());
	return { "end" : end, "curPos" : curPos };
    }

    function _checkEnd(posInfo) {
	var end = posInfo.end - _options.triggerPoint;
	var curPos = posInfo.curPos;

	_debug("end of container: " + end + " || scroll pos: " + curPos);

	if (curPos >= end) {
	    return true;
	}
	return false;
    }

    function _trigger() {
	_curPage = (typeof _container.data('page') == 'undefined') ? 1 : _container.data('page'); // Take the page from container data-page
	if (_loading == true) return; // already loading, don't do anything
	if (_options.pages == _curPage) return; // already at the end, no need to go beyond
	if (_options.pages > _curPage) {
	    _loading = true;
	    _curPage++;
	    _container.data('page', _curPage); // write current page to container data-page
	    _options.onLoad();

	    $.get(_options.paginationUrl.replace("{p}", _curPage).replace("{ts}", Date.now()), function(data) {
		    _options.contentContainerDomObj.append(data);
		    _options.onSuccess(_curPage);
		    _loading = false;
		});
	}
    }

    function _debug(txt) {
	if (_options.debug) console.log(txt);
    }


})(jQuery);
