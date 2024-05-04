/*
    KeeWeb Favicon Cloudflare Worker

    @authors    : Aetherinox, github.com/aetherinox
                  Antelle, github.com/antelle
    @base       : keeweb
    @repo       : https://github.com/keeweb/favicon-worker
    @site       : https://keeweb.info

    @TODO       : script needs to be refactored to clean up a few things.
                  add ability to specify custom favicon service.

    List of favicon services::
        - https://www.google.com/s2/favicons?domain_url={DOMAIN}&sz={ICON_SIZE}
        - https://s2.googleusercontent.com/s2/favicons?domain={DOMAIN}&sz={ICON_SIZE}
        - https://icons.duckduckgo.com/ip3/{DOMAIN}.ico
        - http://favicon.yandex.net/favicon/{DOMAIN}
        - https://api.faviconkit.com/{DOMAIN}/{ICON_SIZE}
        - https://f1.allesedv.com/{DOMAIN}
        - https://unavatar.now.sh/{DOMAIN{} (rate limited)

    Alternative examples
        - https://besticon-demo.herokuapp.com/

*/

const serviceApi = `https://s2.googleusercontent.com/s2/favicons?domain={DOMAIN}&sz={ICON_SIZE}`;
const serviceBackup = 'https://raw.githubusercontent.com/keeweb/favicon-cdn/master';
const faviconSvg = 'data:image/svg+xml,';
const subdomain = 'favicon';
const workerId = 'keeweb-worker';

/*
    Maps

    for privacy reasons, the official list of blocked ips are not published here.
*/

const mapAllowedNextCheckList = new Map();
const mapDailyLimit = new Map();
const mapBlockedIps = new Map([['127.0.0.11:8787', 'Abuse']]);

/*
    Icon Loader Priority:
        - cdn repo
        - iconsOverrideIco (ico + png)
        - iconsOverrideSvg (svg)
        - api service (ddg, yandex, faviconkit, f1, unavatar)
        - favicoDefaultSvg
*/

/*
    ICO, PNG Override Map > Secondary

    this worker includes two ways to override icons fetched from a website using the
    api service.
        - automatic detection from keeweb favicon cdn github repo
        - manual override (this section)

    [ Automatic Detction ]
        To use this method, simply upload a new .ico to the repo above. the icon will
        be found based on the first letter of the domain, and the domain being the filename.

            Method Section:     Icon Overrides > Favicon CDN Repo > Primary

    [ Manual Override ]
        To use this method, add icons and their URL path in the map below.
        When a user requests an icon, it will use the icon specified in the map.

        This method supports ico + png

            Method Section:     Icon Overrides > Local > Secondary

    icon converter:
        - https://github.com/icon11-community/Folder11-Ico
*/

const iconsOverrideIco = {
    'k/keewebtest.com': `https://keeweb.info/img/scr1.png`
};

/*
    Icons in this list are populated with svg paths. ensure icons are set to 32 x 32 pixels.
*/

const iconsOverrideSvg = {
    'k/keewebtest.com': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="#1F85DE" width="32px" height="32px"><path class="fa-primary" d=""></path><path class="fa-secondary" d="M0 256a160 160 0 1 1 320 0A160 160 0 1 1 0 256z"></path></svg>`
};

/*
    default svg

    returned if no favicon is found for specified url.
*/

const favicoDefaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#1F85DE" width="32px" height="32px">
    <path d="M352 256c0 22.2-1.2 43.6-3.3 64H163.3c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64H348.7c2.2 20.4 3.3 41.8 3.3 64zm28.8-64H503.9c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64H380.8c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32H376.7c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0H167.7c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 20.9 58.2 27 94.7zm-209 0H18.6C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192H131.2c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64H8.1C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6H344.3c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352H135.3zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6H493.4z"></path>
</svg>`;

/*
    throw general help message

    @arg        : obj env
    @arg        : str host
    @arg        : str subdomain
    @returns    : Response
*/

function throwHelp(env, host, subdomain) {
    return new Response(
        'KeeWeb Favicon Grabber\n\n' +
            `@usage ...... GET ${host}/${subdomain}/domain.com \n` +
            '@repo: ...... https://github.com/keeweb/favicon-worker\n' +
            '@authors: ... github.com/aetherinox\n' +
            '              github.com/antelle\n'
    );
}

/*
    handle icon name

    Used with keeweb favicon cdn repo.
    Cleans up a domain and converts it into an icon name
    that will be looked for on the site.

        - replaces special characters / spaces / dashes with underscore
        - removes everything after the period

    stackoverflow.com   => stackoverflow
    random-site.org     => random_site

    @arg        : str url
    @returns    : str
*/

function handleIconName(url) {
    const matches = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^\/\n?]+)/i);
    const hostname = (matches && matches[1]) || '';
    let iconName = hostname.replace(/[,\ ]/g, '_');
    iconName = hostname.replace(/[:]/g, '-');
    let baseName = hostname.split('.')[0];

    return [ baseName, iconName ];
}

/*
    daily limit

    each ip address is limited to 500 successful requests per day.
    does not count toward the limit if throttled

    @arg        : obj env
    @arg        : str clientIp
    @arg        : Date now
    @returns    : bool
*/

async function dailyLimit(env, clientIp, now) {
    if (!env.THROTTLE_DAILY_ENABLED) {
        return false;
    }

    let bBlock = false;

    const THROTTLE_DAILY_LIMIT = env.THROTTLE_DAILY_LIMIT || 500;

    let getDailyCount = mapDailyLimit.get(clientIp);
    if (!getDailyCount || isNaN(getDailyCount)) {
        getDailyCount = 0;
    }

    if (getDailyCount >= THROTTLE_DAILY_LIMIT) {
        bBlock = true;
    }

    if (!bBlock || bBlock === 'false') {
        getDailyCount++;
        mapDailyLimit.set(clientIp, getDailyCount);
    }

    return bBlock;
}

/*
    Method > Throttle

    original version developed by https://github.com/antelle
    new version developed for cloudflare worker

    @arg	    : obj env
    @arg	    : str clientIp
    @arg        : Date now
    @returns    : bool
*/

async function needThrottle(env, clientIp, now) {
    if (!env.THROTTLE_DELAY_MS) {
        return false;
    }

    let bThrottle = false;

    /*
        Env vars
    */

    const THROTTLE_DELAY_MS = env.THROTTLE_DELAY_MS || 1000;
    const THROTTLE_AGGRESSIVE = env.THROTTLE_AGGRESSIVE || false;
    const THROTTLE_AGGRESSIVE_PUNISH_MS = env.THROTTLE_AGGRESSIVE_PUNISH_MS || 10000;

    /*
        Calculate timestamps
    */

    let tsNow = now.getTime();
    let tsNext = tsNow + THROTTLE_DELAY_MS;

    /*
        Check next user request

        system will allow user to request one favicon per second.
    */

    let tsNextAllowed = mapAllowedNextCheckList.get(clientIp);
    if (tsNextAllowed) {
        if (tsNextAllowed > now) {
            bThrottle = true;
            if (THROTTLE_AGGRESSIVE) {
                let tsNextPunish = tsNextAllowed + THROTTLE_AGGRESSIVE_PUNISH_MS;
                mapAllowedNextCheckList.set(clientIp, tsNextPunish);
            }
        }
    }

    /*
        Set next allowed call timestamp
    */

    if (!bThrottle) {
        mapAllowedNextCheckList.set(clientIp, tsNext);
    }

    /*
        Housekeeping
    */

    if (mapAllowedNextCheckList.size > 50) {
        for (const [ip, dt] of mapAllowedNextCheckList.entries()) {
            if (now < dt) {
                mapAllowedNextCheckList.delete(ip);
            }
        }
    }

    return bThrottle;
}

/*
    converts milliseconds to a human readable string
        01m 23s

    @arg        : num ms
    @returns    : str
*/

function msToHuman(ms) {
    var m = Math.floor(ms / 60000);
    var s = ((ms % 60000) / 1000).toFixed(0);
    return m + 'm ' + (s < 10 ? '0' : '') + s + 's';
}

/*
    ES Module > default > fetch
*/

export default {
    /*
        @arg        : obj request
        @arg        : obj env
        @arg        : obj ctx
        @returns    : Response
    */

    async fetch(request, env, ctx) {
        const init = {
            headers: { 'content-type': 'text/html;charset=UTF-8' },
            redirect: 'follow'
        };

        // returns base domain without any params
        const headersHost = request.headers.get('host') || '';

        /*
            Security Headers

            @note   : if testing, using plugins such as dark-reader will cause CSP errors when not using 'unsafe-inline'.
                      doesn't matter for users actually in keeweb unless using the browser platform

                      browser will also attempt to add in-line styles to center icon.
        */

        const DEFAULT_SECURITY_HEADERS = {
            'Content-Security-Policy': `default-src 'self' ${headersHost} 'unsafe-inline' https:; img-src 'self';`,
            'Access-Control-Max-Age': '86400',
            'Access-Control-Allow-Headers': '*',
            'Cache-Control': 'max-age=86400'
        };

        const DEFAULT_CORS_HEADERS = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Headers': '*'
        };

        /*
            Show 'welcome' message if request url is the base domain using regex.
            acceptable domains:
                - 127.0.0.1 								(development)
                - favicon.aetherinox.workers.dev 			(development)
                - favicon.keeweb.workers.dev 				(production)
                - services.keeweb.info 						(production)

            this triggers if the user did not append ?url=domain.com to the request url.
        */

        const now = new Date();

        /*
            @todo				: switch from requestUrl to pathname
            searchParams 		= https://domain.com/?url=domain.com
            pathname 			= /domain.com
        */

        const requestURL = new URL(request.url); // returns base domain + params
        const baseRegex = new RegExp(
            /^(https?:\/\/)?(127.0.0.1:(\d+)|favicon.aetherinox.workers.dev|favicon.keeweb.workers.dev|services.keeweb.info)\/?$/,
            'ig'
        );
        const bIsBaseOnly = baseRegex.test(requestURL); // triggered only when base URL is used without arguments

        /*
            default page
        */

        if (bIsBaseOnly || requestURL === headersHost) {
            return throwHelp(env, headersHost, subdomain);
        }

        /*
            check subdomain value

            subdomain has everything after the base domain
                subdomain   => favicon

            use regex '/^\/favicon\/?(.*)$/gim' to ensure subdomain starts with:
                - /favicon/

            example:
                - https://x.x.0.1:8787/favicon/

            last forward slash not required for this step.
            help info will be displayed in the next step.
        */

        const regexStartWith = new RegExp(`^\/${subdomain}\/?(.*)$`, 'igm');
        const bStartsWith = regexStartWith.test(requestURL.pathname);

        if (!bStartsWith) {
            return new Response(
                `404 not found – could not find a valid domain. Must use ${headersHost}/${subdomain}/domain.com`,
                { status: 404, reason: 'domain not found' }
            );
        }

        /*
            Get base domain
            this is everything starting with the first forward slash

            https://x.x.0.1:8787/favicon        returns /favicon
            https://x.x.0.1:8787/favicon/       returns empty string
        */

        let searchDomain = requestURL.pathname.replace(`/${subdomain}/`, '');

        /*
            throw help menu if searchDomain:
                - blank
                - contains only /subdomain
        */

        if (!searchDomain || searchDomain === `/${subdomain}`) {
            return throwHelp(env, headersHost, subdomain);
        }

        /*
            Assignment Map

                                          searchDomain
                                           |────────|
            http://127.0.0.1:8787/favicon/keeweb.info
                  ^──────────────^ ^───^
                    headersHost  subdomain
                                ^───────────────────^
                                 requestURL.pathname
            ^───────────────────────────────────────^
                    requestURL || request.url
        */

        const cacheKey = new Request(requestURL.toString(), request);
        const cache = caches.default;

        /*
            get client ip address
            x-real-ip can be altered by the client. prioritize cf-connecting-ip first.
        */

        const clientIp =
            request.headers.get('cf-connecting-ip') ||
            request.headers.get('x-real-ip') ||
            headersHost;

        /*
            Manually blocked IPs

            127.0.0.11:8787 for testing
        */

        if (mapBlockedIps.has(clientIp)) {
            const reason = mapBlockedIps.get(clientIp) || 'Blocked';
            console.log(`\x1b[32m[${workerId}]\x1b[0m BLOCK \x1b[33m[ip]\x1b[0m detected for \x1b[31m${clientIp}\x1b[0m \x1b[90m|\x1b[0m Reason: \x1b[33m${reason}\x1b[0m \x1b[90m|\x1b[0m \x1b[33mForbidden\x1b[0m`)
            return new Response(
                `403 forbidden – you cannot access this service from ${clientIp}: Reason: ${reason}`,
                { status: 403, reason: reason }
            );
        }

        /*
            Block user-agents containing 'bot'
        */

        const userAgent = request.headers.get('User-Agent') || '';
        if (userAgent.includes('bot')) {
            console.log(`\x1b[32m[${workerId}]\x1b[0m LIMIT \x1b[33m[user-agent-bot]\x1b[0m detected for \x1b[31m${clientIp}\x1b[0m \x1b[90m|\x1b[0m \x1b[33mForbidden\x1b[0m`)
            return new Response(`403 - Block User Agent containing bot`, { status: 403 });
        }

        /*
            Throttle
        */

        let bThrottle = await needThrottle(env, clientIp, now);
        let tsNextAllowed = mapAllowedNextCheckList.get(clientIp);
        let userDailyLimit = mapDailyLimit.get(clientIp);
        const nextAllowed = msToHuman(tsNextAllowed - now);

        if (bThrottle) {
            console.log(`\x1b[32m[${workerId}]\x1b[0m LIMIT \x1b[33m[throttle]\x1b[0m exeeded by \x1b[31m${clientIp}\x1b[0m \x1b[90m|\x1b[0m Next allowed in \x1b[33m${nextAllowed}\x1b[0m \x1b[90m|\x1b[0m daily total: \x1b[33m${userDailyLimit}\x1b[0m`);
            return new Response(
                `429 - Too many requests for ${clientIp}. must wait ${nextAllowed}. You have made ${userDailyLimit} total requests for the day.`,
                { status: 429 }
            );
        }

        /*
            Daily Limit
        */

        let bHitDailyLimit = await dailyLimit(env, clientIp, now);

        if (bHitDailyLimit) {
            console.log(`\x1b[32m[${workerId}]\x1b[0m LIMIT \x1b[33m[daily]\x1b[0m \x1b[33m${userDailyLimit}\x1b[0m exeeded by \x1b[31m${clientIp}\x1b[0m`);
            return new Response(
                `429 - You have hit your daily limit of ${userDailyLimit} requests for ${clientIp}`,
                { status: 429 }
            );
        }

        /*
            Cloudflare API > rate limit
        */

        const { success } = await env.keeweb.limit({ key: clientIp });

        /*
            User hit rate limit
        */

        if (!success) {
            console.log(`\x1b[32m[${workerId}]\x1b[0m LIMIT \x1b[33m[cloudflare]\x1b[0m detected for \x1b[31m${clientIp}\x1b[0m \x1b[90m|\x1b[0m \x1b[33mToo Many Requests\x1b[0m`)
            return new Response(`429 Too Many Requests – rate limit exceeded for ${clientIp}`, {
                status: 429
            });
        }

        /*
            'searchDomain' can return either:
                - http://keeweb.info/favicon/keeweb.info            => keeweb.info
                - http://keeweb.info/favicon/https://keeweb.info    => https://keeweb.info

            'url' strips http/s if it exists at the beginnning of searchDomain.
                - http://keeweb.info/favicon/keeweb.info            => keeweb.info
                - http://keeweb.info/favicon/https://keeweb.info    => keeweb.info

            'targetUrl` returns object
                - targetURL.origin
        */

        let favicon = '';
        const url = searchDomain.replace(/^(?:https?:\/\/)?(?:www\.)?/gi, '');
        const targetURL = new URL(url.startsWith('https') ? url : 'https://' + url);

        /*
            check if response already exists in cache
        */

        let response = await cache.match(cacheKey);

        /*
            if no cache hit, call refresh response
        */

        if (!response) {
            response = await fetch(targetURL.origin, init).catch(() => {
                console.log(`\x1b[32m[${workerId}]\x1b[0m FETCH failed to get: \x1b[31m${targetURL.origin}\x1b[0m`)
            });
        }

        /*
            confirm response is valid
        */

        if (response) {
            response = new Response(response.body, response);
            response.headers.set('Access-Control-Allow-Origin', '*');
        }

        /*
            get domain icon short name
        */

        const [ base, iconName ] = handleIconName(targetURL.origin);
        const baseFolder = base.charAt(0);
        const iconPath = `${baseFolder}/${iconName}`;
        const iconUrl = `${serviceBackup}/${baseFolder}/${iconName}.ico`;

        /*
            Icon Overrides > Favicon CDN Repo > Primary

            Checks KeeWeb favicon repo to see if an override favicon has been uploaded.

            this step will take the name of the specified website and clean it up.
                - special characters such as dashes are converted into underscores
                - website domain TLD stripped
                - '.ico' added to the end of the name

                @ex     : reddit.com        => /r/reddit.ico
                          my-domain.com     => /m/my-domain.ico

            after website domain name formatted; can icon will be searched for within the repo:
                - https://github.com/keeweb/favicon-cdn

            if an icon is found in the github cdn repo; it will be used and have priority over other methods.
        */

        const iconRequest = new Request(iconUrl);
        if (iconRequest) {
            console.log(`\x1b[32m[${workerId}]\x1b[0m LOCATE \x1b[33m[cdn]\x1b[0m \x1b[33m${iconUrl}\x1b[0m \x1b[90m|\x1b[0m query by \x1b[32m${clientIp}\x1b[0m`)

            const fetchIcoCdn = await fetch(`${iconUrl}`);
            if (fetchIcoCdn && fetchIcoCdn.status === 200) {
                const resp = new Response(fetchIcoCdn.body, { headers: fetchIcoCdn.headers });

                Object.keys(DEFAULT_SECURITY_HEADERS).map((name) => {
                    resp.headers.set(name, DEFAULT_SECURITY_HEADERS[name]);
                });

                return resp;
            }
        }


        /*
            Icon Overrides > Local > Secondary

            this step handles .ico, .png files registered within the 'iconsOverrideIco' object.
            it is similar to the previous step which loads them from the Github Favicon CDN Repo,
            but this one strictly checks 'iconsOverrideIco' at the top of this file.

            'iconPath' is the first letter of domain as folder, and then domain name without TLD.
                - k/keeweb
                - r/reddit
        */

        if (iconsOverrideIco[iconPath]) {
            // get file extension
            const ext = iconsOverrideIco[iconPath].split(/[#?]/)[0].split('.').pop().trim();

            if (ext === 'png' || ext === 'ico') {
                console.log(`\x1b[32m[${workerId}]\x1b[0m LOCATE \x1b[33m[ico-png-override]\x1b[0m \x1b[33m${iconPath}\x1b[0m \x1b[90m|\x1b[0m query by \x1b[32m${clientIp}\x1b[0m`)

                const fetchIcoPng = await fetch(iconsOverrideIco[iconPath]);
                if (fetchIcoPng.status === 200) {
                    const resp = new Response(fetchIcoPng.body, { headers: fetchIcoPng.headers });
                    Object.keys(DEFAULT_SECURITY_HEADERS).map((name) => {
                        resp.headers.set(name, DEFAULT_SECURITY_HEADERS[name]);
                    });
                    resp.headers.set('Access-Control-Allow-Origin', '*');
                    resp.headers.append('Vary', 'Origin');

                    return resp;
                }
            }
        }

        /*
            Custom SVG Loader

            this shoudl be one of the first steps when processing a favicon.
            any entries in the 'iconsOverrideSvg' object will override any other version of the website's favicon.
        */

        if (iconsOverrideSvg[iconPath]) {
            console.log(`\x1b[32m[${workerId}]\x1b[0m LOCATE \x1b[33m[svg-override]\x1b[0m \x1b[33m${iconPath}\x1b[0m \x1b[90m|\x1b[0m query by \x1b[32m${clientIp}\x1b[0m`)

            let customSvgIcon = new Response(iconsOverrideSvg[iconPath], {
                headers: { 'content-type': 'image/svg+xml' }
            });

            Object.keys(DEFAULT_SECURITY_HEADERS).map((name) => {
                customSvgIcon.headers.set(name, DEFAULT_SECURITY_HEADERS[name]);
            });

            return customSvgIcon;
        }

        /*
            Split url by forward slash.

            should return
            - youtube.com,64
        */

        const iconArgs = url.replace(/\\/g, '/').split('/');

        /*
            url should be in the format:
                - http://services.keeweb.info/favicon/youtube.com/64
                - http://services.keeweb.info/favicon/{DOMAIN}/{ICON_SIZE}

            since users may add long and complex URLs to their vault, check if the 2nd argument
            is a number to represent the icon size; if not, set the default icon size.
        */

        let iconSize = 32;
        if (iconArgs[1] !== undefined && !isNaN(iconArgs[1])) {
            iconSize = iconArgs[1];
        }

        /*
            Find favicon via external service API
        */

        const replacements = { DOMAIN: `${url}`, ICON_SIZE: `${iconSize}` };

        /*
            Replacement strings for service api urls.

            {DOMAIN} will be replaced with the website domain name.
            {ICON_SIZE} will be replaced with the size of the favicon.
        */

        const _serviceQueryUrl = serviceApi.replace(/{(\w+)}/g, (phWithDelims, phNoDelims) =>
            replacements.hasOwnProperty(phNoDelims) ? replacements[phNoDelims] : phWithDelims
        );

        const serviceQueryUrl = `${_serviceQueryUrl}`;
        let serviceResultIcon = await fetch(serviceQueryUrl);

        const ct = serviceResultIcon.headers.get('content-type');

        if (ct.includes('application') || ct.includes('text')) {
            serviceResultIcon = await fetch(`${serviceQueryUrl}`);
        }

        if (serviceResultIcon && serviceResultIcon.status === 200) {
            console.log(`\x1b[32m[${workerId}]\x1b[0m LOCATE \x1b[33m[api]\x1b[0m \x1b[33m${serviceQueryUrl}\x1b[0m \x1b[90m|\x1b[0m query by \x1b[32m${clientIp}\x1b[0m`)

            const resp = new Response(serviceResultIcon.body, {
                headers: {
                    'Content-Type': 'application/json',
                    ...DEFAULT_CORS_HEADERS
                }
            });
            resp.headers.set('Cache-Control', 'max-age=86400');
            resp.headers.set('Content-Type', serviceResultIcon.headers.get('content-type'));
            resp.headers.set('Access-Control-Allow-Origin', '*');
            resp.headers.append('Vary', 'Origin');

            if (favicon.includes(faviconSvg)) {
                return new Response(decodeURI(favicon.split(faviconSvg)[1]), {
                    headers: { 'content-type': 'image/svg+xml' },
                })
            }

            return resp;
        }

        /*
            Load favicon based on html tags
                - <link rel="shortcut icon" href="https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico?v=ec617d715196">
        */

        if (response) {
            let newResponse = new HTMLRewriter()
                .on('link[rel*="icon"]', {
                    async element(element) {
                        if (element.getAttribute('rel') === 'mask-icon' || favicon) return;
                        favicon = element.getAttribute('href');
                        if (favicon.startsWith('/')) {
                            const prefix = favicon.startsWith('//') ? 'https:' : targetURL.origin;
                            favicon = prefix + favicon;
                        } else if (!favicon.startsWith('http')) {
                            favicon = targetURL.origin + '/' + favicon;
                        }
                    }
                })
                .transform(response);

            await newResponse.text();
        }

        /*
            No icon found, get default svg (globe)
        */

        let favicoDefault = new Response(favicoDefaultSvg, {
            headers: { 'content-type': 'image/svg+xml' }
        });

        Object.keys(DEFAULT_SECURITY_HEADERS).map((name) => {
            favicoDefault.headers.set(name, DEFAULT_SECURITY_HEADERS[name]);
        });

        console.log(`\x1b[32m[${workerId}]\x1b[0m LOCATE \x1b[33m[svg-default]\x1b[0m \x1b[31mNo Icon Found\x1b[0m \x1b[90m|\x1b[0m query by \x1b[32m${clientIp}\x1b[0m`)

        return favicoDefault;
    }
};
