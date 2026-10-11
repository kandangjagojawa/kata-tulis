/**
 * ipa.js
 * Modul Konversi Transliterasi JGST ke IPA (International Phonetic Alphabet)
 */

function extractIPAVowels(ipaStr) {
    const ipaVowelRegex = /(aː|iː|uː|aɪ|aʊ|[aiueɛəoɔɪʊ])/g;
    return ipaStr.match(ipaVowelRegex) || [];
}

function convertJGSTtoIPA(jgstStr, rawLatinToken, fnKey) {
    if (!jgstStr || jgstStr === '-') return '-';
    
    let words = jgstStr.split(/(\s+)/);
    let lastMainIPAVowels = null;

    const ipaMap = {
        'ā': 'aː', 'ī': 'iː', 'ū': 'uː',
        'ñ': 'ɲ', 'ṅ': 'ŋ', 'ṇ': 'ɳ',
        'ṭ': 'ʈ', 'ḍ': 'ɖ', 'c': 'tʃ', 'j': 'dʒ',
        'y': 'j', // Ya bawaan -> IPA /j/
        'w': 'w', // Wa bawaan (tebal & tipis) -> IPA /w/
        'ś': 'ʃ', 'ṣ': 'ʂ', 'ḥ': 'h',
        'q': 'q', 'x': 'x', 'f': 'f', 'v': 'v', 'z': 'z',
        'ṃ': 'm', 'ṙ': 'r', 'ṛ': 'rə', 'ḷ': 'lə',
        'ŕ': 'r', // Cakra -> IPA [r]
        'ꜽ': 'aɪ', 'ꜷ': 'aʊ'
    };
    
    let ipaWords = words.map(word => {
        if (/^\s+$/.test(word)) return word;

        let cleanWord = word.trim();
        let isAlt = cleanWord.startsWith('(') || /\(.*\)/.test(cleanWord);

        // Penanganan khusus kata alternatif di dalam kurung dari KBJ
        if (isAlt && lastMainIPAVowels && lastMainIPAVowels.length > 0) {
            let jgstVowelRegex = /[aāiīuūěéèeoꜽꜷṛḷ]/gi;
            let altVowels = word.match(jgstVowelRegex) || [];
            
            if (altVowels.length === lastMainIPAVowels.length) {
                let vIdx = 0;
                let resAlt = '';
                for (let i = 0; i < word.length; i++) {
                    let char = word[i];
                    if (/[aāiīuūěéèeoꜽꜷṛḷ]/i.test(char)) {
                        resAlt += lastMainIPAVowels[vIdx] || char;
                        vIdx++;
                    } else {
                        let lowerChar = char.toLowerCase();
                        let convertedChar = ipaMap[lowerChar] !== undefined ? ipaMap[lowerChar] : char;
                        if (char >= 'A' && char <= 'Z' && convertedChar.length === 1) {
                            convertedChar = convertedChar.toUpperCase();
                        }
                        resAlt += convertedChar;
                    }
                }
                resAlt = resAlt.replace(/[\uA980-\uA9DF]/g, '');
                resAlt = resAlt.replace(/(tʃ|dʒ|.)\1+/g, '$1');
                return resAlt;
            }
        }
        
        let str = word.toLowerCase().replace(/\/$/, '');
        const vowels = 'aāiīuūěéèeoꜽꜷṛḷ';
        const consPattern = '[bcdfghjklmnpqrstvwxyzñṅṇṭḍcjywśṣḥqxfvzŕŋ]';

        // Pisahkan tanda baca di akhir kata (koma, titik, dll) agar tidak terbaca sebagai konsonan penutup
        let punctMatch = str.match(/([,.?!;:꧈꧉]+)$/);
        let trailingPunct = punctMatch ? punctMatch[1] : '';
        if (trailingPunct) {
            str = str.slice(0, -trailingPunct.length);
        }

        // Konversi awal untuk Pengkal (ỿ) dari JGST menjadi 'y'
        str = str.replace(/ỿ/g, 'y');

        // KHUSUS SRIWEDARI: Pembentukan Tembung Dwipurwa (suku kata pertama berubah menjadi pepet 'ě' -> '/ə/')
        if (fnKey === 'sriwedari') {
            const consPatternDwipurwa = '(th|dh|ng|ny|ñ|ṅ|ŋ|ṇ|ṭha|ṭh|ṭ|ḍha|ḍh|ḍ|ś|ṣ|ṡ|ḳ|g̣|c̣|j̣|p̣|ḅ|[bcdfghjklmnpqrstvwxyz])';
            const dwipurwaRegex = new RegExp(
                `^(di|ke|sa|pi|kuma|kapi)?` + 
                `${consPatternDwipurwa}` + 
                `([${vowels}])` + 
                `\\2` + 
                `([rylwŕ]?)` + 
                `\\3` + 
                `([^${vowels}]*[${vowels}].*)$`,
                'i'
            );

            str = str.replace(dwipurwaRegex, function(match, prefix, c1, v1, medial, rest) {
                prefix = prefix || '';
                medial = medial || '';
                return prefix + c1 + 'ě' + c1 + medial + v1 + rest;
            });
        }

        // Degeminasi konsonan ganda hasil morfologi/pasangan (nn -> n, kk -> k, rr -> r, dst.)
        str = str.replace(/([^aāiīuūěéèeoꜽꜷṛḷ\s])\1+/gi, '$1');

        // 1. Deteksi Ha Tipis vs Ha Tebal berdasarkan input Latin asli user
        const isLatinStartWithH = /^h/i.test(rawLatinToken || '');
        
        if (!isLatinStartWithH) {
            str = str.replace(/^h([aāiīuūěéèeoꜽꜷṛḷ])/i, '$1');
        } else {
            str = str.replace(/^h/i, 'h');
        }

        // Pengecualian khusus kata turunan/majemuk tertentu
        if (str === 'macapat') {
            str = 'mɔcɔpat';
        } else {
            // 2. Evaluasi Suku Kata Terakhir & Pembacaan Vokal A
            let lastChar = str.slice(-1);
            let isVowelEnd = /[aāiīuūěéèeoꜽꜷ]/.test(lastChar);

            if (isVowelEnd) {
                if (lastChar === 'a') {
                    if (!/ana$/i.test(str)) {
                        str = str.replace(new RegExp(`(${consPattern}*a)(${consPattern}+a)$`, 'i'), function(match, penult, ult) {
                            return penult.replace(/a/g, 'ɔ') + ult;
                        });
                    }
                    str = str.replace(/a$/i, 'ɔ');
                }
            } else {
                // Vokal miring pada suku kata tertutup akhir (i->ɪ, u->ʊ, e->ɛ, o->ɔ)
                str = str.replace(new RegExp(`([${vowels}])([^${vowels}]*)$`), function(match, vowel, cons) {
                    if (vowel === 'i') return 'ɪ' + cons;
                    if (vowel === 'u') return 'ʊ' + cons;
                    if (['é', 'è', 'e'].includes(vowel)) return 'ɛ' + cons;
                    if (vowel === 'o') return 'ɔ' + cons;
                    return vowel + cons;
                });
                
                // Harmony vokal untuk suku kata tertutup
                if (/ɔ[^aeiouɔɛɪʊ]*$/.test(str)) str = str.replace(/o/g, 'ɔ');
                if (/ɛ[^aeiouɔɛɪʊ]*$/.test(str)) str = str.replace(/[éèe]/g, 'ɛ');
            }

            // Aturan Khusus Vokal Taling Tarung (o) Miring (ɔ)
            str = str.replace(new RegExp(`o(${consPattern}+[iu])$`, 'i'), 'ɔ$1');
            str = str.replace(new RegExp(`o(${consPattern}+[ěeə]${consPattern}+)$`, 'i'), 'ɔ$1');
        }

        // 3. Aturan Khusus Vokal E-Miring (ɛ) Berimbuhan & Miring Ganda
        if (/[éèɛ].*?[éèɛ]/i.test(str) && !/[éèe]$/i.test(str)) {
            str = str.replace(/[éè]/g, 'ɛ');
        }
        
        if (/(an|en|e|i|a|ana|ne|ake|aken|ipun)$/i.test(str)) {
            str = str.replace(/[éè]/g, 'ɛ');
        }

        // Normalisasi sisa vokal é/è (e-jejeg) dan ě (pepet)
        str = str.replace(/[éè]/g, 'e'); 
        str = str.replace(/ě/g, 'ə'); 

        let res = '';
        for (let i = 0; i < str.length; i++) {
            let char = str[i];
            res += (ipaMap[char] !== undefined) ? ipaMap[char] : char;
        }

        // Hapus sisa karakter Unicode Aksara Jawa / simbol khusus non-IPA
        res = res.replace(/[\uA980-\uA9DF]/g, '');

        // Degeminasi simbol IPA ganda berturut-turut
        res = res.replace(/(tʃ|dʒ|.)\1+/g, '$1');

        // Kembalikan tanda baca di akhir hasil fonetis
        res += trailingPunct;

        // Simpan pola vokal IPA kata utama untuk digunakan oleh alternatif di dalam kurung berikutnya
        lastMainIPAVowels = extractIPAVowels(res);

        return res;
    });

    return ipaWords.join('').trim() || '-';
}

if (typeof window !== 'undefined') {
    window.convertJGSTtoIPA = convertJGSTtoIPA;
}
