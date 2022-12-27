// import bot from './assets/bot.svg';
import bot from './assets/bot4.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container')
const restrictWords = ['your name', 'clear']


let loadInterval;


function loader(element) {
  element.textContent = 'typing';
  loadInterval = setInterval(() => {
    if (element.textContent === 'typing....') {
      element.textContent = ''
    } else {
      element.textContent += '.';
    }
  }, 300)
}


function typeText(element, text) {
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval)
    }
  }, 20)
}


function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);
  return `id-${timestamp}-${hexadecimalString}`;
}


function chatStripe(isAi, value, uniqueId) {
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img 
            src="${isAi ? bot : user}"
            alt="${isAi ? 'bot' : 'user'}"
          />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>
    `
  )
}


const handleSubmit = async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const isRestricted = restrictWords.find(x => data.get('prompt').includes(x));
  console.log({isRestricted});
  if (isRestricted) {
    const restrictedIndex = restrictWords.findIndex(x => x === isRestricted);
    if (restrictedIndex === 0) {
      const uniqueId = generateUniqueId();
      chatContainer.innerHTML += chatStripe(true, "My name is Brownie 🤖", uniqueId); 
      return;
    } 

    if (restrictedIndex === 1) {
      chatContainer.innerHTML = '';
      return;
    }
  }
  // if (data.get('prompt'))
 
  // generate user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'), generateUniqueId())
  form.reset();
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, "", uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);
  // fetch data from server
  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })
  clearInterval(loadInterval);
  messageDiv.innerHTML = ''

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim()
    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();
    messageDiv.innerHTML = 'Something Went wrong'
  }

}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
})
document.addEventListener("DOMContentLoaded", function() {
  console.log('init')
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, "Hi, I'm Brownie, Your AI friend, Ask me whatever you want 😁", uniqueId);
});
