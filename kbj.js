/**
 * KBJ.JS
 * Modul Transliterasi Latin ke Aksara Jawa Paugeran KBJ.
 * Menampilkan opsi ganda (dualitas) dalam tanda kurung untuk nc/nj -> (nyc/nyj).
 */

const KAMUS_AKSARA = {
    'h':'ꦲ', 'n':'ꦤ', 'c':'ꦕ', 'r':'ꦫ', 'k':'ꦏ',
    'd':'ꦢ', 't':'ꦠ', 's':'ꦱ', 'w':'ꦮ', 'l':'ꦭ',
    'p':'ꦥ', 'dh':'\uA9A3', 'j':'ꦗ', 'y':'ꦪ', 'ny':'ꦚ',
    'm':'ꦩ', 'g':'ꦒ', 'b':'ꦧ', 'th':'ꦛ', 'ng':'ꦔ', 'nx':'ꦔ',
    'f':'ꦥ꦳', 'v':'ꦮ꦳', 'z':'ꦗ꦳',
    'kh':'ꦏ꦳', 'dz':'ꦢ꦳', 'gh':'ꦒ꦳',
    'sy':'ꦯ', 'sh':'ꦰ',
    'kx':'ꦏ', 'rx':'ꦫ', 'hx':'ꦲ', 'ngx':'ꦔ'
};

const AKSARA_MURDA = {
    'n':'ꦟ', 'k':'ꦑ', 't':'ꦡ', 's':'ꦯ', 'p':'ꦦ',
    'g':'ꦓ', 'b':'ꦨ', 'c':'ꦖ', 'ny':'ꦘ', 'j':'ꦙ', 'dh':'ꦝ'
};

const SWARA_MAP = {
    'A':'ꦄ', 'I':'ꦆ', 'U':'ꦈ', 'E':'ꦄꦼ', 'É':'ꦌ', 'È':'ꦌ', 'Ê':'ꦄꦼ', 'O':'ꦎ'
};

const ANGKA = ['꧐','꧑','꧒','꧓','꧔','꧕','꧖','꧗','꧘','꧙'];

function scrollToParamasastra() {
    let el = document.getElementById('paramasastra-app');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function ubahFont() {
    let fontSel = document.getElementById('fontSelect');
    if (!fontSel) return;
    let fontTerpilih = fontSel.value;
    let outJawa = document.getElementById('outputJawa');
    let outParam = document.getElementById('outParamJawa');
    if (outJawa) outJawa.style.fontFamily = fontTerpilih;
    if (outParam) outParam.style.fontFamily = fontTerpilih;
}

function ubahUkuranFont() {
    let slider = document.getElementById('fontSizeSlider');
    if (!slider) return;
    let ukuran = slider.value;
    let outJawa = document.getElementById('outputJawa');
    if (outJawa) outJawa.style.fontSize = ukuran + 'rem';
}

function ubahJarakBaris() {
    let lineH = document.getElementById('lineHeightSlider');
    if (!lineH) return;
    let val = lineH.value;
    let outJawa = document.getElementById('outputJawa');
    let outParam = document.getElementById('outParamJawa');
    if (outJawa) outJawa.style.lineHeight = val;
    if (outParam) outParam.style.lineHeight = val;
}

function hapusSemua() {
    let inp = document.getElementById('inputLatin');
    if (inp) inp.value = '';
    prosesTransliterasi();
}

function salinAksara() {
    let el = document.getElementById('outputJawa');
    if (!el) return;
    let teksAksara = el.innerText;
    if (!teksAksara) return;
    navigator.clipboard.writeText(teksAksara).then(() => {
        let btn = document.getElementById('btnSalin');
        if (btn) {
            let originalText = btn.innerText;
            btn.innerText = 'Tersalin!';
            setTimeout(() => { btn.innerText = originalText; }, 2000);
        }
    });
}

function salinParamLatin() {
    let el = document.getElementById('outParamLatin');
    if (!el) return;
    let teksLatin = el.value;
    if (!teksLatin) return;
    navigator.clipboard.writeText(teksLatin);
}

function salinParamJawa() {
    let el = document.getElementById('outParamJawa');
    if (!el) return;
    let teksAksara = el.innerText;
    if (!teksAksara) return;
    navigator.clipboard.writeText(teksAksara).then(() => {
        let btn = document.getElementById('btnSalinParam');
        if (btn) {
            let originalText = btn.innerText;
            btn.innerText = 'Tersalin!';
            setTimeout(() => { btn.innerText = originalText; }, 2000);
        }
    });
}

function updateParamFromManualInput() {
    let inp = document.getElementById('outParamLatin');
    let out = document.getElementById('outParamJawa');
    if (inp && out) {
        out.innerText = transliterasiKalimat(inp.value);
    }
}

function prosesParamasastra() {
    let selAter = document.getElementById('selAter');
    let inDasar = document.getElementById('inDasar');
    let selPanam = document.getElementById('selPanam');
    if (!selAter || !inDasar || !selPanam) return;

    let ater = selAter.value;
    let dasarRaw = inDasar.value.trim();
    let dasar = dasarRaw.replace(/e'/g, 'é').replace(/E'/g, 'É').toLowerCase();
    let panam = selPanam.value;

    let warnArea = document.getElementById('paramWarningArea');
    let outLat = document.getElementById('outParamLatin');
    let outJaw = document.getElementById('outParamJawa');

    if (warnArea) warnArea.innerHTML = "";

    if(!dasar) {
        if (outLat) outLat.value = "";
        if (outJaw) outJaw.innerHTML = "";
        return;
    }

    let f = dasar.charAt(0);
    let isVowelStart = /[aiueoéèê]/i.test(f);
    let errorMsg = "";

    if (ater === 'm' && !['b','p','w','m','f','v'].includes(f)) {
        errorMsg = `Ater-ater "m-" khusus untuk kata dasar berawalan p, b, w, m, f, v.`;
    } else if (ater === 'n' && !['d','t','j','n'].includes(f) && !dasar.startsWith('dh') && !dasar.startsWith('th')) {
        errorMsg = `Ater-ater "n-" khusus untuk kata dasar berawalan d, dh, t, th, j, n.`;
    } else if (ater === 'ny' && !['c','s'].includes(f) && !dasar.startsWith('ny')) {
        errorMsg = `Ater-ater "ny-" khusus untuk kata dasar berawalan c, s, ny.`;
    } else if (ater === 'ng' && !['g','k','l','r','y','w'].includes(f) && !isVowelStart && !dasar.startsWith('ng')) {
        errorMsg = `Ater-ater "ng-" khusus untuk kata dasar berawalan k, g, l, r, y, w, atau vokal.`;
    }

    if (errorMsg !== "") {
        if (warnArea) warnArea.innerHTML = `<div class="param-warning">⚠️ WARNING PAUGERAN KBJ: ${errorMsg}</div>`;
        if (outLat) outLat.value = "";
        if (outJaw) outJaw.innerHTML = "";
        return;
    }

    let stem = dasar;
    let prefixAppended = "";
    let altPrefixAppended = "";

    if (['N', 'm', 'n', 'ny', 'ng', 'pa'].includes(ater)) {
        if (dasar.startsWith('ng')) {
            stem = dasar; altPrefixAppended = 'ha';
        } else if (dasar.startsWith('ny')) {
            stem = dasar; altPrefixAppended = 'ha';
        } else if (f === 'n') {
            stem = dasar; altPrefixAppended = 'ha';
        } else if (f === 'm') {
            stem = dasar; altPrefixAppended = 'ha';
        } else if (['d','j'].includes(f) || dasar.startsWith('dh')) {
            if (f === 'j') {
                prefixAppended = 'han'; altPrefixAppended = 'hany'; stem = dasar;
            } else {
                prefixAppended = 'han'; stem = dasar;
            }
        } else if (f === 'b') {
            prefixAppended = 'ham'; stem = dasar;
        } else if (f === 'g') {
            prefixAppended = 'hang'; stem = dasar;
        } else if (['p','w'].includes(f)) {
            stem = 'm' + dasar.slice(1); altPrefixAppended = 'ha';
        } else if (dasar.startsWith('th')) {
            stem = 'n' + dasar.slice(2); altPrefixAppended = 'ha';
        } else if (f === 't') {
            stem = 'n' + dasar.slice(1); altPrefixAppended = 'ha';
        } else if (['c','s'].includes(f)) {
            stem = 'ny' + dasar.slice(1); altPrefixAppended = 'ha';
        } else if (f === 'k') {
            stem = 'ng' + dasar.slice(1); altPrefixAppended = 'ha';
        } else if (isVowelStart) {
            stem = 'ng' + dasar; altPrefixAppended = 'hang';
        } else if (['l','r','y'].includes(f)) {
            stem = 'ng' + dasar; altPrefixAppended = 'ha';
        } else {
            stem = 'ng' + dasar;
        }

        if (ater === 'pa') {
            prefixAppended = 'pa'; altPrefixAppended = '';
        }
    } else if (ater === 'pating_paN') {
        let nasal = '';
        if (['p','b','w','m','f','v'].includes(f)) nasal = 'm';
        else if (['t','d','j','n'].includes(f) || dasar.startsWith('dh') || dasar.startsWith('th')) nasal = 'n';
        else if (['c','s'].includes(f) || dasar.startsWith('ny')) nasal = 'ny';
        else nasal = 'ng';
        
        stem = 'pa' + nasal + dasar; 
        prefixAppended = 'pating ';
    } else if (ater === 'kuma') {
        if (isVowelStart || f === 'r' || f === 'l') {
            stem = dasar; prefixAppended = 'kum'; 
        } else {
            prefixAppended = 'kuma';
        }
    } else if (ater === 'pi' || ater === 'kapi') {
        if (dasar === 'ambak' || dasar === 'hambak') {
            stem = 'yambak'; prefixAppended = ater;
        } else if (isVowelStart) {
            stem = dasar.startsWith('h') ? dasar : 'h' + dasar; prefixAppended = ater;
        } else {
            prefixAppended = ater;
        }
    } else if (ater === 'ma') {
        if (f === 'i') stem = 'mé' + dasar.slice(1);
        else prefixAppended = 'ma';
    } else if (ater === 'sa') {
        const saExclusions = ['wengi', 'wulan', 'wis', 'weruh', 'wiji', 'wanci'];
        if (f === 'w' && !saExclusions.includes(dasar)) prefixAppended = 'su';
        else prefixAppended = 'sa';
    } else if (ater === 'in') {
        if (isVowelStart) stem = 'in' + dasar;
        else stem = f + 'in' + dasar.slice(1);
        prefixAppended = '';
    } else if (ater !== '') {
        if (isVowelStart && ['dak', 'tak', 'kok', 'ko', 'di', 'ka', 'ke'].includes(ater)) {
            prefixAppended = ater + '-';
        } else {
            prefixAppended = ater;
        }
    }

    let resultLatinMain = "";
    let resultLatinAlt = "";

    function bentakAkhiran(pStem, pPrefix) {
        if (panam === '') return pPrefix ? (pPrefix + pStem) : pStem;
        
        let stemLastChar = pStem.slice(-1);
        let stemIsVowel = /[aiueoéèê]/i.test(stemLastChar);
        let isTanggapI = (panam === 'i' && (ater === 'ka' || ater === 'in'));

        if (!stemIsVowel) {
            let formattedStem = pPrefix ? (pPrefix + pStem) : pStem;
            if (panam === 'an_e') return formattedStem + '-anné';
            let currentPanam = isTanggapI ? 'an' : panam;
            return formattedStem + '-' + currentPanam;
        } else {
            let rootVowel = stemLastChar;
            let body = pStem;
            let suffixMod = panam;

            if (isTanggapI) {
                if (rootVowel === 'a') { body = pStem; suffixMod = 'nnan'; }
                else if (rootVowel === 'i') { body = pStem.slice(0, -1) + 'è'; suffixMod = 'nnan'; }
                else if (rootVowel === 'u') { body = pStem.slice(0, -1) + 'o'; suffixMod = 'nnan'; }
                else if (['e','é','è','o'].includes(rootVowel)) { body = pStem; suffixMod = 'nnan'; }
            } else if (panam === 'i' || panam === 'ana') {
                suffixMod = (panam === 'i') ? 'nni' : 'nnana';
                if (rootVowel === 'u') body = pStem.slice(0, -1) + 'o';
                else if (rootVowel === 'i') body = pStem.slice(0, -1) + 'é';
                else if (rootVowel === 'a') body = pStem;
                else if (['e','é','è','o'].includes(rootVowel)) body = pStem;
            } else if (panam === 'a') {
                const explicitHaWords = ['priyé', 'priyayi', 'tawu', 'suwowo'];
                if (explicitHaWords.includes(pStem)) { body = pStem; suffixMod = 'ha'; }
                else {
                    if (rootVowel === 'i') { body = pStem; suffixMod = 'ya'; }
                    else if (['e','é','è'].includes(rootVowel)) { body = pStem; suffixMod = 'a'; }
                    else if (rootVowel === 'u' || rootVowel === 'o') { body = pStem; suffixMod = 'wa'; }
                    else { body = pStem; suffixMod = 'a'; }
                }
            } else if (panam === 'na') {
                if (rootVowel === 'a') body = pStem;
                else if (rootVowel === 'i') body = pStem.slice(0, -1) + 'é';
                else if (rootVowel === 'u') body = pStem.slice(0, -1) + 'o';
                suffixMod = 'kna';
            } else if (panam === 'an_e') {
                if (['e','é','è'].includes(rootVowel)) {
                    body = pStem; suffixMod = 'anné';
                } else {
                    if (rootVowel === 'a') body = pStem;
                    else if (rootVowel === 'i') body = pStem.slice(0, -1) + 'è';
                    else if (rootVowel === 'u') body = pStem.slice(0, -1) + 'o';
                    suffixMod = 'nnanné';
                }
            } else {
                if (panam === 'an') {
                    if (pStem === 'uji') { body = pStem; suffixMod = 'an'; }
                    else if (rootVowel === 'a') { body = pStem; suffixMod = 'n'; }
                    else if (rootVowel === 'i') { body = pStem.slice(0, -1) + 'è'; suffixMod = 'n'; }
                    else if (rootVowel === 'u') { body = pStem.slice(0, -1) + 'o'; suffixMod = 'n'; }
                    else if (['e','é','è'].includes(rootVowel)) { body = pStem; suffixMod = 'an'; }
                    else { body = pStem; suffixMod = 'nan'; }
                } else if (rootVowel === 'a') {
                    if(['ake', 'aké'].includes(panam)) suffixMod = 'kake';
                    else if(panam === 'aken') suffixMod = 'kaken';
                    else if(panam === 'en') suffixMod = 'nen';
                    else if(['e', 'é'].includes(panam)) suffixMod = 'ne';
                    else if(panam === 'ipun') suffixMod = 'nipun';
                    else suffixMod = panam;
                } else if (rootVowel === 'i') {
                    if (['e', 'é', 'ipun'].includes(panam)) {
                        body = pStem; suffixMod = (panam === 'ipun') ? 'nipun' : 'ne';
                    } else {
                        body = pStem.slice(0, -1) + 'é';
                        if(['ake', 'aké'].includes(panam)) suffixMod = 'kake';
                        else if(panam === 'aken') suffixMod = 'kaken';
                        else if(panam === 'en') suffixMod = 'nen';
                        else suffixMod = panam;
                    }
                } else if (rootVowel === 'u') {
                    if (panam === 'ipun') { body = pStem; suffixMod = 'nipun'; }
                    else if (['e', 'é'].includes(panam)) { body = pStem; suffixMod = 'ne'; }
                    else if (['ake', 'aké', 'aken', 'en'].includes(panam)) {
                        body = pStem.slice(0, -1) + 'o';
                        if(['ake','aké'].includes(panam)) suffixMod='kake';
                        if(panam==='aken') suffixMod='kaken';
                        if(panam==='en') suffixMod='nen';
                    } else suffixMod = panam;
                } else if (['e','é','è'].includes(rootVowel)) {
                    body = pStem;
                    if(['ake', 'aké'].includes(panam)) suffixMod = 'kake';
                    else if(panam === 'aken') suffixMod = 'kaken';
                    else if(panam === 'en') suffixMod = 'nen';
                    else if(['e', 'é'].includes(panam)) suffixMod = 'ne';
                    else if(panam === 'ipun') suffixMod = 'nipun';
                    else suffixMod = panam;
                } else {
                    suffixMod = panam;
                }
            }

            let fullBody = pPrefix ? (pPrefix + body) : body;
            return fullBody + '-' + suffixMod;
        }
    }

    resultLatinMain = bentakAkhiran(stem, prefixAppended);

    if (altPrefixAppended !== "") {
        if (altPrefixAppended === 'hang') {
            resultLatinAlt = bentakAkhiran(stem, 'hang');
        } else if (altPrefixAppended === 'hany' && f === 'j') {
            resultLatinAlt = bentakAkhiran('y' + dasar.slice(1), 'han');
        } else {
            resultLatinAlt = bentakAkhiran(stem, altPrefixAppended);
        }
    }

    let fullLatinDisplay = resultLatinMain;
    if (resultLatinAlt !== "") {
        fullLatinDisplay = `${resultLatinMain} (${resultLatinAlt})`;
    }

    if (outLat) outLat.value = fullLatinDisplay;
    if (outJaw) outJaw.innerText = transliterasiKalimat(fullLatinDisplay);
}

function prosesTransliterasi() {
    let inp = document.getElementById('inputLatin');
    let out = document.getElementById('outputJawa');
    if (!inp || !out) return;
    let teksInput = inp.value;
    let hasil = transliterasiKalimat(teksInput);
    out.innerText = hasil;
}

function transliterasiKalimat(teks) {
    if (!teks) return "";
    let teksDiolah = teks.replace(/e'/g, 'é').replace(/E'/g, 'É');

    // Mapping Simbol & Pada Unicode Aksara Jawa
    teksDiolah = teksDiolah
        .replace(/\|\|/g, '\uA9CB')
        .replace(/\|/g, '\uA9CA')
        .replace(/\(\(/g, '\uA9C1')
        .replace(/\)\)/g, '\uA9C2')
        .replace(/<_/g, '\uA9C3')
        .replace(/<>/g, '\uA9C4')
        .replace(/>\^/g, '\uA9C5')
        .replace(/\(o\)/g, '\uA9C6')
        .replace(/:/g, '\uA9C7')
        .replace(/\[\\/g, '\uA9CC')
        .replace(/\\\]/g, '\uA9CD')
        .replace(/\^2/g, '\uA9CE')
        .replace(/_2/g, '\uA9CF')
        .replace(/~~/g, '\uA9DE')
        .replace(/##/g, '\uA9DF')
        .replace(/\^3/g, '\uA981')
        .replace(/\+3/g, '\uA9B3');

    teksDiolah = teksDiolah.replace(/(?<![a-zA-Za-zÀ-ÿ])(mb|ndh|nd|nth|ngg|nj)/gim, function(match) {
        let isUpper = match[0] === match[0].toUpperCase();
        return (isUpper ? 'Ha' : 'ha') + match.toLowerCase();
    });

    let baris = teksDiolah.split('\n');
    let hasilBaris = baris.map(line => {
        let kataKata = line.split(/\s+/);
        let kataJawa = kataKata.map(kata => transliterasiKata(kata));
        
        let lineJoined = kataJawa.join(''); 
        
        lineJoined = lineJoined.replace(/꧀([\u200C\uE000]*)ꦊ/g, '꧀$1ꦭꦼ');
        lineJoined = lineJoined.replace(/꧀([\u200C\uE000]*)([ꦄꦆꦈꦌꦎ])/g, '꧀$1\u200C$2');

        lineJoined = lineJoined.replace(/([ꦀ-꧟])꧀([ꦀ-꧟])(꦳?)꧀([ꦀ-꧟])/g, function(match, p1, p2, p3, p4) {
            if (p2 === 'ꦥ' || p2 === 'ꦱ') return match; 
            return p1 + '꧀\u200C' + p2 + p3 + '꧀' + p4; 
        });

        lineJoined = lineJoined.replace(/꧀([\u200C\uE000]*)ꦣ/g, '꧀$1ꦝ');

        return lineJoined;
    });
    return hasilBaris.join('\n');
}

function transliterasiKata(rawLatin) {
    if (!rawLatin) return "";

    let markerMatch = rawLatin.match(/([\uE000-\uE0FF]+)$/);
    let marker = markerMatch ? markerMatch[1] : "";
    let cleanLatin = marker ? rawLatin.slice(0, -marker.length) : rawLatin;

    if (/[a-zA-Z]/i.test(cleanLatin) && /(nc|nj)/i.test(cleanLatin) && !/^\(/.test(cleanLatin)) {
        let mainRes = transliterasiSingleKata(cleanLatin);
        let altLatin = cleanLatin.replace(/nc/gi, 'nyc').replace(/nj/gi, 'nyj');
        let altRes = transliterasiSingleKata(altLatin);
        
        if (mainRes !== altRes) {
            return `${mainRes} (${altRes})${marker}`;
        }
    }
    return transliterasiSingleKata(cleanLatin) + marker;
}

function transliterasiSingleKata(rawLatin) {
    if (!rawLatin) return "";

    if (/^([a-zA-Z]\.)+$/.test(rawLatin)) {
        let abbr = "";
        for (let j = 0; j < rawLatin.length; j += 2) {
            let h = rawLatin[j].toLowerCase();
            let nglegena = KAMUS_AKSARA[h] || (['a','i','u','e','o'].includes(h) ? 'ꦲ' : '');
            if (nglegena) abbr += `${nglegena}꧈`; 
        }
        return abbr;
    }

    let prefixMatch = rawLatin.match(/^(dak|tak|kok)([ry])(.*)/i);
    if (prefixMatch) {
        let ater = prefixMatch[1].toLowerCase();
        let cons = prefixMatch[2].toLowerCase();
        let rest = prefixMatch[3];
        
        let aterJawa = '';
        if (ater === 'dak') aterJawa = 'ꦢꦏ꧀';
        else if (ater === 'tak') aterJawa = 'ꦠꦏ꧀';
        else if (ater === 'kok') aterJawa = 'ꦏꦺꦴꦏ꧀';

        if (cons === 'y') {
            aterJawa += 'ꦪ';
        } else if (cons === 'r') {
            if (/^(e|ê)/i.test(rest)) {
                aterJawa += 'ꦉ'; 
                rest = rest.substring(1);
            } else {
                aterJawa += 'ꦫ'; 
            }
        }
        return aterJawa + transliterasiSingleKata(rest);
    }

    let latinProcessed = rawLatin;

    let wordMatchForExc = latinProcessed.match(/^([a-zA-ZéèêÉÈÊ]+)/);
    let isPrefixException = false;
    
    if (wordMatchForExc) {
        const excBases = "diana.*|diandra.*|diar.*|diare.*|dialog.*|diaper.*|diastol.*|diat.*|diuretik.*|diet.*|dieng.*|diesel.*|dioda.*|diorama.*|dion.*|dioksida.*";
        const excPattern = new RegExp(`^(${excBases})$`, 'i');
        if (excPattern.test(wordMatchForExc[1])) {
            isPrefixException = true;
        }
    }

    if (!isPrefixException) {
        latinProcessed = latinProcessed.replace(/^(dak|tak|kok|ko|di|ka|ke)-?([aiueoéèê])/i, function(match, p1, p2) {
            let p1Lower = p1.toLowerCase();
            if (['dak', 'tak', 'kok'].includes(p1Lower)) {
                return p1.slice(0, -1) + 'kxhx' + p2; 
            } else {
                return p1 + 'hx' + p2; 
            }
        });
    }

    // PERBAIKAN HIATUS (é/è dikelompokkan dengan vokal h)
    latinProcessed = latinProcessed.replace(/([aAEÊaeêéèÉÈ])-([aiueoéèêAIUEOÉÈÊ])/g, '$1h$2');
    latinProcessed = latinProcessed.replace(/([iI])-([aiueoéèêAIUEOÉÈÊ])/g, '$1y$2');
    latinProcessed = latinProcessed.replace(/([uoUO])-([aiueoéèêAIUEOÉÈÊ])/g, '$1w$2');

    while (/([a-zA-ZéèêÉÈÊ]+)-([a-zA-ZéèêÉÈÊ]+)/.test(latinProcessed)) {
        latinProcessed = latinProcessed.replace(/([a-zA-ZéèêÉÈÊ]+)-([a-zA-ZéèêÉÈÊ]+)/g, function(match, root, suffix) {
            if (root.toLowerCase() === suffix.toLowerCase()) return root + suffix;

            let suffixLower = suffix.toLowerCase();
            let isPepetSuffix = (suffixLower === 'aken' || suffixLower === 'kaken' || suffixLower === 'en' || suffixLower === 'nen');
            let modSuffix = isPepetSuffix ? suffix.replace(/[eéèê]/gi, 'e') : suffix.replace(/[eéèê]/gi, 'é');

            let lastChar = root.slice(-1).toLowerCase();
            let lastTwoChars = root.slice(-2).toLowerCase();
            let vowels = ['a','i','u','e','o','é','è','ê'];

            if ((modSuffix.toLowerCase() === 'kaké' || modSuffix.toLowerCase() === 'kaken') && vowels.includes(lastChar)) {
                modSuffix = 'kxh' + modSuffix.substring(1); 
            }

            let firstCharSuffix = modSuffix.charAt(0).toLowerCase();
            let consonantToDouble = "";

            if (['ni', 'nni', 'i'].includes(suffixLower) && vowels.includes(lastChar)) {
                modSuffix = 'nni';
            } else if (vowels.includes(firstCharSuffix)) {
                if (['ng', 'ny', 'dh', 'th'].includes(lastTwoChars)) {
                    consonantToDouble = lastTwoChars;
                } else if (!vowels.includes(lastChar) && lastChar !== 'y' && lastChar !== 'w') {
                    consonantToDouble = lastChar; 
                }
            }
            return root + consonantToDouble + modSuffix;
        });
    }

    // PERBAIKAN HIATUS BERURUTAN LANGSUNG
    let prevLatin = "";
    while (latinProcessed !== prevLatin) {
        prevLatin = latinProcessed;
        latinProcessed = latinProcessed.replace(/([aeêéèAEÊÉÈ])([aiueoéèê])/g, '$1h$2');
        latinProcessed = latinProcessed.replace(/([iI])([aiueoéèê])/g, '$1y$2');
        latinProcessed = latinProcessed.replace(/([uoUO])([aiueoéèê])/g, '$1w$2');
    }

    let res = "";
    let i = 0;
    let latin = latinProcessed;
    let isFirstAksara = true; 

    while (i < latin.length) {
        if (latin[i] >= '0' && latin[i] <= '9') {
            if (!res.endsWith('꧇') && !/[꧐-꧙]$/.test(res)) { res += '꧇'; }
            res += ANGKA[parseInt(latin[i])];
            i++;
            if (i >= latin.length || !(latin[i] >= '0' && latin[i] <= '9')) { res += '꧇'; }
            continue;
        }

        if (latin[i] === ',') { 
            if (res.endsWith('꧀')) { res += '\u200C'; } else { res += '꧈'; }
            i++; continue; 
        }
        if (latin[i] === '.') { 
            if (res.endsWith('꧀')) { res += '꧈\u200C'; } else { res += '꧉'; }
            i++; continue; 
        }
        
        if (!/[a-zA-ZéèêÉÈÊ]/i.test(latin[i])) {
            res += latin[i]; i++; continue; 
        }

        let c = "";
        let jump = 0;
        let isSwara = false;
        let isMurda = false;

        let c3_raw = i+2 < latin.length ? latin.substring(i, i+3) : "";
        let c2_raw = i+1 < latin.length ? latin.substring(i, i+2) : "";
        let c1_raw = latin[i];

        let c3 = c3_raw.toLowerCase();
        let c2 = c2_raw.toLowerCase();
        let c1 = c1_raw.toLowerCase();

        if ((c2_raw === 'NY' || c2_raw === 'Ny') && AKSARA_MURDA['ny']) {
            c = 'ny'; jump = 2; isMurda = true;
        } else if (c1_raw === 'J' && AKSARA_MURDA['j']) {
            c = 'j'; jump = 1; isMurda = true;
        } else if (['ngx'].includes(c3)) {
            c = c3; jump = 3;
        } else if (['ng','ny','dh','th','nx','kh','dz','gh','kx','rx','hx','sy','sh'].includes(c2)) {
            c = c2; jump = 2;
        } else if (KAMUS_AKSARA[c1]) {
            c = c1; jump = 1;
            if (c1_raw >= 'A' && c1_raw <= 'Z' && AKSARA_MURDA[c1]) {
                isMurda = true;
            }
        } else if (['A','I','U','E','O','É','È','Ê'].includes(c1_raw)) {
            c = c1_raw; isSwara = true; jump = 1;
        }

        if (c === "" && /[aieéèêou]/.test(c1)) {
            c = "h"; jump = 0;
        } else if (c !== "") {
            i += jump;
        } else {
            res += latin[i]; i++; continue;
        }

        let lowerLatin = latin.toLowerCase();
        let medial = "";
        
        if (!isSwara && i < lowerLatin.length && (lowerLatin[i] === 'y' || lowerLatin[i] === 'r')) {
            if (i+1 < lowerLatin.length && /[aieéèêou]/.test(lowerLatin[i+1])) {
                let rejectMedial = false;
                if (c === 'k' && (lowerLatin.substring(i - 3, i) === 'dak' || lowerLatin.substring(i - 3, i) === 'tak' || lowerLatin.substring(i - 3, i) === 'kok')) {
                    rejectMedial = true;
                }
                if (rejectMedial) { medial = ""; } 
                else { medial = lowerLatin[i]; i++; }
            } else if (c === 'h') {
                c = lowerLatin[i]; i++;
            }
        }

        let v = "";
        if (!isSwara && i < lowerLatin.length && /[aieéèêou]/.test(lowerLatin[i])) {
            v = lowerLatin[i]; i++;
        }

        let canTakeSandhangan = !/([꧀ꦁꦂꦃ\u200C]|^)$/.test(res);

        if (medial !== "") {
            let isExplicitX = (c3_raw.toLowerCase() === 'ngx' || c2_raw.toLowerCase() === 'hx' || c2_raw.toLowerCase() === 'rx' || c2_raw.toLowerCase() === 'kx');
            if (!isExplicitX && !isFirstAksara && canTakeSandhangan) {
                if (c === 'ng') { res += 'ꦁ'; c = medial; medial = ""; }
                else if (c === 'r') { res += 'ꦂ'; c = medial; medial = ""; }
                else if (c === 'h') { res += 'ꦃ'; c = medial; medial = ""; }
            }
        }

        if (v === "" && !isSwara) {
            if (c === 'ng' && !isFirstAksara && canTakeSandhangan) res += 'ꦁ'; 
            else if (c === 'r' && !isFirstAksara && canTakeSandhangan) res += 'ꦂ'; 
            else if (c === 'h' && !isFirstAksara && canTakeSandhangan) res += 'ꦃ'; 
            else if (c !== "") {
                let useMurda = isMurda && false;
                let base = (c === 'dh' && res.endsWith('꧀')) ? AKSARA_MURDA['dh'] : (useMurda ? AKSARA_MURDA[c] : KAMUS_AKSARA[c]);
                res += base + '꧀'; 
            }
            
            if (medial !== "") res += KAMUS_AKSARA[medial] + '꧀';
            if (c !== "") isFirstAksara = false;
            continue;
        }

        let nonPasangan = isSwara; 
        if (nonPasangan && res.endsWith('꧀')) res += '\u200C';

        if (c === 'l' && (v === 'e' || v === 'ê') && medial === "") {
            res += 'ꦊ'; 
        } else if (c === 'r' && (v === 'e' || v === 'ê') && medial === "") {
            res += 'ꦉ'; 
        } else {
            let isAttachedAsPasangan = res.endsWith('꧀');
            let useMurda = isMurda && !isAttachedAsPasangan;

            let base = isSwara ? SWARA_MAP[c] : ((c === 'dh' && isAttachedAsPasangan) ? AKSARA_MURDA['dh'] : (useMurda ? AKSARA_MURDA[c] : KAMUS_AKSARA[c]));
            res += base;

            if (medial === 'y') res += 'ꦾ';
            else if (medial === 'r') {
                if (v === 'e' || v === 'ê') { res += 'ꦽ'; v = ''; } 
                else res += 'ꦿ'; 
            }

            if (!isSwara) {
                if (v === 'i') res += 'ꦶ';
                else if (v === 'u') res += 'ꦸ';
                else if (v === 'é' || v === 'è') res += 'ꦺ';
                else if (v === 'e' || v === 'ê') res += 'ꦼ';
                else if (v === 'o') res += 'ꦺꦴ';
            }
        }
        
        if (c !== "") isFirstAksara = false;
    }
    return res;
}
