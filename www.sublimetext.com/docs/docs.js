var ranges =
{
    'dev': Infinity,
    '3.2': 3211,
    '3.1': 3176,
    '3.0': 3143
};
var filterClasses =
{
    'dev': [],
    '3.2': [],
    '3.1': [],
    '3.0': []
};
var allClasses = [];
var buildsPresent = {};

if (typeof includeBuilds !== 'undefined')
{
    for (var i = 0; i < includeBuilds.length; ++i)
        buildsPresent[includeBuilds[i]] = true;
}

function addBuildNum(text)
{
    if (text.substring(0, 1) == '<')
        text = text.substring(1);
    var buildNum = parseInt(text, 10);
    if (!isNaN(buildNum))
        buildsPresent[buildNum] = true;
}

// Most version-tagged items contain <span class="build">####</span>
var spans = document.querySelectorAll('span.build');
for (var i = 0; i < spans.length; ++i)
    addBuildNum(spans[i].innerText);

// Sometimes examples have to be version-tagged
var pres = document.querySelectorAll('pre');
for (var i = 0; i < pres.length; ++i)
{
    var buildClassMatch = pres[i].className.match(/\bbuild-(\d+)\b/);
    if (buildClassMatch)
        addBuildNum(buildClassMatch[1]);
}

Object.keys(buildsPresent).forEach(
    function (build)
    {
        // Elements with build-#### should be filtered when <
        var buildClass = '.build-' + build;
        // Elements with build-####-removed be filtered when >=
        var buildRemovedClass = '.build-' + build + '-removed';
        var buildNum = parseInt(build, 10);
        Object.keys(filterClasses).forEach(
            function (filter) {
                if (buildNum > ranges[filter])
                {
                    filterClasses[filter].push(buildClass);
                }
                if (buildNum <= ranges[filter])
                {
                    filterClasses[filter].push(buildRemovedClass);
                }
            }
        );
        allClasses.push(buildClass);
        allClasses.push(buildRemovedClass);
    }
);

function hasClass(el, cls)
{
    return el.className.indexOf(cls) != -1;
}

function removeClass(el, toRemove)
{
    var classes = el.className.split(' ');
    var newClasses = [];
    for (var i = 0; i < classes.length; ++i)
    {
        if (classes[i] != toRemove)
            newClasses.push(classes[i]);
    }
    el.className = newClasses.join(' ');
}

function addClass(el, toAdd)
{
    var classes = el.className.split(' ');
    var found = false;
    for (var i = 0; i < classes.length; ++i)
    {
        if (classes[i] == toAdd)
        {
            found = true;
            break;
        }
    }
    if (!found)
        el.className = el.className + ' ' + toAdd;
}

function eachSelectors(classes, callback)
{
    for (var i = 0; i < classes.length; ++i)
    {
        var els = document.querySelectorAll(classes[i]);
        els.forEach(callback);
    }
}

function addVerToHash(hash)
{
    var main = document.getElementsByTagName('main')[0];
    var idEls = main.querySelectorAll('*[id]');
    var hrefEls = main.querySelectorAll('*[href^="#"]');

    var newHash = ':' + hash.replace('#', '');
    if (hash == defaultHash)
        newHash = '';

    for (var i = 0; i < idEls.length; ++i)
    {
        idEls[i].id = idEls[i].id.replace(
            /^(.*?)(:ver-(dev|[\d.]{1,4}))?$/,
            '$1' + newHash
        );
    }

    var loc = window.location;
    var url = loc.href.substring(0, loc.href.length - loc.hash.length);
    for (var i = 0; i < hrefEls.length; ++i)
    {
        var href = hrefEls[i].href;
        if (href.substring(0, url.length) == url)
            href = href.substring(url.length);
        if (href.substring(0, 5) == '#ver-')
            continue;
        hrefEls[i].href = href.replace(
            /^(#.*?)(:ver-(dev|[\d.]{1,4}))?$/,
            '$1' + newHash
        );
    }
}

function displayFilter(hash)
{
    if (!hash)
        return;
    if (hash.substring(0, 5) != '#ver-')
        return;
    var filter = hash.substring(5);
    if (!(filter in filterClasses))
        return;

    eachSelectors(
        allClasses,
        function(el) {
            removeClass(el, 'filtered');
            el.title = '';
        }
    );
    eachSelectors(
        filterClasses[filter],
        function(el) {
            addClass(el, 'filtered');
            el.title = 'Unavailable in ' + filter;
        }
    );

    filterLinks.forEach(
        function(link)
        {
            if (link.href.substring(link.href.length - hash.length) == hash)
                addClass(link, 'active');
            else
                removeClass(link, 'active');
        }
    );

    addVerToHash(hash);
}

function hashNoVersion(url)
{
    if (!url)
        return '';

    var idx = url.indexOf('#');
    if (idx == -1)
        return '';

    return url.substring(idx + 1).replace(
        /^(.*?)((:|^)ver-(dev|[\d.]{1,4}))?$/,
        '$1'
    );
}

var versionsDiv = null;
var versionsDivs = document.querySelectorAll('div.versions');
if (versionsDivs.length)
    versionsDiv = versionsDivs[0];

var defaultHash = null;
var filterLinks = document.querySelectorAll('a.ver-sel');
for (var i = 0; i < filterLinks.length; ++i)
{
    filterLinks[i].addEventListener(
        'click',
        function(e) {
            if (hasClass(versionsDiv, 'expanded'))
                removeClass(versionsDiv, 'expanded');
            else
                addClass(versionsDiv, 'expanded');
            
            var newHash = e.target.href.replace(/^[^#]*/, '');
            displayFilter(newHash);

            // Preserve the hash when switching versions
            var newUrl = hashNoVersion(window.location.href);
            if (newUrl != '')
                newUrl = '#' + newUrl;
            if (newHash == defaultHash)
            {
                if (newUrl == '')
                    newUrl = ' ';
            }
            else
            {
                if (newUrl == '')
                    newUrl = newHash;
                else
                    newUrl += newHash.replace('#', ':');
            }
            history.pushState(null, '', newUrl);
            e.preventDefault();
        }
    );
    if (filterLinks[i].getAttribute('data-default') == '1')
        defaultHash = filterLinks[i].href.replace(/^[^#]*/, '');
}

var buildSpans = document.querySelectorAll('span.build');
for (var i = 0; i < buildSpans.length; ++i)
{
    var p = buildSpans[i].parentNode;
    while (p)
    {
        if (p.className && p.className.match(/\bbuild-\d+/))
        {
            // We only add outlining to spans since other elements are
            // block-level and it more evident via the document structure
            // what content the build tag applies to
            if (p.tagName == 'SPAN')
            {
                buildSpans[i].outlineParent = p;
                buildSpans[i].addEventListener(
                    'mouseenter',
                    function(e) {
                        addClass(e.target.outlineParent, 'outlined');
                    }
                );
                buildSpans[i].addEventListener(
                    'mouseleave',
                    function(e) {
                        removeClass(e.target.outlineParent, 'outlined');
                    }
                );
            }
            break;
        }
        p = p.parentNode;
    }
}

var toc = document.getElementById('toc');

if (versionsDiv)
    addClass(versionsDiv, 'enabled');

function handleHash()
{
    var apiHash = window.location.hash.replace(
        /^#.*?:?(ver-(dev|[\d.]{1,4}))?$/,
        '#$1'
    );
    if (apiHash == '' || apiHash == '#')
        apiHash = defaultHash;
    displayFilter(apiHash);
}
handleHash();

window.addEventListener('hashchange', handleHash, false);


// The Y position of the top of the h1 > span, which is used to switch
// between the pinned and non-pinned modes
var pinY = 0;

var h1 = null;
var h1Height = 0;

function offsetTop(el)
{
    var y = 0;
    while (el)
    {
        y += el.offsetTop;
        el = el.offsetParent;
    }
    return y;
}

var h1s = document.querySelectorAll('h1');
if (h1s.length)
{
    h1 = h1s[0];
    h1Height = h1.offsetHeight;
}

var h1Span = null;
var h1SpanOffset = 0;
var h1SpanHeight = 0;

var h1Spans = h1.querySelectorAll('h1 > span');
if (h1Spans.length)
{
    h1Span = h1Spans[0];
    h1SpanHeight = h1Span.offsetHeight;
    // Since the span is position: fixed when pinned, the offsetTop will be
    // inaccurate, so we have to cache the Y offset of the h1 -> span and use
    // that when re-calculating the pinY as the window size changes.
    pinY = offsetTop(h1Span);
}
if (pinY > 0)
    h1SpanOffset = pinY - offsetTop(h1);

function h1YOffset()
{
    pinY = offsetTop(h1) + h1SpanOffset;
}

var resizeFrameWait = false;
window.addEventListener(
    'resize',
    function(e) {
        if (!resizeFrameWait)
        {
            window.requestAnimationFrame(function() {
                h1YOffset(h1);
                resizeFrameWait = false;
            });
            resizeFrameWait = true;
        }
    }
);

var h1Nav = null;

var navs = document.querySelectorAll('h1 > span > nav');
if (navs.length)
{
    h1Nav = navs[0];
}

function pinHeader(scrollY)
{
    if (scrollY > pinY)
    {
        if (versionsDiv && !hasClass(versionsDiv, 'pinned'))
            addClass(versionsDiv, 'pinned');
        if (!hasClass(h1, 'pinned'))
        {
            addClass(h1, 'pinned');
            
            var bgDiv = document.createElement('div');
            bgDiv.className = 'background';
            bgDiv.style.height = h1SpanHeight + 'px';
            h1.insertBefore(bgDiv, h1Span);

            var plDiv = document.createElement('div');
            plDiv.className = 'placeholder';
            plDiv.style.height = h1Height + 'px';
            h1.insertBefore(plDiv, h1Span);

            var divider = document.createElement('a');
            divider.className = 'divider';
            h1Nav.appendChild(divider);

            if (toc)
            {
                var tocLink = document.createElement('a');
                tocLink.className = 'jump';
                tocLink.innerText = 'TOC';
                var verHash = window.location.hash.replace(
                    /^#.*?:?(ver-(dev|[\d.]{1,4}))?$/,
                    '$1'
                );
                if (verHash != '')
                    verHash = ':' + verHash;
                tocLink.href = '#toc' + verHash;
                h1Nav.appendChild(tocLink);
            }

            var topLink = document.createElement('a');
            topLink.className = 'jump';
            topLink.innerText = 'TOP';
            topLink.href = '#';
            topLink.addEventListener(
                'click',
                function(e) {
                    e.preventDefault();
                    window.scrollTo(window.scrollX, 0);
                    var newUrl = window.location.hash.replace(
                        /^#.*?:?(ver-(dev|[\d.]{1,4}))?$/,
                        '#$1'
                    );
                    if (newUrl == '#')
                        newUrl = '';
                    if (newUrl == '')
                        newUrl = ' ';
                    history.pushState(null, null, newUrl);
                }
            );
            h1Nav.appendChild(topLink);
        }
    }
    if (scrollY <= pinY)
    {
        if (versionsDiv && hasClass(versionsDiv, 'pinned'))
            removeClass(versionsDiv, 'pinned');
        if (hasClass(h1, 'pinned'))
        {
            var links = h1Nav.querySelectorAll('h1 > span > nav > a.jump');
            for (var i = links.length - 1; i >= 0; --i)
                h1Nav.removeChild(links[i]);
            var divider = h1Nav.querySelectorAll('h1 > span > nav > a.divider');
            if (divider.length)
                h1Nav.removeChild(divider[0]);

            var divs = h1.querySelectorAll('h1 > div');
            for (var i = 0; i < divs.length; ++i)
                h1.removeChild(divs[i]);
            removeClass(h1, 'pinned');
        }
    }
}

var lastScrollY = 0;
var scrollFrameWait = false;
window.addEventListener(
    'scroll',
    function(e) {
        lastScrollY = window.scrollY;
        if (!scrollFrameWait)
        {
            window.requestAnimationFrame(function() {
                pinHeader(lastScrollY);
                scrollFrameWait = false;
            });
            scrollFrameWait = true;
        }
    }
);

function offsetAnchorScroll()
{
    if (window.location.hash.length < 0)
        return;

    if (scrollY > pinY)
        window.scrollTo(window.scrollX, window.scrollY - h1Height);
}

// This handles when the hash doesn't change because the user clicks an
// anchor multiple times
window.addEventListener(
    'click',
    function(e) {
        var link = e.target;
        while (link && !link.href)
            link = link.parentElement;
        if (!link)
            return;
        if (hasClass(link, 'ver-sel'))
            return;
        if (link.href
            && link.href.indexOf('#') != -1)
        {
            var oldHash = hashNoVersion(window.location.href);
            var newHash = hashNoVersion(link.href);
            if (oldHash != newHash)
                setTimeout(function() { offsetAnchorScroll(); }, 0);
        }
    },
    false
);

window.addEventListener(
    // Can't use DOMContentLoaded with window.scrollY
    'load',
    function() {
        pinHeader(window.scrollY);
        offsetAnchorScroll();
    }
);
