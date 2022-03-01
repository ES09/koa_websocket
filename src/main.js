const Koa = require('koa');
const Pug = require('koa-pug');
const path = require('path')
const websockify = require('koa-websocket')
const route = require('koa-route')
const static = require('koa-static')
const mount = require('koa-mount')

const app = websockify(new Koa());

new Pug({
    viewPath: path.resolve(__dirname, './views'),
    app: app 
})

app.use(mount('/public', static('src/public')))

app.use(async ctx => {
    await ctx.render('main');
});

app.ws.use(
    route.all('/ws', (ctx) => {
    // `ctx` is the regular koa context created from the `ws` onConnection `socket.upgradeReq` object.
    // the websocket is added to the context on `ctx.websocket`.
        ctx.websocket.on('message', (data) => {

            const { server } = app.ws;
            if(!server) return

            const { message, nickname } = JSON.parse(data)

            server.clients.forEach(client => {
                client.send(
                    JSON.stringify({
                        message,
                        nickname
                    })
                )
            });
        });
}));

app.listen(3000);