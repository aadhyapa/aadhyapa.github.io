---
kind: project
title: 'Legal Citation Hallucination Detector'
client: 'ProseAI, via Break Through Tech'
start: 2026-09-01
summary: 'An NLP pipeline that flags hallucinated legal citations in AI-generated documents.'
did:
  - 'Building a pipeline using citation parsing, existence checking and semantic similarity against a frozen Alaska family-law corpus.'
  - 'Implementing a citation extractor and existence checker with sentence-transformers and rapidfuzz.'
  - 'Developing a quote-fidelity checker that combines string and semantic similarity.'
  - 'Evaluating with precision, recall and F1 on a labeled benchmark of 200 documents, prioritizing recall on fabricated citations.'
  - 'Packaging findings into a failure taxonomy and an open-source Python module for ProseAI.'
stack: ['Python', 'sentence-transformers', 'rapidfuzz', 'NLP']
syntheticData: true
order: 4
---
