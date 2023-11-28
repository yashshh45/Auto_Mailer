const express = require("express");
const app = express();
const path = require("path");
const { authenticate } = require("@google-cloud/local-auth");
const fs = require("fs").promises;
const { google } = require("googleapis");

const port = 8080;
// these are the scopes that we want to access
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.labels",
  "https://mail.google.com/",
];

// i kept the label name
const labelName = "Vacation Auto-Reply";

app.get("/", async (req, res) => {
  // here I am taking google GMAIL authentication
  const auth = await authenticate({
    keyfilePath: path.join(__dirname,"credentials.json"),
    scopes: SCOPES,
  });

  // console.log("this is auth",auth)

  // here I am getting authorized Gmail ID
  const gmail = google.gmail({ version: "v1", auth });

  //  here I am finding all the labels available on the current Gmail
  const response = await gmail.users.labels.list({
    userId: "me",
  });

  //  this function is finding all emails that have unreplied or unseen
  async function getUnrepliedMessages(auth) {
    const response = await gmail.users.messages.list({
      userId: "me",
      labelIds: ["INBOX"],
      q: "is:unread",
    });

    return response.data.messages || [];
  }

  //  this function generates the label ID
  async function createLabel(auth) {
    try {
      const response = await gmail.users.labels.create({
        userId: "me",
        requestBody: {
          name: labelName,
          labelListVisibility: "labelShow",
          messageListVisibility: "show",
        },
      });
      return response.data.id;
    } catch (error) {
      if (error.code === 409) {
        const response = await gmail.users.labels.list({
          userId: "me",
        });
        const label = response.data.labels.find(
          (label) => label.name === labelName
        );
        return label.id;
      } else {
        throw error;
      }
    }
  }

  // Function to create a label
  async function createLabel(auth) {
    const label = await gmail.users.labels.create({
      auth,
      userId: "me",
      requestBody: {
        name: labelName,
        labelListVisibility: "labelShow",
        messageListVisibility: "show",
      },
    });

    return label.data.id;
  }

  // Function to get unreplied messages
  async function getUnrepliedMessages(auth) {
    const response = await gmail.users.messages.list({
      auth,
      userId: "me",
      q: "is:unread",
    });

    return response.data.messages || [];
  }

  // Example usage
  const labelId = await createLabel(auth);
  console.log(`Label ${labelId} created`);

  // Repeat in Random intervals
  setInterval(async () => {
    // Get messages that have no prior reply
    const messages = await getUnrepliedMessages(auth);
    console.log('Unreplied messages:', messages);

    // Here I am checking if there are any emails that did not get a reply
    if (messages && messages.length > 0) {
      for (const message of messages) {
        const messageData = await gmail.users.messages.get({
          auth,
          userId: 'me',
          id: message.id,
        });

        const email = messageData.data;
        const hasReplied = email.payload.headers.some(
          (header) => header.name === 'In-Reply-To'
        );

        if (!hasReplied) {
          // Craft the reply message
          const replyMessage = {
            userId: 'me',
            resource: {
              raw: Buffer.from(
                `To: ${email.payload.headers.find(
                  (header) => header.name === 'From'
                ).value}\r\n` +
                  `Subject: Re: ${email.payload.headers.find(
                    (header) => header.name === 'Subject'
                  ).value}\r\n` +
                  'Content-Type: text/plain; charset="UTF-8"\r\n' +
                  'Content-Transfer-Encoding: 7bit\r\n\r\n' +
                  'Thank you for your email. I\'m currently on vacation and will reply to you when I return.\r\n'
              ).toString('base64'),
            },
          };

          await gmail.users.messages.send(replyMessage);

          // Add label and move the email
          await gmail.users.messages.modify({
            auth,
            userId: 'me',
            id: message.id,
            resource: {
              addLabelIds: [labelId],
              removeLabelIds: ['INBOX'],
            },
          });
        }
      }
    }
  }, Math.floor(Math.random() * (120 - 45 + 1) + 45) * 1000);

  // const labels = response.data.labels;
  res.json({ "this is Auth": auth });
});

app.listen(port, () => {
  console.log(` http://localhost:${port}`);
});
