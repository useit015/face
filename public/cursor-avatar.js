//#region src/direction.ts
function e(e, t, n) {
	if (Math.hypot(e, t) < n) return "center";
	let r = Math.atan2(t, e) * 180 / Math.PI;
	return {
		0: "right",
		1: "bottom-right",
		2: "bottom",
		3: "bottom-left",
		4: "left",
		[-4]: "left",
		[-3]: "top-left",
		[-2]: "top",
		[-1]: "top-right"
	}[Math.round(r / 45)] ?? "center";
}
function t(e) {
	return Math.min(1, Math.max(-1, e));
}
function n(e, n, r, i) {
	let a = e - i.beta, o = n - i.gamma, s, c;
	switch ((r % 360 + 360) % 360) {
		case 90:
			s = a, c = -o;
			break;
		case 180:
			s = -o, c = -a;
			break;
		case 270:
			s = -a, c = o;
			break;
		default: s = o, c = a;
	}
	return {
		x: t(s / 30),
		y: t(c / 30)
	};
}
//#endregion
//#region src/spritesheet.ts
var r = .75, i = {
	"top-left": [0, 0],
	top: [1, 0],
	"top-right": [2, 0],
	left: [0, 1],
	center: [1, 1],
	right: [2, 1],
	"bottom-left": [0, 2],
	bottom: [1, 2],
	"bottom-right": [2, 2]
};
function a(e) {
	let t = e % (Math.PI * 2);
	return t < 0 ? t + Math.PI * 2 : t;
}
function o(e) {
	let t = (e - 1) / 2, n = [], r = (e, r, i) => {
		let o = r - t, s = i - t;
		n.push({
			key: e,
			col: r,
			row: i,
			angle: a(Math.atan2(s, o)),
			radius: Math.hypot(o, s),
			inner: !1,
			sibling: null,
			walkIdx: 0
		});
	};
	if (e === 3) for (let [e, [t, n]] of Object.entries(i)) e !== "center" && r(e, t, n);
	else for (let n = 0; n < e; n++) for (let i = 0; i < e; i++) (i !== t || n !== t) && r(`${i},${n}`, i, n);
	n.sort((e, t) => e.angle - t.angle || e.radius - t.radius);
	let o = [];
	for (let e of n) {
		let t = o[o.length - 1];
		t && Math.round(t.angle * 1e6) === Math.round(e.angle * 1e6) ? t.poses.push(e) : o.push({
			angle: e.angle,
			poses: [e]
		});
	}
	let s = o.map((e) => e.poses[e.poses.length - 1]), c = new Map(s.map((e, t) => [e.key, t]));
	for (let e of o) {
		let t = e.poses[e.poses.length - 1];
		for (let n of e.poses) n.inner = n !== t, n.sibling = n.inner ? t.key : null, n.walkIdx = c.get(t.key);
	}
	return {
		n: e,
		centerCell: [t, t],
		ring: n,
		walkRing: s,
		rays: o,
		byKey: new Map(n.map((e) => [e.key, e]))
	};
}
function s(t) {
	let { container: i } = t, s = t.size ?? 240, c = t.stepMs ?? 70, l = t.onPoseChange, u = t.tiltAmplitude ?? (() => Math.hypot(window.innerWidth, window.innerHeight) / 2), d = s * r, f = o(t.grid ?? 3), p = document.createElement("div");
	p.className = "sprite-follow", p.style.width = `${s}px`, p.style.height = `${s}px`, t.label && (p.setAttribute("role", "img"), p.setAttribute("aria-label", t.label)), p.hidden = !0, i.appendChild(p);
	let m = document.createElement("div");
	m.className = "sprite-sheet-debug", i.insertBefore(m, p);
	let h = t.decode ?? ((e) => new Promise((t) => {
		let n = new Image();
		n.onload = () => t(), n.onerror = () => t(), n.src = e;
	})), g = window.matchMedia("(prefers-reduced-motion: reduce)"), _ = "center", v = [], y, b = !1, x = null, S = null, C = null, w = 0, T = !1, E = !1, D = !1, O = null;
	function k(e) {
		if (!E) return;
		let t = typeof performance < "u" ? performance.now().toFixed(1) : "?";
		console.log(`[ghost] t=${t} ${e}`);
	}
	function A() {
		let e = _ === "center" ? void 0 : f.byKey.get(_), t = e ? e.col : f.centerCell[0], n = e ? e.row : f.centerCell[1];
		k(`apply pose=${_} cell=${t},${n} bg=${p.style.backgroundPosition} queue=${v.length}`);
	}
	function j(e) {
		_ = e;
		let t = e === "center" ? void 0 : f.byKey.get(e), n = t ? t.col : f.centerCell[0], r = t ? t.row : f.centerCell[1];
		p.style.backgroundPosition = `${n / (f.n - 1) * 100}% ${r / (f.n - 1) * 100}%`, M(), A(), l?.(e);
	}
	function M() {
		if (p.style.transform = "", !E) {
			m.style.transform = "";
			return;
		}
		let e = _ === "center" ? void 0 : f.byKey.get(_), t = e ? e.col : f.centerCell[0], n = e ? e.row : f.centerCell[1], r = (f.n / 2 - t - .5) * s, i = (f.n / 2 - n - .5) * s;
		m.style.transform = `translate(${r}px, ${i}px)`;
	}
	function N() {
		m.classList.toggle("on", E), m.style.width = `${f.n * s}px`, m.style.height = `${f.n * s}px`, M();
	}
	function P() {
		let e = v.shift();
		if (e === void 0) {
			y = void 0;
			return;
		}
		j(e), y = v.length > 0 ? window.setTimeout(P, c) : void 0;
	}
	function F(e) {
		if (_ === e) return [];
		if (_ === "center") return [e];
		if (e === "center") return ["center"];
		let t = f.byKey.get(_), n = f.byKey.get(e), r = f.walkRing.length, i = (n.walkIdx - t.walkIdx + r) % r <= (t.walkIdx - n.walkIdx + r) % r ? 1 : -1, a = [];
		t.inner && a.push(t.sibling);
		let o = t.walkIdx;
		for (; o !== n.walkIdx;) o = (o + i + r) % r, a.push(f.walkRing[o].key);
		return n.inner && n.key !== _ && a.push(n.key), a;
	}
	function I(e) {
		if (e !== _) {
			if (g.matches) {
				y !== void 0 && (window.clearTimeout(y), y = void 0), v = [], k(`snap ${_} -> ${e} (reduced motion)`), j(e);
				return;
			}
			v = F(e), v.length > 0 && k(`path ${_} -> ${e} [${v.join(" ")}]`), y === void 0 && P();
		}
	}
	function L(t, n) {
		if (Math.hypot(t, n) < d) return "center";
		if (f.n === 3) return e(t, n, d);
		let r = a(Math.atan2(n, t)), i = f.rays[0], o = Infinity;
		for (let e of f.rays) {
			let t = Math.abs(Math.atan2(Math.sin(r - e.angle), Math.cos(r - e.angle)));
			t < o && (o = t, i = e);
		}
		if (i.poses.length === 1) return i.poses[0].key;
		let c = Math.max(d * 2, s / f.n * 2), l = i.poses[0], u = i.poses[i.poses.length - 1];
		return Math.hypot(t, n) < c ? l.key : u.key;
	}
	function R() {
		if (w = 0, !C || !b) return;
		let e = i.getBoundingClientRect(), t = C.x - (e.left + e.width / 2), n = C.y - (e.top + e.height / 2), r = L(t, n);
		k(`aim dx=${t.toFixed(1)} dy=${n.toFixed(1)} r=${Math.hypot(t, n).toFixed(1)} a=${(Math.atan2(n, t) * 180 / Math.PI).toFixed(1)} dz=${d.toFixed(1)} -> ${r}${r === _ ? " (same)" : ""}`), I(r), C = null;
	}
	function z(e, t) {
		S = {
			x: e,
			y: t
		}, C = {
			x: e,
			y: t
		}, w ||= requestAnimationFrame(R);
	}
	function B(e) {
		k(`mouse x=${e.clientX} y=${e.clientY}`), z(e.clientX, e.clientY);
	}
	function V(e) {
		let t = e.touches[0];
		t && (k(`touch x=${t.clientX} y=${t.clientY}`), z(t.clientX, t.clientY));
	}
	function H(e) {
		S = null, C = null, k(`leave (${e})`), I("center");
	}
	function U(e) {
		S && b && !w && (k(`recompute (${e}) x=${S.x} y=${S.y}`), C = S, w = requestAnimationFrame(R));
	}
	async function W(e) {
		let t = URL.createObjectURL(e);
		if (await h(t), T) {
			URL.revokeObjectURL(t);
			return;
		}
		x && URL.revokeObjectURL(x), x = t, p.style.backgroundImage = `url("${t}")`, p.style.backgroundSize = `${f.n * 100}% ${f.n * 100}%`, m.style.backgroundImage = `url("${t}")`, m.style.backgroundSize = "100% 100%", b = !0, p.hidden = !1, N(), k(`load ${f.n}x${f.n} cell=${s}px`), j(_);
	}
	function G() {
		H("mouseleave");
	}
	function K() {
		H("touchend");
	}
	function q() {
		U("scroll");
	}
	function J() {
		U("resize");
	}
	function Y() {
		H("blur");
	}
	function X(e) {
		if (e.beta === null || e.gamma === null) return;
		let t = screen.orientation?.angle ?? 0;
		if (!O || O.angle !== t) {
			O = {
				beta: e.beta,
				gamma: e.gamma,
				angle: t
			};
			return;
		}
		let r = n(e.beta, e.gamma, t, O), a = i.getBoundingClientRect(), o = u();
		z(a.left + a.width / 2 - r.x * o, a.top + a.height / 2 - r.y * o);
	}
	async function Z() {
		if (D) return "granted";
		let e = window.DeviceOrientationEvent;
		if (!e || !("ondeviceorientation" in window)) return "unsupported";
		if (typeof e.requestPermission == "function") try {
			if (await e.requestPermission() !== "granted") return "denied";
		} catch {
			return "denied";
		}
		return D = !0, window.addEventListener("deviceorientation", X), "granted";
	}
	return document.addEventListener("mousemove", B), document.documentElement.addEventListener("mouseleave", G), document.addEventListener("touchmove", V, { passive: !0 }), document.addEventListener("touchend", K), document.addEventListener("scroll", q, {
		passive: !0,
		capture: !0
	}), window.addEventListener("resize", J), window.addEventListener("blur", Y), {
		destroy() {
			T = !0, document.removeEventListener("mousemove", B), document.documentElement.removeEventListener("mouseleave", G), document.removeEventListener("touchmove", V), document.removeEventListener("touchend", K), document.removeEventListener("scroll", q, { capture: !0 }), window.removeEventListener("resize", J), window.removeEventListener("blur", Y), y !== void 0 && window.clearTimeout(y), w && cancelAnimationFrame(w), x && URL.revokeObjectURL(x), window.removeEventListener("deviceorientation", X), D = !1, O = null, m.remove(), p.remove();
		},
		load: W,
		enableTilt: Z,
		resize(e) {
			s = e, d = s * r, p.style.width = `${s}px`, p.style.height = `${s}px`, k(`resize size=${s} dz=${d.toFixed(1)}`), N(), U("resize()");
		},
		setStepMs(e) {
			c = e, k(`stepms ${e}`);
		},
		setDeadZone(e) {
			d = s * e, k(`dz ${e} (${d.toFixed(1)}px)`);
		},
		setGrid(e) {
			e !== f.n && (k(`grid ${f.n}x${f.n} -> ${e}x${e}`), f = o(e), p.style.backgroundSize = `${e * 100}% ${e * 100}%`, v = [], y !== void 0 && (window.clearTimeout(y), y = void 0), b && (j(f.byKey.has(_) ? _ : "center"), N(), U("grid switch")));
		},
		setDebug(e) {
			E = e, N(), e && (k(`on ${f.n}x${f.n} cell=${s}px dz=${d.toFixed(1)}`), A());
		},
		face(e) {
			if (!b || e !== "center" && !f.byKey.has(e)) {
				k(`face ${e} (ignored)`);
				return;
			}
			k(`face ${e}`), I(e);
		},
		ring() {
			return f.ring.map((e) => e.key);
		},
		reset() {
			v = [], S = null, C = null, k("reset -> center"), w &&= (cancelAnimationFrame(w), 0), y !== void 0 && (window.clearTimeout(y), y = void 0), j("center");
		}
	};
}
//#endregion
//#region src/cursor-avatar.ts
var c = 240, l = 70, u = "Portrait of the site owner", d = "/avatar/";
function f(e, t) {
	return `${e.endsWith("/") ? e : `${e}/`}sheet-${t}.webp`;
}
var p = "\n:host {\n  display: inline-block;\n  line-height: 0;\n}\n.root {\n  position: relative;\n}\n.sprite-follow {\n  background-repeat: no-repeat;\n  user-select: none;\n  -webkit-user-drag: none;\n}\n.sprite-sheet-debug {\n  display: none;\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  translate: -50% -50%;\n  background-repeat: no-repeat;\n  background-size: 100% 100%;\n  opacity: 0.3;\n  pointer-events: none;\n  transition: transform 0.18s ease-out;\n}\n.sprite-sheet-debug.on {\n  display: block;\n}\n", m = class extends HTMLElement {
	static get observedAttributes() {
		return [
			"size",
			"step-ms",
			"grid",
			"theme",
			"sheet-base"
		];
	}
	ready = Promise.resolve();
	follower = null;
	loadToken = 0;
	scheme = null;
	sheets = /* @__PURE__ */ new Map();
	get size() {
		let e = Number(this.getAttribute("size"));
		return Number.isFinite(e) && e > 0 ? e : c;
	}
	get stepMs() {
		let e = Number(this.getAttribute("step-ms"));
		return Number.isFinite(e) && e > 0 ? e : l;
	}
	get grid() {
		return this.getAttribute("grid") === "5" ? 5 : 3;
	}
	get resolvedTheme() {
		let e = this.getAttribute("theme");
		return e === "light" || e === "dark" ? e : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
	}
	connectedCallback() {
		if (this.follower) return;
		let e = this.shadowRoot ?? this.attachShadow({ mode: "open" });
		e.innerHTML = `<style>${p}</style><div class="root"></div>`;
		let t = e.querySelector(".root");
		this.follower = s({
			container: t,
			size: this.size,
			stepMs: this.stepMs,
			grid: this.grid,
			label: this.getAttribute("label") ?? u
		}), this.syncSize(), this.ready = this.loadSheet().catch((e) => {
			console.error("[cursor-avatar] failed to load the sprite sheet:", e);
		}), this.hasAttribute("tilt") && this.enableTilt(), this.syncScheme();
	}
	disconnectedCallback() {
		this.loadToken++, this.setSchemeListener(!1), this.follower?.destroy(), this.follower = null;
	}
	attributeChangedCallback(e, t, n) {
		if (!(t === n || !this.follower)) switch (e) {
			case "size":
				this.syncSize(), this.follower.resize(this.size);
				break;
			case "step-ms":
				this.follower.setStepMs(this.stepMs);
				break;
			case "grid":
				this.follower.setGrid(this.grid);
				break;
			case "theme":
				this.syncScheme(), this.loadSheet();
				break;
			case "sheet-base": this.loadSheet();
		}
	}
	enableTilt() {
		return this.follower ? this.follower.enableTilt() : Promise.resolve("unsupported");
	}
	fetchSheet(e) {
		let t = this.getAttribute("sheet-base") ?? d, n = `${t}|${e}`, r = this.sheets.get(n);
		return r || (r = fetch(f(t, e)).then((e) => e.blob()), r.catch(() => this.sheets.delete(n)), this.sheets.set(n, r)), r;
	}
	loadSheet() {
		let e = this.follower;
		if (!e) return Promise.resolve();
		let t = ++this.loadToken;
		return this.fetchSheet(this.resolvedTheme).then((n) => {
			if (!(!this.follower || this.follower !== e || t !== this.loadToken)) return e.load(n).then(() => {});
		});
	}
	syncScheme() {
		this.setSchemeListener(!this.hasAttribute("theme"));
	}
	setSchemeListener(e) {
		e && !this.scheme ? (this.scheme = window.matchMedia("(prefers-color-scheme: dark)"), this.scheme.addEventListener("change", this.onSchemeChange)) : !e && this.scheme && (this.scheme.removeEventListener("change", this.onSchemeChange), this.scheme = null);
	}
	onSchemeChange = () => {
		this.loadSheet();
	};
	syncSize() {
		let e = this.size;
		this.style.width = `${e}px`, this.style.height = `${e}px`;
	}
};
typeof window < "u" && !customElements.get("cursor-avatar") && customElements.define("cursor-avatar", m);
//#endregion
export { m as CursorAvatarElement };
