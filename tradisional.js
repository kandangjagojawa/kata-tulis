/**
 * TRADISIONAL.JS
 * Modifikasi dari carakawi.js dengan penambahan Aksara Rekan lengkap,
 * preprocessing Anuswara Tancap berbasis Warga Aksara (Talawya: nc/nj -> nyc/nyj),
 * serta modul Paramasastra (Morfologi Jawa Tradisional/Kawi).
 * 
 * Penyesuaian Nga Lelet (ꦊ):
 * - Di dalam satu kata (kluster mlebu/klebu): menggunakan pasangan la + pepet (꧀ꦭꦼ).
 * - Lintas kata disusul kata le- (mangan lebu): menggunakan pasangan Nga Lelet (꧀ꦊ).
 * Penyesuaian R mati + ya: Aksara ra tidak dipengkal, melainkan layar + ya dipengkal (ꦂꦪꦾ).
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
    'f': 'ꦥ꦳', 'v': 'ꦮ꦳', 'z': 'ꦗ꦳',
    'kh': 'ꦏ꦳', 'dz': 'ꦢ꦳', 'gh': 'ꦒ꦳',
    'q': 'ꦐ', 'hh': 'ꦲ꦳', 'xng': 'ꦔ꦳', 'ts': 'ꦱ꦳',
    'shh': 'ꦰ꦳', 'xsy': 'ꦯ꦳', 'dl': 'ꦭ꦳', 'tth': 'ꦡ꦳',
    'zh': 'ꦣ꦳', 'x': 'ꦑ꦳',
    'th': 'ꦛ', 'dh': 'ꦝ', 'ny': 'ꦚ', 'ng': 'ꦔ',
    'TH': 'ꦜ', 'DH': 'ꦞ', 'NY': 'ꦘ', 'Ny': 'ꦘ', 'NG': 'ꦔ',
    'tH': 'ꦡ', 'dH': 'ꦣ', 'Th': 'ꦜ', 'Dh': 'ꦞ', 
    'ch': 'ꦖ', 'jh': 'ꦙ', 'ph': 'ꦦ', 'bh': 'ꦨ',
    'sh': 'ꦰ', 'sy': 'ꦯ', 'SH': 'ꦰ', 'SY': 'ꦯ',
    'h':'ꦲ', 'n':'ꦤ', 'c':'ꦕ', 'r':'ꦫ', 'k':'ꦏ',
    'd':'ꦢ', 't':'ꦠ', 's':'ꦱ', 'w':'ꦮ', 'l':'ꦭ',
    'p':'ꦥ', 'j':'ꦗ', 'y':'ꦪ', 'm':'ꦩ', 'g':'ꦒ', 'b':'ꦧ',
    'H':'ꦲ', 'N':'ꦟ', 'C':'ꦖ', 'R':'ꦬ', 'K':'ꦑ',
    'D':'ꦝ', 'T':'ꦡ', 'S':'ꦯ', 'W':'ꦮ', 'L':'ꦭ',
    'J':'ꦙ', 'Y':'ꦪ', 'M':'ꦩ', 'G':'ꦓ', 'B':'ꦨ', 'P':'ꦦ'
};

function getWarga(char) {
    if (['ꦕ','ꦖ','ꦗ','ꦙ','ꦚ','ꦯ','ꦪ'].includes(char)) return 'talawya';
    if (['ꦛ','ꦜ','ꦝ','ꦞ','ꦟ','ꦰ','ꦬ','ꦫ'].includes(char)) return 'murdhanya';
    if (['ꦠ','ꦡ','ꦢ','ꦣ','ꦤ','ꦱ','ꦭ'].includes(char)) return 'dantya';
    if (['ꦏ','ꦑ','ꦒ','ꦓ','ꦔ','ꦲ','ꦐ'].includes(char)) return 'kanthya';
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
        if (/[a-zA-ZéèÉÈ0-9\-\+_']/.test(c)) {
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

    // --- PREPROCESSING ANUSWARA TANCAP DENGAN PENYELARASAN WARGA TALAWYA ---
    // nc & nj diselaraskan secara ketat menjadi nyc & nyj agar menghasilkan Aksara Nya (ꦚ)
    rawText = rawText.replace(/(?<![a-zA-Za-zÀ-ÿ])(mb|ndh|nd|nth|nc|nj|ngg)/gim, function(match) {
        let isUpper = match[0] === match[0].toUpperCase();
        let lower = match.toLowerCase();

        if (lower === 'nc') lower = 'nyc';
        else if (lower === 'nj') lower = 'nyj';

        return (isUpper ? 'H' : 'h') + 'a' + lower;
    });

    rawText = rawText
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
            if (tokens[nt].type === 'sep' && (tokens[nt].val === '.' || tokens[nt].val === ',' || tokens[nt].val === '\n')) {
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
                            result += consChar + '꧀ꦭꦼ';
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

                if (cons.key === 'r') {
                    if (!isWordEnd) {
                        result += 'ꦂ'; 
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
                            
                            let cons2Idx = doubleNextIdx;
                            while(cons2Idx < word.length && (word[cons2Idx] === '-' || word[cons2Idx] === '_')) cons2Idx++;
                            let v2Match = matchVowel(word, cons2Idx);

                            if (v2Match) {
                                let v2 = v2Match.val;
                                if (doubleIt) {
                                    if (nextConsTemp.key === 'y') {
                                        result += consChar2_1 + 'ꦾ' + getSandhanganVowel(v2);
                                    } else {
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
                            result += 'ꦂ'; 
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

/**
 * =========================================================================
 * MODUL PARAMASASTRA / MORFOLOGI JAWA TRADISIONAL (KAWI)
 * =========================================================================
 */

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

    if (!dasar) {
        if (outLat) outLat.value = "";
        if (outJaw) outJaw.innerHTML = "";
        return;
    }

    let f = dasar.charAt(0);
    let isVowelStart = /[aiueoéèê]/i.test(f);
    let errorMsg = "";

    // Validasi Kelayakan Ater-Ater Anuswara
    if (ater === 'm' && !['b','p','w','m','f','v'].includes(f)) {
        errorMsg = `Ater-ater "m-" (am-) khusus untuk kata dasar berawalan p, b, w, m, f, v.`;
    } else if (ater === 'n' && !['d','t','j','n'].includes(f) && !dasar.startsWith('dh') && !dasar.startsWith('th')) {
        errorMsg = `Ater-ater "n-" (an-) khusus untuk kata dasar berawalan d, dh, t, th, j, n.`;
    } else if (ater === 'ny' && !['c','s'].includes(f) && !dasar.startsWith('ny')) {
        errorMsg = `Ater-ater "ny-" (any-) khusus untuk kata dasar berawalan c, s, ny.`;
    } else if (ater === 'ng' && !['g','k','l','r','y','w'].includes(f) && !isVowelStart && !dasar.startsWith('ng')) {
        errorMsg = `Ater-ater "ng-" (ang-) khusus untuk kata dasar berawalan k, g, l, r, y, w, atau vokal.`;
    }

    if (errorMsg !== "") {
        if (warnArea) warnArea.innerHTML = `<div class="param-warning">⚠️ WARNING PAUGERAN TRADISIONAL: ${errorMsg}</div>`;
        if (outLat) outLat.value = "";
        if (outJaw) outJaw.innerHTML = "";
        return;
    }

    let stem = dasar;
    let prefixAppended = "";
    let altPrefixAppended = "";

    // Pemrosesan Ater-Ater Anuswara Ejaan Tradisional/Kawi (m-/am-, n-/an-, ny-/any-, ng-/ang-)
    if (['N', 'm', 'n', 'ny', 'ng', 'pa'].includes(ater)) {
        if (dasar.startsWith('ng')) {
            stem = dasar;
            prefixAppended = '';
            altPrefixAppended = 'a';
        } else if (dasar.startsWith('ny')) {
            stem = dasar;
            prefixAppended = '';
            altPrefixAppended = 'a';
        } else if (f === 'n') {
            stem = dasar;
            prefixAppended = '';
            altPrefixAppended = 'a';
        } else if (f === 'm') {
            stem = dasar;
            prefixAppended = '';
            altPrefixAppended = 'a';
        } else if (['d','j'].includes(f) || dasar.startsWith('dh')) {
            if (f === 'j') {
                prefixAppended = 'any';
                altPrefixAppended = 'ny';
                stem = dasar;
            } else {
                prefixAppended = 'an';
                altPrefixAppended = 'n';
                stem = dasar;
            }
        } else if (f === 'b') {
            prefixAppended = 'am';
            altPrefixAppended = 'm';
            stem = dasar;
        } else if (f === 'g') {
            prefixAppended = 'ang';
            altPrefixAppended = 'ng';
            stem = dasar;
        } else if (['p','w'].includes(f)) {
            stem = 'm' + dasar.slice(1);
            prefixAppended = '';
            altPrefixAppended = 'a';
        } else if (dasar.startsWith('th')) {
            stem = 'n' + dasar.slice(2);
            prefixAppended = '';
            altPrefixAppended = 'a';
        } else if (f === 't') {
            stem = 'n' + dasar.slice(1);
            prefixAppended = '';
            altPrefixAppended = 'a';
        } else if (['c','s'].includes(f)) {
            stem = 'ny' + dasar.slice(1);
            prefixAppended = '';
            altPrefixAppended = 'a';
        } else if (f === 'k') {
            stem = 'ng' + dasar.slice(1);
            prefixAppended = '';
            altPrefixAppended = 'a';
        } else if (isVowelStart) {
            stem = 'ng' + dasar;
            prefixAppended = '';
            altPrefixAppended = 'a';
        } else if (['l','r','y'].includes(f)) {
            stem = 'ng' + dasar;
            prefixAppended = '';
            altPrefixAppended = 'a';
        } else {
            stem = 'ng' + dasar;
            altPrefixAppended = 'a';
        }

        if (ater === 'pa') {
            prefixAppended = 'pa';
            altPrefixAppended = '';
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
        else stem = f + 'in' + dasar.slice(1); // Sisipan (infix) -in- dalam Tradisional/Kawi
        prefixAppended = '';
    } else if (ater !== '') {
        prefixAppended = ater;
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
                    body = pStem;
                    suffixMod = 'anné';
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
                    else if(panam === 'ira') suffixMod = 'nira';
                    else suffixMod = panam;
                } else if (rootVowel === 'i') {
                    if (['e', 'é', 'ipun', 'ira'].includes(panam)) {
                        body = pStem;
                        if (panam === 'ipun') suffixMod = 'nipun';
                        else if (panam === 'ira') suffixMod = 'nira';
                        else suffixMod = 'ne';
                    } else {
                        body = pStem.slice(0, -1) + 'é';
                        if(['ake', 'aké'].includes(panam)) suffixMod = 'kake';
                        else if(panam === 'aken') suffixMod = 'kaken';
                        else if(panam === 'en') suffixMod = 'nen';
                        else suffixMod = panam;
                    }
                } else if (rootVowel === 'u') {
                    if (panam === 'ipun') { body = pStem; suffixMod = 'nipun'; }
                    else if (panam === 'ira') { body = pStem; suffixMod = 'nira'; }
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
                    else if(panam === 'ira') suffixMod = 'nira';
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
        if (altPrefixAppended === 'a') {
            resultLatinAlt = bentakAkhiran('a' + (prefixAppended ? (prefixAppended + stem) : stem), '');
        } else {
            resultLatinAlt = bentakAkhiran(stem, altPrefixAppended);
        }
    }

    let fullLatinDisplay = resultLatinMain;
    if (resultLatinAlt !== "" && resultLatinAlt !== resultLatinMain) {
        fullLatinDisplay = `${resultLatinMain} (${resultLatinAlt})`;
    }

    if (outLat) outLat.value = fullLatinDisplay;
    if (outJaw) outJaw.innerText = transliterateKawi(fullLatinDisplay);
}

function updateParamFromManualInput() {
    let inp = document.getElementById('outParamLatin');
    let out = document.getElementById('outParamJawa');
    if (inp && out) {
        out.innerText = transliterateKawi(inp.value);
    }
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

function prosesDwipurwa() {
    let inDwi = document.getElementById('inDwipurwa');
    let outLat = document.getElementById('outDwipurwaLatin');
    let outJaw = document.getElementById('outDwipurwaJawa');
    if (!inDwi) return;

    let dasarRaw = inDwi.value.trim();
    let dasar = dasarRaw.replace(/e'/g, 'é').replace(/E'/g, 'É').toLowerCase();

    if(!dasar) {
        if (outLat) outLat.value = "";
        if (outJaw) outJaw.innerHTML = "";
        return;
    }

    let firstVowelMatch = dasar.match(/[aiueoéèê]/i);
    let resultLatin = dasar;

    if (firstVowelMatch) {
        let vokalIndex = firstVowelMatch.index;
        let vokal = dasar[vokalIndex];
        let awalan = dasar.substring(0, vokalIndex);
        
        let konsonan = "h"; 
        if (awalan !== "") {
            let match = awalan.match(/^(dh|th|ng|ny|kh|dz|gh|sh|sy|[bcdfghjklmnpqrstvwxyz])([rylw])?$/);
            if (match) {
                konsonan = match[1];
            } else {
                let matchComplex = awalan.match(/^((?:dh|th|ng|ny|kh|dz|gh|sh|sy|[bcdfghjklmnpqrstvwxyz])+?)([rylw])?$/);
                if (matchComplex) {
                    konsonan = matchComplex[1];
                } else {
                    konsonan = awalan;
                }
            }
        }
        
        let prefix = konsonan + 'e';
        resultLatin = prefix + dasar;
    }

    if (outLat) outLat.value = resultLatin;
    if (outJaw) outJaw.innerText = transliterateKawi(resultLatin);
}

function salinDwipurwaLatin() {
    let el = document.getElementById('outDwipurwaLatin');
    if (!el) return;
    let teksLatin = el.value;
    if (!teksLatin) return;
    navigator.clipboard.writeText(teksLatin);
}

function salinDwipurwaJawa() {
    let el = document.getElementById('outDwipurwaJawa');
    if (!el) return;
    let teksAksara = el.innerText;
    if (!teksAksara) return;
    navigator.clipboard.writeText(teksAksara).then(() => {
        let btn = document.getElementById('btnSalinDwipurwa');
        if (btn) {
            let originalText = btn.innerText;
            btn.innerText = 'Tersalin!';
            setTimeout(() => { btn.innerText = originalText; }, 2000);
        }
    });
}

function updateDwipurwaFromManualInput() {
    let inp = document.getElementById('outDwipurwaLatin');
    let out = document.getElementById('outDwipurwaJawa');
    if (inp && out) {
        out.innerText = transliterateKawi(inp.value);
    }
}

// Event Listeners UI (dengan penanganan defensif)
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

// Ekspor Fungsi Global ke Window Object
if (typeof window !== 'undefined') {
    window.transliterateKawi = transliterateKawi;
    window.prosesParamasastra = prosesParamasastra;
    window.updateParamFromManualInput = updateParamFromManualInput;
    window.salinParamLatin = salinParamLatin;
    window.salinParamJawa = salinParamJawa;
    window.prosesDwipurwa = prosesDwipurwa;
    window.salinDwipurwaLatin = salinDwipurwaLatin;
    window.salinDwipurwaJawa = salinDwipurwaJawa;
    window.updateDwipurwaFromManualInput = updateDwipurwaFromManualInput;
}
