const express = require('express');
const cors = require('cors');

const agentRoutes =
require('./routes/agent.routes');

const app = express();

app.use(cors());
app.use(express.json());


app.get('/',(req,res)=>{
res.send(
'Smollan DevTest API Running'
);
});


app.use(
'/api/agent',
agentRoutes
);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});
module.exports = app;