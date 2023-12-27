import './Messages.css'

import React from 'react';
import ScrollToBottom from 'react-scroll-to-bottom'

const Messages = (messages, name) => {
    <ScrollToBottom>
          {messages.map((message, i) => <div key={i}><Message message={message} name={name}></Message></div>)}  
    </ScrollToBottom>
}

export default Messages