(() => {
  const quizzes = window.mcqQuizzes || (window.mcqQuizzes = {})
  const topicLabel = "Biliary tract"
  const existingQuiz = quizzes[topicLabel] || {}
  const {
    mcqs: existingMcqs = [],
    sources: configuredSources = [],
    ...topicConfig
  } = existingQuiz

  const existingSources = configuredSources.length
    ? configuredSources.filter((source) => source.id !== "mahmoud-reda-biliary")
    : [{
        id: "current",
        label: "Kellawi Biliary",
        description: "Biliary questions selected from the Kellawi SUR 401-1 bank.",
        shuffleQuestions: existingQuiz.shuffleQuestions ?? false,
        shuffleOptions: existingQuiz.shuffleOptions ?? false,
        mcqs: existingMcqs
      }]

  const lectureQuestions =
  [
    {
      "question": "The normal capacity of the gallbladder is approximately:",
      "choices": [
        "20 mL",
        "50 mL",
        "100 mL",
        "150 mL"
      ],
      "answerIndex": 1,
      "explanation": "The lecture states that the normal gallbladder capacity is about 50 mL."
    },
    {
      "question": "Hartmann's pouch is related to which part of the gallbladder?",
      "choices": [
        "Fundus",
        "Body",
        "Infundibulum",
        "Cystic duct"
      ],
      "answerIndex": 2,
      "explanation": "Hartmann's pouch is a dilated infundibulum near the gallbladder neck."
    },
    {
      "question": "The spiral folds within the cystic duct are called:",
      "choices": [
        "Valves of Kerckring",
        "Valves of Heister",
        "Sphincter of Oddi",
        "Crypts of Luschka"
      ],
      "answerIndex": 1,
      "explanation": "The cystic duct mucosa forms spiral folds known as the valves of Heister."
    },
    {
      "question": "The common hepatic duct is formed by union of the:",
      "choices": [
        "Cystic and pancreatic ducts",
        "Right and left hepatic ducts",
        "Right hepatic and cystic ducts",
        "Left hepatic and pancreatic ducts"
      ],
      "answerIndex": 1,
      "explanation": "The right and left hepatic ducts unite to form the common hepatic duct."
    },
    {
      "question": "The common bile duct is formed by union of the:",
      "choices": [
        "Right and left hepatic ducts",
        "Common hepatic and cystic ducts",
        "Cystic and pancreatic ducts",
        "Common hepatic and pancreatic ducts"
      ],
      "answerIndex": 1,
      "explanation": "The common bile duct begins where the cystic duct joins the common hepatic duct."
    },
    {
      "question": "Which part of the common bile duct runs in the free edge of the lesser omentum?",
      "choices": [
        "Supraduodenal",
        "Retroduodenal",
        "Infraduodenal",
        "Intraduodenal"
      ],
      "answerIndex": 0,
      "explanation": "The supraduodenal part runs in the free edge of the lesser omentum."
    },
    {
      "question": "The intraduodenal part of the common bile duct is surrounded by the:",
      "choices": [
        "Sphincter of Lutkens",
        "Pyloric sphincter",
        "Sphincter of Oddi",
        "Lower esophageal sphincter"
      ],
      "answerIndex": 2,
      "explanation": "The intraduodenal segment passes through the duodenal wall and is surrounded by the sphincter of Oddi."
    },
    {
      "question": "The cystic artery most commonly arises from the:",
      "choices": [
        "Left hepatic artery",
        "Right hepatic artery",
        "Gastroduodenal artery",
        "Superior mesenteric artery"
      ],
      "answerIndex": 1,
      "explanation": "The lecture identifies the right hepatic artery as the usual source of the cystic artery."
    },
    {
      "question": "Small veins from the gallbladder mainly drain directly into the:",
      "choices": [
        "Portal vein",
        "Inferior vena cava",
        "Liver",
        "Splenic vein"
      ],
      "answerIndex": 2,
      "explanation": "The venous drainage includes small veins passing directly into the liver."
    },
    {
      "question": "The first lymph node receiving lymph from the gallbladder is the:",
      "choices": [
        "Coeliac node",
        "Lund node",
        "Superior mesenteric node",
        "Para-aortic node"
      ],
      "answerIndex": 1,
      "explanation": "Gallbladder lymph drains first to the cystic lymph node of Lund."
    },
    {
      "question": "Frequent direct spread of gallbladder carcinoma to the liver is facilitated by:",
      "choices": [
        "Portal venous reflux",
        "Subserosal lymphatic connections",
        "Pancreatic duct communication",
        "Azygos venous drainage"
      ],
      "answerIndex": 1,
      "explanation": "The lecture emphasizes that subserosal lymphatics connect with the liver."
    },
    {
      "question": "A kinked gallbladder fundus is called:",
      "choices": [
        "Hartmann pouch",
        "Phrygian cap",
        "Porcelain gallbladder",
        "Mucocele"
      ],
      "answerIndex": 1,
      "explanation": "A Phrygian cap is a congenital kink of the gallbladder fundus."
    },
    {
      "question": "A tortuous right hepatic artery associated with a short cystic artery is known as:",
      "choices": [
        "Pringle turn",
        "Caterpillar turn",
        "Courvoisier loop",
        "Heister deformity"
      ],
      "answerIndex": 1,
      "explanation": "The lecture calls this arterial anomaly the caterpillar turn."
    },
    {
      "question": "Which congenital anomaly increases the risk of torsion because the gallbladder is unusually mobile?",
      "choices": [
        "Double gallbladder",
        "Floating gallbladder",
        "Absent gallbladder",
        "Phrygian cap"
      ],
      "answerIndex": 1,
      "explanation": "A floating gallbladder has excessive mobility and may be prone to torsion."
    },
    {
      "question": "Which statement about the cystic artery is FALSE according to the lecture?",
      "choices": [
        "It usually arises from the right hepatic artery",
        "It may cross in front of the common hepatic duct",
        "An accessory artery may arise from the gastroduodenal artery",
        "It always has a single constant course"
      ],
      "answerIndex": 3,
      "explanation": "The lecture describes several cystic-artery variations, so its course is not constant."
    },
    {
      "question": "The liver secretes bile at an approximate rate of:",
      "choices": [
        "10 mL/hour",
        "20 mL/hour",
        "40 mL/hour",
        "100 mL/hour"
      ],
      "answerIndex": 2,
      "explanation": "The lecture gives a bile secretion rate of approximately 40 mL per hour."
    },
    {
      "question": "Bile is composed mainly of:",
      "choices": [
        "Protein",
        "Water",
        "Cholesterol",
        "Bile pigment"
      ],
      "answerIndex": 1,
      "explanation": "According to the lecture, bile is about 97% water."
    },
    {
      "question": "The gallbladder concentrates bile mainly by reabsorbing:",
      "choices": [
        "Bile salts only",
        "Water, sodium chloride and bicarbonate",
        "Cholesterol and pigment",
        "Fatty acids only"
      ],
      "answerIndex": 1,
      "explanation": "Gallbladder concentration occurs through absorption of water, sodium chloride and bicarbonate."
    },
    {
      "question": "The gallbladder can concentrate bile approximately:",
      "choices": [
        "2 times",
        "3 times",
        "5-10 times",
        "20-30 times"
      ],
      "answerIndex": 2,
      "explanation": "The lecture states that bile may be concentrated five- to tenfold."
    },
    {
      "question": "The standard initial imaging test for suspected gallstones is:",
      "choices": [
        "CT scan",
        "Ultrasonography",
        "ERCP",
        "PTC"
      ],
      "answerIndex": 1,
      "explanation": "Ultrasonography is non-invasive and is presented as the standard initial imaging technique."
    },
    {
      "question": "Plain abdominal radiography detects only about what percentage of gallstones because most are radiolucent?",
      "choices": [
        "10%",
        "30%",
        "50%",
        "90%"
      ],
      "answerIndex": 0,
      "explanation": "The lecture states that only about 10% of gallstones are radio-opaque."
    },
    {
      "question": "A porcelain gallbladder refers to:",
      "choices": [
        "A gallbladder filled with pus",
        "Calcification of the gallbladder wall",
        "A cholesterol-coated mucosa",
        "A congenitally absent gallbladder"
      ],
      "answerIndex": 1,
      "explanation": "Plain radiography may show gallbladder-wall calcification called porcelain gallbladder."
    },
    {
      "question": "Oral cholecystography was mainly used to assess:",
      "choices": [
        "Portal pressure",
        "Gallbladder contractility",
        "Pancreatic exocrine function",
        "Hepatic perfusion"
      ],
      "answerIndex": 1,
      "explanation": "The test evaluates whether the gallbladder fills and contracts after a fatty meal."
    },
    {
      "question": "Failure to visualize the gallbladder on HIDA scanning supports the diagnosis of:",
      "choices": [
        "Chronic pancreatitis",
        "Acute cholecystitis",
        "Portal hypertension",
        "Gastric ulcer"
      ],
      "answerIndex": 1,
      "explanation": "In acute cholecystitis the gallbladder is not visualized on HIDA scanning."
    },
    {
      "question": "Which investigation can both diagnose and treat common bile duct stones?",
      "choices": [
        "MRCP",
        "Ultrasonography",
        "ERCP",
        "Plain radiography"
      ],
      "answerIndex": 2,
      "explanation": "ERCP can visualize the ducts and permit sphincterotomy and stone extraction."
    },
    {
      "question": "Which procedure is primarily non-invasive and generally diagnostic rather than therapeutic?",
      "choices": [
        "ERCP",
        "MRCP",
        "PTC drainage",
        "Choledochoscopy"
      ],
      "answerIndex": 1,
      "explanation": "MRCP images the biliary tree without contrast or endoscopic intervention."
    },
    {
      "question": "Brush cytology can be obtained during:",
      "choices": [
        "Ultrasonography",
        "ERCP",
        "HIDA scanning",
        "Plain radiography"
      ],
      "answerIndex": 1,
      "explanation": "The lecture lists brush cytology as one of the uses of ERCP."
    },
    {
      "question": "Before percutaneous transhepatic cholangiography, the most important prerequisite is:",
      "choices": [
        "Normal bleeding profile",
        "Normal serum amylase",
        "Negative HIDA scan",
        "Normal renal ultrasound"
      ],
      "answerIndex": 0,
      "explanation": "The lecture specifically notes that the bleeding profile should be normal before PTC."
    },
    {
      "question": "CT scanning is particularly useful in biliary disease for assessing:",
      "choices": [
        "Gallbladder contraction only",
        "Tumors, lymph nodes and metastases",
        "Only radiolucent stones",
        "Cystic duct valves"
      ],
      "answerIndex": 1,
      "explanation": "CT is emphasized for biliary tumors and evaluation of lymphadenopathy and metastases."
    },
    {
      "question": "Operative choledochoscopy is used after common bile duct exploration mainly to detect:",
      "choices": [
        "Gallbladder carcinoma",
        "Residual duct stones",
        "Portal vein thrombosis",
        "Bile secretion rate"
      ],
      "answerIndex": 1,
      "explanation": "A choledochoscope directly inspects the common bile duct for retained stones."
    },
    {
      "question": "Which investigation is LEAST appropriate as a therapeutic procedure?",
      "choices": [
        "ERCP with sphincterotomy",
        "PTC with drainage",
        "MRCP",
        "Choledochoscopic stone removal"
      ],
      "answerIndex": 2,
      "explanation": "MRCP is a diagnostic imaging technique and does not provide therapy."
    },
    {
      "question": "The classical patient described for cholesterol gallstones is:",
      "choices": [
        "Thin young man",
        "Fat, fertile female around fifty",
        "Child with appendicitis",
        "Elderly man with peptic ulcer"
      ],
      "answerIndex": 1,
      "explanation": "The lecture uses the classical association of fat, fertile, female and around fifty."
    },
    {
      "question": "Approximately what proportion of gallstones are cholesterol stones?",
      "choices": [
        "25%",
        "50%",
        "75%",
        "95%"
      ],
      "answerIndex": 2,
      "explanation": "The lecture classifies about 75% as cholesterol stones."
    },
    {
      "question": "Black pigment stones are classically associated with:",
      "choices": [
        "Chronic hemolysis",
        "Hyperthyroidism",
        "Peptic ulcer",
        "Appendicitis"
      ],
      "answerIndex": 0,
      "explanation": "Black pigment stones are associated with hereditary spherocytosis, thalassemia and other hemolytic states."
    },
    {
      "question": "Brown pigment stones are most strongly associated with:",
      "choices": [
        "Biliary infection",
        "Obesity alone",
        "Pregnancy alone",
        "Gastric surgery alone"
      ],
      "answerIndex": 0,
      "explanation": "Brown pigment stones form in the biliary tree and are associated with infection."
    },
    {
      "question": "Which organism contributes to pigment stone formation through beta-glucuronidase production?",
      "choices": [
        "Escherichia coli",
        "Staphylococcus aureus",
        "Mycobacterium tuberculosis",
        "Helicobacter pylori"
      ],
      "answerIndex": 0,
      "explanation": "E. coli beta-glucuronidase converts conjugated bilirubin into unconjugated bilirubin."
    },
    {
      "question": "A reduction in the bile salt-to-cholesterol ratio produces:",
      "choices": [
        "Dilute bile",
        "Lithogenic bile",
        "Hemobilia",
        "Achlorhydria"
      ],
      "answerIndex": 1,
      "explanation": "Lowering the bile salt-to-cholesterol ratio makes bile supersaturated and lithogenic."
    },
    {
      "question": "Terminal ileal disease increases cholesterol-stone risk mainly by reducing:",
      "choices": [
        "Bile salt recycling",
        "Gallbladder mucus",
        "Pancreatic enzymes",
        "Portal blood flow"
      ],
      "answerIndex": 0,
      "explanation": "Terminal ileal disease or resection reduces bile salt reabsorption and lowers the bile salt pool."
    },
    {
      "question": "Which condition promotes gallstone formation through gallbladder stasis?",
      "choices": [
        "Truncal vagotomy",
        "Hyperventilation",
        "Hyperparathyroidism only",
        "Left colectomy"
      ],
      "answerIndex": 0,
      "explanation": "The lecture lists stasis after vagotomy as a risk factor."
    },
    {
      "question": "Long-term total parenteral nutrition predisposes to gallstones mainly through:",
      "choices": [
        "Excess gastric acid",
        "Biliary stasis",
        "Portal hypertension",
        "Increased pancreatic drainage"
      ],
      "answerIndex": 1,
      "explanation": "Prolonged TPN reduces normal gallbladder emptying and promotes stasis."
    },
    {
      "question": "The majority of gallstones are:",
      "choices": [
        "Always symptomatic",
        "Silent",
        "Always infected",
        "Always radio-opaque"
      ],
      "answerIndex": 1,
      "explanation": "The lecture states that many gallstones are discovered incidentally."
    },
    {
      "question": "Typical biliary colic is commonly precipitated by:",
      "choices": [
        "A fatty meal",
        "Fasting",
        "Exercise",
        "Cold exposure"
      ],
      "answerIndex": 0,
      "explanation": "Fatty food stimulates gallbladder contraction and may trigger pain when a stone obstructs outflow."
    },
    {
      "question": "The usual site of biliary colic is the:",
      "choices": [
        "Left iliac fossa",
        "Right hypochondrium",
        "Suprapubic region",
        "Left lumbar region"
      ],
      "answerIndex": 1,
      "explanation": "The lecture describes recurrent pain in the right hypochondrium."
    },
    {
      "question": "Biliary pain commonly radiates to the:",
      "choices": [
        "Left groin",
        "Right subscapular or interscapular region",
        "Perineum",
        "Left shoulder only"
      ],
      "answerIndex": 1,
      "explanation": "The lecture describes radiation to the back between the scapulae, especially the right subscapular region."
    },
    {
      "question": "A stone impacted in the common bile duct may cause all of the following EXCEPT:",
      "choices": [
        "Obstructive jaundice",
        "Ascending cholangitis",
        "Acute pancreatitis",
        "Isolated appendicitis"
      ],
      "answerIndex": 3,
      "explanation": "Common bile duct stones can cause jaundice, cholangitis and pancreatitis, not appendicitis."
    },
    {
      "question": "Gallstone ileus results from a gallstone entering the:",
      "choices": [
        "Portal vein",
        "Intestine",
        "Pancreatic parenchyma",
        "Splenic artery"
      ],
      "answerIndex": 1,
      "explanation": "The lecture lists acute intestinal obstruction from gallstone ileus as an intestinal complication."
    },
    {
      "question": "Mucocele of the gallbladder most directly follows obstruction of the:",
      "choices": [
        "Pancreatic duct",
        "Cystic duct",
        "Portal vein",
        "Common hepatic artery"
      ],
      "answerIndex": 1,
      "explanation": "Persistent cystic-duct obstruction leads to distension and mucocele formation."
    },
    {
      "question": "A patient with hereditary spherocytosis is at increased risk of:",
      "choices": [
        "Black pigment stones",
        "Pure cholesterol stones only",
        "No gallstones",
        "Porcelain gallbladder only"
      ],
      "answerIndex": 0,
      "explanation": "Chronic hemolysis increases bilirubin load and favors black pigment stones."
    },
    {
      "question": "Which stone type is formed primarily within the biliary tree rather than the gallbladder?",
      "choices": [
        "Brown pigment stone",
        "Black pigment stone",
        "Pure cholesterol stone",
        "Mixed cholesterol stone"
      ],
      "answerIndex": 0,
      "explanation": "Brown pigment stones are described as primary stones of the biliary tree."
    },
    {
      "question": "Which statement about cholesterol stones is TRUE?",
      "choices": [
        "They are usually radio-opaque",
        "They account for about 75% of stones",
        "They are always infected",
        "They occur only in men"
      ],
      "answerIndex": 1,
      "explanation": "The lecture classifies approximately three quarters of gallstones as cholesterol stones."
    },
    {
      "question": "The first step in cholesterol-stone formation described in the lecture is:",
      "choices": [
        "Stone perforation",
        "Lithogenic supersaturated bile",
        "Cholangitis",
        "Pancreatic necrosis"
      ],
      "answerIndex": 1,
      "explanation": "Disturbed bile salt-cholesterol balance produces lithogenic bile, followed by vesicle aggregation and stone growth."
    },
    {
      "question": "The most typical presentation of chronic calculous cholecystitis is:",
      "choices": [
        "Recurrent right hypochondrial pain after fatty meals",
        "Massive hematemesis",
        "Painless hematuria",
        "Left-sided chest pain only"
      ],
      "answerIndex": 0,
      "explanation": "Chronic calculous cholecystitis commonly presents with recurrent biliary pain precipitated by fatty meals."
    },
    {
      "question": "Murphy's sign is elicited by palpating the gallbladder area while asking the patient to:",
      "choices": [
        "Cough",
        "Take a deep breath",
        "Flex the hip",
        "Swallow water"
      ],
      "answerIndex": 1,
      "explanation": "A positive Murphy sign occurs when inspiration is interrupted by pain during right subcostal palpation."
    },
    {
      "question": "Which condition is included in the differential diagnosis of chronic biliary pain in the lecture?",
      "choices": [
        "Peptic ulcer",
        "Meningitis",
        "Glomerulonephritis",
        "Otitis media"
      ],
      "answerIndex": 0,
      "explanation": "The lecture lists peptic ulcer and hiatus hernia among the differential diagnoses."
    },
    {
      "question": "The initial imaging study for chronic calculous cholecystitis is:",
      "choices": [
        "Abdominal ultrasonography",
        "Cerebral CT",
        "Barium enema",
        "Coronary angiography"
      ],
      "answerIndex": 0,
      "explanation": "Ultrasound can show stones, wall thickness, duct size and duct stones."
    },
    {
      "question": "A symptomatic patient with gallstones is generally treated by:",
      "choices": [
        "Observation only",
        "Cholecystectomy",
        "Splenectomy",
        "Colectomy"
      ],
      "answerIndex": 1,
      "explanation": "The lecture recommends open or laparoscopic cholecystectomy for symptomatic stones."
    },
    {
      "question": "An advantage of laparoscopic cholecystectomy is:",
      "choices": [
        "Longer hospital stay",
        "More postoperative pain",
        "Earlier return to work",
        "Worse cosmetic result"
      ],
      "answerIndex": 2,
      "explanation": "The lecture lists less pain, shorter stay, earlier return to work and better cosmesis."
    },
    {
      "question": "Which was listed in the lecture as a contraindication to laparoscopic surgery?",
      "choices": [
        "Carcinoma of the gallbladder",
        "Simple biliary colic",
        "Radiolucent stone",
        "Normal cardiac function"
      ],
      "answerIndex": 0,
      "explanation": "Gallbladder carcinoma appears in the lecture's contraindication list for laparoscopic surgery."
    },
    {
      "question": "Medical dissolution therapy is most suitable when the gallbladder is:",
      "choices": [
        "Non-functioning",
        "Functioning",
        "Perforated",
        "Gangrenous"
      ],
      "answerIndex": 1,
      "explanation": "A functioning gallbladder is one of the stated criteria for dissolution therapy."
    },
    {
      "question": "Which stone is most suitable for medical dissolution therapy?",
      "choices": [
        "Pure cholesterol stone under 2 cm",
        "Large calcified stone",
        "Brown pigment stone with cholangitis",
        "Stone in a perforated gallbladder"
      ],
      "answerIndex": 0,
      "explanation": "The lecture requires a small pure cholesterol stone in a functioning gallbladder."
    },
    {
      "question": "A drug used for medical dissolution of cholesterol stones is:",
      "choices": [
        "Ursodeoxycholic acid",
        "Metronidazole alone",
        "Heparin",
        "Omeprazole"
      ],
      "answerIndex": 0,
      "explanation": "Ursodeoxycholic acid is listed as a dissolution agent."
    },
    {
      "question": "A recognized adverse effect of bile-acid dissolution therapy is:",
      "choices": [
        "Diarrhea",
        "Profound neutropenia",
        "Deafness",
        "Retinal detachment"
      ],
      "answerIndex": 0,
      "explanation": "The lecture lists diarrhea and hepatotoxicity as possible adverse effects."
    },
    {
      "question": "Extracorporeal shock-wave lithotripsy is most appropriate for:",
      "choices": [
        "Selected cholesterol stones",
        "Any calcified giant stone",
        "Gangrenous cholecystitis",
        "Gallbladder carcinoma"
      ],
      "answerIndex": 0,
      "explanation": "The lecture describes ESWL as suitable for selected cholesterol stones."
    },
    {
      "question": "Which is a contraindication to ESWL for gallstones?",
      "choices": [
        "Functioning gallbladder",
        "Small cholesterol stone",
        "Bleeding diathesis",
        "Radiolucent stone"
      ],
      "answerIndex": 2,
      "explanation": "Bleeding diathesis is specifically listed as a contraindication."
    },
    {
      "question": "A non-functioning gallbladder makes which treatment unsuitable?",
      "choices": [
        "Medical dissolution therapy",
        "Emergency resuscitation",
        "Antibiotic therapy",
        "Open drainage of an abscess"
      ],
      "answerIndex": 0,
      "explanation": "Successful dissolution therapy requires a functioning gallbladder."
    },
    {
      "question": "A diabetic patient with silent gallstones was identified in the lecture as a patient in whom:",
      "choices": [
        "Surgery may be considered",
        "Gallstones can never become symptomatic",
        "Ultrasound is contraindicated",
        "ERCP must always be done immediately"
      ],
      "answerIndex": 0,
      "explanation": "The lecture lists diabetic patients among selected silent-stone patients considered for treatment."
    },
    {
      "question": "The usual initiating event in acute calculous cholecystitis is obstruction of the:",
      "choices": [
        "Cystic duct or Hartmann pouch",
        "Portal vein",
        "Pancreatic duct only",
        "Left hepatic vein"
      ],
      "answerIndex": 0,
      "explanation": "The lecture describes stone impaction in the cystic duct or Hartmann pouch as the cause."
    },
    {
      "question": "After cystic-duct obstruction, retained bile first produces:",
      "choices": [
        "Chemical cholecystitis",
        "Portal hypertension",
        "Splenic infarction",
        "Gastric perforation"
      ],
      "answerIndex": 0,
      "explanation": "The sequence starts with bile retention and chemical inflammation."
    },
    {
      "question": "Persistent obstruction followed by secondary bacterial infection produces:",
      "choices": [
        "Empyema of the gallbladder",
        "Achalasia",
        "Ascites",
        "Hemorrhoids"
      ],
      "answerIndex": 0,
      "explanation": "Secondary infection of an obstructed gallbladder can produce empyema."
    },
    {
      "question": "If vascular thrombosis develops in severe acute cholecystitis, the major feared result is:",
      "choices": [
        "Gangrene and perforation",
        "Barrett esophagus",
        "Portal cavernoma",
        "Renal calculus"
      ],
      "answerIndex": 0,
      "explanation": "Vascular thrombosis may lead to gallbladder gangrene and perforation."
    },
    {
      "question": "Acute emphysematous cholecystitis is especially associated with:",
      "choices": [
        "Diabetes mellitus",
        "Asthma",
        "Hyperthyroidism",
        "Migraine"
      ],
      "answerIndex": 0,
      "explanation": "The lecture highlights diabetics with clostridial infection."
    },
    {
      "question": "Gas formation with early gangrene is characteristic of:",
      "choices": [
        "Acute emphysematous cholecystitis",
        "Chronic calculous cholecystitis",
        "Silent gallstones",
        "Biliary dyspepsia"
      ],
      "answerIndex": 0,
      "explanation": "Clostridial infection can cause gas, early gangrene and perforation."
    },
    {
      "question": "Pain from diaphragmatic irritation in acute cholecystitis may be referred to the:",
      "choices": [
        "Right shoulder",
        "Left groin",
        "Perineum",
        "Right foot"
      ],
      "answerIndex": 0,
      "explanation": "The lecture describes right-shoulder referral from diaphragmatic irritation."
    },
    {
      "question": "Boas sign refers to hyperesthesia over the:",
      "choices": [
        "Right posterior 9th-11th ribs",
        "Left anterior chest",
        "Suprapubic region",
        "Right ankle"
      ],
      "answerIndex": 0,
      "explanation": "The lecture defines Boas sign as hyperesthesia over the posterior right 9th to 11th ribs."
    },
    {
      "question": "A common laboratory finding in acute cholecystitis is:",
      "choices": [
        "Leukocytosis",
        "Severe thrombocytopenia in every case",
        "Hypernatremia only",
        "Low serum amylase in every case"
      ],
      "answerIndex": 0,
      "explanation": "Leukocytosis is listed among the laboratory findings."
    },
    {
      "question": "Ultrasonography in acute cholecystitis may demonstrate all EXCEPT:",
      "choices": [
        "Gallstones",
        "Wall thickening",
        "Pericholecystic collection",
        "Failure of LES relaxation"
      ],
      "answerIndex": 3,
      "explanation": "Failure of LES relaxation is related to achalasia, not acute cholecystitis."
    },
    {
      "question": "A HIDA scan in acute cholecystitis typically shows:",
      "choices": [
        "Non-visualization of the gallbladder",
        "Immediate intense gallbladder filling",
        "Absent hepatic uptake only",
        "Dilated esophagus"
      ],
      "answerIndex": 0,
      "explanation": "Cystic-duct obstruction prevents gallbladder visualization."
    },
    {
      "question": "According to the lecture, early surgery is favored when the patient is fit and the attack is within:",
      "choices": [
        "3-4 days",
        "3-4 weeks",
        "3-4 months",
        "One year"
      ],
      "answerIndex": 0,
      "explanation": "The lecture gives an early-surgery window of no more than three to four days."
    },
    {
      "question": "Initial conservative management of acute cholecystitis includes:",
      "choices": [
        "Nil by mouth, antibiotics and analgesia",
        "Immediate oral fatty meal",
        "Anticoagulation only",
        "High-dose laxatives only"
      ],
      "answerIndex": 0,
      "explanation": "The lecture includes fasting, broad-spectrum antibiotics plus metronidazole, analgesia and monitoring."
    },
    {
      "question": "A patient deteriorating during conservative treatment of acute cholecystitis should undergo:",
      "choices": [
        "Surgical intervention",
        "Continued observation indefinitely",
        "Oral dissolution only",
        "No further treatment"
      ],
      "answerIndex": 0,
      "explanation": "Deterioration is an indication for cholecystectomy or cholecystostomy."
    },
    {
      "question": "Acute acalculous cholecystitis commonly occurs in:",
      "choices": [
        "Critically ill patients",
        "Healthy young athletes only",
        "Patients with isolated rhinitis",
        "Patients with uncomplicated reflux"
      ],
      "answerIndex": 0,
      "explanation": "It is associated with burns, sepsis, trauma and major surgery."
    },
    {
      "question": "Which is a predisposing factor for acute acalculous cholecystitis?",
      "choices": [
        "Prolonged ileus",
        "Frequent exercise",
        "High-fiber diet",
        "Short-term antacid use"
      ],
      "answerIndex": 0,
      "explanation": "Prolonged ileus promotes stasis and is listed as a risk factor."
    },
    {
      "question": "The pathogenesis of acute acalculous cholecystitis prominently involves:",
      "choices": [
        "Bile stasis and gallbladder-wall ischemic injury",
        "Only cholesterol supersaturation",
        "Portal-vein rupture",
        "Gastric acid hypersecretion"
      ],
      "answerIndex": 0,
      "explanation": "The lecture describes stasis, distension, inspissated bile, ulceration and thrombosis."
    },
    {
      "question": "Gallbladder-wall thickness greater than approximately what value supports acute acalculous cholecystitis in the lecture?",
      "choices": [
        "1 mm",
        "2 mm",
        "4 mm",
        "10 mm"
      ],
      "answerIndex": 2,
      "explanation": "The lecture cites wall thickness greater than 4 mm."
    },
    {
      "question": "The recommended treatment for acute acalculous cholecystitis in the lecture is:",
      "choices": [
        "Emergency cholecystectomy",
        "Long-term observation only",
        "PPI therapy",
        "Elective colectomy"
      ],
      "answerIndex": 0,
      "explanation": "The lecture recommends emergency operative treatment because missed disease has high mortality."
    },
    {
      "question": "Which statement about acute acalculous cholecystitis is FALSE?",
      "choices": [
        "It may follow burns",
        "It may occur after multiple trauma",
        "It is always caused by a gallstone",
        "It may be associated with sepsis"
      ],
      "answerIndex": 2,
      "explanation": "By definition, acute acalculous cholecystitis occurs without stones."
    },
    {
      "question": "The most common histological type of gallbladder carcinoma is:",
      "choices": [
        "Adenocarcinoma",
        "Lymphoma",
        "Melanoma",
        "Sarcoma"
      ],
      "answerIndex": 0,
      "explanation": "The lecture states that about 90% are adenocarcinomas."
    },
    {
      "question": "Gallbladder carcinoma is associated with gallstones in approximately:",
      "choices": [
        "10%",
        "30%",
        "50%",
        "90%"
      ],
      "answerIndex": 3,
      "explanation": "The lecture reports gallstones in about 90% of cases."
    },
    {
      "question": "The most common direct site of invasion by gallbladder carcinoma is the:",
      "choices": [
        "Liver",
        "Spleen",
        "Kidney",
        "Bladder"
      ],
      "answerIndex": 0,
      "explanation": "Direct invasion of the adjacent liver is emphasized in the lecture."
    },
    {
      "question": "Gallbladder carcinoma is often first diagnosed:",
      "choices": [
        "During or after cholecystectomy",
        "Only by colonoscopy",
        "Only after brain metastasis",
        "Only in childhood"
      ],
      "answerIndex": 0,
      "explanation": "The lecture notes that it is frequently discovered intraoperatively or after histology."
    },
    {
      "question": "Jaundice in gallbladder carcinoma may result from:",
      "choices": [
        "Porta-hepatis lymph nodes or liver metastases",
        "Isolated cystitis",
        "Achalasia",
        "Hemorrhoids"
      ],
      "answerIndex": 0,
      "explanation": "Enlarged porta-hepatis nodes or hepatic spread may obstruct bile flow."
    },
    {
      "question": "A right hypochondrial mass in an elderly patient with gallstones should raise concern for:",
      "choices": [
        "Gallbladder carcinoma",
        "Simple migraine",
        "Appendicitis only",
        "Nephrotic syndrome"
      ],
      "answerIndex": 0,
      "explanation": "The lecture includes a right hypochondrial mass among the possible presentations."
    },
    {
      "question": "Which route of spread is described for gallbladder carcinoma?",
      "choices": [
        "Direct, lymphatic, venous and systemic",
        "Only intraluminal spread",
        "Only neural spread",
        "No metastatic spread"
      ],
      "answerIndex": 0,
      "explanation": "The lecture lists direct liver invasion, lymphatic and venous spread, and distant spread to bone and lung."
    },
    {
      "question": "A potentially resectable gallbladder carcinoma may be treated with:",
      "choices": [
        "Cholecystectomy with wedge excision of adjacent liver and lymph-node clearance",
        "Appendectomy alone",
        "Medical dissolution therapy",
        "ERCP alone as definitive cure"
      ],
      "answerIndex": 0,
      "explanation": "The lecture gives an extended surgical approach for operable disease."
    },
    {
      "question": "Which statement is TRUE regarding gallbladder carcinoma in the lecture?",
      "choices": [
        "It is commonly advanced at diagnosis",
        "It is always found in children",
        "It is unrelated to gallstones",
        "Squamous carcinoma accounts for 90%"
      ],
      "answerIndex": 0,
      "explanation": "The lecture states that many tumors are advanced and inoperable when recognized."
    },
    {
      "question": "A patient with right hypochondrial pain after fatty meals, no fever and normal inflammatory markers most likely has:",
      "choices": [
        "Biliary colic from chronic calculous disease",
        "Acute emphysematous cholecystitis",
        "Gallbladder perforation",
        "Acute acalculous cholecystitis"
      ],
      "answerIndex": 0,
      "explanation": "Intermittent postprandial pain without systemic inflammation is most consistent with uncomplicated biliary colic."
    },
    {
      "question": "A septic, ventilated trauma patient develops fever, right hypochondrial tenderness and a thick-walled gallbladder without stones. The MOST likely diagnosis is:",
      "choices": [
        "Acute acalculous cholecystitis",
        "Chronic calculous cholecystitis",
        "Silent cholelithiasis",
        "Hiatus hernia"
      ],
      "answerIndex": 0,
      "explanation": "Critical illness plus gallbladder inflammation without stones is the classic pattern."
    },
    {
      "question": "A diabetic patient with severe right upper-quadrant pain has gas in the gallbladder wall. The diagnosis is:",
      "choices": [
        "Acute emphysematous cholecystitis",
        "Biliary dyspepsia",
        "Simple silent stone",
        "Oral cholecystogram reaction"
      ],
      "answerIndex": 0,
      "explanation": "Gas in the gallbladder wall in a diabetic strongly indicates emphysematous cholecystitis."
    },
    {
      "question": "A patient with suspected common bile duct stone requires both confirmation and immediate stone extraction. The BEST procedure is:",
      "choices": [
        "MRCP",
        "ERCP",
        "HIDA scan",
        "Plain radiography"
      ],
      "answerIndex": 1,
      "explanation": "ERCP provides duct imaging and allows sphincterotomy with stone extraction."
    },
    {
      "question": "A patient with suspected biliary malignancy requires non-invasive mapping of the biliary tree before planning treatment. The BEST investigation from the lecture is:",
      "choices": [
        "MRCP",
        "Oral cholecystography",
        "Plain abdominal radiography",
        "HIDA only"
      ],
      "answerIndex": 0,
      "explanation": "MRCP non-invasively delineates the biliary tree and is suited to diagnostic mapping."
    }
  ]

  const lecturePartDefinitions = [
    {
      id: "anatomy-physiology",
      label: "Part 1 · Anatomy, Anomalies & Physiology",
      description: "Gallbladder and bile duct anatomy, congenital variants, blood supply, lymphatics, and bile physiology.",
      start: 1,
      end: 19
    },
    {
      id: "investigations",
      label: "Part 2 · Biliary Investigations",
      description: "Imaging, cholangiography, endoscopy, and operative investigation of biliary disease.",
      start: 20,
      end: 31
    },
    {
      id: "gallstones",
      label: "Part 3 · Gallstones: Types & Formation",
      description: "Stone types, pathogenesis, risk factors, presentations, and complications.",
      start: 32,
      end: 51
    },
    {
      id: "chronic-calculous",
      label: "Part 4 · Chronic Calculous Disease & Treatment",
      description: "Chronic calculous disease, diagnosis, surgery, dissolution therapy, and lithotripsy.",
      start: 52,
      end: 66
    },
    {
      id: "acute-cholecystitis",
      label: "Part 5 · Acute Calculous & Acalculous Cholecystitis",
      description: "Acute inflammation, complications, diagnosis, conservative care, and operative treatment.",
      start: 67,
      end: 86
    },
    {
      id: "carcinoma-cases",
      label: "Part 6 · Gallbladder Carcinoma & Clinical Cases",
      description: "Gallbladder malignancy plus integrated diagnostic and management cases.",
      start: 87,
      end: 100
    }
  ]

  const lectureParts = lecturePartDefinitions.map((definition, index) => ({
    id: `mahmoud-reda-biliary-${definition.id}`,
    label: definition.label,
    description: definition.description,
    range: `Q${definition.start}–${definition.end}`,
    questionStart: definition.start,
    questionEnd: definition.end,
    parentSourceId: "mahmoud-reda-biliary",
    groupId: "biliary-system",
    groupLabel: "Biliary System",
    partIndex: index,
    partCount: lecturePartDefinitions.length,
    shuffleQuestions: false,
    shuffleOptions: false,
    mcqs: lectureQuestions.slice(definition.start - 1, definition.end)
  }))

  quizzes[topicLabel] = {
    ...topicConfig,
    label: topicLabel,
    alwaysShowSourcePicker: true,
    shuffleQuestions: false,
    shuffleOptions: false,
    sources: [
      ...existingSources,
      {
        id: "mahmoud-reda-biliary",
        label: "Training MCQs",
        description: "100 lecture-based biliary system MCQs.",
        shuffleQuestions: false,
        shuffleOptions: false,
        collection: {
          prompt: "Choose a topic-based part or a revision mode.",
          groupNoun: "topic",
          groupEyebrow: "Lecture bank",
          mixedMeta: "Random questions from all 100 biliary lecture MCQs.",
          mixedSizes: [
            { id: "quick-20", label: "Quick 20", size: 20, description: "A short mixed revision session." },
            { id: "standard-30", label: "Standard 30", size: 30, description: "Balanced mixed practice." },
            { id: "exam-50", label: "Exam 50", size: 50, description: "A longer exam-style revision set." }
          ],
          wrongReviewId: "mahmoud-reda-biliary-wrong-review",
          groups: [
            {
              id: "biliary-system",
              label: "Biliary System",
              questionCount: lectureQuestions.length,
              parts: lectureParts
            }
          ]
        },
        mcqs: lectureQuestions
      }
    ]
  }
})()
