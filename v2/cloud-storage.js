(() => {
  "use strict";

  const cfg = window.SJSC_FIREBASE_CONFIG || {};
  const configured = Boolean(cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId);
  const listeners = new Set();
  let auth = null;
  let db = null;
  let currentUser = null;
  let readyPromise = null;
  let authResolved = false;

  const isoNow = () => new Date().toISOString();
  const userDoc = () => window.SJSCFirebase.doc(db, "users", currentUser.uid);

  function emitAuth() {
    listeners.forEach((listener) => {
      try { listener(currentUser); } catch (error) { console.error(error); }
    });
  }

  async function ready() {
    if (!configured) return false;
    if (readyPromise) return readyPromise;
    readyPromise = (async () => {
      const [appApi, authApi, storeApi] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js"),
        import("https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js")
      ]);
      const app = appApi.getApps().length ? appApi.getApp() : appApi.initializeApp(cfg);
      auth = authApi.getAuth(app);
      db = storeApi.getFirestore(app);
      auth.languageCode = "ar";
      window.SJSCFirebase = { ...authApi, ...storeApi };
      try { await authApi.setPersistence(auth, authApi.browserLocalPersistence); } catch (error) { console.warn("SJSC auth persistence", error); }
      await new Promise((resolve) => {
        let first = true;
        authApi.onAuthStateChanged(auth, (user) => {
          currentUser = user || null;
          authResolved = true;
          emitAuth();
          if (first) { first = false; resolve(); }
        }, (error) => {
          console.error("SJSC auth state", error);
          if (first) { first = false; resolve(); }
        });
      });
      return true;
    })();
    return readyPromise;
  }

  async function user() {
    if (!(await ready())) return null;
    return currentUser;
  }

  function subscribeAuth(listener) {
    listeners.add(listener);
    if (authResolved) queueMicrotask(() => listener(currentUser));
    else ready().catch(() => listener(null));
    return () => listeners.delete(listener);
  }

  async function signInWithGoogle() {
    if (!(await ready())) throw new Error("الحفظ السحابي غير مهيأ.");
    const provider = new window.SJSCFirebase.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    return window.SJSCFirebase.signInWithPopup(auth, provider);
  }

  async function signInWithEmail(email, password) {
    if (!(await ready())) throw new Error("الحفظ السحابي غير مهيأ.");
    return window.SJSCFirebase.signInWithEmailAndPassword(auth, email, password);
  }

  async function createAccount(email, password) {
    if (!(await ready())) throw new Error("الحفظ السحابي غير مهيأ.");
    return window.SJSCFirebase.createUserWithEmailAndPassword(auth, email, password);
  }

  async function resetPassword(email) {
    if (!(await ready())) throw new Error("الحفظ السحابي غير مهيأ.");
    return window.SJSCFirebase.sendPasswordResetEmail(auth, email);
  }

  async function signOut() {
    if (!(await ready()) || !auth) return;
    await window.SJSCFirebase.signOut(auth);
  }

  async function readCompanies() {
    if (!currentUser) return [];
    const snapshot = await window.SJSCFirebase.getDoc(userDoc());
    const records = snapshot.exists() ? snapshot.data()?.sjscCapitalDesigner?.companies : [];
    return Array.isArray(records) ? records : [];
  }

  async function writeCompanies(incoming) {
    if (!currentUser) throw new Error("سجّل الدخول أولا.");
    const owner = currentUser;
    const ref = userDoc();
    await window.SJSCFirebase.runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(ref);
      const remote = snapshot.data()?.sjscCapitalDesigner?.companies || [];
      const records = new Map(remote.map((record) => [record.id, record]));
      for (const record of incoming) {
        const previous = records.get(record.id);
        if (!previous || String(record.updatedAt) >= String(previous.updatedAt)) records.set(record.id, record);
      }
      const companies = [...records.values()];
      if (currentUser?.uid !== owner.uid) throw new Error("auth/user-changed");
      transaction.set(ref, {
      sjscCapitalDesigner: {
        schemaVersion: 1,
        updatedAt: window.SJSCFirebase.serverTimestamp(),
        companies
      },
      account: {
        email: owner.email || "",
        displayName: owner.displayName || ""
      }
      }, { merge: true });
    });
  }

  async function listCompanies() {
    if (!(await user())) return [];
    return (await readCompanies())
      .map(({ id, companyName, updatedAt }) => ({ id, company_name: companyName, updated_at: updatedAt }))
      .sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")));
  }

  async function loadCompany(id) {
    if (!(await user())) throw new Error("سجّل الدخول أولا.");
    const record = (await readCompanies()).find((item) => item.id === id);
    if (!record) throw new Error("تعذر العثور على الشركة المحفوظة.");
    return { id: record.id, company_name: record.companyName, data: record.data, updated_at: record.updatedAt };
  }

  async function saveCompany(record) {
    if (!(await user())) throw new Error("سجّل الدخول أولا.");
    const stored = {
      id: record.id,
      companyName: record.companyName,
      updatedAt: isoNow(),
      data: record.data
    };
    await writeCompanies([stored]);
    return stored;
  }

  async function mergeLocalCompanies(localRecords) {
    if (!(await user())) return;
    const remote = await readCompanies();
    const byId = new Map(remote.map((record) => [record.id, record]));
    for (const local of localRecords || []) {
      const existing = byId.get(local.id);
      if (!existing || String(local.updatedAt || "") > String(existing.updatedAt || "")) byId.set(local.id, local);
    }
    const merged = [...byId.values()].sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
    if (merged.length) await writeCompanies(merged);
  }

  function encodeShare(snapshot) {
    const bytes = new TextEncoder().encode(JSON.stringify(snapshot));
    let binary = "";
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function decodeShare(token) {
    const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64 + "=".repeat((4 - base64.length % 4) % 4));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  async function createShare(companyId, snapshot) {
    const token = encodeShare({ ...snapshot, id: companyId });
    return `${location.origin}${location.pathname}#shareDesigner?share=${encodeURIComponent(token)}`;
  }

  async function getSharedDesign(token) {
    try {
      if (token.length > 200000) return null;
      const data = decodeShare(token);
      if (!data?.capital || !Array.isArray(data.stocks) || !data.stocks.length || data.stocks.length > 100) return null;
      if (!['SAR', 'USD'].includes(data.capital.currency) || !['cash', 'inkind', 'mixed'].includes(data.capital.type)) return null;
      if (data.stocks.some((row) => !row || !['none','new','existing'].includes(row.categoryMode))) return null;
      data.stocks = data.stocks.map((row) => ({ ...row, categoryName: String(row.categoryName || ''), existingCategory: String(row.existingCategory || ''), rights: String(row.rights || ''), extra: String(row.extra || '') }));
      data.attachments = data.attachments || {};
      return data;
    } catch { return null; }
  }

  function errorMessage(error) {
    const code = String(error?.code || error?.message || "");
    if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "البريد أو كلمة المرور غير صحيحة.";
    if (code.includes("email-already-in-use")) return "يوجد حساب مرتبط بهذا البريد.";
    if (code.includes("weak-password")) return "استخدم كلمة مرور من 6 أحرف على الأقل.";
    if (code.includes("invalid-email")) return "اكتب بريدا إلكترونيا صحيحا.";
    if (code.includes("popup-closed-by-user")) return "أغلقت نافذة تسجيل الدخول قبل اكتمال العملية.";
    if (code.includes("popup-blocked")) return "اسمح بالنوافذ المنبثقة ثم أعد المحاولة.";
    if (code.includes("network-request-failed") || code.includes("unavailable")) return "تعذر الاتصال بالسحابة الآن.";
    if (code.includes("permission-denied")) return "تعذر حفظ الملفات في الحساب. النسخة المحلية متاحة على جهازك.";
    if (code.includes("unauthorized-domain")) return "تسجيل الدخول غير متاح من هذا العنوان. افتح رابط الموقع المنشور.";
    if (code.includes("too-many-requests")) return "محاولات كثيرة. أعد المحاولة بعد قليل.";
    if (code.includes("operation-not-allowed")) return "طريقة الدخول هذه غير متاحة حاليا. جرّب طريقة الدخول الأخرى.";
    return "تعذر إكمال العملية الآن.";
  }

  window.SJSCCloud = {
    provider: "firebase",
    isConfigured: configured,
    ready,
    user,
    subscribeAuth,
    signInWithGoogle,
    signInWithEmail,
    createAccount,
    resetPassword,
    signOut,
    listCompanies,
    loadCompany,
    saveCompany,
    mergeLocalCompanies,
    createShare,
    getSharedDesign,
    errorMessage
  };
})();
