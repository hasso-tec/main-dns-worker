export default {
    async fetch(request, env, ctx) {
        const {hostname} = new URL(request.url);
        if (
            [
                env.GRAFANA_URL,
                env.LOKI_URL,
            ]
                .includes(hostname)) {
            // skip
            return fetch(request);
        }

        const {headers} = request;
        const ip = headers.get('CF-Connecting-IP');
        const userAgent = headers.get('User-Agent');
        const referer = headers.get('Referer') || "Direct";
        const country = headers.get('CF-IPCountry');

        const info = {
            ip,
            userAgent,
            referer,
            country,
        }

        const log = JSON.stringify(info);
        const logEntry = {
            streams: [
                {
                    stream: {job: "visitors"},
                    values: [
                        [String(Date.now() * 1000000), log]
                    ]
                }
            ]
        };
        const logData = JSON.stringify(logEntry);

        const lokiUrl = `https://${env.LOKI_URL}/loki/api/v1/push`;
        const username = env.LOKI_USERNAME;
        const password = env.LOKI_PASSWORD;
        const auth = "Basic " + btoa(`${username}:${password}`);

        ctx.waitUntil(fetch(lokiUrl, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": auth
            },
            body: logData
        }));

        // continue
        return fetch(request);
    }
};