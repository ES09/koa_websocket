const Koa = require('koa');
const Pug = require('koa-pug');
const path = require('path')
const websockify = require('koa-websocket')
const route = require('koa-route')
const static = require('koa-static')
const mount = require('koa-mount')
const mongoClient = require('./mongo')

const app = websockify(new Koa());

new Pug({
    viewPath: path.resolve(__dirname, './views'),
    app: app 
})

app.use(mount('/public', static('src/public')))

app.use(async ctx => {
    await ctx.render('main');
});

const _client = mongoClient.connect();

async function getChatsCollection() {
    const client = await _client;
    return client.db('chat').collection('chats');
}

app.ws.use(
    route.all('/ws', async (ctx) => {
        const chatsCollection = await getChatsCollection();
        const chatsCursor = chatsCollection.find(
            {}, 
            {
                sort : {
                    createdAt : 1, //오름차순 정렬
                }
            }
        );

        const chats = await chatsCursor.toArray();
        ctx.websocket.send(
            JSON.stringify({
                type : 'sync',
                payload : {
                    chats,
                },
            })
        )

        ctx.websocket.on('message', async (data) => {
            const { server } = app.ws;
            if(!server) return

            const chat = JSON.parse(data);
            await chatsCollection.insertOne({
                ...chat,
                createdAt: new Date()
            });
            
            const { nickname, message }  = chat;


            server.clients.forEach(client => {
                client.send(
                    JSON.stringify({
                        type : 'chat',
                        payload : {
                            message,
                            nickname
                        }
                    })
                )
            });
        });
    })
);

app.listen(3000);