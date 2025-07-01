import Resolver from '@forge/resolver';
import { api } from "@forge/api";
import { requestJira } from "@forge/bridge"; 

const resolver = new Resolver();

// add 'async' to be able to wait for the promises inside to resolve
resolver.define('getProfile', async (req) => {
  // call the external APIs
  //console.log('req', req);
  //console.log(api);
  const google = api.asUser().withProvider('google', 'google-apis')

  if (!await google.hasCredentials()) {
    await google.requestCredentials()
  }

  const response = await google.fetch('/userinfo/v2/me');
  //console.log('response from google fetch: ', response);

  // return the user's name
  if (response.ok) {
    const userInfo = await response.json();
    return userInfo;
  }

  // return the error response
  return {
    status: response.status,
    statusText: response.statusText,
    text: await response.text(),
  }

});

// function to get messages frm Gmail inbox
resolver.define('getEmailMessages', async (req) => {
  // define required scope for reading Gmail messsages
  const GMAIL_READONLY_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';
  // Get the Google API client for the current user, specifying the Gmail scope
  const google = api.asUser().withProvider('google', 'google-apis', GMAIL_READONLY_SCOPE)

  // Check if credentials exist for the specified scope, if not, request them. The user will be prompted to grant access to their Gmail data
  if (!await google.hasCredentials()) {
    await google.requestCredentials()
  }

  // Fetch a list of messages from the inbox
  const response = await google.fetch('/gmail/v1/users/me/messages?maxResults=5');
  console.log('response from google fetch: ', response);

  // If the response is successful, parse and return the messages
  if (response.ok) {
    const messages = await response.json();
    console.log('MESSAGES RETURNED:', messages);
    return messages;
  }

  // return the error response
  return {
    status: response.status,
    statusText: response.statusText,
    text: await response.text(),
  }

});


resolver.define("getSingleMessage", async (req) => {
  // Define the required scope for reading Gmail messages
  const GMAIL_READONLY_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';

  // Get the Google API client for the current user, specifying the Gmail scope
  const google = api.asUser().withProvider('google', 'google-apis', GMAIL_READONLY_SCOPE);

  // Check if credentials exist for the specified scope, if not, request them.
  // The user will be prompted to grant access to their Gmail data if they haven't already.
  if (!await google.hasCredentials()) {
    await google.requestCredentials();
  }

  // Extract message ID from the request payload ( the client-side will pass the messageId in the payload, e.g., invoke('getSingleMessage', { messageId: '...' }) )
  const { messageId } = req.payload;

  // Basic validation: ensure messageId is provided
  if (!messageId) {
    return {
      status: 400,
      statusText: "Bad Request",
      text: "Message ID is required in the request payload.",
    };
  }

  // Construct the API endpoint URL for fetching a single message with full format ( example: /gmail/v1/users/me/messages/YOUR_MESSAGE_ID?format=full )
  const response = await google.fetch(`/gmail/v1/users/me/messages/${messageId}?format=full`);
  console.log(`Response from Google fetch for message ID ${messageId}:`, response);

  // If the response is successful, parse and return the message data
  if (response.ok) {
    const message = await response.json();
    console.log(`Message with ID ${messageId} returned:`, message);
    
    // extract content from full message
    const {id, snippet} = message;
    const filteredMessage = { id, snippet };
    console.log(`Extract message ID: ${id}, and snippet: ${snippet}`);
    return filteredMessage;

  }

  resolver.define("postComment", async (req, commentBody) => {
    console.log("postComment function");

    // TODO: call JIRA API to add comment to the issue
    let bodyData = `{
      "body": "${commentBody}",
      "visibility": {
        "identifier": "Administrators",
        "type": "role",
        "value": "Administrators"
      }
    }`;

    // TODO: get this value (hardcoded for now)
    let issueKey = "CS-2"; // req.issue.id;

    const response = await requestJira(route`/rest/api/2/issue/${issueKey}/comment`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: bodyData,
      });

    console.log(`Response: ${response.status} ${response.statusText}`);
    console.log(await response.json());
  });

  // If there's an error, return the error details
  return {
    status: response.status,
    statusText: response.statusText,
    text: await response.text(),
  };
});


export const handler = resolver.getDefinitions();
