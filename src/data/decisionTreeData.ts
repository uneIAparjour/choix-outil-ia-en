import { Step } from "@/types/evaluation";

export const decisionTreeData: Step[] = [
  // ═══════════════════════════════════════════
  // PATHWAY CHOICE (mirrors PathwaySelector, not actually rendered as a card)
  // ═══════════════════════════════════════════
  {
    id: "0",
    dimension: "compliance",
    question: "In what context do you want to use this tool?",
    choices: [
      { text: "Personal use (curiosity, monitoring, personal productivity)", nextStep: "1", complianceLevel: "compliant" },
      { text: "Professional use (productivity, writing, analysis, preparing materials…)", nextStep: "1", complianceLevel: "compliant" },
      { text: "Use with students (in class, independently, in collaborative work)", nextStep: "1", complianceLevel: "compliant" }
    ],
    pathways: ["personal", "professional", "students"]
  },
  // ═══════════════════════════════════════════
  // PROFESSIONAL SUB-PATH: CONTEXT
  // ═══════════════════════════════════════════
  {
    id: "0.1",
    dimension: "compliance",
    question: "In what professional context do you want to use this tool?",
    choices: [
      { text: "Teacher — preparing lessons, assessments, grading", nextStep: "0.2", complianceLevel: "compliant" },
      { text: "Education staff — administrative tasks (writing, summarizing, translation…)", nextStep: "0.2", complianceLevel: "compliant" },
      { text: "Other professional context (outside education)", nextStep: "0.2", complianceLevel: "compliant" }
    ],
    pathways: ["professional"]
  },

  // ═══════════════════════════════════════════
  // SUB-PATH: TESTING OR REGULAR USE
  // ═══════════════════════════════════════════
  {
    id: "0.2",
    dimension: "compliance",
    question: "What kind of use do you have in mind?",
    choices: [
      { text: "I'm testing or exploring the tool before deciding", nextStep: "1", complianceLevel: "compliant" },
      { text: "Regular use, or use that will become regular", nextStep: "1", complianceLevel: "compliant" }
    ],
    infoTooltip: "Exploring lets you discover a tool before committing to it. Regular use comes with additional obligations, notably registering the tool in the data-processing register kept by the data controller.",
    pathways: ["professional", "students"]
  },

  {
    id: "1",
    dimension: "compliance",
    question: "I've found a generative AI application that could help me.",
    choices: [
      { text: "Start analyzing the application", nextStep: "2", complianceLevel: "compliant" }
    ],
    pathways: ["personal", "professional", "students"]
  },

  // ═══════════════════════════════════════════
  // DIMENSION 1: COMPLIANCE
  // ═══════════════════════════════════════════
  {
    id: "2",
    dimension: "compliance",
    question: "Can I access the application for free to test it?",
    choices: [
      { text: "Yes", nextStep: "3", complianceLevel: "compliant" },
      { text: "No", nextStep: "reject", complianceLevel: "non-compliant", isEliminating: true }
    ],
    pathways: ["personal", "professional", "students"]
  },

  // --- EU-only: GDPR ---
  {
    id: "3",
    dimension: "compliance",
    question: "Does the application seem to comply with GDPR? (To be confirmed by your Data Protection Officer if used regularly)",
    choices: [
      { text: "Yes", nextStep: "3.3", complianceLevel: "compliant" },
      { text: "Partially or with reservations", nextStep: "3.3", complianceLevel: "partial", warning: "Partial GDPR compliance — caution required" },
      { text: "No", nextStep: "3.1", complianceLevel: "non-compliant" },
      { text: "I don't know", nextStep: "3.2" }
    ],
    infoTooltip: "The 6 main GDPR criteria:\n- Only necessary data is collected\n- Transparency about data collection and use\n- Easy access, correction, and deletion of your data\n- Defined data retention period\n- Data security\n- Ongoing compliance review process",
    infoSources: ["https://www.cnil.fr/en/gdpr-what-are-we-talking-about"],
    regions: ["france", "other-europe"],
    pathways: ["personal", "professional", "students"]
  },
  {
    id: "3.1",
    dimension: "compliance",
    question: "The application isn't (fully) GDPR-compliant.",
    choices: [
      { text: "My use is personal, with no sensitive data — I'll proceed with caution", nextStep: "3.3", complianceLevel: "partial", warning: "GDPR non-compliant — personal use only, no student data" },
      { text: "My professional use is experimental — I'll test carefully, with no personal data", nextStep: "3.3", complianceLevel: "partial", warning: "GDPR non-compliant — experimentation only, compliance required before regular use" },
      { text: "My professional use is regular, or will become so", nextStep: "reject", complianceLevel: "non-compliant", isEliminating: true, warning: "GDPR non-compliant — compliance mandatory for regular professional use" },
      { text: "I want to use it with students", nextStep: "reject", complianceLevel: "non-compliant", isEliminating: true, warning: "GDPR non-compliant — not permitted with students" }
    ],
    regions: ["france", "other-europe"],
    pathways: ["personal", "professional", "students"]
  },
  {
    id: "3.2",
    dimension: "compliance",
    question: "Review the 6 GDPR criteria (info button), then reassess.",
    choices: [
      { text: "I've reviewed the criteria and can now assess", nextStep: "3" },
      { text: "I still don't know", nextStep: "reject", complianceLevel: "non-compliant", isEliminating: true }
    ],
    infoTooltip: "The 6 main GDPR criteria:\n- Only necessary data is collected\n- Transparency about data collection and use\n- Easy access, correction, and deletion of your data\n- Defined data retention period\n- Data security\n- Ongoing compliance review process",
    infoSources: ["https://www.cnil.fr/en/gdpr-what-are-we-talking-about"],
    isAction: true,
    regions: ["france", "other-europe"],
    pathways: ["personal", "professional", "students"]
  },

  // --- Compliance: testing pathway, France ---
  {
    id: "3.test-en",
    dimension: "compliance",
    question: "France's framework for AI use in education (Ministry of Education, June 2025) allows this kind of exploration under strict conditions on data.",
    choices: [
      { text: "I understand the conditions, I'll continue my assessment", nextStep: "3.3" }
    ],
    infoTooltip: "Source: Framework for AI use in education, French Ministry of Education, June 2025.\n\nPage 10: \"For pedagogical tasks (assisting with lesson preparation, assessment, grading, etc.), any teacher may use publicly available AI tools under their own responsibility, knowing that, like any data or information used for teaching purposes, AI-generated output must be checked and cross-referenced with other sources.\"\n\nPage 8: \"The use of publicly available AI services is permitted provided that no confidential or personal data is used: only data that could be made public may be entered into such tools (notably: official texts and curricula, open educational resources, anonymized statistical data, public-domain works).\"\n\n⚠️ If this tool suits you and you want to use it regularly, it must be registered in the data-processing register by your data controller.",
    infoSources: ["https://www.education.gouv.fr/sites/default/files/2025-06/l-ia-en-ducation---cadre-d-usage-440685.pdf"],
    regions: ["france"],
    pathways: ["professional"]
  },
  {
    id: "3.test-en-gen",
    dimension: "compliance",
    question: "You're exploring this tool before deciding whether to use it professionally, involving personal data.",
    choices: [
      { text: "I understand the conditions, I'll continue my assessment", nextStep: "3.3" }
    ],
    infoTooltip: "Check whether your own country, institution, or professional body publishes official guidance on AI use in an educational or administrative context. If one exists, it will typically permit exploration provided no confidential or personal data is entered into the tool, and require registering the tool for any regular use.\n\n⚠️ If this tool suits you and you want to use it regularly, check with your institution's Data Protection Officer whether it needs to be registered in a data-processing register.",
    regions: ["other-europe", "non-europe"],
    pathways: ["professional"]
  },
  {
    id: "3.eleves-test",
    dimension: "compliance",
    question: "You're testing this tool with a view to using it with students. France's framework imposes strict conditions.",
    choices: [
      { text: "I understand the conditions, I'll continue my assessment", nextStep: "3.3" }
    ],
    infoTooltip: "Source: Framework for AI use in education, French Ministry of Education, June 2025.\n\nPage 8: \"No staff member should ask students to use public AI services that require creating a personal account.\"\n\nPage 8: \"The use of publicly available AI services is permitted provided that no confidential or personal data is used.\"\n\nPage 9: \"Pedagogical use of generative AI by students, supervised, explained, and guided by the teacher, is permitted in class from the French \"4e\" grade onward (roughly age 13), in line with curriculum objectives and the CRCN digital-skills framework.\"\n\n⚠️ For regular use with students, the service must be registered in the data-processing register by the data controller (school/district leadership).",
    infoSources: ["https://www.education.gouv.fr/sites/default/files/2025-06/l-ia-en-ducation---cadre-d-usage-440685.pdf"],
    regions: ["france"],
    pathways: ["students"]
  },
  {
    id: "3.eleves-test-gen",
    dimension: "compliance",
    question: "You're testing this tool with a view to using it with students. Using AI with minors comes with strict conditions almost everywhere.",
    choices: [
      { text: "I understand the conditions, I'll continue my assessment", nextStep: "3.3" }
    ],
    infoTooltip: "Check your own country's or institution's official guidance on AI use with students — many education authorities set a minimum age or grade level, forbid asking students to create personal accounts on public AI services, and require that no personal or confidential student data ever be entered into the tool.\n\n⚠️ For regular use with students, check with your institution whether the service needs to be registered in a data-processing register.",
    regions: ["other-europe", "non-europe"],
    pathways: ["students"]
  },

  // --- Compliance: data-processing register (France) ---
  {
    id: "3.registre",
    dimension: "compliance",
    question: "Is this service registered in your data controller's processing register?",
    choices: [
      { text: "Yes, it's registered", nextStep: "3.3", complianceLevel: "compliant" },
      { text: "No, but I'll request registration", nextStep: "3.3", complianceLevel: "partial", warning: "Service not registered — registration should be requested from the data controller" },
      { text: "No, and I don't plan to", nextStep: "reject", complianceLevel: "non-compliant", isEliminating: true, warning: "Regular use requires registration in the data-processing register by the data controller" },
      { text: "I don't know", nextStep: "3.registre.info" }
    ],
    infoTooltip: "Assessing the compliance of a data-processing activity isn't the teacher's or staff member's call — it belongs to the data controller.\n\nIn French public education, data controllers are:\n• The DASEN (primary level)\n• The head of institution (secondary level)\n• The rector (academic level)\n• The ministry (national services, via GAR)\n\nSource: Framework for AI use in education, French Ministry of Education, June 2025, page 8: \"AI use must comply with the legal framework on personal data protection (GDPR), notably the data-minimization principle and the data controller's agreement.\"",
    infoSources: ["https://www.education.gouv.fr/sites/default/files/2025-06/l-ia-en-ducation---cadre-d-usage-440685.pdf"],
    regions: ["france"],
    pathways: ["professional", "students"]
  },
  {
    id: "3.registre.info",
    dimension: "compliance",
    question: "The processing register lists every service authorized by your institution to handle personal data. Check with your data controller or your Data Protection Officer (DPO).",
    choices: [
      { text: "I've checked, I can now answer", nextStep: "3.registre" }
    ],
    infoTooltip: "To find out whether a service is registered:\n• Primary level: contact your DASEN or your academic DPO\n• Secondary level: contact your head of institution or your academic DPO\n• National services: check whether the service is available through GAR (the national resource-access gateway)\n\nYour academic Data Protection Officer (DPO) can advise you.",
    isAction: true,
    regions: ["france"],
    pathways: ["professional", "students"]
  },
  {
    id: "3.registre-gen",
    dimension: "compliance",
    question: "Is this service registered in your institution's data-processing register, if one exists?",
    choices: [
      { text: "Yes, it's registered", nextStep: "3.3", complianceLevel: "compliant" },
      { text: "No, but I'll request registration", nextStep: "3.3", complianceLevel: "partial", warning: "Service not registered — registration should be requested from your institution" },
      { text: "No, and I don't plan to", nextStep: "reject", complianceLevel: "non-compliant", isEliminating: true, warning: "Regular use typically requires registering the tool with your institution" },
      { text: "I don't know", nextStep: "3.registre.info-gen" }
    ],
    infoTooltip: "Assessing the compliance of a data-processing activity generally isn't the individual teacher's or staff member's call — it belongs to whoever holds that responsibility at your institution (often called a data controller or data protection lead).",
    regions: ["other-europe", "non-europe"],
    pathways: ["professional", "students"]
  },
  {
    id: "3.registre.info-gen",
    dimension: "compliance",
    question: "A processing register (where one is required) lists every service authorized by an institution to handle personal data. Check with your institution's Data Protection Officer, or equivalent role, if unsure.",
    choices: [
      { text: "I've checked, I can now answer", nextStep: "3.registre-gen" }
    ],
    isAction: true,
    regions: ["other-europe", "non-europe"],
    pathways: ["professional", "students"]
  },

  // --- EU-only: data sovereignty / hosting ---
  {
    id: "3.3",
    dimension: "compliance",
    question: "Is the data hosted in the European Union? Is it subject to extraterritorial legislation (Cloud Act, FISA)? (To be confirmed by your Data Protection Officer if used regularly)",
    choices: [
      { text: "Yes, hosted in the EU with no extraterritorial legislation", nextStep: "4", complianceLevel: "compliant" },
      { text: "Hosted in the EU but the publisher is subject to the Cloud Act", nextStep: "4", complianceLevel: "partial", warning: "Data potentially accessible via the Cloud Act" },
      { text: "Hosted outside the EU", nextStep: "4", complianceLevel: "partial", warning: "Hosted outside the EU — data sovereignty not guaranteed" },
      { text: "I don't know", nextStep: "4", complianceLevel: "partial", warning: "Data sovereignty not verified" }
    ],
    infoTooltip: "Data sovereignty goes beyond GDPR. The US Cloud Act allows US authorities to access data hosted by US companies, even when the servers are located in Europe.",
    infoSources: ["https://www.cnil.fr/en/cnil-publishes-faq-data-transfers-united-states"],
    regions: ["france", "other-europe"],
    pathways: ["personal", "professional", "students"]
  },

  // --- EU-only: AI Act ---
  {
    id: "4",
    dimension: "compliance",
    question: "Does the application seem to meet the transparency obligations of the EU AI Act? (To be confirmed by your Data Protection Officer if used regularly)",
    choices: [
      { text: "Yes: the tool clearly discloses that it uses AI and documents how it works", nextStep: "4.1", complianceLevel: "compliant" },
      { text: "Partially: some information is available but incomplete", nextStep: "4.1", complianceLevel: "partial", warning: "Partial AI Act compliance — incomplete transparency" },
      { text: "No, or I don't know", nextStep: "reject", complianceLevel: "non-compliant", isEliminating: true }
    ],
    infoTooltip: "The EU AI Act imposes transparency obligations:\n- Inform the user they are interacting with an AI\n- Label AI-generated content as such\n- Document how the system works (training data, testing, limitations)\n- Assess and mitigate risks, including bias",
    infoSources: ["https://artificialintelligenceact.eu/article/50/"],
    regions: ["france", "other-europe"],
    pathways: ["personal", "professional", "students"]
  },

  // --- Accessibility: France (RGAA + WCAG) vs generalized (WCAG only) ---
  {
    id: "4.1",
    dimension: "compliance",
    question: "Is the application accessible to people with disabilities? (RGAA/WCAG, screen readers, text alternatives)",
    choices: [
      { text: "Yes", nextStep: "5", complianceLevel: "compliant" },
      { text: "Partially", nextStep: "5", complianceLevel: "partial", warning: "Partial accessibility for people with disabilities" },
      { text: "No", nextStep: "5", complianceLevel: "non-compliant", warning: "Not accessible to people with disabilities" },
      { text: "I don't know", nextStep: "5", complianceLevel: "partial", warning: "Accessibility for people with disabilities not verified" }
    ],
    infoTooltip: "Digital accessibility is a legal obligation for public services in France (RGAA). WCAG criteria define the international standards for web accessibility.",
    infoSources: ["https://accessibilite.numerique.gouv.fr/"],
    regions: ["france"],
    pathways: ["personal", "professional", "students"]
  },
  {
    id: "4.1-gen",
    dimension: "compliance",
    question: "Is the application accessible to people with disabilities? (WCAG, screen readers, text alternatives)",
    choices: [
      { text: "Yes", nextStep: "5", complianceLevel: "compliant" },
      { text: "Partially", nextStep: "5", complianceLevel: "partial", warning: "Partial accessibility for people with disabilities" },
      { text: "No", nextStep: "5", complianceLevel: "non-compliant", warning: "Not accessible to people with disabilities" },
      { text: "I don't know", nextStep: "5", complianceLevel: "partial", warning: "Accessibility for people with disabilities not verified" }
    ],
    infoTooltip: "Digital accessibility is a legal obligation for public services in many countries. WCAG (Web Content Accessibility Guidelines) defines the international standard for web accessibility.",
    infoSources: ["https://www.w3.org/WAI/standards-guidelines/wcag/"],
    regions: ["other-europe", "non-europe"],
    pathways: ["personal", "professional", "students"]
  },

  // ═══════════════════════════════════════════
  // DIMENSION 2: UTILITY
  // ═══════════════════════════════════════════
  {
    id: "5",
    dimension: "utility",
    question: "After testing it, will I be able to keep using this tool given its business model (free, freemium, subscription, limitations)?",
    choices: [
      { text: "Yes", nextStep: "6", complianceLevel: "compliant" },
      { text: "No", nextStep: "reject", complianceLevel: "non-compliant", isEliminating: true }
    ],
    pathways: ["personal", "professional", "students"]
  },
  {
    id: "6",
    dimension: "utility",
    question: "Does using generative AI bring me real added value? (time saved, ideas, precision, quality, new capabilities)",
    choices: [
      { text: "Yes, clearly", nextStep: "6.1", complianceLevel: "compliant" },
      { text: "Partially", nextStep: "6.1", complianceLevel: "partial", warning: "Limited added value compared to alternatives" },
      { text: "No", nextStep: "reject", complianceLevel: "non-compliant", isEliminating: true },
      { text: "I don't know", nextStep: "6.0", complianceLevel: "partial" }
    ],
    pathways: ["personal", "professional", "students"]
  },
  {
    id: "6.0",
    dimension: "utility",
    question: "Assess the application's features and their potential impact on the task at hand.",
    choices: [
      { text: "I've assessed it, I can now answer", nextStep: "6" }
    ],
    isAction: true,
    pathways: ["personal", "professional", "students"]
  },
  {
    id: "6.1",
    dimension: "utility",
    question: "Does the tool produce reliable, verifiable results?",
    choices: [
      { text: "Yes: the tool cites its sources and/or offers verification mechanisms", nextStep: "7", complianceLevel: "compliant" },
      { text: "Partially: results seem correct but aren't sourced or automatically verifiable", nextStep: "7", complianceLevel: "partial", warning: "Partial reliability — manual verification required" },
      { text: "No: results are often wrong or unverifiable", nextStep: "reject", complianceLevel: "non-compliant", isEliminating: true, warning: "Insufficient reliability" }
    ],
    infoTooltip: "Generative AI can produce \"hallucinations\": information presented with confidence but factually wrong. This is one of the main risks in an educational context. Check whether the tool cites its sources, flags its own uncertainty, or offers verification mechanisms.",
    pathways: ["personal", "professional", "students"]
  },

  // ═══════════════════════════════════════════
  // DIMENSION 3: USABILITY
  // ═══════════════════════════════════════════
  {
    id: "7",
    dimension: "usability",
    question: "Does the application provide clear information about how it works and its limitations?",
    choices: [
      { text: "Yes", nextStep: "8", complianceLevel: "compliant" },
      { text: "No", nextStep: "7.1", complianceLevel: "non-compliant" },
      { text: "I don't know", nextStep: "7.1" }
    ],
    pathways: ["personal", "professional", "students"]
  },
  {
    id: "7.1",
    dimension: "usability",
    question: "Check the application's documentation or FAQ, and/or contact support.",
    choices: [
      { text: "I found clear information", nextStep: "8", complianceLevel: "compliant" },
      { text: "The answers aren't clear", nextStep: "8", complianceLevel: "partial", warning: "Insufficient transparency about how it works" },
      { text: "I didn't find an answer", nextStep: "reject", complianceLevel: "non-compliant", isEliminating: true }
    ],
    isAction: true,
    pathways: ["personal", "professional", "students"]
  },
  {
    id: "8",
    dimension: "usability",
    question: "Is the application easy to use? (in your language if needed, ergonomics, clear menus, tutorials…)",
    choices: [
      { text: "Yes", nextStep: "9", complianceLevel: "compliant" },
      { text: "No, but I can learn to use it", nextStep: "9", complianceLevel: "partial", warning: "Difficult to learn — will take time" },
      { text: "No, and I don't have the time or skills", nextStep: "reject", complianceLevel: "non-compliant", isEliminating: true }
    ],
    pathways: ["personal", "professional", "students"]
  },

  // ═══════════════════════════════════════════
  // DIMENSION 4: ACCEPTABILITY
  // ═══════════════════════════════════════════
  {
    id: "9",
    dimension: "acceptability",
    question: "Was the application designed to minimize its environmental impact?",
    choices: [
      { text: "Yes", nextStep: "10", complianceLevel: "compliant" },
      { text: "Partially, or no clear information", nextStep: "10", complianceLevel: "partial", warning: "Environmental impact not verified or only partially controlled" },
      { text: "No, significant environmental impact", nextStep: "10", complianceLevel: "non-compliant", warning: "Significant environmental impact" }
    ],
    infoTooltip: "Training and running AI models consumes significant resources (energy, water, hardware). To assess environmental impact:\n- Check the publisher's environmental/CSR report\n- Check whether the publisher publishes the model's carbon footprint\n- Check whether servers run on renewable energy\n- Compare model size: a smaller model generally consumes less\n- Look for environmental certifications (ISO 14001, etc.)\n- Check comparison tools like the ML CO2 Impact Calculator",
    infoSources: ["https://mlco2.github.io/impact/"],
    pathways: ["personal", "professional", "students"]
  },
  {
    id: "10",
    dimension: "acceptability",
    question: "Does the company providing the AI models use, or has it used, poorly paid or exploited workers or subcontractors to train or run the AI?",
    choices: [
      { text: "No", nextStep: "10.1", complianceLevel: "compliant" },
      { text: "I don't know", nextStep: "10.0", complianceLevel: "partial" },
      { text: "Yes", nextStep: "10.1", complianceLevel: "non-compliant", warning: "Questionable labor practices" }
    ],
    pathways: ["personal", "professional", "students"]
  },
  {
    id: "10.0",
    dimension: "acceptability",
    question: "Look for information on the company's labor practices: fairlabor.org's directory, press articles, reports.",
    choices: [
      { text: "I've checked, no issue found", nextStep: "10.1", complianceLevel: "compliant" },
      { text: "I've checked, issues do exist", nextStep: "10.1", complianceLevel: "non-compliant", warning: "Questionable labor practices" },
      { text: "I still don't know", nextStep: "10.1", complianceLevel: "partial", warning: "Subcontractor labor conditions not verified" }
    ],
    infoSources: ["https://www.fairlabor.org/"],
    isAction: true,
    pathways: ["personal", "professional", "students"]
  },
  {
    id: "10.1",
    dimension: "acceptability",
    question: "Does the publisher disclose known biases in the model and mitigation measures?",
    choices: [
      { text: "Yes, transparent documentation on biases", nextStep: "11", complianceLevel: "compliant" },
      { text: "Partially", nextStep: "11", complianceLevel: "partial", warning: "Partial disclosure of algorithmic biases" },
      { text: "No", nextStep: "11", complianceLevel: "non-compliant", warning: "No information on algorithmic biases" }
    ],
    infoTooltip: "AI models can reproduce or amplify biases present in their training data (gender, origin, culture…). To check:\n- Look at the model card / technical sheet (often published on the publisher's site or on Hugging Face)\n- Look for audit or evaluation reports\n- Check whether the publisher documents known limitations and biases\n- Check whether fairness benchmarks have been run\n- Check academic publications or press coverage of the model",
    infoSources: ["https://huggingface.co/docs/hub/model-cards"],
    pathways: ["personal", "professional", "students"]
  },

  // ═══════════════════════════════════════════
  // VALUES (professional + students)
  // ═══════════════════════════════════════════
  {
    id: "11",
    dimension: "acceptability",
    question: "Does the application align with my professional values?",
    choices: [
      { text: "Yes", nextStep: "12", complianceLevel: "compliant" },
      { text: "Partially", nextStep: "12", complianceLevel: "partial", warning: "Partial alignment with professional values" },
      { text: "No", nextStep: "reject", complianceLevel: "non-compliant", isEliminating: true }
    ],
    pathways: ["professional", "students"]
  },
  {
    id: "12",
    dimension: "acceptability",
    question: "In a collaborative context, does the application align with other users' values?",
    choices: [
      { text: "Yes", nextStep: "13", complianceLevel: "compliant" },
      { text: "No", nextStep: "reject", complianceLevel: "non-compliant", isEliminating: true },
      { text: "I'll use it alone", nextStep: "13", complianceLevel: "compliant" }
    ],
    pathways: ["professional", "students"]
  },

  // ═══════════════════════════════════════════
  // PEDAGOGICAL BRANCH (students only)
  // ═══════════════════════════════════════════
  {
    id: "13",
    dimension: "acceptability",
    question: "Do I want to use this tool with students from the French \"4e\" grade onward (roughly age 13), as set out in France's framework for AI use in education?",
    choices: [
      { text: "Yes, with students from \"4e\" onward", nextStep: "14", complianceLevel: "compliant" },
      { text: "The students aren't at that level yet", nextStep: "reject", complianceLevel: "non-compliant", isEliminating: true, warning: "Generative AI use not permitted below that level" }
    ],
    infoTooltip: "France's framework for AI use in education sets the use of generative AI tools from the \"4e\" grade onward.",
    infoSources: ["https://www.education.gouv.fr/cadre-d-usage-de-l-ia-en-education-450647e"],
    regions: ["france"],
    pathways: ["students"]
  },
  {
    id: "13-gen",
    dimension: "acceptability",
    question: "Does my own country's or institution's guidance permit generative AI use at my students' age or grade level?",
    choices: [
      { text: "Yes, my students are at or above the recommended level", nextStep: "14-gen", complianceLevel: "compliant" },
      { text: "My students aren't at that level yet, or no clear guidance exists and I have doubts", nextStep: "reject", complianceLevel: "non-compliant", isEliminating: true, warning: "Check your country's or institution's guidance before proceeding" }
    ],
    infoTooltip: "Many education authorities set a minimum age or grade level for generative AI use with students. Check your own country's or institution's official guidance, if one exists.",
    regions: ["other-europe", "non-europe"],
    pathways: ["students"]
  },
  {
    id: "14",
    dimension: "utility",
    question: "Does the application help meet the learning objectives set by the French national curriculum?",
    choices: [
      { text: "Yes", nextStep: "14.1", complianceLevel: "compliant" },
      { text: "Partially", nextStep: "14.1", complianceLevel: "partial", warning: "Partial alignment with the curriculum" },
      { text: "No", nextStep: "reject", complianceLevel: "non-compliant", isEliminating: true },
      { text: "I don't know", nextStep: "14.0" }
    ],
    regions: ["france"],
    pathways: ["students"]
  },
  {
    id: "14.0",
    dimension: "utility",
    question: "Check the national curriculum and assess how the application could fit into it.",
    choices: [
      { text: "I've checked, I can now assess", nextStep: "14" }
    ],
    isAction: true,
    regions: ["france"],
    pathways: ["students"]
  },
  {
    id: "14-gen",
    dimension: "utility",
    question: "Does the application help meet the learning objectives set by your own curriculum?",
    choices: [
      { text: "Yes", nextStep: "14.1", complianceLevel: "compliant" },
      { text: "Partially", nextStep: "14.1", complianceLevel: "partial", warning: "Partial alignment with the curriculum" },
      { text: "No", nextStep: "reject", complianceLevel: "non-compliant", isEliminating: true },
      { text: "I don't know", nextStep: "14.0-gen" }
    ],
    regions: ["other-europe", "non-europe"],
    pathways: ["students"]
  },
  {
    id: "14.0-gen",
    dimension: "utility",
    question: "Check your curriculum and assess how the application could fit into it.",
    choices: [
      { text: "I've checked, I can now assess", nextStep: "14-gen" }
    ],
    isAction: true,
    regions: ["other-europe", "non-europe"],
    pathways: ["students"]
  },
  {
    id: "14.1",
    dimension: "utility",
    question: "Does the student stay actively engaged in learning with this tool, or does the tool do the work for them?",
    choices: [
      { text: "The student stays active and the tool supports their learning", nextStep: "15", complianceLevel: "compliant" },
      { text: "The tool could do the work in the student's place, but this can be supervised", nextStep: "15", complianceLevel: "partial", warning: "Risk of delegation — pedagogical supervision needed" },
      { text: "The tool does the work in the student's place", nextStep: "reject", complianceLevel: "non-compliant", isEliminating: true, warning: "The tool replaces learning instead of supporting it" }
    ],
    infoTooltip: "The core question: AI should be a learning lever, not a substitute. Students should stay in an active posture (thinking, rephrasing, checking, critiquing), not a passive one (copy-pasting the result).",
    pathways: ["students"]
  },
  {
    id: "15",
    dimension: "acceptability",
    question: "Has the application been tested and validated by teachers or pedagogy experts? (Ministry, inspectorate, research, Réseau Canopé…)",
    choices: [
      { text: "Yes", nextStep: "success", complianceLevel: "compliant" },
      { text: "No", nextStep: "15.1" },
      { text: "I don't know", nextStep: "15.2" }
    ],
    regions: ["france"],
    pathways: ["students"]
  },
  {
    id: "15.1",
    dimension: "acceptability",
    question: "Run your own tests to assess pedagogical effectiveness.",
    choices: [
      { text: "I tested it with colleagues, results are convincing", nextStep: "success", complianceLevel: "compliant" },
      { text: "I tested it alone, results are convincing", nextStep: "success", complianceLevel: "partial", warning: "Validated by a single teacher only — collective feedback would be preferable" },
      { text: "The tests aren't convincing", nextStep: "reject", complianceLevel: "non-compliant", isEliminating: true }
    ],
    isAction: true,
    regions: ["france"],
    pathways: ["students"]
  },
  {
    id: "15.2",
    dimension: "acceptability",
    question: "Look for case studies or accounts from teachers who have used the application.",
    choices: [
      { text: "I found feedback, I can now assess", nextStep: "15" }
    ],
    isAction: true,
    regions: ["france"],
    pathways: ["students"]
  },
  {
    id: "15-gen",
    dimension: "acceptability",
    question: "Has the application been tested and validated by teachers or pedagogy experts? (ministry, inspectorate, research bodies, teacher-training institutions…)",
    choices: [
      { text: "Yes", nextStep: "success", complianceLevel: "compliant" },
      { text: "No", nextStep: "15.1-gen" },
      { text: "I don't know", nextStep: "15.2-gen" }
    ],
    regions: ["other-europe", "non-europe"],
    pathways: ["students"]
  },
  {
    id: "15.1-gen",
    dimension: "acceptability",
    question: "Run your own tests to assess pedagogical effectiveness.",
    choices: [
      { text: "I tested it with colleagues, results are convincing", nextStep: "success", complianceLevel: "compliant" },
      { text: "I tested it alone, results are convincing", nextStep: "success", complianceLevel: "partial", warning: "Validated by a single teacher only — collective feedback would be preferable" },
      { text: "The tests aren't convincing", nextStep: "reject", complianceLevel: "non-compliant", isEliminating: true }
    ],
    isAction: true,
    regions: ["other-europe", "non-europe"],
    pathways: ["students"]
  },
  {
    id: "15.2-gen",
    dimension: "acceptability",
    question: "Look for case studies or accounts from teachers who have used the application.",
    choices: [
      { text: "I found feedback, I can now assess", nextStep: "15-gen" }
    ],
    isAction: true,
    regions: ["other-europe", "non-europe"],
    pathways: ["students"]
  },

  // ═══════════════════════════════════════════
  // CONCLUSIONS
  // ═══════════════════════════════════════════
  {
    id: "success",
    dimension: "acceptability",
    question: "You've found a tool that meets your criteria. Review your assessment summary below. If you plan to use it regularly, remember to have it registered where required and to inform your Data Protection Officer.",
    choices: [
      { text: "Export the assessment (JSON)", nextStep: "export", complianceLevel: "compliant" },
      { text: "Start over with another tool", nextStep: "0", complianceLevel: "compliant" }
    ],
    infoTooltip: "Consider reassessing this tool in 6 months, or if the terms of use change. The AI field is evolving very quickly.",
    pathways: ["personal", "professional", "students"]
  },
  {
    id: "reject",
    dimension: "acceptability",
    question: "This tool doesn't meet all the criteria needed for your use case.",
    choices: [
      { text: "Export the assessment (JSON)", nextStep: "export", complianceLevel: "compliant" },
      { text: "Look for another tool", nextStep: "0", complianceLevel: "compliant" },
      { text: "Reconsider my criteria — could I relax one of them?", nextStep: "reconsider", complianceLevel: "compliant" }
    ],
    pathways: ["personal", "professional", "students"]
  },
  {
    id: "reconsider",
    dimension: "acceptability",
    question: "Do my personal values, my professional values, and my context of use allow me to set aside one selection criterion?",
    choices: [
      { text: "Yes, I want to reassess with relaxed criteria", nextStep: "0", complianceLevel: "partial", warning: "Reassessment with relaxed criteria" },
      { text: "No, I'm keeping my requirements as they are", nextStep: "final-reject", complianceLevel: "compliant" }
    ],
    pathways: ["personal", "professional", "students"]
  },
  {
    id: "final-reject",
    dimension: "acceptability",
    question: "I won't use generative AI tools for this task, and/or I'll resume my search.",
    choices: [
      { text: "Export the assessment (JSON)", nextStep: "export", complianceLevel: "compliant" },
      { text: "Start the analysis over", nextStep: "0", complianceLevel: "compliant" }
    ],
    pathways: ["personal", "professional", "students"]
  }
];
