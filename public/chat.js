const messageToHtml = message => `
  <li>
    <header class="spread">
      <span class="author">${message.name}</span>
      <time>${new Date(message.created_at).toLocaleString()}</time>
    </header>
    <p>
      ${message.content}
    </p>
  </li>
`;

function loadMessages() {
  const callback = rawResponse => {
    const messages = JSON.parse(rawResponse);
    const html = messages.map(messageToHtml).join('');
    const el = document.querySelector('.messages');
    el.innerHTML = html;
    el.scrollTop = el.scrollHeight;
  };
  send('/messages', 'GET', null, callback);
}

function createMessage(event) {
  event.preventDefault();
  const input = document.querySelector('.message-form > input');
  const json = JSON.stringify({ message: input.value });

  const callback = () => {
    input.value = '';
    loadMessages();
  };
  send('/messages', 'POST', json, callback);
}

document
  .querySelector('.message-form')
  .addEventListener('submit', createMessage);

function send(url, method, data, callback) {
  const req = new XMLHttpRequest();

  req.onreadystatechange = () => {
    if (req.readyState == 4) {
      const json = req.response;
      callback(json);
    }
  };
  req.open(method, url);
  if (method === 'POST') {
    req.setRequestHeader('Content-Type', 'application/json');
  }
  req.send(data);
}

// initially load all messages
loadMessages();
