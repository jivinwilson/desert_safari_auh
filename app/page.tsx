import { Fragment, type CSSProperties } from 'react';
import { preload } from 'react-dom';
import Enquiry from '@/components/Enquiry';
import Gallery from '@/components/Gallery';
import Journey from '@/components/Journey';
import { GALLERY } from '@/lib/gallery';

const h = (v: string) => ({ '--h': v }) as CSSProperties;

function W({ t, from = 0 }: { t: string; from?: number }) {
  return t.split(' ').map((w, i) => (
    <Fragment key={i}>
      {i > 0 && ' '}
      <span className="w" style={{ '--i': from + i } as CSSProperties}>{w}</span>
    </Fragment>
  ));
}

const CREDITS = [
  ['Caravan: Merzougaloisirs', 'Cavalier_de_chameaux_au_passage_dans_une_dune_de_sable_au_Maroc.jpg', 'CC BY-SA 4.0'],
  ['Riders: Fbrandao.1963', 'Vacations_-_Camel_ride_in_Sahara_Desert_(Morroco).jpg', 'CC BY-SA 4.0'],
  ['Last light: NPS / Debra Miller, Great Sand Dunes', 'Dunes_at_sunset_along_the_southern_edge_of_the_dune_field_in_Great_Sand_Dunes_National_Park._NPS-Debra_Miller_(18659276586).jpg', 'public domain'],
  ['Tent: Cindy Chen', 'Glamping_(Unsplash).jpg', 'CC0'],
  ['Campfire: twiga-swala, Wadi Rum', 'Bedouin_Campfire_Conversations,_Wadi_Rum.jpg', 'CC BY-SA 2.0'],
  ['Milky Way: Chrdoerr, Al Quaa', 'Mesmerising_natural_beauty_-_the_milky_way_and_the_desert_at_Al_Quaa.jpg', 'CC BY-SA 4.0'],
];
const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${file}`;

const HERO = { as: 'image', type: 'image/webp', fetchPriority: 'high' } as const;

export default function Home() {
  // Matches tierSuffix() in lib/journey.ts so the hero texture is fetched once.
  preload('/assets/sunrise-m.webp', { ...HERO, media: '(max-width:819px)' });
  preload('/assets/sunrise-l.webp', { ...HERO, media: '(min-width:820px) and (max-width:1333px), (min-width:820px) and (max-width:2000px) and (max-resolution:1.49dppx)' });
  preload('/assets/sunrise.webp', { ...HERO, media: '(min-width:1334px) and (min-resolution:1.5dppx), (min-width:2001px)' });
  return (
    <>
      <Journey />

      <nav id="nav" aria-label="Main">
        <a className="logo" href="#top">Desert Safari <b>AUH</b></a>
        <ul id="menu">
          <li><a className="lnk" href="#why">Why Us</a></li>
          <li><a className="lnk" href="#experiences">Experiences</a></li>
          <li><a className="lnk" href="#evening">The Evening</a></li>
          {GALLERY.length > 0 && <li><a className="lnk" href="#gallery">Gallery</a></li>}
          <li><a className="lnk" href="#book">Book</a></li>
        </ul>
        <div className="navr">
          <a className="lnk reserve" href="#book" style={{ color: 'var(--gold)' }}>Reserve</a>
          <button className="lnk" id="menuBtn" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
        </div>
      </nav>

      <div className="hud" aria-hidden="true">
        <span><time id="clock">06:12</time><span id="chap">Sunrise</span></span>
        <span className="place">24.4539° N &nbsp; 54.3773° E</span>
      </div>

      <main>
        <section id="top" className="hero beat" data-img="0" data-at="06:12" data-name="Sunrise" style={h('190svh')}>
          <div className="frame bl">
            <div className="copy">
              <p className="eyebrow">Abu Dhabi &nbsp;·&nbsp; Empty Quarter &nbsp;·&nbsp; Since the first sunset</p>
              <h1 className="split"><W t="Where Abu Dhabi turns to" /> <em><W t="gold." from={5} /></em></h1>
              <p className="lead">Private and group desert safaris led by local drivers. Chase the dunes at golden hour, dine by lantern light and sleep under a sky with no city in it.</p>
              <div className="cta">
                <a className="btn" href="#book">Plan my safari</a>
                <a className="btn ghost" href="#experiences">See experiences</a>
              </div>
            </div>
          </div>
        </section>

        <section data-img="1" data-at="08:30" data-name="Into the dunes">
          <div className="beat" style={h('170svh')} data-dim=".2">
            <div className="frame ml">
              <div className="copy">
                <p className="kicker">The road ends here</p>
                <h2 className="split"><W t="Past the last fence, the sand" /> <em><W t="takes over." /></em></h2>
              </div>
            </div>
          </div>
          <div className="beat" style={h('170svh')} data-dim=".3">
            <div className="frame bl">
              <div className="copy fact">
                <p className="kicker">Liwa, ahead</p>
                <h2 className="split"><strong><W t="Tal Moreeb" /></strong></h2>
                <p className="body">Abu Dhabi&apos;s Liwa region holds some of the highest dunes on earth, rising to roughly 300 metres. Ask about our longer Liwa and Empty Quarter journeys for a desert few visitors ever see.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="why" data-img="2" data-at="15:30" data-name="The caravan">
          <div className="beat" style={h('200svh')} data-dim=".24">
            <div className="frame tr">
              <div className="copy">
                <p className="kicker">Why travellers return</p>
                <h2 className="split"><W t="Built by people who" /> <em><W t="grew up" /></em> <W t="on this sand." /></h2>
                <p className="body">Small groups, honest pricing and drivers who know which dune to take at which hour.</p>
              </div>
            </div>
          </div>
          <div className="block" data-dim=".58">
            <div className="inner row3">
              <article className="rise"><h3>Local drivers</h3><p>Experienced, licensed desert drivers who read the sand and put safety before spectacle.</p></article>
              <article className="rise"><h3>Door-to-door</h3><p>Hotel and residence pick-up and drop-off so the only driving you think about is on the dunes.</p></article>
              <article className="rise"><h3>Made for everyone</h3><p>Gentle routes for families and children, full-throttle runs for thrill seekers. Say the word.</p></article>
            </div>
          </div>
        </section>

        <section id="experiences" data-img="3" data-at="16:15" data-name="The caravan">
          <div className="beat" style={h('130svh')}><div className="frame" /></div>
          <div className="block" data-dim=".66">
            <div className="inner">
              <div className="head">
                <div>
                  <p className="kicker">Four ways into the sand</p>
                  <h2 className="split"><W t="Choose your" /> <em><W t="hour" /></em> <W t="in the desert." /></h2>
                </div>
                <p className="sub">From a sunrise run to a full night in camp, every safari includes hotel transfer, a 4x4 with an experienced driver and refreshments on arrival.</p>
              </div>
              <div className="rows">
                <article className="xp rise"><span className="t">06:00 – 10:30</span><h3>Morning Safari</h3><p>Cool air, soft light and empty dunes. Ideal for photography and for travellers short on evenings.</p><ul><li>Dune bashing</li><li>Sandboarding</li><li>Camel ride</li></ul></article>
                <article className="xp rise"><span className="t">15:00 – 21:30</span><h3><small>Most booked</small>Evening Safari &amp; BBQ</h3><p>Dunes at golden hour, then a camp dinner with live Tanoura and belly dance under the stars.</p><ul><li>Sunset photo stop</li><li>BBQ dinner</li><li>Henna &amp; shisha</li></ul></article>
                <article className="xp rise"><span className="t">15:00 – 09:00 next day</span><h3>Overnight Camp</h3><p>Stay in a private tent, wake to sunrise on the dunes and have breakfast before the drive back.</p><ul><li>Dinner &amp; breakfast</li><li>Stargazing</li><li>Private tent</li></ul></article>
                <article className="xp rise"><span className="t">Flexible</span><h3>Private &amp; VIP</h3><p>Your own 4x4, your own pace. Families, couples, proposals and corporate groups, all arranged around you.</p><ul><li>Private vehicle</li><li>Custom route</li><li>Quad bikes on request</li></ul></article>
              </div>
            </div>
          </div>
        </section>

        <section id="evening" data-img="4" data-at="17:00" data-name="Last light">
          <div className="beat" style={h('170svh')}>
            <div className="frame ml">
              <div className="copy">
                <p className="kicker">A typical evening</p>
                <h2 className="split"><W t="From last light to" /> <em><W t="first star." /></em></h2>
              </div>
            </div>
          </div>
          <div className="block" data-dim=".5">
            <ol className="inner log" style={{ padding: 0 }}>
              <li className="rise"><time>15:00</time><div><h3>Pick-up</h3><p>Your driver meets you at your Abu Dhabi hotel or home in an air-conditioned 4x4.</p></div></li>
              <li className="rise"><time>16:15</time><div><h3>Into the dunes</h3><p>Tyres are let down for grip, then the drive begins: steep crests, long slides and a few held breaths.</p></div></li>
              <li className="rise"><time>17:45</time><div><h3>Sunset stop</h3><p>Out of the car and onto the ridge. The sand turns from gold to copper to rose in about ten minutes.</p></div></li>
            </ol>
          </div>
        </section>

        <section data-img="5" data-at="18:30" data-name="The camp">
          <div className="beat" style={h('190svh')}>
            <div className="frame tr">
              <div className="copy">
                <time className="big-time">18:30</time>
                <h2 className="split"><W t="Camp" /> <em><W t="arrival." /></em></h2>
                <p className="body">Arabic coffee, dates, camel rides, sandboarding, henna painting and falcon photos while the fires are lit.</p>
              </div>
            </div>
          </div>
          <div className="beat" style={h('160svh')}>
            <div className="frame tr">
              <div className="copy">
                <time className="big-time">19:30</time>
                <h2 className="split"><W t="Dinner under" /> <em><W t="lanterns." /></em></h2>
                <p className="body">Grilled meats, fresh salads and vegetarian dishes served at low tables on the sand.</p>
              </div>
            </div>
          </div>
        </section>

        <section data-img="6" data-at="20:30" data-name="The fire">
          <div className="beat" style={h('190svh')}>
            <div className="frame tr">
              <div className="copy">
                <time className="big-time">20:30</time>
                <h2 className="split"><W t="Tanoura &" /> <em><W t="stars." /></em></h2>
                <p className="body">Live performance by the fire, then quiet.</p>
              </div>
            </div>
          </div>
        </section>

        <section data-img="7" data-at="21:10" data-name="Under the stars">
          <div className="beat" style={h('230svh')}>
            <div className="frame c">
              <div className="copy">
                <h2 className="split giant"><W t="Look" /> <em><W t="up." /></em></h2>
              </div>
            </div>
          </div>
          <div className="beat" style={h('150svh')}>
            <div className="frame ml">
              <div className="copy">
                <time className="big-time">21:30</time>
                <h2 className="split"><W t="Return." /></h2>
                <p className="body">Drop-off at your door, sand still in your shoes.</p>
                <p className="note">Times are indicative and shift with the season&apos;s sunset. Your confirmation will list exact timings.</p>
              </div>
            </div>
          </div>

          <Gallery />

          <div id="follow" className="block" data-dim=".55">
            <div className="inner follow rise">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="5" y="5" width="38" height="38" rx="10" />
                <circle cx="24" cy="24" r="9" />
                <circle cx="35" cy="13" r="1.6" fill="currentColor" stroke="none" />
              </svg>
              <div>
                <h2>Follow Our Journey</h2>
                <p>Desert safaris, sunset photoshoots, camping and horse riding around Abu Dhabi, from tour guide Nadeem Irani.</p>
              </div>
              <a className="btn" href="https://www.instagram.com/desert_safari_auh/" target="_blank" rel="noopener">Follow @desert_safari_auh</a>
            </div>
          </div>

          <div id="book" className="block" data-dim=".52">
            <div className="inner book">
              <div className="rise">
                <p className="kicker">Reserve your safari</p>
                <h2>Tell us the <em>day.</em> We&apos;ll handle the desert.</h2>
                <p className="sub" style={{ marginTop: 22 }}>Send your enquiry and we&apos;ll reply with availability and a confirmed price. No payment needed to ask.</p>
                <ul className="contact">
                  <li><span>Instagram</span><a href="https://www.instagram.com/desert_safari_auh" target="_blank" rel="noopener">@desert_safari_auh</a></li>
                  <li><span>Based in</span>Abu Dhabi, United Arab Emirates</li>
                  <li><span>Hours</span>Bookings answered daily</li>
                </ul>
              </div>
              <Enquiry />
            </div>
          </div>
        </section>
      </main>

      <footer data-dim=".52">
        <div className="ft">
          <span>© {new Date().getFullYear()} Desert Safari AUH · Abu Dhabi</span>
          <span>Dune bashing · Camps · Private tours</span>
        </div>
        <details>
          <summary>Photo credits</summary>
          <ul>
            <li>
              Sunrise and ridge: Thomas Fuhrmann, Erg Chebbi, <a href={commons('Erg_Chebbi_sunset.jpg')} target="_blank" rel="noopener">1</a>,{' '}
              <a href={commons('Erg_Chebbi_in_the_evening_light.jpg')} target="_blank" rel="noopener">2</a>, CC BY-SA 4.0
            </li>
            {CREDITS.map(([who, file, lic]) => (
              <li key={file}>{who}, <a href={commons(file)} target="_blank" rel="noopener">source</a>, {lic}</li>
            ))}
            <li>All photographs resized and colour-graded for this site.</li>
          </ul>
        </details>
      </footer>
    </>
  );
}
