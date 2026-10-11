---
kind: project
title: 'AI Mock Interview Platform'
client: 'Amazon-Sponsored Capstone'
start: 2026-08-01
summary: 'A web platform that scores spoken STAR-method interview answers in real time.'
did:
  - 'Architecting the platform with Amazon Transcribe for speech-to-text and an LLM agent on AWS Strands/AgentCore as an automated judge.'
  - 'Designing a serverless backend with Lambda, API Gateway, DynamoDB and S3 for session state, transcripts and low-latency feedback.'
  - 'Building an evaluation harness of human-scored answers to validate LLM judging and guard against prompt injection.'
  - 'Implementing authentication with Amazon Cognito and deploying the front end via CloudFront and S3.'
  - 'Collaborating with a 5-person team and Amazon sponsor engineers.'
stack:
  [
    'AWS Lambda',
    'API Gateway',
    'DynamoDB',
    'S3',
    'Cognito',
    'CloudFront',
    'Amazon Transcribe',
  ]
problem: 'Candidates practising behavioral interviews get little feedback on how well a spoken answer follows the STAR method, and human reviewers do not scale. The platform needed to score answers in real time and keep that scoring trustworthy.'
change: '[What I would change.]'
order: 5
---
