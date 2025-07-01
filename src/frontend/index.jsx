import React, { useEffect, useState, Fragment } from 'react';
import ForgeReconciler, { Text, CodeBlock } from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
  const [profileData, setProfileData] = useState({});
  const [messagesData, setMessagesData] = useState({});
  const [singleMessageData, setSingleMessageData] = useState({});

  useEffect(() => {
    console.log('in useEffect');
    invoke('getProfile', { example: 'my-invoke-variable' })
      .then(setProfileData)
      .catch((e) => console.log(e.message));

    invoke('getEmailMessages', { example: 'my-invoke-variable' })
      .then(response => {
        setMessagesData(response); // set the list of messages

        // check if messages were returned and if there's at least one message
        if (response && response.messages && response.messages.length > 0) {
          // get ID of the first message in the list
          const firstMessageId = response.messages[0].id;
          console.log('Attempting to fetch single message for ID:', firstMessageId);

          // use the firstMessageId to call getSingleMessage
          invoke('getSingleMessage', { messageId: firstMessageId })
            .then(setSingleMessageData) // set the data for the single message
            .catch((e) => console.log(e.message));
        } else {
          console.log('No message ID found.')
        }
      })
      .catch((e) => {
        console.log('Error getting Email Messages.');
        console.log(e.message)
      });

    }, []); // empty dependency array to run only once on mount;

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

      <Text content='1st MESSAGE' />
      <CodeBlock 
        text={JSON.stringify(singleMessageData, null, 2)}
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


