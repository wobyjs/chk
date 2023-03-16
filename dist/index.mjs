var D = Object.defineProperty;
var C = (s, t, e) => t in s ? D(s, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[t] = e;
var a = (s, t, e) => (C(s, typeof t != "symbol" ? t + "" : t, e), e);
const u = {};
class n {
  constructor(t, e, o) {
    a(this, "messengers", []);
    a(this, "title");
    a(this, "subject");
    a(this, "test");
    arguments.length === 3 ? Object.assign(this, { title: e, subject: t, test: o }) : Object.assign(this, { subject: t, test: e });
  }
  process(t, e, o, c) {
    const { stack: l } = new Error();
    this.messengers.push({ key: t, result: e, subject: o, target: c, stack: l });
  }
  get result() {
    return this.messengers.every((t) => t.result);
  }
}
const x = (s) => typeof s == "string" ? `"${s}"` : s, g = (s) => (t, e, o, c) => {
  const l = t ? "color:green" : "color:red";
  return [`%c${x(e)} %c${s} %c${x(o)}%c`, l, "font-weight:bold", l, ""];
}, q = (s, t, e, o = []) => {
  const [c, ...l] = o;
  return [`%c${s ? "✓" : "✗"} %c${c}`, s ? "color:green" : "color:red", ""].concat(l.length > 0 ? l : [""]);
};
class p {
  constructor(t, e, o) {
    // modules = new Map<Expect<any> | Test<any>, { node: Expect<any> | Test<any>, result?: boolean/* , message?: string */ }>()
    a(this, "modules", []);
    a(this, "subject");
    a(this, "title");
    a(this, "func");
    a(this, "options");
    a(this, "parent");
    a(this, "stack", new Error().stack);
    if (this.subject = t, e && o) {
      this.options = e, this.func = o;
      const c = e;
      this.title = `${c.prefix ?? ""} ${c.formatter ? c.formatter(this.subject) : this.subject + ""} ${c.surfix ?? ""}`;
    } else
      e ? (this.func = e, this.title = this.subject + "") : (this.func = () => {
      }, this.title = this.subject + "");
  }
  get result() {
    return this.modules.every((t) => t.result);
  }
  async test() {
    const t = this, { subject: e, modules: o } = this;
    function c(i, r) {
      const h = arguments.length === 2 ? new n(i, r, t) : new n(i, t);
      return t.modules.push(h), h;
    }
    const l = (i, r, h) => {
      const f = h ? new p(i, r, h) : new p(i, r);
      return f.parent = this, f.parent.modules.push(f), f;
    };
    try {
      const i = this.func({ expect: c, subject: e, test: l, parent: this });
      typeof i == "object" && typeof i.then == "function" && await i, o.forEach(async (r) => {
        r instanceof n || r instanceof p && await r.test(
          /* opts */
        );
      });
    } catch (i) {
      console.error(i);
    }
  }
  /**
   * @param head excludes expect report in report
   * 
   *  */
  async report(t = { head: !1 }) {
    const { modules: e } = this, { head: o } = t;
    await (async () => {
      const { result: l, title: i, stack: r } = this;
      let h = l ? console.groupCollapsed : console.group, f = r.split(`
`);
      h(...q(l, null, null, [i])), console.log(f[4]), e.forEach(async (d) => {
        !o && d instanceof n ? d.messengers.forEach((y) => {
          const { key: m, result: w, subject: k, target: $, stack: T } = y, { title: E } = d;
          let [b, ...j] = g(m)(w, k, $);
          E && (b = `%c${E} ${b}%c`, j = [
            /* 'font-weight:bold' */
            "",
            ...j,
            ""
          ]), h = w ? console.groupCollapsed : console.group, h(...q(w, k, $, [b, ...j]));
          const v = T.split(`
`)[3];
          console.log(`%c${v.trim()}`, "text-align: right"), console.groupEnd();
        }) : d instanceof p && await d.report(t);
      }), console.groupEnd();
    })();
  }
  /** await r
   * un() before call this */
  json() {
    const { modules: t, result: e, title: o, stack: c } = this, i = c.split(`
`)[4];
    return {
      result: e,
      title: o,
      line: i,
      modules: t.map((r) => ({
        title: r.title,
        result: r.result,
        expects: r instanceof n ? r.messengers.map((h) => {
          const { title: f } = r, { stack: d, ...y } = h, m = d.split(`
`)[3];
          return { ...y, title: f, line: m };
        }) : void 0,
        tests: r instanceof p ? r.json() : void 0
      }))
    };
  }
}
const H = (s, t, e) => {
  const o = e ? new p(s, t, e) : t ? new p(s, t) : new p(s);
  return o.parent = window.chk, window.chk.modules.push(o), o;
};
n.prototype.deq = n.prototype["==="] = function(s) {
  const { subject: t } = this;
  return this.process("===", t === s, t, s), this;
};
u.deq = u["==="] = [g("===")];
n.prototype.eq = n.prototype["=="] = function(s) {
  const { subject: t } = this;
  return this.process("==", t == s, t, s), this;
};
u.eq = u["=="] = [g("==")];
n.prototype.greaterThan = n.prototype[">"] = function(s) {
  const { subject: t } = this;
  return this.process(">", t > s, t, s), this;
};
u.greaterThan = u[">"] = [g(">")];
n.prototype.lessThan = n.prototype["<"] = function(s) {
  const { subject: t } = this;
  return this.process("<", t < s, t, s), this;
};
u.lessThan = u["<"] = [g("<")];
n.prototype.ndeq = n.prototype["!=="] = function(s) {
  const { subject: t } = this;
  return this.process("!==", t !== s, t, s), this;
};
u.ndeq = u["!=="] = [g("!==")];
n.prototype.neq = n.prototype["!="] = function(s) {
  const { subject: t } = this;
  return this.process("!=", t != s, t, s), this;
};
u.neq = u["!="] = [g("!=")];
n.prototype.setTitle = n.prototype.$ = function(s) {
  return this.title = s, this;
};
n.prototype["array.contains"] = function(s) {
  const { subject: t } = this;
  return this.process("array.contains", s.every((e) => t.includes(e)), t, s), this;
};
class P {
  constructor() {
    a(this, "modules", []);
  }
  async test() {
    const t = +new Date(), { modules: e } = this, o = [];
    e.forEach((c) => o.push(c.test())), await Promise.all(o), console.log(`%c TEST %c ${(+new Date() - t) / 1e3} ms`, "border: 1px solid gray;font-weight:bold;background-color:yellow", "");
  }
  async report(t = { head: !1 }) {
    const e = +new Date(), { modules: o } = this, c = [];
    o.forEach((l) => c.push(l.report(t))), await Promise.all(c), console.log(`%c REPORT %c ${(+new Date() - e) / 1e3} ms`, "border: 1px solid gray;font-weight:bold;background-color:yellow", "");
  }
  async run(t = { head: !1 }) {
    await this.test(), await this.report(t);
  }
  json() {
    return this.modules.map((t) => t.json());
  }
}
window.chk = new P();
export {
  P as Check,
  n as Expect,
  p as Test,
  x as format,
  u as messengers,
  H as test
};
