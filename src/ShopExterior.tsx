import './shop-exterior.css';

export function ShopExterior({onEnter}:{onEnter:()=>void}){
  return <section className="shop-exterior" aria-label="こもれび模型店の外">
    <svg className="shop-exterior-art" viewBox="0 0 960 640" preserveAspectRatio="xMidYMid slice" role="img" aria-label="青空の下、街路樹が並ぶこもれび模型店の店先">
      <rect width="960" height="640" fill="#b7dce1"/>
      <g fill="#edf6e9"><ellipse cx="180" cy="80" rx="100" ry="25"/><ellipse cx="720" cy="110" rx="140" ry="30"/></g>
      <path d="M0 230H960V480H0Z" fill="#c6c5ad"/>
      <path d="M0 460H960V550H0Z" fill="#dfd8bb"/>
      <path d="M0 550H960V640H0Z" fill="#7e9291"/>
      <path d="M0 570H960M100 460L70 550M300 460L290 550M660 460L670 550M860 460L890 550" stroke="#b1b4a2" strokeWidth="4"/>
      <rect x="235" y="160" width="490" height="316" fill="#eee0b7" stroke="#536b62" strokeWidth="8"/>
      <rect x="255" y="182" width="450" height="70" rx="4" fill="#315d56"/>
      <text x="480" y="228" textAnchor="middle" fill="#fff1c9" fontSize="32" fontWeight="bold">こもれび模型店</text>
      <path d="M235 267H725L755 315H205Z" fill="#447a68"/>
      <path d="M270 267L255 315M340 267L332 315M410 267L407 315M550 267L553 315M620 267L628 315M690 267L705 315" stroke="#f1dba0" strokeWidth="25"/>
      <rect x="265" y="330" width="235" height="115" fill="#a7c8c4" stroke="#536b62" strokeWidth="8"/>
      <path d="M270 410H495M340 335V440M420 335V440" stroke="#edf0cf" strokeWidth="6"/>
      <g fill="#e9b46c"><rect x="285" y="382" width="40" height="23"/><rect x="356" y="370" width="48" height="35"/><rect x="435" y="380" width="45" height="25"/></g>
      <rect x="535" y="328" width="140" height="148" fill="#355b58"/>
      <rect x="548" y="340" width="114" height="101" fill="#9ebcaa"/>
      <rect x="646" y="414" width="7" height="22" fill="#f6d88b"/>
      <text x="605" y="380" textAnchor="middle" fill="#254741" fontSize="17">OPEN</text>
      <g fill="#6c9670"><circle cx="110" cy="290" r="70"/><circle cx="850" cy="310" r="75"/></g>
      <g stroke="#726a4a" strokeWidth="16"><path d="M110 325V478M850 350V478"/></g>
      <ellipse cx="480" cy="527" rx="27" ry="9" fill="#536b6260"/>
      <path d="M464 504L460 526H474L480 509L487 526H500L495 500" fill="#384763"/>
      <path d="M464 475H494L500 504H460Z" fill="#de8859"/>
      <circle cx="480" cy="463" r="17" fill="#edc79a"/>
      <path d="M463 461Q460 436 483 442Q501 441 498 463L487 453L473 455Z" fill="#414344"/>
    </svg>
    <div className="shop-exterior-panel"><p>こもれび模型店 · 店先</p><h2>ちょっと、ひと息。</h2><p>お店にはいつでも戻れます。</p><button autoFocus onClick={onEnter}>模型店に入る</button></div>
  </section>;
}
