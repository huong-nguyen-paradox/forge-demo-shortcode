import React, { useEffect, useState, Fragment } from 'react';
import ForgeReconciler, { Text, CodeBlock } from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
  const [profileData, setProfileData] = useState({});
  const [messagesData, setMessagesData] = useState({});

  useEffect(() => {
    console.log('in useEffect');
    invoke('getProfile', { example: 'my-invoke-variable' }).then(setProfileData).catch((e) => console.log(e.message));
    invoke('getEmailMessages', { example: 'my-invoke-variable' }).then(setMessagesData).catch((e) => console.log(e.message));
  }, []);

  // use CodeBlock component to display user data from Google API
  return (
    <Fragment>
      <Text content='PROFILE' />
      <CodeBlock
        text={JSON.stringify(profileData, null, 2)}
        language="json"
        showLineNumbers
      />
      <Text content='MESSAGES' />
      <CodeBlock
        text={JSON.stringify(messagesData, null, 2)}
        language="json"
        showLineNumbers
      />
    </Fragment>
  );

};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


