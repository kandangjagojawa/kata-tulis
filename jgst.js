/**
 * jgst.js
 * Modul Transliterasi Aksara Jawa ke JGST (Javanese General System of Transliteration)
 */

function transliterateToJGST(aksaraStr) {
    if (!aksaraStr || aksaraStr === '-') return '-';

    // Map Aksara Jawa ke JGST
    const wyanjanaMap = {
        'ꦲ': 'ha', 'ꦤ': 'na', 'ꦕ': 'ca', 'ꦫ': 'ra', 'ꦏ': 'ka',
        'ꦢ': 'da', 'ꦠ': 'ta', 'ꦱ': 'sa', 'ꦮ': 'wa', 'ꦭ': 'la',
        'ꦥ': 'pa', 'ꦝ': 'ḍa', 'ꦗ': 'ja', 'ꦪ': 'ya', 'ꦚ': 'ña',
        'ꦩ': 'ma', 'ꦒ': 'ga', 'ꦧ': 'ba', 'ꦛ': 'ṭa', 'ꦔ': 'ṅa',
        // Aksara Murda / Mahaprana / Kawi
        'ꦟ': 'ṇa', 'ꦑ': 'ḳa', 'ꦡ': 'tha', 'ꦯ': 'śa', 'ꦦ': 'p̣a',
        'ꦓ': 'g̣a', 'ꦨ': 'ḅa', 'ꦖ': 'c̣a', 'ꦘ': 'jña', 'ꦙ': 'j̣a',
        'ꦞ': 'ḍha', 'ꦣ': 'dha', 'ꦜ': 'ṭha', 'ꦬ': 'ŕa', 'ꦐ': 'qa'
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
        'ꦺ': 'é', 'ꦻ': 'ꜽ', 'ꦼ': 'ě', 'ꦺꦴ': 'o', 'ꦻꦴ': 'ꜷ', 'ꦴ': 'ā'
    };

    const panyigegMap = {
        'ꦁ': 'ŋ', 'ꦂ': 'ṙ', 'ꦃ': 'ḥ', 'ꦀ': 'ṃ'
    };

    const angkaMap = {
        '꧐': '0', '꧑': '1', '꧒': '2', '꧓': '3', '꧔': '4',
        '꧕': '5', '꧖': '6', '꧗': '7', '꧘': '8', '꧙': '9'
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
                }
                result += baseSyl;
                continue;
            }
        }

        // 2. Handling Angka Jawa
        if (angkaMap[ch]) {
            result += angkaMap[ch];
            i++;
            continue;
        }

        // 3. Handling Tanda Baca (Pada)
        if (ch === '꧈') { result += ','; i++; continue; }
        if (ch === '꧉') { result += '.'; i++; continue; }
        if (ch === '꧇') { i++; continue; }

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

            // Cek Sandhangan Wyanjana (Cakra ꦿ, Pengkal ꦾ, Keret ꦽ)
            if (i < len && aksaraStr[i] === 'ꦿ') {
                baseSyl = baseSyl.slice(0, -1) + 'ra';
                i++;
            } else if (i < len && aksaraStr[i] === 'ꦾ') {
                baseSyl = baseSyl.slice(0, -1) + 'ya';
                i++;
            } else if (i < len && aksaraStr[i] === 'ꦽ') {
                baseSyl = baseSyl.slice(0, -1) + 'ṛ';
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

                let nextCh = (i < len) ? aksaraStr[i] : '';
                let isWordBoundary = (!nextCh || nextCh === ' ' || nextCh === '\n' || nextCh === '\uE000' || nextCh === '꧈' || nextCh === '꧉');

                if (isWordBoundary) {
                    if (!nextCh || nextCh === '꧉' || (i >= len)) {
                        baseSyl += '/';
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
        result += ch;
        i++;
    }

    result = result.replace(/\/+/g, '/');
    return result;
}

if (typeof window !== 'undefined') {
    window.transliterateToJGST = transliterateToJGST;
}
