# Round-faced cat breeds: Persian (เปอร์เซีย), Exotic Shorthair (เอ็กโซติก ช็อตแฮร์), British Shorthair (บริติช ช็อตแฮร์)

Data files written (UTF-8, validated with `JSON.parse`): `data/persian.json`, `data/exotic-shorthair.json`, `data/british-shorthair.json` (same folder as this note). Research current as of 2026-10-23.

**Important method note on The Cat API:** `https://api.thecatapi.com/v1/breeds` now returns HTTP 403 "Authentication required. Please provide a valid API key" (tested 2026-10-23). I took the baseline ratings from a Wayback Machine snapshot of the same endpoint dated 2025-12-09 ([archived Cat API breeds](https://web.archive.org/web/20251209033623/https://api.thecatapi.com/v1/breeds)). Other researchers who use the same rules should use the same snapshot so the ratings stay consistent. Cat API IDs: Persian = `pers`, Exotic Shorthair = `esho` (not `exot`), British Shorthair = `bsho`.

## Q1. What are verified weight ranges (male/female) and lifespan ranges for each breed? (also covers origin, history and registry recognition)

### Takeaway
Registries give sex-specific weights only for the British Shorthair (GCCF: males 4.1–7.7 kg, females 3.2–5.4 kg) and the Exotic (GCCF: females 7–12 lb, males 12–14 lb). For the Persian, Royal Canin (males 5–7 kg, females 3–5 kg) and GCCF (females 6–12 lb, males >12 lb) agree, but UK clinic data show real pet Persians are lighter (mean males 4.3 kg, females 3.4 kg). Registry lifespan claims (12–20 years) are noticeably more optimistic than UK veterinary epidemiology. VetCompass found a median Persian longevity of 13.5 years, and life expectancy at birth was 10.9 years for Persians and 9.6 years for "British" cats.

### Cited Findings
**Weights**
- Persian: GCCF summary box says "Size 6–12 lbs". The breed profile adds that males weigh more than 12 lb and females typically 6–12 lb — [GCCF Persian](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/persian/)
- Persian: Royal Canin UK gives a weight of 5–7 kg for males and 3–5 kg for females — [Royal Canin UK Persian](https://www.royalcanin.com/uk/cats/breeds/persian)
- Persian: VetCompass found a mean adult bodyweight of 4.3 kg for males and 3.4 kg for females (n = 3,235 Persians in UK primary care) — [O'Neill et al. 2019, Sci Rep](https://www.nature.com/articles/s41598-019-49317-4) (read via [PMC6748978](https://pmc.ncbi.nlm.nih.gov/articles/PMC6748978))
- Persian: Hill's gives "Male: Large >12 lbs; Female: Medium 8–12 lbs" — [Hill's Persian](https://hillspet.com/cat-breeds/persian.html). VCA gives 7–12 lb overall — [VCA Persian](https://vcahospitals.com/know-your-pet/cat-breeds/persian). The Cat API gives 4–6 kg overall — [Cat API snapshot](https://web.archive.org/web/20251209033623/https://api.thecatapi.com/v1/breeds)
- Persian: the CFA standard gives no weight ranges — [CFA Persian](https://cfa.org/breed/persian/)
- Exotic: GCCF summary says "Size 7–14 lbs", with females typically 7–12 lb and males 12–14 lb — [GCCF Exotic Shorthair](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/exotic-shorthair/)
- Exotic: Hill's gives "Male: Large >12 lbs; Female: Medium 8–12 lbs" — [Hill's Exotic](https://www.hillspet.com/cat-breeds/exotic.html). VCA gives 9–12 lb — [VCA Exotic](https://vcahospitals.com/know-your-pet/cat-breeds/exotic-shorthair). The Cat API gives 3–6 kg — [Cat API snapshot](https://web.archive.org/web/20251209033623/https://api.thecatapi.com/v1/breeds)
- British Shorthair: GCCF gives males 9–17 lb (4.1–7.7 kg) and females 7–12 lb (3.2–5.4 kg), and notes that "Mature males tend to develop prominent jowls" — [GCCF British](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/british/)
- British Shorthair: CFA says "Males reach up to 17 pounds; females are notably smaller" — [CFA British Shorthair](https://cfa.org/breed/british-shorthair/)
- British Shorthair: Royal Canin UK gives males 6–9 kg and females 4–6 kg — [Royal Canin UK BSH](https://www.royalcanin.com/uk/cats/breeds/british-shorthair). VCA gives 6–12 lb (conflicts with CFA and GCCF) — [VCA BSH](https://vcahospitals.com/know-your-pet/cat-breeds/british-shorthair). The Cat API gives 5–9 kg — [Cat API snapshot](https://web.archive.org/web/20251209033623/https://api.thecatapi.com/v1/breeds)
- British Shorthair: the breed "takes up to five years to reach physical maturity" — [VCA BSH](https://vcahospitals.com/know-your-pet/cat-breeds/british-shorthair)

**Lifespans**
- Persian: VetCompass median longevity was 13.5 years (IQR 9.9–16.0). Females lived longer than males (14.0 vs 13.1 years) — [O'Neill et al. 2019](https://www.nature.com/articles/s41598-019-49317-4)
- Persian: life expectancy at age 0 was 10.93 years (95% CI 9.63–12.23; 80 deaths). For "British cats" (British Shorthair, British Blue and British Longhair) it was 9.58 years (95% CI 8.73–10.43; 194 deaths). For comparison, crossbreds reached 11.89, the overall population 11.74, Burmese 14.42 and Sphynx 6.68 — [Teng et al. 2024, JFMS](https://journals.sagepub.com/doi/full/10.1177/1098612X241234556) (full text via Europe PMC PMC11156239)
- An earlier VetCompass study (2009–2012 data) put the Persian's median lifespan in the 14.0–14.3-year range, alongside Burmese, Siamese and crossbreds. This is as quoted in the discussion section of Teng et al. 2024 — [Teng et al. 2024](https://journals.sagepub.com/doi/full/10.1177/1098612X241234556)
- Registry and owner-guide claims: Persian 14–16 years (GCCF), 15–20 years (VCA), 14–15 years (Cat API) and 8–11 years (Hill's, an outlier). Exotic 12–15 years (GCCF, VCA and Cat API agree; Hill's says 8–10). British Shorthair 14–20 years (GCCF), 15–20 years (VCA) and 12–17 years (Cat API) — [GCCF Persian](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/persian/); [GCCF Exotic](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/exotic-shorthair/); [GCCF British](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/british/); [VCA Persian](https://vcahospitals.com/know-your-pet/cat-breeds/persian); [VCA Exotic](https://vcahospitals.com/know-your-pet/cat-breeds/exotic-shorthair); [VCA BSH](https://vcahospitals.com/know-your-pet/cat-breeds/british-shorthair); [Hill's Persian](https://hillspet.com/cat-breeds/persian.html); [Hill's Exotic](https://www.hillspet.com/cat-breeds/exotic.html)
- British Shorthair (Australia, 2,540 cats): cats weighing under 3.3 kg in their first year had a median survival of 12.3 years (95% CI 11.7–13.1). Cats weighing 3.3 kg or more had 6.6 years — [Murphy et al. 2023, Front Vet Sci](https://doi.org/10.3389/fvets.2023.1241080)

**Origin, history and naming**
- Persian: "In 1626, Pietro della Valle, an Italian trader, returned from a trip to Persia with an impressive, heavily-coated longhaired cat". Persians were among the six foundation breeds when CFA started in 1906 — [CFA Persian](https://cfa.org/breed/persian/)
- Persian: "recent genetic research indicates that today's Persian is related to cats from Western Europe rather than the Near East". Persians were exhibited at the first cat show in 1871 — [GCCF Persian](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/persian/)
- Persian: originally called "Longhairs" in the US until the early 1960s and still called Longhair in Britain. Pointed Persians are called "Himalayan" in the US — [VCA Persian](https://vcahospitals.com/know-your-pet/cat-breeds/persian). VCA also claims hieroglyphic references "dating back to 1684 B.C." This is an unverified, likely spurious claim and was not used.
- Persian: Royal Canin says the chinchilla coat appeared in 1882 and the brachycephalic face "emerged" in 1942 — [Royal Canin UK Persian](https://www.royalcanin.com/uk/cats/breeds/persian). This is not corroborated by a registry or veterinary source, so it was not used.
- Exotic: West Coast Persian breeders crossed Persians with American Shorthairs in the 1950s. The hybrids "proved so popular that in 1966, CFA decided to establish them as a breed". CFA later dropped "Shorthair" from the name — [CFA Exotic](https://cfa.org/breed/exotic/). **Conflict:** VCA says the cross was made in the "early 1960s" and recognition came in 1967. VCA also says the proposed name was "Sterling", after the silver colour — [VCA Exotic](https://vcahospitals.com/know-your-pet/cat-breeds/exotic-shorthair)
- Exotic: GCCF recognised the breed in 1986 and granted Championship status in 1995. The first UK import was "CFA Gr Ch Purrfun My Main Man, a Black Smoke" — [GCCF Exotic](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/exotic-shorthair/)
- British Shorthair: "English Shorthair cats" were shown at the 1871 Crystal Palace show. Harrison Weir ("Father of the Cat Fancy") drew up the first standards. After WWII, breeders outcrossed to Russian Blue, Burmese, Chartreux and Persian. British Longhair was recognised in 2017 and gained Championship status in 2021 — [GCCF British](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/british/)
- British Shorthair: "Both World Wars wreaked havoc on the gene pool". Brynbuboo Little Monarch, a blue male, became the first GCCF Grand Champion in the 1950s. The breed is in CFA's top ten by registrations and is "particularly popular in Asia and Europe" — [CFA British Shorthair](https://cfa.org/breed/british-shorthair/)
- British Shorthair: CFA championship status came in 1980 — [VCA BSH](https://vcahospitals.com/know-your-pet/cat-breeds/british-shorthair)

**Registry recognition**
- FIFe lists EXO (Exotic) and PER (Persian) in Category 1, and BSH (British Shorthair) and BLH (British Longhair) in Category 3. A "Golden" colour variety has been preliminarily recognised in BLH/BSH since 01.10.2025 — [FIFe breeds](https://fifeweb.org/cats/breeds/)
- WCF publishes breed standards for Persian, Exotic Shorthair and British Shorthair. The PDFs returned HTTP 200 application/pdf on 2026-10-23 — [WCF PER](https://wcf.de/pdf-en/breed/PER_en_2022-01-25.pdf); [WCF EXO](https://wcf.de/pdf-en/breed/EXO_en_2022-01-25.pdf); [WCF BRI](https://wcf.de/pdf-en/breed/BRI_en_2023-07-16.pdf)
- World Cat Congress comparison tables list Persian and Exotic with "Recognition status: full" across its member organisations (ACF, CCC of A, CFA, FIFe, GCCF, NZCF, SACC, TICA, WCF) — [WCC Persian](https://worldcatcongress.org/wp/cat_breed_comp_per.php); [WCC Exotic](https://worldcatcongress.org/wp/cat_breed_comp_exo.php)
- The British Shorthair is "Accepted by both the Cat Fanciers Association and The International Cat Association" — [VCA BSH](https://vcahospitals.com/know-your-pet/cat-breeds/british-shorthair). VCA says the Exotic is "accepted in every major cat breed registry" — [VCA Exotic](https://vcahospitals.com/know-your-pet/cat-breeds/exotic-shorthair)
- GCCF has breed profiles for all three — [GCCF Persian](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/persian/); [GCCF Exotic](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/exotic-shorthair/); [GCCF British](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/british/). CFA has profiles for all three — [CFA Persian](https://cfa.org/breed/persian/); [CFA Exotic](https://cfa.org/breed/exotic/); [CFA BSH](https://cfa.org/breed/british-shorthair/)

**Images chosen (Wikimedia Commons; licences and direct URLs verified via the Commons API, and HEAD requests returned 200 image/jpeg)**
- Persian: [File:Persian-Cat-Kali-7-years-old.JPG](https://commons.wikimedia.org/wiki/File:Persian-Cat-Kali-7-years-old.JPG). 3264×1836, red Persian, author PersianDutchNetwork (photo by Mohammad-Reza Sabetghadam), CC BY-SA 4.0, in the category "Red Persian cats".
- Exotic: [File:Garfield_(8717284786)_(2013;_cropped_2025).jpg](https://commons.wikimedia.org/wiki/File:Garfield_(8717284786)_(2013;_cropped_2025).jpg). 3449×3448, red tabby Exotic close-up, author Melv_L - MACASR (Flickr), CC BY-SA 2.0, listed in the Commons category "Red tabby Exotic Shorthair cats". The file description is just "Garfield", so the breed comes from the category placement. The file is about 8 MB, so the site should use a Commons thumbnail.
- British Shorthair: [File:Mystica_from_British_Empire_Cattery.jpg](https://commons.wikimedia.org/wiki/File:Mystica_from_British_Empire_Cattery.jpg). 2482×2431, blue British Shorthair female aged 7 months on a white studio background, author BritishEmpire (photo by owner Tamila Aspen), CC BY-SA 3.0. This is the current lead image of the English Wikipedia article.

### Inferences
- **JSON weight choices:**
  - Persian: female [3, 5], male [5, 7], from Royal Canin. GCCF's "females 6–12 lb, males >12 lb" broadly agrees. The VetCompass means suggest many pet Persians in clinics are below these guide ranges.
  - Exotic: female [3.2, 5.4], male [5.4, 6.4], converted from GCCF's 7–12 lb and 12–14 lb.
  - British Shorthair: female [3.2, 5.4], male [4.1, 7.7], from GCCF.
- **JSON lifespan choices:**
  - Persian [10, 16]: the VetCompass interquartile range of 9.9–16.0 rounded. This is measured data and sits between the registry claims and the Teng life expectancy.
  - Exotic [12, 15]: GCCF, VCA and the Cat API all agree.
  - British Shorthair [12, 17]: the Cat API figure. GCCF and VCA claim 14–20 or 15–20, but Teng's 9.58-year life expectancy at age 0 makes 20 look optimistic, so the more conservative range was used.
- Size was set to "medium" for all three. GCCF and VCA call the British Shorthair "medium to large" and the Persian "medium to large", and Hill's calls the Persian and Exotic medium.
- Registry recognition: all three are recognised by CFA, TICA, FIFe, GCCF and WCF. TICA was confirmed only through secondary sources, because tica.org returned 403 to every fetch.

### Gaps
- tica.org returned 403 to every fetch, so I could not read TICA's own breed pages or recognition dates. The TICA recognition dates in search snippets (Exotic 1979, British Shorthair championship June 1979) trace back to Wikipedia and are unverified, so they were not used in the JSON.
- No registry gives sex-specific Persian weights with both lower and upper bounds. The JSON range relies on Royal Canin, a pet-food company.
- There is no VetCompass or peer-reviewed breed-specific longevity figure for the Exotic Shorthair. The O'Neill 2015 per-breed median longevities (PMC10816413) could not be read because of a CAPTCHA.
- The UC Davis VGL PKD page returned 403, so the PKD1 test details come from Lyons et al. 2004 and the GCCF policy pages instead.

## Q2. What temperament traits do reputable sources consistently report? (also covers rating derivation)

### Takeaway
All three breeds are consistently described as calm, quiet and affectionate, and as preferring to keep "four paws on the ground". The Persian and Exotic are gentle lap cats that like calm homes and routine. The British Shorthair is patient, tolerant and somewhat independent, follows its people around, and dislikes being carried.

### Cited Findings
- Persian: "sweet, affectionate, quiet", "playful yet placid", "easygoing and mellow" and prefers "to keep their feet on the ground at all times". CFA calls it "compatible with children and other pets" — [CFA Persian](https://cfa.org/breed/persian/)
- Persian: "sweet, gentle nature and blends easily into most households". Persians communicate mainly with their eyes and prefer "a calm atmosphere and gentle handling" — [GCCF Persian](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/persian/)
- Persian: "Not fond of surprises, especially noisy houseguests or unruly children" and "Not chatty… melodic chirps". VCA adds that blue-eyed Persians "are prone to deafness" — [VCA Persian](https://vcahospitals.com/know-your-pet/cat-breeds/persian)
- Persian (Cat API): temperament "Affectionate, loyal, Sedate, Quiet". The description says "Great with families and children", yet child_friendly is scored 2 — [Cat API snapshot](https://web.archive.org/web/20251209033623/https://api.thecatapi.com/v1/breeds)
- Exotic: "Quiet, loyal companions… devoted but not intrusive". Exotics "speak to you with their lovely large eyes… meows will be rare" — [CFA Exotic](https://cfa.org/breed/exotic/)
- Exotic: "ideal pets for owners who want a gentle affectionate lap cat" and "get on well with children and other pets" — [GCCF Exotic](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/exotic-shorthair/)
- Exotic: "Mellow and calm temperament, best suited for quiet households and apartment dwellings". Males are "more interactive with people than the more aloof females", and the breed "remains playful well into its adult years" — [VCA Exotic](https://vcahospitals.com/know-your-pet/cat-breeds/exotic-shorthair)
- Exotic: "a placid cat that exhibits bursts of kitten-like activity" — [Hill's Exotic](https://www.hillspet.com/cat-breeds/exotic.html). Royal Canin says it is "unlikely to join in boisterous games" with children — [Royal Canin UK Exotic](https://www.royalcanin.com/uk/cats/breeds/exotic-shorthair)
- British Shorthair: "Calm and quiet; enjoy people". "They learn your daily routine, follow from room to room… protest with a gentle touch of a paw". They "adjust well to other pets and children, though they dislike being carried" and rarely climb onto counters — [CFA BSH](https://cfa.org/breed/british-shorthair/)
- British Shorthair: "Patient, tolerant and a bit lazy" and "Not a talkative breed". They form strong bonds and are tolerant of other pets "such as dogs and rabbits" (the rabbits part is from a search snippet of the same page) — [GCCF British](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/british/)
- British Shorthair: "Well-behaved and easy going, ideally suited for apartment living". VCA also notes they like laps but leave because the thick coat plus body heat makes them overheat — [VCA BSH](https://vcahospitals.com/know-your-pet/cat-breeds/british-shorthair)
- British Shorthair (Cat API): "doesn't need hourly attention… plays well by herself… a good companion for single people" — [Cat API snapshot](https://web.archive.org/web/20251209033623/https://api.thecatapi.com/v1/breeds)

**Cat API baseline values (snapshot 2025-12-09) and final JSON ratings**

| Rating | Persian (Cat API → JSON) | Exotic (Cat API → JSON) | British Shorthair (Cat API → JSON) |
|---|---|---|---|
| energy | 1 → 1 | 3 → **2** | 2 → 2 |
| affection | 5 → 5 | 5 → 5 | 4 → 4 |
| vocal | 1 → 1 | 1 → 1 | 1 → 1 |
| intelligence | 3 → 3 | 3 → 3 | 3 → 3 |
| grooming | 5 → 5 | 2 → **3** | 2 → 2 |
| shedding | 4 → 4 | 2 → **3** | 4 → 4 |
| kidFriendly | 2 → **3** | 3 → 3 | 4 → 4 |
| petFriendly (dog_friendly) | 2 → **3** | 3 → 3 | 5 → 5 |
| socialNeeds | 4 → 4 | 4 → 4 | 3 → 3 |

Reasons for each ±1 adjustment:
- **Persian kidFriendly 2→3 and petFriendly 2→3:** CFA explicitly calls Persians "compatible with children and other pets" ([CFA Persian](https://cfa.org/breed/persian/)). The Cat API's own description says "Great with families and children". VCA's caution about "unruly children" ([VCA Persian](https://vcahospitals.com/know-your-pet/cat-breeds/persian)) is why I did not go higher.
- **Exotic energy 3→2:** CFA ("easy going"), VCA ("Mellow and calm") and Hill's ("placid") all describe a low-energy cat. A 3 is inconsistent with the Persian's 1, given that CFA says the Exotic has the same personality.
- **Exotic grooming 2→3:** CFA says Exotics "do require regular bathing and grooming", GCCF says "weekly grooming" plus regular eye cleaning, and Hill's says daily grooming ([CFA Exotic](https://cfa.org/breed/exotic/); [GCCF Exotic](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/exotic-shorthair/); [Hill's Exotic](https://www.hillspet.com/cat-breeds/exotic.html)).
- **Exotic shedding 2→3:** CFA says "Exotics are heavier (mostly seasonal) shedders" and GCCF says "they can shed a large amount of old undercoat".
- **British Shorthair:** no adjustments. The sources are consistent with the Cat API values (weekly combing, notable seasonal shedding, good with children and dogs, self-entertaining).

### Inferences
- A brochure can safely describe all three as quiet indoor companions that suit apartments and condos. The Exotic sits between the other two: Persian temperament, but slightly more playful than the Persian according to VCA and Hill's.

### Gaps
- None of the sources quantify temperament (no behavioural studies were found for these breeds). The trait descriptions are registry and breed-guide characterisations, not measured data.

## Q3. Which health conditions are documented, and what screening exists?

### Takeaway
- **Persian and Exotic (same head and body type):** the main risks are PKD (autosomal dominant PKD1 variant, with a DNA test), problems caused by the flat face (eyes and tear overflow, airway, dental malalignment and periodontal disease), coat and skin disorders, and PRA (DNA test).
- **British Shorthair:** the main documented risks are HCM (8.5% prevalence in a Danish screening cohort, mostly young males; no DNA test, so echocardiography is used), PKD (DNA test), blood type B and neonatal isoerythrolysis risk (blood typing), obesity, and ALPS (DNA test; GCCF requires it for imports since 1 March 2025).

### Cited Findings
**Persian**
- VetCompass, 3,235 Persians: the most common disorders were haircoat disorder (12.7%), periodontal disease (11.3%), overgrown nails (7.2%) and ocular discharge (5.8%). Grouped by category: dermatological 17.9%, ophthalmological 15.3% and dental 12.3% — [O'Neill et al. 2019](https://www.nature.com/articles/s41598-019-49317-4)
- VetCompass causes of death (n = 435): renal disease 23.4%, neoplasia 8.5% and mass-associated disorder 8.0% — [O'Neill et al. 2019](https://www.nature.com/articles/s41598-019-49317-4)
- FECAVA summarises the UK study as "2/3 of Persian cats in the study have at least one health issue". It says dental and eye problems are "thought to result from the brachycephalic… shaped heads" — [FECAVA](https://www.fecava.org/brachycephalic-issues-persian-cats/)
- PKD: feline PKD is autosomal dominant. A C>A transversion in exon 29 of PKD1 creates a stop codon. "PKD affects approximately 38% of Persian cats worldwide, which is approximately 6% of cats". No homozygous cats have been found — [Lyons et al. 2004, JASN](https://doi.org/10.1097/01.ASN.0000141776.38527.BB). These are 2004 figures; prevalence has since fallen with testing (see Ukawa below).
- GCCF's Persian registration policy "includes mandatory testing for PKD for breeding cats registered on the Active Register from 1st January 2016". "PRA is also present in the breed, but there is a DNA test". The facial conformation "may make individuals prone to breathing difficulties, skin and eye problems" — [GCCF Persian](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/persian/)
- CFA says PKD was controlled through "genetic testing and spaying/neutering of affected cats". It also says that "Some years ago" refined features gave "smaller-than-average nostrils, creating breathing problems", and breeders removed those cats from breeding — [CFA Persian](https://cfa.org/breed/persian/)
- In Japan (110,325 insured cats; 61,968 genetically tested cats across 14 breeds), the PKD1 carrier frequency fell 42.6% between 2019 and 2022. Heterozygous Persians fell 38.8%. **No significant reduction was seen in British Shorthairs.** 77.8% of cats with cystic kidneys carried the conventional PKD1 variant, and other variants were also implicated — [Ukawa et al. 2026, BMC Genomics](https://doi.org/10.1186/s12864-026-13048-4)
- Persian CT study (69 Persians and 10 domestic shorthairs): increasing brachycephaly grade was associated with more exposed (extra-orbital) eyeballs, a lower naso-osseous aperture, and more upper premolar displacement. Some Persians' values overlapped with those of domestic shorthairs — [Sieslack et al. 2021, PLoS ONE](https://doi.org/10.1371/journal.pone.0254420)
- In more brachycephalic cats the nasolacrimal duct takes a right- or acute-angled course and ascends above the lacrimal foramen. This explains the tear overflow (epiphora) — [Breit et al. 2003](https://doi.org/10.1046/j.1439-0264.2003.00464.x)
- "The large eyes may stain and require cleaning with a soft, damp cloth" — [CFA Persian](https://cfa.org/breed/persian/)

**Exotic**
- GCCF: "All breeding Exotics should be tested for PKD and PRA(pd)". The breed is brachycephalic, so "care should also be taken that this aspect is not taken to extremes" — [GCCF Exotic](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/exotic-shorthair/)
- GCCF registration rule: Exotics registered from 1 January 2016 may go on the Active Register only if they are PKD-clear by DNA test, or are from parents deemed clear through tested pedigree lines. Imports must test negative for PRA, and white Exotics need a BAER hearing certificate — [WCC Exotic comparison](https://worldcatcongress.org/wp/cat_breed_comp_exo.php)
- "Due to its flat face, the Exotic is prone to overflowing tears that lead to staining under the eyes" — [VCA Exotic](https://vcahospitals.com/know-your-pet/cat-breeds/exotic-shorthair)
- FIFe requires all breeding to be tested for any disease affecting the breed where a test is available. The WCC Persian page says "It is strongly recommended that all cats used for breeding should be gene tested for PKD" — [WCC Exotic](https://worldcatcongress.org/wp/cat_breed_comp_exo.php); [WCC Persian](https://worldcatcongress.org/wp/cat_breed_comp_per.php)

**British Shorthair**
- HCM: 329 British Shorthairs were screened by echocardiography in Denmark. 8.5% were HCM-positive and 4.3% equivocal. Males were affected far more often than females (20.4% vs 2.1%; OR 7.89). The median age at diagnosis was 2.7 years. The authors "strongly recommend echocardiographic screening in this breed" — [Granström et al. 2011, JVIM](https://doi.org/10.1111/j.1939-1676.2011.0751.x)
- GCCF: HCM "Can be a problem in the breed. There are no DNA tests yet available for HCM". PKD is "Now under control thanks to the common use of available DNA tests". ALPS: "With effect from 1st March 2025 all imports… must be accompanied by evidence of a valid negative ALPS test". The breed has "a slow metabolism" — [GCCF British](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/british/)
- ALPS (autoimmune lymphoproliferative syndrome) involves defective FAS-mediated lymphocyte apoptosis, causing lymph node and spleen enlargement and autoimmune cytopenias. A 2026 paper notes it has been "documented in humans and British Shorthair cats" — [Tong et al. 2026, JVIM](https://doi.org/10.1093/jvimsj/aalag011)
- Blood type: "many British Shorthair lines carry blood type B, while type A predominates". Breeders combining both types need mentoring — [CFA BSH](https://cfa.org/breed/british-shorthair/). AB-system mismatches cause transfusion reactions and neonatal isoerythrolysis. Breeders need genotypes to predict offspring blood types, and breed-specific b and c variants were found in British Shorthairs — [Kehl et al. 2019, Anim Genet](https://doi.org/10.1111/age.12778)
- Obesity: of 2,540 Australian British Shorthairs (2008–2017), 48% were overweight and 7% obese — [Murphy et al. 2023](https://doi.org/10.3389/fvets.2023.1241080)
- Gingivitis tendency; brush teeth at least weekly — [Royal Canin UK BSH](https://www.royalcanin.com/uk/cats/breeds/british-shorthair). This comes from a pet-food company and was not put in the JSON health list.
- CFA's British Shorthair page says "There are no breed-specific health issues of concern". This conflicts with the HCM data above and GCCF's own statement — [CFA BSH](https://cfa.org/breed/british-shorthair/)

### Inferences
- The UK VetCompass Persian disorder profile is the best evidence available for the Exotic as well, since CFA and GCCF describe the same head and body type. Exotic-specific prevalence data were not found.
- PKD testing is effective (Persian carriers fell 38.8% in Japan), but the Japanese data suggest British Shorthair buyers should still demand PKD1 results.

### Gaps
- I found no peer-reviewed prevalence figures specific to the Exotic Shorthair, and no published Exotic VetCompass study.
- No quantitative feline BOAS prevalence study was found. The cat airway evidence is the Farnworth 2016 owner survey and the Sieslack 2021 CT study.
- I could not reach the UC Davis VGL pages (403) to confirm the current names of the PRA(pd) and ALPS tests.
- The British Shorthair blood type B frequency was not quantified from an accessible source. Kehl 2019 and Knottenbelt-era UK studies exist, but their full texts were not available.

## Q4. What brachycephaly welfare concerns have veterinary bodies raised, and how should a responsible buyer choose a less extreme face type?

### Takeaway
UK veterinary bodies (BVA with International Cat Care) and VetCompass authors say extreme flat faces in Persians and Exotics cause eye, breathing, dental and skin problems. They call for breed standards to favour less brachycephalic "doll-face" or "classic" types. Peer-reviewed data show that the problems worsen as the face gets flatter, and some Persians fall within the normal range. Buyers should therefore pick kittens with a visible nose, open nostrils, quiet breathing and no constant tearing, from parents tested for PKD and PRA.

### Cited Findings
- BVA Voice of the Veterinary Profession survey: 86% of 671 vets had treated conformation-related problems in brachycephalic cats "such as Persians and Exotic Shorthairs". The treatments were for eye problems (69%), breathing (60%), dental (45%) and skin (32%). On average, 28% of the flat-faced cats vets see needed or would benefit from treatment. Only about a quarter of owners knew the potential health issues beforehand, and one in twenty knew the extra costs — [VetSurgeon/BVA news](https://www.vetsurgeon.org/b/veterinary-news/posts/bva-highlights-welfare-issues-for-brachycephalic-cats) (figures from search snippets; the page returned 403 to direct fetch)
- International Cat Care teamed up with BVA to raise awareness of very flat-faced breeds. It believes breed standards should change "so that no cat should suffer as a result of conforming to human-imposed ideals". It lists jaw deformities causing dental and eating problems, small nostrils, an over-long soft palate, and tear ducts that cannot drain, causing constant tearing — [iCatCare/BVA joint statement](https://icatcare.org/?p=1826) (content from search snippets; the page body loads via script and could not be read directly)
- VetCompass authors do not advocate breed bans. They advocate updating breed standards to favour less brachycephalic types (doll-faced or classic Persians) over extreme ones (peke-faced or ultra-type). They warn that legislation may follow if meaningful change does not happen within five years — [O'Neill et al. 2019](https://www.nature.com/articles/s41598-019-49317-4)
- In 1,000 owner questionnaires, a shorter muzzle ratio and a higher nose position (nose leather closer to the eyes) were significantly associated with worse respiratory scores (r = −0.56). Respiratory score was also associated with tear staining and a sedentary lifestyle — [Farnworth et al. 2016, PLoS ONE](https://doi.org/10.1371/journal.pone.0161777)
- In Persians, a higher brachycephaly grade meant more exposed eyes and more dental malalignment, and some Persians overlapped with domestic shorthairs. A less extreme Persian is therefore physically achievable — [Sieslack et al. 2021](https://doi.org/10.1371/journal.pone.0254420)
- The CFA standard requires nostrils "sufficiently open to allow cat to breathe without restriction" — [CFA Persian](https://cfa.org/breed/persian/). GCCF warns the brachycephalic aspect of the Exotic should "not [be] taken to extremes" — [GCCF Exotic](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/exotic-shorthair/)
- FECAVA says vets should "be advocates of healthy breeding at all times, for cats as well" — [FECAVA](https://www.fecava.org/brachycephalic-issues-persian-cats/)

### Inferences
- **Buyer checklist (derived from the cited findings, written into the JSON welfareNote):**
  - Choose a kitten whose nose leather sits clearly below the eyes, with a visible nose bridge (Farnworth: nose position ratio).
  - Look for wide-open nostrils (CFA standard) and quiet breathing at rest and during sleep (Farnworth respiratory score).
  - Avoid kittens with constant tear overflow (Breit; Farnworth tear-staining association).
  - Ask for DNA certificates for PKD1 and PRA for both parents (GCCF).
  - Prefer breeders who describe "doll-face" or "traditional/classic" type over "peke-face" or "ultra" (O'Neill 2019).
- The British Shorthair has a round face but a short, straight nose. The WCF standard describes a "short, broad and straight nose" rather than a flat face ([WCF BRI](https://wcf.de/pdf-en/breed/BRI_en_2023-07-16.pdf), per search snippet), and the BVA brachycephalic concerns are aimed at Persians and Exotics. The British Shorthair JSON welfareNote therefore focuses on HCM and PKD screening instead.

### Gaps
- I could not pin down the BVA survey date. Snippets say "May/June last year", which probably means 2018, but this is unverified.
- I could not load the full International Cat Care brachycephaly advice page (the content renders via script). Its buyer-specific advice is therefore paraphrased from search snippets only.
- No objective, validated "face score" for buyers was found. The Farnworth photo ratios are a research tool, not a consumer standard.
- Legal context (e.g., German §11b "Qualzucht" or Dutch breeding rules) was not researched in depth.

## Q5. What are the grooming, exercise, diet and environment needs, including in tropical heat?

### Takeaway
The Persian needs daily combing and daily eye-wiping. The Exotic needs weekly combing (more during heavy seasonal sheds) plus daily face care. The British Shorthair needs weekly combing. All three are low-activity indoor cats that gain weight easily, so measured feeding and daily play matter. For Thailand, the key point is that flat-faced and long-haired cats are at much higher heatstroke risk (PDSA: "even on seemingly cool days"). Persians and Exotics therefore need air-conditioned or cool rooms, shade and constant water. The British Shorthair's dense coat also makes it overheat easily.

### Cited Findings
- Persian grooming: "Owning a Persian calls for a serious commitment to regular grooming, and also to regular vacuuming!" Use a steel or Teflon comb with long teeth, give occasional baths after thorough combing, and note that "Many owners rely on professional groomers" — [CFA Persian](https://cfa.org/breed/persian/)
- Persian grooming: "daily combing with a metal comb to prevent tangles". "Eyes should be wiped daily" — [GCCF Persian](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/persian/). VCA recommends daily combing, monthly baths introduced from kittenhood, and drying and brushing thoroughly after bathing — [VCA Persian](https://vcahospitals.com/know-your-pet/cat-breeds/persian)
- Persian coat: VetCompass authors note that "long and dense coats" can make Persian coats "ungroomable"; haircoat disorder is the most common diagnosis (12.7%) — [O'Neill et al. 2019](https://www.nature.com/articles/s41598-019-49317-4)
- Persian diet: "Prone to obesity so measure food portions and control caloric intake" — [VCA Persian](https://vcahospitals.com/know-your-pet/cat-breeds/persian). Food "size, shape, and texture" should suit the Persian's brachycephalic jaw — [Royal Canin UK Persian](https://www.royalcanin.com/uk/cats/breeds/persian)
- Exotic grooming: "heavier (mostly seasonal) shedders… require regular bathing and grooming – but the time commitment is not burdensome". Comb weekly and bathe during heavy sheds — [CFA Exotic](https://cfa.org/breed/exotic/). GCCF says weekly grooming and eyes "need regular cleaning" — [GCCF Exotic](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/exotic-shorthair/). VCA says "weekly brushing should suffice" and calls the breed the "Lazy Man's Persian" — [VCA Exotic](https://vcahospitals.com/know-your-pet/cat-breeds/exotic-shorthair)
- Exotic diet: "needs to have her nutrition controlled… not known for a high degree of exercise" — [Hill's Exotic](https://www.hillspet.com/cat-breeds/exotic.html)
- British Shorthair grooming: "A quick weekly combing or brushing", plus routine nail trimming and ear cleaning — [CFA BSH](https://cfa.org/breed/british-shorthair/). VCA recommends combing at least weekly with metal or curry combs, especially during seasonal shedding — [VCA BSH](https://vcahospitals.com/know-your-pet/cat-breeds/british-shorthair)
- British Shorthair diet: "measure food portions to prevent this breed from becoming overweight" — [VCA BSH](https://vcahospitals.com/know-your-pet/cat-breeds/british-shorthair). Kittens "should be fed kitten foods for at least the first year" — [GCCF British](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/british/). Royal Canin recommends accurately weighed portions from a young age, minimal treats and regular play — [Royal Canin UK BSH](https://www.royalcanin.com/uk/cats/breeds/british-shorthair)
- British Shorthair environment: "Best suited for indoor living" and "ideally suited for apartment living". Their "thick coats combined with your body heat makes them get overheated" — [VCA BSH](https://vcahospitals.com/know-your-pet/cat-breeds/british-shorthair)
- Heat: "Obese, long-haired, old, young and brachycephalic/flat-faced cats (such as Persians) are most at risk of developing heatstroke". "Cats get rid of significant amounts of body heat through their nose… Brachycephalic cats… struggle to release heat this way… much higher risk of heatstroke, even on seemingly cool days". Above 40°C body temperature, cats are at risk of heatstroke — [PDSA](https://www.pdsa.org.uk/pet-help-and-advice/pet-health-hub/conditions/heatstroke-in-cats)
- Heat: "Flat-faced cats (such as Persians)… are at greater risk". Cats need areas of varying temperature, shade and water, and must not be trapped in hot spaces — [Cats Protection](https://cats.org.uk/help-and-advice/health/heatstroke-in-cats)
- Respiratory score is associated with a sedentary lifestyle, so flat-faced cats may exercise less — [Farnworth et al. 2016](https://doi.org/10.1371/journal.pone.0161777)

### Inferences
- In Thailand's climate, all three breeds are best kept indoors with air-conditioning or reliably cool rooms during hot months. This matters most for Persians (long coat plus flat face, both PDSA risk factors) and Exotics (flat face). The British Shorthair is not flat-faced, but its dense coat and tendency to obesity (also a PDSA risk factor) argue for cool resting spots too.
- Play sessions for Persians and Exotics should be gentle and timed for cooler parts of the day, because their airway limits how well they tolerate exertion and heat.

### Gaps
- No peer-reviewed study of these breeds in tropical climates (Thailand or Southeast Asia) was found.
- I found no veterinary source to cite on whether clipping a Persian in hot climates helps with heat, so the JSON avoids recommending it. The JSON only mentions professional groomers for matting, per CFA.
- Thai-specific popularity statistics and Thai veterinary association guidance were not researched.
