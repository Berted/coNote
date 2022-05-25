import React from 'react';
import { BoldExtension, ItalicExtension, UnderlineExtension } from 'remirror/extensions';
import { Remirror, useRemirror } from '@remirror/react';

const extensions = () => [new BoldExtension(), new ItalicExtension(), new UnderlineExtension()];

const Editor = () => {
  const { manager, onChange, state } = useRemirror({
    extensions,
    content: '<p>Hi <strong>Friend</strong></p>',
    stringHandler: 'html',
    selection: 'end',
  });

  return <Remirror onChange={onChange} manager={manager} initialContent={state} />;
};

export default Editor;