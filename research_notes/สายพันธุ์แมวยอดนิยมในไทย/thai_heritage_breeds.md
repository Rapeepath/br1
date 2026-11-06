# Thai Heritage Cat Breeds: Siamese (วิเชียรมาศ), Korat (โคราช / สีสวาด), Khao Manee (ขาวมณี)

Research date: 2026-10-23. JSON deliverables: `data/siamese.json`, `data/korat.json`, `data/khao-manee.json`. All three files parse with `JSON.parse`.

Method notes, read these before the findings:
- **The Cat API now requires an API key.** `https://api.thecatapi.com/v1/breeds` returned HTTP 403 "Authentication required" on 2026-10-23. I took the baseline 1–5 ratings from cat-data-pages.onrender.com, a third-party site that renders Cat API breed data: [Siamese](https://cat-data-pages.onrender.com/cats/Siamese), [Korat](https://cat-data-pages.onrender.com/cats/Korat), [Khao Manee](https://cat-data-pages.onrender.com/cats/Khao%20Manee). The values match what I remember of the Cat API dataset, but they come from a mirror. Re-check them against the API if a key is available.
- **tica.org is behind a bot check.** It returned 403 to WebFetch and a "Checking your browser" page to curl, and vgl.ucdavis.edu behaved the same way. I confirmed TICA status through the WCF EMS table (which lists the WCC member registries recognising each breed), tica.org search-result snippets and Wikipedia, which gives the TICA dates. UC Davis tests are cited from search snippets, and the Langford Vets PDFs were read in full.
- **Thai heritage update.** On 18 Nov 2025 (พ.ศ. 2568) the Thai Cabinet approved "แมวไทย" as a national identity (เอกลักษณ์ประจำชาติ, pet-animal category). It covers five breeds: วิเชียรมาศ, ศุภลักษณ์, มาเลศ/โคราช, โกญจา and ขาวมณี. The proposal came from the National Identity Committee (คณะกรรมการเอกลักษณ์ของชาติ, กอช.) with the Ministry of Culture concurring. Sources: [Time Out Bangkok, 19 Nov 2025](https://www.timeout.com/bangkok/th/news/five-thai-cat-breeds-now-official-national-treasures-111925) and [ฐานเศรษฐกิจ, 20 Nov 2568](https://www.thansettakij.com/lifestyle/644492).

---

## 1. Origin, history and Thai vs Western type (incl. Tamra Maew / Cat-Book Poems)

### Takeaway
All three breeds are tied to the Thai Tamra Maew (สมุดข่อยตำราแมว), the cat-poem manuscripts held by Thailand's National Library. Siamese and Korat are linked to the Ayutthaya-era text (dated 1350–1767). For Khao Manee the sources disagree: CFA cites the Ayutthaya Tamra, while the Wikipedia accounts and Thai sources say the clear records start in the Rattanakosin era. The modern Western show Siamese now differs sharply from the traditional Thai type, which survives as the "Thai" breed in WCF, TICA and FIFe.

### Cited Findings
**Tamra Maew (general)**
- The National Library (สำนักหอสมุดแห่งชาติ, กรมศิลปากร) holds the cat manuscripts. The texts list 17 auspicious cat types and 6 inauspicious ones. Three manuscripts shown in a 2023 exhibition date from the early-to-mid Rattanakosin period — [Daily News, 15 ส.ค. 2566](https://www.dailynews.co.th/articles/2620459/)
- The Tamra Maew was "written between the 14th and 18th centuries", and copies are kept in the National Library of Thailand — [GCCF Siamese](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/siamese/)
- The GCCF Khao Manee breeding policy calls the Siamese seal point, Korat, Burmese and Khao Manee "the most famous of about 17 breeds listed as lucky cats". All four appeared on Thai stamp sets issued in 1971 and 1995 — [GCCF Khao Manee application/breeding policy PDF](https://www.gccfcats.org/wp-content/uploads/2025/05/Khao-Manee.Reg_.Policy-SOP.pdf)

**Siamese / วิเชียรมาศ**
- CFA: the breed was "first documented in a historic Thai collection of cat poems" from the Ayutthaya period (1350–1767). The first Siamese in America was "Siam", sent to President Rutherford B. Hayes in 1878. The breed was one of the first CFA recognised at its founding in 1906. Recognised colours were added over time: blue point in 1934, chocolate in 1952 and lilac in 1955 — [CFA Siamese](https://cfa.org/breed/siamese/)
- GCCF: the first UK Siamese were Pho and Mia, a pair the British Consul-General Edward Blencowe Gould brought back for his sister Lilian in 1884. More imports followed in 1886. Most of today's Siamese descend from about 11 original imports. Lilian Gould co-founded the Siamese Cat Club in 1901, and the first UK champion was Wankee in 1898. The "Royal Cat of Siam" label has "no evidence" that Siamese royalty kept the cats — [GCCF Siamese](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/siamese/)
- GCCF: "The modern Siamese cat that you will see at a show looks rather different to its original ancestors from Thailand… As Siamese became increasingly popular in the middle of the 20th century, a more slender version was favoured" — [GCCF Siamese](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/siamese/)
- Thai/Old-style Siamese: WCF recognised the original style as a separate breed, the Thai, with championship status in 1990. TICA granted the Thai championship status in January 2010. FIFe accepted it as a preliminary breed in 2015 — [Wikipedia: Thai cat](https://en.wikipedia.org/wiki/Thai_cat). FIFe says the Thai has been "recognised… by FIFe since 2017" — [FIFe Thai](https://fifeweb.org/cats/breeds/thai/)
- WCF Thai standard: "The aim of breeding the Thai is the traditional type of the Siamese". It describes a moderately wedge-shaped head with rounded contours, a medium body and "all pointed colours without white" — [WCF Thai standard 2024-12-05](https://wcf.de/pdf-en/breed/THA_en_2024-12-05.pdf)
- FIFe Thai rules: no crossbreeding, and only Thais imported from Thailand with documented origin may enter the novice class — [FIFe Breeding & Registration Rules 01.07.26](https://fifeweb.org/wp-content/uploads/2023/11/br_reg_en.pdf)
- Thai traditional standard: a cream/white coat with dark (สีครั่ง/น้ำตาลไหม้) points at nine places: face, both ears, four feet, tail and genitals. Hence the name "แมวเก้าแต้ม". Thai tradition counts odd or other-coloured eyes, and kinked tails, as faults — [Thai Wikipedia: วิเชียรมาศ](https://th.wikipedia.org/wiki/วิเชียรมาศ) (tertiary source; its lead sentence contains a contradictory "black" description, so I used only the 9-point description)
- The Thai name วิเชียรมาศ (Wichien Maat) means "diamond gold" — [Wikipedia: Thai cat](https://en.wikipedia.org/wiki/Thai_cat)

**Korat / โคราช / สีสวาด / มาเลศ**
- CFA: the earliest record is in "The Cat-Book of Poems or Smud Khoi of Cats" from the Ayudhya period (1350–1767). The breed was traditionally given to brides and seen as a harbinger of luck. Jean Johnson imported the first two Korats to the US in 1959, and Daphne Negus brought nine more in 1969 — [CFA Korat](https://cfa.org/breed/korat/)
- GCCF: Nara and Darra went to Jean Johnson's Cedar Glen cattery in 1959. The Korat Cat Fanciers Association formed in 1965, and CFA granted the Korat championship status in 1966. The first UK imports arrived in 1972, and GCCF granted championship status in 1984. The breed is still used in rain ceremonies, and Korats were traditionally gifts that were never sold — [GCCF Korat](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/korat/)
- GCCF Korat & Thai breeding policy: in Thailand the breed is usually called Si-Sawat, with older names Doklao and Maled taken from Tamra Maew imagery. The coat is likened to a seed head, lemongrass flower, clouds and sea foam. A cartoon Si-Sawat kitten was the logo of the 2007 SEA Games — [GCCF Korat & Thai Breeding Policy](https://www.gccfcats.org/wp-content/uploads/2021/10/KoratThai.BP_.pdf)
- The Tamra describes มาเลศ/ดอกเลา like this: "มีขนเรียบสีดอกเลา โคนขนจะมีสีขุ่น ๆ เทา ขณะที่ส่วนปลายมีสีเงิน ตาเป็นประกายคล้ายหยดน้ำค้างบนใบบัว" — [Daily News / National Library exhibit](https://www.dailynews.co.th/articles/2620459/)
- "Blue Siamese" (Korat-type) cats appeared in Britain in 1889 and 1896 and had disappeared by 1901. The illustration in the Tamra is "not detailed enough to be definitive" — [Wikipedia: Korat](https://en.wikipedia.org/wiki/Korat_cat)
- Thai sources say the cat comes from อ.พิมาย, จ.นครราชสีมา. The name "สีสวาด" refers to the colour of the สวาด seed — [Thai Wikipedia: แมวสีสวาด/มาเลศ](https://th.wikipedia.org/wiki/แมวสีสวาด) (tertiary)
- The Korat type has changed little from the old illustrations. GCCF says Korats in the West "can have their ancestry traced back to imports from Thailand" — [GCCF Korat](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/korat/). FIFe allows only Thai-imported Korats with proven origin into the novice class — [FIFe rules](https://fifeweb.org/wp-content/uploads/2023/11/br_reg_en.pdf)

**Khao Manee / ขาวมณี / ขาวปลอด**
- CFA: the breed is referenced in the Tamra Maeo (Ayutthaya, 1350–1767). "Legend tells us that Thai royalty kept the breed hidden". Colleen Freymuth brought the first cats to the US in 1999 — [CFA Khao Manee](https://cfa.org/breed/khao-manee/)
- Wikipedia contradicts CFA. It says there are no specific Khao Manee records from Ayutthaya. Records date from the Thonburi and Rattanakosin eras, mentions become frequent under King Nangklao (Rama III), and the cat was renamed from "Khao Plort" to Khao Manee under King Chulalongkorn (Rama V). Freymuth imported 12 cats in 1999 — [Wikipedia: Khao Manee](https://en.wikipedia.org/wiki/Khao_Manee). Thai Wikipedia also says the cat is "ไม่ได้มีบันทึกไว้ในสมุดข่อย" and was favoured at Rama V's court — [Thai Wikipedia: ขาวมณี](https://th.wikipedia.org/wiki/แมวขาวมณี)
- Commons holds a photographed "Khao Manee cat in Tamra cat Rattanakosin" manuscript image. This supports the Rattanakosin record, though I treat it as weak evidence — [Commons search results](https://commons.wikimedia.org/wiki/File:Khao_Manee_cat_in_Tamra_cat_Rattanakosin.png)
- The name means "white jewel". The breed is also called the "Diamond Eye cat" — [Wikipedia: Khao Manee](https://en.wikipedia.org/wiki/Khao_Manee)

### Inferences
- In the JSON I wrote Khao Manee's history carefully: CFA cites the Ayutthaya Tamra, but clear records start in Rattanakosin. Stating "Ayutthaya" alone would repeat a disputed claim.
- In Thailand, วิเชียรมาศ refers to the traditional moderate type, which the West calls Thai or Old-style. For a Thai brochure, the Siamese page should describe both types and not present the modern extreme wedge as "the" วิเชียรมาศ. I chose a Commons photo categorised "Black point Thai cats" (old-style).

### Gaps
- I could not access the primary Tamra Maew scans or the National Library catalogue. Dates (1350–1767) come from the registries (CFA, GCCF), and the 17/6 counts from the Daily News report.
- I found no single authoritative source for when FIFe first recognised the Siamese or Korat, or for TICA's first recognition dates of either breed. It is only clear that both have been recognised since early in each registry's history.

---

## 2. Physical traits, weight by sex, lifespan, coat/colours

### Takeaway
All three breeds are medium-sized shorthairs. Registry or standard sources give weight by sex for Siamese (GCCF) and Khao Manee (ACFA). For the Korat, the by-sex figures come from Purina NZ and fit the CFA and GCCF overall figures. Lifespan figures are thin: Siamese and Korat have GCCF plus Cat API ranges, and Khao Manee has only the Cat API figure.

### Cited Findings
**Siamese**
- GCCF: "Male Siamese cats weigh between 10 to 15 lbs, while females weigh less than males at 8 to 12 lbs". The overall range is 8–15 lb and lifespan 10–15 years. Siamese "often live well into their late teens… not unheard of… into their twenties". The breed comes in 32 colour and point patterns, with solid points in seal, blue, chocolate, lilac, cinnamon, caramel, fawn, apricot, red and cream, plus tabby, tortie and tortie-tabby points. Kittens are born light cream or white. The Himalayan (temperature-sensitive) gene darkens cooler areas, so cats in cold climates develop darker bodies — [GCCF Siamese](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/siamese/)
- CFA: long, flat profile; wedge head with a fine muzzle; large, broad-based ears; almond-shaped, deep vivid blue eyes; medium-size, long, svelte body. CFA's colour history covers seal, blue, chocolate and lilac only — [CFA Siamese](https://cfa.org/breed/siamese/)
- WCF: the Siamese is recognised "in all pointed colours, tabby and bicolour", and solid white is shown as the Foreign White — [WCF SIA standard 2023](https://wcf.de/pdf-en/breed/SIA-EN_2023-01-01.pdf)
- PDSA (UK veterinary charity): average weight 5.2 kg; lifespan "11-15 years" — [PDSA Siamese](https://www.pdsa.org.uk/pet-help-and-advice/looking-after-your-pet/kittens-cats/siamese)
- Purina NZ: males 5.5–7.5 kg, females 3.5–5.5 kg — [Purina NZ Siamese](https://www.purina.co.nz/cats/cat-breeds/siamese/). These figures are higher than GCCF's.
- Cat API (via mirror): 4–7 kg (8–15 lb); lifespan 12–15 — [mirror](https://cat-data-pages.onrender.com/cats/Siamese)
- **JSON choice:** weight female [3.6, 5.4], male [4.5, 6.8], converted from the GCCF lb figures. Lifespan [10, 15], the span of GCCF 10–15, PDSA 11–15 and Cat API 12–15.

**Korat**
- CFA: medium-sized, muscular body; heart-shaped head; "silver-tipped blue all over… silver halo effect"; large, luminous peridot-green eyes. Kittens may have yellow or amber eyes, and full eye colour takes until 2–4 years. Males are "10 pounds" or more and females smaller — [CFA Korat](https://cfa.org/breed/korat/)
- GCCF: 6–10 lb; lifespan 15–18 years; a minority breed in GCCF; "one colour – blue". The cat is "unusually heavy for its size" and slow to mature, reaching full development at about 4 years. Females are smaller and daintier, and males are medium-boned and powerful. The single coat is short to medium. Silver tipping reaches full intensity at about 2 years — [GCCF Korat](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/korat/)
- WCF: the body is almost square, muscular and "surprisingly heavy for its size". The head is heart-shaped and the eyes round and almost oversized. "A luminous green is preferred, amber is tolerated." The coat is uniform silver-blue with clearly visible silver tipping — [WCF KOR standard](https://wcf.de/pdf-en/breed/KOR_en_2010-01-01.pdf)
- FIFe: "shall not recognise any other variety than blue in the Korat" — [FIFe rules 01.07.26](https://fifeweb.org/wp-content/uploads/2023/11/br_reg_en.pdf)
- Purina NZ: males 3.5–5 kg, females 3–4 kg; "ages of 18 and 19 not uncommon" — [Purina NZ Korat](https://www.purina.co.nz/cats/cat-breeds/korat/)
- Cat API (via mirror): 3–5 kg (7–11 lb); lifespan 10–15 — [mirror](https://cat-data-pages.onrender.com/cats/Korat)
- GCCF breeding policy: "Many pass 15 and a fair number go into their twenties" (described as anecdotal). The Korat is "on record as having the lowest birth weight in litters" (Bristol University/FAB survey, 1998) — [GCCF Korat & Thai BP](https://www.gccfcats.org/wp-content/uploads/2021/10/KoratThai.BP_.pdf)
- GCCF also registers "Thai Lilac", "Thai Blue Point" and "Thai Lilac Point": Korat-type cats in non-blue colours, at provisional level. Do not confuse these with the Thai (Old-style Siamese) — [GCCF Korat & Thai BP](https://www.gccfcats.org/wp-content/uploads/2021/10/KoratThai.BP_.pdf); [GCCF cat breeds page](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/) lists "Thai: Blue & Lilac Point, and solid Lilac".
- **JSON choice:** weight female [3, 4], male [3.5, 5] (Purina NZ). These fit CFA (males ≥10 lb ≈ 4.5 kg) and GCCF (2.7–4.5 kg overall). Lifespan [10, 18] spans Cat API 10–15 and GCCF 15–18.

**Khao Manee**
- ACFA standard: "Males should typically be 8 to 11 pounds… Females should be typically 6 to 8 pounds". It describes a medium, semi-foreign, completely white cat with odd or same-coloured eyes, and calls for natural sexual dimorphism to be preserved — [ACFA Khao Manee](https://acfacat.com/Kahomanee.htm)
- WCF standard (code KAM, 29.09.2019): medium torso with firm, flat musculature, "flexible and springy, not meaty or heavy". Modified wedge head, with nose tip and ear tips forming an equilateral triangle. Kinks are accepted in the last third of the tail. Eyes may be any blue (incl. aqua), golden (brown, copper, amber, yellow, hazel) or green, and odd eyes are allowed. The coat is short and fine with no undercoat. Colour is pure glossy white. A "gene-leak" (coloured hairs) is allowed up to 18 months. Paw pads and nose leather are pink — [WCF Khao Manee standard](https://wcf.de/pdf-en/breed/Khao_Manee_2019-09-29_EN.pdf)
- CFA: eyes may be "any shade of blue, green, yellow or odd-eyed — with odd eyes being the rarest and most prized" — [CFA Khao Manee](https://cfa.org/breed/khao-manee/)
- Cat API (via mirror): 4–6 kg (8–12 lb); lifespan 10–12 — [mirror](https://cat-data-pages.onrender.com/cats/Khao%20Manee)
- **JSON choice:** weight female [2.7, 3.6], male [3.6, 5.0] (ACFA lb converted). Lifespan [10, 12] (Cat API only).

### Inferences
- The Siamese weight sources disagree. Purina NZ (males up to 7.5 kg) is much heavier than GCCF and PDSA, so I used GCCF, the registry figure.
- The Cat API's Khao Manee range (4–6 kg) is heavier than ACFA's female range. I used the ACFA standard because it is a registry standard and gives figures by sex.

### Gaps
- **Khao Manee lifespan:** the only figure I found is the Cat API's 10–12 years. No registry or veterinary lifespan figure exists, so this is a low-confidence value.
- **Siamese lifespan in VetCompass:** a search summary attributed 11.7 years to Siamese in the RVC/VetCompass 2024 life tables, but the fetched phys.org article did not state a Siamese figure, and the RVC page returned 403. The value is unverified, so it is excluded. The study itself is confirmed: 7,936 UK cats, overall life expectancy 11.74 years, published in the Journal of Feline Medicine and Surgery on 10 May 2024. Overweight cats and males had shorter lives — [phys.org](https://phys.org/news/2024-05-life-reveals-longest-shortest-cats.html)
- No registry gives Korat weight by sex in numbers. CFA gives only "males 10 lb or more, females smaller".

---

## 3. Temperament, activity and care needs (grooming, exercise, diet, environment)

### Takeaway
- **Siamese:** consistently described as very vocal, people-focused, intelligent and demanding. They do poorly when left alone.
- **Korat:** intelligent and strongly bonded but quieter. They prefer calm homes and can be possessive or dominant.
- **Khao Manee:** curious, playful and affectionate (lap and shoulder cat). The Cat API rates it highly vocal, which no registry contradicts.
- **Grooming:** all three are low-maintenance shorthairs.

### Cited Findings
**Siamese**
- CFA: "vocal, affectionate, active", "insistent", "unsurpassed… in its ability to communicate with humans", "often considered the most intelligent of cats". It can be groomed "with only your hands" — [CFA Siamese](https://cfa.org/breed/siamese/)
- GCCF: "outgoing, extrovert and can be extremely noisy". They demand attention and are "not an ideal cat for someone out at work all day", though having two Siamese can help. They are highly intelligent, need amusement such as toys and scratching posts, and can be taught to retrieve. They "may not tolerate rivals for their affection". The coat "does not require excessive grooming" — [GCCF Siamese](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/siamese/)
- PDSA: they follow their owners around but "aren't overly active". They are loudly vocal, may get lonely, and "may not tolerate other pets well". They love heights, so cat trees help. Weekly grooming suits them, and getting two siblings is suggested — [PDSA Siamese](https://www.pdsa.org.uk/pet-help-and-advice/looking-after-your-pet/kittens-cats/siamese)
- Cat API description: "demanding and social… do not like being left alone"; temperament "Active, Agile, Clever, Sociable, Loving, Energetic" — [mirror](https://cat-data-pages.onrender.com/cats/Siamese)

**Korat**
- CFA: "extremely intelligent", "energetic but not hyperactive", forms "a strong bond with their owners". Weekly brushing suffices, as they "shed only lightly" — [CFA Korat](https://cfa.org/breed/korat/)
- GCCF: "very intelligent". They do not like to be left alone, and long absences "may result in separation anxiety". They "can be possessive with their toys and stubborn" and are "generally quiet cats" that "prefer a quiet environment". They are "athletic and quite high energy", fine with respectful children and enjoy learning tricks. They prefer other Korats and get along with cats and dogs "but expect to be top of the pecking order". They moult very little; a chamois or silk polish adds gloss. They can be harness-trained, and an enclosed outdoor space is recommended — [GCCF Korat](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/korat/)
- Cat API description: "startled by loud sounds and sudden movements… like to cuddle"; temperament "Active, Loyal, highly intelligent, Expressive, Trainable" — [mirror](https://cat-data-pages.onrender.com/cats/Korat)
- Purina NZ: "quiet, sweet nature but… very intelligent and playful" — [Purina NZ Korat](https://www.purina.co.nz/cats/cat-breeds/korat/)
- Wikipedia calls the Korat "very vocal", which contradicts GCCF and Purina ("quiet") — [Wikipedia: Korat](https://en.wikipedia.org/wiki/Korat_cat)

**Khao Manee**
- CFA: "curious and intelligent", with an "enduring sense of mischief". They enjoy games and are "lap lovers and shoulder riders". Brush regularly with a rubber brush, and bathe occasionally to keep the coat white — [CFA Khao Manee](https://cfa.org/breed/khao-manee/)
- Cat API description: "highly intelligent, with an extrovert and inquisitive nature… also very calm and relaxed… ideal lap cat"; temperament "Calm, Relaxed, Talkative, Playful, Warm" — [mirror](https://cat-data-pages.onrender.com/cats/Khao%20Manee)
- Thai Wikipedia: "ค่อนข้างเชื่อง เหมาะสำหรับการเลี้ยงเป็นเพื่อน" — [Thai Wikipedia: ขาวมณี](https://th.wikipedia.org/wiki/แมวขาวมณี)
- Sun protection for white cats: auricular SCC "is more common in white cats and in cats that have white ears". PetMD advises limiting sun exposure, especially for white cats — [PetMD Ear Cancer in Cats](https://www.petmd.com/cat/conditions/cancer/c_ct_squamous_cell_carcinoma_ear)

**Diet (all)**
- Overweight cats had shorter lives in the RVC/VetCompass study — [phys.org](https://phys.org/news/2024-05-life-reveals-longest-shortest-cats.html). Korats "typically have a low percentage of body fat", so vets should take this into account when choosing anaesthesia — [GCCF Korat](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/korat/). Some Siamese lines show pica (eating wool, plastic and similar) — [GCCF Siamese](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/siamese/)

### Ratings (Cat API baseline → final, with reasons)
| Trait | Siamese API → final | Korat API → final | Khao Manee API → final |
|---|---|---|---|
| energy | 5 → 5 | 3 → **4** (GCCF "quite high energy", Purina "highly active") | 3 → 3 |
| affection | 5 → 5 | 5 → 5 | 4 → 4 |
| vocal | 5 → 5 | 3 → **2** (GCCF "generally quiet cats", Purina "quiet") | 5 → 5 |
| intelligence | 5 → 5 | 5 → 5 | 4 → 4 |
| grooming | 1 → 1 | 1 → 1 | 3 → **2** (CFA: regular rubber-brushing only; WCF: short coat with no undercoat) |
| shedding | 2 → 2 | 3 → **2** (CFA "shed only lightly", GCCF "moult very little") | 3 → 3 |
| kidFriendly | 4 → 4 | 4 → 4 | 3 → 3 |
| petFriendly (API dog_friendly) | 5 → **4** (PDSA "may not tolerate other pets well"; GCCF "may not tolerate rivals") | 5 → **4** (GCCF: gets along but "expect[s] to be top of the pecking order", prefers other Korats) | 3 → 3 |
| socialNeeds | 5 → 5 | 5 → 5 | 3 → 3 |

Siamese energy: PDSA says "aren't overly active", while CFA says "active" and Purina "highly active". The sources do not clearly agree on a lower value, so energy stays at 5.

### Inferences
- The Siamese and Korat both need company. Korat owners should also expect a cat that prefers quiet homes and dislikes chaos.

### Gaps
- No veterinary source rates Khao Manee temperament. Every behavioural description comes from CFA, the Cat API or breeders.

---

## 4. Breed-associated health problems and screening

### Takeaway
- **Siamese:** PRA (rdAc, DNA-testable), hepatic/systemic amyloidosis (no DNA test), asthma, mediastinal lymphoma, hip dysplasia, pica and rare lysosomal storage diseases.
- **Korat:** GM1 and GM2 gangliosidosis, both fatal, autosomal recessive and DNA-testable. FIFe and GCCF mandate testing. GCCF also announced a 2025 DNA test for a recessive atherosclerosis gene.
- **Khao Manee:** congenital deafness linked to dominant white (screened by BAER/OAE, which GCCF requires for active registration), and sun-related SCC risk common to white cats.

### Cited Findings
**Siamese**
- CFA: progressive retinal atrophy is "recessive" and "detectable via genetic testing". Amyloidosis causes "liver problems", and the genes involved are still unidentified — [CFA Siamese](https://cfa.org/breed/siamese/)
- Langford Vets: the rdAc mutation in CEP290 causes PRA in Abyssinians and related cats. Affected cats have normal vision at birth, show signs at 1–2 years and go blind at 3–5 years, though onset varies and can come at 6+ years. A PCR pyrosequencing test identifies affected and carrier cats — [Langford PRA rdAc PDF](https://langfordvets.co.uk/media/zk2jup41/progressive-retinal-atrophy-rdac.pdf). UC Davis VGL lists PRA rdAc testing for Siamese among other breeds (search snippet; page bot-blocked) — [UC Davis VGL PRA rdAc](https://vgl.ucdavis.edu/test/pra-rdac)
- VCA: amyloidosis is uncommon except in "Abyssinians, Siamese, Burmese, Tonkinese, Devon Rex, and oriental shorthair breeds". "Siamese and Oriental shorthair cats… are prone to severe liver amyloidosis that leads to liver rupture and bleeding." There is "no clear genetic profile", and no genetic test is cited — [VCA Amyloidosis in Cats](https://vcahospitals.com/know-your-pet/amyloidosis-in-cats)
- GCCF: some lines may be predisposed to cancers such as mediastinal lymphoma and some intestinal tumours. Siamese suffer more from chronic coughing (asthma) and vomit more. Pica appears in some lines. PRA has been identified, and Siamese may be predisposed to hip dysplasia. Niemann-Pick disease, mucopolysaccharidosis and GM1 gangliosidosis have been described, along with systemic amyloidosis. The original Siamese eye squints and tail kinks are now serious show faults — [GCCF Siamese](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/siamese/)
- PDSA lists mediastinal lymphoma, asthma, PRA, hip dysplasia and systemic amyloidosis. It advises discussing the parents' and grandparents' medical history and recommends insurance — [PDSA Siamese](https://www.pdsa.org.uk/pet-help-and-advice/looking-after-your-pet/kittens-cats/siamese)
- A search summary credited Langford with PRA results for Siamese of 62% normal, 26% carrier and 12% affected. I could not confirm this on a primary page, so it is not used.

**Korat**
- Langford Vets: GM1 comes from a GLB1 mutation. Tremors start around 3 months and progress to blindness, seizures and death by 9–10 months. GM2 comes from a HEXB mutation and causes tremors and incoordination from about 4 weeks, with death by 8 months. Both are autosomal recessive, and the test gives a Normal, Carrier or Affected result — [Langford GM1](https://langfordvets.co.uk/media/ffeb41y0/korat-gm1-gangliosidosis.pdf); [Langford GM2](https://langfordvets.co.uk/media/h4llu5ic/korat-gm2-gangliosidosis.pdf)
- UC Davis VGL offers Korat GM1 and GM2 tests. In a carrier × carrier mating, 25% of kittens are predicted to be affected (search snippet) — [VGL Korat GM1](https://vgl.ucdavis.edu/test/korat-gm1); [VGL Korat GM2](https://vgl.ucdavis.edu/test/korat-gm2)
- FIFe rules: Korats used in breeding must have a DNA test for GM unless both parents are proven free. Allowed matings are GM-free × GM-free, or non-carrier × carrier provided all offspring are tested — [FIFe rules 01.07.26](https://fifeweb.org/wp-content/uploads/2023/11/br_reg_en.pdf)
- GCCF: Korats were "the first breed to be DNA screened for two forms of a genetic disease (GM1 and GM2)". All UK lines tested clear in 1998, and every GCCF-registered Korat has since been tested or has clear parents. A September 2025 update says Korats carry a recessive gene causing atherosclerosis, which leads to congestive heart failure. A genetic test became available in 2025, and breeders are testing all lines of GCCF Korats and Thais. Low body fat means anaesthesia doses need care — [GCCF Korat](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/korat/)
- GCCF breeding policy: GM1 "is shared with the Siamese… GM2 is unique to Korats". Other recorded problems include fading kittens, twisted legs or feet that self-correct, and hernias — [GCCF Korat & Thai BP](https://www.gccfcats.org/wp-content/uploads/2021/10/KoratThai.BP_.pdf)
- Purina NZ advises asking breeders for test results showing freedom from gangliosidosis — [Purina NZ Korat](https://www.purina.co.nz/cats/cat-breeds/korat/)

**Khao Manee**
- CFA: "White cats can be prone to deafness, especially blue-eyed cats, and odd-eyed cats may be deaf in one ear" — [CFA Khao Manee](https://cfa.org/breed/khao-manee/)
- GCCF breeding policy: the white comes from Dominant White (W), which is not albinism, so there is no nystagmus. Odd-eyed cats "may be deaf on one side (usually the side with the blue eye)". Phenotype is no guarantee either way, and the genes behind deafness are unidentified (UC Davis research is ongoing). Anecdotal breeder records suggest deafness is less frequent than in European blue-eyed white breeds. All BAER-tested UK foundation imports were hearing cats. The policy also warns that loss of size or a more delicate build in later generations may signal inbreeding depression. It advises against narrow selection for odd eyes and against matings that share more than two common grandparents — [GCCF Khao Manee application PDF](https://www.gccfcats.org/wp-content/uploads/2025/05/Khao-Manee.Reg_.Policy-SOP.pdf)
- GCCF registration requires a BAER or OAE certificate of freedom from deafness before active registration (search result summary of the same PDF) — [GCCF Khao Manee PDF](https://www.gccfcats.org/wp-content/uploads/2025/05/Khao-Manee.Reg_.Policy-SOP.pdf)
- SCC: ear squamous cell carcinoma "is more common in white cats and in cats that have white ears". It starts as red, crusty ear-tip lesions. Limit sun exposure — [PetMD](https://www.petmd.com/cat/conditions/cancer/c_ct_squamous_cell_carcinoma_ear)
- Thai Wikipedia (unsourced folk view): odd-eyed cats often have one weaker eye, blue-eyed ones are often hearing-impaired, and amber-eyed ones have poor coat glands — [Thai Wikipedia](https://th.wikipedia.org/wiki/แมวขาวมณี). This is not used as a health fact.

### Inferences
- The most useful thing a brochure can tell buyers is what to ask breeders for. That is the DNA certificate for PRA-rdAc for Siamese, GM1/GM2 (and atherosclerosis where available) for Korat, and a BAER result for Khao Manee.

### Gaps
- I found no prevalence data for deafness in Khao Manee. Breeders report it anecdotally only.
- No veterinary source lists Khao Manee-specific diseases beyond white-coat deafness and sun risk. The breed's small gene pool is a stated concern, but no health studies exist.
- Siamese GM1 and Niemann-Pick DNA tests may exist at some labs. I did not verify them, so screening for these is left out of the JSON.

---

## 5. Registry recognition (CFA, TICA, FIFe, GCCF, WCF) and ideal owner profile

### Takeaway
- **Siamese:** recognised by all five registries. CFA has recognised it since its 1906 founding. The traditional type is separately recognised as the "Thai" by WCF (1990), TICA (championship January 2010) and FIFe (preliminary 2015, recognised by 2017).
- **Korat:** recognised by all five. CFA granted championship in 1966 and GCCF in 1984.
- **Khao Manee:** recognised by TICA (championship 1 May 2015), CFA (accepted 2018, still in the Provisional class) and WCF (code KAM). It is not recognised by FIFe (absent from the 01.07.2026 EMS list). GCCF gives it breed-name recognition only, with "no active interest by GCCF breeders".

### Cited Findings
- WCF EMS table: Siamese (SIA) is recognised by "ALL" WCC members, Thai (THA) by WCF, FIFe, TICA, GCCF and LOOF, Khao Manee (KAM) by WCF, CFA and TICA, and Korat (KOR) by WCF, CFA, FIFe, TICA, ACF, CCCA, SACC and LOOF — [WCF EMS](https://wcf.de/pdf-en/WCF-EMS_EN.pdf). GCCF is missing from WCF's Korat row, even though GCCF granted the Korat championship in 1984 — [GCCF Korat](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/korat/). The "GCCF" in WCF's Thai row probably refers to GCCF's Korat-derived "Thai" (Blue/Lilac Point), not the Old-style Siamese.
- FIFe EMS (issued 01.07.2026) lists KOR, SIA and THA among recognised breeds. Khao Manee is absent, appearing in neither the recognised nor the named non-recognised list — [FIFe EMS system](https://fifeweb.org/wp-content/uploads/2023/12/ems_system_en.pdf)
- CFA: the Siamese was among the first breeds at the 1906 founding — [CFA Siamese](https://cfa.org/breed/siamese/). The Khao Manee "was accepted for CFA registration in 2018 and is currently shown in the Provisional class" — [CFA Khao Manee](https://cfa.org/breed/khao-manee/). Wikipedia gives the CFA dates as 7 Feb 2018, with shows from 1 May 2018 — [Wikipedia](https://en.wikipedia.org/wiki/Khao_Manee)
- TICA Khao Manee: registration-only status in May 2009, Preliminary New Breed effective 1 May 2012, Advanced New Breed on 30 Aug 2013 and Championship effective 1 May 2015 — [Wikipedia: Khao Manee](https://en.wikipedia.org/wiki/Khao_Manee). A tica.org search snippet confirms acceptance for championship in 2015 — [TICA Khaomanee](https://tica.org/khaomanee-breeders?catid=79&id=846%3Akhaomanee-breed&view=article)
- GCCF Khao Manee: the name was granted on 8 Sep 2010 for exhibition only, and the club received pre-affiliation on 26 Oct 2011 — [Wikipedia](https://en.wikipedia.org/wiki/Khao_Manee). GCCF currently lists it among breeds "with name recognition, but no active interest by GCCF breeders… They may be shown as Pedigree Pets" — [GCCF Unrecognised Breeds](https://www.gccfcats.org/getting-a-cat/unrecognised-breeds/)
- WCF publishes a Khao Manee standard (2019) — [WCF KAM](https://wcf.de/pdf-en/breed/Khao_Manee_2019-09-29_EN.pdf) — and standards for Korat — [WCF KOR](https://wcf.de/pdf-en/breed/KOR_en_2010-01-01.pdf), Siamese — [WCF SIA](https://wcf.de/pdf-en/breed/SIA-EN_2023-01-01.pdf) and Thai — [WCF THA](https://wcf.de/pdf-en/breed/THA_en_2024-12-05.pdf)
- ACFA also has a Khao Manee standard — [ACFA](https://acfacat.com/Kahomanee.htm)

**Ideal owner profile (based on registry and charity guidance)**
- **Siamese:** GCCF says it is not ideal for someone out at work all day, and having two helps. PDSA suggests getting two siblings and introducing other pets slowly — [GCCF](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/siamese/); [PDSA](https://www.pdsa.org.uk/pet-help-and-advice/looking-after-your-pet/kittens-cats/siamese)
- **Korat:** suits a quiet home with company, as it is prone to separation anxiety. It is fine with respectful children and expects to dominate other pets — [GCCF Korat](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/korat/)
- **Khao Manee:** suits a playful lap cat lover — [CFA](https://cfa.org/breed/khao-manee/). Buyers should expect high prices because the breed is rare: Wikipedia cites prices up to US$11,000 — [Wikipedia](https://en.wikipedia.org/wiki/Khao_Manee)

### Inferences
- For the JSON `recognizedBy`, I listed only full or show recognition I could verify. Siamese and Korat get CFA, TICA, FIFe, GCCF and WCF. Khao Manee gets CFA, TICA and WCF. I excluded GCCF from Khao Manee because it has name recognition only, and FIFe because the breed is absent from its list.

### Gaps
- I could not open tica.org directly because of a Cloudflare bot check, so TICA facts rely on WCF EMS, tica.org search snippets and Wikipedia.
- I found no exact first-recognition years for the Siamese in FIFe, GCCF or TICA, or for the Korat in FIFe or TICA.

---

### Image selections (Wikimedia Commons, verified via Commons API: MIME image/jpeg, size and licence; the direct URLs returned HTTP 206 image/jpeg)
- **Siamese:** [File:Seal_Old_Style_Siamese_Thai.jpg](https://commons.wikimedia.org/wiki/File:Seal_Old_Style_Siamese_Thai.jpg). 1128×748, CC BY-SA 3.0 (multi-licensed with GFDL), by Adolpha at English Wikipedia. Category "Black point Thai cats", which matches the traditional วิเชียรมาศ type.
- **Korat:** [File:Korat_cat_wikipedia.jpg](https://commons.wikimedia.org/wiki/File:Korat_cat_wikipedia.jpg). 1102×735, CC BY-SA 4.0, by Jacques Julien Photo. Category "Korats". There is a small photographer watermark at the bottom right.
- **Khao Manee:** [File:Khao_Manee_Lily.jpg](https://commons.wikimedia.org/wiki/File:Khao_Manee_Lily.jpg). 1555×1037, CC BY-SA 4.0, by Lunile. An odd-eyed female, in category "Odd-eyed Khao Manee". Commons intermittently returned HTTP 429 (rate limit) for this URL, but it returned 206 image/jpeg on an earlier check.
