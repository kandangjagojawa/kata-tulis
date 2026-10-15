/**
 * MORFOLOGI.JS
 * Engine Analisis Morfologi & Normalisasi Vokal E (Pepet vs Taling) Client-Side.
 * Fitur: Pemotong Ater-ater, Panambang, & Restorasi Peluluhan Anuswara.
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
            if (suf === 'aken') modSuf = 'akên';

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
            prefix = pref.slice(0, -1) + 'ê-';
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

if (typeof window !== 'undefined') {
    window.muatKamusVokal = muatKamusVokal;
    window.normalisasiVokalTeks = normalisasiVokalTeks;
}
