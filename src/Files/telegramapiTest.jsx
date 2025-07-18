import {  useState } from 'react';

const TelegramLogin = () => {
  const [customUsername, setCustomUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const handleLoginClick = () => {
    if (!customUsername.trim()) {
      alert('Please enter your username first');
      return;
    }

    if (scriptLoaded) return; // Prevent duplicate loading

    window.onTelegramAuth = async function (telegramUser) {
      setIsLoading(true);
      try {
        const payload = {
          ...telegramUser,
          customUsername,
        };

        const res = await fetch('http://localhost:5000/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
          alert('Login successful!');
        } else {
          alert('Login failed!');
        }
      } catch (error) {
        alert('An error occurred!');
      } finally {
        setIsLoading(false);
      }
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?7';
    script.setAttribute('data-telegram-login', 'developerAbubakkar'); // Replace this
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-userpic', 'true');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-on-auth', 'onTelegramAuth');
    script.async = true;

    const el = document.getElementById('telegram-login');
    if (el && !el.hasChildNodes()) {
      el.appendChild(script);
      setScriptLoaded(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
        <h2 className="text-white text-xl font-bold mb-6">Login with Telegram</h2>
        <input
          type="text"
          placeholder="Enter your username"
          value={customUsername}
          onChange={(e) => setCustomUsername(e.target.value)}
          className="w-full px-4 py-2 mb-4 rounded-lg border border-white bg-white bg-opacity-20 text-white placeholder-white focus:outline-none"
        />
        <button
          onClick={handleLoginClick}
          className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white py-2 rounded-lg font-semibold transition duration-300"
        >
          Connect Telegram
        </button>
        {isLoading && (
          <div className="mt-4 flex justify-center">
            <div className="w-6 h-6 border-4 border-white border-dotted rounded-full animate-spin" />
          </div>
        )}
        <div id="telegram-login" className="mt-6 flex justify-center" />
      </div>
    </div>
  );
};

export default TelegramLogin;
