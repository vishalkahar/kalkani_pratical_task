const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Use the user routes
app.use('/api', userRoutes);

// Database synchronization
db.sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
