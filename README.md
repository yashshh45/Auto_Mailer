# Auto Mailer Node.js App

Auto Mailer is a Node.js application that automates email responses using the Gmail API. It checks for new emails in a specified Gmail account, sends replies to emails that have no prior replies, and adds a label to the emails, moving them to the labeled category in Gmail.

## Features

1. **Gmail Authentication:** The app uses the Gmail API and authenticates with the Google Cloud Platform to access Gmail functionalities.

2. **Label Creation:** It creates a label named "Vacation Auto-Reply" to categorize and organize the replied emails.

3. **Reply Automation:** The app identifies emails that have not received a reply and automatically sends a predefined response.

4. **Labeling and Moving:** After sending a reply, the app adds the "Vacation Auto-Reply" label to the email and moves it out of the inbox.

5. **Randomized Interval:** The app repeats the entire process at random intervals between 45 to 120 seconds.

## Getting Started

To run the Auto Mailer app, follow these steps:

1. Install the required dependencies:
   ```bash
   npm install
   ```

2. Make sure you have a `credentials.json` file in the project directory, containing the necessary credentials for Google Cloud Platform.

3. Start the application:
   ```bash
   npm start
   ```

4. Access the application at [http://localhost:8080](http://localhost:8080).

## Configuration

You can modify the following parameters in the `index.js` file:

- **labelName:** Change the label name as per your preference.
- **SCOPES:** Adjust the Gmail API scopes based on your requirements.
- **Randomized Interval:** Modify the interval for checking and responding to emails.

## Dependencies

- [Express](https://www.npmjs.com/package/express): Web application framework for Node.js.
- [@google-cloud/local-auth](https://www.npmjs.com/package/@google-cloud/local-auth): Library for authenticating with Google services locally.
- [googleapis](https://www.npmjs.com/package/googleapis): Official Node.js library for Google APIs.

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.
