const express = require('express');
const cors = require('cors');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const OpenApiValidator = require('express-openapi-validator');

const auth = require('./auth');
const mail = require('./mail');


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const apiSpec = path.join(__dirname, '../api/openapi.yaml');

const apidoc = yaml.safeLoad(fs.readFileSync(apiSpec, 'utf8'));

app.use('/v0/api-docs', swaggerUi.serve, swaggerUi.setup(apidoc));
app.post('/v0/authenticate', auth.authenticate);


app.use(
    OpenApiValidator.middleware({
      apiSpec: apiSpec,
      validateRequests: true,
      validateResponses: true,
    }),
);

// Your routes go here
app.get('/v0/mail', auth.check, mail.getMailbox);
app.get('/v0/mailboxes', auth.check, mail.getMailboxes);
app.post('/v0/mail/:id', auth.check, mail.postMail);
app.post('/v0/mail', auth.check, mail.postNewMail);
app.get('/v0/user', auth.check, mail.getUser);
app.post('/v0/user', auth.check, mail.postUser);




app.use((err, req, res, next) => {
  res.status(err.status).json({
    message: err.message,
    errors: err.errors,
    status: err.status,
  });
});

module.exports = app;
