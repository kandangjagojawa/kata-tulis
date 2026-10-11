/**
 * ipa.js
 * Modul Konversi Transliterasi JGST ke IPA (International Phonetic Alphabet)
 * Diperbarui sesuai kaidah fonologi vokal Jawa (jejeg & miring):
 * - Vokal 'i' & 'u': Miring ([ɪ] / [ʊ]) HANYA pada suku kata tertutup AKHIR. Suku kata bukan akhir (terbuka/tertutup) adalah jejeg ([i] / [u]).
 * - Vokal 'e' (é/è/e-taling) & 'o' (taling-tarung): Miring ([ɛ] / [ɔ]) pada suku kata tertutup akhir dan menyelaraskan suku kata sebelumnya (harmony).
 * - Vokal 'a': Miring ([a]), kecuali berakhiran suku kata terbuka 'a' ([ɔ]) yang menyelaraskan deretan vokal 'a' sebelumnya secara berurutan.
 */

function extractIPAVowels(ipaStr) {
    const ipaVowelRegex = /(aː|iː|uː|aɪ|aʊ|rəː|ləː|rə|lə|[aiueɛəoɔɪʊ])/g;
    return ipaStr.match(ipaVowelRegex) || [];
}

function convertJGSTtoIPA(jgstStr, rawLatinToken, fnKey) {
    if (!jgstStr || jgstStr === '-') return '-';
    
    let words = jgstStr.split(/(\s+)/);
    let lastMainIPAVowels = null;

    // Kamus Pemetaan Karakter Tunggal JGST ke IPA
    const ipaMap = {
        // Vokal Panjang & Diftong
        'ā': 'aː', 'ī': 'iː', 'ū': 'uː',
        'ꜽ': 'aɪ', 'ꜷ': 'aʊ',
        
        // Konsonan Dasar, Retrofleks, Palatal & Nasal
        'ñ': 'ɲ', 'ṅ': 'ŋ', 'ṇ': 'ɳ',
        'ṭ': 'ʈ', 'ḍ': 'ɖ', 'c': 'tʃ', 'j': 'dʒ',
        'y': 'j', // Ya bawaan -> IPA /j/
        'w': 'w', // Wa bawaan -> IPA /w/
        
        // Konsonan Frikatif, Serapan Arab & Rekan
        'ś': 'ʃ', 'ṣ': 'ʂ', 'ḥ': 'ħ', 'ṡ': 'θ', 'ẓ': 'ðˤ', '‘': 'ʕ',
        'q': 'q', 'x': 'x', 'f': 'f', 'v': 'v', 'z': 'z',
        
        // Aksara Murda & Mahaprana Ber-diakritik
        'c̣': 'tʃʰ', 'p̣': 'pʰ', 'g̣': 'gʱ', 'ḅ': 'bʱ', 'j̣': 'ɲ', 'ṟ': 'r',
        
        // Sandhangan & Konsonan Khusus
        'ṃ': 'm', 'ṙ': 'r', 'ṛ': 'rə', 'ḷ': 'lə',
        'ŕ': 'r' // Cakra -> IPA [r]
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

        // Pisahkan tanda baca di akhir kata (koma, titik, dll) agar tidak terbaca sebagai konsonan penutup
        let punctMatch = str.match(/([,.?!;:꧈꧉]+)$/);
        let trailingPunct = punctMatch ? punctMatch[1] : '';
        if (trailingPunct) {
            str = str.slice(0, -trailingPunct.length);
        }

        // Konversi awal untuk Pengkal (ỿ) dari JGST menjadi 'y'
        str = str.replace(/ỿ/g, 'y');

        // KHUSUS SRIWEDARI: Pembentukan Tembung Dwipurwa
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

        // Degeminasi konsonan ganda hasil morfologi/pasangan
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
            // 2. Evaluasi Suku Kata & Fonem Vokal Fonetis
            const jgstVowelRegex = /[aāiīuūěéèeoꜽꜷṛḷ]/gi;
            let vowelMatches = [];
            let match;
            while ((match = jgstVowelRegex.exec(str)) !== null) {
                vowelMatches.push({ index: match.index, vowel: match[0] });
            }

            let numVowels = vowelMatches.length;

            if (numVowels > 0) {
                let isClosed = new Array(numVowels).fill(false);
                const singleOrOnsetCluster = /^(th|dh|ng|ny|ñ|ṅ|ṇ|ṭ|ḍ|ś|ṣ|ḥ|ch|jh|kh|gh|ph|bh|sy|sh|[bcdfghjklmnpqrstvwxyz])([rylw])?$/i;

                for (let k = 0; k < numVowels - 1; k++) {
                    let vCurr = vowelMatches[k];
                    let vNext = vowelMatches[k + 1];
                    let cBlock = str.substring(vCurr.index + vCurr.vowel.length, vNext.index);

                    if (cBlock.length > 0 && !singleOrOnsetCluster.test(cBlock)) {
                        isClosed[k] = true;
                    }
                }

                let lastV = vowelMatches[numVowels - 1];
                let tailBlock = str.substring(lastV.index + lastV.vowel.length);
                if (tailBlock.length > 0 && /[bcdfghjklmnpqrstvwxyzñṅṇṭḍcjywśṣḥqxfvzŕŋ]/i.test(tailBlock)) {
                    isClosed[numVowels - 1] = true;
                }

                let resolvedVowels = new Array(numVowels);

                // A. Penentuan dasar Vokal i, u, e (pepet), dan default
                for (let k = 0; k < numVowels; k++) {
                    let v = vowelMatches[k].vowel;
                    let closed = isClosed[k];
                    let isFinal = (k === numVowels - 1);

                    if (v === 'ě') {
                        resolvedVowels[k] = 'ə';
                    } else if (v === 'i') {
                        resolvedVowels[k] = (isFinal && closed) ? 'ɪ' : 'i';
                    } else if (v === 'u') {
                        resolvedVowels[k] = (isFinal && closed) ? 'ʊ' : 'u';
                    } else if (['é', 'è', 'e'].includes(v)) {
                        resolvedVowels[k] = (isFinal && closed) ? 'ɛ' : 'e';
                    } else if (v === 'o') {
                        resolvedVowels[k] = (isFinal && closed) ? 'ɔ' : 'o';
                    } else if (v === 'a') {
                        resolvedVowels[k] = 'a';
                    } else {
                        resolvedVowels[k] = v;
                    }
                }

                // B. Penyelarasan Vokal e (é/è) dan o (Penyelarasan Harmony Kanan-ke-Kiri)
                for (let k = numVowels - 2; k >= 0; k--) {
                    let v = vowelMatches[k].vowel;
                    let nextRes = resolvedVowels[k + 1];

                    if (['é', 'è', 'e'].includes(v)) {
                        resolvedVowels[k] = (nextRes === 'ɛ' || nextRes === 'ɔ') ? 'ɛ' : 'e';
                    } else if (v === 'o') {
                        resolvedVowels[k] = (nextRes === 'ɛ' || nextRes === 'ɔ') ? 'ɔ' : 'o';
                    }
                }

                // C. Penyelarasan Vokal a (Penyelarasan Rantai Berurutan dari Suku Kata Terbuka Akhir)
                let lastIdx = numVowels - 1;
                let lastVowelChar = vowelMatches[lastIdx].vowel;
                if (lastVowelChar === 'a' && !isClosed[lastIdx] && !/ana$/i.test(str)) {
                    for (let j = lastIdx; j >= 0; j--) {
                        if (vowelMatches[j].vowel === 'a') {
                            resolvedVowels[j] = 'ɔ';
                        } else {
                            break;
                        }
                    }
                }

                // D. Rekonstruksi Kata dengan Vokal Fonetis Baru
                let newStr = '';
                let currPos = 0;
                for (let k = 0; k < numVowels; k++) {
                    let vObj = vowelMatches[k];
                    newStr += str.substring(currPos, vObj.index) + resolvedVowels[k];
                    currPos = vObj.index + vObj.vowel.length;
                }
                newStr += str.substring(currPos);
                str = newStr;
            } else {
                str = str.replace(new RegExp(`([${vowels}])([^${vowels}]*)$`), function(match, vowel, cons) {
                    if (vowel === 'i') return 'ɪ' + cons;
                    if (vowel === 'u') return 'ʊ' + cons;
                    if (['é', 'è', 'e'].includes(vowel)) return 'ɛ' + cons;
                    if (vowel === 'o') return 'ɔ' + cons;
                    return vowel + cons;
                });
            }
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

        // Substitusi Token Multi-Karakter JGST (Aspirat, Murda, & Sandhangan Panjang)
        str = str.replace(/ḍh/g, 'ɖʱ')
                 .replace(/ṭh/g, 'ʈʰ')
                 .replace(/dh/g, 'dʱ')
                 .replace(/th/g, 'tʰ')
                 .replace(/jñ/g, 'dʒʱ')
                 .replace(/ṛě/g, 'rəː')
                 .replace(/ḷö/g, 'ləː');

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
