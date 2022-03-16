const server = require('./app.js');

server.listen(server.get('port'), () => {
    console.info("listening port : ", server.get('port'));
});