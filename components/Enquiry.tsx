'use client';

import { useState, type ChangeEvent } from 'react';

// Set the business WhatsApp number here, digits only with country code (for example 9715XXXXXXXX).
const WHATSAPP = '';
const INSTAGRAM = 'https://www.instagram.com/desert_safari_auh';
const EXPERIENCES = ['Evening Safari & BBQ', 'Morning Safari', 'Overnight Camp', 'Private & VIP'];

export default function Enquiry() {
  const [f, setF] = useState({ name: '', date: '', exp: EXPERIENCES[0], pax: '2', msg: '' });
  const [status, setStatus] = useState(
    WHATSAPP ? 'Your enquiry opens in WhatsApp, ready to send.' : 'Copy your message, then paste it into our Instagram chat.',
  );
  const set = (k: keyof typeof f) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });
  const text =
    `Hello Desert Safari AUH, I would like to book the ${f.exp} for ${f.pax || '2'} guest(s)` +
    (f.date ? ` on ${f.date}` : '') + '.' +
    (f.name ? ` Name: ${f.name}.` : '') +
    (f.msg ? ` Notes: ${f.msg}` : '');
  const copy = () => (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject());

  return (
    <form id="form" autoComplete="off" className="rise" onSubmit={(e) => e.preventDefault()}>
      <div className="two">
        <label htmlFor="name">Your name<input id="name" placeholder="Full name" value={f.name} onChange={set('name')} /></label>
        <label htmlFor="date">Preferred date<input id="date" type="date" value={f.date} onChange={set('date')} /></label>
      </div>
      <div className="two">
        <label htmlFor="exp">Experience
          <select id="exp" value={f.exp} onChange={set('exp')}>
            {EXPERIENCES.map((x) => <option key={x}>{x}</option>)}
          </select>
        </label>
        <label htmlFor="pax">Guests<input id="pax" type="number" min="1" max="60" value={f.pax} onChange={set('pax')} /></label>
      </div>
      <label htmlFor="msg">Anything we should know
        <textarea id="msg" rows={2} placeholder="Hotel area, children, dietary needs, celebration…" value={f.msg} onChange={set('msg')} />
      </label>
      <div className="actions">
        <a
          className="btn"
          id="send"
          href={WHATSAPP ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}` : INSTAGRAM}
          target="_blank"
          rel="noopener"
          onClick={() => {
            if (!WHATSAPP) copy().catch(() => {});
          }}
        >
          {WHATSAPP ? 'Send on WhatsApp' : 'Message on Instagram'}
        </a>
        <button
          className="btn ghost"
          type="button"
          id="copy"
          onClick={() =>
            copy().then(
              () => setStatus('Message copied. Paste it into the chat.'),
              () => setStatus('Copy was blocked. Select the details and send them manually.'),
            )
          }
        >
          Copy message
        </button>
      </div>
      <p className="fine" id="status" role="status">{status}</p>
    </form>
  );
}
