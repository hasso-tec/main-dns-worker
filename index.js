export default {
    async fetch(request, env, ctx) {
        const { headers } = request;
        const ip = headers.get('CF-Connecting-IP');
        const userAgent = headers.get('User-Agent');
        const referer = headers.get('Referer') || "Direct";
        const country = headers.get('CF-IPCountry');

        const info = {
            time: Date.now(),
            tzTime: new Date(),
            ip,
            userAgent,
            referer,
            country,
        }

        console.log(JSON.stringify(info, null, 2));

        return new Response('OK', {
            status: 200,
        });
    }
};