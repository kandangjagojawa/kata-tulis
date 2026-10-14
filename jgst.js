/**
 * jgst.js
 * Modul Transliterasi Aksara Jawa ke JGST (Javanese General System of Transliteration)
 * Pembaruan Khusus:
 * - Penanganan Visual Pangkon (꧀) untuk Tata Tulis Baru (kbj, sriwedari, simplified):
 *   * Jika Pangkon membentuk Pasangan dengan aksara berikutnya (termasuk Pa Cerek ꦉ, Nga Lelet ꦊ, ꦋ),
 *     JGST TIDAK memunculkan '/' atau '/,'.
 *   * Simbol '/' atau '/,' / '/.' HANYA muncul jika secara visual pada Aksara Jawa
 *     memang tampak karakter Pangkon (di akhir klausa/kalimat/tanda baca).
 * - Ra Agung (ꦬ): 'ṟa'
 * - Cakra (ꦿ): 'ŕa', Pengkal (ꦾ): 'ỿa', Cakra Keret (ꦽ): 'ŕě'
 * - Penambahan Pemetaan Lengkap Codepoint Pada & Simbol Unicode (U+A980 - U+A9DF)
 */

function transliterateToJGST(aksaraStr, fnKey) {
    if (!aksaraStr || aksaraStr === '-') return '-';

    // Abaikan simbol mentah pemicu Pendekatan A (~, !), B ([, ], *), dan C (#, ^)
    aksaraStr = aksaraStr.replace(/[\~!\#\^\[\]\*]/g, '');

    const isModern = ['kbj', 'sriwedari', 'simplified'].includes(fnKey);

    // Map Aksara Jawa ke JGST
    const wyanjanaMap = {
        'ꦲ': 'ha', 'ꦤ': 'na', 'ꦕ': 'ca', 'ꦫ': 'ra', 'ꦏ': 'ka',
        'ꦢ': 'da', 'ꦠ': 'ta', 'ꦱ': 'sa', 'ꦮ': 'wa', 'ꦭ': 'la',
        'ꦥ': 'pa', 'ꦝ': 'ḍa', 'ꦗ': 'ja', 'ꦪ': 'ya', 'ꦚ': 'ña',
        'ꦩ': 'ma', 'ꦒ': 'ga', 'ꦧ': 'ba', 'ꦛ': 'ṭa', 'ꦔ': 'ṅa',
        // Aksara Murda / Mahaprana / Kawi
        'ꦟ': 'ṇa', 'ꦑ': 'ḳa', 'ꦡ': 'tha', 'ꦯ': 'śa', 'ꦰ': 'ṣa', 'ꦦ': 'p̣a',
        'ꦓ': 'g̣a', 'ꦨ': 'ḅa', 'ꦖ': 'c̣a', 'ꦘ': 'jña', 'ꦙ': 'j̣a',
        'ꦞ': 'ḍha', 'ꦣ': 'dha', 'ꦜ': 'ṭha', 'ꦬ': 'ṟa', 'ꦐ': 'qa'
    };

    const rekanMap = {
        'ꦥ꦳': 'fa', 'ꦮ꦳': 'va', 'ꦗ꦳': 'za', 'ꦏ꦳': 'xa',
        'ꦢ꦳': 'dza', 'ꦒ꦳': 'g̣a', 'ꦯ꦳': 'śa', 'ꦰ꦳': 'ṣa',
        'ꦲ꦳': 'ḥa', 'ꦱ꦳': 'ṡa', 'ꦡ꦳': 'ṭa', 'ꦣ꦳': 'ẓa',
        'ꦭ꦳': 'ḍa', 'ꦔ꦳': '‘a'
    };

    const swaraMap = {
        'ꦄ': 'a', 'ꦅ': 'i', 'ꦆ': 'i', 'ꦇ': 'ī',
        'ꦈ': 'u', 'ꦉ': 'ṛ', 'ꦊ': 'ḷ', 'ꦋ': 'ḹ',
        'ꦌ': 'é', 'ꦍ': 'ꜽ', 'ꦎ': 'o'
    };

    const sandhanganSwaraMap = {
        'ꦶ': 'i', 'ꦷ': 'ī', 'ꦸ': 'u', 'ꦹ': 'ū',
        'ꦺ': 'é', 'ꦻ': 'ꜽ', 'ꦼ': 'ě', 'ꦺꦴ': 'o', 'ꦻꦴ': 'ꜷ', 'ꦴ': 'ā',
        'ꦵ': 'o'
    };

    const panyigegMap = {
        'ꦁ': 'ŋ', 'ꦂ': 'ṙ', 'ꦃ': 'ḥ', 'ꦀ': 'ṃ'
    };

    const angkaMap = {
        '꧐': '0', '꧑': '1', '꧒': '2', '꧓': '3', '꧔': '4',
        '꧕': '5', '꧖': '6', '꧗': '7', '꧘': '8', '꧙': '9'
    };

    // Pemetaan Tanda Baca / Pada Lengkap
    const padaMap = {
        '꧈': ',', '꧉': '.', '꧇': ':',
        '꧁': '((', '꧂': '))',
        '꧃': '<_', '꧄': '<>', '꧅': '>^', '꧆': '(o)',
        '꧊': '|', '꧋': '||',
        '꧌': '[\\', '꧍': '\\]',
        '꧎': '^2', 'ꧏ': '_2',
        '꧞': '~~', '꧟': '##'
    };

    let result = '';
    let i = 0;
    let len = aksaraStr.length;

    while (i < len) {
        let ch = aksaraStr[i];

        // 1. Handling Aksara Rekan (Dua Karakter: Konsonan + Cecak Telu ꦳)
        if (i + 1 < len && aksaraStr[i + 1] === '꦳') {
            let pair = ch + '꦳';
            if (rekanMap[pair]) {
                let baseSyl = rekanMap[pair];
                i += 2;

                if (i < len && sandhanganSwaraMap[aksaraStr[i]]) {
                    let v = sandhanganSwaraMap[aksaraStr[i]];
                    baseSyl = baseSyl.slice(0, -1) + v;
                    i++;
                } else if (i + 1 < len && aksaraStr[i] === 'ꦺ' && aksaraStr[i + 1] === 'ꦴ') {
                    baseSyl = baseSyl.slice(0, -1) + 'o';
                    i += 2;
                } else if (i + 1 < len && aksaraStr[i] === 'ꦻ' && aksaraStr[i + 1] === 'ꦴ') {
                    baseSyl = baseSyl.slice(0, -1) + 'ꜷ';
                    i += 2;
                } else if (i < len && aksaraStr[i] === '꧀') {
                    baseSyl = baseSyl.slice(0, -1);
                    i++;

                    let hasLingsaAfter = (i < len && aksaraStr[i] === '꧈');
                    if (hasLingsaAfter) {
                        i++;
                    }

                    let peekIdx = i;
                    while (peekIdx < len && (aksaraStr[peekIdx] === '\uE000' || aksaraStr[peekIdx] === ' ')) {
                        peekIdx++;
                    }
                    let nextRealChar = (peekIdx < len) ? aksaraStr[peekIdx] : '';
                    let isPasanganNext = !hasLingsaAfter && !!(
                        wyanjanaMap[nextRealChar] ||
                        ['ꦉ', 'ꦊ', 'ꦋ'].includes(nextRealChar) ||
                        (peekIdx + 1 < len && rekanMap[nextRealChar + aksaraStr[peekIdx + 1]])
                    );

                    if (isModern) {
                        if (!isPasanganNext) {
                            if (hasLingsaAfter) {
                                baseSyl += '/.';
                            } else {
                                let isEnd = (!nextRealChar || nextRealChar === '꧉' || nextRealChar === '\n');
                                baseSyl += isEnd ? '/' : '/,';
                            }
                        }
                    } else {
                        if (hasLingsaAfter) {
                            baseSyl += '/,';
                        } else {
                            let nextCh = (i < len) ? aksaraStr[i] : '';
                            let isWordBoundary = (!nextCh || nextCh === ' ' || nextCh === '\n' || nextCh === '\uE000' || nextCh === '꧈' || nextCh === '꧉');
                            if (!isPasanganNext) {
                                baseSyl += '/';
                            }
                        }
                    }
                }
                result += baseSyl;
                continue;
            }
        }

        // Standalone Cecak Telu / Nukta (꦳)
        if (ch === '꦳') {
            result += '+3';
            i++;
            continue;
        }

        // 2. Handling Angka Jawa
        if (angkaMap[ch]) {
            result += angkaMap[ch];
            i++;
            continue;
        }

        // 3. Handling Tanda Baca (Pada)
        if (padaMap[ch]) {
            result += padaMap[ch];
            i++;
            continue;
        }

        // 4. Handling Aksara Swara Independent
        if (swaraMap[ch]) {
            result += swaraMap[ch];
            i++;
            continue;
        }

        // 5. Handling Aksara Wyanjana (Konsonan Utama)
        if (wyanjanaMap[ch]) {
            let baseSyl = wyanjanaMap[ch];
            i++;

            // Cek Sandhangan Wyanjana (Cakra ꦿ -> ŕa, Pengkal ꦾ -> ỿa, Cakra Keret ꦽ -> ŕě)
            if (i < len && aksaraStr[i] === 'ꦿ') {
                baseSyl = baseSyl.slice(0, -1) + 'ŕa';
                i++;
            } else if (i < len && aksaraStr[i] === 'ꦾ') {
                baseSyl = baseSyl.slice(0, -1) + 'ỿa';
                i++;
            } else if (i < len && aksaraStr[i] === 'ꦽ') {
                baseSyl = baseSyl.slice(0, -1) + 'ŕě';
                i++;
            }

            // Cek Kombinasi Taling Tarung (ꦺꦴ) dan Taling Tarung Dirga (ꦻꦴ)
            if (i + 1 < len && aksaraStr[i] === 'ꦺ' && aksaraStr[i + 1] === 'ꦴ') {
                baseSyl = baseSyl.slice(0, -1) + 'o';
                i += 2;
            } else if (i + 1 < len && aksaraStr[i] === 'ꦻ' && aksaraStr[i + 1] === 'ꦴ') {
                baseSyl = baseSyl.slice(0, -1) + 'ꜷ';
                i += 2;
            } else if (i < len && sandhanganSwaraMap[aksaraStr[i]]) {
                let v = sandhanganSwaraMap[aksaraStr[i]];
                baseSyl = baseSyl.slice(0, -1) + v;
                i++;
            } else if (i < len && aksaraStr[i] === '꧀') {
                // Pangkon ꧀
                baseSyl = baseSyl.slice(0, -1);
                i++;

                let hasLingsaAfter = (i < len && aksaraStr[i] === '꧈');
                if (hasLingsaAfter) {
                    i++;
                }

                // Cek apakah Pangkon ini membentuk Pasangan dengan aksara berikutnya
                let peekIdx = i;
                while (peekIdx < len && (aksaraStr[peekIdx] === '\uE000' || aksaraStr[peekIdx] === ' ')) {
                    peekIdx++;
                }
                let nextRealChar = (peekIdx < len) ? aksaraStr[peekIdx] : '';
                let isPasanganNext = !hasLingsaAfter && !!(
                    wyanjanaMap[nextRealChar] ||
                    ['ꦉ', 'ꦊ', 'ꦋ'].includes(nextRealChar) ||
                    (peekIdx + 1 < len && rekanMap[nextRealChar + aksaraStr[peekIdx + 1]])
                );

                if (isModern) {
                    if (!isPasanganNext) {
                        // Hanya munculkan / atau /, jika secara VISUAL aksara Jawa menampilkan Pangkon
                        if (hasLingsaAfter) {
                            baseSyl += '/.';
                        } else {
                            let isEnd = (!nextRealChar || nextRealChar === '꧉' || nextRealChar === '\n');
                            baseSyl += isEnd ? '/' : '/,';
                        }
                    }
                } else {
                    // Tata Tulis Lama (Tradisional & Cara Kawi) - pertahankan perilaku asli
                    if (hasLingsaAfter) {
                        baseSyl += '/,';
                    } else {
                        let nextCh = (i < len) ? aksaraStr[i] : '';
                        let isWordBoundary = (!nextCh || nextCh === ' ' || nextCh === '\n' || nextCh === '\uE000' || nextCh === '꧈' || nextCh === '꧉');
                        if (!isPasanganNext) {
                            baseSyl += '/';
                        }
                    }
                }
            }

            // Cek Panyigeg (Cecak ꦁ, Layar ꦂ, Wignyan ꦃ, Panyangga ꦀ)
            if (i < len && panyigegMap[aksaraStr[i]]) {
                baseSyl += panyigegMap[aksaraStr[i]];
                i++;
            }

            result += baseSyl;
            continue;
        }

        // 6. Handling Panyigeg Mandiri / Lainnya
        if (panyigegMap[ch]) {
            result += panyigegMap[ch];
            i++;
            continue;
        }

        // 7. Karakter Passthrough (Spasi, Marker \uE000, Tanda Baca Latin)
        if (/[\~!\#\^\[\]\*]/.test(ch)) {
            i++;
            continue;
        }

        result += ch;
        i++;
    }

    result = result.replace(/\/+/g, '/');
    return result;
}

if (typeof window !== 'undefined') {
    window.transliterateToJGST = transliterateToJGST;
}
