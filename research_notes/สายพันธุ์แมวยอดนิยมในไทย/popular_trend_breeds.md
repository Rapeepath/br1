# Popular "trend" breeds with Thai buyers: Scottish Fold, Munchkin, American Shorthair

Research date: 23 Oct 2026. Companion JSON files (website data): `data/scottish-fold.json`, `data/munchkin.json`, `data/american-shorthair.json`.

Source note: The Cat API (`api.thecatapi.com/v1/breeds`) now returns HTTP 403 "Authentication required" without a key. Baseline ratings below come from the Wayback Machine snapshot of 9 Dec 2025 (67 breeds) — [Cat API archived 2025-12-09](https://web.archive.org/web/20251209033623/https://api.thecatapi.com/v1/breeds). A copy is saved in the shared scratchpad as `catapi_wayback.json` so other researchers can use the same baseline.

## Q1. Verified weight ranges (male/female) and lifespan ranges

### Takeaway
No single authority gives sex-specific weights for all three breeds, and sources disagree by 1–3 kg. The JSON uses the most specific source for each breed and flags conflicts: Scottish Fold F 2.7–4 / M 4–6 kg, 11–14 yrs. Munchkin F 2.3–3.2 / M 3.2–4.5 kg (TICA), 12–15 yrs. American Shorthair F 2.5–5.5 / M 5–7 kg, 15–20 yrs.

### Cited Findings
**Scottish Fold**
- TICA: "Medium-sized cat, 7–10 pounds" (≈3.2–4.5 kg), no split by sex. Life expectancy "11–14+ years" — [TICA Scottish Fold](https://tica.org/breed/scottish-fold/)
- VCA: weight 6–13 lb (≈2.7–5.9 kg), lifespan 14–16 years — [VCA Scottish Fold](https://vcahospitals.com/know-your-pet/cat-breeds/scottish-fold)
- PetMD: "up to 13 pounds", height 8–10 in. No lifespan given — [PetMD Scottish Fold](https://www.petmd.com/cat/breeds/scottish-fold)
- Wikipedia: males 4–6 kg (9–13 lb), females 2.7–4 kg (6–9 lb) — [Wikipedia Scottish Fold](https://en.wikipedia.org/wiki/Scottish_Fold)
- Cat API: 2–5 kg, life span 11–14 — [Cat API archived](https://web.archive.org/web/20251209033623/https://api.thecatapi.com/v1/breeds)
- CFA describes the breed as medium and "round" but gives no weights — [CFA Scottish Fold](https://cfa.org/breed/scottish-fold/)

**Munchkin**
- TICA: adult females 5–7 lb (≈2.3–3.2 kg), adult males 7–10 lb (≈3.2–4.5 kg). Life expectancy "15–18+ years". Elsewhere on the page: "small to medium sized cat… weigh between 5 and 9 pounds". "Munchkins do not remain kitten-sized… body size is considered average" — [TICA Munchkin](https://tica.org/breed/munchkin/)
- PetMD: 6–9 lb, lifespan around 12–15 years, legs about 3 inches shorter than a typical cat's — [PetMD Munchkin](https://www.petmd.com/cat/breeds/munchkin)
- Wikipedia: males 6–9 lb, females 4–8 lb — [Wikipedia Munchkin cat](https://en.wikipedia.org/wiki/Munchkin_cat)
- Cat API: 2–4 kg, life span 10–15 — [Cat API archived](https://web.archive.org/web/20251209033623/https://api.thecatapi.com/v1/breeds)

**American Shorthair**
- VCA: 8–12 lb (≈3.6–5.4 kg), lifespan 15–20 years — [VCA American Shorthair](https://vcahospitals.com/know-your-pet/cat-breeds/american-shorthair)
- PetMD: 6–15 lb with males heavier, lifespan 15–20 years — [PetMD American Shorthair](https://www.petmd.com/cat/breeds/american-shorthair)
- Wikipedia: males 5–7 kg (11–15 lb), females 2.5–5.5 kg (6–12 lb) — [Wikipedia American Shorthair](https://en.wikipedia.org/wiki/American_Shorthair)
- TICA: "Medium-sized cat with an athletic build. Males tend to be larger than females" (no numbers). "Americans do not really mature until they are around three or four years old" — [TICA American Shorthair](https://tica.org/breed/american-shorthair/)
- CFA: "medium to large", no weights — [CFA American Shorthair](https://cfa.org/breed/american-shorthair/)
- Cat API: 4–7 kg, life span 15–17 — [Cat API archived](https://web.archive.org/web/20251209033623/https://api.thecatapi.com/v1/breeds)

**Image provenance for the JSON (all checked by Commons API and file page; each upload URL returned image/jpeg)**
- Scottish Fold: "Adult Scottish Fold.jpg", 2592×2592, a 15-month-old lilac male with folded ears visible. Mihai Matei, CC BY-SA 3.0 — [Commons file page](https://commons.wikimedia.org/wiki/File:Adult_Scottish_Fold.jpg)
- Munchkin: "Munchkin cat 2 (cropped).jpg", 3419×2888, a red-and-white shorthair standing with short legs visible. Tasy Hong (via Pixabay), CC0 — [Commons file page](https://commons.wikimedia.org/wiki/File:Munchkin_cat_2_(cropped).jpg)
- American Shorthair: "American shorthair blotched tabby.jpg", 2560×1920, a classic silver tabby named "Nana". Tomo, CC BY 2.0 — [Commons file page](https://commons.wikimedia.org/wiki/File:American_shorthair_blotched_tabby.jpg)
- The current English Wikipedia infobox images for all three breeds are narrower than 800 px (734, 450 and 567 px), so they were not used — [Wikipedia pageimages API](https://en.wikipedia.org/w/api.php?action=query&titles=Scottish_Fold|Munchkin_cat|American_Shorthair&prop=pageimages&piprop=name|original&format=json)

### Inferences
- JSON choices:
  - Scottish Fold uses Wikipedia's sex split (F 2.7–4, M 4–6 kg), which fits VCA's 6–13 lb total. Lifespan [11, 14] follows TICA and Cat API. VCA's 14–16 is the outlier.
  - Munchkin uses TICA's sex split, since TICA is the only major registry that recognizes the breed. Lifespan [12, 15] follows PetMD (a veterinary source). TICA's "15–18+" looks optimistic and comes from a breed-promoting registry.
  - American Shorthair uses Wikipedia's sex split. Together it matches PetMD's 6–15 lb. Lifespan [15, 20] is from VCA and PetMD.
- Size class: Scottish Fold "medium", Munchkin "small" (by weight; TICA says small-to-medium), American Shorthair "medium" (TICA stresses "medium"; CFA says medium-to-large).

### Gaps
- No registry (CFA, TICA, FIFe, GCCF, WCF) publishes sex-specific weights for Scottish Fold or American Shorthair. The sex splits rest on Wikipedia, which aggregates other sources.
- I found no peer-reviewed lifespan data (for example VetCompass longevity tables) for any of the three breeds. All lifespan figures are registry or vet-advice estimates.

## Q2. Temperament traits consistently reported by reputable sources

### Takeaway
- **Scottish Fold:** quiet, gentle, people-oriented but not demanding, and a bit less active than average.
- **Munchkin:** very playful, curious, outgoing and good with children and pets.
- **American Shorthair:** even-tempered, adaptable, affectionate but independent, and quiet.

### Cited Findings
**Scottish Fold**
- CFA: "comfortable, charming homebodies who enjoy but do not crave human interaction". "Quiet but not placid". They "will follow you around the house engaging in quiet, polite conversation, but will rarely get in the way" — [CFA Scottish Fold](https://cfa.org/breed/scottish-fold/)
- TICA: "loyal… Intelligent and inquisitive, but a little less active than other breeds". Good with children and other pets. "not as energetic as other breeds and therefore need to be engaged on a regular basis" — [TICA Scottish Fold](https://tica.org/breed/scottish-fold/)
- VCA: affectionate lap companion with a "sweet temperament and quiet, soft voice". Dislikes being alone. Good with children and dogs — [VCA Scottish Fold](https://vcahospitals.com/know-your-pet/cat-breeds/scottish-fold)
- PetMD: affectionate and moderately active. Enjoys wand toys but is "not highly energetic" — [PetMD Scottish Fold](https://www.petmd.com/cat/breeds/scottish-fold)

**Munchkin**
- TICA: "extremely playful and love to run, chase and play with toys". "love company including children, dogs and other pets". "extremely curious". "self-assured". "outgoing, intelligent, and respond well to being handled" — [TICA Munchkin](https://tica.org/breed/munchkin/)
- PetMD: "playful and kitten-like the majority of their lives". "highly sociable, playful, and intelligent", with dog-like, attention-seeking behavior. Needs companionship — [PetMD Munchkin](https://www.petmd.com/cat/breeds/munchkin)

**American Shorthair**
- TICA: "good-natured, easy-going… very tolerant of children… playful even into old age… enjoy the company of their people but retain their independence… the non-demanding American keeps itself entertained". Suits apartments, seniors and families — [TICA American Shorthair](https://tica.org/breed/american-shorthair/)
- VCA: even-tempered, intelligent, "Lovable but not clingy". Prefers following people to being held. Makes "minimal vocalizations" — [VCA American Shorthair](https://vcahospitals.com/know-your-pet/cat-breeds/american-shorthair)
- CFA: "even temperament", affectionate and independent, "easily trainable", known for a "silent meow" — [CFA American Shorthair](https://cfa.org/breed/american-shorthair/)
- PetMD: "playful, laid-back, and social". Gets along with children, dogs and other pets. Suits first-time owners — [PetMD American Shorthair](https://www.petmd.com/cat/breeds/american-shorthair)

**Cat API baseline values (archived 9 Dec 2025)** — [Cat API archived](https://web.archive.org/web/20251209033623/https://api.thecatapi.com/v1/breeds)

| Breed (Cat API id) | energy | affection | vocal | intelligence | grooming | shedding | child | dog | social |
|---|---|---|---|---|---|---|---|---|---|
| Scottish Fold (sfol) | 3 | 5 | 1 | 3 | 1 | 3 | 4 | 5 | 3 |
| Munchkin (munc) | 4 | 5 | 3 | 5 | 2 | 3 | 4 | 5 | 5 |
| American Shorthair (asho) | 3 | 5 | 3 | 3 | 1 | 3 | 4 | 5 | 4 |

### Inferences
**Rating adjustments used in the JSON (±1 only, with reasons)**
- Scottish Fold:
  - energy 3→2: TICA says "a little less active than other breeds… not as energetic", and PetMD says "not highly energetic".
  - grooming 1→2: VCA says weekly combing for shorthairs and 3–4 times a week for longhairs, and PetMD says brushing at least a couple of times a week. Cats with sore joints may also groom themselves poorly.
  - All other values unchanged. Social needs stays at 3 because CFA ("enjoy but do not crave") and VCA ("dislike solitude") conflict.
- Munchkin: no changes. TICA's description (very playful, sociable, curious, combed once a week for shorthairs and twice for longhairs) fits the Cat API values.
- American Shorthair:
  - affection 5→4: VCA says "Lovable but not clingy", and TICA says they "retain their independence".
  - vocal 3→2: VCA says "minimal vocalizations", and CFA mentions a "silent meow".
  - social needs 4→3: TICA calls them "non-demanding" and says they keep themselves entertained.
  - grooming 1→2: CFA recommends daily brushing, while VCA and TICA say weekly. Even the minimum is more than "very low", and the same rule was applied to the Scottish Fold.
- Final JSON ratings:
  - Scottish Fold: 2 / 5 / 1 / 3 / 2 / 3 / 4 / 5 / 3
  - Munchkin: 4 / 5 / 3 / 5 / 2 / 3 / 4 / 5 / 5
  - American Shorthair: 3 / 4 / 2 / 3 / 2 / 3 / 4 / 5 / 3

**Ideal owner profiles (synthesized from the sources above)**
- Scottish Fold: calm, indoor-focused homes. Owners must be ready for lifelong joint monitoring and vet costs.
- Munchkin: active households with time for daily play and a home set up for low climbing.
- American Shorthair: first-time owners, families with kids or dogs, seniors, busy workers and apartments.

### Gaps
- Temperament claims are breed-club and vet-advice generalizations. I found no behavioral studies (for example Fe-BARQ or Finnish breed surveys) that cover all three breeds.
- I did not research Thai-market popularity data (registrations, prices, or Thai-specific studies) and have no source for it.

## Q3. Documented health conditions and available screening/examination

### Takeaway
**Scottish Fold.** The fold-causing TRPV4 c.1024G>T variant is dominant and causes osteochondrodysplasia (SFOCD).
- Peer-reviewed work and the UK Animal Welfare Committee (AWC) say every folded cat is affected to some degree.
- Severity ranges from mild on X-ray to crippling. Homozygous (fold × fold) cats are severely affected.
- Screening options are X-rays of distal limbs and tail, TRPV4 genotyping (straight-looking carriers exist), PKD1 DNA testing, and an echo for HCM.

**Munchkin.** Short legs come from a dominant chondrodysplasia variant (a UGDH structural variant) that is lethal when inherited twice (homozygous).
- Documented concerns: limb deformities in all imaged dwarf cats, osteoarthritis, and reported lordosis and pectus excavatum. TICA disputes these.

**American Shorthair.** Generally robust; the main breed-listed risk is HCM, screened by echocardiography.

### Cited Findings
**Scottish Fold — osteochondrodysplasia (SFOCD)**
- **Gandolfi et al. 2016 (Osteoarthritis and Cartilage):**
  - Fold ears and osteochondrodysplasia are "dominantly inherited". Changes involve "malformation in the distal forelimbs, distal hindlimbs and tail, and progressive joint destruction".
  - The cause is p.V342F (c.1024G>T) in TRPV4. The variant "was not found in 648 unaffected cats".
  - [Gandolfi et al. 2016](https://doi.org/10.1016/j.joca.2016.03.019)
- **Takanosu et al. 2008 (J Small Anim Pract):**
  - In a 3-generation fold × straight pedigree, "All cats with folded ears, which were presumably heterozygous… developed osteochondrodysplasia in distal fore- and hindlimbs".
  - Severity varied, and cats with mild disease were clinically unaffected.
  - [Takanosu et al. 2008](https://doi.org/10.1111/j.1748-5827.2008.00561.x)
- **Malik et al. 1999 (Aust Vet J):**
  - Clinical signs were "lameness, reluctance to jump, a stiff stilted gait, short misshapen distal limbs, swelling of plantar tarsometatarsal regions and short thick inflexible tails".
  - All 9 cases with pedigrees came from fold × normal-ear matings, so heterozygotes are affected too.
  - [Malik et al. 1999](https://doi.org/10.1111/j.1751-0813.1999.tb11672.x)
- **Chang et al. 2007:** typical X-ray changes are exostosis and secondary arthritis, plus abnormal phalanges and tail vertebrae. Glucosamine/chondroitin reduced pain in 3 cases — [Chang et al. 2007](https://doi.org/10.4142/jvs.2007.8.3.307)
- **Balancing evidence:**
  - Rorden et al. 2021: in a blinded, genotyped radiographic study of 22 cats, all 10 folded cats were heterozygous and had numerically worse scores, but "much milder radiological signs than previously published" — [Rorden et al. 2021](https://doi.org/10.1007/s00439-021-02337-5)
  - Sartore et al. 2023: all 12 Folds carried the variant, but only 1 of 12 showed clinical signs, with no X-ray progression over 1.5 years in those re-checked — [Sartore et al. 2023](https://doi.org/10.1177/1098612x231211763)
  - Velie et al. 2023 (Australian vet records, 1992–2018): 12 of 1,131 Scottish Folds were clinically diagnosed, plus 64 suspected. Diagnosed cats were usually under 30 months old. The authors state that "all Scottish Fold cats are believed to be affected" — [Velie et al. 2023](https://doi.org/10.1186/s12917-023-03811-0)
- **Matsumoto et al. 2026 (Animal Genetics):**
  - 7 of 114 cats changed from folded to straight ears as they matured. All were heterozygous carriers ("cryptic folds", 12.7% of heterozygotes), with smaller ear flaps.
  - "visual inspection for breeding selection is insufficient… highlighting the necessity of TRPV4 genotyping".
  - [Matsumoto et al. 2026](https://doi.org/10.1002/age.70114)
- **Ukawa et al. 2026 (Japan, 8,610 cats from 14 breeds):**
  - Homozygous Scottish Folds fell from 14.2% (2017) to 1.9% (2024) after genetic testing.
  - The TRPV4 variant was also found in American Curls, Norwegian Forest Cats, Munchkins and Minuets.
  - [Ukawa et al. 2026](https://doi.org/10.1002/age.70118)
- **Takanosu & Hattori 2020:** a Fold × Munchkin cross and a Fold × American Curl cross were both TRPV4 homozygous, with "Severe exostosis in the hind leg" by about 1 year old. "Cross breeding with Scottish Fold cats… should be avoided" — [Takanosu & Hattori 2020](https://doi.org/10.1292/jvms.20-0299)
- **UK AWC opinion (Sept 2024, published Jan 2025):**
  - "All individuals in this breed suffer from the inherited disorder osteochondrodysplasia… Scottish Fold cats will almost inevitably suffer physical pain - from mild to severe".
  - Because the trait is dominant, problems "cannot be eliminated through selective breeding within the Scottish Fold breed or by outcrossing".
  - [AWC opinion on feline breeding](https://gov.wales/sites/default/files/publications/2025-01/animal-welfare-committee-opinion-on-the-welfare-implications-of-current-and-emergent-feline-breeding-practices.pdf)
- **Vet-advice sources:**
  - PetMD: "All Scottish Fold cats are affected, although some may experience more discomfort than others" — [PetMD Scottish Fold](https://www.petmd.com/cat/breeds/scottish-fold)
  - VCA mentions a "history of osteodystrophy" that reputable breeders "have worked to eliminate". This is softer than the peer-reviewed evidence — [VCA Scottish Fold](https://vcahospitals.com/know-your-pet/cat-breeds/scottish-fold)

**Scottish Fold — other conditions**
- PKD:
  - Shitamori et al. 2023 (1,281 cats, Japan): odds of carrying the PKD1 variant were "significantly higher in Persian cats, Scottish Folds and Exotic Shorthairs", though breed counts were small — [Shitamori et al. 2023](https://doi.org/10.1177/1098612x231185393)
  - Ukawa et al. 2026 (61,968 genotyped cats, Japan): heterozygous Scottish Folds fell 49.5% between 2019 and 2022 after kitten DNA testing became routine — [Ukawa et al. 2026 PKD](https://doi.org/10.1186/s12864-026-13048-4)
- PetMD lists HCM and PKD (typically 7+ years) and says DNA tests exist for both — [PetMD Scottish Fold](https://www.petmd.com/cat/breeds/scottish-fold)
- VCA says the breed is "prone to being overweight" — [VCA Scottish Fold](https://vcahospitals.com/know-your-pet/cat-breeds/scottish-fold)

**Munchkin**
- **Struck et al. 2020 (BMC Genetics):**
  - A UGDH structural variant on chromosome B1 was "perfectly associated" with short-legged "standard" Munchkins.
  - No homozygotes were found and litters were smaller, which suggests "an autosomal recessive lethal trait in the homozygote state". The condition itself is dominant.
  - [Struck et al. 2020](https://doi.org/10.1186/s12863-020-00875-x)
- Buckley et al. 2020 (PLoS Genetics): a UGDH-disrupting structural variant was found in three unrelated dwarf cats — [Buckley et al. 2020](https://doi.org/10.1371/journal.pgen.1008926)
- **Anderson et al. 2021 (VCOT):** in 5 cats with feline disproportionate dwarfism, "All limbs… possessed deformities" (bowing and torsion of the humerus, radius, femur and tibia). On disc disease, "No spinal pathology was detected" in 2 MRI-scanned cats, and the link was called "inconclusive" — [Anderson et al. 2021](https://doi.org/10.1055/s-0041-1730355)
- **PetMD:**
  - Osteoarthritis, due to a cartilage defect from the short-leg mutation.
  - Lordosis, a congenital inward spinal curve that "can cause spinal pain".
  - Pectus excavatum, which can compress the heart. Surgery is recommended for moderate to severe cases.
  - [PetMD Munchkin](https://www.petmd.com/cat/breeds/munchkin)
- **AWC 2024:** Munchkins "may lack the flexibility to groom themselves properly", which is a particular problem for longhairs. Leg deformities may be "painful and debilitating", with "a predisposition to osteoarthritis and intervertebral disc disease". Cats with two copies of the gene are "not viable" — [AWC opinion](https://gov.wales/sites/default/files/publications/2025-01/animal-welfare-committee-opinion-on-the-welfare-implications-of-current-and-emergent-feline-breeding-practices.pdf)
- **Conflict:**
  - TICA says Munchkins are "NOT prone to arthritis", that "Many years of research have validated that there are no debilitating genes", that the spine is unaffected, and that "A pedigreed Munchkin should not need testing for any breed-related diseases" — [TICA Munchkin](https://tica.org/breed/munchkin/)
  - This contradicts [PetMD](https://www.petmd.com/cat/breeds/munchkin), the [AWC](https://gov.wales/sites/default/files/publications/2025-01/animal-welfare-committee-opinion-on-the-welfare-implications-of-current-and-emergent-feline-breeding-practices.pdf) and [Anderson et al. 2021](https://doi.org/10.1055/s-0041-1730355)
- GCCF Genetics Committee: "Ineligible due to reported health problems". For owners: "Risk of suffering as they age, possible heart problems" — [GCCF Unrecognised Breeds](https://www.gccfcats.org/getting-a-cat/unrecognised-breeds/)

**American Shorthair**
- Cornell Feline Health Center lists the American Shorthair among breeds predisposed to HCM. HCM "is diagnosed by echocardiography", and chest X-rays, ECG and genetic tests may help. Warning signs are "labored or rapid breathing, open-mouthed breathing, and lethargy" and sudden hind-limb pain or paralysis from clots — [Cornell HCM](https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/hypertrophic-cardiomyopathy)
- PetMD: HCM, with American Shorthairs at "elevated risk"; buyers should "verify that their cats have been screened for HCM". Dental disease is common but preventable — [PetMD American Shorthair](https://www.petmd.com/cat/breeds/american-shorthair)
- VCA: "measure food portions to reduce the risk of this cat from becoming overweight". No other breed diseases listed — [VCA American Shorthair](https://vcahospitals.com/know-your-pet/cat-breeds/american-shorthair)
- The Cat API description calls the breed "known for its longevity, robust health" — [Cat API archived](https://web.archive.org/web/20251209033623/https://api.thecatapi.com/v1/breeds)

### Inferences
- "All folded cats are affected" (Takanosu 2008, AWC, PetMD, Velie background) and "many heterozygotes show mild or no clinical signs" (Rorden 2021, Sartore 2023, Velie 2023) are compatible:
  - The cartilage/bone defect seems to be present in every folded cat.
  - Clinical pain varies widely and is likely under-diagnosed, since cats hide pain.
  - The JSON says "every folded cat has the abnormality to some degree; severity varies".
- Because of cryptic straight-eared carriers and the TRPV4 variant turning up in Munchkins in Japan, "Munchkin × Fold" or "Fold-cross" kittens (popular in Asian markets) risk accidental homozygous, severely affected cats. Buyers should ask for TRPV4 genotypes on both parents.

### Gaps
- Peer-reviewed prevalence data for lordosis and pectus excavatum in Munchkins was not found. These claims rest on vet-advice pages (PetMD) and Wikipedia, and Anderson 2021 found no spinal disease in 2 MRI-scanned cats.
- No large peer-reviewed HCM prevalence study specific to American Shorthairs was found in this pass. The HCM link rests on Cornell and PetMD breed lists.
- Wikipedia's figures (54% of Scottish Folds and 47% of American Shorthairs carrying PKD1 in a Japanese study) were not traced to a primary paper, so they are not used in the JSON.
- No validated, breed-specific TRPV4 test standard for Thai labs was researched.

## Q4. Registry recognition/rejection and legal restrictions on breeding

### Takeaway
**Scottish Fold.**
- Recognized by CFA, TICA, WCF and Australia's ACF, all of which forbid fold × fold matings.
- Rejected by FIFe, which bans breeds based on osteochondrodysplasia, and by GCCF ("Ineligible. Known serious health problems").
- Legal restrictions:
  - Flanders (Belgium) banned breeding and trading from 1 Oct 2021.
  - The Netherlands, where breeding was already banned, added a ban on keeping new fold cats and on showing them from 1 Jan 2026.
  - Victoria (Australia) says they must not be used for breeding.
  - Scottish Government licensing guidance says breeding Folds or Munchkins would likely breach licence conditions.

**Munchkin.** Recognized by TICA. Not recognized by CFA, FIFe (bans achondroplasia breeds) or GCCF. Victoria and Scottish licensing guidance treat it like the Fold.

**American Shorthair.** Recognized by CFA and TICA. Not recognized by FIFe or GCCF, simply because nobody has applied, not for welfare reasons.

### Cited Findings
**Registries**
- **CFA:**
  - Scottish Fold shorthair championship 1978, longhair 1992, straight-eared cats accepted 2022. "Responsible breeders only breed fold-eared cats to straight-eared cats to minimize arthritic and bone conditions". Allowed outcrosses are British and American Shorthair — [CFA Scottish Fold](https://cfa.org/breed/scottish-fold/)
  - American Shorthair: "one of the first five breeds recognized by the Cat Fancier's Association at its founding in 1906" — [CFA American Shorthair](https://cfa.org/breed/american-shorthair/)
  - Munchkin: cfa.org/breed/munchkin/ returns 404 and the breed is absent from CFA's breed list — [CFA breeds](https://cfa.org/breeds/)
- **TICA:**
  - Lists Scottish Fold, Scottish Fold Longhair, Scottish Straight, Munchkin, Munchkin Longhair and American Shorthair — [TICA Munchkin](https://tica.org/breed/munchkin/), [TICA Scottish Fold](https://tica.org/breed/scottish-fold/), [TICA American Shorthair](https://tica.org/breed/american-shorthair/)
  - Munchkin entered TICA's New Breed program in September 1994 and gained Championship status in May 2003 — [TICA Munchkin](https://tica.org/breed/munchkin/)
  - TICA allows British and American Shorthair outcrosses for Folds, and itself notes Folds "are not recognized as a breed in Scotland due to concerns about joint issues" — [TICA Scottish Fold](https://tica.org/breed/scottish-fold/)
- **FIFe** (Breeding & Registration Rules, issued 01.07.2026, §3.5.2):
  - "The FIFe will not register or recognise any breed of cats showing as a breed characteristic: achondroplasia/pseudo-achondroplasia… (for example the Munchkin) · osteochondrodysplasia: an autosomal dominant gene causing progressive joint, bone and cartilage deformity (for example the Scottish Fold)".
  - §3.6.2: such cats "are not allowed for breeding… cannot be registered… cannot be exhibited… cannot be promoted or advertised".
  - Scottish Fold codes (SFL/SFS non) were deleted from 01.01.2012 "and cannot be re-created".
  - The American Shorthair appears only as a non-recognised breed ("AMS non").
  - [FIFe Breeding & Registration Rules (PDF)](https://fifeweb.org/wp-content/uploads/2023/11/br_reg_en.pdf)
  - FIFe's breed list has no Scottish Fold, Munchkin or American Shorthair — [FIFe breeds](https://fifeweb.org/cats/breeds/)
- **GCCF** (Unrecognised Breeds page, updated Sept 2025):
  - Scottish Fold, Red status: "Ineligible. Known serious health problems (osteochondrodysplasia)". For owners: "A pet who suffers with joint pain in mid-old age". Suggested alternative: British Shorthair.
  - "Munchkin, Minuet (and other dwarf breeds)": "Ineligible due to reported health problems". GCCF lists the bodies recognizing them as "CCCA, TICA, SACC, WCF".
  - American Shorthair, Grade A: "Not applied, probable acceptance". GCCF lists the recognizing bodies as "CFA, TICA, SACC".
  - [GCCF Unrecognised Breeds](https://www.gccfcats.org/getting-a-cat/unrecognised-breeds/)
  - Wikipedia says GCCF had registered Folds from 1966 and stopped in the early 1970s over ear infection and deafness concerns — [Wikipedia Scottish Fold](https://en.wikipedia.org/wiki/Scottish_Fold)
- **WCF:** the Scottish Fold Shorthair (SFS) standard, updated 2023-08-13, states "Mating between Scottish Fold / Highland Fold x Scottish Fold / Highland Fold is not permitted" — [WCF SFS standard](https://wcf.de/pdf-en/breed/SFS_en_2023-08-13.pdf)
- **ACF (Australia):** per the World Cat Congress comparison, "Fold to Fold mating is not permitted". New breeders are told to read the ACF Policy for Breeding Scottish Fold and to work with a mentor and their vet — [World Cat Congress SFS comparison](https://worldcatcongress.org/wp/cat_breed_comp_sfsh.php), [ACF Breeding Policy – Scottish Fold](https://www.acf.asn.au/notices/notices/Constitution%20&%20By-laws/ACF%20By-laws%20Part%202%20-%20Appendix%202%20Breeding%20Policy%20-%20Scottish%20Fold.pdf)

**Laws and government guidance**
- **Netherlands** (government news, 31 Oct 2025):
  - From 1 Jan 2026, cats with folded ears or hairless cats born on or after that date, or not microchipped, fall under a keeping ban ("houdverbod"). Fold and hairless cats may no longer take part in competitions, exhibitions or shows.
  - "Het fokken van katten met vouworen en naaktkatten is al langer verboden in Nederland" (breeding them was already banned).
  - Cats born before 1 Jan 2026 and chipped before that date may be kept.
  - [Rijksoverheid 31-10-2025](https://www.rijksoverheid.nl/actueel/nieuws/2025/10/31/vanaf-1-januari-2026-ingang-houdverbod-vouwoorkatten-en-naaktkatten)
- **Flanders (Belgium):** "Sinds 1 oktober 2021 is het kweken en verhandelen van fold katten verboden" (breeding and trading banned since 1 Oct 2021). Owners may keep existing fold cats but may not sell them or give them away. The stated reason is malformed joint cartilage that is "zeer pijnlijk" (very painful) — [Vlaanderen.be](https://www.vlaanderen.be/verbod-op-de-kweek-en-het-verhandelen-van-fold-katten)
- **Victoria (Australia):** the Code of Practice for the Breeding of Animals with Heritable Defects that Cause Disease lists "Folded ears associated with osteochondrodystrophy (Scottish Folds)" and "Aplasia or hypoplasia of long bones (Munchkin cats or Twisty Cats)" under "Such animals must not be used for breeding" — [Agriculture Victoria code](https://agriculture.vic.gov.au/livestock-and-animals/animal-welfare-victoria/pocta-act-1986/victorian-codes-of-practice-for-animal-welfare/code-of-practice-for-the-breeding-of-animals-with-heritable-defects-that-cause-disease)
- **Scotland/UK:**
  - Scottish Government statutory guidance under the Animal Welfare (Licensing of Activities Involving Animals) (Scotland) Regulations 2021 "considers that the breeding of the Munchkin and Scottish Fold breed of cats would likely represent a breach of the condition" that "No cat may be kept for breeding if it can reasonably be expected, on the basis of its genotype, conformation…, that breeding from it could have a detrimental effect on its health or welfare".
  - The AWC (Sept 2024) recommends England and Wales adopt similar rules and ban breeding cats with harmful extreme traits.
  - [AWC opinion](https://gov.wales/sites/default/files/publications/2025-01/animal-welfare-committee-opinion-on-the-welfare-implications-of-current-and-emergent-feline-breeding-practices.pdf)
  - A licence is required to breed 3 or more litters in 12 months in Scotland — [gov.scot cat breeder guidance](https://www.gov.scot/publications/animal-welfare-licensing-activities-involving-animals-scotland-regulations-2021-guidance-cat-breeders/pages/2/)
- **Other countries (unverified):** Wikipedia reports breeding bans in Austria (2020) and indirect bans in Norway and Sweden, and says the Netherlands' breeding ban dates from 2014 — [Wikipedia Scottish Fold](https://en.wikipedia.org/wiki/Scottish_Fold)

### Inferences
- For the JSON `recognizedBy`:
  - Scottish Fold: ["CFA", "TICA", "WCF"], each verified on the registry's own pages.
  - Munchkin: ["TICA"] only. WCF recognition is reported by GCCF and Wikipedia, but WCF's site could not be reached to confirm a Munchkin standard.
  - American Shorthair: ["CFA", "TICA"].
- "Not legal in Scotland" is better described as licensing guidance making breeding effectively unlicensable for licensed breeders, not an explicit statutory breed ban.

### Gaps
- I could not verify primary legal texts for Austria, Norway or Sweden, the exact year of the Dutch breeding ban, or whether Dutch rules name Munchkins. They are excluded from the JSON wording.
- WCF's main website (wcf-online.de) timed out, so WCF recognition of Munchkin and American Shorthair is unconfirmed. GCCF does not list WCF among the American Shorthair's recognizing bodies.
- Thai law: no Thai restriction on these breeds was researched or found.

## Q5. Grooming, exercise, diet, environment needs, and pain/stiffness warning signs

### Takeaway
All three are short-coated (Fold and Munchkin also come in longhair) and need little grooming.
- **Scottish Fold:** weight control, gentle play, never pull the tail, and owner vigilance for subtle joint pain.
- **Munchkin:** lots of play, low and stepped climbing, low-sided bowls, and help with grooming hard-to-reach areas.
- **American Shorthair:** mostly portion control and dental care.

### Cited Findings
**Scottish Fold**
- Grooming: VCA says weekly combing for shorthairs and 3–4 times a week for longhairs — [VCA Scottish Fold](https://vcahospitals.com/know-your-pet/cat-breeds/scottish-fold). PetMD says at least a couple of times a week, and bathing may be needed if mobility problems prevent self-grooming — [PetMD Scottish Fold](https://www.petmd.com/cat/breeds/scottish-fold)
- Exercise: "good eaters and not as energetic as other breeds… keep them engaged in interactive play… puzzle toys" — [TICA Scottish Fold](https://tica.org/breed/scottish-fold/)
- Tail: "Their tail should be handled gently and are known to develop stiffness that can cause pain if manhandled" — [TICA Scottish Fold](https://tica.org/breed/scottish-fold/)
- Diet: AAFCO-complete food. Omega-3s, glucosamine and chondroitin can support joints — [PetMD Scottish Fold](https://www.petmd.com/cat/breeds/scottish-fold). VCA says the breed is prone to overweight — [VCA Scottish Fold](https://vcahospitals.com/know-your-pet/cat-breeds/scottish-fold)
- Pain signs: "excessive sleeping, jump hesitation, poor grooming, reduced playfulness, litter box changes, and aggression" — [PetMD Scottish Fold](https://www.petmd.com/cat/breeds/scottish-fold)
- Clinical signs in practice: lameness, reluctance to jump, stiff stilted gait, swollen hind feet, and short thick inflexible tail — [Malik et al. 1999](https://doi.org/10.1111/j.1751-0813.1999.tb11672.x)
- Environment: "Thrive in houses or apartments" — [PetMD Scottish Fold](https://www.petmd.com/cat/breeds/scottish-fold)

**Munchkin**
- Grooming: comb shorthairs once a week and longhairs twice a week — [TICA Munchkin](https://tica.org/breed/munchkin/). The AWC notes they may lack the flexibility to groom themselves, especially longhairs — [AWC opinion](https://gov.wales/sites/default/files/publications/2025-01/animal-welfare-committee-opinion-on-the-welfare-implications-of-current-and-emergent-feline-breeding-practices.pdf)
- Exercise: very playful and energetic. They "may not jump from the floor to the top of the bookcase in a single bound" and instead climb in "smaller steps" — [TICA Munchkin](https://tica.org/breed/munchkin/)
- Environment: low-entry cat trees and scratching posts. Needs companionship — [PetMD Munchkin](https://www.petmd.com/cat/breeds/munchkin). "Due to their short legs, a bowl with low sides is best… or a water fountain" — [TICA Munchkin](https://tica.org/breed/munchkin/)
- Diet: measured meals 2–3 times a day — [PetMD Munchkin](https://www.petmd.com/cat/breeds/munchkin). TICA says there are no special nutritional needs. TICA's raw-feeding advice (raw chicken necks) is breed-club opinion, not used — [TICA Munchkin](https://tica.org/breed/munchkin/)
- Watch for: leaning to one side or spinal pain (lordosis) and breathing or heart problems (pectus excavatum) — [PetMD Munchkin](https://www.petmd.com/cat/breeds/munchkin)

**American Shorthair**
- Grooming: weekly combing and brushing — [VCA American Shorthair](https://vcahospitals.com/know-your-pet/cat-breeds/american-shorthair), [TICA American Shorthair](https://tica.org/breed/american-shorthair/). CFA recommends daily brushing with a slicker brush or grooming mitt — [CFA American Shorthair](https://cfa.org/breed/american-shorthair/)
- Exercise and diet: needs "daily play and exercise", cat trees and toys. AAFCO-complete food in 2–3 smaller meals a day. Brush teeth routinely — [PetMD American Shorthair](https://www.petmd.com/cat/breeds/american-shorthair). Measure portions to prevent overweight — [VCA American Shorthair](https://vcahospitals.com/know-your-pet/cat-breeds/american-shorthair)
- Behavior and environment: retains hunting instincts and likes window-watching. "Apartment living suits them as well as a house". A small portion of wet food daily is fine — [TICA American Shorthair](https://tica.org/breed/american-shorthair/)
- HCM warning signs: rapid or labored breathing, open-mouth breathing, lethargy, and sudden hind-limb pain or paralysis — [Cornell HCM](https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/hypertrophic-cardiomyopathy)

### Inferences
- The JSON advises ramps, low-level cat trees and furniture, and easy-access litter boxes for Folds and Munchkins. These are reasonable extensions of the PetMD and TICA advice (low-entry trees, low bowls, mobility issues) and standard arthritic-cat accommodations, but no breed-specific source states "low-sided litter box".
- Thailand's hot, humid climate is not addressed by any source. Short-coated cats should cope, but longhaired Folds and Munchkins will need more frequent combing. This is an inference, not sourced.

### Gaps
- I did not retrieve International Cat Care (icatcare.org) breed pages. The URL tried returned only a hub page, so no iCatCare quotes are included.
- No source gave a recommended age or interval for screening X-rays in Scottish Folds. "Periodic X-rays of breeding cats" is attributed by Wikipedia to the New Zealand Cat Fancy but was not verified at source.
