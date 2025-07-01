import React, { useEffect, useState } from 'react';
import ForgeReconciler, { CodeBlock } from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
  const [data, setData] = useState({});

  useEffect(() => {
    console.log('in useEffect');
    invoke('getText', { example: 'my-invoke-variable' }).then(setData).catch((e) => console.log(e.message));
  }, []);

  // use CodeBlock component to display user data from Google API
  console.log('returning from invoking getText')
  return (
    <CodeBlock text={JSON.stringify(data, null, 2)} language="json" showLineNumbers />  
  );

};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);