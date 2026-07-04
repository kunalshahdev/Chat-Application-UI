const contacts = [
  { id: 1, name: 'Riya' },
  { id: 2, name: 'Aryan' },
];

const colors = ['#6366f1', '#14b8a6'];

const statusText = {
  1: 'Online',
  2: 'last seen 2 hours ago',
};

const chats = {
  1: [
    { text: 'Good morning. How are you?', sent: false, time: '10:24 AM' },
    { text: 'I am fine. Thank you.', sent: true, time: '10:26 AM' },
    { text: 'The meeting has been rescheduled to 3 PM.', sent: false, time: '10:27 AM' },
    { text: 'Noted. I will be there on time.', sent: true, time: '10:28 AM' },
    { text: 'Please bring the report with you.', sent: false, time: '10:29 AM' },
    { text: 'Sure. I will bring it.', sent: true, time: '10:30 AM' },
  ],
  2: [
    { text: 'Did you complete the assigned work?', sent: false, time: '9:15 AM' },
    { text: 'Yes. It is almost done.', sent: true, time: '9:18 AM' },
    { text: 'Please share the update by evening.', sent: false, time: '9:20 AM' },
    { text: 'I will share it before 6 PM.', sent: true, time: '9:22 AM' },
  ],
};

const lastMsg = {
  1: { text: 'Sure. I will bring it.', time: '10:30 AM', unread: 2 },
  2: { text: 'I will share it before 6 PM.', time: '9:22 AM', unread: 0 },
};

let activeId = null;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function getInitials(name) {
  return name.charAt(0).toUpperCase();
}

function renderSidebar(filter = '') {
  const list = document.getElementById('conversationList');
  const q = filter.toLowerCase().trim();

  list.innerHTML = contacts
    .filter(c => !q || c.name.toLowerCase().includes(q))
    .map(c => {
      const lm = lastMsg[c.id];
      const color = colors[c.id - 1];
      const active = activeId === c.id;
      const online = statusText[c.id] === 'Online';
      return `
        <div class="conversation${active ? ' active' : ''}" data-id="${c.id}">
          <div class="avatar" style="background:${color}">
            ${getInitials(c.name)}
            ${online ? '<span class="status-dot online"></span>' : ''}
          </div>
          <div class="conv-info">
            <div class="conv-top">
              <span class="conv-name">${c.name}</span>
              <span class="conv-time">${lm.time}</span>
            </div>
            <div class="conv-preview">${lm.text}</div>
          </div>
          ${lm.unread > 0 ? `<span class="unread-badge">${lm.unread}</span>` : ''}
        </div>
      `;
    })
    .join('');

  $$('.conversation').forEach(el => {
    el.addEventListener('click', () => openChat(parseInt(el.dataset.id)));
  });
}

function renderMessages(id) {
  const msgs = chats[id];
  const list = document.getElementById('messageList');

  list.innerHTML = msgs.map((m, i) => {
    const divider = i === 0 ? '<div class="message-divider">Today</div>' : '';
    return `
      ${divider}
      <div class="message ${m.sent ? 'sent' : 'received'}">
        ${m.text}
        <span class="msg-time">${m.time}</span>
      </div>
    `;
  }).join('');

  list.scrollTop = list.scrollHeight;
}

function openChat(id) {
  activeId = id;
  renderSidebar(document.getElementById('searchInput').value);

  const contact = contacts.find(c => c.id === id);
  const color = colors[id - 1];

  document.getElementById('emptyState').classList.add('hidden');
  document.getElementById('chatView').classList.remove('hidden');

  const avatarEl = document.getElementById('chatAvatar');
  avatarEl.textContent = getInitials(contact.name);
  avatarEl.style.background = color;

  document.getElementById('chatName').textContent = contact.name;

  const statusEl = document.getElementById('chatStatus');
  statusEl.textContent = statusText[id];
  statusEl.className = `status-text${statusText[id] === 'Online' ? ' online' : ''}`;

  lastMsg[id].unread = 0;
  renderMessages(id);
  renderSidebar(document.getElementById('searchInput').value);
}

function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  if (!text || !activeId) return;

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const list = document.getElementById('messageList');

  const div = document.createElement('div');
  div.className = 'message sent';
  div.innerHTML = `${text}<span class="msg-time">${time}</span>`;
  list.appendChild(div);
  list.scrollTop = list.scrollHeight;

  chats[activeId].push({ text, sent: true, time });
  lastMsg[activeId] = { text, time, unread: 0 };

  input.value = '';
  renderSidebar(document.getElementById('searchInput').value);

  const typing = document.getElementById('typingIndicator');
  typing.classList.remove('hidden');

  setTimeout(() => {
    const reply = getAutoReply();
    const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const replyDiv = document.createElement('div');
    replyDiv.className = 'message received';
    replyDiv.innerHTML = `${reply}<span class="msg-time">${replyTime}</span>`;
    list.appendChild(replyDiv);
    list.scrollTop = list.scrollHeight;

    chats[activeId].push({ text: reply, sent: false, time: replyTime });
    lastMsg[activeId] = { text: reply, time: replyTime, unread: 0 };
    typing.classList.add('hidden');
    renderSidebar(document.getElementById('searchInput').value);
  }, 1500 + Math.random() * 1500);
}

function getAutoReply() {
  const replies = [
    'Achha, sounds good!',
    'Dekhte hain, let me check.',
    'Haha, nice one! 😄',
    'Bilkul, perfect!',
    'Baad mein karte hain?',
    "I'll get back to you on that.",
    'Theek hai, thanks!',
    'Haan, I agree.',
    'Koi nahin, no worries!',
    'Bohat achha! 👍',
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

document.getElementById('sendBtn').addEventListener('click', sendMessage);

document.getElementById('messageInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});

document.getElementById('searchInput').addEventListener('input', e => {
  renderSidebar(e.target.value);
});

document.getElementById('newChatBtn').addEventListener('click', () => {
  const others = contacts.filter(c => c.id !== activeId);
  const pick = others[Math.floor(Math.random() * others.length)];
  if (pick) openChat(pick.id);
});

renderSidebar();
