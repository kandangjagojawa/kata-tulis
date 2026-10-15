const REKAN_KHUSUS_MAP = {
    'q': 'ꦐ', 'hh': 'ꦲ꦳', 'xng': 'ꦔ꦳', 'ts': 'ꦱ꦳', 'shh': 'ꦰ꦳',
    'xsy': 'ꦯ꦳', 'dl': 'ꦭ꦳', 'tth': 'ꦡ꦳', 'zh': 'ꦣ꦳', 'x': 'ꦑ꦳'
};

const EngineConfigs = {
    'praktis': { frameId: 'enginePraktis', src: 'praktis.js', fnName: 'transliterasiKalimat' },
    'kbj': { frameId: 'engineKBJ', src: 'kbj.js', fnName: 'transliterasiKalimat' },
    'sriwedari': { frameId: 'engineSriwedari', src: 'sriwedari.js', fnName: 'transliterasiKalimat' },
    'simplified': { frameId: 'engineSimplified', src: 'simplified.js', fnName: 'transliterasiKalimat' },
    'tradisional': { frameId: 'engineTradisional', src: 'tradisional.js', fnName: 'transliterateKawi' },
    'carakawi': { frameId: 'engineCaraKawi', src: 'carakawi.js', fnName: 'transliterateKawi' }
};

function initEngineFrames() {
    Object.keys(EngineConfigs).forEach(key => {
        const config = EngineConfigs[key];
        const frame = document.getElementById(config.frameId);
        if (frame) {
            const doc = frame.contentWindow.document;
            doc.open();
            doc.write('<!DOCTYPE html><html><head><script src="' + config.src + '"><\/script></head><body></body></html>');
            doc.close();
        }
    });
}

function runModuleTransliteration(fnKey, input) {
    if (!input.trim()) return '';
    const config = EngineConfigs[fnKey];
    if (!config) return input;

    const frame = document.getElementById(config.frameId);
    if (frame && frame.contentWindow && typeof frame.contentWindow[config.fnName] === 'function') {
        return frame.contentWindow[config.fnName](input);
    }
    return input;
}

function netralkanJGSTForPUJL(jgstStr, rawLatin, fnKey) {
    if (!jgstStr || !rawLatin) return jgstStr;
    let rawLower = rawLatin.toLowerCase();
    let res = jgstStr;

    res = res.replace(/\//g, '');
    
    if (fnKey === 'sriwedari') {
        if (/o/i.test(res) && /a/i.test(rawLower) && !/o/i.test(rawLower)) {
            res = res.replace(/o/g, 'a').replace(/O/g, 'A');
        }
    }

    if (['praktis', 'kbj', 'sriwedari', 'simplified'].includes(fnKey)) {
        res = res.replace(/ñc/g, 'nc').replace(/Ñc/g, 'Nc')
                 .replace(/ñj/g, 'nj').replace(/Ñj/g, 'Nj');
    }

    return res;
}

function generateJGSTAndIPAShifted(rawInput, fnKey, isSastraLampah = false) {
    if (!rawInput.trim()) {
        return { jgst: '-', ipa: '-', pujl: '-' };
    }

    const MARKER = '\uE000';
    const tokens = rawInput.split(/(\s+)/);
    let markedInput = "";
    let wordTokens = [];

    for (let i = 0; i < tokens.length; i++) {
        let t = tokens[i];
        if (/^\s+$/.test(t)) {
            markedInput += t;
        } else if (t !== '') {
            markedInput += t + MARKER;
            wordTokens.push(t);
        }
    }

    const aksaraMarked = runModuleTransliteration(fnKey, markedInput);

    let fullJgst = '';
    if (aksaraMarked && typeof transliterateToJGST === 'function') {
        fullJgst = transliterateToJGST(aksaraMarked, fnKey);
    } else {
        fullJgst = aksaraMarked;
    }

    const rawJgstSegments = fullJgst.split(MARKER);

    if (isSastraLampah) {
        for (let i = 0; i < rawJgstSegments.length; i++) {
            if (/^h[aāiīuūěéèeoꜽꜷṛḷ]/i.test(rawJgstSegments[i])) {
                rawJgstSegments[i] = rawJgstSegments[i].substring(1);
            }
        }
    }

    let cleanedJgstSegments = [];
    let carryOver = "";
    
    const jgstSpecialSandhangan = '(?:ŕě|lě|ṝ|ḹ|ṛ|ḷ)';
    const jgstPasanganConsonant = '(?:th|dh|ng|ny|ñ|ṅ|ŋ|ṇ|ṭha|ṭh|ṭ|ḍha|ḍh|ḍ|ś|ṣ|ḥ|c̣|p̣|g̣|ḅ|j̣|ŕ|ṟ|ỿ|[bcdfghjklmnpqrstvwxyz])';
    const jgstStandardVowel = '(?:[āaīiūuěéèeoꜽꜷ])';
    const jgstPasanganRegex = new RegExp(`(?:${jgstSpecialSandhangan}|${jgstPasanganConsonant}?${jgstStandardVowel})$`, 'i');
    const jgstTrailingVowelRegex = new RegExp(`(${jgstStandardVowel})$`, 'i');

    let wordIdx = 0;
    for (let i = 0; i < rawJgstSegments.length; i++) {
        let rawSeg = rawJgstSegments[i];
        if (rawSeg === '' && i === rawJgstSegments.length - 1) continue;

        let seg = carryOver + rawSeg.replace(/^\s+/, '');
        carryOver = "";

        if (wordIdx < wordTokens.length - 1) {
            let origWord = wordTokens[wordIdx] || "";
            let nextOrigWord = wordTokens[wordIdx + 1] || "";

            let cleanOrigWord = origWord.replace(/[^a-zA-Za-zA-Zāāīīūūěéèeoꜽꜷṛḷ]/g, '');
            let cleanNextOrigWord = nextOrigWord.replace(/[^a-zA-Za-zA-Zāāīīūūěéèeoꜽꜷṛḷ]/g, '');

            let origEndedWithConsonant = !/[aāiīuūěéèeoꜽꜷṛḷ]$/i.test(cleanOrigWord);
            let nextWordStartsWithVowel = /^[aāiīuūěéèeoꜽꜷṛḷ]/i.test(cleanNextOrigWord);

            if (origEndedWithConsonant) {
                if (isSastraLampah && nextWordStartsWithVowel) {
                    let vMatch = seg.match(jgstTrailingVowelRegex);
                    if (vMatch) {
                        let vLen = vMatch[0].length;
                        carryOver = vMatch[0];
                        seg = seg.slice(0, -vLen);
                    }
                } else {
                    let match = seg.match(jgstPasanganRegex);
                    if (match) {
                        let matchLen = match[0].length;
                        carryOver = match[0];
                        seg = seg.slice(0, -matchLen);
                    }
                }
            }
        }

        cleanedJgstSegments.push(seg);
        wordIdx++;
    }

    if (carryOver && cleanedJgstSegments.length > 0) {
        cleanedJgstSegments[cleanedJgstSegments.length - 1] = carryOver + cleanedJgstSegments[cleanedJgstSegments.length - 1];
    }

    let jgstList = [];
    let ipaList = [];
    let pujlList = [];
    let wordCounter = 0;

    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        if (/^\s+$/.test(token)) {
            jgstList.push(token);
            ipaList.push(token);
            pujlList.push(token);
        } else if (token !== '') {
            let jgstKata = cleanedJgstSegments[wordCounter] !== undefined ? cleanedJgstSegments[wordCounter] : token;
            let jgstForIPAAndPUJL = netralkanJGSTForPUJL(jgstKata, token, fnKey);

            let ipaKata = '-';
            if (typeof convertJGSTtoIPA === 'function') {
                ipaKata = convertJGSTtoIPA(jgstForIPAAndPUJL, token, fnKey);
                if (ipaKata && ipaKata !== '-') {
                    ipaKata = ipaKata.replace(/tɔnpɔ/g, 'tanpɔ');
                }
            }

            let pujlKata = '-';
            if (typeof convertJGSTtoPUJL === 'function') {
                pujlKata = convertJGSTtoPUJL(jgstForIPAAndPUJL, token);
            }

            if (pujlKata && pujlKata !== '-') {
                pujlKata = pujlKata.replace(/\s*\([^)]*\)/g, '').replace(/nyc/gi, 'nc').replace(/nyj/gi, 'nj').trim();
            }

            jgstList.push(jgstKata);
            ipaList.push(ipaKata);
            pujlList.push(pujlKata);
            wordCounter++;
        }
    }

    return {
        jgst: jgstList.join(''),
        ipa: ipaList.join(''),
        pujl: pujlList.join('')
    };
}

function bersihkanKonsonanDobelImbuhan(teks) {
    if (!teks) return teks;
    return teks
        .replace(/-nni\b/g, '-ni')
        .replace(/-nnana\b/g, '-nana')
        .replace(/-nnan\b/g, '-nan')
        .replace(/-nnanné\b/g, '-nané')
        .replace(/-nnanne\b/g, '-nane');
}

function processCardOutput(moduleId, fnKey, rawInput, isSastraLampah = false, checkRekanKhusus = false) {
    const outAksara = document.getElementById(`out${moduleId}_Aksara`);
    const outJGST = document.getElementById(`out${moduleId}_JGST`);
    const outIPA = document.getElementById(`out${moduleId}_IPA`);
    const outPUJL = document.getElementById(`out${moduleId}_PUJL`);

    if (!outAksara) return;

    if (!rawInput.trim()) {
        outAksara.textContent = '-'; 
        if (outJGST) outJGST.textContent = '-'; 
        if (outIPA) outIPA.textContent = '-';
        if (outPUJL) outPUJL.textContent = '-';
        return;
    }

    let formattedInput = rawInput;

    if (['Tradisional', 'CaraKawi', 'Praktis'].includes(moduleId)) {
        formattedInput = bersihkanKonsonanDobelImbuhan(formattedInput);
    }

    if (moduleId === 'Tradisional' || moduleId === 'CaraKawi') {
        formattedInput = formattedInput.replace(/e'/g, 'é').replace(/E'/g, 'É');
    }

    let aksaraUtuh = runModuleTransliteration(fnKey, formattedInput);
    let warningText = "";

    if (checkRekanKhusus) {
        let detectedAksaraJawa = [];
        let keys = Object.keys(REKAN_KHUSUS_MAP).sort((a, b) => b.length - a.length);

        keys.forEach(key => {
            let regex = new RegExp(`\\b${key}\\b|${key}`, 'gi');
            if (regex.test(formattedInput)) {
                let aksaraSymbol = REKAN_KHUSUS_MAP[key];
                if (!detectedAksaraJawa.includes(aksaraSymbol)) {
                    detectedAksaraJawa.push(aksaraSymbol);
                }
            }
        });

        if (detectedAksaraJawa.length > 0) {
            keys.forEach(key => {
                let aksaraSymbol = REKAN_KHUSUS_MAP[key];
                let regexLatin = new RegExp(key, 'gi');
                aksaraUtuh = aksaraUtuh.replace(regexLatin, `<span class="rekan-highlight">${aksaraSymbol}</span>`);
            });

            let namaPaugeranMap = {
                'KBJ': 'Paugeran KBJ',
                'Sriwedari': 'Paugeran Sriwedari',
                'CaraKawi': 'Cara Kawi (Mardi Kawi)'
            };

            let daftarAksaraFormatted = detectedAksaraJawa.map(a => `<span class="rekan-highlight">${a}</span>`).join(', ');
            warningText = `<div class="rekan-warning-badge">⚠️ Katrangan: aksara rekan (${daftarAksaraFormatted}) ora dikenal ing Paugeran ${namaPaugeranMap[moduleId] || moduleId}.</div>`;
        }
    }

    outAksara.innerHTML = aksaraUtuh + warningText;

    const resultShifted = generateJGSTAndIPAShifted(formattedInput, fnKey, isSastraLampah);
    if (outJGST) outJGST.textContent = resultShifted.jgst;
    if (outIPA) outIPA.textContent = resultShifted.ipa;
    if (outPUJL) outPUJL.textContent = resultShifted.pujl;
}

function processTransliteration() {
    const inputRaw = document.getElementById('inputLatin').value;
    const btnClear = document.getElementById('btnClear');
    btnClear.style.display = inputRaw.length > 0 ? 'flex' : 'none';

    const input = typeof normalisasiVokalTeks === 'function' ? normalisasiVokalTeks(inputRaw) : inputRaw;

    processCardOutput('Praktis', 'praktis', input, false, false);
    processCardOutput('KBJ', 'kbj', input, false, true);
    processCardOutput('Sriwedari', 'sriwedari', input, false, true);
    processCardOutput('Simplified', 'simplified', input, false, false);
    processCardOutput('Tradisional', 'tradisional', input, true, false);
    processCardOutput('CaraKawi', 'carakawi', input, true, true);

    const outRingkasanPUJL = document.getElementById('outRingkasan_PUJL');
    
    const outRingkasanPraktis = document.getElementById('outRingkasan_Praktis');
    const outRingkasanPraktis_JGST = document.getElementById('outRingkasan_Praktis_JGST');
    const outRingkasanPraktis_IPA = document.getElementById('outRingkasan_Praktis_IPA');

    const outRingkasanKBJ = document.getElementById('outRingkasan_KBJ');
    const outRingkasanKBJ_JGST = document.getElementById('outRingkasan_KBJ_JGST');
    const outRingkasanKBJ_IPA = document.getElementById('outRingkasan_KBJ_IPA');

    const outRingkasanSriwedari = document.getElementById('outRingkasan_Sriwedari');
    const outRingkasanSriwedari_JGST = document.getElementById('outRingkasan_Sriwedari_JGST');
    const outRingkasanSriwedari_IPA = document.getElementById('outRingkasan_Sriwedari_IPA');

    const outRingkasanSimplified = document.getElementById('outRingkasan_Simplified');
    const outRingkasanSimplified_JGST = document.getElementById('outRingkasan_Simplified_JGST');
    const outRingkasanSimplified_IPA = document.getElementById('outRingkasan_Simplified_IPA');

    const outRingkasanTradisional = document.getElementById('outRingkasan_Tradisional');
    const outRingkasanTradisional_JGST = document.getElementById('outRingkasan_Tradisional_JGST');
    const outRingkasanTradisional_IPA = document.getElementById('outRingkasan_Tradisional_IPA');

    const outRingkasanCaraKawi = document.getElementById('outRingkasan_CaraKawi');
    const outRingkasanCaraKawi_JGST = document.getElementById('outRingkasan_CaraKawi_JGST');
    const outRingkasanCaraKawi_IPA = document.getElementById('outRingkasan_CaraKawi_IPA');

    if (!input.trim()) {
        if (outRingkasanPUJL) outRingkasanPUJL.textContent = '-';

        if (outRingkasanPraktis) outRingkasanPraktis.textContent = '-';
        if (outRingkasanPraktis_JGST) outRingkasanPraktis_JGST.textContent = '-';
        if (outRingkasanPraktis_IPA) outRingkasanPraktis_IPA.textContent = '-';
        
        if (outRingkasanKBJ) outRingkasanKBJ.textContent = '-';
        if (outRingkasanKBJ_JGST) outRingkasanKBJ_JGST.textContent = '-';
        if (outRingkasanKBJ_IPA) outRingkasanKBJ_IPA.textContent = '-';

        if (outRingkasanSriwedari) outRingkasanSriwedari.textContent = '-';
        if (outRingkasanSriwedari_JGST) outRingkasanSriwedari_JGST.textContent = '-';
        if (outRingkasanSriwedari_IPA) outRingkasanSriwedari_IPA.textContent = '-';

        if (outRingkasanSimplified) outRingkasanSimplified.textContent = '-';
        if (outRingkasanSimplified_JGST) outRingkasanSimplified_JGST.textContent = '-';
        if (outRingkasanSimplified_IPA) outRingkasanSimplified_IPA.textContent = '-';

        if (outRingkasanTradisional) outRingkasanTradisional.textContent = '-';
        if (outRingkasanTradisional_JGST) outRingkasanTradisional_JGST.textContent = '-';
        if (outRingkasanTradisional_IPA) outRingkasanTradisional_IPA.textContent = '-';

        if (outRingkasanCaraKawi) outRingkasanCaraKawi.textContent = '-';
        if (outRingkasanCaraKawi_JGST) outRingkasanCaraKawi_JGST.textContent = '-';
        if (outRingkasanCaraKawi_IPA) outRingkasanCaraKawi_IPA.textContent = '-';
    } else {
        if (outRingkasanPUJL) outRingkasanPUJL.textContent = document.getElementById('outKBJ_PUJL').textContent;

        if (outRingkasanPraktis) outRingkasanPraktis.innerHTML = document.getElementById('outPraktis_Aksara').innerHTML;
        if (outRingkasanPraktis_JGST) outRingkasanPraktis_JGST.textContent = document.getElementById('outPraktis_JGST').textContent;
        if (outRingkasanPraktis_IPA) outRingkasanPraktis_IPA.textContent = document.getElementById('outPraktis_IPA').textContent;

        if (outRingkasanKBJ) outRingkasanKBJ.innerHTML = document.getElementById('outKBJ_Aksara').innerHTML;
        if (outRingkasanKBJ_JGST) outRingkasanKBJ_JGST.textContent = document.getElementById('outKBJ_JGST').textContent;
        if (outRingkasanKBJ_IPA) outRingkasanKBJ_IPA.textContent = document.getElementById('outKBJ_IPA').textContent;

        if (outRingkasanSriwedari) outRingkasanSriwedari.innerHTML = document.getElementById('outSriwedari_Aksara').innerHTML;
        if (outRingkasanSriwedari_JGST) outRingkasanSriwedari_JGST.textContent = document.getElementById('outSriwedari_JGST').textContent;
        if (outRingkasanSriwedari_IPA) outRingkasanSriwedari_IPA.textContent = document.getElementById('outSriwedari_IPA').textContent;

        if (outRingkasanSimplified) outRingkasanSimplified.innerHTML = document.getElementById('outSimplified_Aksara').innerHTML;
        if (outRingkasanSimplified_JGST) outRingkasanSimplified_JGST.textContent = document.getElementById('outSimplified_JGST').textContent;
        if (outRingkasanSimplified_IPA) outRingkasanSimplified_IPA.textContent = document.getElementById('outSimplified_IPA').textContent;

        if (outRingkasanTradisional) outRingkasanTradisional.innerHTML = document.getElementById('outTradisional_Aksara').innerHTML;
        if (outRingkasanTradisional_JGST) outRingkasanTradisional_JGST.textContent = document.getElementById('outTradisional_JGST').textContent;
        if (outRingkasanTradisional_IPA) outRingkasanTradisional_IPA.textContent = document.getElementById('outTradisional_IPA').textContent;

        if (outRingkasanCaraKawi) outRingkasanCaraKawi.innerHTML = document.getElementById('outCaraKawi_Aksara').innerHTML;
        if (outRingkasanCaraKawi_JGST) outRingkasanCaraKawi_JGST.textContent = document.getElementById('outCaraKawi_JGST').textContent;
        if (outRingkasanCaraKawi_IPA) outRingkasanCaraKawi_IPA.textContent = document.getElementById('outCaraKawi_IPA').textContent;
    }
}

function tempelKeInputUtama(teksLatin) {
    if (!teksLatin || teksLatin === '-') return;
    const inputUtama = document.getElementById('inputLatin');
    if (!inputUtama) return;

    let currentVal = inputUtama.value;
    if (currentVal.length > 0) {
        if (!currentVal.endsWith('\n') && !currentVal.endsWith(' ')) {
            currentVal += ' ';
        }
        inputUtama.value = currentVal + teksLatin;
    } else {
        inputUtama.value = teksLatin;
    }

    inputUtama.focus();
    const endPos = inputUtama.value.length;
    inputUtama.setSelectionRange(endPos, endPos);
    inputUtama.scrollTop = inputUtama.scrollHeight;

    if (typeof processTransliteration === 'function') {
        processTransliteration();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    // Event listeners sorting petunjuk latin
    const selectSortGuide = document.getElementById('selectSortGuide');
    if (selectSortGuide) {
        selectSortGuide.addEventListener('change', (e) => {
            const sortKey = e.target.value;
            const tbody = document.querySelector('#petunjukLatin table.table-guide tbody');
            if (!tbody) return;
            const rows = Array.from(tbody.querySelectorAll('tr'));

            rows.sort((a, b) => {
                const valA = parseFloat(a.getAttribute(`data-${sortKey}`)) || 9999;
                const valB = parseFloat(b.getAttribute(`data-${sortKey}`)) || 9999;
                return valA - valB;
            });

            rows.forEach(row => tbody.appendChild(row));
        });
    }

    // Toggle Kelompok Tata Tulis
    const toggleBaru = document.getElementById('toggleTataTulisBaru');
    if (toggleBaru) {
        toggleBaru.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            ['Praktis', 'KBJ', 'Sriwedari', 'Simplified'].forEach(cardType => {
                const cb = document.querySelector(`.toggle-card[data-card="${cardType}"]`);
                if (cb) {
                    cb.checked = isChecked;
                    const cardEl = document.getElementById('card' + cardType);
                    if (cardEl) cardEl.style.display = isChecked ? '' : 'none';
                }
            });
        });
    }

    const toggleLama = document.getElementById('toggleTataTulisLama');
    if (toggleLama) {
        toggleLama.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            ['Tradisional', 'CaraKawi'].forEach(cardType => {
                const cb = document.querySelector(`.toggle-card[data-card="${cardType}"]`);
                if (cb) {
                    cb.checked = isChecked;
                    const cardEl = document.getElementById('card' + cardType);
                    if (cardEl) cardEl.style.display = isChecked ? '' : 'none';
                }
            });
        });
    }

    function updateGroupToggles() {
        const baruCards = ['Praktis', 'KBJ', 'Sriwedari', 'Simplified'];
        const lamaCards = ['Tradisional', 'CaraKawi'];

        const allBaruChecked = baruCards.every(cardType => {
            const cb = document.querySelector(`.toggle-card[data-card="${cardType}"]`);
            return cb && cb.checked;
        });
        if (toggleBaru) toggleBaru.checked = allBaruChecked;

        const allLamaChecked = lamaCards.every(cardType => {
            const cb = document.querySelector(`.toggle-card[data-card="${cardType}"]`);
            return cb && cb.checked;
        });
        if (toggleLama) toggleLama.checked = allLamaChecked;
    }

    document.querySelectorAll('.toggle-card').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const cardType = e.target.dataset.card;
            const cardEl = document.getElementById('card' + cardType);
            if (cardEl) cardEl.style.display = e.target.checked ? '' : 'none';
            updateGroupToggles();
        });
    });

    function updateSubToggles() {
        document.querySelectorAll('.toggle-sub').forEach(cb => {
            const subType = cb.dataset.sub;
            const groups = document.querySelectorAll('.group-' + subType);
            groups.forEach(group => {
                group.style.display = cb.checked ? 'block' : 'none';
            });
        });
    }

    document.querySelectorAll('.toggle-sub').forEach(cb => {
        cb.addEventListener('change', updateSubToggles);
    });

    // Slider font & line height
    const sliderFontSize = document.getElementById('sliderFontSize');
    const valFontSize = document.getElementById('valFontSize');
    if (sliderFontSize) {
        sliderFontSize.addEventListener('input', (e) => {
            const val = e.target.value + 'rem';
            valFontSize.textContent = val;
            document.querySelectorAll('.box-aksara').forEach(box => {
                box.style.fontSize = val;
            });
        });
    }

    const sliderLineHeight = document.getElementById('sliderLineHeight');
    const valLineHeight = document.getElementById('valLineHeight');
    if (sliderLineHeight) {
        sliderLineHeight.addEventListener('input', (e) => {
            const val = e.target.value;
            valLineHeight.textContent = val;
            document.querySelectorAll('.box-aksara').forEach(box => {
                box.style.lineHeight = val;
            });
        });
    }

    // Textarea input & clear button
    const inputLatin = document.getElementById('inputLatin');
    const btnClear = document.getElementById('btnClear');
    if (inputLatin) {
        inputLatin.addEventListener('input', processTransliteration);
    }
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            inputLatin.value = '';
            processTransliteration();
            inputLatin.focus();
        });
    }

    // Modal Dwipurwa
    const modalDwipurwa = document.getElementById('modalDwipurwa');
    const btnOpenDwipurwa = document.getElementById('btnOpenDwipurwa');
    const btnCloseDwipurwa = document.getElementById('btnCloseDwipurwa');
    const dwipDasar = document.getElementById('dwipDasar');
    const dwipOutLatin = document.getElementById('dwipOutLatin');
    const dwipOutAksara = document.getElementById('dwipOutAksara');
    const btnCopyDwip = document.getElementById('btnCopyDwip');
    const btnUseDwip = document.getElementById('btnUseDwip');

    function updateDwipurwaModal() {
        const dasar = dwipDasar ? dwipDasar.value.trim() : '';
        if (!dasar) {
            if (dwipOutLatin) dwipOutLatin.textContent = '-';
            if (dwipOutAksara) dwipOutAksara.textContent = '-';
            return;
        }
        
        let latinRes = typeof prosesDwipurwaSriwedari === 'function' 
            ? prosesDwipurwaSriwedari('', dasar)
            : dasar;
        
        if (dwipOutLatin) dwipOutLatin.textContent = latinRes;
        let aksaraRes = runModuleTransliteration('sriwedari', latinRes);
        if (dwipOutAksara) dwipOutAksara.textContent = aksaraRes || '-';
    }

    if (btnOpenDwipurwa) {
        btnOpenDwipurwa.addEventListener('click', () => {
            if (modalDwipurwa) modalDwipurwa.style.display = 'flex';
            if (dwipDasar) dwipDasar.focus();
            updateDwipurwaModal();
        });
    }
    if (btnCloseDwipurwa) {
        btnCloseDwipurwa.addEventListener('click', () => {
            if (modalDwipurwa) modalDwipurwa.style.display = 'none';
        });
    }
    if (dwipDasar) dwipDasar.addEventListener('input', updateDwipurwaModal);

    if (btnCopyDwip) {
        btnCopyDwip.addEventListener('click', () => {
            const txt = dwipOutLatin ? dwipOutLatin.textContent : '';
            if (txt && txt !== '-') {
                navigator.clipboard.writeText(txt).then(() => {
                    let orig = btnCopyDwip.textContent;
                    btnCopyDwip.textContent = 'Tersalin!';
                    setTimeout(() => { btnCopyDwip.textContent = orig; }, 1500);
                });
            }
        });
    }
    if (btnUseDwip) {
        btnUseDwip.addEventListener('click', () => {
            const txt = dwipOutLatin ? dwipOutLatin.textContent : '';
            if (txt && txt !== '-') {
                tempelKeInputUtama(txt);
                if (modalDwipurwa) modalDwipurwa.style.display = 'none';
            }
        });
    }

    // Modal Imbuhan
    const modalImbuhan = document.getElementById('modalImbuhan');
    const btnOpenImbuhan = document.getElementById('btnOpenImbuhan');
    const btnCloseImbuhan = document.getElementById('btnCloseImbuhan');
    const imbAter = document.getElementById('imbAter');
    const imbDasar = document.getElementById('imbDasar');
    const imbPanam = document.getElementById('imbPanam');
    const imbOutLatin = document.getElementById('imbOutLatin');
    const imbOutAksara = document.getElementById('imbOutAksara');
    const btnCopyImb = document.getElementById('btnCopyImb');
    const btnUseImb = document.getElementById('btnUseImb');

    function updateImbuhanModal() {
        const ater = imbAter ? imbAter.value : '';
        const dasar = imbDasar ? imbDasar.value.trim() : '';
        const panam = imbPanam ? imbPanam.value : '';
        if (!dasar) {
            if (imbOutLatin) imbOutLatin.textContent = '-';
            if (imbOutAksara) imbOutAksara.textContent = '-';
            return;
        }
        let latinRes = typeof prosesImbuhanSriwedari === 'function'
            ? prosesImbuhanSriwedari(ater, dasar, panam)
            : (ater ? ater + '-' + dasar : dasar);

        if (imbOutLatin) imbOutLatin.textContent = latinRes;
        let aksaraRes = runModuleTransliteration('sriwedari', latinRes);
        if (imbOutAksara) imbOutAksara.textContent = aksaraRes || '-';
    }

    if (btnOpenImbuhan) {
        btnOpenImbuhan.addEventListener('click', () => {
            if (modalImbuhan) modalImbuhan.style.display = 'flex';
            if (imbDasar) imbDasar.focus();
            updateImbuhanModal();
        });
    }
    if (btnCloseImbuhan) {
        btnCloseImbuhan.addEventListener('click', () => {
            if (modalImbuhan) modalImbuhan.style.display = 'none';
        });
    }
    if (imbAter) imbAter.addEventListener('change', updateImbuhanModal);
    if (imbDasar) imbDasar.addEventListener('input', updateImbuhanModal);
    if (imbPanam) imbPanam.addEventListener('change', updateImbuhanModal);

    if (btnCopyImb) {
        btnCopyImb.addEventListener('click', () => {
            const txt = imbOutLatin ? imbOutLatin.textContent : '';
            if (txt && txt !== '-') {
                navigator.clipboard.writeText(txt).then(() => {
                    let orig = btnCopyImb.textContent;
                    btnCopyImb.textContent = 'Tersalin!';
                    setTimeout(() => { btnCopyImb.textContent = orig; }, 1500);
                });
            }
        });
    }
    if (btnUseImb) {
        btnUseImb.addEventListener('click', () => {
            const txt = imbOutLatin ? imbOutLatin.textContent : '';
            if (txt && txt !== '-') {
                tempelKeInputUtama(txt);
                if (modalImbuhan) modalImbuhan.style.display = 'none';
            }
        });
    }

    // Menutup Modal saat klik overlay
    window.addEventListener('click', (e) => {
        if (e.target === modalDwipurwa) modalDwipurwa.style.display = 'none';
        if (e.target === modalImbuhan) modalImbuhan.style.display = 'none';
    });

    // Inisialisasi awal
    initEngineFrames();
    updateSubToggles();
    if (typeof muatKamusVokal === 'function') {
        muatKamusVokal('kamus_vokal.json').then(() => {
            processTransliteration();
        });
    }
    setTimeout(processTransliteration, 50);
});
