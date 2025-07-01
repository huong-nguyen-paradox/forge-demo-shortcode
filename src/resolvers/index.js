import Resolver from '@forge/resolver';
import api from "@forge/api";

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

export const handler = resolver.getDefinitions();
