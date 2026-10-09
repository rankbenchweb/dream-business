"""
A small local stand-in for the parts of Supabase the website uses, for
end-to-end testing when the real services can't be run here.

  Auth:  POST /auth/v1/otp, GET /auth/v1/verify, POST /auth/v1/token
         (pkce, refresh_token), GET /auth/v1/user, POST /auth/v1/logout
  REST:  GET/POST/PATCH /rest/v1/<table> with select, eq, in, order, limit

Every REST request runs inside PostgreSQL as anon, authenticated (with the
user's id) or service_role, so the real RLS policies and triggers decide what
happens. Sign-in emails are appended to EMAIL_LOG as JSON lines.

It mimics response shapes closely enough for supabase-js, but it is NOT
Supabase: always repeat the final check against a real project.

Usage: python3 fake_supabase.py <dbname> <email_log> [port]
"""
import base64, hashlib, hmac, json, re, secrets, sys, threading, time, uuid
from datetime import date, datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

import psycopg
from psycopg import sql

DB, EMAIL_LOG = sys.argv[1], sys.argv[2]
PORT = int(sys.argv[3]) if len(sys.argv) > 3 else 54321
SECRET = b"local-test-jwt-secret"
KEYS = {"sb_publishable_test": "anon", "sb_secret_test": "service_role"}
IDENT = re.compile(r"^[a-z_][a-z0-9_]*$")
TABLES = {"profiles", "organizations", "organization_members", "listing_categories", "business_listings", "campaigns", "campaign_metrics", "saved_items", "audit_log"}

lock = threading.Lock()
pending = {}   # one-time email token -> {email, challenge}
codes = {}     # auth code -> {user_id, email, challenge}
refresh = {}   # refresh token -> {user_id, email, session_id}
revoked = set()


def b64(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()


def jwt(payload: dict) -> str:
    head = b64(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    body = b64(json.dumps(payload).encode())
    sig = b64(hmac.new(SECRET, f"{head}.{body}".encode(), hashlib.sha256).digest())
    return f"{head}.{body}.{sig}"


def read_jwt(token: str):
    try:
        head, body, sig = token.split(".")
        good = b64(hmac.new(SECRET, f"{head}.{body}".encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(sig, good):
            return None
        claims = json.loads(base64.urlsafe_b64decode(body + "=" * (-len(body) % 4)))
        if claims.get("exp", 0) < time.time() or claims.get("session_id") in revoked:
            return None
        return claims
    except Exception:
        return None


def conn():
    return psycopg.connect(f"dbname={DB} host=/var/run/postgresql")


def user_obj(uid, email):
    now = datetime.utcnow().isoformat() + "Z"
    return {"id": uid, "aud": "authenticated", "role": "authenticated", "email": email, "email_confirmed_at": now,
            "app_metadata": {"provider": "email", "providers": ["email"]}, "user_metadata": {}, "identities": [],
            "created_at": now, "updated_at": now, "is_anonymous": False}


def session(uid, email, session_id=None):
    session_id = session_id or str(uuid.uuid4())
    exp = int(time.time()) + 3600
    access = jwt({"sub": uid, "email": email, "role": "authenticated", "aud": "authenticated", "exp": exp, "iat": int(time.time()), "session_id": session_id})
    rt = secrets.token_urlsafe(24)
    with lock:
        refresh[rt] = {"user_id": uid, "email": email, "session_id": session_id}
    return {"access_token": access, "token_type": "bearer", "expires_in": 3600, "expires_at": exp, "refresh_token": rt, "user": user_obj(uid, email)}


def jsonable(v):
    if isinstance(v, (datetime, date)):
        return v.isoformat()
    if isinstance(v, uuid.UUID):
        return str(v)
    return v


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, *a):
        pass

    # -- helpers ---------------------------------------------------------
    def send(self, status, body=None, headers=None):
        data = b"" if body is None else json.dumps(body, default=jsonable).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        for k, v in (headers or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(data)

    def body(self):
        n = int(self.headers.get("Content-Length") or 0)
        return json.loads(self.rfile.read(n) or b"null") if n else None

    def auth_error(self, status, code, msg):
        self.send(status, {"code": status, "error_code": code, "msg": msg})

    def role(self):
        """Returns (role, user_id) for the request."""
        auth = self.headers.get("Authorization", "")
        token = auth[7:] if auth.lower().startswith("bearer ") else ""
        if token in KEYS:
            return KEYS[token], None
        if token:
            claims = read_jwt(token)
            if not claims:
                return None, None
            return claims["role"], claims["sub"]
        return KEYS.get(self.headers.get("apikey", "")), None

    # -- routing ---------------------------------------------------------
    def do_GET(self):
        self.route("GET")

    def do_POST(self):
        self.route("POST")

    def do_PATCH(self):
        self.route("PATCH")

    def route(self, method):
        url = urlparse(self.path)
        q = parse_qs(url.query)
        try:
            if url.path.startswith("/auth/v1/"):
                return self.auth(method, url.path[len("/auth/v1/"):], q)
            if url.path.startswith("/rest/v1/"):
                return self.rest(method, url.path[len("/rest/v1/"):], url.query)
            self.send(404, {"message": "not found"})
        except Exception as e:  # surface bugs in the stand-in loudly
            print("FAKE ERROR", method, self.path, repr(e), flush=True)
            self.send(500, {"message": str(e)})

    # -- auth ------------------------------------------------------------
    def auth(self, method, path, q):
        # The email link (verify) is opened in a browser without an API key, as on Supabase.
        if path != "verify" and KEYS.get(self.headers.get("apikey", "")) is None:
            return self.auth_error(401, "no_api_key", "No API key found in request")
        if method == "POST" and path == "otp":
            b = self.body() or {}
            email = (b.get("email") or "").strip().lower()
            if not email:
                return self.auth_error(400, "validation_failed", "email required")
            token = secrets.token_hex(16)
            with lock:
                pending[token] = {"email": email, "challenge": b.get("code_challenge")}
            redirect_to = q.get("redirect_to", [""])[0]
            link = f"http://127.0.0.1:{PORT}/auth/v1/verify?" + urlencode({"token": token, "type": "magiclink", "redirect_to": redirect_to})
            with open(EMAIL_LOG, "a") as f:
                f.write(json.dumps({"to": email, "link": link, "pkce": bool(b.get("code_challenge"))}) + "\n")
            return self.send(200, {})
        if method == "GET" and path == "verify":
            token = q.get("token", [""])[0]
            redirect_to = q.get("redirect_to", [""])[0]
            with lock:
                p = pending.pop(token, None)
            target = urlparse(redirect_to)
            if not p:
                frag = urlencode({"error": "access_denied", "error_code": "otp_expired", "error_description": "Email link is invalid or has expired"})
                return self.send(303, None, {"Location": urlunparse(target._replace(fragment=frag))})
            with conn() as c:
                row = c.execute("select id from auth.users where email=%s", (p["email"],)).fetchone()
                uid = str(row[0]) if row else str(uuid.uuid4())
                if not row:
                    c.execute("insert into auth.users (id, email) values (%s, %s)", (uid, p["email"]))
            code = str(uuid.uuid4())
            with lock:
                codes[code] = {"user_id": uid, "email": p["email"], "challenge": p["challenge"]}
            query = parse_qs(target.query)
            query["code"] = [code]
            return self.send(303, None, {"Location": urlunparse(target._replace(query=urlencode(query, doseq=True)))})
        if method == "POST" and path == "token":
            grant = q.get("grant_type", [""])[0]
            b = self.body() or {}
            if grant == "pkce":
                with lock:
                    c = codes.pop(b.get("auth_code", ""), None)
                if not c:
                    return self.auth_error(404, "flow_state_not_found", "invalid flow state, no valid flow state found")
                verifier = b.get("code_verifier", "")
                if b64(hashlib.sha256(verifier.encode()).digest()) != c["challenge"]:
                    return self.auth_error(403, "bad_code_verifier", "code challenge does not match previously saved code verifier")
                return self.send(200, session(c["user_id"], c["email"]))
            if grant == "refresh_token":
                with lock:
                    r = refresh.pop(b.get("refresh_token", ""), None)
                if not r or r["session_id"] in revoked:
                    return self.auth_error(400, "refresh_token_not_found", "Invalid Refresh Token: Refresh Token Not Found")
                return self.send(200, session(r["user_id"], r["email"], r["session_id"]))
            return self.auth_error(400, "unsupported_grant_type", "unsupported grant type")
        if method == "GET" and path == "user":
            auth = self.headers.get("Authorization", "")
            claims = read_jwt(auth[7:]) if auth.lower().startswith("bearer ") else None
            if not claims or claims.get("role") != "authenticated":
                return self.auth_error(403, "bad_jwt", "invalid JWT: unable to parse or verify signature")
            return self.send(200, user_obj(claims["sub"], claims["email"]))
        if method == "POST" and path == "logout":
            auth = self.headers.get("Authorization", "")
            claims = read_jwt(auth[7:]) if auth.lower().startswith("bearer ") else None
            if claims:
                revoked.add(claims.get("session_id"))
            return self.send(204)
        return self.auth_error(404, "not_found", "not found")

    # -- rest ------------------------------------------------------------
    def rest(self, method, table, raw_query):
        role, uid = self.role()
        if role is None:
            return self.send(401, {"code": "PGRST301", "message": "JWT invalid", "details": None, "hint": None})
        if table not in TABLES:
            return self.send(404, {"code": "PGRST205", "message": f"Could not find the table 'public.{table}'"})
        params = parse_qs(raw_query, keep_blank_values=True)
        select = params.pop("select", ["*"])[0]
        order = params.pop("order", [None])[0]
        limit = params.pop("limit", [None])[0]
        cols = sql.SQL("*") if select == "*" else sql.SQL(", ").join(sql.Identifier(c.strip()) for c in select.split(",") if IDENT.match(c.strip()))
        where, args = [], []
        for col, values in params.items():
            if not IDENT.match(col):
                return self.send(400, {"code": "PGRST100", "message": f"bad column {col}"})
            for v in values:
                op, _, val = v.partition(".")
                if op == "eq":
                    where.append(sql.SQL("{} = %s").format(sql.Identifier(col)))
                    args.append(val)
                elif op == "in":
                    items = [x.strip().strip('"') for x in val.strip("()").split(",") if x.strip()]
                    where.append(sql.SQL("{}::text = any(%s)").format(sql.Identifier(col)))
                    args.append(items)
                else:
                    return self.send(400, {"code": "PGRST100", "message": f"unsupported operator {op}"})
        where_sql = sql.SQL(" where ") + sql.SQL(" and ").join(where) if where else sql.SQL("")
        single = "vnd.pgrst.object" in self.headers.get("Accept", "")
        wants_rows = "return=representation" in self.headers.get("Prefer", "")
        t = sql.Identifier("public", table)

        if method == "GET":
            q = sql.SQL("select {} from {}{}").format(cols, t, where_sql)
            if order:
                parts = []
                for o in order.split(","):
                    bits = o.split(".")
                    if not IDENT.match(bits[0]):
                        return self.send(400, {"message": "bad order"})
                    parts.append(sql.SQL("{} {}").format(sql.Identifier(bits[0]), sql.SQL("desc" if "desc" in bits[1:] else "asc")))
                q += sql.SQL(" order by ") + sql.SQL(", ").join(parts)
            if limit:
                q += sql.SQL(" limit {}").format(sql.Literal(int(limit)))
        elif method == "POST":
            b = self.body()
            rows = b if isinstance(b, list) else [b]
            keys = list(rows[0].keys())
            if not all(IDENT.match(k) for k in keys):
                return self.send(400, {"message": "bad column"})
            q = sql.SQL("insert into {} ({}) values ({})").format(t, sql.SQL(", ").join(map(sql.Identifier, keys)), sql.SQL(", ").join(sql.Placeholder() * len(keys)))
            args = [rows[0][k] for k in keys]
            if len(rows) != 1:
                return self.send(400, {"message": "bulk insert not supported by the stand-in"})
            q += sql.SQL(" returning {}").format(cols)
        elif method == "PATCH":
            b = self.body() or {}
            if not all(IDENT.match(k) for k in b):
                return self.send(400, {"message": "bad column"})
            sets = sql.SQL(", ").join(sql.SQL("{} = %s").format(sql.Identifier(k)) for k in b)
            q = sql.SQL("update {} set {}{} returning {}").format(t, sets, where_sql, cols)
            args = list(b.values()) + args
        else:
            return self.send(405, {"message": "method not allowed"})

        try:
            with conn() as c:
                with c.cursor() as cur:
                    cur.execute(sql.SQL("set local role {}").format(sql.Identifier(role)))
                    cur.execute("select set_config('request.jwt.claim.sub', %s, true)", (uid or "",))
                    cur.execute(q, args)
                    names = [d.name for d in cur.description] if cur.description else []
                    out = [dict(zip(names, r)) for r in cur.fetchall()] if cur.description else []
        except psycopg.Error as e:
            diag = e.diag
            code = diag.sqlstate or "XX000"
            status = {"23505": 409, "23503": 409, "23514": 400, "22P02": 400, "P0001": 400, "42501": 403 if role != "anon" else 401}.get(code, 400)
            return self.send(status, {"code": code, "message": diag.message_primary or str(e), "details": diag.message_detail, "hint": diag.message_hint})

        if method in ("POST", "PATCH") and not wants_rows:
            return self.send(201 if method == "POST" else 204)
        if single:
            if len(out) != 1:
                return self.send(406, {"code": "PGRST116", "message": "JSON object requested, multiple (or no) rows returned", "details": f"The result contains {len(out)} rows", "hint": None})
            return self.send(201 if method == "POST" else 200, out[0])
        return self.send(201 if method == "POST" else 200, out)


if __name__ == "__main__":
    print(f"fake supabase on {PORT} using {DB}", flush=True)
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
