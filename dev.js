
        const $ = s => document.querySelector(s), el = (t, c) => { const e = document.createElement(t); if (c) e.className = c; return e };
        const S = {
            name: 'WIN-' + Math.random().toString(36).slice(2, 9).toUpperCase(), nameChanged: false, dom: '', wg: 'WORKGROUP', pw: null, rm: 1, ping: 0, upd: 'Download only', rd: 0, tele: 'Required', dhcp: 1, addr: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1', dns: '', web: 0, iisVerified: 0, adds: 0, dc: 0, shares: [], folderRedir: 0, driveMap: 0, tz: -480, tzn: '(UTC-08:00) Pacific Time (US & Canada)', off: 0,
            ous: [], adUsers: [], gpos: [],
            users: { Administrator: { en: 'True', d: 'Built-in account for administering the computer/domain', a: 1, f: '' }, DefaultAccount: { en: 'False', d: 'A user account managed by the system.' }, Guest: { en: 'False', d: 'Built-in account for guest access to the computer/domain' }, WDAGUtilityAccount: { en: 'False', d: 'A user account managed and used by the system for Windows Defender Application Guard scenarios.' } }
        };
        const LAB_STORAGE_KEY = 'serverLabState';
        let restoredTrackerTask = 0;
        let resettingLab = false;
        try {
            const stored = localStorage.getItem(LAB_STORAGE_KEY);
            if (stored) {
                const saved = JSON.parse(stored);
                if (saved && typeof saved === 'object' && saved.state && typeof saved.state === 'object') {
                    Object.keys(saved.state).forEach(key => {
                        if (key in S && key !== 'users') S[key] = saved.state[key];
                    });
                    if (saved.state.users && typeof saved.state.users === 'object') {
                        S.users = { ...S.users, ...saved.state.users };
                    }
                    if (saved.state.sp && typeof saved.state.sp === 'object') S.sp = saved.state.sp;
                    if (saved.trackerTask === 1 || saved.trackerTask === 2) restoredTrackerTask = saved.trackerTask;
                }
            }
        } catch (error) {
            console.error('Unable to restore the saved lab progress.', error);
        }
        function saveLabState() {
            if (resettingLab) return;
            try {
                localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify({ state: S, trackerTask: currentTask }));
            } catch (error) {
                console.error('Unable to save the lab progress.', error);
            }
        }
        function resetLab() {
            resettingLab = true;
            try {
                localStorage.removeItem(LAB_STORAGE_KEY);
            } catch (error) {
                console.error('Unable to clear the saved lab progress.', error);
            }
            location.reload();
        }
        const TZ = [['(UTC-08:00) Pacific Time (US & Canada)', -480], ['(UTC-05:00) Eastern Time (US & Canada)', -300], ['(UTC) Coordinated Universal Time', 0], ['(UTC+08:00) Kuala Lumpur, Singapore', 480]];
        const T = $('#term'), IN = $('#in'), PR = $('#pr'), OUT = $('#out'), ROW = $('#row'), O = $('#ov');
        let H = null, busy = 0, mode = 'sc', curDir = 'C:\\Users\\Administrator';
        const w = (t = '') => { OUT.append(t + '\n'); T.scrollTop = 1e9 }, clr = () => { OUT.textContent = '' };
        const sip = () => S.dhcp ? '192.168.1.10' : S.addr, sub24 = i => i.split('.').slice(0, 3).join('.') == '192.168.1', ip4 = x => /^(\d{1,3}\.){3}\d{1,3}$/.test(x.trim()) && x.trim().split('.').every(n => n <= 255);
        const isSrv = h => h == sip() || h == S.name.toLowerCase() || (S.dc && h == S.name.toLowerCase() + '.' + S.dom);
        const wall = () => new Date(Date.now() + S.off + S.tz * 60000), fmt = () => wall().toISOString().slice(0, 16).replace('T', ' ');
        const tb = (h, r) => { const c = h.map((x, i) => Math.max(x.length, ...r.map(y => String(y[i]).length))); const f = a => a.map((x, i) => i == a.length - 1 ? x : String(x).padEnd(c[i] + 1)).join(''); return '\n' + f(h) + '\n' + f(h.map(x => '-'.repeat(x.length))) + '\n' + r.map(f).join('\n') + '\n' };
        const ukey = n => Object.keys(S.users).find(k => k.toLowerCase() == String(n).toLowerCase());
        function ask(p, h, sec) { PR.textContent = p; IN.type = sec ? 'password' : 'text'; IN.value = ''; H = h; IN.focus() }
        IN.onkeydown = e => { if (e.key != 'Enter' || busy || !H) return; const v = IN.value, h = H, s = IN.type == 'password'; OUT.append(PR.textContent + (s ? (mode == 'ps' ? '*'.repeat(v.length) : '') : v) + '\n'); IN.value = ''; h(v) };
        $('#term').onclick = () => { if (!getSelection().toString()) IN.focus() };
        function later(f, ms) { busy = 1; ROW.style.visibility = 'hidden'; setTimeout(() => { busy = 0; ROW.style.visibility = ''; f() }, ms) }
        function seq(q, cb, cancel, i = 0, a = []) { if (i == q.length) return cb(a); ask(q[i][0], v => { if (!i && !v.trim()) return cancel(); seq(q, cb, cancel, i + 1, [...a, v]) }, q[i][1]) }
        const ret = m => { w('\n' + m + '\n'); ask('Press Enter to return to the main menu...', sc) };
        const rs = m => { w('\n' + m); ask('Restart now? (Y)es or (N)o: ', v => /^y/i.test(v) ? reboot() : sc()) };
        function sub(t, items, fn) { clr(); w(t); w(); items.forEach((x, i) => w(' ' + (i + 1) + ') ' + x)); w(); ask('Select option (blank=cancel): ', v => { v = v.trim(); if (!v) return sc(); items[v - 1] ? fn(+v) : sub(t, items, fn) }) }
        function skin() { $('#win').className = ''; $('#ti').textContent = 'Administrator: C:\\Windows\\system32\\cmd.exe'; $('#t0 span').textContent = 'Windows Server 2025 · ' + S.name }

        /* Cheat Sheet PIN Logic */
        function unlockCheat() {
            const pin = $('#pin-input').value;
            if (pin === 'Global#123') {
                $('#pin-prompt').style.display = 'none';
                $('#cheat-content').style.display = 'block';
            } else {
                $('#pin-error').style.display = 'inline';
                $('#pin-input').value = '';
                setTimeout(() => $('#pin-error').style.display = 'none', 2000);
            }
        }

        /* overlay */
        const ovr = () => { }; function scr(msg, f, btn, cb) { mode = 'sc'; skin(); clr(); if (msg) w(msg + '\n'); if (f.length) seq(f.map(x => [x + ': ', 1]), a => cb(a), () => scr(msg, f, btn, cb)); else ask('Press Enter to continue...', () => cb([])) } function off() { mode = 'sc'; skin(); clr(); w('Server is powered off.'); ask('Press Enter to power on...', () => spin('Starting', 1500, login)) }
        function spin(m, ms, n) { mode = 'sc'; skin(); clr(); w(m + '...'); later(n, ms) }
        function scrOld(msg, f, btn, cb) { ovr('<div class=lp><div class=av></div><b>Administrator</b><p>' + msg + '</p>' + f.map(x => '<input type=password placeholder="' + x + '">').join('') + '<button>' + btn + '</button></div>'); const i = [...O.querySelectorAll('input')], b = O.querySelector('button'); b.onclick = () => cb(i.map(x => x.value)); if (i[0]) i[0].focus(); i.forEach(x => x.onkeydown = e => e.key == 'Enter' && b.click()) }
        function lg(err) { scr(err || '', ['Password'], '→', a => a[0] == S.pw ? desk() : lg('The user name or password is incorrect.')) }
        function np(err) { scr(err || 'Enter a new password for Administrator', ['New password', 'Confirm password'], '→', a => { if (a[0] != a[1]) return np('The passwords do not match.'); if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).{8,}$/.test(a[0])) return np('Use 8+ characters with upper, lower and a number or symbol.'); S.pw = a[0]; scr('Your password has been changed.', [], 'OK', desk) }) }
        const login = () => S.pw == null ? scr('The user’s password must be changed before signing in.', [], 'OK', () => np()) : lg();
        const desk = () => sc(), reboot = () => spin('Restarting', 2500, login);

        /* --- Date/Time GUI Logic --- */
        let guiLayer = null;
        function showDateTimeUI() {
            if (guiLayer) return;
            guiLayer = el('div'); guiLayer.id = 'gui-layer';
            const updateText = () => {
                const d = wall();
                const dStr = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                const tStr = d.toLocaleTimeString('en-US', { hour12: true });
                $('#dt-date').textContent = dStr;
                $('#dt-time').textContent = tStr;
                $('#dt-tz-text').textContent = S.tzn;
                if ($('#tz-current-dt')) $('#tz-current-dt').textContent = dStr + ', ' + tStr;
            };
            guiLayer.innerHTML = `
    <div class="win-dialog" id="dt-dlg">
        <div class="win-title">Date and Time <span class="win-close" id="dt-close">✕</span></div>
        <div class="win-tabs">
            <div class="win-tab active">Date and Time</div>
            <div class="win-tab">Additional Clocks</div>
            <div class="win-tab">Internet Time</div>
        </div>
        <div class="win-body">
            <div class="dt-top">
                <div class="dt-clock">🕒</div>
                <div class="dt-info">
                    <div>Date: <span id="dt-date"></span></div>
                    <div>Time: <span id="dt-time"></span></div>
                    <button class="btn-link" id="dt-change-time">Change date and time...</button>
                </div>
            </div>
            <div class="dt-bottom">
                <div style="font-weight:600">Time zone</div>
                <div id="dt-tz-text" style="font-size:12px;color:#555"></div>
                <button class="btn-link" id="dt-change-tz">Change time zone...</button>
            </div>
            <div class="dt-footer">
                <label><input type="checkbox" checked> Notify me when the clock changes</label>
            </div>
            <div class="dt-buttons">
                <button id="dt-ok">OK</button>
                <button id="dt-cancel">Cancel</button>
                <button>Apply</button>
            </div>
        </div>
    </div>
    <div class="win-dialog" id="tz-dlg" style="display:none;z-index:11;">
        <div class="win-title">Time Zone Settings <span class="win-close" id="tz-close">✕</span></div>
        <div class="win-body" style="padding:16px;">
            <p style="margin:0 0 8px 0">Set the time zone</p>
            <label style="font-size:12px;">Time zone:</label>
            <select id="tz-select">
                ${TZ.map(z => `<option value="${z[1]}">${z[0]}</option>`).join('')}
            </select>
            <label style="margin-top:8px;font-size:12px;"><input type="checkbox" checked> Automatically adjust clock for Daylight Saving Time</label>
            <p style="margin-top:12px;font-size:12px;">Current date and time: <span id="tz-current-dt"></span></p>
            <div class="dt-buttons" style="margin-top:8px;">
                <button id="tz-ok" style="border-color:#0078d7;">OK</button>
                <button id="tz-cancel">Cancel</button>
            </div>
        </div>
    </div>`;
            document.querySelector('#main').appendChild(guiLayer);
            $('#tz-select').value = S.tz;
            updateText();
            const closeAll = () => { guiLayer.remove(); guiLayer = null; sc(); };
            $('#dt-close').onclick = closeAll; $('#dt-cancel').onclick = closeAll;
            $('#dt-ok').onclick = () => { guiLayer.remove(); guiLayer = null; sc(); };
            $('#dt-change-tz').onclick = () => { $('#tz-dlg').style.display = 'block'; $('#dt-dlg').style.opacity = '0.5'; updateText(); };
            $('#tz-close').onclick = $('#tz-cancel').onclick = () => { $('#tz-dlg').style.display = 'none'; $('#dt-dlg').style.opacity = '1'; $('#tz-select').value = S.tz; };
            $('#tz-ok').onclick = () => { const sel = $('#tz-select'); S.tz = parseInt(sel.value); S.tzn = sel.options[sel.selectedIndex].text; updateText(); $('#tz-dlg').style.display = 'none'; $('#dt-dlg').style.opacity = '1'; };
            $('#dt-change-time').onclick = () => {
                guiLayer.remove(); guiLayer = null;
                clr();
                seq([['Enter date and time (yyyy-mm-dd hh:mm): ']], a => {
                    const m = a[0].trim().match(/^(\d{4})-(\d\d)-(\d\d) (\d\d):(\d\d)$/);
                    if (m) { const t = Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5]); if (!isNaN(t)) S.off = t - Date.now() - S.tz * 60000; }
                    showDateTimeUI();
                }, () => showDateTimeUI());
            };
        }

        /* sconfig */
        const E = () => '='.repeat(79), R = (a, b = '') => ' ' + a.padEnd(38) + b;
        function sc() {
            mode = 'sc'; skin(); clr(); const rd = S.rd ? 'Enabled (' + (S.rd == 1 ? 'more secure' : 'all') + ' clients)' : 'Disabled';
            [E(), ' '.repeat(23) + 'Welcome to Windows Server 2025 Datacenter', E(), '', R('1) Domain/workgroup:', S.dom ? 'Domain: ' + S.dom : 'Workgroup: ' + S.wg), R('2) Computer name:', S.name), R('3) Add local administrator'), R('4) Remote management:', S.rm ? 'Enabled' : 'Disabled'), '', R('5) Update setting:', S.upd), R('6) Install updates'), R('7) Remote desktop:', rd), '', R('8) Network settings'), R('9) Date and time'), R('10) Telemetry setting:', S.tele), R('11) Windows activation'), '', R('12) Log off user'), R('13) Restart server'), R('14) Shut down server'), R('15) Exit to command line (CMD)'), ''].forEach(l => w(l));
            ask('Enter number to select an option: ', v => { const f = M[v.trim()]; f ? f() : sc() })
        }
        const yn = (q, f) => ask(q + ' (Y)es or (N)o: ', v => /^y/i.test(v) ? f() : sc());
        const M = {
            1: () => {
                clr(); ask('Join (D)omain or (W)orkgroup? (Blank=Cancel) ', v => {
                    v = v.trim().toLowerCase();
                    if (v == 'w') seq([['Name of workgroup to join: ']], a => { S.wg = a[0].trim().toUpperCase(); ret('Workgroup changed to ' + S.wg + '.') }, sc);
                    else if (v == 'd') seq([['Name of domain to join: '], ['Specify an authorized domain\\user: '], ['Type the password associated with the domain user: ', 1]], a => { if (S.dc) return ret('This server is a domain controller.'); if (!/^[\w-]+(\.[\w-]+)+$/.test(a[0].trim())) return ret('The specified domain either does not exist or could not be contacted.'); w('\nJoining domain...'); later(() => { S.dom = a[0].trim().toLowerCase(); rs('Changes will take effect after you restart.') }, 1500) }, sc); else sc()
                })
            },
            2: () => { clr(); seq([['Enter new computer name (Blank=Cancel): ']], a => { const n = a[0].trim(); if (!/^[A-Za-z0-9-]{1,15}$/.test(n)) return ret('Invalid computer name.'); S.name = n.toUpperCase(); S.nameChanged = true; skin(); rs('Computer name changed to ' + S.name + '.') }, sc) },
            3: () => { clr(); seq([['Enter name of user to add (Blank=Cancel): '], ['Enter new password: ', 1]], a => { const n = a[0].trim(); if (!/^[\w.-]{1,20}$/.test(n)) return ret('Invalid user name.'); if (ukey(n)) return ret('That user already exists.'); S.users[n] = { en: 'True', d: '', f: '', a: 1 }; ret('User ' + n + ' was added to the local Administrators group.') }, sc) },
            4: () => sub('Remote management: ' + (S.rm ? 'Enabled' : 'Disabled') + '   Server response to ping: ' + (S.ping ? 'Enabled' : 'Disabled'), ['Enable remote management', 'Disable remote management', 'Enable server response to ping', 'Disable server response to ping'], n => { if (n < 3) S.rm = n == 1; else S.ping = n == 3; ret('Setting applied.') }),
            5: () => sub('Update setting: ' + S.upd, ['Automatic', 'Download only', 'Manual'], n => { S.upd = ['Automatic', 'Download only', 'Manual'][n - 1]; ret('Update setting changed to ' + S.upd + '.') }),
            6: () => sub('Install updates', ['All quality updates', 'Recommended updates only', 'Feature update'], n => { w('\nSearching for updates...'); later(() => ret('No updates available.'), 1500) }),
            7: () => sub('Remote desktop', ['Enable Remote Desktop (more secure clients only)', 'Enable Remote Desktop (all clients)', 'Disable Remote Desktop'], n => { S.rd = [1, 2, 0][n - 1]; ret('Remote Desktop setting applied.') }),
            8: () => sub('Network settings\n Adapter: Ethernet   Mode: ' + (S.dhcp ? 'DHCP' : 'Static') + '\n IP: ' + sip() + '  Mask: ' + S.mask + '  Gateway: ' + S.gw + '  DNS: ' + (S.dns || '(none)'), ['Set network adapter address', 'Set DNS servers', 'Clear DNS server settings'], n => {
                if (n == 1) ask('Select (D)HCP or (S)tatic IP address (Blank=Cancel): ', v => { v = v.trim().toLowerCase(); if (v == 'd') { S.dhcp = 1; ret('Address set to DHCP.') } else if (v == 's') seq([['Enter static IP address: '], ['Enter subnet mask (Blank = 255.255.255.0): '], ['Enter default gateway (Blank = keep): ']], a => { if (!ip4(a[0]) || (a[2].trim() && !ip4(a[2]))) return ret('Invalid address.'); S.dhcp = 0; S.addr = a[0].trim(); S.mask = a[1].trim() || '255.255.255.0'; S.gw = a[2].trim() || S.gw; ret('Static address set to ' + S.addr + '.') }, sc); else sc() });
                else if (n == 2) seq([['Enter new preferred DNS server (Blank=Cancel): ']], a => ip4(a[0]) ? (S.dns = a[0].trim(), ret('DNS server set.')) : ret('Invalid address.'), sc);
                else { S.dns = ''; ret('DNS settings cleared.') }
            }),
            9: () => sub('Date and Time\n Current: ' + fmt() + '   ' + S.tzn, ['Change date and time', 'Change time zone'], n => {
                if (n == 1 || n == 2) { clr(); showDateTimeUI(); } else { sc(); }
            }),
            10: () => sub('Telemetry setting: ' + S.tele, ['Security', 'Required', 'Optional'], n => { S.tele = ['Security', 'Required', 'Optional'][n - 1]; ret('Telemetry set to ' + S.tele + '.') }),
            11: () => sub('Windows activation', ['Display license info', 'Activate Windows', 'Install product key'], n => { if (n == 1) ret(' Name: Windows(R), ServerDatacenter edition\n Description: Windows Operating System, TIMEBASED_EVAL channel\n License Status: Initial grace period'); else if (n == 2) { w('\nActivating Windows...'); later(() => ret('Activation failed. Error 0xC004F074: no KMS available.'), 1800) } else seq([['Enter product key (Blank=Cancel): ']], a => ret('Error 0xC004F050: the product key is invalid.'), sc) }),
            12: () => yn('Log off current user?', login), 13: () => yn('Restart the server?', reboot), 14: () => yn('Shut down the server?', () => spin('Shutting down', 1800, off)),
            15: () => { mode = 'cmd'; skin(); clr(); w('Microsoft Windows [Version 10.0.20348.2402]'); w('(c) Microsoft Corporation. All rights reserved.\n'); pp() }
        };

        /* command prompt */
        const pp = () => ask(curDir + '> ', run), out = t => { w(t); pp() };
        const q = (v, k) => { const m = v.match(new RegExp('-' + k + '\\s+(?:"([^"]*)"|\'([^\']*)\'|(\\S+))', 'i')); return m ? (m[1] ?? m[2] ?? m[3]) : null };
        const feat = (ok, txt, key) => { w('\nInstalling...'); later(() => { const had = S[key]; S[key] = 1; out(tb(['Success', 'Restart Needed', 'Exit Code', 'Feature Result'], [['True', 'No', had ? 'NoChangeNeeded' : 'Success', had ? '{}' : txt]])) }, 1800) };
        function forest() {
            if (!S.adds) return out('Install-ADDSForest : The AD DS role is not installed. Run Install-WindowsFeature AD-Domain-Services first.'); if (S.dc) return out('Install-ADDSForest : This server is already a domain controller.');
            w('\ncmdlet Install-ADDSForest at command pipeline position 1\nSupply values for the following parameters:');
            seq([['DomainName: '], ['SafeModeAdministratorPassword: ', 1], ['Confirm SafeModeAdministratorPassword: ', 1]], a => {
                const d = a[0].trim().toLowerCase();
                if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d)) return out('Install-ADDSForest : The domain name is not valid (example: srv.world).');
                if (a[1] != a[2]) return out('Install-ADDSForest : The passwords do not match.');
                if (a[1].length < 8) return out('Install-ADDSForest : The password does not meet the complexity requirements.');
                ask('\nThe target server will be configured as a domain controller and restarted when this operation is complete.\nDo you want to continue with this operation?\n[Y] Yes  [A] Yes to All  [N] No  [L] No to All  [S] Suspend  [?] Help (default is "Y"): ', v => {
                    if (/^[nls]/i.test(v)) return pp();
                    w('\nWARNING: A delegation for this DNS server cannot be created because the authoritative parent zone cannot be found or it does not run Windows DNS server.\n\nPromoting this server to a domain controller...');
                    later(() => { S.dc = 1; S.dom = d; w('The server will now restart.'); setTimeout(reboot, 800) }, 3000)
                })
            }, pp)
        }
        const CMDS = [
            [n => n == 'sconfig', sc], [n => n == 'cls' || n == 'clear', () => { clr(); pp() }], [n => n == 'exit', sc],
            [n => n == 'hostname', () => out(S.name)], [n => n == 'whoami', () => out(S.name.toLowerCase() + '\\administrator')],
            [n => n == 'get-date', () => out('\n' + wall().toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'full', timeStyle: 'medium' }) + '\n')],
            [n => n == 'ipconfig', () => out('\nWindows IP Configuration\n\nEthernet adapter Ethernet:\n\n   Connection-specific DNS Suffix  . : \n   IPv4 Address. . . . . . . . . . . : ' + sip() + '\n   Subnet Mask . . . . . . . . . . . : ' + S.mask + '\n   Default Gateway . . . . . . . . . : ' + S.gw + '\n')],
            [n => n == 'invoke-webrequest http://localhost', () => {
                if (!S.web) return out('Invoke-WebRequest : Unable to connect to the remote server');
                S.iisVerified = 1;
                out(`\nStatusCode        : 200\nStatusDescription : OK\nContent           : <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n                    <html xmlns="http://www.w3.org/1999/xhtml">\n                    <head>\n                    <meta http-equiv="Content-Type" cont...\nRawContent        : HTTP/1.1 200 OK\n                    Accept-Ranges: bytes\n                    Content-Length: 703\n                    Content-Type: text/html\n                    Date: Tue, 25 Jan 2022 05:29:35 GMT\n                    ETag: "26b38758ac11d81:0"\n                    Last-Modified: Tue, 25 Jan 2022 05:28:12 GMT\n                    Serve...\nForms             : {}\nHeaders           : {[Accept-Ranges, bytes], [Content-Length, 703], [Content-Type, text/html], [Date, Tue, 25 Jan 2022 05:29:35 GMT]...}\nImages            : {@{innerHTML=; innerText=; outerHTML=<IMG alt=IIS src="iisstart.png" width=960 height=600>; outerText=; tagName=IMG; alt=IIS; src=iisstart.png; width=960; height=600}}\nInputFields       : {}\nLinks             : {@{innerHTML=<IMG alt=IIS src="iisstart.png" width=960 height=600>; innerText=; outerHTML=<A href="http://go.microsoft.com/fwlink/?linkid=66138&clcid=0x409"><IMG alt=IIS src="iisstart.png" width=960 height=600></A>; outerText=; tagName=A; href=http://go.microsoft.com/fwlink/?linkid=66138&clcid=0x409}}\nParsedHtml        : System.__ComObject\nRawContentLength  : 703`);
            }],
            [n => n.startsWith('cd '), (n, r) => {
                const p = r.substring(3).trim();
                if (p.toLowerCase() === 'c:\\inetpub\\wwwroot') { curDir = 'C:\\inetpub\\wwwroot'; pp(); }
                else if (p === '..') { curDir = 'C:\\Users\\Administrator'; pp(); }
                else { out('The system cannot find the path specified.'); }
            }],
            [n => n == 'ls' || n == 'dir', () => {
                if (curDir === 'C:\\inetpub\\wwwroot') {
                    out('\n Directory of C:\\inetpub\\wwwroot\n\n01/25/2022  05:28 AM    <DIR>          .\n01/25/2022  05:28 AM    <DIR>          ..\n01/25/2022  05:28 AM               703 iisstart.htm\n01/25/2022  05:28 AM            99,150 iisstart.png\n01/25/2022  05:28 AM                12 index.html\n               3 File(s)        100,065 bytes\n               2 Dir(s)  42,123,456,789 bytes free\n');
                } else {
                    out('\n Directory of ' + curDir + '\n\n01/25/2022  05:28 AM    <DIR>          .\n01/25/2022  05:28 AM    <DIR>          ..\n01/25/2022  05:28 AM               703 file1.txt\n');
                }
            }],
            [n => n.startsWith('notepad.exe '), (n, r) => {
                out(`\nOpening ${r.substring(11).trim()} in Notepad...\n(Simulated Notepad window opened)`);
            }],
            [n => /^new-localuser /.test(n) && n.includes('-password') && /-name /.test(n), (n, r) => { const nm = q(r, 'Name'); if (ukey(nm)) return out('New-LocalUser : The specified account already exists.'); S.users[nm] = { en: 'True', d: q(r, 'Description') || '', f: q(r, 'FullName') || '', pn: /-passwordneverexpires/.test(n), a: 0 }; out(tb(['Name', 'Enabled', 'Description'], [[nm, 'True', S.users[nm].d]])) }],
            [n => /^net user( \S+)?$/.test(n), (n, r) => { const nm = r.trim().split(/\s+/)[2]; if (!nm) return out('\nUser accounts for \\\\' + S.name + '\n\n' + '-'.repeat(79) + '\n' + Object.keys(S.users).join('   ') + '\nThe command completed successfully.\n'); const k = ukey(nm); if (!k) return out('The user name could not be found.\n\nMore help is available by typing NET HELPMSG 2221.\n'); const u = S.users[k]; out('User name                    ' + k + '\nFull Name                    ' + (u.f || '') + '\nComment                      ' + (u.d || '') + '\nCountry/region code          000 (System Default)\nAccount active               ' + (u.en == 'True' ? 'Yes' : 'No') + '\nAccount expires              Never\n\nPassword last set            ' + fmt() + '\nPassword expires             ' + (u.pn ? 'Never' : '(42 days)') + '\nUser may change password     Yes\nWorkstations allowed         All\nLogon script                 \nLast logon                   Never\n\nLocal Group Memberships      ' + (u.a ? '*Administrators' : '') + '   *Users\nGlobal Group memberships     *None\nThe command completed successfully.\n') }],
            [n => n.startsWith('add-localgroupmember ') && n.includes('-group "administrators"') && /-member "[^"]+"/.test(n), (n, r) => { const nm = q(r, 'Member'), k = ukey(nm); if (!k) return out('Add-LocalGroupMember : User ' + nm + ' was not found.'); if (S.users[k].a) return out('Add-LocalGroupMember : User ' + k + ' is already a member of group Administrators.'); S.users[k].a = 1; pp() }],
            [n => /^get-localuser( -name \S+)?$/.test(n), (n, r) => { const nm = q(r, 'Name'); if (nm) { const k = ukey(nm); if (!k) return out('Get-LocalUser : User ' + nm + ' was not found.'); return out(tb(['Name', 'Enabled', 'Description'], [[k, S.users[k].en, S.users[k].d]])) } out(tb(['Name', 'Enabled', 'Description'], Object.keys(S.users).map(k => [k, S.users[k].en, S.users[k].d]))) }],
            [n => /^get-localgroupmember -group "administrators"$/.test(n), () => out(tb(['ObjectClass', 'Name', 'PrincipalSource'], Object.keys(S.users).filter(k => S.users[k].a).map(k => ['User', S.name + '\\' + k, 'Local'])))],
            [n => n.startsWith('install-windowsfeature') && n.includes('ad-domain-services'), () => feat(0, '{Active Directory Domain Services, Group Policy Management, Remote Server Administration Tools, Role Administration Tools...}', 'adds')],
            [n => n.startsWith('install-windowsfeature') && n.includes('web-server'), () => feat(0, '{Web Server (IIS), Web Server, Common HTTP Features, Default Document, Directory Browsing, HTTP Errors, Static Content...}', 'web')],
            [n => n == 'install-addsforest', forest],

            /* Activity 2 Commands with Pre-requisite Checks */
            [n => n.startsWith('new-adorganizationalunit'), (n, r) => {
                if (!S.dc) return out('New-ADOrganizationalUnit : You must install AD DS and promote this server to a Domain Controller first. Try again.');
                const name = q(r, 'Name');
                if (!name) return out('New-ADOrganizationalUnit : Missing required parameter -Name.');
                if (S.ous.some(o => o.toLowerCase() == name.toLowerCase())) return out('New-ADOrganizationalUnit : An attempt was made to add an object to the directory with a name that is already in use.');
                S.ous.push(name);
                out('New-ADOrganizationalUnit : Successfully created OU ' + name);
            }],
            [n => n.startsWith('new-aduser'), (n, r) => {
                if (!S.dc) return out('New-ADUser : You must install AD DS and promote this server to a Domain Controller first.');
                const name = q(r, 'Name');
                if (!name) return out('New-ADUser : Missing required parameter -Name.');
                if (S.adUsers.some(u => u.toLowerCase() == name.toLowerCase())) return out('New-ADUser : The specified account already exists.');
                S.adUsers.push(name);
                out('New-ADUser : Successfully created user ' + name);
            }],
            [n => n.startsWith('new-gpo'), (n, r) => {
                if (!S.dc) return out('New-GPO : You must install AD DS and promote this server to a Domain Controller first.');
                const name = q(r, 'Name');
                if (!name) return out('New-GPO : Missing required parameter -Name.');
                if (S.gpos.some(g => g.toLowerCase() == name.toLowerCase())) return out('New-GPO : A GPO with this name already exists.');
                S.gpos.push(name);
                out('DisplayName       : ' + name + '\nDomainName        : srv.world\nGpoStatus         : AllSettingsEnabled\n');
            }],
            [n => n.startsWith('new-gpofolderredirection'), (n, r) => {
                if (!S.dc) return out('New-GPOFolderRedirection : You must install AD DS and promote this server to a Domain Controller first.');
                const name = q(r, 'Name'); const path = q(r, 'Path'); const access = q(r, 'Access');
                if (!name || !path || !access) return out('Missing parameters. Syntax: New-GPOFolderRedirection -Name "Admin_GPO" -Path "\\\\192.168.1.10\\AdminData" -Access "Full"');
                if (!S.gpos.some(g => g.toLowerCase() == name.toLowerCase())) return out('GPO not found.');
                if (!S.shares.some(s => path.toLowerCase().includes(s.toLowerCase()))) return out('The path does not point to a valid share.');
                S.folderRedir = 1;
                out(`Successfully configured Folder Redirection for ${name}. Path: ${path} Access: ${access}`);
            }],
            [n => n.startsWith('new-gpodrivemap'), (n, r) => {
                if (!S.dc) return out('New-GPODriveMap : You must install AD DS and promote this server to a Domain Controller first.');
                const name = q(r, 'Name'); const drive = q(r, 'Drive'); const path = q(r, 'Path');
                if (!name || !drive || !path) return out('Missing parameters. Syntax: New-GPODriveMap -Name "Admin_GPO" -Drive "Z:" -Path "\\\\192.168.1.10\\AdminData"');
                if (!S.gpos.some(g => g.toLowerCase() == name.toLowerCase())) return out('GPO not found.');
                S.driveMap = 1;
                out(`Successfully configured Drive Mapping for ${name}. Drive: ${drive} Path: ${path}`);
            }],
            /* ----------------------------- */
            [n => n.startsWith('new-smbshare ') && /-name /.test(n) && /-path /.test(n), (n, r) => { const nm = q(r, 'Name'); if (S.shares.some(s => s.toLowerCase() == nm.toLowerCase())) return out('New-SmbShare : The name has already been shared.'); S.shares.push(nm); S.sp = S.sp || {}; S.sp[nm.toLowerCase()] = q(r, 'Path'); out(tb(['Name', 'ScopeName', 'Path', 'Description'], [[nm, '*', q(r, 'Path'), '']])) }],
            [n => n == 'get-smbshare', () => out(tb(['Name', 'ScopeName', 'Path', 'Description'], [['ADMIN$', '*', 'C:\\Windows', 'Remote Admin'], ['C$', '*', 'C:\\', 'Default share'], ['IPC$', '*', '', 'Remote IPC'], ...S.shares.map(s => [s, '*', S.sp[s.toLowerCase()], ''])]))]];
        function run(v) { const r = v.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/`\s*/g, ' ').trim(), n = r.replace(/\s+/g, ' ').toLowerCase().replace(/'/g, '"'); if (!n) return pp(); const c = CMDS.find(c => c[0](n)); if (!c) { w('Command does not exist.'); return pp() } c[1](n, r) }

        /* --- Client Windows & Explorer --- */
        let activeWindowZ = 10;

        function createWindow(title, icon, width, height, contentBuilder) {
            const d = el('div', 'wd');
            d.style.width = width; d.style.height = height;
            d.style.zIndex = activeWindowZ++;
            d.style.left = (20 + (activeWindowZ % 10) * 28) + 'px';
            d.style.top = (16 + (activeWindowZ % 10) * 28) + 'px';

            const h = el('div', 'wt');
            h.innerHTML = `<div style="display:flex; align-items:center; gap:6px;"><span>${icon || ''}</span><span>${title}</span></div>
                   <div class="wt-controls">
                       <button class="wt-btn" onclick="this.closest('.wd').style.display='none'">_</button>
                       <button class="wt-btn" onclick="this.closest('.wd').style.width='90%'; this.closest('.wd').style.height='90%'; this.closest('.wd').style.left='5%'; this.closest('.wd').style.top='5%'">□</button>
                       <button class="wt-btn close" onclick="this.closest('.wd').remove()">✕</button>
                   </div>`;

            d.append(h);
            const b = el('div', 'wb');
            contentBuilder(b);
            d.append(b);

            // Dragging logic
            let isDragging = false, offset = { x: 0, y: 0 };
            h.onmousedown = (e) => {
                if (e.target.tagName === 'BUTTON') return;
                isDragging = true;
                d.style.zIndex = activeWindowZ++;
                offset.x = e.clientX - d.offsetLeft;
                offset.y = e.clientY - d.offsetTop;
            };
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                d.style.left = (e.clientX - offset.x) + 'px';
                d.style.top = (e.clientY - offset.y) + 'px';
            });
            document.addEventListener('mouseup', () => { isDragging = false; });

            $('#cli').append(d);
            return d;
        }

        function ccmd() {
            createWindow('Command Prompt', '⬛', '600px', '400px', (b) => {
                const cm = el('div', 'cm');
                const o = el('pre');
                o.style.margin = '0';
                const r = el('div'); r.style.display = 'flex';
                const p = el('span'); p.textContent = 'C:\\Users\\student>';
                const i = el('input'); i.className = 'cm-in';
                r.append(p, i);
                cm.append(o, r); b.append(cm);

                o.textContent = 'Microsoft Windows [Version 10.0.19045.3693]\n(c) Microsoft Corporation. All rights reserved.\n';

                i.onkeydown = (e) => {
                    if (e.key != 'Enter') return;
                    const v = i.value.trim(), n = v.toLowerCase(); i.value = '';
                    o.append('\n' + p.textContent + v + '\n');
                    const m = n.match(/^ping (\S+)$/);
                    if (n == 'ipconfig') o.append('\nWindows IP Configuration\n\nEthernet adapter Ethernet0:\n\n   IPv4 Address. . . . . . . . . . . : 192.168.1.20\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1\n');
                    else if (n == 'hostname') o.append('DESKTOP-W10\n');
                    else if (n == 'cls') o.textContent = '';
                    else if (n == 'exit') b.parentNode.remove();
                    else if (m) {
                        const t = m[1], hit = isSrv(t);
                        if (!hit && !ip4(t)) o.append('Ping request could not find host ' + t + '. Please check the name and try again.\n');
                        else {
                            const ip = hit ? sip() : t, up = hit && S.ping && sub24(ip);
                            let s = '\nPinging ' + t + ' with 32 bytes of data:\n';
                            for (let k = 0; k < 4; k++) s += up ? 'Reply from ' + ip + ': bytes=32 time<1ms TTL=128\n' : 'Request timed out.\n';
                            o.append(s + '\nPing statistics for ' + ip + ':\n    Packets: Sent = 4, Received = ' + (up ? 4 : 0) + ', Lost = ' + (up ? 0 : 4) + ' (' + (up ? 0 : 100) + '% loss)\n');
                        }
                    } else if (n) o.append('Command does not exist.\n');
                    cm.scrollTop = cm.scrollHeight;
                };
                cm.onclick = () => i.focus();
                setTimeout(() => i.focus(), 50);
            });
        }

        function expl() {
            createWindow('File Explorer', '📁', '750px', '500px', (b) => {
                const layout = el('div', 'exp-layout');
                const sidebar = el('div', 'exp-sidebar');
                const main = el('div', 'exp-main');

                const addrBar = el('div', 'exp-address-bar');
                const addrInput = el('input'); addrInput.value = 'This PC';
                const goBtn = el('button'); goBtn.textContent = '→';
                addrBar.append(addrInput, goBtn);

                const content = el('div', 'exp-content');
                main.append(addrBar, content);
                layout.append(sidebar, main);
                b.append(layout);

                let currPath = 'This PC';

                const navTo = (path) => {
                    currPath = path;
                    addrInput.value = path;
                    render();
                };

                goBtn.onclick = () => navTo(addrInput.value.trim());
                addrInput.onkeydown = (e) => { if (e.key === 'Enter') navTo(addrInput.value.trim()); };

                const addSideItem = (label, icon, path, isActive) => {
                    const item = el('div', 'exp-side-item' + (isActive ? ' active' : ''));
                    item.innerHTML = `<span class="ico">${icon}</span> ${label}`;
                    item.onclick = () => navTo(path);
                    sidebar.append(item);
                };

                const render = () => {
                    // Render Sidebar
                    sidebar.innerHTML = '';
                    addSideItem('Desktop', '🖥️', 'C:\\Users\\student\\Desktop', currPath === 'C:\\Users\\student\\Desktop');
                    addSideItem('Downloads', '⬇️', 'C:\\Users\\student\\Downloads', currPath === 'C:\\Users\\student\\Downloads');
                    addSideItem('Documents', '📄', 'C:\\Users\\student\\Documents', currPath === 'C:\\Users\\student\\Documents');

                    sidebar.append(el('hr'));

                    addSideItem('This PC', '💻', 'This PC', currPath === 'This PC');
                    if (S.driveMap) {
                        addSideItem('AdminData (Z:)', '🗂️', 'Z:', currPath === 'Z:');
                        addSideItem('StaffData (Y:)', '🗂️', 'Y:', currPath === 'Y:');
                    }
                    addSideItem('Network', '🌐', 'Network', currPath === 'Network');

                    // Render Main Content
                    content.innerHTML = '';
                    const addItem = (label, icon, path) => {
                        const item = el('div', 'exp-item');
                        item.innerHTML = `<span>${icon}</span><b>${label}</b>`;
                        item.ondblclick = () => navTo(path);
                        item.onclick = () => {
                            content.querySelectorAll('.exp-item').forEach(el => el.style.background = 'transparent');
                            item.style.background = '#e5f1fb';
                        };
                        content.append(item);
                    };

                    if (currPath === 'This PC') {
                        if (S.driveMap) {
                            addItem('AdminData (Z:)', '🗂️', 'Z:');
                            addItem('StaffData (Y:)', '🗂️', 'Y:');
                        }
                        addItem('Local Disk (C:)', '💽', 'C:');
                    }
                    else if (currPath === 'Z:' || currPath === 'Y:') {
                        content.innerHTML = '<p style="width:100%; text-align:center; color:#888; margin-top:50px;">This folder is empty.</p>';
                    }
                    else if (currPath === 'C:\\Users\\student\\Documents') {
                        if (S.folderRedir) {
                            content.innerHTML = '<p style="width:100%; text-align:center; color:#0078d7; margin-top:50px;">📁 Documents is redirected to the network share.</p>';
                        } else {
                            addItem('My Notes.txt', '📄', 'C:\\Users\\student\\Documents\\My Notes.txt');
                            addItem('Resume.docx', '📄', 'C:\\Users\\student\\Documents\\Resume.docx');
                        }
                    }
                    else if (currPath === 'Network') {
                        addItem('DC01 (\\\\192.168.1.10)', '🖥️', '\\\\192.168.1.10');
                    }
                    else if (currPath === '\\\\192.168.1.10') {
                        if (S.shares.length > 0) {
                            S.shares.forEach(s => addItem(s, '📂', `\\\\192.168.1.10\\${s}`));
                        } else {
                            content.innerHTML = '<p style="width:100%; text-align:center; color:#888; margin-top:50px;">No shares available.</p>';
                        }
                    }
                    else if (currPath.startsWith('\\\\192.168.1.10\\')) {
                        if (S.web) {
                            addItem('iisstart.htm', '📄', '');
                            addItem('iisstart.png', '🖼️', '');
                            addItem('index.html', '📄', '');
                        } else {
                            content.innerHTML = '<p style="width:100%; text-align:center; color:#888; margin-top:50px;">This folder is empty.</p>';
                        }
                    }
                    else {
                        content.innerHTML = `<p style="width:100%; text-align:center; color:#888; margin-top:50px;">Windows can't access ${currPath}</p>`;
                    }
                };

                render();
            });
        }

        function edge() {
            createWindow('Microsoft Edge', '🌐', '800px', '600px', (b) => {
                const nav = el('div'); nav.className = 'edge-nav';
                const url = el('input'); url.className = 'edge-url'; url.value = 'http://localhost';
                const go = el('button'); go.className = 'edge-go'; go.textContent = 'Go';
                nav.append(url, go);

                const frame = el('div'); frame.className = 'edge-content';
                b.append(nav, frame);

                const loadPage = () => {
                    const val = url.value.toLowerCase();
                    frame.innerHTML = '';
                    if (val.includes('localhost') || val.includes('192.168.1.10') || val.includes(S.name.toLowerCase())) {
                        if (S.web) {
                            frame.innerHTML = `
                        <div style="text-align:center; padding:40px;">
                            <h1 style="font-size:48px; color:#0078d7; margin-bottom:20px;">IIS Windows Server</h1>
                            <div style="font-size:80px; margin-bottom:20px;">🪟</div>
                            <p style="color:#666;">Welcome to Windows Server 2025 Datacenter</p>
                            <div style="max-width:100%; border:1px solid #ccc; margin-top:20px; width:400px; height:250px; background:#e0e0e0; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#555; border-radius:4px;">
                                <span style="font-size:60px; margin-bottom:10px;">ℹ️</span>
                                <span style="font-weight:bold; font-size:18px;">iisstart.png</span>
                                <span style="font-size:12px; margin-top:5px;">(Mock IIS Icon)</span>
                            </div>
                        </div>
                    `;
                        } else {
                            frame.innerHTML = '<h2 style="color:#333;">This site can’t be reached</h2><p style="color:#666;">The connection was refused.</p>';
                        }
                    } else {
                        frame.innerHTML = '<h2 style="color:#333;">This site can’t be reached</h2><p style="color:#666;">DNS_PROBE_FINISHED_NXDOMAIN</p>';
                    }
                };

                go.onclick = loadPage;
                url.onkeydown = (e) => { if (e.key == 'Enter') loadPage(); };
                loadPage();
            });
        }

        const FN = { ccmd, edge, expl };

        document.querySelectorAll('[data-a]').forEach(e => e.onclick = () => { FN[e.dataset.a](); $('#sm').hidden = 1 });
        $('#sb').onclick = () => $('#sm').hidden = !$('#sm').hidden;
        const clk = () => { const d = new Date(); $('#ck').textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '\n' + d.toLocaleDateString() }; clk(); setInterval(clk, 10000);

        /* tabs + panel */
        const tabs = [$('#t0'), $('#t1')];
        function show(i) { $('#srv').hidden = !!i; $('#cli').hidden = !i; tabs.forEach((t, k) => t.classList.toggle('on', k == i)); if (!i) IN.focus() }
        tabs.forEach((t, i) => t.onclick = () => show(i));
        $('#mn').onclick = e => { e.stopPropagation(); $('#sp').classList.toggle('o') };
        document.addEventListener('click', e => { if (!e.target.closest('#sp')) $('#sp').classList.remove('o') });

        /* Task Tracker Logic */
        let currentTask = restoredTrackerTask;
        function startTracker(taskId) {
            currentTask = taskId;
            $('#tracker').style.display = 'block';
            $('#tracker-title').textContent = `Activity ${taskId} Tracker`;
            updateTracker();
            saveLabState();
        }
        function closeTracker() {
            currentTask = 0;
            $('#tracker').style.display = 'none';
            saveLabState();
        }
        function updateTracker() {
            if (!currentTask || $('#tracker').style.display === 'none') return;
            const list = $('#tracker-list');
            let items = [];
            if (currentTask === 1) {
                items = [
                    { t: 'Set Computer Name', d: S.nameChanged },
                    { t: 'Set Static IP Address', d: S.dhcp === 0 },
                    { t: 'Install AD DS Role', d: S.adds === 1 },
                    { t: 'Promote to Domain Controller', d: S.dc === 1 },
                    { t: 'Install Web Server (IIS)', d: S.web === 1 },
                    { t: 'Verify IIS (Invoke-WebRequest)', d: S.iisVerified === 1 }
                ];
            } else if (currentTask === 2) {
                items = [
                    { t: 'Create Admin OU', d: S.ous.some(o => o.toLowerCase() === 'admin_ou') },
                    { t: 'Create Staff OU', d: S.ous.some(o => o.toLowerCase() === 'staff_ou') },
                    { t: 'Create Admin User', d: S.adUsers.some(u => u.toLowerCase() === 'adminuser') },
                    { t: 'Create Staff User', d: S.adUsers.some(u => u.toLowerCase() === 'staffuser') },
                    { t: 'Configure Folder Redirection', d: S.folderRedir === 1 },
                    { t: 'Configure Drive Mapping', d: S.driveMap === 1 }
                ];
            }
            list.innerHTML = items.map(i => `
        <li style="margin-bottom:8px; display:flex; align-items:flex-start; gap:8px;">
            <span style="color:${i.d ? '#4fb3ff' : '#9aa0a6'}; font-size:14px;">${i.d ? '☑' : '☐'}</span>
            <span style="color:${i.d ? '#e8eaed' : '#9aa0a6'}; text-decoration:${i.d ? 'line-through' : 'none'}; line-height:1.3;">${i.t}</span>
        </li>
    `).join('');
        }
        setInterval(updateTracker, 1000);
        window.addEventListener('pagehide', saveLabState);
        setInterval(saveLabState, 1000);
        if (currentTask) startTracker(currentTask);

        // Draggable Tracker
        let isDraggingTr = false, offsetTr = { x: 0, y: 0 };
        document.getElementById('tracker-header').onmousedown = (e) => {
            isDraggingTr = true;
            offsetTr.x = e.clientX - $('#tracker').offsetLeft;
            offsetTr.y = e.clientY - $('#tracker').offsetTop;
        };
        document.addEventListener('mousemove', (e) => {
            if (!isDraggingTr) return;
            $('#tracker').style.left = (e.clientX - offsetTr.x) + 'px';
            $('#tracker').style.top = (e.clientY - offsetTr.y) + 'px';
        });
        document.addEventListener('mouseup', () => { isDraggingTr = false; });

        skin(); spin('Getting ready', 1200, login);
   