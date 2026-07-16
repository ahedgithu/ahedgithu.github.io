window.MEDMAP_TOPICS = Object.freeze([
  {
    "schemaVersion": 2,
    "id": "acute-pancreatitis",
    "title": "Acute & Chronic Pancreatitis",
    "subtitle": "Complete Pancreas extraction: anatomy, acute pancreatitis, chronic pancreatitis, and exocrine insufficiency",
    "sourceMeta": {
      "title": "Diseases of the Pancreas — newly extracted lecture text",
      "url": "",
      "capturedFrom": "Ready-extracted Obsidian lecture text; lecturer name intentionally omitted",
      "rawFile": "data/raw/acute-pancreatitis.txt",
      "verificationSources": [
        "https://pubmed.ncbi.nlm.nih.gov/38857482/",
        "https://gastro.org/clinical-guidance/initial-management-of-acute-pancreatitis-ap/",
        "https://gastro.org/clinical-guidance/management-of-pancreatic-necrosis/",
        "https://www.nice.org.uk/guidance/ng104/chapter/recommendations"
      ]
    },
    "groups": [
      {
        "id": "foundation",
        "title": "الأساسيات والتشريح"
      },
      {
        "id": "acute-core",
        "title": "الالتهاب الحاد"
      },
      {
        "id": "acute-assessment",
        "title": "تشخيص وشدة الالتهاب الحاد"
      },
      {
        "id": "acute-management",
        "title": "علاج الالتهاب الحاد"
      },
      {
        "id": "chronic-core",
        "title": "الالتهاب المزمن"
      },
      {
        "id": "chronic-assessment",
        "title": "فحوصات ووظيفة البنكرياس المزمن"
      },
      {
        "id": "chronic-management",
        "title": "علاج الالتهاب المزمن"
      }
    ],
    "sections": [
      {
        "id": "pancreas-anatomy",
        "groupId": "foundation",
        "title": "PANCREAS ANATOMY",
        "explanationBlocks": [
          {
            "type": "established",
            "lang": "ar",
            "label": "الشرح بالمصري",
            "title": "المكان والوظيفتين",
            "paragraphs": [
              "البنكرياس عضو طويل ورا المعدة، رأسه داخل تقوّس الـ duodenum وذيله قريب من الطحال. المكان الخلفي ده يفسّر ليه ألم البنكرياس ممكن يمتد للظهر وليه الالتهاب المبكر ما يعملش guarding واضح زي التهاب داخل تجويف البطن.",
              "الجزء exocrine يعني الجزء اللي بيصب إفرازاته في قنوات: بيطلع إنزيمات هضم غير نشطة وbicarbonate يعادل حمض المعدة. الجزء endocrine يعني الجزء اللي بيطلع هرمونات مباشرة للدم من islets of Langerhans، وأهمها insulin وglucagon لتنظيم سكر الدم."
            ],
            "items": [
              "Duodenum يعني أول جزء من الأمعاء الدقيقة، وفيه الإنزيمات البنكرياسية بتتنشّط طبيعيًا.",
              "Main pancreatic duct يعني القناة الرئيسية اللي تجمع إفرازات البنكرياس وتنقلها ناحية الاثني عشر.",
              "Islets of Langerhans يعني جزر خلايا صمّاء داخل البنكرياس مسؤولة عن الهرمونات."
            ]
          }
        ],
        "termCoverage": [
          {
            "term": "Duodenum",
            "meaning": "أول جزء من الأمعاء الدقيقة"
          },
          {
            "term": "Exocrine",
            "meaning": "الجزء اللي بيصب إفرازاته في قنوات"
          },
          {
            "term": "Endocrine",
            "meaning": "الجزء اللي بيطلع هرمونات مباشرة للدم"
          },
          {
            "term": "Islets of Langerhans",
            "meaning": "جزر خلايا صمّاء داخل البنكرياس مسؤولة عن الهرمونات"
          }
        ],
        "sourceBlocks": [
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "PANCREAS ANATOMY",
            "items": [
              "The pancreas is an elongated, tapered organ located across the back of the abdomen, behind the stomach.",
              "The right side of the organ (called the head) is the widest part of the organ and lies in the curve of the duodenum (the first section of the small intestine).",
              "The tapered left side extends slightly upward (called the body of the pancreas) and ends near the spleen (called the tail).",
              "The pancreas is made up of two types of tissue:",
              "Exocrine tissue: The exocrine tissue secretes digestive enzymes. These are secreted into a network of ducts that join the main pancreatic duct, which runs the length of the pancreas.",
              "Endocrine tissue: The endocrine tissue, which consists of the islets of Langerhans, secretes hormones into the bloodstream.",
              "The pancreas has digestive and hormonal functions:",
              "The enzymes secreted by the exocrine tissue in the pancreas help break down carbohydrates, fats, and proteins in the duodenum.",
              "These enzymes travel down the pancreatic duct into the bile duct in an inactive form.",
              "When they enter the duodenum, they are activated.",
              "The exocrine tissue also secretes bicarbonate to neutralize stomach acid in the duodenum.",
              "The hormones secreted by the endocrine tissue in the pancreas are insulin, glucagon (which regulate the level of glucose in the blood), somatostatin (which prevents the release of the other two hormones), and many others."
            ]
          }
        ]
      },
      {
        "id": "pancreatitis-overview",
        "groupId": "foundation",
        "title": "WHAT IS PANCREATITIS?",
        "explanationBlocks": [
          {
            "type": "established",
            "lang": "ar",
            "label": "الشرح بالمصري",
            "title": "الفكرة الأساسية والفرق بين acute وchronic",
            "paragraphs": [
              "Pancreatitis يعني التهاب البنكرياس. الطبيعي إن الإنزيمات تفضل غير نشطة لحد ما توصل للأمعاء؛ لو اتنشّطت جوه الغدة تبدأ autodigestion، يعني الإنزيمات تهضم نسيج البنكرياس نفسه.",
              "في acute pancreatitis الإصابة بتحصل فجأة وغالبًا النسيج يقدر يتعافى. تكرار النوبات أو استمرار الضرر يعمل fibrosis وفقد تدريجي في الشكل والوظيفة، وده يمهّد لـ chronic pancreatitis اللي ما بيرجعش طبيعي بالكامل."
            ],
            "items": [
              "Autodigest يعني إن الإنزيمات تهضم نسيج البنكرياس نفسه.",
              "Morphologic changes يعني تغيّرات ثابتة في شكل وتركيب النسيج، مش مجرد أعراض مؤقتة."
            ]
          }
        ],
        "termCoverage": [
          {
            "term": "Pancreatitis",
            "meaning": "التهاب البنكرياس"
          },
          {
            "term": "Autodigest",
            "meaning": "الإنزيمات تهضم نسيج البنكرياس نفسه"
          },
          {
            "term": "Morphologic changes",
            "meaning": "تغيّرات ثابتة في شكل وتركيب النسيج"
          }
        ],
        "sourceBlocks": [
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "WHAT IS PANCREATITIS?",
            "items": [
              "Pancreatitis is an inflammatory process in which pancreatic enzymes autodigest the gland.",
              "Normally, digestive enzymes do not become active until they reach the small intestine, where they begin digesting food.",
              "But if these enzymes become active inside the pancreas, they start \"digesting\" the pancreas itself.",
              "The gland can sometimes heal without any impairment of function or any morphologic changes.",
              "This process is known as acute pancreatitis.",
              "It can recur intermittently, contributing to the functional and morphologic loss of the gland.",
              "Recurrent attacks are referred to as chronic pancreatitis.",
              "Acute pancreatitis occurs suddenly and lasts for a short period of time and usually resolves.",
              "Chronic pancreatitis does not resolve itself and results in a slow destruction of the pancreas."
            ]
          }
        ]
      },
      {
        "id": "acute-definition-types",
        "groupId": "acute-core",
        "title": "ACUTE PANCREATITIS / TYPES",
        "explanationBlocks": [
          {
            "type": "established",
            "lang": "ar",
            "label": "الشرح بالمصري",
            "title": "تنشيط الإنزيمات وشدة تلف النسيج",
            "paragraphs": [
              "Acute pancreatitis يبدأ بتنشيط الإنزيمات داخل البنكرياس. في النوع edematous يحصل التهاب وتسريب سوائل وتورّم، وقد يحصل fat necrosis حوالين الغدة مع بقاء معظم acinar cells المنتجة للإنزيمات سليمة؛ لذلك غالبًا يكون self-limited.",
              "في necrotizing أو haemorrhagic pancreatitis الضرر أعمق: أجزاء من النسيج تموت والأوعية ممكن تتآكل فيحصل نزيف. Coagulation necrosis يعني موت خلايا مع بقاء الشكل العام للنسيج فترة مؤقتة."
            ],
            "items": [
              "Acinar cells يعني الخلايا الخارجية الإفراز اللي بتصنّع إنزيمات الهضم.",
              "Peripancreatic fat necrosis يعني موت الدهون المحيطة بالبنكرياس بفعل الإنزيمات، خصوصًا lipase."
            ]
          }
        ],
        "termCoverage": [
          {
            "term": "Edematous",
            "meaning": "التهاب وتسريب سوائل وتورّم"
          },
          {
            "term": "Acinar cells",
            "meaning": "الخلايا الخارجية الإفراز اللي بتصنّع إنزيمات الهضم"
          },
          {
            "term": "Peripancreatic fat necrosis",
            "meaning": "موت الدهون المحيطة بالبنكرياس بفعل الإنزيمات"
          },
          {
            "term": "Coagulation necrosis",
            "meaning": "موت خلايا مع بقاء الشكل العام للنسيج فترة مؤقتة"
          }
        ],
        "sourceBlocks": [
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "ACUTE PANCREATITIS",
            "items": [
              "Acute inflammation resulting from intrapancreatic activation of digestive enzymes."
            ]
          },
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "TYPES",
            "items": [
              "Acute edematous pancreatitis: The pancreatic inflammation and disease is mild & self limited in most patients with peripancreatic fat necrosis but sparing acinar cells.",
              "Haemorrhagic or necrotizing pancreatitis: The inflammation m.b (may be) extensive & progressing to coagulation necrosis of the gland & the surrounding tissues.",
              "About 80,000 cases occur in the United States each year; some 20 percent of them are severe.",
              "Acute pancreatitis occurs more often in men than women."
            ]
          }
        ]
      },
      {
        "id": "acute-causes",
        "groupId": "acute-core",
        "title": "ACUTE PANCREATITIS — CAUSES",
        "explanationBlocks": [
          {
            "type": "established",
            "lang": "ar",
            "label": "الشرح بالمصري",
            "title": "إزاي كل سبب يشغّل الالتهاب؟",
            "paragraphs": [
              "Gallstones ممكن تقفل مخرج القناة المشتركة فيرتفع الضغط وترجع الإفرازات. Alcohol يؤذي acinar cells ويغيّر الإفرازات والقنوات. Post-ERCP يحصل بعد تهيّج أو إصابة فتحة القناة أثناء المنظار. Idiopathic يعني السبب لسه غير معروف بعد التقييم المعتاد.",
              "الأسباب الأقل شيوعًا إمّا أذى مباشر مثل trauma والجراحة، أو دوائي وعدوى، أو اضطراب metabolic زي ارتفاع calcium أو triglycerides، أو عيب تشريحي/انسداد زي pancreas divisum وSphincter of Oddi dysfunction. الفشل الكلوي وزراعة الأعضاء والبرد الشديد والتعرضات الكيميائية بتدخل بآليات مختلفة من اضطراب الاستقلاب أو التروية أو المناعة."
            ],
            "items": [
              "ERCP يعني منظار القنوات المرارية والبنكرياسية بالصبغة.",
              "Pancreas divisum يعني إن قنوات البنكرياس ما اندمجتش بالكامل أثناء التكوين الجنيني.",
              "Sphincter of Oddi dysfunction يعني اضطراب العضلة المنظمة لخروج الصفراء والعصارة البنكرياسية للاثني عشر."
            ]
          }
        ],
        "termCoverage": [
          {
            "term": "Idiopathic",
            "meaning": "السبب لسه غير معروف بعد التقييم المعتاد"
          },
          {
            "term": "ERCP",
            "meaning": "منظار القنوات المرارية والبنكرياسية بالصبغة"
          },
          {
            "term": "Pancreas divisum",
            "meaning": "قنوات البنكرياس ما اندمجتش بالكامل أثناء التكوين الجنيني"
          },
          {
            "term": "Sphincter of Oddi dysfunction",
            "meaning": "اضطراب العضلة المنظمة لخروج الصفراء والعصارة البنكرياسية للاثني عشر"
          }
        ],
        "sourceBlocks": [
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "CAUSES",
            "paragraphs": [
              "A) Common (90% of cases)",
              "B) Rare"
            ],
            "items": [
              "Gallstones",
              "Alcohol",
              "Idiopathic",
              "Post ERCP",
              "Post surgical (abdominal and cardiopulmonary bypass)",
              "Trauma",
              "Drugs (azathioprine, thiazide diuretics)",
              "Metabolic (Ca, TG)",
              "Pancreas divisum",
              "Hereditary",
              "Renal failure",
              "Organ transplantation (kidney, liver)",
              "Infection (mumps, coxsackie virus)",
              "Sphincter of Oddi dysfunction",
              "Severe hypothermia",
              "Petrochemical exposure"
            ]
          }
        ]
      },
      {
        "id": "acute-clinical-dd",
        "groupId": "acute-core",
        "title": "ACUTE — CLINICAL FEATURES / D.D.",
        "explanationBlocks": [
          {
            "type": "established",
            "lang": "ar",
            "label": "الشرح بالمصري",
            "title": "من الالتهاب للأعراض والعلامات",
            "paragraphs": [
              "الألم الشديد أعلى البطن بيمتد للظهر لأن البنكرياس retroperitoneal، يعني موجود خلف الغشاء البريتوني. الغثيان والقيء وشلل الأمعاء يحصلوا بسبب الالتهاب العام وتهيج الأعصاب، فتقل bowel sounds.",
              "في الحالات الشديدة تسريب السوائل خارج الأوعية يعمل hypovolemia ثم shock وoliguria، يعني قلة البول بسبب ضعف تروية الكلى. Grey Turner’s sign هو كدمات في الجنبين وCullen’s sign كدمات حول السرة؛ الاتنين يوحوا بنزف خلف البريتون ممتد للجلد."
            ],
            "items": [
              "Guarding يعني شد لا إرادي لعضلات البطن، وrebound tenderness يعني زيادة الألم عند رفع اليد فجأة بعد الضغط.",
              "D.D. يعني differential diagnosis أو الأمراض البديلة اللي ممكن تعمل صورة مشابهة، ومنها perforation وMI وacute cholecystitis."
            ]
          }
        ],
        "termCoverage": [
          {
            "term": "Retroperitoneal",
            "meaning": "موجود خلف الغشاء البريتوني"
          },
          {
            "term": "Oliguria",
            "meaning": "قلة البول بسبب ضعف تروية الكلى"
          },
          {
            "term": "Guarding",
            "meaning": "شد لا إرادي لعضلات البطن"
          },
          {
            "term": "Rebound tenderness",
            "meaning": "زيادة الألم عند رفع اليد فجأة بعد الضغط"
          },
          {
            "term": "D.D.",
            "meaning": "differential diagnosis أو الأمراض البديلة اللي ممكن تعمل صورة مشابهة"
          }
        ],
        "sourceBlocks": [
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "CLINICAL FEATURES",
            "items": [
              "Abdominal pain: Severe constant upper abdominal pain may radiate to back, usually build up over 15-60 mins.",
              "N & V (Nausea & Vomiting).",
              "Marked epigastric tenderness.",
              "N.B. In the early stages and in contrast to perforated P.U. (Peptic Ulcer), guarding and rebound tenderness are absent because the inflammation is retro peritoneal.",
              "Bowel sounds become quiet or absent as paralytic ileus develops.",
              "In severe cases the patient becomes hypoxic and develops hypovolemic shock with oliguria.",
              "Discoloration of the flanks (Grey Turner’s sign) or the periumbilical region (Cullen’s sign) are features of Hgic (Hemorrhagic) pancreatitis.",
              "Note on slide: Grey-Turner's sign involves haemorrhage appearing in both flanks. It is due to extensive retro-peritoneal bleeding and typically occurs in haemorrhagic pancreatitis."
            ]
          },
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "D.D (Differential Diagnosis)",
            "items": [
              "Perforated viscus",
              "M.I. (Myocardial Infarction)",
              "Acute cholecystitis"
            ]
          }
        ]
      },
      {
        "id": "acute-complications",
        "groupId": "acute-core",
        "title": "ACUTE — COMPLICATIONS",
        "explanationBlocks": [
          {
            "type": "established",
            "lang": "ar",
            "label": "الشرح بالمصري",
            "title": "المضاعفات الجهازية والمحلية",
            "paragraphs": [
              "SIRS يعني systemic inflammatory response syndrome: مواد الالتهاب توسّع الأوعية وتزوّد نفاذيتها، فيتسرّب السائل للأنسجة وينقص الحجم داخل الدورة. ده يفسّر shock والفشل الكلوي، بينما microthrombi والالتهاب في الرئة قد يسببوا ARDS ونقص الأكسجين.",
              "تلف islets يرفع السكر. إنزيمات الدهون تعمل fat necrosis وترتبط بالكالسيوم فينخفض. تسريب البروتين والسوائل من الشعيرات يقلل albumin.",
              "محليًا: النسيج الميت ممكن يتعدي فيعمل abscess؛ قطع القناة يسرّب العصارة فيعمل pseudocyst أو pancreatic ascites أو pleural effusion. الضغط أو الجلطات حوالين البنكرياس تفسّر انسداد duodenum أو CBD، وportal/splenic vein thrombosis، والنزيف الهضمي أو الدوالي."
            ],
            "items": [
              "ARDS يعني acute respiratory distress syndrome أو فشل تنفسي التهابي حاد.",
              "Pseudocyst يعني تجمع عصارة محاط بجدار ليفي من غير بطانة حقيقية.",
              "CBD يعني common bile duct أو القناة المرارية الرئيسية."
            ]
          }
        ],
        "termCoverage": [
          {
            "term": "SIRS",
            "meaning": "systemic inflammatory response syndrome"
          },
          {
            "term": "ARDS",
            "meaning": "acute respiratory distress syndrome أو فشل تنفسي التهابي حاد"
          },
          {
            "term": "Pseudocyst",
            "meaning": "تجمع عصارة محاط بجدار ليفي من غير بطانة حقيقية"
          },
          {
            "term": "CBD",
            "meaning": "common bile duct أو القناة المرارية الرئيسية"
          }
        ],
        "sourceBlocks": [
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "COMPLICATIONS",
            "paragraphs": [
              "(A) Systemic",
              "(B) Pancreatic",
              "(C) GIT"
            ],
            "items": [
              "SIRS: Increased vascular permeability d.t. (due to) Cytokine, Kinin release, PAF, Paralytic ileus, vomiting & RF (Renal Failure).",
              "Hypoxia: ARDS d.t. microthrombi in pulm. vs. (pulmonary vessels).",
              "Hyperglycaemia: Disruption of islets of Langerhans.",
              "Hypocalcaemia: Sequestration of Ca in fat necrosis.",
              "Hypoalbuminaemia: Increased capillary permeability.",
              "Abscess: Infection of necrotic pancreatic tissue.",
              "Pancreatic ascites or pleural effusion: Disruption of pancreatic ducts.",
              "Pseudocyst: Disruption of pancreatic ducts.",
              "UGI bleeding: Gastric or duodenal erosions.",
              "Variceal hge (hemorrhage): Splenic or PVT (Portal Vein Thrombosis).",
              "Duodenal obstruction: Compression by pancreatic mass.",
              "Obstructive jaundice: Compression of CBD (Common Bile Duct)."
            ]
          }
        ]
      },
      {
        "id": "acute-diagnosis",
        "groupId": "acute-assessment",
        "title": "ACUTE — DIAGNOSIS / LABS / IMAGING",
        "explanationBlocks": [
          {
            "type": "established",
            "lang": "ar",
            "label": "الشرح بالمصري",
            "title": "نثبت التشخيص ونقيس تأثير المرض",
            "paragraphs": [
              "التشخيص ما يعتمدش على تحليل واحد: بنجمع الصورة الإكلينيكية مع ارتفاع amylase أو lipase غالبًا لثلاثة أمثال الطبيعي ومع التصوير عند الحاجة. Lipase يفضل مرتفع مدة أطول، بينما amylase ممكن يرجع طبيعي بعد 24–48 ساعة؛ وارتفاع أي إنزيم وحده مش خاص بالبنكرياس 100%.",
              "CBC يوضح leukocytosis، وBUN/creatinine والإلكتروليتات يبينوا الجفاف وthird spacing، يعني انتقال السوائل من الأوعية للأنسجة. سكر الدم والكالسيوم ووظائف الكبد وCRP تساعد في متابعة السبب والشدة والمضاعفات.",
              "Ultrasound مفيد خصوصًا للبحث عن gallstones لكنه يتأثر بغازات الأمعاء. CT يقيّم التورم والنخر والمضاعفات، لكنه مش لازم يتعمل لكل حالة فورًا لو التشخيص واضح والمريض بيتحسن."
            ],
            "items": [
              "Leukocytosis يعني زيادة كرات الدم البيضاء.",
              "CRP يعني C-reactive protein، مؤشر التهاب نتابع اتجاهه مع الوقت.",
              "Type and crossmatch يعني تحديد فصيلة الدم واختبار التوافق قبل نقل الدم."
            ]
          }
        ],
        "termCoverage": [
          {
            "term": "Third spacing",
            "meaning": "انتقال السوائل من الأوعية للأنسجة"
          },
          {
            "term": "Leukocytosis",
            "meaning": "زيادة كرات الدم البيضاء"
          },
          {
            "term": "CRP",
            "meaning": "C-reactive protein، مؤشر التهاب نتابع اتجاهه مع الوقت"
          },
          {
            "term": "Type and crossmatch",
            "meaning": "تحديد فصيلة الدم واختبار التوافق قبل نقل الدم"
          }
        ],
        "sourceBlocks": [
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "ACUTE PANCREATITIS - DIAGNOSIS",
            "paragraphs": [
              "Diagnosis is based on: Increased S. (Serum) amylase or lipase + U/S or C.T evidence of pancreatic swelling"
            ],
            "items": [
              "History",
              "Physical exam",
              "Lab Studies",
              "During acute attacks, the blood contains at least three times more amylase and lipase than usual. Amylase and lipase are digestive enzymes formed in the pancreas.",
              "Changes may also occur in blood levels of glucose, calcium, magnesium, sodium, potassium, and bicarbonate. After the pancreas improves, these levels usually return to normal.",
              "Serum amylase (×3 times normal):",
              "M.b. (May be) normal after 24-48 hours of onset. So check lipase or urinary amylase : creatinine ratio.",
              "Persistent elevation = suggests pseudocyst formation.",
              "Peritoneal amylase is present in pancreatic ascites.",
              "U/S (Ultrasound):",
              "Confirms diagnosis.",
              "May also show: gallstones, pseudocyst, biliary obstruction.",
              "C.T (CT Scan): Define viability of the pancreas.",
              "Hyperglycemia and Ca.",
              "S.bili (Serum bilirubin), ALT, AST, alk. ph (Alkaline phosphatase): are transiently elevated.",
              "Serial assessment of CRP."
            ]
          },
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "LAB STUDIES & IMAGING DETAILS",
            "items": [
              "A complete blood count (CBC) demonstrates leukocytosis (WBC >12,000) with the differential being shifted towards the segmented polymorphs.",
              "If blood transfusion is necessary, as in cases of hemorrhagic pancreatitis, obtain type and crossmatch.",
              "Measure blood glucose level because it may be elevated from B-cell (beta cell) injury in the pancreas.",
              "Obtain measurements for BUN, creatine (Cr), and electrolytes (Na, K, Cl, CO2, P, Mg); a great disturbance in the electrolyte balance is usually found, secondary to third spacing of fluids.",
              "Measure amylase levels, preferably the Amylase P (Pancreatic amylase), which is more specific to pancreatic pathology. Levels more than 3 times higher than normal strongly suggest the diagnosis of acute pancreatitis.",
              "Lipase levels also are elevated and remain high for 12 days. In patients with chronic pancreatitis (usually caused by alcohol abuse), lipase may be elevated in the presence of a normal serum amylase level."
            ]
          },
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "IMAGING STUDIES",
            "items": [
              "Ultrasound: Can be used as a screening test. If overlying gas shadows secondary to bowel distention are present, it may not be specific.",
              "CT scan: CT scan is the most reliable imaging modality in the diagnosis of acute pancreatitis."
            ]
          }
        ]
      },
      {
        "id": "acute-prognosis",
        "groupId": "acute-assessment",
        "title": "ACUTE — GLASGOW / RANSON",
        "explanationBlocks": [
          {
            "type": "established",
            "lang": "ar",
            "label": "الشرح بالمصري",
            "title": "السكور بيقيس الشدة مش التشخيص",
            "paragraphs": [
              "Glasgow وRanson يجمعوا علامات تدل إن الالتهاب مأثر على أعضاء الجسم: سن أكبر، WBC وسكر وإنزيمات أنسجة أعلى، ثم خلال 48 ساعة هبوط hematocrit والكالسيوم والأكسجين وارتفاع BUN واحتياج سوائل. كل ما النقاط تزيد، احتمال organ failure والمضاعفات والوفاة يزيد.",
              "LDH يعني lactate dehydrogenase وSGOT هو الاسم القديم لـAST؛ ارتفاعهم يعكس أذى أنسجة. Base deficit يعني مقدار نقص القواعد في الدم ويدل على metabolic acidosis وضعف التروية. السكور أداة مساعدة ولا يغني عن متابعة المريض المتكررة."
            ],
            "items": [
              "Hematocrit يعني نسبة حجم كرات الدم الحمراء من حجم الدم الكلي."
            ]
          }
        ],
        "termCoverage": [
          {
            "term": "LDH",
            "meaning": "lactate dehydrogenase"
          },
          {
            "term": "SGOT",
            "meaning": "الاسم القديم لـAST"
          },
          {
            "term": "Base deficit",
            "meaning": "مقدار نقص القواعد في الدم ويدل على metabolic acidosis وضعف التروية"
          },
          {
            "term": "Hematocrit",
            "meaning": "نسبة حجم كرات الدم الحمراء من حجم الدم الكلي"
          }
        ],
        "sourceBlocks": [
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "Glasgow Criteria",
            "items": [
              "Severity and prognosis worsen as the number of these factors increases. More than three implies severe disease."
            ]
          },
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "RANSON SCALE",
            "paragraphs": [
              "Present on admission:",
              "Developing during the first 48 hours:"
            ],
            "items": [
              "Ranson developed a series of different criteria for the severity of acute pancreatitis.",
              "Answer each question regarding the patient, then add up the total score for prognosis:",
              "If answer is no: 0 point.",
              "If answer is yes: 1 point.",
              "Older than 55 years",
              "WBC higher than 16,000 per mcL",
              "Blood glucose higher than 200 mg/dL",
              "Serum lactate dehydrogenase (LDH) more than 350 IU/L",
              "SGOT (aspartate aminotransferase [AST]) greater than 250 IU/L",
              "Hematocrit fall more than 10%",
              "BUN increase more than 8 mg/dL",
              "Serum calcium less than 8 mg/dL",
              "Arterial oxygen saturation less than 60 mm Hg",
              "Base deficit higher than 4 mEq/L",
              "Estimated fluid sequestration higher than 600 mL"
            ]
          },
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "RANSON SCORE & MORTALITY",
            "items": [
              "A Ranson score of 0–2 has a minimal mortality rate.",
              "A Ranson score of 3–5 has a 10%–20% mortality rate.",
              "A Ranson score higher than 5 has a mortality rate of more than 50% and is associated with more systemic complications."
            ]
          }
        ]
      },
      {
        "id": "acute-management",
        "groupId": "acute-management",
        "title": "MANAGEMENT OF ACUTE PANCREATITIS",
        "explanationBlocks": [
          {
            "type": "established",
            "lang": "ar",
            "label": "الشرح بالمصري",
            "title": "الدعم أولًا ثم علاج السبب والمضاعفات",
            "paragraphs": [
              "الأساس هو تعويض السوائل بحذر، مسكن مناسب، أكسجين ودعم الأعضاء حسب الحالة، ومراقبة البول والدورة الدموية في الصدمة. ERCP العاجل يفيد لو فيه cholangitis أو انسداد مراري مستمر مع الحالة الشديدة، مش لكل مريض pancreatitis بسبب حصوة.",
              "Nasogastric aspiration يُستخدم لو فيه ileus أو قيء شديد، والإنسولين والكالسيوم يُعطوا عند وجود indication واضحة. علاج pseudocyst أو ascites أو necrosis بيتحدد حسب العدوى، النضج، الأعراض، التشريح، وخبرة فريق بنكرياس متعدد التخصصات."
            ],
            "items": [
              "NPO يعني nothing by mouth أو منع الأكل بالفم.",
              "CVP يعني central venous pressure، قياس ضغط وريدي مركزي قد يساعد في حالات مختارة لكنه مش بديل للتقييم المتكرر.",
              "Debridement يعني إزالة النسيج الميت أو المصاب.",
              "Sterile necrosis يعني نخر غير مصاب بعدوى."
            ]
          },
          {
            "type": "warning",
            "lang": "ar",
            "label": "الشرح بالمصري",
            "title": "تنبيه علاجي حديث",
            "paragraphs": [
              "النص الأصلي محفوظ كما هو، لكن الإرشادات الحديثة تفضّل الأكل بالفم مبكرًا حسب التحمل أو التغذية المعوية بدل NPO وparenteral nutrition الروتينيين. المضادات الحيوية الوقائية لا تُعطى روتينيًا في sterile necrosis. وفي necrosis المستقر يُفضّل تأخير التدخل قرابة 4 أسابيع واستخدام step-up drainage/endoscopic approaches بدل urgent open debridement المبكر، إلا لو فيه داعٍ قوي وعدم استقرار."
            ]
          }
        ],
        "termCoverage": [
          {
            "term": "NPO",
            "meaning": "nothing by mouth أو منع الأكل بالفم"
          },
          {
            "term": "CVP",
            "meaning": "central venous pressure، قياس ضغط وريدي مركزي"
          },
          {
            "term": "Debridement",
            "meaning": "إزالة النسيج الميت أو المصاب"
          },
          {
            "term": "Sterile necrosis",
            "meaning": "نخر غير مصاب بعدوى"
          }
        ],
        "sourceBlocks": [
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "MANAGEMENT OF ACUTE PANCREATITIS",
            "items": [
              "NPO (Nothing by mouth. Give parenteral nutrition).",
              "Analgesic as pethidine.",
              "Correction of hypovolemia by normal saline and or colloids.",
              "CVP & urinary catheter to monitor shocked Patients.",
              "O2 for hypoxia.",
              "ARDS may require ventilatory support.",
              "Insulin for hyperglycemia.",
              "IV Ca if tetany occur.",
              "Nasogastric aspiration for paralytic ileus.",
              "Prophylaxis of thromboembolism: low dose S.C heparin.",
              "Patients who present with cholangitis or jaundice in ass. (association) with severe acute Pancreatitis $\\rightarrow$ urgent ERCP to remove stone & drain biliary system.",
              "Prophylactic Abs (Antibiotics)."
            ]
          },
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "Treatment of Complications",
            "items": [
              "Necrotizing pancreatitis or pancreatic abscess $\\rightarrow$ urgent surgical debridement of the pancreas.",
              "Pancreatic pseudocysts $\\rightarrow$ drainage into stomach or duodenum.",
              "Pancreatic ascites is an indication for distal pancreatectomy."
            ]
          }
        ]
      },
      {
        "id": "chronic-foundation",
        "groupId": "chronic-core",
        "title": "CHRONIC — DEFINITION / CLASSIFICATION / CAUSES",
        "explanationBlocks": [
          {
            "type": "established",
            "lang": "ar",
            "label": "الشرح بالمصري",
            "title": "تلف ثابت وفقد تدريجي للوظيفة",
            "paragraphs": [
              "Chronic pancreatitis هو التهاب مزمن يعمل fibrosis، يعني استبدال النسيج الطبيعي بندبات، ويدمّر الجزء exocrine أولًا فيقل الهضم. لما الضرر يوصل islets يحصل diabetes mellitus. Obstructive النوع فيه انسداد بالقنوات، وcalcific النوع تتكون فيه ترسبات وحصوات وتوسّع غير منتظم بالقنوات.",
              "الأسباب تتجمع تحت toxic-metabolic مثل alcohol وtobacco وارتفاع calcium والفشل الكلوي، وidiopathic، وgenetic، وautoimmune، ونوبات acute متكررة، أو obstruction بسبب ورم أو pancreas divisum أو IPMN أو خلل Sphincter of Oddi."
            ],
            "items": [
              "Fibrosis يعني نسيج ندبي صلب يحل محل الخلايا الوظيفية.",
              "IPMN يعني intraductal papillary mucinous neoplasm، ورم مخاطي داخل القنوات قد يسبب انسدادًا.",
              "Autoimmune pancreatitis يعني التهاب البنكرياس بسبب هجوم مناعي وقد يكون جزءًا من مرض متعدد الأعضاء."
            ]
          }
        ],
        "termCoverage": [
          {
            "term": "Fibrosis",
            "meaning": "نسيج ندبي صلب يحل محل الخلايا الوظيفية"
          },
          {
            "term": "IPMN",
            "meaning": "intraductal papillary mucinous neoplasm، ورم مخاطي داخل القنوات قد يسبب انسدادًا"
          },
          {
            "term": "Autoimmune pancreatitis",
            "meaning": "التهاب البنكرياس بسبب هجوم مناعي وقد يكون جزءًا من مرض متعدد الأعضاء"
          }
        ],
        "sourceBlocks": [
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "DEFINITION",
            "paragraphs": [
              "Chronic inflammatory disease ccc by (characterized by) fibrosis & destruction of exocrine pancreatic tissue. D.M (Diabetes Mellitus) occurs in advanced cases bec. (because) the islets of Langerhans are involved."
            ]
          },
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "CLASSIFICATION",
            "items": [
              "Obstructive C P (Chronic Pancreatitis)",
              "Calcific C P"
            ]
          },
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "CAUSES OF CHRONIC PANCREATITIS",
            "items": [
              "Toxic-Metabolic: Alcohol, Tobacco, Ca, CRF (Chronic Renal Failure).",
              "Idiopathic: Tropical, early/late onset types.",
              "Genetic: Hereditary Pancreatitis.",
              "Autoimmune: Isolated or as part of multi-organ problem.",
              "Recurrent and severe acute pancreatitis.",
              "Obstructive: Ductal adenocarcinoma, Pancreas divisum, IPMN, Sphincter of Oddi dysfunction."
            ]
          }
        ]
      },
      {
        "id": "chronic-clinical-complications",
        "groupId": "chronic-core",
        "title": "CHRONIC — CLINICAL FEATURES / COMPLICATIONS",
        "explanationBlocks": [
          {
            "type": "established",
            "lang": "ar",
            "label": "الشرح بالمصري",
            "title": "الألم وسوء الهضم والمضاعفات",
            "paragraphs": [
              "الألم ممكن ييجي كنوبات شبه acute أو يبقى مزمن تدريجي، وقد يتحسن بالانحناء للأمام ويزيد بعد الكحول أو الأكل. تدمير exocrine tissue يقلل lipase وباقي الإنزيمات، فيحصل malabsorption وsteatorrhea، يعني براز دهني، ثم نقص وزن. نقص الأكل خوفًا من postprandial pain والسكري يزيدوا فقد الوزن.",
              "التليف والكتل الالتهابية ممكن تضيق CBD أو duodenum. جلطات portal أو splenic vein ترفع الضغط في جزء من الدورة البابية وتعمل gastric varices. تسريب القنوات يفسّر pseudocyst وpancreatic ascites في acute وchronic معًا."
            ],
            "items": [
              "Malabsorption يعني عدم امتصاص المغذيات بصورة كافية من الأمعاء.",
              "Steatorrhea يعني براز دهني كبير الحجم وصعب الغسل بسبب نقص هضم الدهون.",
              "Postprandial pain يعني ألم بعد الأكل.",
              "Segmental portal hypertension يعني ارتفاع ضغط الوريد البابي في منطقة محددة بسبب انسداد وريد مثل splenic vein."
            ]
          }
        ],
        "termCoverage": [
          {
            "term": "Malabsorption",
            "meaning": "عدم امتصاص المغذيات بصورة كافية من الأمعاء"
          },
          {
            "term": "Steatorrhea",
            "meaning": "براز دهني كبير الحجم وصعب الغسل بسبب نقص هضم الدهون"
          },
          {
            "term": "Postprandial pain",
            "meaning": "ألم بعد الأكل"
          },
          {
            "term": "Segmental portal hypertension",
            "meaning": "ارتفاع ضغط الوريد البابي في منطقة محددة بسبب انسداد وريد"
          }
        ],
        "sourceBlocks": [
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "CLINICAL FEATURES",
            "items": [
              "Abdominal pain:",
              "In 50% occurs as episodes of acute pancreatitis.",
              "In 35% occurs as slowly progressive chronic pain without acute exacerbation.",
              "Pain may be relieved by leaning forwards or worsened by drinking alcohol.",
              "Diarrhea & steatorrhea (malabsorption).",
              "Wt. (Weight) loss d.t. (due to): Anorexia, Avoidance of food (d.t. PP/postprandial pain), Malabsorption, D.M.",
              "D.M. (in 30% of pts).",
              "Epigastric tenderness."
            ]
          },
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "COMPLICATIONS OF CHRONIC PANCREATITIS",
            "items": [
              "Pseudocysts and pancreatic ascites, which occur in both acute and chronic pancreatitis.",
              "Extrahepatic obstructive jaundice due to a benign stricture of the CBD as it passes through the diseased pancreas.",
              "Duodenal stenosis.",
              "Portal or splenic vein thrombosis leading to segmental portal hypertension and gastric varices.",
              "Peptic ulcer."
            ]
          }
        ]
      },
      {
        "id": "chronic-investigations",
        "groupId": "chronic-assessment",
        "title": "CHRONIC — INVESTIGATIONS / FUNCTION TESTS",
        "explanationBlocks": [
          {
            "type": "established",
            "lang": "ar",
            "label": "الشرح بالمصري",
            "title": "هل فيه تغيّر شكلي؟ وهل الوظيفة قلت؟",
            "paragraphs": [
              "CT وultrasound وabdominal X-ray يدوروا على atrophy وcalcification وتوسّع القنوات والمضاعفات. MRCP يصوّر القنوات بالرنين من غير إدخال منظار، وEUS يقرّب موجات السونار من البنكرياس ويكشف تغيرات أدق.",
              "اختبارات الوظيفة تقيس نتيجة التليف: secretin test يقيس حجم الإفراز وbicarbonate، وfecal elastase/chymotrypsin يقيّموا الإنزيمات اللي وصلت للبراز، وstool fat يثبت سوء هضم الدهون. OGTT يقيّم وظيفة endocrine واحتمال diabetes."
            ],
            "items": [
              "MRCP يعني magnetic resonance cholangiopancreatography، تصوير قنوات المرارة والبنكرياس بالرنين.",
              "EUS يعني endoscopic ultrasound، سونار من خلال منظار قريب من البنكرياس.",
              "PABA test اختبار غير مباشر لنشاط إنزيمات البنكرياس عن طريق مادة تُكسر ثم تُقاس نواتجها.",
              "OGTT يعني اختبار تحمل الجلوكوز لتقييم اضطراب السكر."
            ]
          }
        ],
        "termCoverage": [
          {
            "term": "MRCP",
            "meaning": "magnetic resonance cholangiopancreatography، تصوير قنوات المرارة والبنكرياس بالرنين"
          },
          {
            "term": "EUS",
            "meaning": "endoscopic ultrasound، سونار من خلال منظار قريب من البنكرياس"
          },
          {
            "term": "PABA test",
            "meaning": "اختبار غير مباشر لنشاط إنزيمات البنكرياس"
          },
          {
            "term": "OGTT",
            "meaning": "اختبار تحمل الجلوكوز لتقييم اضطراب السكر"
          }
        ],
        "sourceBlocks": [
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "Tests to establish diagnosis",
            "items": [
              "U/S",
              "C.T scan: May show atrophy, calcification, ductal dilatation.",
              "Abd. X-ray: May show calcification.",
              "MRCP if non-invasive tests are –ve (negative).",
              "Endoscopic U/S (EUS)"
            ]
          },
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "Tests of pancreatic function",
            "items": [
              "Collection of pure pancreatic juice after secretin injection.",
              "Pancreolauryl or PABA test: pancreatic esterases cleave fluorescein dilaurate after oral ingestion. Fluorescein is absorbed & quantified in urine.",
              "Faecal pancreatic chymotrypsin or elastase.",
              "Oral glucose tolerance test (OGTT).",
              "Stool fat (72 hrs collection): Normal 10 gm/d. Advanced insufficiency m.b. (may be) 30-40gm/d."
            ]
          },
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "Tests of anatomy prior to surgery",
            "items": [
              "MRCP"
            ]
          }
        ]
      },
      {
        "id": "chronic-management",
        "groupId": "chronic-management",
        "title": "MANAGEMENT OF CHRONIC PANCREATITIS",
        "explanationBlocks": [
          {
            "type": "established",
            "lang": "ar",
            "label": "الشرح بالمصري",
            "title": "نوقف الضرر ونعوّض الوظيفة ونعالج الانسداد",
            "paragraphs": [
              "وقف alcohol وtobacco يقلل استمرار الأذى. الألم يُعالج تدريجيًا بالأدوية ثم تدخل endoscopic أو جراحي لو فيه انسداد أو ألم مستمر. Stenting يعني وضع دعامة داخل القناة، وpancreatico-jejunostomy يعني توصيل القناة البنكرياسية بالأمعاء لتصريفها.",
              "في steatorrhea نستخدم pancreatic enzyme replacement مع الوجبات؛ الـPPI يقلل حمض المعدة فيحافظ على نشاط الإنزيمات داخل الاثني عشر. السكري الناتج من البنكرياس يحتاج متابعة دقيقة وغالبًا insulin، مع علاج pseudocyst أو ascites أو strictures حسب الحالة."
            ],
            "items": [
              "PPI يعني proton pump inhibitor، دواء يقلل إفراز حمض المعدة.",
              "Pancreatic enzyme replacement يعني كبسولات إنزيمات تعوّض النقص وتُؤخذ مع الأكل.",
              "Stricture يعني تضيق ثابت في قناة أو جزء من الأمعاء."
            ]
          },
          {
            "type": "warning",
            "lang": "ar",
            "label": "الشرح بالمصري",
            "title": "تنبيه تغذوي حديث",
            "paragraphs": [
              "النص يذكر oral fat restriction، لكن الخطة الحديثة تُفصّل مع dietitian وتركّز على كفاية السعرات وجرعة enzyme replacement المناسبة بدل تقييد الدهون الشديد لكل المرضى؛ لأن مرضى chronic pancreatitis معرضون لسوء التغذية."
            ]
          }
        ],
        "termCoverage": [
          {
            "term": "Stenting",
            "meaning": "وضع دعامة داخل القناة"
          },
          {
            "term": "Pancreatico-jejunostomy",
            "meaning": "توصيل القناة البنكرياسية بالأمعاء لتصريفها"
          },
          {
            "term": "PPI",
            "meaning": "proton pump inhibitor، دواء يقلل إفراز حمض المعدة"
          },
          {
            "term": "Stricture",
            "meaning": "تضيق ثابت في قناة أو جزء من الأمعاء"
          }
        ],
        "sourceBlocks": [
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "MANAGEMENT OF CHRONIC PANCREATITIS",
            "items": [
              "Stop alcohol & tobacco.",
              "Pain relief:",
              "NSAIDs, opiate (tramadol).",
              "Pancreatic enzymes $\\rightarrow$ suppress pancreatic secretions: Tab or capsule 2000 unit or 10,000-12,000 lipase units / meal.",
              "Endoscopic stenting of main pancreatic duct.",
              "Surgical: partial pancreatic resection, pancreatico-jejunostomy.",
              "Steatorrhea:",
              "Oral fat restriction.",
              "Oral pancreatic enzyme supplements + proton pump inhibitor (PPI) to optimize duodenal pH for pancreatic enzyme activity.",
              "D.M: CHO (Carbohydrate) restriction & insulin therapy.",
              "Management of complications: Surgical or endoscopic therapy for Pseudocyst, pancreatic ascites, and CBD or duodenal stricture."
            ]
          }
        ]
      },
      {
        "id": "exocrine-insufficiency",
        "groupId": "chronic-assessment",
        "title": "EXOCRINE PANCREATIC INSUFFICIENCY",
        "explanationBlocks": [
          {
            "type": "established",
            "lang": "ar",
            "label": "الشرح بالمصري",
            "title": "نقيس قدرة البنكرياس على الهضم",
            "paragraphs": [
              "Exocrine pancreatic insufficiency يعني إن البنكرياس مش بيطلع إنزيمات وbicarbonate كفاية للهضم. Secretin ينبه إفراز الماء وbicarbonate، وpancreozymin/CCK ينبه إفراز الإنزيمات؛ ضعف الاستجابة يدل على فقد الاحتياطي الوظيفي.",
              "Fecal elastase-1 اختبار بسيط في البراز: كل ما الرقم يقل، القصور أشد. Breath tests تستخدم مواد عليها 13C؛ لو lipase أو amylase أو trypsin قليل، المادة ما تتكسرش كويس ويقل 13CO2 في النفس. Koprogram يبيّن دهونًا وأليافًا عضلية وطعامًا غير مهضوم."
            ],
            "items": [
              "Secretin هرمون ينبه البنكرياس لإفراز سائل غني بالـbicarbonate.",
              "Elastase-1 إنزيم بنكرياسي ثابت نسبيًا في البراز ويُستخدم كمؤشر غير مباشر للإفراز الخارجي.",
              "Koprogram يعني فحص شامل لمكونات البراز بحثًا عن علامات سوء الهضم."
            ]
          }
        ],
        "termCoverage": [
          {
            "term": "Exocrine pancreatic insufficiency",
            "meaning": "البنكرياس مش بيطلع إنزيمات وbicarbonate كفاية للهضم"
          },
          {
            "term": "Secretin",
            "meaning": "هرمون ينبه البنكرياس لإفراز سائل غني بالـbicarbonate"
          },
          {
            "term": "Elastase-1",
            "meaning": "إنزيم بنكرياسي ثابت نسبيًا في البراز ويُستخدم كمؤشر غير مباشر للإفراز الخارجي"
          },
          {
            "term": "Koprogram",
            "meaning": "فحص شامل لمكونات البراز بحثًا عن علامات سوء الهضم"
          }
        ],
        "sourceBlocks": [
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "METHODS",
            "items": [
              "For the introduction of secretin while preserving exocrine pancreatic function, the amount of secretion is increased, and the content of bicarbonate rises. In response to input of pancreozymin, the content of enzymes is increased.",
              "In severe exocrine insufficiency, the pathological changes of the test are observed in 85-90% of cases.",
              "The research of activity in feces of elastase-1.",
              "Breathing tests:",
              "During exogenous failure, the production of lipase is reduced or it is absent, and therefore the triglycerides are split to a lesser extent and constitute less of $^{13}\\text{CO}2$.",
              "Amylase respiratory AP the corn-starch test: the total concentration AP at the end of the 4-o'clock research is less than 10%, indicating the presence of deficiency of pancreatic amylase.",
              "Protein breathing with $^{13}\\text{C}$-noticed egg white: in patients with chronic pancreatitis, the total concentration of $^{13}\\text{CO}2$ through 6 hours is 2-3 times lower than in healthy persons, indicating a decrease in activity of trypsin.",
              "Koprogram (Coprology): High content of muscular fibers, undigested fiber, and neutral fat."
            ]
          },
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "STANDARD OF NONINVASIVE DIAGNOSIS OF CHRONIC PANCREATITIS",
            "items": [
              "|Degrees of severity of external secretory of pancreatic insufficiency|Activity of fecal pancreatic elastase-1|",
              "|Mild|150–200 mg / g|",
              "|Moderate|100–150 mg / g|",
              "|Severe|Less than 100 mg / g|"
            ]
          }
        ]
      },
      {
        "id": "chronic-advanced-imaging",
        "groupId": "chronic-assessment",
        "title": "CHRONIC — ADVANCED IMAGING FINDINGS",
        "explanationBlocks": [
          {
            "type": "established",
            "lang": "ar",
            "label": "الشرح بالمصري",
            "title": "شكل القنوات والنسيج في المرض المزمن",
            "paragraphs": [
              "المرض المزمن يعمل calcification داخل النسيج أو القناة، atrophy، توسع القناة وفروعها، وpseudocysts. Wirsung duct هو main pancreatic duct، وWirsungolithiasis يعني حصوات داخله.",
              "EUS حساس للتغيرات المبكرة لكنه يعتمد على معايير وخبرة الفاحص. CT ممتاز للتكلس وتغير النسيج والمضاعفات. ERCP يوضح القنوات مباشرة؛ chain of lakes يعني مناطق تضيق وتوسع متبادلة بسبب التليف والانسداد. Biopsy تؤخذ في حالات مختارة لما نحتاج نميّز التهابًا مزمنًا من ورم أو مرض مناعي."
            ],
            "items": [
              "Wirsung duct يعني القناة البنكرياسية الرئيسية.",
              "Wirsungolithiasis يعني وجود حصوات داخل القناة البنكرياسية الرئيسية.",
              "Chain of lakes يعني تعاقب تضيق وتوسع القنوات في شكل يشبه سلسلة بحيرات.",
              "ERCP هنا تصوير وعلاج بالقسطرة والمنظار، وله مخاطر لذلك لا يُستخدم لمجرد الفحص إذا كفت وسائل أقل تدخلاً."
            ]
          }
        ],
        "termCoverage": [
          {
            "term": "Wirsung duct",
            "meaning": "القناة البنكرياسية الرئيسية"
          },
          {
            "term": "Wirsungolithiasis",
            "meaning": "وجود حصوات داخل القناة البنكرياسية الرئيسية"
          },
          {
            "term": "Chain of lakes",
            "meaning": "تعاقب تضيق وتوسع القنوات في شكل يشبه سلسلة بحيرات"
          },
          {
            "term": "ERCP",
            "meaning": "تصوير وعلاج بالقسطرة والمنظار"
          }
        ],
        "sourceBlocks": [
          {
            "type": "source",
            "label": "Extracted source — unchanged; formatting marks removed",
            "title": "ULTRASOUND & ADVANCED IMAGING FINDINGS",
            "items": [
              "Ultrasound Investigation - Chronic Pancreatitis: Shows calcificates in the head of pancreas, Virsungov’s (Wirsung) duct, pseudocyst of pancreas, increase of the head of pancreas, and spleen (splenic) vein.",
              "Ultrasound Investigation - Chronic Calcified Pancreatitis: Shows Wirsungolithiasis and dilated Virsungov’s duct.",
              "Plain X-ray of abdomen: Showing calcific pancreatitis.",
              "Endoscopic Ultrasound (EUS): Overcomes some visualization problems and is probably more sensitive and specific. It routinely detects abnormalities in patients with chronic pancreatitis with high sensitivity, but the specificity and reproducibility require further study. An EUS image can demonstrate a dilated pancreatic duct in advanced chronic pancreatitis.",
              "CT Scan: Has a sensitivity of up to 90% and specificity of the same order. It will detect variation in ductal diameter, ectatic side branches, changes in the parenchyma, calcification, and complications such as pseudocyst formation.",
              "Endoscopic Retrograde Cholangiopancreatography (ERCP): Reveals impaired patency of the main and secondary ducts. \"Chain of lakes\" is a classic symptom of chronic pancreatitis (areas of alternating constriction and expansion of Wirsung ducts). Segmental or total obstruction of the ductal system is also possible.",
              "Biopsy of pancreas."
            ]
          }
        ]
      }
    ]
  }
]);
