# Large & High-Energy Breeds: Maine Coon (เมนคูน), Ragdoll (แร็กดอลล์), Bengal (เบงกอล)

Research date: 2026-10-23. JSON deliverables: `data/maine-coon.json`, `data/ragdoll.json`, `data/bengal.json` (same folder as this file).

Access notes. Several primary sites blocked automated fetching, so some facts come from search-result snippets of those pages rather than full-page reads. Those cases are flagged below.
- The Cat API (`api.thecatapi.com/v1/breeds`) now returns HTTP 403 "Authentication required. Please provide a valid API key." I took the ratings from a public mirror of the API dataset ([Cat Data Pages – data table](https://cat-data-pages.onrender.com/data/table)). The mirror's values match the field names of the official API.
- UC Davis VGL HCM pages and TICA `/breed/` pages sit behind a Cloudflare JS challenge. For TICA, I used TICA's own PDF breed introductions and standards, which were reachable.
- The CITES resolution PDF and the RVC news page returned 403. I used the full text of the paper (Europe PMC) for VetCompass. For CITES Res. Conf. 10.17, I used a search snippet of the official PDF.

---

## Q1. What are verified weight ranges (male/female) and lifespan ranges for each breed?

### Takeaway
Registry and veterinary sources broadly agree. Maine Coon and Ragdoll males commonly reach about 6–9 kg. Bengals are smaller, at about 3.6–6.8 kg. Lifespan ranges quoted by registries and vets are about 10–17 years. UK primary-care death records show a lower mean life expectancy at birth for all three breeds (Bengal 8.5, Maine Coon 9.7, Ragdoll 10.3 years) than for crossbred cats (11.9).

### Cited Findings
**Maine Coon**
- TICA: "Maine Coons male cats, at maturity, can average 13–18 lbs. Maine Coon female cats average 9–13 lbs." That is 5.9–8.2 kg for males and 4.1–5.9 kg for females — [TICA Maine Coon Breed Introduction (PDF)](https://tica.org/wp-content/uploads/2018/08/TICA-Maine-Coon-Breed-Introduction.pdf)
- CFA: "the largest of all pedigreed cats"; males reach "20 pounds" or more, and "females are usually smaller"; a "slow-maturing breed that can take up to three years to reach full growth" — [CFA Maine Coon](https://cfa.org/breeds/maine-coon-cat/)
- GCCF: 10–20 lbs overall; males "up to 18–20 pounds"; lifespan "9–15 years" in the breed standard section and "between 10–15 years" in the health section — [GCCF Maine Coon](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/maine-coon/)
- VCA: males "up to 20 pounds", females about 12 lb; lifespan "12–15 years" — [VCA Maine Coon](https://vcahospitals.com/know-your-pet/cat-breeds/maine-coon)
- PetMD (reviewed by Molly Price, DVM, updated May 30, 2025): males up to 25 lb, females 10–14 lb; lifespan "approximately 13 years" — [PetMD Maine Coon](https://www.petmd.com/cat/breeds/maine-coon)
- The Cat API: weight 5–8 kg (12–18 lb, no sex split); life_span "12–15" — [Cat API mirror](https://cat-data-pages.onrender.com/data/table)
- VetCompass UK: life expectancy at age 0 is 9.71 years (95% CI 8.42–11.00, n=69 deaths) — [Teng et al. 2024, J Feline Med Surg](https://pmc.ncbi.nlm.nih.gov/articles/PMC11156239/)

**Ragdoll**
- GCCF: males "upwards of 6kg", females "between 4kg and 6kg"; lifespan "around 15 years" — [GCCF Ragdoll](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/ragdoll/)
- CFA: mature males "can reach or exceed 20 pounds" (about 9.1 kg), females smaller; "full coat color at two years, and full size and weight at four" — [CFA Ragdoll](https://cfa.org/breeds/ragdoll/)
- VCA: "15–20 pounds" and lifespan "15–25 years". The 25-year upper bound is an outlier that no other source supports — [VCA Ragdoll](https://vcahospitals.com/know-your-pet/cat-breeds/ragdoll)
- PetMD (reviewed by Veronica Higgs, DVM, Apr 2023): "up to 20 pounds"; lifespan "up to 17 years" — [PetMD Ragdoll](https://www.petmd.com/cat/breeds/ragdoll)
- The Cat API: 5–9 kg (12–20 lb); life_span "12–17" — [Cat API mirror](https://cat-data-pages.onrender.com/data/table)
- VetCompass UK: life expectancy at age 0 is 10.31 years (95% CI 8.86–11.76, n=69) — [Teng et al. 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11156239/)

**Bengal**
- GCCF: "Females 8–12 lbs (3.6–5.4kg); Males 10–15 lbs (4.5–6.8kg)"; lifespan "12–16 years" — [GCCF Bengal](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/bengal/)
- TICA: "medium to large cats, from 6–15 pounds, with males generally being larger than females" — [TICA Bengal Breed Introduction (PDF)](https://tica.org/wp-content/uploads/2018/08/TICA-Bengal-Breed-Introduction.pdf)
- VCA: "6–12 pounds"; lifespan "12–15 years" — [VCA Bengal](https://vcahospitals.com/know-your-pet/cat-breeds/bengal)
- PetMD (reviewed by Hannah Hart, DVM, May 29, 2025): lower generations up to 15 lb, higher generations 8–12 lb; lifespan 12–16 years — [PetMD Bengal](https://www.petmd.com/cat/breeds/bengal)
- The Cat API: 3–7 kg (6–12 lb); life_span "12–15" — [Cat API mirror](https://cat-data-pages.onrender.com/data/table)
- VetCompass UK: life expectancy at age 0 is 8.51 years (95% CI 7.12–9.90, n=73) — [Teng et al. 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11156239/)

**Context**
- The VetCompass study used 7,936 confirmed deaths among cats under UK primary veterinary care (deaths from 2019, records checked to March 2021). Overall life expectancy at age 0 was 11.74 years; crossbreds were 11.89, Burmese 14.42, and Sphynx 6.68. The paper notes that earlier studies had linked Bengal and Ragdoll to shortened lifespan — [Teng et al. 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11156239/)

### Inferences
- **JSON values chosen:**
  - Maine Coon: female [4.1, 5.9] (TICA); male [5.9, 9.1] (TICA lower bound; CFA, GCCF and VCA all say males reach about 20 lb ≈ 9.1 kg).
  - Ragdoll: female [4, 6] (GCCF); male [6, 9.1] (GCCF "upwards of 6 kg" plus CFA "can reach or exceed 20 lb").
  - Bengal: female [3.6, 5.4] and male [4.5, 6.8] (GCCF, consistent with TICA's 6–15 lb).
  - Lifespans: Maine Coon [10, 15] (GCCF health section, which encloses VCA/Cat API 12–15); Ragdoll [12, 17] (Cat API and PetMD; VCA's 25 rejected as an outlier); Bengal [12, 16] (GCCF and PetMD).
- The VetCompass numbers are mean life expectancy at birth from death records. They include early deaths, so they are not comparable with "typical lifespan" ranges. They still suggest the website should not overstate longevity.
- Size categories: Maine Coon and Ragdoll are "large". Bengal is "medium", because TICA and CFA say "medium to large" and its weights are clearly below the other two.

### Gaps
- No sex-specific weight range for Ragdoll males has an upper bound from a single registry. The male upper bound combines GCCF with CFA.
- There are no Thailand-specific lifespan or weight data for these breeds.

---

## Q2. What temperament traits do reputable sources consistently report?

### Takeaway
- **Maine Coon:** gentle, friendly, intelligent, playful and trainable. Sociable but not needy, and it chirps or trills rather than meows.
- **Ragdoll:** calm, gentle and people-oriented. It follows owners around ("puppy cat"), is quiet, and is "loving without being demanding".
- **Bengal:** confident, curious, athletic, very energetic, highly intelligent, vocal and demanding. Most sources say it is not ideal for first-time owners.

### Cited Findings
- **Maine Coon (CFA):** "friendly, sweet-tempered and easy to train"; "gentle, easy going yet active"; "sociable, loyal, and quite intelligent" — [CFA Maine Coon](https://cfa.org/breeds/maine-coon-cat/)
- **Maine Coon (GCCF):** "Sweet natured, playful & friendly", "the gentle giant", keeps "playful ways throughout their life" — [GCCF Maine Coon](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/maine-coon/)
- **Maine Coon (VCA):** "Super mellow and affectionate to people, cats and dogs"; shows affection by chirps, trills and head butting; chattiness rated 2/5 — [VCA Maine Coon](https://vcahospitals.com/know-your-pet/cat-breeds/maine-coon)
- **Maine Coon (PetMD):** rarely meows, instead "chirp, chatter, and trill"; good with children and other animals; dog-like traits (fetch, may like water) — [PetMD Maine Coon](https://www.petmd.com/cat/breeds/maine-coon)
- **Maine Coon (Cat API):** temperament "Adaptable, Intelligent, Loving, Gentle, Independent"; "likes being with people… but isn't needy" — [Cat API mirror](https://cat-data-pages.onrender.com/data/table)
- **Ragdoll (CFA):** "loving without being demanding"; "gentle, calm and sociable"; "not talkative cats"; rarely aggressive; "excellent pets for children" — [CFA Ragdoll](https://cfa.org/breeds/ragdoll/)
- **Ragdoll (VCA):** "relaxed, gentle temperament"; called "puppy cats" because they "shadow their favorite people from room to room"; "overly trusting"; "not active cats" — [VCA Ragdoll](https://vcahospitals.com/know-your-pet/cat-breeds/ragdoll)
- **Ragdoll (GCCF):** "astonishingly equable character and gentility", "almost canine fidelity" — [GCCF Ragdoll](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/ragdoll/)
- **Ragdoll (PetMD):** friendly, social and affectionate, with a daily "crazy 15 minutes"; prefers homes with other animals if owners are away; rarely vocal — [PetMD Ragdoll](https://www.petmd.com/cat/breeds/ragdoll)
- **Ragdoll (Cat API):** temperament "Affectionate, Friendly, Gentle, Quiet, Easygoing"; they "enjoy being carried and collapsing into the arms of anyone who holds them" — [Cat API mirror](https://cat-data-pages.onrender.com/data/table)
- **Bengal (CFA):** "Confident, curious, and athletic" with "kitten-like energy"; "quite trainable", "often learn to do tricks", and many enjoy harness walks — [CFA Bengal](https://cfa.org/breeds/bengal/)
- **Bengal (GCCF):** "Confident, active, curious, athletic and energetic" with strong bonds to family — [GCCF Bengal](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/bengal/)
- **Bengal (VCA):** "very demanding"; "extremely alert"; can learn to open doors and cabinets; chattiness 5/5; "challenging" for inexperienced owners — [VCA Bengal](https://vcahospitals.com/know-your-pet/cat-breeds/bengal)
- **Bengal (PetMD):** strong hunting instinct and dislike of being held, so "may not suit families with small children"; territorial with high prey drive, so possibly incompatible with timid pets — [PetMD Bengal](https://www.petmd.com/cat/breeds/bengal)
- **Bengal (Cat API):** "not the cat for everyone, or for first-time cat owners… they demand a lot of interaction" — [Cat API mirror](https://cat-data-pages.onrender.com/data/table)

### Inferences
- In this trio, the Ragdoll is the best "lap cat" and the Bengal the most demanding. The Maine Coon sits in between: active and playful, but adaptable.

### Gaps
- There are no peer-reviewed behavioural studies on breed temperament in Thailand. Temperament evidence is registry and vet-guide consensus, not controlled data.

---

## Q3. Which health conditions are documented, and what screening exists?

### Takeaway
- **Maine Coon:** HCM (MYBPC3 A31P DNA test plus echocardiography), hip dysplasia (radiographs; prevalence 25–37% in registry and screening data), SMA (DNA test) and PK deficiency (DNA test).
- **Ragdoll:** HCM (MYBPC3 R820W DNA test plus echo), plus obesity and bladder stones.
- **Bengal:** PK deficiency (PKLR DNA test), PRA-b (KIF3B DNA test), and HCM, which has no validated DNA test and is screened by echocardiography. Registries also list patellar luxation, hip dysplasia, flat-chested kitten syndrome and peripheral neuropathy.
- A negative MYBPC3 DNA result does not rule out HCM.

### Cited Findings
**HCM (Maine Coon and Ragdoll)**
- Longeri et al. 2013 (JVIM) genotyped 1,855 cats from 28 breeds; 446 had echocardiography. A31P and R820W "were restricted to MCO and RD", respectively. A74T was not associated with HCM — [Longeri et al. 2013, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3602388)
- A31P allele frequency was 0.23 (Italy) and 0.145 (USA) in Maine Coons. Penetrance was 0.58 in homozygotes versus 0.08 in heterozygotes, with an odds ratio of 26.4 for homozygotes (95% CI 6.7–104). HCM was also found in cats without known mutations — [Longeri et al. 2013](https://pmc.ncbi.nlm.nih.gov/articles/PMC3602388)
- R820W allele frequency in Ragdolls was 0.17 (Italy) and 0.23 (USA). The authors recommend combining genetic screening with echocardiography — [Longeri et al. 2013](https://pmc.ncbi.nlm.nih.gov/articles/PMC3602388)
- CFA: Maine Coon breeders test for "hip dysplasia (via x-ray) and hypertrophic cardiomyopathy (via saliva tests and echocardiograms)" — [CFA Maine Coon](https://cfa.org/breeds/maine-coon-cat/)
- CFA says HCM has been found in Ragdolls and breeders "routinely test for it" — [CFA Ragdoll](https://cfa.org/breeds/ragdoll/)
- GCCF: a DNA test for the Ragdoll HCM gene has been available "since 2007"; matching blood group is also advised for breeding (the page mentions B3) — [GCCF Ragdoll](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/ragdoll/)
- PetMD recommends annual echocardiograms for Maine Coons and says at-home DNA tests exist — [PetMD Maine Coon](https://www.petmd.com/cat/breeds/maine-coon)
- UC Davis VGL lists breed-specific HCM tests for Maine Coon and Ragdoll. The pages were not readable because of Cloudflare — [VGL HCM Maine Coon](https://vgl.ucdavis.edu/test/hcm-maine-coon), [VGL HCM Ragdoll](https://vgl.ucdavis.edu/test/hcm-ragdoll)

**Hip dysplasia (Maine Coon)**
- OFA registry data to April 2015 covered 2,732 cats, 99.1% of them Maine Coons. Prevalence was 24.9% (males 27.3%, females 23.3%), and 56% of cases were bilateral — [Loder & Todhunter 2018, "Demographics of hip dysplasia in the Maine Coon cat"](https://scholarworks.indianapolis.iu.edu/items/4c856d4e-bc27-4b6d-bdbe-62ecdb2021ca)
- A Swedish screening programme covering 20 years and 5,038 Maine Coons found prevalence of 37.4%, with no sex predilection. Severity rose with age and body mass, and heritability was 0.36 — [Low et al. 2019, SLU](https://pub.epsilon.slu.se/16484/)

**Spinal muscular atrophy (Maine Coon)**
- SMA is autosomal recessive, caused by a 140-kb deletion affecting LIX1 on chromosome A1q. Kittens show signs at about 3–4 months: unsteady gait and hind-limb muscle atrophy. It is "non-fatal but disabling". The test uses a cheek swab and costs $44 — [UC Davis VGL – SMA](https://vgl.ucdavis.edu/test/maine-coon-sma) (via search snippet)

**PK deficiency (Bengal and Maine Coon)**
- Grahn et al. 2012 genotyped 14,179 cats across 40 breeds or populations. The PKLR intronic mutation was found in 15 of them. Its frequency ranged from 0.078% in Exotic Shorthair to 12.97% in Bengal, the highest. Testing is recommended for Abyssinian, Somali, Bengal, Egyptian Mau, LaPerm, Maine Coon, Norwegian Forest, Savannah, Siberian and Singapura — [Grahn et al. 2012, BMC Vet Res (DOAJ)](https://doaj.org/article/8da8592d416a47dd8b382a01244c5b4d); test listing at [VGL PK deficiency](https://vgl.ucdavis.edu/test/pk-deficiency-cat)

**PRA-b (Bengal)**
- PRA-b is autosomal recessive and caused by a KIF3B variant. Photoreceptor loss "begins around 7 weeks of age", and vision is "very compromised" by about 2 years. Two carriers produce 25% affected kittens. The test costs $44, or $66 combined with PK deficiency, from a cheek swab — [UC Davis VGL – PRA-b](https://vgl.ucdavis.edu/test/pra-bengal) (via search snippet)

**Bengal: HCM and other conditions**
- CFA says Bengal breeders perform regular echocardiograms on breeding stock for HCM — [CFA Bengal](https://cfa.org/breeds/bengal/)
- GCCF lists Flat Chested Kitten Syndrome, Patellar Luxation, Hip Dysplasia, PK Deficiency, HCM, Peripheral Neuropathy and PRA, and recommends DNA testing for breeding cats — [GCCF Bengal](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/bengal/)
- PetMD lists lymphoma (especially intestinal), GI upset or IBD, patellar luxation, HCM, PRA and PK deficiency. It says breeders "should always genetically test both parents for HCM". **Conflict:** no Bengal-specific HCM DNA variant is established. The MYBPC3 variants are restricted to MCO and RD per Longeri 2013, and CFA describes echo screening. PetMD's wording is misleading — [PetMD Bengal](https://www.petmd.com/cat/breeds/bengal)
- A Thai (NSTDA-archived) study examined MYBPC3 A74T in Bengal cats with echocardiography and MALDI-TOF. Longeri 2013 found A74T not associated with HCM, so A74T results should not be marketed as HCM clearance — [NSTDA open archive](https://www.nstda.or.th/openarchive/nstda-research-publications/echocardiography-and-maldi-tof-identification-of-myosin-binding-protein-c3-a74t-gene-mutations-involved-healthy-and-mutated-bengal-cats/)

**Ragdoll: other conditions**
- PetMD: bladder stones (possible life-threatening obstruction; signs include frequent small urinations and straining), obesity leading to arthritis, and possible food or seasonal allergies — [PetMD Ragdoll](https://www.petmd.com/cat/breeds/ragdoll)
- CFA notes obesity risk because of their "love of food" — [CFA Ragdoll](https://cfa.org/breeds/ragdoll/)

**Maine Coon: other conditions (PetMD)**
- PetMD lists PKD, chronic or juvenile gingivitis from about 6 months, and polydactyly. VCA says polydactyly "causes no adverse health concerns" — [PetMD Maine Coon](https://www.petmd.com/cat/breeds/maine-coon); [VCA Maine Coon](https://vcahospitals.com/know-your-pet/cat-breeds/maine-coon)

### Inferences
- I kept PKD out of the Maine Coon JSON. The only source is PetMD, and PKD1 is classically a Persian-lineage variant, so I found no breed-specific evidence. I left it in the notes only.
- I also left Bengal lymphoma, IBD and ulcerative nasal dermatitis out of the JSON, because I could not verify them against primary literature in this session.
- **Maine Coon JSON health list:** HCM, hip dysplasia, SMA, PK deficiency.
- **Ragdoll JSON health list:** HCM, bladder stones, obesity.
- **Bengal JSON health list:** PK deficiency, PRA-b, HCM (echo only), patellar luxation.

### Gaps
- No carrier frequency for SMA in Maine Coons was found in accessible sources.
- I read the full text of Longeri 2013 for penetrance only. Penetrance of R820W in Ragdolls was not extracted.
- The Bengal HCM prevalence of "16.7%" circulating on blogs could not be traced to a primary paper, so it was not used.
- The Grahn 2012 figure (12.97%) is reported as "frequency" of the mutation. The snippet does not make clear whether this is allele or carrier frequency.

---

## Q4. Bengals: which generation matters for pet buyers, and what are the legal considerations in Thailand?

### Takeaway
- **Generations:** F1–F3 ("foundation") Bengals have a leopard-cat parent or grandparent. Registries do not show them, and vets discourage keeping them. Pet buyers should get SBT (Stud Book Tradition) or later-generation Bengals with registry pedigrees. CFA requires five generations of domestic-only ancestry.
- **Thai domestic law:** the leopard cat (แมวดาว, *Prionailurus bengalensis*) is protected wildlife in Thailand. Possessing one without a permit can bring up to 5 years' prison or a 500,000-baht fine, and trading one up to 10 years or 1,000,000 baht, under the Wildlife Conservation and Protection Act B.E. 2562. Producing early-generation hybrids in Thailand therefore needs an illegally or licensed-held leopard cat.
- **International trade:** CITES treats hybrids with a listed species in the previous four generations (F1–F4) as that species.
- **Gap:** I found no Thai statute text or DNP guidance that explicitly classifies Bengal hybrids themselves.

### Cited Findings
**Generations and registry rules**
- TICA: F1, F2 and F3 Bengals "are registered as Foundation… Bengals that are not eligible for show and only the females are used for breeding". TICA accepted the Bengal as a new breed in 1986 and gave it championship status in 1991 — [TICA Bengal Breed Introduction (PDF)](https://tica.org/wp-content/uploads/2018/08/TICA-Bengal-Breed-Introduction.pdf)
- VCA: TICA recognises Bengals only if they are "at least a fourth-generation descendant" of the ALC–domestic cross. VCA's claim that "Japan first welcomed them as family pets in the 1940s" is unsupported by registry histories and was not used — [VCA Bengal](https://vcahospitals.com/know-your-pet/cat-breeds/bengal)
- CFA: "accepted Bengals for registration in 2016, requiring five generations of pure domestic ancestry"; championship in 2018. Jean Mill's first cross was in 1963 (a black domestic tom with a female Asian leopard cat) — [CFA Bengal](https://cfa.org/breeds/bengal/)
- GCCF stopped registering F1 Bengals on 1 June 2002 and F3 Bengals on 1 June 2008 — [GCCF Bengal](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/bengal/)
- PetMD: lower generations are larger and more energetic, higher generations smaller and more docile; some U.S. states ban Bengals or restrict early generations — [PetMD Bengal](https://www.petmd.com/cat/breeds/bengal)
- FelineVMA (formerly AAFP), 2025 position: "discourages ownership of early generation (F1, F2, F3) hybrid cats" and opposes breeding wild × domestic cats. Reasons:
  - Welfare: "not natural breeding partners"; premature births; kitten rejection.
  - Behaviour: early generations "retain their wild behaviors".
  - Public safety: no USDA-approved rabies vaccine for hybrids.
  - Conservation.
  
  Source: [FelineVMA 2025 Hybrid Cats Position Statement](https://catvets.com/resource/2025-hybrid-cats-position-statement/)

**Thai law**
- The leopard cat is protected wildlife. Older ONEP news items cite it as protected under the 2535 Act (mammal no. 147 / no. 183 in the earlier lists) — [ONEP, 15 Apr 2020](https://www.onep.go.th/?p=7861); [ONEP, 31 Oct 2020](https://www.onep.go.th/?p=15683)
- Enforcement under the 2562 Act: on 18 Feb 2020 the DNP "พญาเสือ" unit arrested a seller in Hua Hin who sold a leopard cat on Facebook for 3,600 baht. Charges were "ร่วมกันค้าสัตว์ป่าคุ้มครอง ตามมาตรา 29 ระวางโทษจำคุกไม่เกิน 10 ปี ปรับไม่เกิน 1,000,000 บาท และร่วมกันครอบครองสัตว์ป่าคุ้มครอง ตามมาตรา 17 ระวางโทษจำคุกไม่เกิน 5 ปี ปรับไม่เกิน 500,000 บาท" — [Matichon, 18 Feb 2020](https://www.matichon.co.th/region/news_1982531)
- A legal Q&A confirms the 2562 Act penalties: possession (s.17 with s.92) up to 5 years and/or 500,000 baht; trade (s.29 with s.89) up to 10 years and/or 1,000,000 baht — [Legardy Q&A](https://legardy.com/free-qna/8144)
- Thai hybrid case: on 11 Dec 2018 on Koh Lanta, Krabi, officials (Thung Thale Wildlife Sanctuary, Border Patrol Police, Lanta Animal Foundation) found a man keeping a male leopard cat (about 2 kg) with 17 leopard cat × Bengal hybrid offspring. He was charged under the 2535 Act s.19 (unlicensed possession). The animals were sterilised, and officials described the hybrids as "มีลักษณะนิสัยดุร้าย". The article cites a market price of 10,000–100,000 baht per hybrid — [The Thaiger (TH), 2018](https://thethaiger.com/th/news/120624/)

**CITES**
- Res. Conf. 10.17 (Rev. CoP14): hybrids with Appendix I or II species in their "recent lineage", generally the "previous four generations", are subject to CITES "just as if they were full species". If any ancestor in that lineage is an Appendix I species, the hybrid is treated as Appendix I — [CITES Res. Conf. 10.17 (Rev. CoP14) (PDF)](https://cites.org/sites/default/files/documents/COP/19/resolution/E-Res-10-17-R14.pdf) (via search snippet; the PDF returned 403 to direct fetch)
- The leopard cat is in CITES Appendix II except the populations of Bangladesh, India and Thailand, which are in Appendix I — [archived Environment Canada CITES page](https://bac-lac.wayback.archive-it.org/web/20071116045904/http://www.cites.ec.gc.ca/eng/sct4/sct4_2_e.cfm). This is an older page and should be re-checked on checklist.cites.org, because CITES felid taxonomy was revised after 2017.

### Inferences
- For a Thai pet buyer, the safe and legal choice is an SBT/registered Bengal with a TICA, CFA, FIFe, GCCF or WCF pedigree several generations removed from the leopard cat. Under CITES, F1–F4 hybrids crossing borders would need CITES documentation, and Appendix I treatment applies if Thai-origin leopard cats are in the lineage.
- Any Thai breeder offering F1–F3 kittens almost certainly holds a leopard cat. Unless the breeder has a DNP licence, that possession is itself an offence (s.17).

### Gaps
- I found no Thai legal text, DNP notice or court ruling stating whether a leopard cat × domestic hybrid counts as "สัตว์ป่า" or "สัตว์ป่าคุ้มครอง" under the 2562 Act.
- I did not retrieve the current ministerial regulation that lists protected species under the 2562 Act. Enforcement in 2020 confirms the leopard cat's protected status, but the list number is unverified.
- Thai import requirements for pet cats (Department of Livestock Development permits) were out of scope and not researched.

---

## Q5. What are grooming, exercise, diet and environment needs, including heat management in tropical Thailand?

### Takeaway
- **Maine Coon:** combing 2–3 times a week, tall sturdy cat trees, measured high-protein meals with no free feeding.
- **Ragdoll:** combing 1–2 times a week, indoor-only living, strict portion control (obesity risk), and daily interactive play.
- **Bengal:** minimal grooming but very high exercise and enrichment needs: wheels, vertical space, puzzle feeders, harness walks. It should not roam freely.
- **Heat (no breed-specific data found):** water at all times, cool ventilated indoor space, and no vigorous play in the hottest hours.

### Cited Findings
**Grooming**
- **Maine Coon:** "combing… two or three times a week" for "five or ten minutes" to prevent matting (CFA). It sheds heavily in spring, and GCCF advises regular ear cleaning. PetMD suggests nail trims every 4–6 weeks — [CFA](https://cfa.org/breeds/maine-coon-cat/); [GCCF](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/maine-coon/); [PetMD](https://www.petmd.com/cat/breeds/maine-coon)
- VCA's view differs: "use a metal comb once a week" — [VCA](https://vcahospitals.com/know-your-pet/cat-breeds/maine-coon)
- **Ragdoll (coat):** the semi-long coat has "no significant undercoat", giving "reduced shedding and matting" — [CFA](https://cfa.org/breeds/ragdoll/)
- **Ragdoll (routine):** comb 1–2 times a week with two metal combs, more during spring shedding; it is not hypoallergenic (PetMD). GCCF says it is prone to matting if neglected — [PetMD](https://www.petmd.com/cat/breeds/ragdoll); [GCCF](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/ragdoll/)
- **Bengal:** "Grooming once a week… soft-bristled brush"; bathing is unnecessary unless showing (CFA). GCCF: "A light brush and combing once a week" — [CFA](https://cfa.org/breeds/bengal/); [GCCF](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/bengal/)

**Exercise and enrichment**
- **Maine Coon:** 2–3 play sessions a day of 10–15 minutes each; "a very large, tall cat tree" at least 6 feet high with a sturdy base; fetch, harness walks, puzzle toys — [PetMD](https://www.petmd.com/cat/breeds/maine-coon)
- **Ragdoll:** interactive play; capable of clicker training and agility; "must be indoor-only cats" because they are not street-smart (PetMD). VCA calls them "not active cats" — [PetMD](https://www.petmd.com/cat/breeds/ragdoll); [VCA](https://vcahospitals.com/know-your-pet/cat-breeds/ragdoll)
- **Bengal (PetMD):** cat wheels, vertical spaces, cat trees, wall shelves, fetch, harness walking and food puzzles — [PetMD](https://www.petmd.com/cat/breeds/bengal)
- **Bengal (GCCF):** needs toys and activity centres; can be harness-trained; "unsuitable for free outdoor roaming" — [GCCF](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/bengal/)

**Diet**
- **Maine Coon:** "high-protein, nutritionally balanced cat food three or four times a day. Do not permit free feeding" (VCA). PetMD suggests AAFCO-complete food and wide bowls — [VCA](https://vcahospitals.com/know-your-pet/cat-breeds/maine-coon); [PetMD](https://www.petmd.com/cat/breeds/maine-coon)
- **Ragdoll:** measure portions; treats count toward daily calories; a mix of wet and dry food is suggested — [PetMD](https://www.petmd.com/cat/breeds/ragdoll)
- **Bengal:** no special diet; AAFCO-complete food; several small meals, food puzzles and lick mats instead of free-feeding — [PetMD](https://www.petmd.com/cat/breeds/bengal)

**Heat**
- **Higher-risk cats:** "Flat-faced cats (such as Persians), those that become very stressed in hot temperatures, and very young or old cats are at greater risk."
- **Prevention:** "Offer plenty of fresh water at all times"; keep cats indoors during the warmest times in "a cool and well-ventilated space"; "Don't encourage your cat to play or exercise in the hottest parts of the day."
- **Warning signs:** restlessness, panting, drooling, confusion, vomiting, collapse.
- **First aid:** wet the coat with lukewarm water, move the cat somewhere cool, and contact a vet.

Source: [Cats Protection – Heatstroke in cats](https://cats.org.uk/help-and-advice/health/heatstroke-in-cats)

### Inferences
- In Thailand, the two long-coated breeds (Maine Coon, Ragdoll) benefit from a cool indoor environment, air-conditioning or good airflow, and regular brushing to remove shed undercoat. This is inferred from general heat-prevention advice plus coat descriptions; I found no study of these breeds in tropical climates.
- None of the three breeds is brachycephalic, so they are not in the highest heat-risk group Cats Protection names.
- Bengals' high activity means their play should be scheduled for cooler hours.

### Gaps
- I found no veterinary source on whether to shave long-coated cats in hot climates, and no breed-specific heat-tolerance data.

---

## Q6. Origin, history, coat/colours and registry recognition (CFA, TICA, FIFe, GCCF, WCF)

### Takeaway
All three breeds are recognised by all five registries checked. Maine Coon is a natural U.S. breed; Ragdoll was developed in 1960s California; Bengal is a leopard-cat hybrid breed developed in the U.S. from 1963 onward.

### Cited Findings
**Maine Coon**
- History dates to the 1850s; a brown tabby, "Cosey", was Best Cat at the first U.S. show in 1895; CFA championship in 1976 — [CFA](https://cfa.org/breeds/maine-coon-cat/)
- GCCF: declared "extinct" in 1959 but preserved; arrived in the UK in 1984; GCCF preliminary recognition in 1988 and championship in 1993 — [GCCF](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/maine-coon/)
- TICA: championship since TICA's founding in 1979. In 2015, polydactyl Maine Coons became a separate breed name (MCP), with a combined MC/MCP Breed Group; "Breed is slow to mature" — [TICA MC/MCP standard (rev. 1 May 2025)](https://tica.org/wp-content/uploads/2025/04/MaineCoonMCP.pdf)
- Coat (CFA): "heavy and shaggy", shorter on the shoulders and longer on the stomach and britches, with a long plumed tail.
- Colours (CFA): solids, tabbies, shaded and smoke. GCCF excludes chocolate, lilac and colourpoint — [CFA](https://cfa.org/breeds/maine-coon-cat/); [GCCF](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/maine-coon/)
- Body (TICA): big ears, broad chest, substantial boning, a long rectangular body and a long flowing tail; eyes gold to green, with blue or odd eyes allowed in whites and particolours — [TICA MC intro](https://tica.org/wp-content/uploads/2018/08/TICA-Maine-Coon-Breed-Introduction.pdf)
- PetMD calls it Maine's state cat — [PetMD](https://www.petmd.com/cat/breeds/maine-coon)

**Ragdoll**
- Developed in the 1960s by Ann Baker in Riverside, California, from "Josephine", a white domestic longhair carrying the colorpoint gene. CFA accepted it for registration in 1993 and championship in 2000 — [CFA](https://cfa.org/breeds/ragdoll/)
- Patterns (CFA): four — Bi-Color, Van, Colorpoint, Mitted.
- Point colours (CFA): six — seal, blue, chocolate, lilac, red, cream — [CFA](https://cfa.org/breeds/ragdoll/)
- GCCF: first registered Ragdolls were Kyoto and Tiki (1965); imported to the UK in 1981; GCCF recognition nine years later (1990); kittens born white — [GCCF](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/ragdoll/)
- TICA: Ragdoll accepted for championship when TICA began in June 1979. The current standard allows only blue-eyed pointed cats; mink, sepia and solid Ragdolls cannot show in championship — [TICA Ragdoll](https://tica.org/breed/ragdoll/) (via search snippet; page Cloudflare-blocked)

**Bengal**
- TICA accepted it as a new breed in 1986, championship in 1991 — [TICA](https://tica.org/wp-content/uploads/2018/08/TICA-Bengal-Breed-Introduction.pdf)
- CFA registration in 2016, championship in 2018 — [CFA](https://cfa.org/breeds/bengal/)
- Coat (CFA): close-lying, soft, with rosettes outlined in dark colour and possible "glitter".
- Colours (CFA): brown, silver, blue, snow, plus melanistic, smoke and longhair variations — [CFA](https://cfa.org/breeds/bengal/)
- TICA: undersides nearly white, and facial markings still show the tabby pattern — [TICA](https://tica.org/wp-content/uploads/2018/08/TICA-Bengal-Breed-Introduction.pdf)
- GCCF: Spotted or Marbled; brown, Snow and rare Blue — [GCCF](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/bengal/)

**Registries**
- **FIFe:** RAG fully recognised in Category 1, MCO in Category 2, BEN in Category 3. "Charcoal" has been a preliminary recognised Bengal variety since 01.06.2025 — [FIFe breeds](https://fifeweb.org/cats/breeds/)
- **GCCF:** all three breeds are on its list of recognised breeds — [GCCF breed list](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/)
- **WCF:** the EMS list includes "Bengal BEN ALL", "Maine Coon MCO ALL" and "Ragdoll RAG ALL". "Charcoal… only for BEN" and "mitted 04 only for RAG" — [WCF EMS list (PDF)](https://wcf.de/pdf-en/WCF-EMS_EN.pdf)

### Inferences
- `recognizedBy` = ["CFA","TICA","FIFe","GCCF","WCF"] for all three. TICA recognition of the Ragdoll rests on a search snippet of the TICA page plus long-standing championship status. All other entries were confirmed on primary pages or PDFs.

### Gaps
- I could not read the full TICA Ragdoll page because of Cloudflare.

---

## Q7. Cat API baseline ratings and the adjustments made

### Takeaway
I used The Cat API values (from the dataset mirror) as the baseline and made five ±1 adjustments where veterinary or registry sources clearly disagreed: Maine Coon vocal and shedding, Ragdoll energy and shedding, and Bengal kid- and pet-friendliness.

### Cited Findings

Cat API raw values ([mirror](https://cat-data-pages.onrender.com/data/table)):

| Breed | energy | affection | vocal | intelligence | grooming | shedding | child | dog | social |
|---|---|---|---|---|---|---|---|---|---|
| Maine Coon | 3 | 5 | 1 | 5 | 3 | 3 | 4 | 5 | 3 |
| Ragdoll | 3 | 5 | 1 | 3 | 2 | 3 | 4 | 5 | 5 |
| Bengal | 5 | 5 | 5 | 5 | 1 | 3 | 4 | 5 | 5 |

Other Cat API fields: Maine Coon stranger_friendly 5; Ragdoll and Bengal 3; all adaptability 5. Bengal is flagged `hypoallergenic: 1`, which no registry or vet source supports, so it was not used.

Adjustments:
- **Maine Coon vocal 1→2.** VCA rates chattiness 2/5, and PetMD describes frequent chirps, chatter and trills — [VCA](https://vcahospitals.com/know-your-pet/cat-breeds/maine-coon); [PetMD](https://www.petmd.com/cat/breeds/maine-coon)
- **Maine Coon shedding 3→4.** VCA rates shedding 4/5, and GCCF says it "shed[s] heavily in spring" — [VCA](https://vcahospitals.com/know-your-pet/cat-breeds/maine-coon); [GCCF](https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/maine-coon/)
- **Ragdoll energy 3→2.** VCA says "not active cats", and CFA says "gentle, calm" — [VCA](https://vcahospitals.com/know-your-pet/cat-breeds/ragdoll); [CFA](https://cfa.org/breeds/ragdoll/)
- **Ragdoll shedding 3→2.** CFA notes the lack of a dense undercoat "results in reduced shedding and matting"; VCA rates shedding 2/5 and says it "sheds minimally" — [CFA](https://cfa.org/breeds/ragdoll/); [VCA](https://vcahospitals.com/know-your-pet/cat-breeds/ragdoll)
- **Bengal kidFriendly 4→3.** Vet-reviewed PetMD says Bengals "may not suit families with small children" because of their hunting instinct and dislike of being held — [PetMD](https://www.petmd.com/cat/breeds/bengal)
- **Bengal petFriendly 5→4.** PetMD calls Bengals territorial with high prey drive, "potentially incompatible with timid pets" — [PetMD](https://www.petmd.com/cat/breeds/bengal)

Values kept despite minor differences:
- Maine Coon kidFriendly 4 (VCA gives 5/5, not a clear disagreement).
- Ragdoll intelligence 3 (VCA gives 4/5).
- Bengal grooming 1 (weekly brushing per CFA/GCCF is consistent with "very low").

### Inferences
Final ratings:

| Breed | energy | affection | vocal | intelligence | grooming | shedding | kidFriendly | petFriendly | socialNeeds |
|---|---|---|---|---|---|---|---|---|---|
| Maine Coon | 3 | 5 | **2** | 5 | 3 | **4** | 4 | 5 | 3 |
| Ragdoll | **2** | 5 | 1 | 3 | 2 | **2** | 4 | 5 | 5 |
| Bengal | 5 | 5 | 5 | 5 | 1 | 3 | **3** | **4** | 5 |

`petFriendly` maps from the Cat API field `dog_friendly`.

### Gaps
- The official Cat API could not be queried without a key, so the values rely on the mirror. That site was built by querying the same endpoint, and its values agree with the long-standing public dataset.

---

## Q8. Image selections (Wikimedia Commons)

### Takeaway
I chose one free-licensed photo of a single cat per breed and verified it against the Commons file page and API (licence, author, MIME type, size).

### Cited Findings
- **Maine Coon:** silver tabby lying indoors; 2832×2128 JPEG; **Public domain**; author Oleg Morgan (2009). Direct URL https://upload.wikimedia.org/wikipedia/commons/c/c2/Maine_Coon_cat_Toronto_home.jpg returned HTTP 200 image/jpeg — [Commons file page](https://commons.wikimedia.org/wiki/File:Maine_Coon_cat_Toronto_home.jpg)
- **Ragdoll:** blue bicolor lying on a sofa; 6000×4000 JPEG (about 10 MB original); **CC BY-SA 4.0**; author MOZZILAND (2024). Direct URL https://upload.wikimedia.org/wikipedia/commons/8/8a/Ragdoll_bicolor_blue_gatil_mozziland_portugal.jpg returned HTTP 200 image/jpeg — [Commons file page](https://commons.wikimedia.org/wiki/File:Ragdoll_bicolor_blue_gatil_mozziland_portugal.jpg)
- **Bengal:** brown/black spotted-rosetted female standing on grass; 2316×1491 JPEG; **CC BY 2.0**; author Rosana Prada (originally on Flickr, 2007). Direct URL https://upload.wikimedia.org/wikipedia/commons/9/97/Female_bengal_cat_outdoor.jpg; the Commons API confirms mime image/jpeg — [Commons file page](https://commons.wikimedia.org/wiki/File:Female_bengal_cat_outdoor.jpg)

### Inferences
- The Ragdoll original is about 10 MB. The site should use a Commons thumbnail URL (e.g. the `/thumb/…/1280px-…` form) for display, while keeping the original URL plus the author and licence credit.
- CC BY-SA 4.0 and CC BY 2.0 require attribution. CC BY-SA also requires share-alike for derivatives.

### Gaps
- None.
