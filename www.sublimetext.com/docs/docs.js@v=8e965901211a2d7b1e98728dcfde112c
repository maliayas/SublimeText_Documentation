const version_ranges = {
    'dev': 99999,
    '4.0': 4104,
    '3.2': 3211,
    '3.1': 3176,
    '3.0': 3143
};

const version_index = [];
const version_buttons = {};

let applied_filter = null;
function applyFilter(filter_build) {
    if (filter_build === applied_filter)
        return;

    version_index.forEach(({element, build, removed}) => {
        const hide = (!removed && filter_build < build) || (removed && filter_build >= build);

        element.classList.toggle('filtered', hide);
    });

    for (version in version_buttons) {
        const enabled = version_ranges[version] === filter_build;

        version_buttons[version].classList.toggle('active', enabled);
    }

    applied_filter = filter_build;
    window.localStorage.build_filter = applied_filter;
}

function offsetTop(e) {
    let y = 0;
    while (e) {
        y += e.offsetTop;
        e = e.offsetParent;
    }
    return y;
}

document.addEventListener('DOMContentLoaded', () => {
    // Index build filters in the document
    const elements = document.querySelectorAll(".build-filter");
    for (let i = 0; i < elements.length; ++i) {
        const element = elements[i];

        for (let j = 0; j < element.classList.length; ++j) {
            const className = element.classList[j];

            if (className.startsWith('build-')) {
                const parts = className.match(/build-([0-9]+)(?:-(\w+))?/);
                if (!parts) {
                    continue;
                }

                const build = parts[1] === 'next' ? 99999 : parseInt(parts[1]);
                const removed = parts[2] === 'removed';

                version_index.push({
                    element,
                    build,
                    removed,
                });
                break;
            }
        }
    }

    const toc = document.getElementById('toc');

    const h1 = document.querySelector('h1');
    const hbg = h1.querySelector('div.background');
    const hplaceholder = h1.querySelector('div.placeholder');
    const hspan = h1.querySelector('span');
    const jump_toc = hspan.querySelector('.jump.toc');

    if (!toc) {
        jump_toc.style.display = 'none';
    }

    const versions = h1.querySelector('div.versions');

    if (version_index.length !== 0) {
        versions.classList.add('enabled');

        for (version in version_ranges) {
            const button = document.createElement('a');
            const build = version_ranges[version];
            button.textContent = version;
            button.className = 'ver-sel';
            button.href = '#';
            button.addEventListener('click', e => {
                versions.classList.toggle('expanded');

                applyFilter(build);

                // Don't follow the href
                e.preventDefault();
            });

            version_buttons[version] = button;
            versions.appendChild(button);
            versions.append(' ');
        }
    }

    let pin_y;

    function on_resize() {
        pin_y = offsetTop(h1.parentElement);

        hbg.style.height = hspan.offsetHeight + 'px';
        hplaceholder.style.height = hspan.offsetHeight + 'px';
    }
    on_resize();

    let pending_resize_frame = false;
    window.addEventListener('resize', () => {
        if (!pending_resize_frame) {
            window.requestAnimationFrame(() => {
                on_resize();
                pending_resize_frame = false;
            });
            pending_resize_frame = true;
        }
    });

    function on_scroll(scroll) {
        const pinned = scroll > pin_y;

        h1.classList.toggle('pinned', pinned);
    }
    on_scroll(window.scrollY);

    let last_scroll_y = 0;
    let pending_scroll_frame = false;
    window.addEventListener('scroll', () => {
        last_scroll_y = window.scrollY;
        if (!pending_scroll_frame) {
            window.requestAnimationFrame(() => {
                on_scroll(last_scroll_y);
                pending_scroll_frame = false;
            });
            pending_scroll_frame = true;
        }
    });

    let initial_build_filter = parseInt(window.localStorage.build_filter);
    if (!initial_build_filter) {
        initial_build_filter = version_ranges['4.0'];
    }
    applyFilter(initial_build_filter);
}, false);
