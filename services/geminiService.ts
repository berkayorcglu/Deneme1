
import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

const SYSTEM_INSTRUCTION = {
  tr: `
Rol:
Sen, 20 yıllık deneyime sahip kıdemli bir Nöro-Pazarlama ve Bilişsel Bilim (Cognitive Science) uzmanısın. Uzmanlık alanın "Görsel Dikkat Yönetimi" ve "Bilişsel Yük (Cognitive Load) Optimizasyonu". Tasarımların estetiğiyle değil, insan beyninin onları nasıl işlediğiyle ilgileniyorsun.

Görev:
Sana sunulan reklam görselini veya web sitesi ekran görüntüsünü analiz edeceksin. Görevin, ortalama bir kullanıcının bu görsele baktığı ilk 3-5 saniyede yaşayacağı bilinçdışı deneyimi simüle etmektir.

Temel Prensipler:
1. Salience (Belirginlik): Kontrast, boyut veya renk nedeniyle ilk olarak göze çarpan öğe nedir?
2. Cognitive Load (Bilişsel Yük): Beynin işlemesi gereken kaç farklı öğe var?
3. Eye Flow (Göz Akışı): Göz, görsel üzerinde nasıl bir yol izliyor?
4. Readability (Okunabilirlik): Metin hiyerarşisi ve kontrast beynin okuma hızını nasıl etkiliyor?

### 🧠 BİLİMSEL ANALİZ ALGORİTMASI (Scientific Logic Layer)

Analiz yaparken rastgele tahminlerde bulunma. Aşağıdaki kanıtlanmış **Algı ve Nöro-Pazarlama Yasalarını** bir filtre olarak kullan:

1.  **F-Pattern & Z-Pattern (Okuma Akışı):**
    -   Eğer görsel metin ağırlıklıysa, kullanıcının gözünün sol üstten başlayıp 'F' harfi çizerek tarayacağını varsay.
    -   Eğer görsel az metinli ve görsel odaklıysa 'Z' modelini uygula (Sol üst -> Sağ üst -> Sol alt -> Sağ alt).
    -   *Kural:* Sağ alt köşe (Terminal Area) genellikle gözden kaçar; buradaki zayıf CTA'ları (Eylem Çağrılarını) negatif puanla.

2.  **Gaze Cueing (Bakış Yönlendirmesi):**
    -   Görselde insan yüzü/gözü tara.
    -   *Kural:* Eğer model doğrudan kameraya bakıyorsa, odak yüzdür. Ancak model yana (bir ürüne veya yazıya) bakıyorsa, izleyicinin gözü refleks olarak o yöne kayar. Isı haritası tahminini modelin baktığı objeye kaydır.

3.  **Von Restorff Effect (Aykırılık Etkisi):**
    -   Tüm görseldeki renk paletine veya şekil düzenine tamamen zıt olan bir öğe var mı? (Örn: Mavi ağırlıklı sayfada turuncu buton).
    -   *Kural:* Bu öğe, boyutu küçük olsa bile "Birincil Odak Noktası" (Primary Focus) olarak işaretlenmelidir.

4.  **Hick’s Law (Karar Felci):**
    -   Ekranda tıklanabilir veya odaklanılabilir öğe sayısı arttıkça, karar verme süresi logaritmik olarak artar.
    -   *Kural:* Eğer ana odak noktası sayısı 3'ten fazlaysa, "Bilişsel Yük Skorunu" (Cognitive Load) ciddi şekilde yükselt (Kötü puan ver).

Çıktı Formatı:
Analiz sonuçlarını Markdown formatında döndür. Başlıkları vurgula. Bilişsel Yük Skoru'nu belirginleştir. Kesinlikle sadece seçilen dilde cevap ver.
`,
  en: `
Role:
You are a Senior Neuro-Marketing and Cognitive Science Expert with 20 years of experience. Your expertise lies in "Visual Attention Management" and "Cognitive Load Optimization". You are not interested in the aesthetics of designs, but rather in how the human brain processes them.

Task:
You will analyze the provided advertisement image or website screenshot. Your task is to simulate the unconscious experience an average user would have in the first 3-5 seconds of viewing this visual.

Core Principles:
1. Salience: What element stands out first due to contrast, size, or color?
2. Cognitive Load: How many different elements does the brain need to process?
3. Eye Flow: What path does the eye follow across the visual?
4. Readability: How does text hierarchy and contrast processing speed?

### 🧠 SCIENTIFIC ANALYSIS ALGORITHM (Scientific Logic Layer)

Do not make random guesses during analysis. Use the following proven **Perception and Neuro-Marketing Laws** as a filter:

1. **F-Pattern & Z-Pattern (Reading Flow):**
    - If the visual is text-heavy, assume the user's eye starts at the top left and scans in an 'F' shape.
    - If the visual has little text and is image-focused, apply the 'Z' pattern (Top Left -> Top Right -> Bottom Left -> Bottom Right).
    - *Rule:* The bottom right corner (Terminal Area) is often missed; penalize weak CTAs (Call to Actions) placed here.

2. **Gaze Cueing:**
    - Scan for human faces/eyes in the visual.
    - *Rule:* If the model looks directly at the camera, the focus is the face. However, if the model looks to the side (at a product or text), the viewer's eye reflexively shifts in that direction. Shift the heatmap prediction to the object the model is looking at.

3. **Von Restorff Effect (Isolation Effect):**
    - Is there an element that completely contrasts with the color palette or shape layout of the entire visual? (e.g., an orange button on a blue-heavy page).
    - *Rule:* This element, even if small, must be marked as the "Primary Focus".

4. **Hick’s Law (Decision Paralysis):**
    - As the number of clickable or focusable elements on the screen increases, decision time increases logarithmically.
    - *Rule:* If the number of main focal points is greater than 3, significantly raise the "Cognitive Load Score" (Give a poor score).

Output Format:
Return the analysis results in Markdown format. Highlight headings. Clearly state the Cognitive Load Score. Absolutely answer only in the selected language.
`
};

const ANALYSIS_PROMPT = {
  tr: `
Lütfen bu görseli analiz et ve aşağıdaki formatta detaylı bir rapor sun. 

ÖNEMLİ: Isı haritası görseliyle tam uyum sağlamak için, odak noktalarını "KIRMIZI BÖLGE", "SARI BÖLGE" ve "MAVİ BÖLGE" (Ölü Alan) olarak etiketle.

### 🧠 Bilişsel Analiz Raporu

**1. Birincil Odak Noktası (KIRMIZI BÖLGE - The Magnet):**
[Kullanıcının gözünün istemsizce kilitlendiği İLK yer neresi? Neden? Yüzler ve yüksek kontrastlı alanlar buradadır.]

**2. Göz Akış Yolu (SARI BÖLGE - Simüle Edilmiş Eye-Tracking):**
[Gözün izlediği tahmini yol. Örn: Başlık -> Yüz -> Buton]

**3. Metin ve Tipografi Analizi:**
[Okunabilirlik durumu, font hiyerarşisi ve metinlerin taranabilirliği üzerine değerlendirme.]

**4. Renk Kontrastı ve Erişilebilirlik:**
[Renklerin duygusal etkisi ve arka plan ile ön plan arasındaki kontrastın nörolojik uygunluğu.]

**5. Obje ve Element Tespiti:**
[Görseldeki ana objelerin (örn: İnsan yüzü, ürün, ikon) listesi ve bilişsel ağırlıkları.]

**6. Bilişsel Yük Skoru (10 Üzerinden):**
[Skor X/10. Eğer 7'nin üzerindeyse nedenlerini açıkla.]

**7. Kör Noktalar (MAVİ BÖLGE - Dead Zones):**
[Tasarımda yer alan ama kullanıcının muhtemelen hiç okumayacağı veya görmeyeceği alanlar.]

**8. "Kısma Testi" (Squint Test) Sonucu:**
[Eğer gözlerimizi kısıp bulanık baksaydık, geriye kalan en baskın tek mesaj/şekil ne olurdu?]

**9. Nöro-Optimizasyon Önerisi:**
[Bilişsel yükü azaltmak ve dikkati doğru yere çekmek için 2 somut, bilimsel öneri.]

---

### ☁️ SENTIMENT & DUYGU ÇIKARIMI (JSON FORMATI)

Görselin "Aurasını", "Atmosferini" ve "Bilinçdışı Mesajını" analiz et.
Kullanıcının bu görsele 2 saniye baktığında hissedeceği tam **15 Adeti** (Duygusal Anahtar Kelime) çıkar.

**PUANLAMA:**
Her kelimeye 1'den 10'a kadar bir "Ağırlık" (Yoğunluk) puanı ver.
(10 = Baskın his, 1 = İnce arka plan hissi).

**KATEGORİLER:**
Kelimeleri şu 3 kategoride seçmeye çalış:
1. Güven & İtibar (Örn: Profesyonel, Sahte, Ucuz, Premium)
2. Ruh Hali (Örn: Enerjik, Kasvetli, Sakin, Kaotik)
3. Aciliyet (Örn: Agresif, Rahat, Zorlayıcı)

**ÇIKTI FORMATI (SADECE JSON):**
Yanıtının EN SONUNA aşağıdaki JSON bloğunu ekle:
\`\`\`json
{
  "sentiment_cloud": [
    {"word": "Premium", "weight": 10, "type": "positive"},
    {"word": "Karmaşık", "weight": 8, "type": "negative"},
    {"word": "Enerjik", "weight": 5, "type": "neutral"}
  ]
}
\`\`\`
`,
  en: `
Please analyze this image and provide a detailed report in the following format.

IMPORTANT: To match the heatmap visual perfectly, label the focus points as "RED ZONE", "YELLOW ZONE", and "BLUE ZONE" (Dead Zone).

### 🧠 Cognitive Analysis Report

**1. Primary Focal Point (RED ZONE - The Magnet):**
[Where does the user's eye involuntarily lock onto FIRST? Why? Faces and high contrast areas go here.]

**2. Eye Flow Path (YELLOW ZONE - Simulated Eye-Tracking):**
[The estimated path the eye follows. E.g., Headline -> Face -> Button]

**3. Text & Typography Analysis:**
[Evaluation of readability, font hierarchy, and scan-ability of text blocks.]

**4. Color & Contrast Audit:**
[Emotional impact of colors and neurological suitability of foreground/background contrast.]

**5. Object & Element Breakdown:**
[List of key objects (e.g., Human face, product, icon) and their cognitive weight.]

**6. Cognitive Load Score (Out of 10):**
[Score X/10. If above 7, explain why.]

**7. Blind Spots (BLUE ZONE - Dead Zones):**
[Areas in the design that the user will likely never read or see.]

**8. "Squint Test" Result:**
[If we squinted and looked at it blurred, what would be the single most dominant message/shape remaining?]

**9. Neuro-Optimization Recommendation:**
[2 concrete, scientific recommendations to reduce cognitive load and direct attention to the right place.]

---

### ☁️ SENTIMENT & EMOTIONAL EXTRACTION (JSON BLOCK)

Analyze the "Vibe," "Atmosphere," and "Subconscious Message" of the image.
Extract exactly **15 Adjectives** (Emotional Keywords) that a user would subconsciously feel when looking at this image for 2 seconds.

**SCORING:**
Assign a "Weight" (Intensity) score to each word from 1 to 10.
(10 = The dominant feeling, 1 = A subtle background feeling).

**CATEGORIES:**
Try to find words in these 3 categories:
1.  **Trust & Credibility:** (e.g., Professional, Scammy, Cheap, Premium)
2.  **Mood:** (e.g., Energetic, Gloomy, Calm, Chaos)
3.  **Urgency:** (e.g., Aggressive, Relaxed, Pushy)

**OUTPUT FORMAT (JSON ONLY):**
Add this specific JSON block at the VERY END of your response:
\`\`\`json
{
  "sentiment_cloud": [
    {"word": "Premium", "weight": 10, "type": "positive"},
    {"word": "Complex", "weight": 8, "type": "negative"},
    {"word": "Energetic", "weight": 5, "type": "neutral"}
  ]
}
\`\`\`
`
};

const getHeatmapPrompt = (lang: Language) => `
Create a highly accurate, **scientific Eye-Tracking Heatmap Overlay** on this image.

**CORE LOGIC - MUST MATCH NEURO-MARKETING PRINCIPLES:**
1.  **FACE BIAS:** If there is a human face, the EYES and MOUTH must be the **HOTTEST (RED)** spots.
2.  **GAZE CUEING:** If a person in the image is looking at something (e.g., a product), that target object must be **HOT (RED/ORANGE)**.
3.  **CONTRAST:** The element with the highest contrast (e.g., a bright button on dark bg) must be **RED**.

**VISUAL STYLE RULES:**
- **HOT ZONES (RED):** Use opaque, glowing **NEON RED (#FF0000)** for the primary focus. It should look like a concentrated blob.
- **WARM ZONES (ORANGE/YELLOW):** Use a **Gaussian Blur** gradient fading from Red to Orange to Yellow for secondary text and logos.
- **COLD ZONES (TRANSPARENT):** The background, empty space, and boring corners must be **COMPLETELY TRANSPARENT** or extremely faint blue. Do not color the whole image.
- **INTENSITY:** The Red spots must be vivid and clearly visible against the background.
- **BLEND MODE:** The effect should look like a heatmap layer plotted *over* the image, not replacing it.

**STRICT CONSTRAINTS:**
- **NO LEGEND BOX.** Do not draw a square box explaining colors.
- **NO TEXT.** Do not add labels like "Focus Here".
- Keep the original aspect ratio.
`;

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing from environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeImage = async (base64Data: string, mimeType: string, lang: Language): Promise<string> => {
  try {
    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: ANALYSIS_PROMPT[lang],
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION[lang],
        temperature: 0.4,
      },
    });

    return response.text || (lang === 'tr' ? "Analiz sonucu oluşturulamadı." : "Analysis result could not be generated.");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    if (error instanceof Error) {
        throw new Error(lang === 'tr' 
            ? `Analiz sırasında bir hata oluştu: ${error.message}` 
            : `An error occurred during analysis: ${error.message}`);
    }
    throw new Error(lang === 'tr' ? "Analiz sırasında bilinmeyen bir hata oluştu." : "An unknown error occurred during analysis.");
  }
};

export const generateHeatmap = async (base64Data: string, mimeType: string, lang: Language): Promise<string | null> => {
  try {
    const ai = getAiClient();

    // Using gemini-2.5-flash-image for image editing/generation tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: getHeatmapPrompt(lang),
          },
        ],
      },
      // No explicit imageConfig needed as we want the model to infer best output based on input
    });

    // Iterate through parts to find the image part
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Gemini Heatmap Error:", error);
    // We return null instead of throwing so the main analysis can still succeed even if heatmap fails
    return null;
  }
};
