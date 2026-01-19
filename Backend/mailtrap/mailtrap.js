const { MailtrapClient } = require("mailtrap");
const dotenv = require("dotenv");

dotenv.config();

const TOKEN = process.env.MAILTRAP_TOKEN;
const ENDPOINT = process.env.MAILTRAP_ENDPOINT;

const client = new MailtrapClient({
  endpoint: ENDPOINT,
  token: TOKEN,
});

const sender = {
  email: "hello@demomailtrap.co",
  name: "Learnify",
};

module.exports = {
  client,
  sender,
};


