(() => {
  if (document.getElementById('ytgl-panel')) return;

  const S = { a: null, b: null, loop: false, count: 0, countOn: true };
  try { S.countOn = localStorage.getItem('ytgl-count') !== '0'; } catch {}
  const fmt = t => t == null ? '--:--.-' :
    `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
  const video = () => document.querySelector('video.html5-main-video') || document.querySelector('video');

  const panel = document.createElement('div');
  panel.id = 'ytgl-panel';
  panel.innerHTML = `
    <div id="ytgl-head"><span>∞ Looper</span><span><button id="ytgl-lang"></button><button id="ytgl-min" data-ti="collapse">–</button><button id="ytgl-tiny" data-ti="tinyTip">↘</button></span></div>
    <div id="ytgl-body">
      <div class="ytgl-row">
        <button class="b" id="ytgl-seta" data-i="setA"></button><span class="ytgl-t" id="ytgl-ta"></span>
        <button class="b" id="ytgl-setb" data-i="setB"></button><span class="ytgl-t" id="ytgl-tb"></span>
      </div>
      <div class="ytgl-row">
        <button class="b" data-n="a-">A−0.1</button><button class="b" data-n="a+">A+0.1</button>
        <button class="b" data-n="b-">B−0.1</button><button class="b" data-n="b+">B+0.1</button>
      </div>
      <div class="ytgl-row">
        <button class="b" id="ytgl-loop"></button>
        <button class="b" id="ytgl-clear" data-i="clear"></button>
      </div>
      <div class="ytgl-row">
        <button class="b" id="ytgl-cnt"></button>
        <span class="ytgl-t" id="ytgl-cntv" style="font-size:16px;font-weight:600"></span>
        <button class="b" id="ytgl-cntr" data-i="resetCount"></button>
      </div>
      <div class="ytgl-row"><label data-i="speed"></label>
        <input type="range" id="ytgl-rate" min="0.25" max="1.5" step="0.05" value="1">
        <span class="ytgl-t" id="ytgl-ratev">1.00x</span></div>

      <div class="ytgl-sec">
        <div class="ytgl-row"><label>BPM</label>
          <input type="number" id="ytgl-bpm" min="30" max="300" value="80">
          <button class="b" id="ytgl-tap">Tap</button>
          <button class="b" id="ytgl-met"></button></div>
        <div class="ytgl-row"><label data-i="sig"></label>
          <input type="number" id="ytgl-sig" min="1" max="12" value="4"></div>
        <div class="ytgl-row"><label data-i="vol"></label>
          <input type="range" id="ytgl-vol" min="0" max="1" step="0.05" value="0.6">
          <span class="ytgl-t" id="ytgl-volv">60%</span></div>
        <div id="ytgl-beats"></div>
        <div class="ytgl-row">
          <button class="b" id="ytgl-det"></button>
          <span class="ytgl-t" id="ytgl-detv" style="flex:1;text-align:left">—</span>
          <button class="b" id="ytgl-half" data-ti="half">÷2</button>
          <button class="b" id="ytgl-dbl" data-ti="dbl">×2</button>
          <button class="b" id="ytgl-apply" data-i="apply"></button>
        </div>
        <div class="ytgl-row">
          <button class="b" id="ytgl-sync"></button>
          <button class="b" id="ytgl-lock" data-i="lock" data-ti="lockTip"></button>
          <span class="ytgl-t" id="ytgl-syncv" style="flex:1;text-align:left">—</span>
        </div>
        <div class="ytgl-row"><label data-i="delay"></label>
          <button class="b" data-sh="-10">−10ms</button>
          <button class="b" data-sh="10">+10ms</button>
        </div>
      </div>
      <div class="ytgl-hint" data-i="hint"></div>
    </div>`;
  document.body.appendChild(panel);
  const fab = document.createElement('button');
  fab.id = 'ytgl-fab'; fab.textContent = '∞';
  document.body.appendChild(fab);
  const $ = id => panel.querySelector('#ytgl-' + id);

  // ---------- 語言 ----------
  const T = {
    zh: { setA: '設 A', setB: '設 B', countOn: '計數：開', countOff: '計數：關', resetCount: '歸零', loopOn: '循環：開', loopOff: '循環：關', clear: '清除', speed: '速度',
      start: '開始', stop: '停止', sig: '拍號', vol: '音量', det: '自動偵測', detStop: '停止偵測', apply: '套用',
      syncOn: '對齊拍點：開', syncOff: '對齊拍點：關', lock: '✔ 確定', delay: '延遲',
      hint: '快捷鍵： [ 設A　] 設B　\\ 開關循環', collapse: '收合', tinyTip: '縮到右下角', fabTip: '展開 Looper', half: '偵測值÷2', dbl: '偵測值×2',
      lockTip: '固定目前拍子，停止偵測與調整', dash: '—', noAudio: '無法接音訊',
      analyzing: '分析中…（需播放中）', analyzingN: '分析中 {0}/5s', bpmv: '{0} BPM',
      waitDet: '等待偵測…（需播放中）', conf: '信心 {0}%', confLow: '信心 {0}%（低）', offset: '偏移 {0}ms',
      notRunning: '節拍器未啟動', locked: '已固定 {0} BPM', langBtn: 'EN' },
    en: { setA: 'Set A', setB: 'Set B', countOn: 'Count: on', countOff: 'Count: off', resetCount: 'Reset', loopOn: 'Loop: on', loopOff: 'Loop: off', clear: 'Clear', speed: 'Speed',
      start: 'Start', stop: 'Stop', sig: 'Beats', vol: 'Volume', det: 'Auto detect', detStop: 'Stop detect', apply: 'Apply',
      syncOn: 'Beat sync: on', syncOff: 'Beat sync: off', lock: '✔ Lock', delay: 'Latency',
      hint: 'Keys: [ set A   ] set B   \\ toggle loop', collapse: 'Collapse', tinyTip: 'Minimize to corner', fabTip: 'Open Looper', half: 'Detected ÷2', dbl: 'Detected ×2',
      lockTip: 'Freeze the current tempo and stop detecting/adjusting', dash: '—', noAudio: "Can't tap audio",
      analyzing: 'Analyzing… (keep playing)', analyzingN: 'Analyzing {0}/5s', bpmv: '{0} BPM',
      waitDet: 'Waiting for detection… (keep playing)', conf: 'Confidence {0}%', confLow: 'Confidence {0}% (low)', offset: 'Offset {0}ms',
      notRunning: 'Metronome not running', locked: 'Locked at {0} BPM', langBtn: '中' }
  };
  let lang = 'en';
  try { lang = localStorage.getItem('ytgl-lang') || (/^zh/i.test(navigator.language) ? 'zh' : 'en'); } catch {}
  const tx = (k, ...a) => (T[lang][k] ?? k).replace(/\{(\d)\}/g, (_, i) => a[i]);
  const stat = {};   // 狀態文字記下 key，切換語言時可重新翻譯
  const setS = (id, k, ...a) => { stat[id] = [k, a]; $(id).textContent = tx(k, ...a); };

  // ---------- 拖曳 / 收合 ----------
  try {
    const pos = JSON.parse(localStorage.getItem('ytgl-pos') || 'null');
    if (pos) Object.assign(panel.style, { left: pos.l + 'px', top: pos.t + 'px', right: 'auto', bottom: 'auto' });
  } catch {}
  $('head').addEventListener('mousedown', e => {
    if (e.target.closest('button')) return;
    const r = panel.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
    const move = ev => Object.assign(panel.style, {
      left: Math.max(0, Math.min(innerWidth - 60, ev.clientX - dx)) + 'px',
      top: Math.max(0, Math.min(innerHeight - 30, ev.clientY - dy)) + 'px', right: 'auto', bottom: 'auto' });
    const up = () => {
      removeEventListener('mousemove', move); removeEventListener('mouseup', up);
      try { localStorage.setItem('ytgl-pos', JSON.stringify({ l: panel.offsetLeft, t: panel.offsetTop })); } catch {}
    };
    addEventListener('mousemove', move); addEventListener('mouseup', up);
  });
  $('min').onclick = () => panel.classList.toggle('min');
  function setTiny(on) {
    panel.classList.toggle('gone', on); fab.classList.toggle('show', on);
    try { localStorage.setItem('ytgl-tiny', on ? '1' : '0'); } catch {}
  }
  $('tiny').onclick = () => setTiny(true);
  fab.onclick = () => setTiny(false);
  function updateFab() { fab.classList.toggle('active', S.loop || running); }

  // ---------- AB 循環 ----------
  function render() {
    $('ta').textContent = fmt(S.a); $('tb').textContent = fmt(S.b);
    $('loop').textContent = tx(S.loop ? 'loopOn' : 'loopOff');
    $('loop').classList.toggle('on', S.loop);
    updateFab();
    $('cnt').textContent = tx(S.countOn ? 'countOn' : 'countOff');
    $('cnt').classList.toggle('on', S.countOn);
    $('cntv').textContent = S.countOn ? '×' + S.count : '';
    $('cntr').style.visibility = S.countOn ? 'visible' : 'hidden';
  }
  function setA() { const v = video(); if (!v) return; S.count = 0; S.a = v.currentTime; if (S.b != null && S.b <= S.a) S.b = null; render(); }
  function setB() { const v = video(); if (!v) return; S.count = 0; if (S.a == null) S.a = 0; S.b = v.currentTime; if (S.b <= S.a) { S.a = 0; } S.loop = true; render(); }
  function toggleLoop() {
    if (S.a == null || S.b == null) return;
    S.loop = !S.loop; render();
  }
  $('seta').onclick = setA; $('setb').onclick = setB; $('loop').onclick = toggleLoop;
  $('clear').onclick = () => { S.a = S.b = null; S.loop = false; S.count = 0; render(); };
  $('cnt').onclick = () => {
    S.countOn = !S.countOn; S.count = 0; render();
    try { localStorage.setItem('ytgl-count', S.countOn ? '1' : '0'); } catch {}
  };
  $('cntr').onclick = () => { S.count = 0; render(); };
  panel.querySelectorAll('[data-n]').forEach(btn => btn.onclick = () => {
    const [w, s] = [btn.dataset.n[0], btn.dataset.n[1] === '+' ? 0.1 : -0.1];
    if (S[w] != null) { S[w] = Math.max(0, S[w] + s); render(); }
  });

  setInterval(() => {
    const v = video();
    if (!v || !S.loop || S.a == null || S.b == null || v.paused) return;
    if (v.currentTime >= S.b) { v.currentTime = S.a; if (S.countOn) { S.count++; render(); } }
    else if (v.currentTime < S.a - 0.5) v.currentTime = S.a;
  }, 30);

  $('rate').oninput = () => {
    const v = video(), r = +$('rate').value;
    if (v) v.playbackRate = r;
    $('ratev').textContent = r.toFixed(2) + 'x';
  };

  addEventListener('keydown', e => {
    const t = e.target;
    if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === '[') setA(); else if (e.key === ']') setB(); else if (e.key === '\\') toggleLoop(); else return;
    e.preventDefault(); e.stopPropagation();
  }, true);

  // 換影片時重置（YouTube 是單頁應用）
  addEventListener('yt-navigate-finish', () => { S.a = S.b = null; S.loop = false; S.count = 0; render(); });

  // ---------- 節拍器（Web Audio lookahead 排程，節奏穩定）----------
  let ctx, timer, nextTime = 0, beat = 0, running = false;
  const getCtx = () => (ctx = ctx || new (window.AudioContext || window.webkitAudioContext)());
  const beatsEl = $('beats');
  function drawBeats() {
    const n = Math.max(1, Math.min(12, +$('sig').value || 4));
    beatsEl.innerHTML = '<i></i>'.repeat(n);
  }
  $('sig').onchange = () => { drawBeats(); beat = 0; };
  drawBeats();

  function click(time, accent) {
    const o = ctx.createOscillator(), g = ctx.createGain(), vol = +$('vol').value;
    o.frequency.value = accent ? 1500 : 1000;
    g.gain.setValueAtTime(vol, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    o.connect(g).connect(ctx.destination);
    o.start(time); o.stop(time + 0.07);
  }
  function flash(idx, delayMs) {
    setTimeout(() => {
      const els = beatsEl.children;
      for (const el of els) el.className = '';
      if (els[idx]) els[idx].className = 'hit' + (idx === 0 ? ' first' : '');
    }, Math.max(0, delayMs));
  }
  function schedule() {
    const bpm = Math.max(30, Math.min(300, +$('bpm').value || 80)), sig = Math.max(1, +$('sig').value || 4);
    while (nextTime < ctx.currentTime + 0.12) {
      click(nextTime, beat % sig === 0);
      flash(beat % sig, (nextTime - ctx.currentTime) * 1000);
      nextTime += 60 / bpm; beat++;
    }
  }
  function startMet() {
    getCtx().resume();
    beat = 0; nextTime = ctx.currentTime + 0.05; running = true;
    timer = setInterval(schedule, 25);
    $('met').textContent = tx('stop'); $('met').classList.add('on'); updateFab();
  }
  function stopMet() {
    clearInterval(timer); running = false;
    if (typeof setSync === 'function' && syncOn) setSync(false);
    for (const el of beatsEl.children) el.className = '';
    $('met').textContent = tx('start'); $('met').classList.remove('on'); updateFab();
  }
  $('met').onclick = () => running ? stopMet() : startMet();

  let taps = [];
  $('tap').onclick = () => {
    const now = performance.now();
    if (taps.length && now - taps[taps.length - 1] > 2000) taps = [];
    taps.push(now); taps = taps.slice(-6);
    if (taps.length >= 2) {
      const avg = (taps[taps.length - 1] - taps[0]) / (taps.length - 1);
      $('bpm').value = Math.round(Math.max(30, Math.min(300, 60000 / avg)));
    }
  };

  // ---------- 自動偵測 BPM（spectral flux + 自相關）----------
  const GRID = 100;            // 重取樣到 100Hz
  const WIN_SEC = 12;          // 分析最近 12 秒
  let analyser, srcNode, detTimer, anaTimer, prevSpec, samples = [], estimates = [], detBpm = null;

  function ensureTap() {
    const v = video(); if (!v) return false;
    const c = getCtx(); c.resume();
    if (!srcNode) {
      try {
        srcNode = c.createMediaElementSource(v);   // 同一個 video 只能建立一次
      } catch (err) { setS('detv', 'noAudio'); return false; }
      analyser = c.createAnalyser();
      analyser.fftSize = 1024; analyser.smoothingTimeConstant = 0;
      srcNode.connect(analyser);
      srcNode.connect(c.destination);               // 保持原本聲音輸出
    }
    return true;
  }

  function sampleFlux() {
    const v = video();
    if (!v || v.paused) { samples = []; prevSpec = null; return; }
    const spec = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(spec);
    if (prevSpec) {
      // 只看約 40Hz~5kHz，並以線性能量差的正值累加
      let flux = 0;
      for (let i = 2; i < 116; i++) {
        const d = Math.pow(10, spec[i] / 20) - Math.pow(10, prevSpec[i] / 20);
        if (d > 0) flux += d;
      }
      const t = performance.now() / 1000;
      samples.push([t, flux]);
      while (samples.length && t - samples[0][0] > WIN_SEC) samples.shift();
    }
    prevSpec = spec;
  }

  function estimate() {
    if (samples.length < 2) return;
    const t0 = samples[0][0], t1 = samples[samples.length - 1][0], dur = t1 - t0;
    if (dur < 5) { setS('detv', 'analyzingN', dur.toFixed(0)); return; }
    const n = Math.floor(dur * GRID), env = new Float32Array(n);
    for (let i = 0, j = 0; i < n; i++) {        // 線性內插到固定格點
      const t = t0 + i / GRID;
      while (j < samples.length - 2 && samples[j + 1][0] < t) j++;
      const [ta, fa] = samples[j], [tb, fb] = samples[j + 1];
      env[i] = fa + (fb - fa) * Math.min(1, Math.max(0, (t - ta) / (tb - ta || 1)));
    }
    // 扣掉局部平均並半波整流 → onset 強度
    const m = 25, onset = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      let s = 0, c = 0;
      for (let k = Math.max(0, i - m); k <= Math.min(n - 1, i + m); k++) { s += env[k]; c++; }
      onset[i] = Math.max(0, env[i] - s / c);
    }
    lastOn = { onset, t0 };
    const minLag = Math.round(GRID * 60 / 200), maxLag = Math.round(GRID * 60 / 60);
    const acf = lag => { let s = 0; for (let i = lag; i < n; i++) s += onset[i] * onset[i - lag]; return s / (n - lag); };
    const score = new Float32Array(maxLag * 2 + 2);
    for (let lag = minLag; lag <= maxLag * 2; lag++) score[lag] = acf(lag);
    let best = 0, bestLag = 0;
    for (let lag = minLag; lag <= maxLag; lag++) {
      const bpm = 60 * GRID / lag;
      const prior = Math.exp(-0.5 * Math.pow(Math.log2(bpm / 110) / 0.9, 2));  // 偏好 ~110 BPM，減少倍頻誤判
      const sc = (score[lag] + 0.5 * score[lag * 2]) * prior;
      if (sc > best) { best = sc; bestLag = lag; }
    }
    if (!bestLag) return;
    // 拋物線內插提升解析度
    const a = score[bestLag - 1], b = score[bestLag], c = score[bestLag + 1];
    const den = a - 2 * b + c, off = den ? 0.5 * (a - c) / den : 0;
    const bpm = 60 * GRID / (bestLag + Math.max(-1, Math.min(1, off)));
    estimates.push(bpm); estimates = estimates.slice(-7);
    const sorted = [...estimates].sort((x, y) => x - y);
    detBpm = sorted[sorted.length >> 1];
    setS('detv', 'bpmv', detBpm.toFixed(1));
    if (syncOn) alignStep();
  }

  // ---------- 拍點對齊 ----------
  let locking = false, lastOn = null, syncOn = false, syncFirst = true, userShift = 0;
  const LATENCY = 0.012;   // analyser 視窗中心比讀取時間早約 12ms
  function beatPhase(P) {  // 回傳 {phase(秒, performance 時間軸), conf}
    if (!lastOn) return null;
    const { onset, t0 } = lastOn;
    let C = 0, S = 0, W = 0;
    for (let i = 0; i < onset.length; i++) {
      const w = onset[i]; if (!w) continue;
      const ang = 2 * Math.PI * (((t0 + i / GRID - LATENCY) % P) / P);
      C += w * Math.cos(ang); S += w * Math.sin(ang); W += w;
    }
    if (!W) return null;
    const ph = (Math.atan2(S, C) / (2 * Math.PI) * P + P) % P;
    return { phase: ph, conf: Math.hypot(C, S) / W };
  }
  function alignStep() {
    if (!detBpm || !ctx) return;
    // 速度：變動超過 1% 才更新，避免拍子忽快忽慢
    const cur = +$('bpm').value;
    if (!cur || Math.abs(detBpm - cur) / cur > 0.01) $('bpm').value = detBpm.toFixed(1);
    const P = 60 / (+$('bpm').value);
    const r = beatPhase(P);
    if (!r) return;
    setS('syncv', r.conf < 0.25 ? 'confLow' : 'conf', (r.conf * 100).toFixed(0));
    if (r.conf < 0.15) return;                       // 太不確定就不動
    const phase = r.phase + userShift;
    const off = ctx.currentTime - performance.now() / 1000;
    if (!running) startMet();
    if (syncFirst) {
      const k = Math.ceil((performance.now() / 1000 + 0.15 - phase) / P);
      nextTime = phase + k * P + off; beat = 0; syncFirst = false;
      return;
    }
    let d = (((nextTime - off - phase) % P) + P) % P;
    if (d > P / 2) d -= P;
    nextTime -= Math.abs(d) > 0.08 ? d : d * 0.4;    // 小誤差漸進修正，大誤差直接跳
    if (nextTime < ctx.currentTime + 0.03) nextTime += P;
  }
  function setSync(on) {
    syncOn = on; syncFirst = true;
    $('sync').textContent = tx(on ? 'syncOn' : 'syncOff');
    $('sync').classList.toggle('on', on);
    if (!on && !locking) setS('syncv', 'dash');
  }
  $('lock').onclick = () => {
    if (!running) { setS('syncv', 'notRunning'); return; }
    const bpm = Math.max(30, Math.min(300, +$('bpm').value || 80));
    $('bpm').value = bpm.toFixed(1);
    locking = true; setSync(false); locking = false; stopDetect();
    setS('syncv', 'locked', bpm.toFixed(1));
  };
  $('vol').oninput = () => { $('volv').textContent = Math.round($('vol').value * 100) + '%'; };
  $('sync').onclick = () => {
    if (syncOn) return setSync(false);
    if (!detTimer) startDetect();
    getCtx().resume();
    setSync(true);
    setS('syncv', 'waitDet');
    if (detBpm && lastOn) alignStep();
  };
  panel.querySelectorAll('[data-sh]').forEach(b => b.onclick = () => {
    userShift += (+b.dataset.sh) / 1000; syncFirst = false;   // 手動微調聽感延遲
    setS('syncv', 'offset', (userShift * 1000).toFixed(0));
  });

  function startDetect() {
    if (!ensureTap()) return;
    samples = []; estimates = []; prevSpec = null; detBpm = null;
    detTimer = setInterval(sampleFlux, 10);
    anaTimer = setInterval(estimate, 1000);
    $('det').textContent = tx('detStop'); $('det').classList.add('on');
    setS('detv', 'analyzing');
  }
  function stopDetect() {
    clearInterval(detTimer); clearInterval(anaTimer); detTimer = anaTimer = null;
    $('det').textContent = tx('det'); $('det').classList.remove('on');
  }
  $('det').onclick = () => detTimer ? stopDetect() : startDetect();
  const scaleDet = f => { if (detBpm) { detBpm *= f; estimates = estimates.map(x => x * f); setS('detv', 'bpmv', detBpm.toFixed(1)); } };
  $('half').onclick = () => scaleDet(0.5);
  $('dbl').onclick = () => scaleDet(2);
  $('apply').onclick = () => { if (detBpm) $('bpm').value = Math.round(Math.max(30, Math.min(300, detBpm))); };
  addEventListener('yt-navigate-finish', () => { samples = []; estimates = []; detBpm = null; if (detTimer) setS('detv', 'analyzing'); });

  function applyLang() {
    panel.querySelectorAll('[data-i]').forEach(el => el.textContent = tx(el.dataset.i));
    panel.querySelectorAll('[data-ti]').forEach(el => el.title = tx(el.dataset.ti));
    $('lang').textContent = tx('langBtn');
    $('met').textContent = tx(running ? 'stop' : 'start');
    $('det').textContent = tx(detTimer ? 'detStop' : 'det');
    $('sync').textContent = tx(syncOn ? 'syncOn' : 'syncOff');
    for (const id in stat) setS(id, stat[id][0], ...stat[id][1]);
    render();
    fab.title = tx('fabTip');
  }
  $('lang').onclick = () => {
    lang = lang === 'zh' ? 'en' : 'zh';
    try { localStorage.setItem('ytgl-lang', lang); } catch {}
    applyLang();
  };
  setS('detv', 'dash'); setS('syncv', 'dash');
  applyLang();
  try { if (localStorage.getItem('ytgl-tiny') === '1') setTiny(true); } catch {}
})();
