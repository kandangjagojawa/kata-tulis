/**
 * CARAKAWI.JS
 * Transliterasi Aksara Jawa Cara Kawi (Mardi Kawi)
 * Penyesuaian aturan r mati di tengah kata: tidak merangkap konsonan ha, nga, nya.
 * Penyesuaian r mati + ya: Aksara ra diberi pasangan untuk membentuk Repha (ꦫ꧀) dan ya didobel menggunakan pengkal (ꦪꦾ).
 */

const textInput = document.getElementById('textInput');
const previewOutput = document.getElementById('previewOutput');
const fontSelect = document.getElementById('fontSelect');
const fontSizeRange = document.getElementById('fontSizeRange');
const fontSizeVal = document.getElementById('fontSizeVal');
const lineHeightRange = document.getElementById('lineHeightRange');
const lineHeightVal = document.getElementById('lineHeightVal');
const charCount = document.getElementById('charCount');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');

const CONS_MAP = {
    'th': 'ꦛ', 'dh': 'ꦝ', 'ny': 'ꦚ', 'ng': 'ꦔ',
    'TH': 'ꦜ', 'DH': 'ꦞ', 'NY': 'ꦘ', 'Ny': 'ꦘ', 'NG': 'ꦔ',
    'tH': 'ꦡ', 'dH': 'ꦣ', 'ddh': 'ꦣ', 'Th': 'ꦜ', 'Dh': 'ꦞ', 
    'kh': 'ꦑ', 'gh': 'ꦓ', 'ch': 'ꦖ', 'jh': 'ꦙ', 'ph': 'ꦦ', 'bh': 'ꦨ',
    'sh': 'ꦰ', 'sy': 'ꦯ', 'SH': 'ꦰ', 'SY': 'ꦯ',
    'h':'ꦲ', 'n':'ꦤ', 'c':'ꦕ', 'r':'ꦫ', 'k':'ꦏ',
    'd':'ꦢ', 't':'ꦠ', 's':'ꦱ', 'w':'ꦮ', 'l':'ꦭ',
    'p':'ꦥ', 'j':'ꦗ', 'y':'ꦪ', 'm':'ꦩ', 'g':'ꦒ', 'b':'ꦧ',
    'H':'ꦲ', 'N':'ꦟ', 'C':'ꦖ', 'R':'ꦬ', 'K':'ꦑ',
    'D':'ꦝ', 'T':'ꦡ', 'S':'ꦯ', 'W':'ꦮ', 'L':'ꦭ',
    'J':'ꦙ', 'Y':'ꦪ', 'M':'ꦩ', 'G':'ꦓ', 'B':'ꦨ', 'P':'ꦦ',
    'f': 'ꦥ', 'v': 'ꦮ', 'z': 'ꦗ', 'dz': 'ꦢ'
};

function getWarga(char) {
    if (['ꦕ','ꦖ','ꦗ','ꦙ','ꦚ','ꦯ','ꦪ'].includes(char)) return 'talawya';
    if (['ꦛ','ꦜ','ꦝ','ꦞ','ꦟ','ꦰ','ꦬ','ꦫ'].includes(char)) return 'murdhanya';
    if (['ꦠ','ꦡ','ꦢ','ꦣ','ꦤ','ꦱ','ꦭ'].includes(char)) return 'dantya';
    if (['ꦏ','ꦑ','ꦒ','ꦓ','ꦔ','ꦲ'].includes(char)) return 'kanthya';
    if (['ꦥ','ꦦ','ꦧ','ꦨ','ꦩ','ꦮ'].includes(char)) return 'osthya';
    return 'unknown';
}

function matchVowel(str, idx) {
    let sub2 = str.substr(idx, 2);
    if (['aa', 'ii', 'uu', 'ai', 'au', 'AA', 'II', 'UU', 'AI', 'AU', "e'", 'ex', 'Ix', 'ix'].includes(sub2)) {
        return { val: sub2, len: 2 };
    }
    let sub1 = str.substr(idx, 1);
    if (['a', 'i', 'u', 'e', 'é', 'è', 'o', 'A', 'I', 'U', 'E', 'É', 'È', 'O'].includes(sub1)) {
        return { val: sub1, len: 1 };
    }
    return null;
}

function getSandhanganVowel(v) {
    if (v === 'i' || v === 'I') return 'ꦶ';
    if (v === 'u' || v === 'U') return 'ꦸ';
    if (v === 'é' || v === 'è' || v === 'É' || v === 'È' || v === "e'" || v === 'ex') return 'ꦺ';
    if (v === 'o' || v === 'O') return 'ꦺꦴ';
    if (v === 'e' || v === 'E') return 'ꦼ';
    if (v === 'aa' || v === 'AA') return 'ꦴ';
    if (v === 'ii' || v === 'II') return 'ꦷ';
    if (v === 'uu' || v === 'UU') return 'ꦹ';
    if (v === 'ai' || v === 'AI') return 'ꦻ';
    if (v === 'au' || v === 'AU') return 'ꦻꦴ';
    if (v === 'Ix' || v === 'ix') return '';
    return '';
}

function getMandarinVowel(v) {
    const isCapital = (v === v.toUpperCase() && v !== v.toLowerCase() && v !== "e'" && v !== "ex" && v !== 'Ix' && v !== 'ix');
    if (v === "e'" || v === "ex") return 'ꦲꦺ';
    if (v === 'Ix' || v === 'ix') return 'ꦅ';

    if (isCapital) {
        if (v === 'A') return 'ꦄ';
        if (v === 'AA') return 'ꦄꦴ';
        if (v === 'I') return 'ꦆ';
        if (v === 'II') return 'ꦇ';
        if (v === 'U') return 'ꦈ';
        if (v === 'UU') return 'ꦈꦴ';
        if (v === 'E') return 'ꦄꦼ';
        if (v === 'É' || v === 'È') return 'ꦌ';
        if (v === 'O') return 'ꦎ';
        if (v === 'AI') return 'ꦍ';
        if (v === 'AU') return 'ꦎꦴ';
        return 'ꦄ';
    } else {
        if (v === 'a') return 'ꦲ';
        if (v === 'aa') return 'ꦲꦴ';
        if (v === 'i') return 'ꦲꦶ';
        if (v === 'ii') return 'ꦲꦷ';
        if (v === 'u') return 'ꦲꦸ';
        if (v === 'uu') return 'ꦲꦹ';
        if (v === 'é' || v === 'è') return 'ꦲꦺ';
        if (v === 'o') return 'ꦲꦺꦴ';
        if (v === 'e') return 'ꦲꦼ';
        if (v === 'ai') return 'ꦲꦻ';
        if (v === 'au') return 'ꦲꦻꦴ';
        return 'ꦲ';
    }
}

function matchConsonant(str, idx) {
    let sub3 = str.substr(idx, 3);
    if (CONS_MAP[sub3]) return { char: CONS_MAP[sub3], len: 3, key: sub3.toLowerCase() };
    let sub2 = str.substr(idx, 2);
    if (CONS_MAP[sub2]) return { char: CONS_MAP[sub2], len: 2, key: sub2.toLowerCase() };
    let sub1 = str.substr(idx, 1);
    if (CONS_MAP[sub1]) return { char: CONS_MAP[sub1], len: 1, key: sub1.toLowerCase() };
    return null;
}

function tokenize(rawStr) {
    let tokens = [];
    let currentWord = '';

    for (let i = 0; i < rawStr.length; i++) {
        let c = rawStr[i];
        if (/[a-zA-ZéèÉÈ0-9\-\+_'\~!\#\^\[\]\*]/.test(c)) {
            currentWord += c;
        } else {
            if (currentWord) {
                tokens.push({ type: 'word', val: currentWord });
                currentWord = '';
            }
            tokens.push({ type: 'sep', val: c });
        }
    }
    if (currentWord) {
        tokens.push({ type: 'word', val: currentWord });
    }
    return tokens;
}

function processMacros(text) {
    return text.replace(/@luhur/g, '꧅')
               .replace(/@madya/g, '꧄')
               .replace(/@andhap/g, '꧃')
               .replace(/@guru/g, '꧋꧞꧋')
               .replace(/@uger/g, '꧋꧞꧋')
               .replace(/@adeg/g, '꧋')
               .replace(/@pancak/g, '꧉꧞꧉');
}

function transliterateKawi(rawText) {
    if (!rawText) return '';
    
    rawText = processMacros(rawText);

    rawText = rawText
        .replace(/\|\|/g, '\uA9CB')
        .replace(/\|/g, '\uA9CA')
        .replace(/\(\(/g, '\uA9C1')         .replace(/\)\)/g, '\uA9C2')
        .replace(/<_/g, '\uA9C3')
        .replace(/<>/g, '\uA9C4')
        .replace(/>\^/g, '\uA9C5')
        .replace(/\(o\)/g, '\uA9C6')
        .replace(/:/g, '\uA9C7')
        .replace(/\[\\/g, '\uA9CC')         .replace(/\\\]/g, '\uA9CD')
        .replace(/\^2/g, '\uA9CE')
        .replace(/_2/g, '\uA9CF')
        .replace(/~~/g, '\uA9DE')
        .replace(/##/g, '\uA9DF')
        .replace(/\^3/g, '\uA980')
        .replace(/\+3/g, '\uA9B3');

    let tokens = tokenize(rawText);
    let result = '';

    for (let t = 0; t < tokens.length; t++) {
        let token = tokens[t];

        if (token.type === 'sep') {
            if (token.val === ' ') continue; 
            if (token.val === '\n') { result += '\n'; continue; }
            if (token.val === '.') { result += '꧉'; continue; }
            if (token.val === ',') { result += '꧈'; continue; }
            result += token.val;
            continue;
        }

        let word = token.val;
        let i = 0;
        
        let rSeenInWord = false;
        let lastConsKey = null;
        let lastConsIsMati = false;

        let nextWordToken = null;
        for (let nt = t + 1; nt < tokens.length; nt++) {
            if (tokens[nt].type === 'word') {
                nextWordToken = tokens[nt];
                break;
            }
            if (tokens[nt].type === 'sep' && tokens[nt].val !== ' ') {
                break;
            }
        }

        while (i < word.length) {
            let c = word[i];

            if (c === '-') {
                i++;
                continue;
            }

            if (c === '_') {
                result += '\u200D';
                i++;
                continue;
            }

            if (c === '+') {
                result += '꦳';
                i++;
                continue;
            }

            if (c >= '0' && c <= '9') {
                let numStr = '';
                while (i < word.length && word[i] >= '0' && word[i] <= '9') {
                    const numMap = {'0':'꧐','1':'꧑','2':'꧒','3':'꧓','4':'꧔','5':'꧕','6':'꧖','7':'꧗','8':'꧘','9':'꧙'};
                    numStr += numMap[word[i]];
                    i++;
                }
                result += '꧇' + numStr + '꧇';
                continue;
            }

            if (word.substr(i, 3).toLowerCase() === 'ree') {
                let isStartOfWord = (i === 0);
                let prevCharIsVowel = (i > 0 && matchVowel(word, i - 1));
                let prevCharIsHyphen = (i > 0 && word[i - 1] === '-');
                if (isStartOfWord || prevCharIsVowel || prevCharIsHyphen) {
                    result += 'ꦉꦴ'; 
                    i += 3;
                    continue;
                }
            }

            if (word.substr(i, 3).toLowerCase() === 'lee') {
                let isStartOfWord = (i === 0);
                let prevCharIsVowel = (i > 0 && matchVowel(word, i - 1));
                let prevCharIsHyphen = (i > 0 && word[i - 1] === '-');
                if (isStartOfWord || prevCharIsVowel || prevCharIsHyphen) {
                    result += 'ꦋ'; 
                    i += 3;
                    continue;
                }
            }

            if (word.substr(i, 2).toLowerCase() === 're') {
                let isStartOfWord = (i === 0);
                let prevCharIsVowel = (i > 0 && matchVowel(word, i - 1));
                let prevCharIsHyphen = (i > 0 && word[i - 1] === '-');
                if (isStartOfWord || prevCharIsVowel || prevCharIsHyphen) {
                    result += 'ꦉ'; 
                    i += 2;
                    continue;
                }
            }

            if (word.substr(i, 2).toLowerCase() === 'le') {
                let isStartOfWord = (i === 0);
                let prevCharIsVowel = (i > 0 && matchVowel(word, i - 1));
                let prevCharIsHyphen = (i > 0 && word[i - 1] === '-');
                if (isStartOfWord || prevCharIsVowel || prevCharIsHyphen) {
                    result += 'ꦊ'; 
                    i += 2;
                    continue;
                }
            }

            let cons = matchConsonant(word, i);

            if (cons) {
                let consChar = cons.char;
                let nextIdx = i + cons.len;

                while (nextIdx < word.length && word[nextIdx] === '+') {
                    consChar += '꦳';
                    nextIdx++;
                }

                let peekIdx = nextIdx;
                while(peekIdx < word.length && (word[peekIdx] === '-' || word[peekIdx] === '_')) peekIdx++;

                let hasVowelNext = matchVowel(word, peekIdx) !== null;
                let isWordEnd = !hasVowelNext && peekIdx >= word.length;
                let isMati = !hasVowelNext && !isWordEnd;

                let nextConsTemp = null;
                if (isMati) {
                    nextConsTemp = matchConsonant(word, peekIdx);
                }

                if (cons.key === 'n') {
                    if (rSeenInWord) consChar = 'ꦟ';
                } else if (cons.key === 's') {
                    if (rSeenInWord) consChar = 'ꦰ';
                    if (lastConsKey === 'k' && lastConsIsMati) consChar = 'ꦰ';
                }

                if (isMati && nextConsTemp) {
                    let nextWarga = getWarga(nextConsTemp.char);
                    if (cons.key === 's') {
                        if (nextWarga === 'talawya') consChar = 'ꦯ';
                        else if (nextWarga === 'murdhanya') consChar = 'ꦰ';
                        else if (['dantya', 'kanthya', 'osthya'].includes(nextWarga)) consChar = 'ꦱ';
                    } else if (cons.key === 'n') {
                        if (nextWarga === 'talawya') consChar = 'ꦚ';
                        else if (nextWarga === 'murdhanya') consChar = 'ꦟ';
                        else if (nextWarga === 'dantya') consChar = 'ꦤ';
                    }
                }

                if (cons.key === 'r') rSeenInWord = true;

                let handledWyanjana = false;

                // Aksara Ra tidak boleh diberi pasangan/sandhangan wyanjana (pengkal/cakra/cakra keret/nga lelet)
                if (cons.key !== 'r' && nextIdx < word.length) {
                    let nextConsTemp2 = matchConsonant(word, nextIdx);

                    if (nextConsTemp2 && nextConsTemp2.key === 'r') {
                        let afterRIdx = nextIdx + nextConsTemp2.len;
                        let rVowel = matchVowel(word, afterRIdx);
                        if (rVowel) {
                            let v = rVowel.val;
                            if (v === 'e' || v === 'E') {
                                result += consChar + 'ꦽ'; 
                            } else {
                                result += consChar + 'ꦿ' + getSandhanganVowel(v); 
                            }
                            i = afterRIdx + rVowel.len;
                            rSeenInWord = true;
                            lastConsKey = 'r';
                            lastConsIsMati = false;
                            handledWyanjana = true;
                        }
                    }
                    else if (nextConsTemp2 && nextConsTemp2.key === 'y') {
                        let afterYIdx = nextIdx + nextConsTemp2.len;
                        let yVowel = matchVowel(word, afterYIdx);
                        if (yVowel) {
                            let v = yVowel.val;
                            result += consChar + 'ꦾ' + getSandhanganVowel(v); 
                            i = afterYIdx + yVowel.len;
                            lastConsKey = 'y';
                            lastConsIsMati = false;
                            handledWyanjana = true;
                        }
                    }
                    else if (nextConsTemp2 && nextConsTemp2.key === 'l') {
                        let afterLIdx = nextIdx + nextConsTemp2.len;
                        let lVowel = matchVowel(word, afterLIdx);
                        if (lVowel && (lVowel.val === 'e' || lVowel.val === 'E')) {
                            result += consChar + '꧀ꦊ';
                            i = afterLIdx + lVowel.len;
                            lastConsKey = 'l';
                            lastConsIsMati = false;
                            handledWyanjana = true;
                        }
                    }
                }

                if (handledWyanjana) continue;

                let nextV = matchVowel(word, peekIdx);
                if (nextV) {
                    result += consChar + getSandhanganVowel(nextV.val);
                    
                    let afterVowelIdx = peekIdx + nextV.len;
                    while(afterVowelIdx < word.length && (word[afterVowelIdx] === '-' || word[afterVowelIdx] === '_')) {
                        afterVowelIdx++;
                    }
                    
                    let nextV2 = matchVowel(word, afterVowelIdx);
                    if (nextV2) {
                        let v1 = nextV.val;
                        let v2 = nextV2.val;

                        if (['i', 'I', 'é', 'è', 'E', 'ii', 'II', "e'", 'ex'].includes(v1)) {
                            result += 'ꦪ' + getSandhanganVowel(v2);
                        } else if (['u', 'U', 'o', 'O', 'uu', 'UU'].includes(v1)) {
                            result += 'ꦮ' + getSandhanganVowel(v2);
                        } else {
                            result += 'ꦲ' + getSandhanganVowel(v2);
                        }
                        i = afterVowelIdx + nextV2.len;
                        lastConsIsMati = false;
                        continue;
                    }

                    i = peekIdx + nextV.len;
                    lastConsKey = cons.key;
                    lastConsIsMati = false;
                    continue;
                }

                isWordEnd = !nextV && (peekIdx >= word.length);

                if (cons.key === 'ng') {
                    if (!isWordEnd) {
                        result += consChar + '꧀'; 
                        i = nextIdx;
                    } else {
                        let crossVowel = nextWordToken ? matchVowel(nextWordToken.val, 0) : null;
                        if (crossVowel) {
                            let v = crossVowel.val;
                            result += consChar + getSandhanganVowel(v);
                            nextWordToken.val = nextWordToken.val.substr(crossVowel.len);
                        } else {
                            if (consChar.includes('꦳')) {
                                result += consChar + '꧀';
                            } else {
                                result += 'ꦁ'; 
                            }
                        }
                        i = nextIdx;
                    }
                    lastConsKey = 'ng';
                    lastConsIsMati = true;
                    continue;
                }

                if (cons.key === 'h') {
                    if (!isWordEnd) {
                        result += consChar + '꧀';
                        i = nextIdx;
                    } else {
                        let crossVowel = nextWordToken ? matchVowel(nextWordToken.val, 0) : null;
                        if (crossVowel) {
                            let v = crossVowel.val;
                            result += consChar + getSandhanganVowel(v);
                            nextWordToken.val = nextWordToken.val.substr(crossVowel.len);
                        } else {
                            if (consChar.includes('꦳')) {
                                result += consChar + '꧀';
                            } else {
                                result += 'ꦃ';
                            }
                        }
                        i = nextIdx;
                    }
                    lastConsKey = 'h';
                    lastConsIsMati = true;
                    continue;
                }

                // --- PENANGANAN KONSONAN R MATI DI TENGAH KATA (KHUSUS KAWI/REPHA + OVERRIDE A, B, C) ---
                if (cons.key === 'r') {
                    if (!isWordEnd) {
                        // Menggunakan r diberi pasangan (ꦫ꧀) dengan struktur penyambungan asli
                        result += consChar + '꧀';

                        // 1. PENDEKATAN B: Pasangan Kustom Eksplisit [C1*C2]
                        let handledOverrideB = false;
                        if (word[peekIdx] === '[') {
                            let closeBracketIdx = word.indexOf(']', peekIdx);
                            if (closeBracketIdx !== -1) {
                                let content = word.substring(peekIdx + 1, closeBracketIdx);
                                let parts = content.split('*');
                                if (parts.length === 2) {
                                    let c1Match = matchConsonant(parts[0], 0);
                                    let c2Match = matchConsonant(parts[1], 0);
                                    if (c1Match && c2Match) {
                                        let afterBracketIdx = closeBracketIdx + 1;
                                        let vMatch = matchVowel(word, afterBracketIdx);
                                        let vStr = vMatch ? getSandhanganVowel(vMatch.val) : '';
                                        
                                        result += c1Match.char + '꧀' + c2Match.char + vStr;
                                        i = afterBracketIdx + (vMatch ? vMatch.len : 0);
                                        lastConsKey = c2Match.key;
                                        lastConsIsMati = !vMatch;
                                        handledOverrideB = true;
                                    }
                                }
                            }
                        }
                        if (handledOverrideB) continue;

                        // 2. PENDEKATAN A (~, !) & PENDEKATAN C (#, ^)
                        let overrideType = null;
                        if (word[peekIdx] === '~' || word[peekIdx] === '!') {
                            overrideType = 'A';
                            peekIdx++;
                        } else if (word[peekIdx] === '#' || word[peekIdx] === '^') {
                            overrideType = 'C';
                            peekIdx++;
                        }

                        let nextConsTemp = matchConsonant(word, peekIdx);

                        if (nextConsTemp) {
                            let consChar2_1 = nextConsTemp.char;
                            let consChar2_2 = nextConsTemp.char;
                            
                            let doubleNextIdx = peekIdx + nextConsTemp.len;
                            while (doubleNextIdx < word.length && word[doubleNextIdx] === '+') {
                                consChar2_1 += '꦳';
                                consChar2_2 += '꦳';
                                doubleNextIdx++;
                            }

                            let doubleIt = true;
                            
                            if (overrideType === 'A') {
                                doubleIt = false; // Batal double, paksa Dantya/Single Biasa
                                const dantyaMap = {'ꦟ':'ꦤ', 'ꦡ':'ꦠ', 'ꦣ':'ꦢ', 'ꦦ':'ꦥ', 'ꦨ':'ꦧ', 'ꦑ':'ꦏ', 'ꦓ':'ꦒ', 'ꦯ':'ꦱ', 'ꦰ':'ꦱ', 'ꦖ':'ꦕ', 'ꦙ':'ꦗ', 'ꦜ':'ꦛ', 'ꦞ':'ꦝ'};
                                consChar2_1 = dantyaMap[consChar2_1] || consChar2_1;
                            } else if (overrideType === 'C') {
                                doubleIt = false; // Batal double, paksa Mahaprana/Murda Single
                                const murdaMap = {'ꦤ':'ꦟ', 'ꦠ':'ꦡ', 'ꦢ':'ꦣ', 'ꦥ':'ꦦ', 'ꦧ':'ꦨ', 'ꦏ':'ꦑ', 'ꦒ':'ꦓ', 'ꦱ':'ꦯ', 'ꦕ':'ꦖ', 'ꦗ':'ꦙ', 'ꦛ':'ꦜ', 'ꦞ':'ꦝ'};
                                consChar2_1 = murdaMap[consChar2_1] || consChar2_1;
                            } else {
                                // Pengecualian: TIDAK dirangkap jika disusul ha, nga, nya
                                if (['h', 'H', 'ng', 'NG', 'ny', 'NY', 'Ny'].includes(nextConsTemp.key)) {
                                    doubleIt = false;
                                }
                                else if (nextConsTemp.key === 'n' || nextConsTemp.key === 'N' || consChar2_1.includes('ꦟ')) {
                                    consChar2_1 = consChar2_1.replace('ꦤ', 'ꦟ');
                                    consChar2_2 = consChar2_2.replace('ꦟ', 'ꦤ');
                                } 
                                else if (nextConsTemp.key === 's' || nextConsTemp.key === 'sh' || consChar2_1.includes('ꦰ')) {
                                    consChar2_1 = consChar2_1.replace('ꦱ', 'ꦰ');
                                    doubleIt = false;
                                } 
                                else if (consChar2_1.includes('ꦡ')) {
                                    doubleIt = false;
                                }
                            }
                            
                            let cons2Idx = doubleNextIdx;
                            while(cons2Idx < word.length && (word[cons2Idx] === '-' || word[cons2Idx] === '_')) cons2Idx++;
                            let v2Match = matchVowel(word, cons2Idx);

                            if (v2Match) {
                                let v2 = v2Match.val;
                                if (doubleIt) {
                                    if (nextConsTemp.key === 'y') {
                                        // Khusus ya yang didobel: gunakan pengkal sebagai pasangannya
                                        result += consChar2_1 + 'ꦾ' + getSandhanganVowel(v2);
                                    } else {
                                        // Konsonan selain ya
                                        result += consChar2_1 + '꧀' + consChar2_2 + getSandhanganVowel(v2);
                                    }
                                } else {
                                    result += consChar2_1 + getSandhanganVowel(v2);
                                }
                                i = cons2Idx + v2Match.len;
                                lastConsIsMati = false;
                            } else {
                                if (doubleIt) {
                                    if (nextConsTemp.key === 'y') {
                                        result += consChar2_1 + 'ꦾ꧀';
                                    } else {
                                        result += consChar2_1 + '꧀' + consChar2_2 + '꧀';
                                    }
                                } else {
                                    result += consChar2_1 + '꧀';
                                }
                                i = doubleNextIdx;
                                lastConsIsMati = true;
                            }
                            lastConsKey = nextConsTemp.key;
                        } else {
                            i = nextIdx;
                            lastConsKey = 'r';
                            lastConsIsMati = true;
                        }
                    } else {
                        let crossVowel = nextWordToken ? matchVowel(nextWordToken.val, 0) : null;
                        if (crossVowel) {
                            let v = crossVowel.val;
                            result += 'ꦫ' + getSandhanganVowel(v);
                            nextWordToken.val = nextWordToken.val.substr(crossVowel.len);
                            lastConsIsMati = false;
                        } else {
                            result += 'ꦫ꧀'; // Kawi di akhir kata tetap menggunakan Pangkon (ꦫ꧀)
                            lastConsIsMati = true;
                        }
                        i = nextIdx;
                        lastConsKey = 'r';
                    }
                    continue;
                }

                if (!isWordEnd) {
                    result += consChar + '꧀';
                    i = nextIdx;
                    lastConsKey = cons.key;
                    lastConsIsMati = true;
                } else {
                    let handledCrossWord = false;

                    if (nextWordToken && nextWordToken.val.substr(0, 2).toLowerCase() === 'le') {
                        result += consChar + '꧀ꦊ';
                        nextWordToken.val = nextWordToken.val.substr(2);
                        handledCrossWord = true;
                        lastConsKey = 'l';
                        lastConsIsMati = false;
                    }
                    else if (nextWordToken && nextWordToken.val.length > 1) {
                        let nwCons = matchConsonant(nextWordToken.val, 0);

                        if (nwCons) {
                            let afterNwConsIdx = nwCons.len;
                            let crossVowel = matchVowel(nextWordToken.val, afterNwConsIdx);

                            if (crossVowel) {
                                let v = crossVowel.val;

                                if (nwCons.key === 'r') {
                                    if (v === 'e' || v === 'E') {
                                        result += consChar + 'ꦽ';
                                    } else {
                                        result += consChar + 'ꦿ' + getSandhanganVowel(v);
                                    }
                                    nextWordToken.val = nextWordToken.val.substr(afterNwConsIdx + crossVowel.len);
                                    handledCrossWord = true;
                                    lastConsKey = 'r';
                                    lastConsIsMati = false;
                                } else if (nwCons.key === 'y') {
                                    result += consChar + 'ꦾ' + getSandhanganVowel(v);
                                    nextWordToken.val = nextWordToken.val.substr(afterNwConsIdx + crossVowel.len);
                                    handledCrossWord = true;
                                    lastConsKey = 'y';
                                    lastConsIsMati = false;
                                }
                            }
                        }
                    }

                    if (!handledCrossWord) {
                        let crossVowel = nextWordToken ? matchVowel(nextWordToken.val, 0) : null;
                        if (crossVowel) {
                            let v = crossVowel.val;
                            let isNextVowelCapital = (v === v.toUpperCase() && v !== v.toLowerCase() && v !== "e'" && v !== "ex" && v !== "Ix" && v !== "ix");
                            
                            if (isNextVowelCapital) {
                                result += consChar + '꧀'; 
                                lastConsIsMati = true;
                            } else {
                                result += consChar + getSandhanganVowel(v); 
                                nextWordToken.val = nextWordToken.val.substr(crossVowel.len);
                                lastConsIsMati = false;
                            }
                        } else {
                            result += consChar + '꧀';
                            lastConsIsMati = true;
                        }
                    }

                    i = nextIdx;
                    if (!handledCrossWord) {
                        lastConsKey = cons.key;
                    }
                }
                continue;
            }

            let vMatch = matchVowel(word, i);
            if (vMatch) {
                result += getMandarinVowel(vMatch.val);

                let afterVowelIdx = i + vMatch.len;
                while(afterVowelIdx < word.length && (word[afterVowelIdx] === '-' || word[afterVowelIdx] === '_')) {
                    afterVowelIdx++;
                }
                
                let nextV2 = matchVowel(word, afterVowelIdx);
                if (nextV2) {
                    let v1 = vMatch.val;
                    let v2 = nextV2.val;

                    if (['i', 'I', 'é', 'è', 'E', 'ii', 'II', "e'", 'ex'].includes(v1)) {
                        result += 'ꦪ' + getSandhanganVowel(v2);
                    } else if (['u', 'U', 'o', 'O', 'uu', 'UU'].includes(v1)) {
                        result += 'ꦮ' + getSandhanganVowel(v2);
                    } else {
                        result += 'ꦲ' + getSandhanganVowel(v2);
                    }
                    i = afterVowelIdx + nextV2.len;
                    continue;
                }

                i += vMatch.len;
                continue;
            }

            result += c;
            i++;
        }
    }

    return result;
}

function updatePreview() {
    if (!textInput || !previewOutput) return;
    const latinText = textInput.value;
    const jawaText = transliterateKawi(latinText);
    previewOutput.textContent = jawaText;
    if (charCount) charCount.textContent = `Jumlah Karakter: ${jawaText.length}`;
}

if (fontSelect) {
    fontSelect.addEventListener('change', (e) => {
        if (previewOutput) previewOutput.style.fontFamily = `'${e.target.value}', sans-serif`;
    });
}

if (textInput) {
    textInput.addEventListener('input', updatePreview);
}

if (fontSizeRange) {
    fontSizeRange.addEventListener('input', (e) => {
        const size = e.target.value;
        if (fontSizeVal) fontSizeVal.textContent = size;
        if (previewOutput) previewOutput.style.fontSize = size + 'px';
    });
}

if (lineHeightRange) {
    lineHeightRange.addEventListener('input', (e) => {
        const height = e.target.value;
        if (lineHeightVal) lineHeightVal.textContent = height;
        if (previewOutput) previewOutput.style.lineHeight = height;
    });
}

if (copyBtn) {
    copyBtn.addEventListener('click', () => {
        const textToCopy = previewOutput ? previewOutput.textContent : '';
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Aksara Jawa berhasil disalin ke papan klip.');
        });
    });
}

if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        if (textInput) textInput.value = '';
        updatePreview();
        if (textInput) textInput.focus();
    });
}

if (textInput && previewOutput) {
    updatePreview();
}
