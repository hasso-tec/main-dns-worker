export default {
    async fetch(request, env, ctx) {
        const {hostname} = new URL(request.url);
        // Exceptions
        if (
            [
                env.DOMAIN_GRAFANA,
                env.DOMAIN_LOKI,
            ]
                .includes(hostname)) {
            // skip
            return fetch(request);
        }
        const {headers} = request;
        logRequest(headers, hostname, env, ctx);

        // Redirect DOMAIN to DOMAIN_REDIRECT
        /*if (hostname === env.DOMAIN) {
            return Response.redirect(`https://${env.DOMAIN_REDIRECT}`, 301);
        }*/

        // continue
        return fetch(request);
    }
}

function logRequest(headers, hostname, env, ctx) {
    const ip = headers.get('CF-Connecting-IP');
    const userAgent = headers.get('User-Agent');
    const referer = headers.get('Referer') || "Direct";
    const country = headers.get('CF-IPCountry');

    const info = {
        ip,
        userAgent,
        referer,
        hostname,
        country,
    }

    const logEntry = {
        streams: [
            {
                stream: {job: "visitors"},
                values: [
                    [String(Date.now() * 1000000), JSON.stringify(info)]
                ]
            }
        ]
    };

    const lokiUrl = `https://${env.DOMAIN_LOKI}/loki/api/v1/push`;
    const username = env.LOKI_USERNAME;
    const password = env.LOKI_PASSWORD;
    const auth = "Basic " + btoa(`${username}:${password}`);

    ctx.waitUntil(fetch(lokiUrl, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": auth
        },
        body: JSON.stringify(logEntry)
    }));
}