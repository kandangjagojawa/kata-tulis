/**
 * ipa.js
 * Modul Konversi Transliterasi JGST ke IPA (International Phonetic Alphabet)
 * Pembaruan Fonem Vokal:
 * - Kata 2 Suku Kata Terbuka berakhiran 'a' (termasuk -ana): [ɔ] (mana -> [mɔnɔ], kana -> [kɔnɔ]).
 * - Kata 2 Suku Kata S1 Tertutup Nasal: Terasimilasi ke [ɔ] (kanca -> [kɔɲtʃɔ]).
 * - Kata 3+ Suku Kata dengan Sufiks -ana: Batasi perubahan [ɔ] hanya pada sufiks (panganana -> [paŋanɔnɔ]).
 * - Kata 3 Suku Kata S1 Tertutup Nasal: S1 miring [a], S2 & S3 jejeg [ɔ] (kandhana -> [kanɖʱɔnɔ], pancaka -> [paɲtʃɔkɔ]).
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
        'ā': 'aː', 'ī': 'iː', 'ū': 'uː',
        'ꜽ': 'aɪ', 'ꜷ': 'aʊ', 'ꜹ': 'aʊ',
        'jñ': 'ɲ', 'ñ': 'ɲ', 'ṅ': 'ŋ', 'ṇ': 'ɳ',
        'ṭ': 'ʈ', 'ḍ': 'ɖ', 'c': 'tʃ', 'j': 'dʒ',
        'y': 'j', 'w': 'w',
        'ś': 'ʃ', 'ṣ': 'ʂ', 'ḥ': 'ħ', 'ṡ': 'θ', 'ẓ': 'ðˤ', '‘': 'ʕ',
        'q': 'q', 'x': 'x', 'f': 'f', 'v': 'v', 'z': 'z',
        'c̣': 'tʃʰ', 'p̣': 'pʰ', 'g̣': 'ɡʱ', 'ḅ': 'bʱ', 'j̣': 'ɲ', 'ṟ': 'r',
        'ṃ': 'm', 'ṙ': 'r', 'ṛ': 'rə', 'ḷ': 'lə',
        'ŕ': 'r'
    };
    
    let ipaWords = words.map(word => {
        if (/^\s+$/.test(word)) return word;

        let cleanWord = word.trim();
        let isAlt = cleanWord.startsWith('(') || /\(.*\)/.test(cleanWord);

        if (isAlt && lastMainIPAVowels && lastMainIPAVowels.length > 0) {
            let jgstVowelRegex = /[aāiīuūěéèeoꜽꜷꜹṛḷ]/gi;
            let altVowels = word.match(jgstVowelRegex) || [];
            
            if (altVowels.length === lastMainIPAVowels.length) {
                let vIdx = 0;
                let resAlt = '';
                for (let i = 0; i < word.length; i++) {
                    let char = word[i];
                    if (/[aāiīuūěéèeoꜽꜷꜹṛḷ]/i.test(char)) {
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
        const vowels = 'aāiīuūěéèeoꜽꜷꜹṛḷ';

        let punctMatch = str.match(/([,.?!;:꧈꧉]+)$/);
        let trailingPunct = punctMatch ? punctMatch[1] : '';
        if (trailingPunct) {
            str = str.slice(0, -trailingPunct.length);
        }

        str = str.replace(/ỿ/g, 'y');

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

        str = str.replace(/([^aāiīuūěéèeoꜽꜷꜹṛḷ\s])\1+/gi, '$1');

        const isLatinStartWithH = /^h/i.test(rawLatinToken || '');
        if (!isLatinStartWithH) {
            str = str.replace(/^h([aāiīuūěéèeoꜽꜷꜹṛḷ])/i, '$1');
        } else {
            str = str.replace(/^h/i, 'h');
        }

        if (str === 'macapat') {
            str = 'mɔcɔpat';
        } else {
            const jgstVowelRegex = /[aāiīuūěéèeoꜽꜷꜹṛḷ]/gi;
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

                // Deteksi khusus struktur S1 pada kata 2 suku kata dan kata 3 suku kata (S3 Terbuka)
                let isTwoOrThreeWithOpenFinal = (numVowels === 2) || (numVowels === 3 && !isClosed[2]);
                let isS1ClosedInTargetWord = isTwoOrThreeWithOpenFinal && isClosed[0];

                let firstSyllableCodaIsNasal = false;
                let firstSyllableCodaIsHandR = false;
                let hasCakraPengkalGembungNext = false;

                if (isS1ClosedInTargetWord) {
                    let vCurr = vowelMatches[0];
                    let vNext = vowelMatches[1];
                    let cBlock = str.substring(vCurr.index + vCurr.vowel.length, vNext.index);
                    
                    let codaMatch = cBlock.match(/^(ng|ny|dh|th|[bcdfghjklmnpqrstvwxyzñṅṇṭḍśṣḥ])/i);
                    let coda = codaMatch ? codaMatch[1].toLowerCase() : '';
                    let onsetS2 = cBlock.substring(coda.length);

                    firstSyllableCodaIsNasal = /^(m|n|ñ|ṅ|ŋ|ṇ|ṃ|ny|ng)$/i.test(coda);
                    firstSyllableCodaIsHandR = /^(h|ḥ|r|ṙ|ṟ)$/i.test(coda);
                    hasCakraPengkalGembungNext = /[ryw]/i.test(onsetS2);
                }

                // A. Penentuan dasar Vokal
                for (let k = 0; k < numVowels; k++) {
                    let v = vowelMatches[k].vowel;
                    let closed = isClosed[k];
                    let isFinal = (k === numVowels - 1);

                    if (v === 'ě') {
                        resolvedVowels[k] = 'ə';
                    } else if (v === 'i') {
                        if (isFinal && closed) {
                            resolvedVowels[k] = 'ɪ';
                        } else if (k === 0 && closed && isTwoOrThreeWithOpenFinal) {
                            let isMiringI = (!firstSyllableCodaIsNasal && !hasCakraPengkalGembungNext) || firstSyllableCodaIsHandR;
                            resolvedVowels[k] = isMiringI ? 'ɪ' : 'i';
                        } else if (closed) {
                            resolvedVowels[k] = 'ɪ';
                        } else {
                            resolvedVowels[k] = 'i';
                        }
                    } else if (v === 'u') {
                        if (isFinal && closed) {
                            resolvedVowels[k] = 'ʊ';
                        } else if (k === 0 && closed && isTwoOrThreeWithOpenFinal) {
                            let isMiringU = (!firstSyllableCodaIsNasal && !hasCakraPengkalGembungNext) || firstSyllableCodaIsHandR;
                            resolvedVowels[k] = isMiringU ? 'ʊ' : 'u';
                        } else if (closed) {
                            resolvedVowels[k] = 'ʊ';
                        } else {
                            resolvedVowels[k] = 'u';
                        }
                    } else if (['é', 'è', 'e'].includes(v)) {
                        if (isFinal && closed) {
                            resolvedVowels[k] = 'ɛ';
                        } else if (k === 0 && closed && isTwoOrThreeWithOpenFinal) {
                            let isMiringE = (!firstSyllableCodaIsNasal && !hasCakraPengkalGembungNext) || firstSyllableCodaIsHandR;
                            resolvedVowels[k] = isMiringE ? 'ɛ' : 'e';
                        } else if (closed) {
                            resolvedVowels[k] = 'ɛ';
                        } else {
                            resolvedVowels[k] = 'e';
                        }
                    } else if (v === 'o') {
                        if (isFinal && closed) {
                            resolvedVowels[k] = 'ɔ';
                        } else if (k === 0 && closed && isTwoOrThreeWithOpenFinal) {
                            let isMiringO = (!firstSyllableCodaIsNasal && !hasCakraPengkalGembungNext) || firstSyllableCodaIsHandR;
                            resolvedVowels[k] = isMiringO ? 'ɔ' : 'o';
                        } else if (closed) {
                            resolvedVowels[k] = 'ɔ';
                        } else {
                            resolvedVowels[k] = 'o';
                        }
                    } else if (v === 'a') {
                        resolvedVowels[k] = 'a';
                    } else {
                        resolvedVowels[k] = v;
                    }
                }

                // B. Penyelarasan Vokal e (é/è) dan o (Harmony Kanan-ke-Kiri)
                for (let k = numVowels - 2; k >= 0; k--) {
                    let v = vowelMatches[k].vowel;
                    let nextRes = resolvedVowels[k + 1];

                    if (['é', 'è', 'e'].includes(v)) {
                        resolvedVowels[k] = (nextRes === 'ɛ' || nextRes === 'ɔ') ? 'ɛ' : 'e';
                    } else if (v === 'o') {
                        resolvedVowels[k] = (nextRes === 'ɛ' || nextRes === 'ɔ') ? 'ɔ' : 'o';
                    }
                }

                // C. Penyelarasan Vokal a (Penyelarasan Rantai Berurutan)
                let lastIdx = numVowels - 1;
                let lastVowelChar = vowelMatches[lastIdx].vowel;
                let isSuffixAna = (numVowels > 2 && /ana$/i.test(str));

                if (lastVowelChar === 'a' && !isClosed[lastIdx]) {
                    for (let j = lastIdx; j >= 0; j--) {
                        if (vowelMatches[j].vowel === 'a') {
                            // Pembatas khusus sufiks -ana pada kata 3+ suku kata
                            if (isSuffixAna && j < numVowels - 2) {
                                break;
                            }
                            if (j === 0 && isClosed[0]) {
                                let s1IsJejegA = (numVowels === 2 && firstSyllableCodaIsNasal);
                                if (!s1IsJejegA) {
                                    break;
                                }
                            }
                            if (j > 0 && isClosed[j]) {
                                break;
                            }
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

        if (/[éèɛ].*?[éèɛ]/i.test(str) && !/[éèe]$/i.test(str)) {
            str = str.replace(/[éè]/g, 'ɛ');
        }
        
        if (/(an|en|e|i|a|ana|ne|ake|aken|ipun)$/i.test(str)) {
            str = str.replace(/[éè]/g, 'ɛ');
        }

        str = str.replace(/[éè]/g, 'e'); 
        str = str.replace(/ě/g, 'ə'); 

        str = str.replace(/ḍh/g, 'ɖʱ')
                 .replace(/ṭh/g, 'ʈʰ')
                 .replace(/dh/g, 'dʱ')
                 .replace(/th/g, 'tʰ')
                 .replace(/jñ/g, 'ɲ')
                 .replace(/g̣/g, 'ɡʱ')
                 .replace(/c̣/g, 'tʃʰ')
                 .replace(/p̣/g, 'pʰ')
                 .replace(/ḅ/g, 'bʱ')
                 .replace(/j̣/g, 'ɲ')
                 .replace(/ṛě/g, 'rəː')
                 .replace(/ḷö/g, 'ləː');

        let res = '';
        for (let i = 0; i < str.length; i++) {
            let char = str[i];
            res += (ipaMap[char] !== undefined) ? ipaMap[char] : char;
        }

        res = res.replace(/[\uA980-\uA9DF]/g, '');
        res = res.replace(/(tʃ|dʒ|.)\1+/g, '$1');
        res += trailingPunct;

        lastMainIPAVowels = extractIPAVowels(res);

        return res;
    });

    return ipaWords.join('').trim() || '-';
}

if (typeof window !== 'undefined') {
    window.convertJGSTtoIPA = convertJGSTtoIPA;
}
