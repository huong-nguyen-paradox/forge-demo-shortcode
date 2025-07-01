import Resolver from '@forge/resolver';
import api from "@forge/api";

const resolver = new Resolver();

// add 'async' to be able to wait for the promises inside to resolve
resolver.define('getText', async (req) => {
  // call the external APIs
  console.log('sin chow chi');
  console.log('req', req);
  console.log(api);
  const google = api.asUser().withProvider('google', 'google-apis')
  console.log('api var instaintiated: ', google);

  if (!await google.hasCredentials()) {
    await google.requestCredentials()
  }

  const response = await google.fetch('/userinfo/v2/me');
  console.log('response from google fetch: ', response);

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

export const handler = resolver.getDefinitions();