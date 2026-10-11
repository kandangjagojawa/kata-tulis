/**
 * jgst.js
 * Transliterasi Aksara Jawa Unicode ke JGST
 * Penyesuaian: Nga Lelet (ꦊ) ditransliterasikan menjadi 'ḷ' (bukan 'lě').
 * Penyesuaian Pangkon (/): Tanda '/' hanya dihasilkan jika pangkon (꧀) muncul secara visual.
 * Jika pangkon diikuti aksara lain yang membentuk pasangan, tanda '/' TIDAK dihasilkan.
 */

const jgstMap = {
  '\uA980': 'ṃ', '\uA981': 'ŋ', '\uA982': 'ṙ', '\uA983': 'ḥ',
  '\uA984\uA9B4': 'ā', '\uA984': 'a', '\uA985': 'i', '\uA986': 'i', '\uA987': 'ī',
  '\uA988\uA9B4': 'ū', '\uA988': 'u', '\uA989\uA9B4': 'ṝ', '\uA989': 'ṛ',
  '\uA98A': 'ḷ', '\uA98B': 'ḹ', '\uA98C': 'é', '\uA98D': 'ꜽ', '\uA98E\uA9B4': 'ꜷ', '\uA98E': 'o',
  '\uA98F': 'ka', '\uA990': 'qa', '\uA991': 'ḳa', '\uA992': 'ga', '\uA993': 'g̣a',
  '\uA994': 'ṅa', '\uA995': 'ca', '\uA996': 'c̣a', '\uA997': 'ja', '\uA998': 'jña',
  '\uA999': 'j̣a', '\uA99A': 'ña', '\uA99B': 'ṭa', '\uA99C': 'ṭha', '\uA99D': 'ḍa',
  '\uA99E': 'ḍha', '\uA99F': 'ṇa', '\uA9A0': 'ta', '\uA9A1': 'tha', '\uA9A2': 'da',
  '\uA9A3': 'dha', '\uA9A4': 'na', '\uA9A5': 'pa', '\uA9A6': 'p̣a', '\uA9A7': 'ba',
  '\uA9A8': 'ḅa', '\uA9A9': 'ma', '\uA9AA': 'ya', '\uA9AB': 'ra',
  '\uA9AC': 'ṟa', '\uA9AD': 'la', '\uA9AE': 'wa', '\uA9AF': 'śa', '\uA9B0': 'ṣa',
  '\uA9B1': 'sa', '\uA9B2': 'ha', '\uA9B3': '', '\uA9C8': ',', '\uA9C9': '.',
  '\uA9D0': '0', '\uA9D1': '1', '\uA9D2': '2', '\uA9D3': '3', '\uA9D4': '4',
  '\uA9D5': '5', '\uA9D6': '6', '\uA9D7': '7', '\uA9D8': '8', '\uA9D9': '9'
};

const rekanMap = {
  '\uA9A5\uA9B3': 'fa', '\uA9AE\uA9B3': 'va', '\uA997\uA9B3': 'za', '\uA9A2\uA9B3': 'dza',
  '\uA9B2\uA9B3': 'ḥa', '\uA994\uA9B3': '‘a', '\uA9B1\uA9B3': 'ṡa', '\uA9B0\uA9B3': 'ṣa',
  '\uA9AF\uA9B3': 'śa', '\uA9AD\uA9B3': 'ḍa', '\uA9A1\uA9B3': 'ṭa', '\uA9A3\uA9B3': 'ẓa',
  '\uA98F\uA9B3': 'xa', '\uA990\uA9B3': 'xa', '\uA991\uA9B3': 'xa'
};

const sandhanganMap = {
  '\uA9B4': 'ā', '\uA9B5': 'o', '\uA9B6': 'i', '\uA9B7': 'ī', '\uA9B8': 'u',
  '\uA9B9': 'ū', '\uA9BA\uA9B4': 'o', '\uA9BA\uA9B5': 'õ', '\uA9BA': 'é', '\uA9BB\uA9B4': 'ꜹ',
  '\uA9BB\uA9B5': 'ã', '\uA9BB': 'ꜽ', '\uA9BC\uA9B4': 'ö', '\uA9BC': 'ě',
  '\uA9BD': 'ŕě',
  '\uA9BE': 'ỿa', '\uA9BF': 'ŕa'
};

function transliterateToJGST(text) {
  if (!text) return "";
  text = text.replace(/\u200D/g, '');

  let result = "";
  let i = 0;

  while (i < text.length) {
    let char1 = text[i];

    if (char1 === '\u200C') {
      i++;
      continue;
    }

    if (!/[\uA980-\uA9DF]/.test(char1)) {
      result += char1;
      i++;
      continue;
    }

    let char2 = i + 1 < text.length ? text.substring(i, i + 2) : "";
    let baseText = "";
    let matchedLen = 0;

    if (rekanMap[char2] !== undefined) {
      baseText = rekanMap[char2];
      matchedLen = 2;
    } else if (jgstMap[char2] !== undefined) {
      baseText = jgstMap[char2];
      matchedLen = 2;
    } else if (jgstMap[char1] !== undefined) {
      baseText = jgstMap[char1];
      matchedLen = 1;
    }

    if (matchedLen > 0) {
      i += matchedLen;
      
      while (i < text.length) {
        let next2 = i + 1 < text.length ? text.substring(i, i + 2) : "";
        let next1 = text[i];

        if (next1 === '\uA9BD') {
          if (baseText.endsWith('a')) baseText = baseText.slice(0, -1);
          baseText += 'ŕě';
          i += 1;
          continue;
        }

        if (next1 === '\uA9C0') {
          let lookIdx = i + 1;
          let hasZWNJ = false;

          while (lookIdx < text.length) {
            let ch = text[lookIdx];
            if (ch === '\u200C') {
              hasZWNJ = true;
              lookIdx++;
            } else if (ch === '\u200D' || ch === '\uE000' || ch === ' ') {
              lookIdx++;
            } else {
              break;
            }
          }

          let charNext = lookIdx < text.length ? text[lookIdx] : "";
          let isVisualPangkon = false;

          if (hasZWNJ) {
            isVisualPangkon = true;
          } else if (!charNext) {
            isVisualPangkon = true;
          } else if (/[\uA984-\uA9B2]/.test(charNext)) {
            isVisualPangkon = false;
          } else {
            isVisualPangkon = true;
          }

          if (baseText.endsWith('a')) baseText = baseText.slice(0, -1);
          if (isVisualPangkon) {
            baseText += '/';
          }
          i += 1;
          continue;
        }

        if (sandhanganMap[next2] !== undefined) {
          if (baseText.endsWith('a')) baseText = baseText.slice(0, -1);
          baseText += sandhanganMap[next2];
          i += 2;
        } else if (sandhanganMap[next1] !== undefined) {
          if (baseText.endsWith('a')) baseText = baseText.slice(0, -1);
          baseText += sandhanganMap[next1];
          i += 1;
        } else {
          break;
        }
      }
      result += baseText;
    } else {
      result += char1;
      i++;
    }
  }
  return result;
}

if (typeof window !== 'undefined') window.transliterateToJGST = transliterateToJGST;
