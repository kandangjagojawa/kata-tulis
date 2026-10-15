/**
 * MORFOLOGI.JS
 * Engine Analisis Morfologi & Normalisasi Vokal E (Taling é/è Client-Side).
 * Fitur: Pemotong Ater-ater, Panambang, Restorasi Peluluhan Anuswara,
 *        Generator Tembung Dwipurwa & Imbuhan Paugeran Sriwedari.
 */

let KAMUS_VOKAL = {};
let isKamusLoaded = false;

async function muatKamusVokal(path = 'kamus_vokal.json') {
    try {
        const response = await fetch(path);
        if (response.ok) {
            KAMUS_VOKAL = await response.json();
            isKamusLoaded = true;
        }
    } catch (err) {
        console.warn('Gagal memuat kamus_vokal.json:', err);
    }
}

const ATER_PEPÈT = ['ke', 'se', 'pe', 'te'];
const ATER_UMUM = ['tak', 'kok', 'di', 'ka', 'sa', 'pa', 'pi', 'pra', 'kuma', 'kami', 'kapi'];
const PANAMBANG = ['ake', 'aken', 'ana', 'ne', 'en', 'ku', 'mu', 'an', 'e', 'i'];

function potongPanambang(stem) {
    let lower = stem;
    let suffix = "";

    for (let suf of PANAMBANG) {
        if (lower.endsWith(suf) && lower.length > suf.length + 2) {
            let modSuf = suf;
            if (suf === 'e' || suf === 'ne') modSuf = suf.slice(0, -1) + 'é';
            if (suf === 'ake') modSuf = 'aké';
            if (suf === 'aken') modSuf = 'aken';

            suffix = '-' + modSuf;
            stem = lower.slice(0, -suf.length);
            return { stem, suffix };
        }
    }

    return { stem, suffix };
}

function potongAterAterBiasa(kata) {
    let lower = kata.toLowerCase();
    let prefix = "";
    let stem = lower;

    for (let pref of ATER_PEPÈT) {
        if (lower.startsWith(pref) && lower.length > pref.length + 2) {
            prefix = pref + '-';
            stem = lower.slice(pref.length);
            return { prefix, stem };
        }
    }

    for (let pref of ATER_UMUM) {
        if (lower.startsWith(pref) && lower.length > pref.length + 2) {
            prefix = pref + '-';
            stem = lower.slice(pref.length);
            return { prefix, stem };
        }
    }

    return { prefix, stem };
}

function buatKandidatAnuswara(kata) {
    let lower = kata.toLowerCase();
    let kandidat = [];

    if (lower.startsWith('ny') && lower.length > 3) {
        let sisa = lower.slice(2);
        kandidat.push({ prefix: 'ny-', stem: 's' + sisa });
        kandidat.push({ prefix: 'ny-', stem: 'c' + sisa });
        kandidat.push({ prefix: 'ny-', stem: 'ny' + sisa });
    } else if (lower.startsWith('ng') && lower.length > 3) {
        let sisa = lower.slice(2);
        kandidat.push({ prefix: 'ng-', stem: 'k' + sisa });
        kandidat.push({ prefix: 'ng-', stem: sisa });
        kandidat.push({ prefix: 'ng-', stem: 'g' + sisa });
    } else if (lower.startsWith('n') && !lower.startsWith('ng') && !lower.startsWith('ny') && lower.length > 2) {
        let sisa = lower.slice(1);
        kandidat.push({ prefix: 'n-', stem: 't' + sisa });
        kandidat.push({ prefix: 'n-', stem: 'th' + sisa });
        kandidat.push({ prefix: 'n-', stem: 'd' + sisa });
        kandidat.push({ prefix: 'n-', stem: 'n' + sisa });
    } else if (lower.startsWith('m') && lower.length > 2) {
        let sisa = lower.slice(1);
        kandidat.push({ prefix: 'm-', stem: 'p' + sisa });
        kandidat.push({ prefix: 'm-', stem: 'w' + sisa });
        kandidat.push({ prefix: 'm-', stem: 'b' + sisa });
        kandidat.push({ prefix: 'm-', stem: 'm' + sisa });
    }

    return kandidat;
}

function cariNormalisasiKata(cleanWord) {
    if (KAMUS_VOKAL[cleanWord]) {
        return KAMUS_VOKAL[cleanWord];
    }

    let { stem: stemPanambang, suffix: sufPanambang } = potongPanambang(cleanWord);
    if (sufPanambang && KAMUS_VOKAL[stemPanambang]) {
        return (KAMUS_VOKAL[stemPanambang] + sufPanambang).replace(/-/g, '');
    }

    let { prefix: prefBiasa, stem: stemBiasa } = potongAterAterBiasa(cleanWord);
    if (prefBiasa) {
        let { stem: stemBiasaPanambang, suffix: sufBiasaPanambang } = potongPanambang(stemBiasa);
        if (KAMUS_VOKAL[stemBiasaPanambang]) {
            return (prefBiasa + KAMUS_VOKAL[stemBiasaPanambang] + sufBiasaPanambang).replace(/-/g, '');
        }
    }

    let daftarAnuswara = buatKandidatAnuswara(cleanWord);
    for (let item of daftarAnuswara) {
        let { prefix: prefAnus, stem: stemAnus } = item;

        if (KAMUS_VOKAL[stemAnus]) {
            return (prefAnus + KAMUS_VOKAL[stemAnus]).replace(/-/g, '');
        }

        let { stem: stemAnusPanambang, suffix: sufAnusPanambang } = potongPanambang(stemAnus);
        if (sufAnusPanambang && KAMUS_VOKAL[stemAnusPanambang]) {
            return (prefAnus + KAMUS_VOKAL[stemAnusPanambang] + sufAnusPanambang).replace(/-/g, '');
        }
    }

    return cleanWord;
}

function normalisasiKata(kata) {
    if (!kata || !isKamusLoaded) return kata;

    let cleanWord = kata.toLowerCase().replace(/[^a-z]/g, '');
    if (!cleanWord) return kata;

    let hasil = cariNormalisasiKata(cleanWord);
    return persiskanKasus(kata, hasil);
}

function persiskanKasus(asli, hasil) {
    if (asli === asli.toUpperCase()) return hasil.toUpperCase();
    if (asli[0] === asli[0].toUpperCase()) {
        return hasil.charAt(0).toUpperCase() + hasil.slice(1);
    }
    return hasil;
}

function normalisasiVokalTeks(kalimat) {
    if (!isKamusLoaded) return kalimat;
    return kalimat.replace(/[a-zA-Za-zA-Z]+/g, function(token) {
        return normalisasiKata(token);
    });
}

/* =========================================================================
 * FUNGSI TAMBAHAN: PEMBENTUKAN TEMBUNG DWIPURWA & IMBUHAN SRIWEDARI
 * ========================================================================= */

function prosesDwipurwaSriwedari(ater, dasarRaw) {
    if (!dasarRaw) return "";
    let dasar = dasarRaw.trim().replace(/e'/g, 'é').replace(/E'/g, 'É').toLowerCase();
    
    let cFirst = "";
    const digraphs = ['th', 'dh', 'ny', 'ng', 'ch', 'gh', 'kh', 'ph', 'bh', 'sh', 'sy'];
    const clusters = ['tr', 'dr', 'kr', 'gr', 'pr', 'br', 'mr', 'sr', 'kl', 'gl', 'pl', 'bl', 'fl', 'sl', 'kw', 'gw', 'sw', 'tw', 'dw'];
    
    let matchedDigraph = digraphs.find(d => dasar.startsWith(d));
    if (matchedDigraph) {
        cFirst = matchedDigraph;
    } else {
        let matchedCluster = clusters.find(c => dasar.startsWith(c));
        if (matchedCluster) {
            cFirst = matchedCluster[0];
        } else if (!/[aiueoéèê]/i.test(dasar[0])) {
            cFirst = dasar[0];
        }
    }

    let dwipStem = cFirst ? (cFirst + 'e' + dasar) : dasar;

    if (!ater) return dwipStem;

    if (ater === 'N') {
        let f = dwipStem.charAt(0);
        if (['p', 'w'].includes(f)) return 'm' + dwipStem.slice(1);
        if (['t'].includes(f) && !dwipStem.startsWith('th')) return 'n' + dwipStem.slice(1);
        if (['c', 's'].includes(f)) return 'ny' + dwipStem.slice(1);
        if (['k'].includes(f)) return 'ng' + dwipStem.slice(1);
        if (dwipStem.startsWith('th')) return 'n' + dwipStem.slice(2);
        if (dwipStem.startsWith('dh')) return 'han' + dwipStem;
        return 'ng' + dwipStem;
    }

    if (['dak', 'tak', 'kok', 'ko', 'di', 'ka', 'ke'].includes(ater)) {
        return ater + '-' + dwipStem;
    }

    return ater + dwipStem;
}

function prosesImbuhanSriwedari(ater, dasarRaw, panam) {
    if (!dasarRaw) return "";
    let dasar = dasarRaw.trim().replace(/e'/g, 'é').replace(/E'/g, 'É').toLowerCase();
    let f = dasar.charAt(0);
    let isVowelStart = /[aiueoéèê]/i.test(f);

    let stem = dasar;
    let prefixAppended = "";
    let hasHyphenPrefix = false;

    if (['N', 'm', 'n', 'ny', 'ng', 'pa'].includes(ater)) {
        if (dasar.startsWith('ng') || dasar.startsWith('ny') || f === 'n' || f === 'm') {
            stem = dasar;
        } else if (['d', 'j'].includes(f) || dasar.startsWith('dh')) {
            prefixAppended = 'han'; stem = dasar;
        } else if (f === 'b') {
            prefixAppended = 'ham'; stem = dasar;
        } else if (f === 'g') {
            prefixAppended = 'hang'; stem = dasar;
        } else if (['p', 'w'].includes(f)) {
            stem = 'm' + dasar.slice(1);
        } else if (dasar.startsWith('th')) {
            stem = 'n' + dasar.slice(2);
        } else if (f === 't') {
            stem = 'n' + dasar.slice(1);
        } else if (['c', 's'].includes(f)) {
            stem = 'ny' + dasar.slice(1);
        } else if (f === 'k') {
            stem = 'ng' + dasar.slice(1);
        } else if (isVowelStart || ['l', 'r', 'y'].includes(f)) {
            stem = 'ng' + dasar;
        } else {
            stem = 'ng' + dasar;
        }

        if (ater === 'pa') {
            prefixAppended = 'pa';
        }
    } else if (ater === 'pating_paN') {
        let nasal = '';
        if (['p', 'b', 'w', 'm', 'f', 'v'].includes(f)) nasal = 'm';
        else if (['t', 'd', 'j', 'n'].includes(f) || dasar.startsWith('dh') || dasar.startsWith('th')) nasal = 'n';
        else if (['c', 's'].includes(f) || dasar.startsWith('ny')) nasal = 'ny';
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
        if (['dak', 'tak', 'kok', 'ko', 'di', 'ka', 'ke'].includes(ater)) {
            prefixAppended = ater;
            hasHyphenPrefix = true;
        } else {
            prefixAppended = ater;
        }
    }

    let fullPref = prefixAppended ? (hasHyphenPrefix ? prefixAppended + '-' : prefixAppended) : '';

    if (!panam) return fullPref + stem;

    let stemLastChar = stem.slice(-1);
    let stemIsVowel = /[aiueoéèê]/i.test(stemLastChar);
    let isTanggapI = (panam === 'i' && (ater === 'ka' || ater === 'in'));

    if (!stemIsVowel) {
        let currentPanam = isTanggapI ? 'an' : panam;
        if (panam === 'an_e') currentPanam = 'anné';
        return fullPref + stem + '-' + currentPanam;
    } else {
        let rootVowel = stemLastChar;
        let body = stem;
        let suffixMod = panam;

        if (isTanggapI) {
            if (rootVowel === 'a') { body = stem; suffixMod = 'nnan'; }
            else if (rootVowel === 'i') { body = stem.slice(0, -1) + 'è'; suffixMod = 'nnan'; }
            else if (rootVowel === 'u') { body = stem.slice(0, -1) + 'o'; suffixMod = 'nnan'; }
            else if (['e', 'é', 'è', 'o'].includes(rootVowel)) { body = stem; suffixMod = 'nnan'; }
        } else if (panam === 'i' || panam === 'ana') {
            suffixMod = (panam === 'i') ? 'nni' : 'nnana';
            if (rootVowel === 'u') body = stem.slice(0, -1) + 'o';
            else if (rootVowel === 'i') body = stem.slice(0, -1) + 'é';
            else if (rootVowel === 'a') body = stem;
            else if (['e', 'é', 'è', 'o'].includes(rootVowel)) body = stem;
        } else if (panam === 'a') {
            const explicitHaWords = ['priyé', 'priyayi', 'tawu', 'suwowo'];
            if (explicitHaWords.includes(stem)) { body = stem; suffixMod = 'ha'; }
            else {
                if (rootVowel === 'i') { body = stem; suffixMod = 'ya'; }
                else if (['e', 'é', 'è'].includes(rootVowel)) { body = stem; suffixMod = 'a'; }
                else if (rootVowel === 'u' || rootVowel === 'o') { body = stem; suffixMod = 'wa'; }
                else { body = stem; suffixMod = 'a'; }
            }
        } else if (panam === 'na') {
            if (rootVowel === 'a') body = stem;
            else if (rootVowel === 'i') body = stem.slice(0, -1) + 'é';
            else if (rootVowel === 'u') body = stem.slice(0, -1) + 'o';
            suffixMod = 'kna';
        } else if (panam === 'an_e') {
            if (['e', 'é', 'è'].includes(rootVowel)) {
                body = stem; suffixMod = 'anné';
            } else {
                if (rootVowel === 'a') body = stem;
                else if (rootVowel === 'i') body = stem.slice(0, -1) + 'è';
                else if (rootVowel === 'u') body = stem.slice(0, -1) + 'o';
                suffixMod = 'nnanné';
            }
        } else {
            if (panam === 'an') {
                if (stem === 'uji') { body = stem; suffixMod = 'an'; }
                else if (rootVowel === 'a') { body = stem; suffixMod = 'n'; }
                else if (rootVowel === 'i') { body = stem.slice(0, -1) + 'è'; suffixMod = 'n'; }
                else if (rootVowel === 'u') { body = stem.slice(0, -1) + 'o'; suffixMod = 'n'; }
                else if (['e', 'é', 'è'].includes(rootVowel)) { body = stem; suffixMod = 'an'; }
                else { body = stem; suffixMod = 'nan'; }
            } else if (rootVowel === 'a') {
                if (['ake', 'aké'].includes(panam)) suffixMod = 'kake';
                else if (panam === 'aken') suffixMod = 'kaken';
                else if (panam === 'en') suffixMod = 'nen';
                else if (['e', 'é'].includes(panam)) suffixMod = 'ne';
                else if (panam === 'ipun') suffixMod = 'nipun';
                else suffixMod = panam;
            } else if (rootVowel === 'i') {
                if (['e', 'é', 'ipun'].includes(panam)) {
                    body = stem; suffixMod = (panam === 'ipun') ? 'nipun' : 'ne';
                } else {
                    body = stem.slice(0, -1) + 'é';
                    if (['ake', 'aké'].includes(panam)) suffixMod = 'kake';
                    else if (panam === 'aken') suffixMod = 'kaken';
                    else if (panam === 'en') suffixMod = 'nen';
                    else suffixMod = panam;
                }
            } else if (rootVowel === 'u') {
                if (panam === 'ipun') { body = stem; suffixMod = 'nipun'; }
                else if (['e', 'é'].includes(panam)) { body = stem; suffixMod = 'ne'; }
                else if (['ake', 'aké', 'aken', 'en'].includes(panam)) {
                    body = stem.slice(0, -1) + 'o';
                    if (['ake', 'aké'].includes(panam)) suffixMod = 'kake';
                    if (panam === 'aken') suffixMod = 'kaken';
                    if (panam === 'en') suffixMod = 'nen';
                } else suffixMod = panam;
            } else if (['e', 'é', 'è'].includes(rootVowel)) {
                body = stem;
                if (['ake', 'aké'].includes(panam)) suffixMod = 'kake';
                else if (panam === 'aken') suffixMod = 'kaken';
                else if (panam === 'en') suffixMod = 'nen';
                else if (['e', 'é'].includes(panam)) suffixMod = 'ne';
                else if (panam === 'ipun') suffixMod = 'nipun';
                else suffixMod = panam;
            } else {
                suffixMod = panam;
            }
        }

        return fullPref + body + '-' + suffixMod;
    }
}

if (typeof window !== 'undefined') {
    window.muatKamusVokal = muatKamusVokal;
    window.normalisasiVokalTeks = normalisasiVokalTeks;
    window.prosesDwipurwaSriwedari = prosesDwipurwaSriwedari;
    window.prosesImbuhanSriwedari = prosesImbuhanSriwedari;
}
